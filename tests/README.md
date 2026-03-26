# Networking Bingo - Playwright Tests

Comprehensive end-to-end tests for the Networking Bingo application using Playwright.

## Test Suites

### 1. Landing Page Tests (`landing-page.spec.ts`)
Tests the initial landing page functionality:
- ✅ Displays title and branding
- ✅ Shows how-to-play instructions
- ✅ Name input validation
- ✅ Start button enable/disable logic
- ✅ Navigation to play page
- ✅ Mobile responsiveness

### 2. Game Play Tests (`game-play.spec.ts`)
Tests core bingo game functionality:
- ✅ 5×5 grid rendering (25 squares)
- ✅ FREE SPACE at center (index 12)
- ✅ Progress tracker display
- ✅ Square click opens modal
- ✅ Marking squares with names
- ✅ Modal interactions (submit, cancel, backdrop click)
- ✅ Updating existing marked squares
- ✅ Input validation
- ✅ New game functionality
- ✅ Mobile responsiveness

### 3. Win Detection Tests (`win-detection.spec.ts`)
Tests all winning patterns and celebrations:
- ✅ Horizontal row wins (5 rows)
- ✅ Vertical column wins (5 columns)
- ✅ Diagonal wins (2 diagonals)
- ✅ Win celebration display
- ✅ Gold highlighting of winning patterns
- ✅ Multiple winning patterns on same board
- ✅ Progress percentage tracking
- ✅ No false positives (incomplete patterns)

**Winning Pattern Grid Reference:**
```
 0  1  2  3  4
 5  6  7  8  9
10 11 12 13 14
15 16 17 18 19
20 21 22 23 24
```

### 4. LocalStorage Persistence Tests (`localstorage-persistence.spec.ts`)
Tests game state persistence:
- ✅ Saves game state to localStorage
- ✅ Restores game after page reload
- ✅ Preserves card randomization
- ✅ Preserves multiple marked squares
- ✅ Direct navigation to /play with existing game
- ✅ Redirects to home if no game exists
- ✅ Clears state on new game
- ✅ Preserves win celebration state
- ✅ Handles localStorage quota gracefully

### 5. Card Randomization Tests (`card-randomization.spec.ts`)
Tests the Fisher-Yates shuffle algorithm:
- ✅ Each player gets different card order
- ✅ FREE SPACE always at center (index 12)
- ✅ All 25 prompts present on each card
- ✅ No duplicate prompts
- ✅ Randomness verification
- ✅ Card order stability within session
- ✅ New random card on new game

## Running Tests

### Run All Tests
```bash
npm test
# or
yarn test
# or
npx playwright test
```

### Run Tests in UI Mode (Recommended for Development)
```bash
npm run test:ui
# or
yarn test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
# or
yarn test:headed
```

### Run Specific Test File
```bash
npx playwright test tests/landing-page.spec.ts
```

### Run Tests on Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Run Tests and Show Report
```bash
npx playwright test
npx playwright show-report
```

## Test Configuration

Tests are configured in `playwright.config.ts`:
- **Base URL**: http://localhost:3000
- **Browsers**: Desktop Chrome, Mobile Chrome, Mobile Safari
- **Auto-start dev server**: Yes (npm run dev)
- **Parallel execution**: Enabled
- **Screenshots**: On failure
- **Traces**: On first retry

## Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test code
    await expect(page.getByText('Something')).toBeVisible();
  });
});
```

### Helper: Mark Square at Position
```typescript
async function markSquareAtPosition(page: any, position: number, personName: string) {
  const allSquares = await page.getByRole('button').filter({ hasText: /Find someone|FREE SPACE/ }).all();
  const squareText = await allSquares[position].textContent();

  if (squareText?.includes('FREE SPACE')) {
    return; // Already marked
  }

  await allSquares[position].click();
  await page.getByLabel('Enter their name:').waitFor({ state: 'visible' });
  await page.getByLabel('Enter their name:').fill(personName);
  await page.getByRole('button', { name: /Mark Complete|Update/ }).click();
  await page.getByLabel('Enter their name:').waitFor({ state: 'hidden' });
}
```

## Test Coverage

Current test coverage:
- **Landing Page**: 8 tests
- **Game Play**: 11 tests
- **Win Detection**: 9 tests
- **LocalStorage**: 9 tests
- **Card Randomization**: 7 tests

**Total: 44 comprehensive tests**

## CI/CD Integration

Tests are ready for CI/CD integration. In CI environments:
- Tests run with 2 retries
- Tests run sequentially (workers=1)
- Dev server must start successfully
- All screenshots/traces saved on failure

### Example GitHub Actions Workflow
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Tests

### Debug Mode
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

### Generate Code from Browser Actions
```bash
npx playwright codegen http://localhost:3000
```

## Common Issues

### Issue: Dev server won't start
**Solution**: Ensure port 3000 is available or change port in `playwright.config.ts`

### Issue: Tests timing out
**Solution**: Increase timeout in config or specific test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
});
```

### Issue: Flaky tests
**Solution**: Use proper waits instead of hardcoded timeouts:
```typescript
// ❌ Bad
await page.waitForTimeout(1000);

// ✅ Good
await page.waitForSelector('button:visible');
await page.getByText('Loading').waitFor({ state: 'hidden' });
```

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for conditions**: Use `waitFor` instead of fixed timeouts
3. **Isolate tests**: Each test should be independent
4. **Clear state**: Use `beforeEach` to reset state
5. **Test user flows**: Test complete user journeys, not just individual actions
6. **Mobile-first**: Always test on mobile viewports
7. **Accessibility**: Use ARIA roles and labels in assertions

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
