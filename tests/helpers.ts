import { Page, Locator } from '@playwright/test';

/**
 * Gets all bingo square buttons from the grid
 */
export async function getAllSquares(page: Page): Promise<Locator[]> {
  // Wait for the bingo grid to render - look for multiple buttons
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button');
    return buttons.length >= 25;
  }, { timeout: 10000 });

  // Small delay to ensure all buttons are fully rendered
  await page.waitForTimeout(300);

  // Get all buttons
  const allButtons = await page.locator('button').all();

  // Filter to get only the bingo grid buttons (not New Game button, Start Playing, etc)
  const gridButtons: Locator[] = [];

  for (const button of allButtons) {
    const text = await button.textContent();
    if (text && (text.includes('Find someone') || text.includes('FREE SPACE'))) {
      gridButtons.push(button);
    }
  }

  return gridButtons;
}

/**
 * Helper function to mark a specific square by its grid position
 * Grid positions are 0-indexed, left to right, top to bottom
 * 0  1  2  3  4
 * 5  6  7  8  9
 * 10 11 12 13 14
 * 15 16 17 18 19
 * 20 21 22 23 24
 */
export async function markSquareAtPosition(page: Page, position: number, personName: string) {
  const allSquares = await getAllSquares(page);

  if (position >= allSquares.length) {
    throw new Error(`Position ${position} is out of bounds. Grid has ${allSquares.length} squares.`);
  }

  // Check if it's FREE SPACE
  const squareText = await allSquares[position].textContent();
  if (squareText?.includes('FREE SPACE')) {
    return; // Already marked
  }

  // Click the square
  await allSquares[position].click();

  // Wait for modal and enter name
  await page.getByLabel('Enter their name:').waitFor({ state: 'visible' });
  await page.getByLabel('Enter their name:').fill(personName);
  await page.getByRole('button', { name: /Mark Complete|Update/ }).click();

  // Wait for modal to close
  await page.getByLabel('Enter their name:').waitFor({ state: 'hidden' });
}

/**
 * Starts a new game with the given player name
 */
export async function startGame(page: Page, playerName: string) {
  await page.goto('/');
  await page.getByLabel('Enter Your Name:').fill(playerName);
  await page.getByRole('button', { name: 'Start Playing' }).click();

  // Wait for game to load
  await page.waitForURL('/play');

  // Wait for the bingo grid to fully render
  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('button');
    return buttons.length >= 25;
  }, { timeout: 10000 });

  // Additional time to ensure everything is settled
  await page.waitForTimeout(500);
}

/**
 * Gets text content from all squares
 */
export async function getAllSquareTexts(page: Page): Promise<string[]> {
  const squares = await getAllSquares(page);
  const texts: string[] = [];

  for (const square of squares) {
    const text = await square.textContent();
    texts.push(text || '');
  }

  return texts;
}
