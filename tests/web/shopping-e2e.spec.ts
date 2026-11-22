/**
 * Test Case: End-to-end customer shopping journey
 *
 * Tags: @master @regression @web @end-to-end
 *
 * Steps:
 * 1) Register a customer, log out, and log back in
 * 2) Search for a product and add it to the cart
 * 3) Verify the cart quantity, product price, and total
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

test("Customer registration, login, and shopping journey @master @regression @web @end-to-end", async ({
  accountPage,
  cartPage,
  homePage,
  loginPage,
  logoutPage,
  productPage,
  registerPage,
  searchResultsPage,
}) => {
  const generatedEmail = RandomDataUtil.getEmail();
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: generatedEmail.replace("@", `-${Date.now()}@`),
    password: RandomDataUtil.getPassword(12),
  };
  const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

  await test.step("1) Register, log out, and log back in", async () => {
    await homePage.clickMyAccount();
    await homePage.clickRegister();
    await registerPage.completeRegistration(customer);
    await registerPage.submitRegistration();
    await expect(registerPage.getAccountCreatedHeading()).toBeVisible();

    await accountPage.clickLogout();
    await expect(logoutPage.getLogoutHeading()).toBeVisible();
    await logoutPage.clickContinue();

    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await loginPage.login(customer.email, customer.password);
    await expect(accountPage.getAccountHeading()).toBeVisible();
  });

  await test.step("2) Search for a known product and add it to the cart", async () => {
    await homePage.searchFor(productName);
    await searchResultsPage.openProduct(productName);
    await expect(productPage.getProductHeading(productName)).toBeVisible();
    await expect(productPage.getProductPrice(totalPrice)).toBeVisible();

    await productPage.setQuantity(productQuantity);
    await productPage.addToCart();
    await expect(productPage.getAddToCartConfirmation()).toContainText(productName);
  });

  await test.step("3) Verify the shopping cart details", async () => {
    await homePage.clickShoppingCart();
    await expect(cartPage.getProductRow(productName)).toBeVisible();
    await expect(cartPage.getProductQuantity(productName)).toHaveValue(productQuantity);
    await expect(cartPage.getProductUnitPrice(productName)).toHaveText(totalPrice);
    await expect(cartPage.getProductLineTotal(productName)).toHaveText(totalPrice);
    await expect(cartPage.getGrandTotal()).toHaveText(totalPrice);
  });

  console.log("✅ End-to-end customer shopping journey completed successfully.");
});
