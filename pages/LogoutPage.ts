import { Locator, Page } from "@playwright/test";

export class LogoutPage {
  private readonly logoutHeading: Locator;
  private readonly continueLink: Locator;

  constructor(page: Page) {
    this.logoutHeading = page.getByRole("main").getByRole("heading", {
      name: "Account Logout",
      exact: true,
    });
    this.continueLink = page.getByRole("link", { name: "Continue", exact: true });
  }

  /**
   * Returns the logout confirmation heading.
   */
  getLogoutHeading(): Locator {
    return this.logoutHeading;
  }

  /**
   * Returns the link that continues to the homepage.
   */
  getContinueLink(): Locator {
    return this.continueLink;
  }

  /**
   * Continues to the homepage after logging out.
   */
  async clickContinue(): Promise<void> {
    await this.continueLink.click();
  }
}
