import { UsersRepositoryInMemory } from "../../../../config/repositories/in-memory/users-repository-in-memory";
import { AppError } from "../../../../shared/errors/AppError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepositoryInMemory: UsersRepositoryInMemory;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able create user", async () => {
    const user: ICreateUserDTO = {
      email: "test@alves.dev",
      password: "1234",
      name: "TEST",
    };

    const response = await createUserUseCase.execute(user);

    expect(response).toHaveProperty("id");
  });

  it("should not be able create a new user with email exists", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "test@alves.dev",
        password: "1234",
        name: "TEST",
      };

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
});
