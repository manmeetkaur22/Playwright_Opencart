/**
 * Test Cases: Valid and invalid customer login
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Navigate to My Account → Login
 * 2) Submit valid or invalid customer credentials
 * 3) Verify the corresponding authentication result
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";

test("Valid customer login @master @sanity @regression @web", async ({
  accountPage,
  homePage,
  loginPage,
  logoutPage,
  registerPage,
}) => {
  const generatedEmail = RandomDataUtil.getEmail();
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: generatedEmail.replace("@", `-${Date.now()}@`),
    password: RandomDataUtil.getPassword(12),
  };

  await test.step("1) Create a customer for the login test", async () => {
    await homePage.clickMyAccount();
    await homePage.clickRegister();
    await expect(registerPage.getRegistrationHeading()).toBeVisible();
    await registerPage.completeRegistration(customer);
    await registerPage.submitRegistration();
    await expect(registerPage.getAccountCreatedHeading()).toBeVisible();

    await accountPage.clickLogout();
    await expect(logoutPage.getLogoutHeading()).toBeVisible();
    await logoutPage.clickContinue();
  });

  await test.step("2) Navigate to My Account → Login", async () => {
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await expect(loginPage.getLoginHeading()).toBeVisible();
  });

  await test.step("3) Log in and verify the customer dashboard", async () => {
    await loginPage.login(customer.email, customer.password);
    await expect(accountPage.getAccountHeading()).toBeVisible();
  });

  console.log("✅ Valid customer login completed successfully.");
});

test("Invalid customer login @master @regression @web", async ({
  accountPage,
  homePage,
  loginPage,
}) => {
  const generatedEmail = RandomDataUtil.getEmail();
  const email = generatedEmail.replace("@", `-${Date.now()}@`);
  const password = RandomDataUtil.getPassword(12);

  await test.step("1) Navigate to My Account → Login", async () => {
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await expect(loginPage.getLoginHeading()).toBeVisible();
  });

  await test.step("2) Submit invalid customer credentials", async () => {
    await loginPage.login(email, password);
  });

  await test.step("3) Verify login is rejected", async () => {
    await expect(loginPage.getWarningMessage()).toContainText(
      "Warning: No match for E-Mail Address and/or Password.",
    );
    await expect(accountPage.getAccountHeading()).not.toBeVisible();
  });

  console.log("✅ Invalid customer login was rejected as expected.");
});
