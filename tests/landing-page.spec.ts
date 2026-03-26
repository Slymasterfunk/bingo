import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the title and branding', async ({ page }) => {
    // Check main title
    await expect(page.getByRole('heading', { name: 'Networking Bingo' })).toBeVisible();

    // Check co-branding text
    await expect(page.getByText(/Alamo Tech Collective.*Geeks/)).toBeVisible();
  });

  test('should display how to play instructions', async ({ page }) => {
    // Check instructions heading
    await expect(page.getByRole('heading', { name: 'How to Play:' })).toBeVisible();

    // Check that all 5 instruction steps are present
    await expect(page.getByText(/Enter your name and start playing/)).toBeVisible();
    await expect(page.getByText(/Meet people who match the prompts/)).toBeVisible();
    await expect(page.getByText(/Tap a square and enter their name/)).toBeVisible();
    await expect(page.getByText(/Get 5 in a row/)).toBeVisible();
    await expect(page.getByText(/Complete ALL squares for a blackout/)).toBeVisible();
  });

  test('should have a name input field', async ({ page }) => {
    const nameInput = page.getByLabel('Enter Your Name:');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('placeholder', /Alex Johnson/);
  });

  test('should have a disabled start button when name is empty', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start Playing' });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeDisabled();
  });

  test('should enable start button when name is entered', async ({ page }) => {
    const nameInput = page.getByLabel('Enter Your Name:');
    const startButton = page.getByRole('button', { name: 'Start Playing' });

    // Initially disabled
    await expect(startButton).toBeDisabled();

    // Type a name
    await nameInput.fill('Test Player');

    // Should now be enabled
    await expect(startButton).toBeEnabled();
  });

  test('should navigate to play page when start button is clicked', async ({ page }) => {
    const nameInput = page.getByLabel('Enter Your Name:');
    const startButton = page.getByRole('button', { name: 'Start Playing' });

    // Enter a name and click start
    await nameInput.fill('Test Player');
    await startButton.click();

    // Should navigate to /play
    await expect(page).toHaveURL('/play');
  });

  test('should not submit with whitespace-only name', async ({ page }) => {
    const nameInput = page.getByLabel('Enter Your Name:');
    const startButton = page.getByRole('button', { name: 'Start Playing' });

    // Enter only spaces
    await nameInput.fill('   ');

    // Button should still be disabled (trimmed value is empty)
    await expect(startButton).toBeDisabled();
  });

  test('should be mobile responsive', async ({ page }) => {
    // Check that main content is visible on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.getByRole('heading', { name: 'Networking Bingo' })).toBeVisible();
    await expect(page.getByLabel('Enter Your Name:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Playing' })).toBeVisible();
  });
});
