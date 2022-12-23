import { UsersRepositoryInMemory } from "../../../../config/repositories/in-memory/users-repository-in-memory";
import { AppError } from "../../../../shared/errors/AppError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      email: "valdir@alves.dev",
      password: "1234",
      name: "Valdir",
    };
    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate an noneexistent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "fake@email.dev",
        password: "fake",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to  authenticate with incorret password", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "valdir@alves.dev",
        password: "1234",
        name: "Valdir",
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPassword",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
