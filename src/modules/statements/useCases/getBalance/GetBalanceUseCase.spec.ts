import { UsersRepositoryInMemory } from "@config/repositories/in-memory/users-repository-in-memory";
import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { randomUUID } from "crypto";
import { makeStatement } from "../../../../../test/factories/statement-factory";
import { makeUser } from "../../../../../test/factories/user-factory";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: UsersRepositoryInMemory;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("should be able to fetch a user's balance", async () => {
    const user = makeUser({
      email: "getbalance@alves.dev",
      name: "Get Balance",
    });

    const createUser = await createUserUseCase.execute(user);

    const statementDeposit = makeStatement({
      user_id: createUser.id,
    });
    await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw = makeStatement({
      amount: 280,
      description: "saque",
      type: OperationType.WITHDRAW,
      user_id: createUser.id,
    });
    await createStatementUseCase.execute(statementWithdraw);

    const response = await getBalanceUseCase.execute({
      user_id: createUser.id,
    });

    expect(response.balance).toBe(
      statementDeposit.amount - statementWithdraw.amount
    );
    expect(response.statement).toHaveLength(2);
    expect(response.statement[0]).toMatchObject({
      type: expect.stringMatching("deposit"),
    });
    expect(response.statement[1]).toMatchObject({
      type: expect.stringMatching("withdraw"),
    });
  });

  it("should be able to reject the balance fetching of a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: randomUUID(),
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
