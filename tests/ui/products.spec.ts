import { test, expect } from '../../src/fixtures/pomFixtures';
import testData from '../../src/data/testData.json';

test.describe('Products', () => {
  test('TC_UI_003 - Products sorted in descending alphabetical order (Z to A)', async ({
    loginPage,
    productsPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.username, testData.validUser.password);
    await productsPage.assertLoaded();

    await productsPage.sortBy('za');

    const displayedNames = await productsPage.getDisplayedProductNames();

    // Build the expected order independently, then compare against the UI.
    // localeCompare makes the sort locale-safe rather than raw char-code based.
    const expectedNames = [...displayedNames].sort((a, b) => b.localeCompare(a));

    expect(displayedNames).toEqual(expectedNames);
  });
});
