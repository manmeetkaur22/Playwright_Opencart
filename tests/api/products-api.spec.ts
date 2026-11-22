import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
};

function expectProductFields(product: Product): void {
  expect(Number.isInteger(product.id), "Product id should be an integer.").toBe(true);
  expect(typeof product.title, "Product title should be a string.").toBe("string");
  expect(typeof product.price, "Product price should be a number.").toBe("number");
  expect(typeof product.category, "Product category should be a string.").toBe("string");
  expect(product.image, "Product image should be a valid URL.").toMatch(/^https?:\/\//);
}

test.describe("FakeStore Products API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);

  const productByIdUrl = (id: number) =>
    `${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace("{id}", String(id))}`;

  // ---------------------------------------------------------
  // GET - Products
  // ---------------------------------------------------------

  test("GET - All products @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), "GET /products should return status 200.").toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products)).toBe(true);
    expect(products.length, "At least one product should be returned.").toBeGreaterThan(0);
    products.forEach(expectProductFields);
  });

  test("GET - Product by ID @master @sanity @api", async ({ request }) => {
    const response = await request.get(productByIdUrl(PRODUCT_ID));
    expect(response.status(), "GET product by id should return status 200.").toBe(200);

    const product = (await response.json()) as Product;
    expect(product.id).toBe(PRODUCT_ID);
    expectProductFields(product);
  });

  test("GET - Products with limit @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "GET products with limit should return status 200.").toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products)).toBe(true);
    expect(products.length, "The API should return the requested number of products.").toBe(LIMIT);
    products.forEach(expectProductFields);
  });

  test("GET - Products sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending product sort should return status 200.").toBe(200);

    const products = (await response.json()) as Product[];
    const ids = products.map((product) => product.id);
    expect(ids).toEqual([...ids].sort((left, right) => left - right));
  });

  test("GET - Products sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending product sort should return status 200.").toBe(200);

    const products = (await response.json()) as Product[];
    const ids = products.map((product) => product.id);
    expect(ids).toEqual([...ids].sort((left, right) => right - left));
  });

  test("GET - All product categories @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), "GET product categories should return status 200.").toBe(200);

    const categories = (await response.json()) as string[];
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length, "At least one category should be returned.").toBeGreaterThan(0);
    categories.forEach((category) => expect(typeof category).toBe("string"));
  });

  test("GET - Products by category @master @regression @api", async ({ request }) => {
    const category = "electronics";
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace(
      "{category}",
      encodeURIComponent(category),
    );
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "GET products by category should return status 200.").toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products)).toBe(true);
    expect(products.length, "The selected category should return products.").toBeGreaterThan(0);
    products.forEach((product) => expect(product.category).toBe(category));
  });

  // ---------------------------------------------------------
  // POST / PUT / DELETE - Products
  // ---------------------------------------------------------

  test("POST - Create product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
    expect(response.status(), "Creating a product should return status 201.").toBe(201);

    const created = (await response.json()) as Product;
    expect(Number.isInteger(created.id), "The created product should have an integer id.").toBe(
      true,
    );
    expect(created.title).toBe(payload.title);
    expect(created.price).toBe(payload.price);
    expect(created.description).toBe(payload.description);
    expect(created.category).toBe(payload.category);
    expect(created.image).toBe(payload.image);
  });

  test("PUT - Update product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Updating a product should return status 200.").toBe(200);

    const updated = (await response.json()) as Product;
    expect(updated.id).toBe(PRODUCT_ID);
    expect(updated.title).toBe(payload.title);
    expect(updated.price).toBe(payload.price);
    expect(updated.description).toBe(payload.description);
    expect(updated.category).toBe(payload.category);
    expect(updated.image).toBe(payload.image);
  });

  test("DELETE - Product @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Deleting a product should return status 200.").toBe(200);

    const deleted = (await response.json()) as Product;
    expect(deleted.id).toBe(PRODUCT_ID);
  });
});
