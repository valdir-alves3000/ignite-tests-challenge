import { app } from "@app";
import authConfig from "@config/auth";
import createConnection from "@database/index";
import { randomUUID } from "crypto";
import { sign } from "jsonwebtoken";
import request from "supertest";
import { Connection } from "typeorm";

import { makeUser } from "../../../../../test/factories/user-factory";

let connection: Connection;
describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a statement the deposit for the user", async () => {
    const user = makeUser({ name: "Supertest" });

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "email@supertest.com", password: "password" });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "Presente de Natal",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      type: expect.stringMatching("deposit"),
      amount: 500,
    });
  });

  it("should be able to create a statement the withdraw for the user", async () => {
    const user = makeUser({
      name: "SuperTest",
    });

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "email@supertest.com", password: "password" });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "Presente de Natal",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "saque",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      type: expect.stringMatching("withdraw"),
      amount: 200,
    });
  });

  it("should be able to reject create a statement with a JWT token is missing!", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer `,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("JWT invalid token!"),
    });
  });

  it("should be able to reject create a statement with invalid JWT token!", async () => {
    const user = makeUser({ name: "Supertest" });

    const { expiresIn, secret } = authConfig.jwt;

    const token = sign({ user }, secret, {
      subject: randomUUID(),
      expiresIn,
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("User not found"),
    });
  });
});
