import { test, expect } from "../../fixtures/pageFixtures";
import dotenv from "dotenv";
import type { RowDataPacket } from "mysql2/promise";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { executeQuery } from "../../utils/dbClient";

dotenv.config();

type CustomerRecord = RowDataPacket & {
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  date_added: Date | string | null;
};

test("Customer registration is consistent across the storefront, admin, and database @master @regression @db @end-to-end", async ({
  adminPage,
  homePage,
  registerPage,
}) => {
  const generatedEmail = RandomDataUtil.getEmail();
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: generatedEmail.toLowerCase().replace("@", `-${Date.now()}@`),
    password: RandomDataUtil.getPassword(12),
  };
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  let registrationSubmitted = false;

  if (!adminUsername || !adminPassword) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be configured for database E2E tests.");
  }

  try {
    await test.step("1) Register a unique customer through the storefront", async () => {
      await homePage.clickMyAccount();
      await homePage.clickRegister();
      await expect(registerPage.getRegistrationHeading()).toBeVisible();

      await registerPage.completeRegistration(customer);
      registrationSubmitted = true;
      await registerPage.submitRegistration();

      await expect(registerPage.getAccountCreatedHeading()).toBeVisible();
    });

    await test.step("2) Verify the customer in the admin portal", async () => {
      await adminPage.open();
      await adminPage.login(adminUsername, adminPassword);
      await adminPage.searchCustomerByEmail(customer.email, "Enabled");

      const customerRow = adminPage.getCustomerRow(customer.email);
      await expect(customerRow, "Exactly one matching customer should appear in admin.").toHaveCount(1);
      await expect(customerRow).toContainText(`${customer.firstName} ${customer.lastName}`);
      await expect(customerRow).toContainText(customer.email);
    });

    await test.step("3) Verify the customer in MySQL", async () => {
      const customers = await executeQuery<CustomerRecord[]>(
        "SELECT firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?",
        [customer.email],
      );

      expect(customers, "Exactly one database row should match the registered email.").toHaveLength(1);

      const record = customers[0];
      expect(record.firstname).toBe(customer.firstName);
      expect(record.lastname).toBe(customer.lastName);
      expect(record.email).toBe(customer.email);
      expect(record.status).toBe(1);
      expect(record.date_added, "The customer date_added value should be present.").not.toBeNull();

      const dateAdded =
        record.date_added instanceof Date ? record.date_added : new Date(record.date_added ?? "");
      expect(Number.isNaN(dateAdded.getTime()), "The customer date_added value should be valid.").toBe(false);
    });

  } finally {
    if (registrationSubmitted) {
      await executeQuery(
        "DELETE FROM oc_customer WHERE email = ?",
        [customer.email],
      );
    }
  }

  console.log("✅ Cross-layer customer registration verification completed.");
});
