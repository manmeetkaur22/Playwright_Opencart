import { Locator, Page } from "@playwright/test";

export class AccountPage {
  private readonly accountHeading: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.accountHeading = page.getByRole("main").getByRole("heading", {
      name: "My Account",
      exact: true,
    });
    this.logoutLink = page.getByRole("complementary").getByRole("link", {
      name: "Logout",
      exact: true,
    });
  }

  /**
   * Returns the customer account dashboard heading.
   */
  getAccountHeading(): Locator {
    return this.accountHeading;
  }

  /**
   * Returns the account's Logout link.
   */
  getLogoutLink(): Locator {
    return this.logoutLink;
  }

  /**
   * Logs the customer out.
   */
  async clickLogout(): Promise<void> {
    await this.logoutLink.click();
  }
}
