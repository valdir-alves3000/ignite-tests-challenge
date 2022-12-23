import { randomUUID } from "crypto";
import { UsersRepositoryInMemory } from "../../../../config/repositories/in-memory/users-repository-in-memory";
import { AppError } from "../../../../shared/errors/AppError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: UsersRepositoryInMemory;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able get user by id", async () => {
    const user: ICreateUserDTO = {
      email: "test@alves.dev",
      password: "1234",
      name: "TEST",
    };

    const createUser = await createUserUseCase.execute(user);
    const response = await showUserProfileUseCase.execute(createUser.id);

    expect(response).toHaveProperty("id");
    expect(response.email).toEqual(user.email);
    expect(response.id).toEqual(createUser.id);
  });
  it("should not be able to get user that doesn't exist", () => {
    const id = randomUUID();

    expect(async () => {
      await showUserProfileUseCase.execute(id);
    }).rejects.toBeInstanceOf(AppError);
  });
});
