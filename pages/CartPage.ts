import { Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly cartHeading: Locator;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.cartHeading = page.getByRole("heading", { name: /^Shopping Cart/ });
  }

  /**
   * Returns the shopping cart page heading.
   */
  getCartHeading(): Locator {
    return this.cartHeading;
  }

  /**
   * Returns the cart row for a product.
   * @param productName - Product name in the cart
   */
  getProductRow(productName: string): Locator {
    return this.page
      .getByRole("row")
      .filter({ has: this.page.getByRole("link", { name: productName, exact: true }) });
  }

  /**
   * Returns the quantity field for a product row.
   * @param productName - Product name in the cart
   */
  getProductQuantity(productName: string): Locator {
    return this.getProductRow(productName).getByRole("textbox");
  }

  /**
   * Returns the unit price cell for a product row.
   * @param productName - Product name in the cart
   */
  getProductUnitPrice(productName: string): Locator {
    return this.getProductRow(productName).getByRole("cell").nth(3);
  }

  /**
   * Returns the line total cell for a product row.
   * @param productName - Product name in the cart
   */
  getProductLineTotal(productName: string): Locator {
    return this.getProductRow(productName).getByRole("cell").last();
  }

  /**
   * Returns the grand total cell in the cart summary.
   */
  getGrandTotal(): Locator {
    return this.page
      .getByRole("row")
      .filter({ has: this.page.getByText("Total", { exact: true }) })
      .getByRole("cell")
      .last();
  }
}
