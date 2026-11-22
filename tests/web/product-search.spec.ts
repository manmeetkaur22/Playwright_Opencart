/**
 * Test Case: Product search
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Search for a known product
 * 2) Verify the search results and matching product name
 */

import { test, expect } from "../../fixtures/pageFixtures";
import { Helper } from "../../utils/helper";

test("Search for a known product @master @sanity @regression @web", async ({
  homePage,
  searchResultsPage,
}) => {
  const { productName } = Helper.getProductDetails();

  await test.step("1) Search for the known product", async () => {
    await homePage.searchFor(productName);
    await expect(searchResultsPage.getSearchHeading()).toContainText(productName);
  });

  await test.step("2) Verify the matching product appears in the results", async () => {
    await expect(searchResultsPage.getResultsHeading()).toBeVisible();
    await expect(searchResultsPage.getProductHeading(productName)).toBeVisible();
  });

  console.log("✅ Product search completed successfully.");
});
