import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

type User = {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: {
      lat: string;
      long: string;
    };
  };
  phone: string;
};

function expectUserFields(user: User): void {
  expect(Number.isInteger(user.id), "User id should be an integer.").toBe(true);
  expect(typeof user.email).toBe("string");
  expect(typeof user.username).toBe("string");
  expect(typeof user.password).toBe("string");
  expect(typeof user.name.firstname).toBe("string");
  expect(typeof user.name.lastname).toBe("string");
  expect(typeof user.address.city).toBe("string");
  expect(typeof user.address.geolocation.lat).toBe("string");
  expect(typeof user.phone).toBe("string");
}

test.describe("FakeStore Users API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);

  const userByIdUrl = (id: number) =>
    `${BASE_URL}${Routes.GET_USER_BY_ID.replace("{id}", String(id))}`;

  // ---------------------------------------------------------
  // GET - Users
  // ---------------------------------------------------------

  test("GET - All users @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), "GET /users should return status 200.").toBe(200);

    const users = (await response.json()) as User[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.length, "At least one user should be returned.").toBeGreaterThan(0);
    users.forEach(expectUserFields);
  });

  test("GET - User by ID @master @sanity @api", async ({ request }) => {
    const response = await request.get(userByIdUrl(USER_ID));
    expect(response.status(), "GET user by id should return status 200.").toBe(200);

    const user = (await response.json()) as User;
    expect(user.id).toBe(USER_ID);
    expectUserFields(user);
  });

  test("GET - Users with limit @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "GET users with limit should return status 200.").toBe(200);

    const users = (await response.json()) as User[];
    expect(Array.isArray(users)).toBe(true);
    expect(users.length, "The API should return the requested number of users.").toBe(LIMIT);
    users.forEach(expectUserFields);
  });

  test("GET - Users sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending user sort should return status 200.").toBe(200);

    const users = (await response.json()) as User[];
    const ids = users.map((user) => user.id);
    expect(ids).toEqual([...ids].sort((left, right) => left - right));
  });

  test("GET - Users sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending user sort should return status 200.").toBe(200);

    const users = (await response.json()) as User[];
    const ids = users.map((user) => user.id);
    expect(ids).toEqual([...ids].sort((left, right) => right - left));
  });

  // ---------------------------------------------------------
  // POST / PUT / DELETE - Users
  // ---------------------------------------------------------

  test("POST - Create user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
    expect(response.status(), "Creating a user should return status 201.").toBe(201);

    const created = (await response.json()) as { id: number };
    expect(Number.isInteger(created.id), "The created user should have an integer id.").toBe(true);
    expect(created.id).toBeGreaterThan(0);
  });

  test("PUT - Update user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace("{id}", String(USER_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Updating a user should return status 200.").toBe(200);

    const updated = (await response.json()) as Omit<User, "id">;
    expect(updated.email).toBe(payload.email);
    expect(updated.username).toBe(payload.username);
    expect(updated.name.firstname).toBe(payload.name.firstname);
    expect(updated.name.lastname).toBe(payload.name.lastname);
    expect(updated.address.city).toBe(payload.address.city);
    expect(updated.phone).toBe(payload.phone);
  });

  test("DELETE - User @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_USER.replace("{id}", String(USER_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Deleting a user should return status 200.").toBe(200);

    const deleted = (await response.json()) as { id: number };
    expect(deleted.id).toBe(USER_ID);
  });
});
