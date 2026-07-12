import { test } from '../../src/fixtures/pomFixtures';
import testData from '../../src/data/testData.json';

test.describe('Checkout', () => {
  /**
   * Bonus: reuse the session captured once in globalSetup.
   * Playwright loads these cookies into the browser context before the
   * test starts, so no UI login steps are needed.
   */
  test.use({ storageState: 'storageState.json' });

  test('TC_UI_004 - End-to-end checkout with the two most expensive products', async ({
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    // 1-2. Already authenticated — go straight to Products and verify
    await productsPage.goto();
    await productsPage.assertLoaded();

    // 3. Dynamic logic: discover the two most expensive products at runtime
    const topTwo = await productsPage.getMostExpensiveProducts(2);
    for (const product of topTwo) {
      await productsPage.addProductToCart(product.name);
    }

    // 4. Cart: confirm exactly our two products made it in, then checkout
    await productsPage.goToCart();
    await cartPage.assertItemCount(2);
    for (const product of topTwo) {
      await cartPage.assertItemPresent(product.name);
    }
    await cartPage.proceedToCheckout();

    // 5. Checkout information form
    const { firstName, lastName, postalCode } = testData.checkoutInfo;
    await checkoutPage.fillInformation(firstName, lastName, postalCode);

    // 6. Verify "Item total" (pre-tax) is mathematically correct
    const expectedTotal = topTwo.reduce((sum, p) => sum + p.price, 0);
    await checkoutPage.assertItemTotal(expectedTotal);

    // 7. Finish and assert confirmation
    await checkoutPage.finishOrder();
    await checkoutPage.assertOrderConfirmed();
  });
});