import { Page, Locator, expect } from '@playwright/test';

/** Page Object for the shopping cart page. */
export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async assertItemCount(expected: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(expected);
  }

  async assertItemPresent(productName: string): Promise<void> {
    await expect(this.cartItems.filter({ hasText: productName })).toHaveCount(1);
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
