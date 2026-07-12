import { Page, Locator, expect } from '@playwright/test';

/** A product as displayed on the inventory page. */
export interface Product {
  name: string;
  price: number;
}

/**
 * Page Object for the Products (inventory) page.
 * Contains the dynamic logic the assessment explicitly scores:
 * finding the most expensive products at runtime instead of hardcoding names.
 */
export class ProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly productNames: Locator;
  readonly productCards: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.title');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.productNames = page.locator('.inventory_item_name');
    this.productCards = page.locator('.inventory_item');
    this.cartLink = page.locator('.shopping_cart_link');
  }

/** Navigate directly to the inventory page (requires an authenticated session). */
  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getDisplayedProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  /** Scrape every product card into a typed { name, price } object. */
  async getAllProducts(): Promise<Product[]> {
    const cards = await this.productCards.all();
    const products: Product[] = [];
    for (const card of cards) {
      const name = (await card.locator('.inventory_item_name').textContent()) ?? '';
      const priceText = (await card.locator('.inventory_item_price').textContent()) ?? '0';
      products.push({ name: name.trim(), price: parseFloat(priceText.replace('$', '')) });
    }
    return products;
  }

  /** Dynamic logic: sort scraped products by price (desc) and take the top N. */
  async getMostExpensiveProducts(count: number): Promise<Product[]> {
    const products = await this.getAllProducts();
    return [...products].sort((a, b) => b.price - a.price).slice(0, count);
  }

  /** Add a product to the cart by its visible name. */
  async addProductToCart(productName: string): Promise<void> {
    const card = this.productCards.filter({ hasText: productName });
    await card.getByRole('button', { name: 'Add to cart' }).click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }
}
