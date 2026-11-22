import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

test.describe("FakeStore Authentication API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);

  test("POST - Successful login @master @sanity @api", async ({ request }) => {
    const userRoute = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const userResponse = await request.get(`${BASE_URL}${userRoute}`);
    expect(userResponse.status(), "The demo user should be available for login.").toBe(200);

    const user = (await userResponse.json()) as {
      username?: unknown;
      password?: unknown;
    };
    if (typeof user.username !== "string" || typeof user.password !== "string") {
      throw new Error("The demo user response must include a username and password.");
    }

    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: user.username, password: user.password },
    });

    expect(response.status(), "Valid credentials should return status 201.").toBe(201);

    const body = (await response.json()) as { token?: unknown };
    expect(body).toHaveProperty("token");
    expect(typeof body.token, "The authentication token should be a string.").toBe("string");
    expect(
      typeof body.token === "string" && body.token.length > 0,
      "The authentication token should not be empty.",
    ).toBe(true);
  });

  test("POST - Invalid login @master @regression @api", async ({ request }) => {
    const invalidCredentials = RandomDataUtil.generateInvalidLoginPayload();
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: invalidCredentials,
    });

    expect(response.status(), "Invalid credentials should return status 401.").toBe(401);

    const errorMessage = await response.text();
    expect(errorMessage).toBe("username or password is incorrect");
  });
});
