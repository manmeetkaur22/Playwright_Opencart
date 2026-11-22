/**
 * Test Case: Successful customer registration
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Navigate to My Account → Register
 * 2) Complete the registration form and accept the Privacy Policy
 * 3) Verify the account-created confirmation
 * 4) Verify authenticated account navigation is available
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";

test("Customer registration test @master @sanity @regression @web", async ({
  homePage,
  registerPage,
}) => {
  const generatedEmail = RandomDataUtil.getEmail();
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: generatedEmail.replace("@", `-${Date.now()}@`),
    password: RandomDataUtil.getPassword(12),
  };

  await test.step("1) Navigate to My Account → Register", async () => {
    await homePage.clickMyAccount();
    await homePage.clickRegister();

    await expect(registerPage.getRegistrationHeading()).toBeVisible();
  });

  await test.step("2) Complete the registration form and accept the Privacy Policy", async () => {
    await registerPage.completeRegistration(customer);
  });

  await test.step("3) Submit the form and verify account creation", async () => {
    await registerPage.submitRegistration();

    await expect(registerPage.getAccountCreatedHeading()).toBeVisible();
  });

  await test.step("4) Verify authenticated account navigation is available", async () => {
    await homePage.clickMyAccount();
    await expect(homePage.getLogoutLink()).toBeVisible();
  });

  console.log("✅ Customer registration completed successfully.");
});
