import { app } from "@app";
import createConnection from "@database/index";
import request from "supertest";
import { Connection } from "typeorm";
import { makeUser } from "../../../../../test/factories/user-factory";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;
describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able authenticate user", async () => {
    const user: ICreateUserDTO = {
      email: "supertest@alves.dev",
      password: "password",
      name: "User Test",
    };
    await request(app).post("/api/v1/users").send(user);

    const response = await request(app).post("/api/v1/sessions").send(user);

    expect(response.body).toMatchObject({
      token: expect.stringMatching("[a-z]"),
    });
  });

  it("should not be able to authenticate an noneexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "fake@test.com",
      password: "fakepassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("Incorrect email or password"),
    });
  });

  it("should not be able to  authenticate with incorret password", async () => {
    const user = makeUser({ email: "superUser@alves.dev" });

    await request(app).post("/api/v1/users").send(user);

    const response = await request(app).post("/api/v1/sessions").send({
      email: "superUser@alves.dev",
      password: "not found",
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: expect.stringMatching("Incorrect email or password"),
    });
  });
});
