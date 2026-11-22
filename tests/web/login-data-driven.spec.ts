/**
 * Test Case: Login with external test data
 *
 * Tags: @master @regression @web @datadriven
 *
 * Steps:
 * 1) Load each customer login scenario from the JSON data file
 * 2) Submit the provided credentials, leaving blank values empty
 * 3) Verify the result against the expected outcome
 */

import path from "path";
import { test, expect } from "../../fixtures/pageFixtures";
import { DataProvider } from "../../utils/DataReader";

type LoginTestCase = {
  testName: string;
  email: string;
  password: string;
  expected: "success" | "failure";
};

function isLoginTestCase(value: unknown): value is LoginTestCase {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.testName === "string" &&
    typeof record.email === "string" &&
    typeof record.password === "string" &&
    (record.expected === "success" || record.expected === "failure")
  );
}

const loginData: unknown = DataProvider.readJson(
  path.resolve(__dirname, "../../testdata/opencart_logindata.json"),
);

if (!Array.isArray(loginData)) {
  throw new Error("Login test data must be an array of test cases.");
}

const loginTestCases = loginData.map((value, index) => {
  if (!isLoginTestCase(value)) {
    throw new Error(`Invalid login test data at row ${index + 1}.`);
  }

  return value;
});

for (const [index, testCase] of loginTestCases.entries()) {
  test(`${testCase.testName} (${index + 1}) @master @regression @web @datadriven`, async ({
    accountPage,
    homePage,
    loginPage,
  }) => {
    const email = testCase.email.trim() === "" ? "" : testCase.email;
    const password = testCase.password.trim() === "" ? "" : testCase.password;

    await test.step("1) Navigate to the customer login page", async () => {
      await homePage.clickMyAccount();
      await homePage.clickLogin();
      await expect(loginPage.getLoginHeading()).toBeVisible();
    });

    await test.step("2) Submit the credentials from this data row", async () => {
      await loginPage.login(email, password);
    });

    if (testCase.expected === "success") {
      await test.step("3) Verify successful login and the My Account page", async () => {
        await expect(accountPage.getAccountHeading()).toBeVisible();
      });
    } else {
      await test.step("3) Verify the login warning and remain unauthenticated", async () => {
        await expect(loginPage.getWarningMessage()).toHaveText(
          /Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts\.)/,
        );
        await expect(loginPage.getLoginHeading()).toBeVisible();
        await expect(accountPage.getAccountHeading()).not.toBeVisible();
      });
    }

    console.log(`✅ Data-driven login scenario completed: ${testCase.testName}.`);
  });
}
