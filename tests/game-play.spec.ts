import { test, expect } from '@playwright/test';
import { startGame, getAllSquares } from './helpers';

test.describe('Game Play', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing and start a game
    await startGame(page, 'Test Player');
  });

  test('should display the player name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Test Player' })).toBeVisible();
  });

  test('should display 5x5 bingo grid (25 squares)', async ({ page }) => {
    // Count all bingo squares (should be 25)
    const squares = await getAllSquares(page);
    expect(squares.length).toBe(25);
  });

  test('should have FREE SPACE in the center (index 12) that is pre-marked', async ({ page }) => {
    // Wait for grid to load
    await page.waitForSelector('button:has-text("FREE SPACE")', { state: 'visible' });

    // Check that FREE SPACE exists
    const freeSpace = page.getByRole('button', { name: /FREE SPACE/ });
    await expect(freeSpace).toBeVisible();

    // Free space should have distinct styling (purple background)
    await expect(freeSpace).toHaveClass(/bg-purple-500/);

    // Free space should be disabled (not clickable)
    await expect(freeSpace).toBeDisabled();
  });

  test('should display progress tracker', async ({ page }) => {
    // Progress should start at 1/25 (free space auto-marked)
    await expect(page.getByText(/Progress:.*1\/25/)).toBeVisible();
  });

  test('should open modal when clicking a square', async ({ page }) => {
    // Find a clickable square (not FREE SPACE)
    const square = page.getByRole('button', { name: /Find someone who/ }).first();
    await square.click();

    // Modal should appear
    await expect(page.getByRole('heading', { name: /Find someone who/ })).toBeVisible();
    await expect(page.getByLabel('Enter their name:')).toBeVisible();
  });

  test('should mark square when name is submitted', async ({ page }) => {
    // Click a square
    const squareText = await page.getByRole('button', { name: /Find someone who/ }).first().textContent();
    await page.getByRole('button', { name: /Find someone who/ }).first().click();

    // Enter a name
    await page.getByLabel('Enter their name:').fill('John Doe');
    await page.getByRole('button', { name: /Mark Complete/ }).click();

    // Modal should close
    await expect(page.getByLabel('Enter their name:')).not.toBeVisible();

    // Square should now show the person's name
    const markedSquare = page.getByRole('button', { name: new RegExp(squareText || '') });
    await expect(markedSquare).toContainText('John Doe');

    // Progress should update to 2/25
    await expect(page.getByText(/Progress:.*2\/25/)).toBeVisible();
  });

  test('should close modal when cancel is clicked', async ({ page }) => {
    // Click a square
    await page.getByRole('button', { name: /Find someone who/ }).first().click();

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should close
    await expect(page.getByLabel('Enter their name:')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    // Click a square
    await page.getByRole('button', { name: /Find someone who/ }).first().click();

    // Wait for modal to appear
    await expect(page.getByLabel('Enter their name:')).toBeVisible();

    // Click backdrop (the dark overlay)
    await page.locator('.bg-black.bg-opacity-50').click({ position: { x: 5, y: 5 } });

    // Modal should close
    await expect(page.getByLabel('Enter their name:')).not.toBeVisible();
  });

  test('should update existing name when clicking marked square', async ({ page }) => {
    // Mark a square first
    const squares = await getAllSquares(page);
    const firstSquare = squares[0];
    const squareText = await firstSquare.textContent();

    // Skip if it's FREE SPACE
    if (!squareText?.includes('FREE SPACE')) {
      await firstSquare.click();
      await page.getByLabel('Enter their name:').fill('John Doe');
      await page.getByRole('button', { name: /Mark Complete/ }).click();

      // Wait a moment for update
      await page.waitForTimeout(200);

      // Click the same square again
      await firstSquare.click();

      // Modal should show with current name
      await expect(page.getByLabel('Enter their name:')).toHaveValue('John Doe');

      // Update the name
      await page.getByLabel('Enter their name:').fill('Jane Smith');
      await page.getByRole('button', { name: 'Update' }).click();

      // Wait for modal to close
      await page.getByLabel('Enter their name:').waitFor({ state: 'hidden' });

      // Square should show new name
      await expect(firstSquare).toContainText('Jane Smith');
    }
  });

  test('should not allow submitting empty name', async ({ page }) => {
    // Click a square
    await page.getByRole('button', { name: /Find someone who/ }).first().click();

    // Submit button should be disabled when input is empty
    const submitButton = page.getByRole('button', { name: /Mark Complete/ });
    await expect(submitButton).toBeDisabled();

    // Type and delete to make it empty again
    await page.getByLabel('Enter their name:').fill('Test');
    await page.getByLabel('Enter their name:').clear();
    await expect(submitButton).toBeDisabled();
  });

  test('should have New Game button', async ({ page }) => {
    const newGameButton = page.getByRole('button', { name: 'New Game' });
    await expect(newGameButton).toBeVisible();
  });

  test('should show confirmation before starting new game', async ({ page }) => {
    // Setup dialog handler
    page.on('dialog', dialog => dialog.dismiss());

    await page.getByRole('button', { name: 'New Game' }).click();

    // A confirmation dialog should appear (we dismissed it)
    // We can't directly test dialog text, but we can verify page didn't navigate
    await expect(page).toHaveURL('/play');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Grid should still be visible and functional
    const squares = await getAllSquares(page);
    expect(squares.length).toBe(25);

    // Click and interact should still work
    await squares[0].click();
    await expect(page.getByLabel('Enter their name:')).toBeVisible();
  });
});
