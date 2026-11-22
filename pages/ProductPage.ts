import { Locator, Page } from "@playwright/test";

export class ProductPage {
  private readonly quantityField: Locator;
  private readonly addToCartButton: Locator;
  private readonly addToCartConfirmation: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.quantityField = page.locator("#input-quantity");
    this.addToCartButton = page.getByRole("button", { name: "Add to Cart", exact: true });
    this.addToCartConfirmation = page.locator(".alert-success");
  }

  /**
   * Returns the product heading.
   * @param productName - Expected product name
   */
  getProductHeading(productName: string): Locator {
    return this.page.getByRole("heading", { name: productName, exact: true });
  }

  /**
   * Returns the product price heading.
   * @param price - Expected formatted product price
   */
  getProductPrice(price: string): Locator {
    return this.page.getByRole("heading", { name: price, exact: true });
  }

  /**
   * Sets the product quantity.
   * @param quantity - Quantity to add to the cart
   */
  async setQuantity(quantity: string): Promise<void> {
    await this.quantityField.fill(quantity);
  }

  /**
   * Adds the product to the shopping cart.
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /**
   * Returns the add-to-cart confirmation message.
   */
  getAddToCartConfirmation(): Locator {
    return this.addToCartConfirmation;
  }
}
