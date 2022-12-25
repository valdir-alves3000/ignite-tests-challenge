import { app } from "@app";
import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "@database/index";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able create user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({ email: "valdir@alves.dev", password: "1234", name: "Valdir" });
    expect(response.status).toBe(201);
  });

  it("should not be able create a new user with email exists", async () => {
    const response = await request(app).post("/api/v1/users").send({
      email: "valdir@alves.dev",
      password: "1234",
      name: "Valdir",
    });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("User already exists"),
    });
  });

  it("should be able to reject a new user with incomplete data", async () => {
    const response = await request(app).post("/api/v1/users").send({
      email: "incompletedate@alves.dev",
      password: "1234",
    });

    expect(response.status).toBe(500);
  });
});
