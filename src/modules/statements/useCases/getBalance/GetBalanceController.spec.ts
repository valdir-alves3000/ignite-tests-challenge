import { app } from "@app";
import createConnection from "@database/index";
import { sign } from "jsonwebtoken";
import request from "supertest";
import { Connection } from "typeorm";

import authConfig from "@config/auth";
import { randomUUID } from "crypto";
import { makeUser } from "../../../../../test/factories/user-factory";

let connection: Connection;
describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to fetch a user's balance", async () => {
    const user = makeUser({ name: "Supertest" });

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "email@supertest.com", password: "password" });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("statement");
    expect(response.body).toMatchObject({
      balance: 0,
    });
  });

  it("should be able to reject balance fetch with a JWT token is missing!", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer `,
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("JWT invalid token!"),
    });
  });

  it("should be able to reject balance fetch with invalid JWT token!", async () => {
    const user = makeUser({ name: "Supertest" });

    const { expiresIn, secret } = authConfig.jwt;

    const token = sign({ user }, secret, {
      subject: randomUUID(),
      expiresIn,
    });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("User not found"),
    });
  });

  it("should be able to get the statement by id", async () => {
    const user = makeUser({
      email: "getstatement@byid.com",
      name: "SuperTest",
    });

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "getstatement@byid.com", password: "password" });

    const { token } = responseToken.body;
    const user_id = responseToken.body.user.id;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "Presente de Natal",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseStatement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toMatchObject({
      user_id,
    });
    expect(response.body).toMatchObject({
      amount: expect.stringMatching("500"),
    });

    expect(response.body).toMatchObject({
      type: expect.stringMatching("deposit"),
    });
  });

  it("must be able to reject search for nonexistent statement", async () => {
    const user = makeUser({
      email: "statement@notfound.com",
      name: "Not found",
    });

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "statement@notfound.com", password: "password" });

    const { token } = responseToken.body;
    const id = randomUUID();

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("Statement not found"),
    });
  });
});
