import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

type Cart = {
  id: number;
  userId: number;
  date: string;
  products: {
    productId: number;
    quantity: number;
  }[];
};

function expectCartFields(cart: Cart): void {
  expect(Number.isInteger(cart.id), "Cart id should be an integer.").toBe(true);
  expect(Number.isInteger(cart.userId), "Cart userId should be an integer.").toBe(true);
  expect(Number.isFinite(Date.parse(cart.date)), "Cart date should be a valid date.").toBe(true);
  expect(Array.isArray(cart.products), "Cart products should be an array.").toBe(true);
  cart.products.forEach((product) => {
    expect(Number.isInteger(product.productId)).toBe(true);
    expect(Number.isInteger(product.quantity)).toBe(true);
  });
}

test.describe("FakeStore Carts API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);
  const START_DATE = process.env.START_DATE || "2019-12-10";
  const END_DATE = process.env.END_DATE || "2020-10-10";

  const cartByIdUrl = (id: number) =>
    `${BASE_URL}${Routes.GET_CART_BY_ID.replace("{id}", String(id))}`;

  // ---------------------------------------------------------
  // GET - Carts
  // ---------------------------------------------------------

  test("GET - All carts @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), "GET /carts should return status 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length, "At least one cart should be returned.").toBeGreaterThan(0);
    carts.forEach(expectCartFields);
  });

  test("GET - Cart by ID @master @sanity @api", async ({ request }) => {
    const response = await request.get(cartByIdUrl(CART_ID));
    expect(response.status(), "GET cart by id should return status 200.").toBe(200);

    const cart = (await response.json()) as Cart;
    expect(cart.id).toBe(CART_ID);
    expectCartFields(cart);
  });

  test("GET - Carts by date range @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace("{startdate}", encodeURIComponent(START_DATE))
      .replace("{enddate}", encodeURIComponent(END_DATE));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Filtering carts by date should return status 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts)).toBe(true);

    const start = new Date(START_DATE);
    const end = new Date(END_DATE);
    if (/^\d{4}-\d{2}-\d{2}$/.test(END_DATE)) {
      end.setUTCHours(23, 59, 59, 999);
    }
    expect(start.getTime()).toBeLessThanOrEqual(end.getTime());

    carts.forEach((cart) => {
      const cartTime = Date.parse(cart.date);
      expect(cartTime, `Cart ${cart.id} should be on or after the start date.`).toBeGreaterThanOrEqual(
        start.getTime(),
      );
      expect(cartTime, `Cart ${cart.id} should be on or before the end date.`).toBeLessThanOrEqual(
        end.getTime(),
      );
    });
  });

  test("GET - Carts by user @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USER_CART.replace("{userId}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "GET user carts should return status 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length, "The configured user should have carts.").toBeGreaterThan(0);
    carts.forEach((cart) => {
      expectCartFields(cart);
      expect(cart.userId).toBe(USER_ID);
    });
  });

  test("GET - Carts with limit @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "GET carts with limit should return status 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length, "The API should return the requested number of carts.").toBe(LIMIT);
    carts.forEach(expectCartFields);
  });

  test("GET - Carts sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending cart sort should return status 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    const ids = carts.map((cart) => cart.id);
    expect(ids).toEqual([...ids].sort((left, right) => left - right));
  });

  test("GET - Carts sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending cart sort should return status 200.").toBe(200);

    const carts = (await response.json()) as Cart[];
    const ids = carts.map((cart) => cart.id);
    expect(ids).toEqual([...ids].sort((left, right) => right - left));
  });

  // ---------------------------------------------------------
  // POST / PUT / DELETE - Carts
  // ---------------------------------------------------------

  test("POST - Create cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(response.status(), "Creating a cart should return status 201.").toBe(201);

    const created = (await response.json()) as Cart;
    expect(Number.isInteger(created.id), "The created cart should have an integer id.").toBe(true);
    expect(created.userId).toBe(USER_ID);
    expect(created.products).toEqual(payload.products);
  });

  test("PUT - Update cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    payload.products[0].quantity += 1;
    const route = Routes.UPDATE_CART.replace("{id}", String(CART_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Updating a cart should return status 200.").toBe(200);

    const updated = (await response.json()) as Cart;
    expect(updated.id).toBe(CART_ID);
    expect(updated.userId).toBe(USER_ID);
    expect(updated.products[0].quantity).toBe(payload.products[0].quantity);
  });

  test("DELETE - Cart @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_CART.replace("{id}", String(CART_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Deleting a cart should return status 200.").toBe(200);

    const deleted = (await response.json()) as Cart;
    expect(deleted.id).toBe(CART_ID);
  });
});
