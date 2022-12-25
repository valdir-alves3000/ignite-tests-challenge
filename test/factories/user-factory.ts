import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";

type Override = Partial<ICreateUserDTO>;

export function makeUser(override: Override) {
  const user: ICreateUserDTO = {
    name: "Supertest",
    email: "email@supertest.com",
    password: "password",
    ...override,
  };

  return user;
}
