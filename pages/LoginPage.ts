import { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly loginHeading: Locator;
  private readonly emailField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly warningMessage: Locator;

  constructor(page: Page) {
    this.loginHeading = page.locator("#content").getByRole("heading", {
      name: "Returning Customer",
      exact: true,
    });
    this.emailField = page.getByLabel("E-Mail Address");
    this.passwordField = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.warningMessage = page.locator(".alert-danger");
  }

  /**
   * Submits the customer login form.
   * @param email - Customer email address
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  /**
   * Returns the login page heading.
   */
  getLoginHeading(): Locator {
    return this.loginHeading;
  }

  /**
   * Returns the login warning message.
   */
  getWarningMessage(): Locator {
    return this.warningMessage;
  }
}
