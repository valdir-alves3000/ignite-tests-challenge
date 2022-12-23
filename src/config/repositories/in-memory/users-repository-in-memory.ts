import { User } from "../../../modules/users/entities/User";
import { IUsersRepository } from "../../../modules/users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../modules/users/useCases/createUser/ICreateUserDTO";

class UsersRepositoryInMemory implements IUsersRepository {
  users: User[] = [];

  async create({ email, name, password }: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, {
      name,
      email,
      password,
    });

    this.users.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(user_id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === user_id);
  }
}

export { UsersRepositoryInMemory };
