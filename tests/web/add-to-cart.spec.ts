/**
 * Test Case: Add a product to the shopping cart
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Search for a known product and open its details
 * 2) Add the requested quantity to the cart
 * 3) Verify the product, quantity, price, and total in the cart
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Add a product to the cart @master @sanity @regression @web", async ({
  cartPage,
  homePage,
  productPage,
  searchResultsPage,
}) => {
  const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

  await test.step("1) Search for the product and open its details", async () => {
    await homePage.searchFor(productName);
    await searchResultsPage.openProduct(productName);
    await expect(productPage.getProductHeading(productName)).toBeVisible();
    await expect(productPage.getProductPrice(totalPrice)).toBeVisible();
  });

  await test.step("2) Add the requested quantity to the cart", async () => {
    await productPage.setQuantity(productQuantity);
    await productPage.addToCart();
    await expect(productPage.getAddToCartConfirmation()).toContainText(productName);
  });

  await test.step("3) Verify the cart product and totals", async () => {
    await homePage.clickShoppingCart();
    await expect(cartPage.getCartHeading()).toBeVisible();
    await expect(cartPage.getProductRow(productName)).toBeVisible();
    await expect(cartPage.getProductQuantity(productName)).toHaveValue(productQuantity);
    await expect(cartPage.getProductUnitPrice(productName)).toHaveText(totalPrice);
    await expect(cartPage.getProductLineTotal(productName)).toHaveText(totalPrice);
    await expect(cartPage.getGrandTotal()).toHaveText(totalPrice);
  });

  console.log("✅ Product added to the shopping cart successfully.");
});
