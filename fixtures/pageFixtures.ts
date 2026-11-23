import { test as base } from "@playwright/test";
import dotenv from "dotenv";
import { AdminPage } from "../pages/AdminPage";
import { AccountPage } from "../pages/AccountPage";
import { CartPage } from "../pages/CartPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { LogoutPage } from "../pages/LogoutPage";
import { ProductPage } from "../pages/ProductPage";
import { RegisterPage } from "../pages/RegisterPage";
import { SearchResultsPage } from "../pages/SearchResultsPage";

dotenv.config();

type PageFixtures = {
  adminPage: AdminPage;
  accountPage: AccountPage;
  cartPage: CartPage;
  homePage: HomePage;
  loginPage: LoginPage;
  logoutPage: LogoutPage;
  opencartHomePage: HomePage;
  productPage: ProductPage;
  registerPage: RegisterPage;
  searchResultsPage: SearchResultsPage;
};

const appUrl = process.env.WEB_APP_URL;
const opencartAppUrl = process.env.OPENCART_APP_URL;

export const test = base.extend<PageFixtures>({
  adminPage: async ({ page }, use) => {
    if (!opencartAppUrl) {
      throw new Error("OPENCART_APP_URL must be set to run admin tests.");
    }

    const adminUrl = new URL("admin/index.php", opencartAppUrl).toString();
    await use(new AdminPage(page, adminUrl));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  homePage: async ({ page }, use) => {
    if (!appUrl) {
      throw new Error("WEB_APP_URL must be set to run web tests.");
    }

    await page.goto(appUrl);
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  logoutPage: async ({ page }, use) => {
    await use(new LogoutPage(page));
  },
  opencartHomePage: async ({ page }, use) => {
    if (!opencartAppUrl) {
      throw new Error("OPENCART_APP_URL must be set to run OpenCart database tests.");
    }

    await page.goto(opencartAppUrl);
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
});

test.afterEach(async ({ page, context }) => {
  if (!page.isClosed()) {
    await page.close();
  }

  await context.close();
});

export { expect } from "@playwright/test";
