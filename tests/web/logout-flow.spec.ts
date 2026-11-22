/**
 * Test Case: Customer logout
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Create a customer and log in
 * 2) Log out and verify the confirmation
 * 3) Continue to the homepage and verify the customer is logged out
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";

test("Customer logout @master @sanity @regression @web", async ({
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

  await test.step("1) Create a customer and log in", async () => {
    await homePage.clickMyAccount();
    await homePage.clickRegister();
    await registerPage.completeRegistration(customer);
    await registerPage.submitRegistration();
    await expect(registerPage.getAccountCreatedHeading()).toBeVisible();

    await accountPage.clickLogout();
    await logoutPage.clickContinue();
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await loginPage.login(customer.email, customer.password);
    await expect(accountPage.getAccountHeading()).toBeVisible();
  });

  await test.step("2) Log out and verify the confirmation page", async () => {
    await accountPage.clickLogout();
    await expect(logoutPage.getLogoutHeading()).toBeVisible();
  });

  await test.step("3) Continue to the homepage and verify logged-out navigation", async () => {
    await logoutPage.clickContinue();
    await homePage.clickMyAccount();
    await expect(homePage.getLoginLink()).toBeVisible();
    await expect(homePage.getLogoutLink()).not.toBeVisible();
  });

  console.log("✅ Customer logout completed successfully.");
});
