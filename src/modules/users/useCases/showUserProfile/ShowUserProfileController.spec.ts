import { app } from "@app";
import createConnection from "@database/index";
import request from "supertest";
import { Connection } from "typeorm";
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

  it("should be able get users", async () => {
    const user = makeUser({});

    await request(app).post("/api/v1/users").send(user);

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send(user);

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should be able to reject a tokenless request", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer `,
    });
    expect(response.status).toBe(401);
  });
});
