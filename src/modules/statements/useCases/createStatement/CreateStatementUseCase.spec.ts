import { UsersRepositoryInMemory } from "@config/repositories/in-memory/users-repository-in-memory";
import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { randomUUID } from "crypto";
import { makeStatement } from "../../../../../test/factories/statement-factory";
import { makeUser } from "../../../../../test/factories/user-factory";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepositoryInMemory: UsersRepositoryInMemory;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create a statement the deposit for the user", async () => {
    const user = makeUser({});

    const createUser = await createUserUseCase.execute(user);

    const statement = makeStatement({
      user_id: createUser.id,
    });

    const response = await createStatementUseCase.execute(statement);

    expect(response).toHaveProperty("id");
    expect(response).toMatchObject(statement);
    expect(response.amount).toBe(500);
  });

  it("should  be able to reject the creation of a statement for non-existent user", async () => {
    expect(async () => {
      const statement = makeStatement({
        user_id: randomUUID(),
      });

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to create a statement the withdraw for the user", async () => {
    const user = makeUser({
      email: "statement@withdown.com",
    });

    const createUser = await createUserUseCase.execute(user);

    const statementDeposit = makeStatement({
      user_id: createUser.id,
    });

    const statementWithdraw = makeStatement({
      amount: 100,
      description: "saque",
      type: OperationType.WITHDRAW,
      user_id: createUser.id,
    });
    await createStatementUseCase.execute(statementDeposit);
    const response = await createStatementUseCase.execute(statementWithdraw);

    expect(response).toHaveProperty("id");
    expect(response).toMatchObject(statementWithdraw);
    expect(response.amount).toBe(100);
  });

  it("should be able to reject the creation of a withdrawal statement without sufficient balance", async () => {
    expect(async () => {
      const user = makeUser({
        email: "insufficient@balance.com",
        name: "Insufficient Funds",
      });

      const createUser = await createUserUseCase.execute(user);

      const statement: ICreateStatementDTO = {
        amount: 1,
        description: "saque",
        type: OperationType.WITHDRAW,
        user_id: createUser.id,
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });
});
