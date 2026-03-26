import { test, expect } from '@playwright/test';
import { startGame, getAllSquareTexts, getAllSquares, markSquareAtPosition } from './helpers';

test.describe('Card Randomization', () => {
  test('each player should get a different card order', async ({ browser }) => {
    // Create two separate browser contexts to simulate two different players
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Start first game
    await startGame(page1, 'Player One');

    // Start second game
    await startGame(page2, 'Player Two');

    // Get all square texts from both games
    const squares1 = await getAllSquareTexts(page1);
    const squares2 = await getAllSquareTexts(page2);

    // Both should have 25 squares
    expect(squares1).toHaveLength(25);
    expect(squares2).toHaveLength(25);

    // Both should have FREE SPACE at index 12
    expect(squares1[12]).toContain('FREE SPACE');
    expect(squares2[12]).toContain('FREE SPACE');

    // The orders should be different (excluding the FREE SPACE position)
    // We'll check if at least one position differs
    let differenceCount = 0;
    for (let i = 0; i < 25; i++) {
      if (i !== 12 && squares1[i] !== squares2[i]) {
        differenceCount++;
      }
    }

    // With true randomization, it's astronomically unlikely all 24 non-free squares match
    // We expect at least 10 differences (being conservative)
    expect(differenceCount).toBeGreaterThan(10);

    await context1.close();
    await context2.close();
  });

  test('FREE SPACE should always be at center (index 12)', async ({ page }) => {
    // Test multiple game starts to ensure FREE SPACE position is consistent
    for (let i = 0; i < 3; i++) {
      // Clear storage and start fresh
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Start a new game
      await startGame(page, `Test Player ${i}`);

      // Get all squares
      const squares = await getAllSquares(page);

      // The 13th square (index 12) should be FREE SPACE
      const centerSquare = squares[12];
      const centerText = await centerSquare.textContent();

      expect(centerText).toContain('FREE SPACE');
    }
  });

  test('all 25 prompts should be present on each card', async ({ page }) => {
    await startGame(page, 'Prompt Check Player');

    // Get all square texts
    const squares = await getAllSquareTexts(page);

    // Check that we have 25 unique prompts
    const uniquePrompts = new Set(squares.map(s => s?.trim()));
    expect(uniquePrompts.size).toBe(25);

    // Check that FREE SPACE is present
    expect(squares.some(s => s?.includes('FREE SPACE'))).toBeTruthy();

    // Check that we have 24 "Find someone" prompts + 1 FREE SPACE
    const findSomeoneCount = squares.filter(s => s?.includes('Find someone')).length;
    expect(findSomeoneCount).toBe(24);
  });

  test('no duplicate prompts should appear on a card', async ({ page }) => {
    await startGame(page, 'No Duplicates Test');

    // Get all square texts
    const squares = await getAllSquareTexts(page);

    // Create a frequency map
    const frequency = new Map<string, number>();
    squares.forEach(square => {
      const text = square?.trim() || '';
      frequency.set(text, (frequency.get(text) || 0) + 1);
    });

    // Every prompt should appear exactly once
    frequency.forEach((count, prompt) => {
      expect(count).toBe(1);
    });
  });

  test('card randomization should use Fisher-Yates shuffle (verify randomness)', async ({ browser }) => {
    // Create multiple games and verify the distribution is reasonably random
    // We'll check that the first position doesn't always have the same prompt

    const firstPositionPrompts = new Set<string>();

    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await startGame(page, `Randomness Test ${i}`);

      // Get the first square's text
      const texts = await getAllSquareTexts(page);
      const firstSquare = texts[0];

      if (firstSquare) {
        firstPositionPrompts.add(firstSquare.trim());
      }

      await context.close();
    }

    // With 5 games, we should see at least 3 different prompts in the first position
    // (This isn't guaranteed but is highly likely with true randomization)
    expect(firstPositionPrompts.size).toBeGreaterThanOrEqual(3);
  });

  test('card order should remain stable for same player session', async ({ page }) => {
    // Start a game
    await startGame(page, 'Stable Order Test');

    // Get initial order (just the prompts by reading from first span)
    const squares = await getAllSquares(page);
    const initialOrder = [];
    for (const square of squares) {
      // Get just the prompt span text (first span in the button)
      const promptSpan = square.locator('span').first();
      const prompt = await promptSpan.textContent();
      initialOrder.push(prompt?.trim() || '');
    }

    // Mark a square
    await markSquareAtPosition(page, 0, 'Person 1');

    // Get order after marking (again, just prompts from first span)
    const squaresAfterMark = await getAllSquares(page);
    const orderAfterMark = [];
    for (const square of squaresAfterMark) {
      const promptSpan = square.locator('span').first();
      const prompt = await promptSpan.textContent();
      orderAfterMark.push(prompt?.trim() || '');
    }

    // Prompt order should be exactly the same
    expect(orderAfterMark).toEqual(initialOrder);

    // Reload page
    await page.reload();

    // Get order after reload (extract prompts from first span)
    const squaresAfterReload = await getAllSquares(page);
    const orderAfterReload = [];
    for (const square of squaresAfterReload) {
      const promptSpan = square.locator('span').first();
      const prompt = await promptSpan.textContent();
      orderAfterReload.push(prompt?.trim() || '');
    }

    // Order should still be the same
    expect(orderAfterReload).toEqual(initialOrder);
  });

  test('starting a new game should create a new random card', async ({ page }) => {
    // Start first game
    await startGame(page, 'First Game');

    // Get first card order
    const firstCardOrder = await getAllSquareTexts(page);

    // Start a new game
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'New Game' }).click();

    // Wait for navigation to home page to complete
    await page.waitForURL('/');

    // Now start the second game (don't navigate again, just fill the form)
    await page.getByLabel('Enter Your Name:').fill('Second Game');
    await page.getByRole('button', { name: 'Start Playing' }).click();

    // Get second card order
    const secondCardOrder = await getAllSquareTexts(page);

    // Both should have 25 squares
    expect(firstCardOrder).toHaveLength(25);
    expect(secondCardOrder).toHaveLength(25);

    // FREE SPACE should be at same position
    expect(firstCardOrder[12]).toEqual(secondCardOrder[12]);

    // At least some squares should be in different positions
    let differences = 0;
    for (let i = 0; i < 25; i++) {
      if (i !== 12 && firstCardOrder[i] !== secondCardOrder[i]) {
        differences++;
      }
    }

    // Should have at least 10 differences (being conservative)
    expect(differences).toBeGreaterThan(10);
  });
});
