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
  /**
   * Single source of truth for every selector on this page.
   * Some are used twice — once as a page-level Locator field in the
   * constructor, and once chained to an individual product card at runtime
   * (a card is only known once .all() resolves, so those locators cannot
   * be constructor fields). Centralizing the strings means a UI selector
   * change is fixed in exactly one place.
   */
  private static readonly SELECTORS = {
    title: '.title',
    sortDropdown: '[data-test="product-sort-container"]',
    productCard: '.inventory_item',
    itemName: '.inventory_item_name',
    itemPrice: '.inventory_item_price',
    cartLink: '.shopping_cart_link',
  } as const;

  private static readonly ADD_TO_CART_BUTTON = 'Add to cart';

  readonly page: Page;
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly productNames: Locator;
  readonly productCards: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator(ProductsPage.SELECTORS.title);
    this.sortDropdown = page.locator(ProductsPage.SELECTORS.sortDropdown);
    this.productNames = page.locator(ProductsPage.SELECTORS.itemName);
    this.productCards = page.locator(ProductsPage.SELECTORS.productCard);
    this.cartLink = page.locator(ProductsPage.SELECTORS.cartLink);
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
      const name = (await card.locator(ProductsPage.SELECTORS.itemName).textContent()) ?? '';
      const priceText = (await card.locator(ProductsPage.SELECTORS.itemPrice).textContent()) ?? '0';
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
    await card.getByRole('button', { name: ProductsPage.ADD_TO_CART_BUTTON }).click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }
}