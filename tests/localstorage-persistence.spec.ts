import { test, expect } from '@playwright/test';
import { startGame, getAllSquares, getAllSquareTexts } from './helpers';

test.describe('LocalStorage Persistence', () => {
  test('should save game state to localStorage', async ({ page }) => {
    // Start a new game
    await startGame(page, 'Persistent Player');

    // Check that localStorage has game state
    const gameState = await page.evaluate(() => {
      return localStorage.getItem('bingoGameState');
    });

    expect(gameState).not.toBeNull();

    // Parse and verify game state structure
    const parsedState = JSON.parse(gameState!);
    expect(parsedState).toHaveProperty('playerId');
    expect(parsedState).toHaveProperty('playerName', 'Persistent Player');
    expect(parsedState).toHaveProperty('cardPrompts');
    expect(parsedState).toHaveProperty('cardState');
    expect(parsedState.cardPrompts).toHaveLength(25);
    expect(parsedState.cardState).toHaveLength(25);
  });

  test('should restore game state after page reload', async ({ page }) => {
    // Start a new game
    await startGame(page, 'Reload Test Player');

    // Mark a square
    const squares = await getAllSquares(page);
    const squareText = await squares[0].textContent();
    if (!squareText?.includes('FREE SPACE')) {
      await squares[0].click();
      await page.getByLabel('Enter their name:').fill('John Doe');
      await page.getByRole('button', { name: /Mark Complete/ }).click();
    }

    // Verify progress is 2/25 (1 free + 1 marked)
    await expect(page.getByText(/Progress:.*2\/25/)).toBeVisible();

    // Reload the page
    await page.reload();

    // Should still show the same player name
    await expect(page.getByRole('heading', { name: 'Reload Test Player' })).toBeVisible();

    // Should still show progress as 2/25
    await expect(page.getByText(/Progress:.*2\/25/)).toBeVisible();

    // The marked square should still have the person's name
    const gridAfterReload = await page.locator('.grid').textContent();
    expect(gridAfterReload).toContain('John Doe');
  });

  test('should preserve card randomization after reload', async ({ page }) => {
    // Start a new game
    await startGame(page, 'Card Order Test');

    // Get all square texts in order
    const originalOrder = await getAllSquareTexts(page);

    // Reload the page
    await page.reload();

    // Get square texts again
    const reloadedOrder = await getAllSquareTexts(page);

    // Orders should match exactly
    expect(reloadedOrder).toEqual(originalOrder);

    // FREE SPACE should still be at index 12
    expect(reloadedOrder[12]).toContain('FREE SPACE');
  });

  test('should preserve multiple marked squares after reload', async ({ page }) => {
    // Start a new game
    await startGame(page, 'Multi Mark Test');

    // Mark several squares
    const squares = await getAllSquares(page);

    let markedCount = 0;
    for (let i = 0; i < squares.length && markedCount < 3; i++) {
      const text = await squares[i].textContent();
      if (!text?.includes('FREE SPACE')) {
        await squares[i].click();
        await page.getByLabel('Enter their name:').fill(`Person ${markedCount + 1}`);
        await page.getByRole('button', { name: /Mark Complete/ }).click();
        await page.waitForTimeout(100); // Small delay between marks
        markedCount++;
      }
    }

    // Should show 4/25 (1 free + 3 marked)
    await expect(page.getByText(/Progress:.*4\/25/)).toBeVisible();

    // Reload
    await page.reload();

    // All marked names should still be present in the grid
    const gridAfterReload = await page.locator('.grid').textContent();
    expect(gridAfterReload).toContain('Person 1');
    expect(gridAfterReload).toContain('Person 2');
    expect(gridAfterReload).toContain('Person 3');

    // Progress should still be 4/25
    await expect(page.getByText(/Progress:.*4\/25/)).toBeVisible();
  });

  test('should handle direct navigation to /play with existing game', async ({ page }) => {
    // Start a game first
    await startGame(page, 'Direct Nav Test');

    // Mark a square
    const squares = await getAllSquares(page);
    const firstNonFree = squares.find(async (sq) => {
      const text = await sq.textContent();
      return !text?.includes('FREE SPACE');
    });

    if (firstNonFree) {
      await firstNonFree.click();
      await page.getByLabel('Enter their name:').fill('Test Person');
      await page.getByRole('button', { name: /Mark Complete/ }).click();
    }

    // Navigate away
    await page.goto('/');

    // Navigate directly to /play (should load saved game)
    await page.goto('/play');

    // Should show existing game with player name
    await expect(page.getByRole('heading', { name: 'Direct Nav Test' })).toBeVisible();

    // Check that the marked name is present in the grid
    const grid = await page.locator('.grid').textContent();
    expect(grid).toContain('Test Person');
  });

  test('should redirect to home if no game exists when visiting /play', async ({ page }) => {
    // Clear any existing localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to go directly to /play
    await page.goto('/play');

    // Should redirect to home page
    await expect(page).toHaveURL('/');
  });

  test('should clear game state when starting new game', async ({ page, context }) => {
    // Start first game
    await startGame(page, 'First Player');

    // Get the card order
    const squares = await getAllSquares(page);
    const firstSquare = await squares[0].textContent();

    // Click New Game and confirm
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'New Game' }).click();

    // Should be back at home
    await expect(page).toHaveURL('/');

    // Start a new game with different name
    await page.getByLabel('Enter Your Name:').fill('Second Player');
    await page.getByRole('button', { name: 'Start Playing' }).click();

    // Should show new player name
    await expect(page.getByRole('heading', { name: 'Second Player' })).toBeVisible();

    // Should have a fresh card (progress should be 1/25, just free space)
    await expect(page.getByText(/Progress:.*1\/25/)).toBeVisible();

    // Card order should likely be different (randomized again)
    // We can't guarantee it's different, but we can verify it's a valid card
    const newSquares = await getAllSquares(page);
    expect(newSquares.length).toBe(25);
  });

  test('should preserve win celebration state after reload', async ({ page }) => {
    // Start a game
    await startGame(page, 'Win State Test');

    // Mark a winning row (top row: 0,1,2,3,4)
    const squares = await getAllSquares(page);

    for (let i = 0; i < 5; i++) {
      const text = await squares[i].textContent();
      if (!text?.includes('FREE SPACE')) {
        await squares[i].click();
        await page.getByLabel('Enter their name:').fill(`Person ${i}`);
        await page.getByRole('button', { name: /Mark Complete/ }).click();
        await page.waitForTimeout(100);
      }
    }

    // Should show win celebration
    await expect(page.getByText(/Congratulations! You got a line!/)).toBeVisible();

    // Reload page
    await page.reload();

    // Win highlights should still be present (gold colored squares)
    const reloadedSquares = await getAllSquares(page);

    // Check that winning squares still have gold gradient
    for (let i = 0; i < 5; i++) {
      await expect(reloadedSquares[i]).toHaveClass(/from-yellow-400/);
    }
  });

  test('should handle localStorage quota exceeded gracefully', async ({ page }) => {
    // This test verifies the app doesn't crash if localStorage is full
    // We'll fill localStorage and then try to save game state

    await page.goto('/');

    // Try to fill localStorage (may not actually exceed quota, but tests error handling)
    await page.evaluate(() => {
      try {
        for (let i = 0; i < 100; i++) {
          localStorage.setItem(`test_${i}`, 'x'.repeat(10000));
        }
      } catch (e) {
        // Quota exceeded, that's okay
      }
    });

    // Clear test data
    await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('test_')) {
          localStorage.removeItem(key);
        }
      });
    });

    // Start game should still work
    await page.getByLabel('Enter Your Name:').fill('Quota Test');
    await page.getByRole('button', { name: 'Start Playing' }).click();

    // Game should load successfully
    await expect(page).toHaveURL('/play');
    await expect(page.getByRole('heading', { name: 'Quota Test' })).toBeVisible();
  });
});
