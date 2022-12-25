import { UsersRepositoryInMemory } from "@config/repositories/in-memory/users-repository-in-memory";
import { AppError } from "@shared/errors/AppError";
import { makeUser } from "../../../../../test/factories/user-factory";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let usersRepositoryInMemory: UsersRepositoryInMemory;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able create user", async () => {
    const user = makeUser({ name: "TEST", email: "test@alves.dev" });

    const response = await createUserUseCase.execute(user);

    expect(response).toHaveProperty("id");
    expect(response.password).toHaveLength(60);
    expect(response).toMatchObject({
      email: expect.stringMatching("test@alves.dev"),
      name: expect.stringMatching("TEST"),
    });
  });

  it("should not be able create a new user with email exists", async () => {
    expect(async () => {
      const user = makeUser({ name: "TEST", email: "test@alves.dev" });

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
});
