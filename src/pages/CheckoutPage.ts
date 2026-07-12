import { Page, Locator, expect } from '@playwright/test';

/** Page Object covering checkout step one, overview, and completion. */
export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly itemTotalLabel: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  /**
   * Verify "Item total" (before tax) mathematically equals the sum of the
   * prices we added — the assessment's explicit correctness check.
   */
  async assertItemTotal(expectedTotal: number): Promise<void> {
    const labelText = (await this.itemTotalLabel.textContent()) ?? '';
    const displayedTotal = parseFloat(labelText.replace('Item total: $', ''));
    // toBeCloseTo avoids floating-point artifacts like 55.980000000000004
    expect(displayedTotal).toBeCloseTo(expectedTotal, 2);
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async assertOrderConfirmed(): Promise<void> {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.completeText).toContainText('Your order has been dispatched');
  }
}
