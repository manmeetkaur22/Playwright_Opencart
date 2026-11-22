import { Locator, Page } from "@playwright/test";

export class AdminPage {
  private readonly page: Page;
  private readonly adminUrl: string;

  // Locators
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly securityNotice: Locator;
  private readonly customersMenu: Locator;
  private readonly customersListLink: Locator;
  private readonly emailFilterField: Locator;
  private readonly statusFilter: Locator;
  private readonly filterButton: Locator;

  constructor(page: Page, adminUrl: string) {
    this.page = page;
    this.adminUrl = adminUrl;

    // Initialize locators with CSS selectors
    this.usernameField = page.getByRole("textbox", { name: "Username" });
    this.passwordField = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.securityNotice = page.locator("#modal-security");
    this.customersMenu = page.locator('a[href="#collapse-6"]');
    this.customersListLink = page.locator("#collapse-6").getByRole("link").first();
    this.emailFilterField = page.getByRole("textbox", { name: "E-Mail" });
    this.statusFilter = page.getByRole("combobox", { name: "Status" });
    this.filterButton = page.getByRole("button", { name: "Filter", exact: true });
  }

  /**
   * Opens the OpenCart administration login page.
   */
  async open(): Promise<void> {
    await this.page.goto(this.adminUrl);
  }

  /**
   * Logs in to the administration portal.
   * @param username - Configured administrator username
   * @param password - Configured administrator password
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
    await this.customersMenu.waitFor({ state: "visible" });

    if (await this.securityNotice.isVisible()) {
      await this.securityNotice.getByRole("button").filter({ hasText: /^$/ }).click();
    }
  }

  /**
   * Searches the admin customer list by email address.
   * @param email - Unique email address of the registered customer
   * @param status - Admin status filter to apply
   */
  async searchCustomerByEmail(email: string, status: "Enabled" | "Disabled"): Promise<void> {
    await this.customersMenu.click();
    await this.customersListLink.click();
    await this.emailFilterField.fill(email);
    await this.statusFilter.selectOption({ label: status });
    await this.filterButton.click();
  }

  /**
   * Returns the admin customer-list row matching an email address.
   * @param email - Customer email address
   * @returns Locator for the matching customer row
   */
  getCustomerRow(email: string): Locator {
    return this.page.getByRole("row").filter({ hasText: email });
  }
}
