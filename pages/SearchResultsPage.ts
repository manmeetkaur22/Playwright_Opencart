import { Locator, Page } from "@playwright/test";

export class SearchResultsPage {
  private readonly page: Page;
  private readonly searchHeading: Locator;
  private readonly resultsHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchHeading = page.getByRole("heading", { name: /^Search - / });
    this.resultsHeading = page.getByRole("heading", {
      name: "Products meeting the search criteria",
      exact: true,
    });
  }

  /**
   * Returns the search page heading.
   */
  getSearchHeading(): Locator {
    return this.searchHeading;
  }

  /**
   * Returns the product result heading.
   * @param productName - Product name to find
   */
  getProductHeading(productName: string): Locator {
    return this.page.getByRole("heading", { name: productName, exact: true });
  }

  /**
   * Opens a product from the search results.
   * @param productName - Product name to open
   */
  async openProduct(productName: string): Promise<void> {
    await this.getProductHeading(productName).getByRole("link").click();
  }

  /**
   * Returns the search results section heading.
   */
  getResultsHeading(): Locator {
    return this.resultsHeading;
  }
}
