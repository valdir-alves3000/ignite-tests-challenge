import { OperationType } from "@modules/statements/entities/Statement";
import { ICreateStatementDTO } from "@modules/statements/useCases/createStatement/ICreateStatementDTO";

type Override = Partial<ICreateStatementDTO>;

export function makeStatement(override: Override) {
  const user: ICreateStatementDTO = {
    amount: 500,
    description: "salário",
    type: OperationType.DEPOSIT,
    user_id: "User test ID",
    ...override,
  };

  return user;
}
