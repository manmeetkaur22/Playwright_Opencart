import { Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly accountNavigation: Locator;
  private readonly myAccountButton: Locator;
  private readonly registerLink: Locator;
  private readonly loginLink: Locator;
  private readonly logoutLink: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly searchField: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.accountNavigation = page.locator("#top");
    this.myAccountButton = this.accountNavigation.getByRole("button", { name: "My Account" });
    this.registerLink = this.accountNavigation.getByRole("link", { name: "Register", exact: true });
    this.loginLink = this.accountNavigation.getByRole("link", { name: "Login", exact: true });
    this.logoutLink = this.accountNavigation.getByRole("link", { name: "Logout", exact: true });
    this.shoppingCartLink = page.getByRole("link", { name: "Shopping Cart", exact: true });
    this.searchField = page.getByRole("textbox", { name: "Search" });
  }

  /**
   * Opens the My Account navigation menu.
   */
  async clickMyAccount(): Promise<void> {
    await this.myAccountButton.click();
  }

  /**
   * Navigates to the registration page from the My Account menu.
   */
  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }

  /**
   * Navigates to the login page from the My Account menu.
   */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Searches the product catalog.
   * @param productName - Product name or search term
   */
  async searchFor(productName: string): Promise<void> {
    await this.searchField.fill(productName);
    await this.searchField.press("Enter");
  }

  /**
   * Opens the shopping cart.
   */
  async clickShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Returns the Login navigation link.
   */
  getLoginLink(): Locator {
    return this.loginLink;
  }

  /**
   * Returns the Logout navigation link.
   */
  getLogoutLink(): Locator {
    return this.logoutLink;
  }
}
