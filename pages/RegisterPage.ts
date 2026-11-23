import { Locator, Page } from "@playwright/test";

export type CustomerRegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  telephone?: string;
};

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly registrationHeading: Locator;
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly telephoneField: Locator;
  private readonly passwordField: Locator;
  private readonly passwordConfirmField: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly accountCreatedHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.registrationHeading = page.getByRole("heading", { name: "Register Account" });
    this.firstNameField = page.getByLabel("First Name");
    this.lastNameField = page.getByLabel("Last Name");
    this.emailField = page.getByLabel("E-Mail");
    this.telephoneField = page.getByLabel("Telephone");
    this.passwordField = page.getByLabel(/Password$/);
    this.passwordConfirmField = page.getByLabel("Password Confirm");
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
    this.accountCreatedHeading = page.getByRole("heading", {
      name: "Your Account Has Been Created!",
    });
  }

  getRegistrationHeading(): Locator {
    return this.registrationHeading;
  }

  /**
   * Enters customer details and accepts the Privacy Policy.
   * @param customer - Customer details for registration
   */
  async completeRegistration(customer: CustomerRegistrationData): Promise<void> {
    await this.firstNameField.fill(customer.firstName);
    await this.lastNameField.fill(customer.lastName);
    await this.emailField.fill(customer.email);
    if (await this.telephoneField.isVisible()) {
      if (!customer.telephone) {
        throw new Error("Telephone is required by the registration form.");
      }

      await this.telephoneField.fill(customer.telephone);
    }
    await this.passwordField.fill(customer.password);
    if (await this.passwordConfirmField.isVisible()) {
      await this.passwordConfirmField.fill(customer.password);
    }
    await this.privacyPolicyCheckbox.check();
  }

  /**
   * Submits the registration form.
   */
  async submitRegistration(): Promise<void> {
    await this.continueButton.click();
    await this.accountCreatedHeading.waitFor({ state: "visible" });
  }

  getAccountCreatedHeading(): Locator {
    return this.accountCreatedHeading;
  }
}
