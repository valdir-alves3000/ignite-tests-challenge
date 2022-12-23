import { Connection } from "typeorm";

let connection: Connection;
describe("Create User Controller", () => {
  // beforeAll(async () => {
  //   connection = await createConnection();
  //   await connection.runMigrations();
  // });
  // afterAll(async () => {
  //   await connection.dropDatabase();
  //   await connection.close();
  // });
  it("should be able create user", async () => {
    //   const response = await request(app).post("/api/v1/users").send({
    //     email: "valdir@alves.dev",
    //     password: "1234",
    //     name: "Valdir",
    //   });
    //   expect(response.status).toBe(201);
  });
  // it("should not be able create a new user with email exists", async () => {
  //   const response = await request(app).post("/api/v1/users").send({
  //     email: "valdir@alves.dev",
  //     password: "1234",
  //     name: "Valdir",
  //   });
  //   expect(response.status).toBe(400);
  //   expect(response.body).toMatchObject({ message: "User already exists" });
  // });
});
