import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

test.describe.serial("FakeStore API CRUD Workflows", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);

  test("POST → PUT → DELETE product workflow @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: payload,
    });
    expect(createResponse.status(), "Product creation should return status 201.").toBe(201);

    const created = (await createResponse.json()) as { id: number };
    expect(Number.isInteger(created.id)).toBe(true);

    const updatedPayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateRoute = Routes.UPDATE_PRODUCT.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatedPayload,
    });
    expect(updateResponse.status(), "Product update should return status 200.").toBe(200);

    const updated = (await updateResponse.json()) as {
      id: number;
      title: string;
      price: number;
      description: string;
      category: string;
      image: string;
    };
    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe(updatedPayload.title);
    expect(updated.price).toBe(updatedPayload.price);
    expect(updated.description).toBe(updatedPayload.description);
    expect(updated.category).toBe(updatedPayload.category);
    expect(updated.image).toBe(updatedPayload.image);

    const deleteRoute = Routes.DELETE_PRODUCT.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Product deletion should return status 200.").toBe(200);

    const deleteBody = await deleteResponse.text();
    const deleted = deleteBody ? (JSON.parse(deleteBody) as { id: number } | null) : null;
    if (deleted) {
      expect(deleted.id).toBe(created.id);
    }
  });

  test("POST → PUT → DELETE user workflow @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: payload,
    });
    expect(createResponse.status(), "User creation should return status 201.").toBe(201);

    const created = (await createResponse.json()) as { id: number };
    expect(Number.isInteger(created.id)).toBe(true);

    const updatedPayload = RandomDataUtil.generateUserUpdatePayload();
    const updateRoute = Routes.UPDATE_USER.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatedPayload,
    });
    expect(updateResponse.status(), "User update should return status 200.").toBe(200);

    const updated = (await updateResponse.json()) as {
      email: string;
      username: string;
      name: {
        firstname: string;
        lastname: string;
      };
      address: {
        city: string;
      };
      phone: string;
    };
    expect(updated.email).toBe(updatedPayload.email);
    expect(updated.username).toBe(updatedPayload.username);
    expect(updated.name.firstname).toBe(updatedPayload.name.firstname);
    expect(updated.name.lastname).toBe(updatedPayload.name.lastname);
    expect(updated.address.city).toBe(updatedPayload.address.city);
    expect(updated.phone).toBe(updatedPayload.phone);

    const deleteRoute = Routes.DELETE_USER.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "User deletion should return status 200.").toBe(200);

    const deleteBody = await deleteResponse.text();
    const deleted = deleteBody ? (JSON.parse(deleteBody) as { id: number } | null) : null;
    if (deleted) {
      expect(deleted.id).toBe(created.id);
    }
  });

  test("POST → PUT → DELETE cart workflow @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: payload,
    });
    expect(createResponse.status(), "Cart creation should return status 201.").toBe(201);

    const created = (await createResponse.json()) as {
      id: number;
      userId: number;
      products: {
        productId: number;
        quantity: number;
      }[];
    };
    expect(Number.isInteger(created.id)).toBe(true);
    expect(created.userId).toBe(USER_ID);
    expect(created.products).toEqual(payload.products);

    const updatedPayload = {
      userId: created.userId,
      date: RandomDataUtil.getCurrentDate(),
      products: created.products.map((product) => ({
        productId: product.productId,
        quantity: product.quantity + 1,
      })),
    };
    const updateRoute = Routes.UPDATE_CART.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatedPayload,
    });
    expect(updateResponse.status(), "Cart update should return status 200.").toBe(200);

    const updated = (await updateResponse.json()) as typeof created;
    expect(updated.id).toBe(created.id);
    expect(updated.userId).toBe(created.userId);
    expect(updated.products[0].quantity).toBe(updatedPayload.products[0].quantity);

    const deleteRoute = Routes.DELETE_CART.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Cart deletion should return status 200.").toBe(200);

    const deleteBody = await deleteResponse.text();
    const deleted = deleteBody ? (JSON.parse(deleteBody) as { id: number } | null) : null;
    if (deleted) {
      expect(deleted.id).toBe(created.id);
    }
  });
});
