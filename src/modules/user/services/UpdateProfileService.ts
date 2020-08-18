import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';

import User from '../infra/typeorm/entities/User';

interface IRequest {
  user_id: string;
  name: string;
  surname: string;
  cpf: number;
  phone: number;
  gender: 'M' | 'F' | 'N';
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
  old_password?: string;
  password?: string;
}

@injectable()
class UpdateProfileService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({
    user_id,
    name,
    surname,
    cpf,
    phone,
    gender,
    address,
    neighborhood,
    city,
    uf,
    old_password,
    password,
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found.');
    }

    const userWithUpdatedCpf = await this.usersRepository.findByCpf(cpf);

    if (userWithUpdatedCpf && userWithUpdatedCpf.cpf !== user.cpf) {
      throw new AppError('Cpf already registered');
    }

    Object.assign(user, {
      name,
      surname,
      cpf,
      phone,
      gender,
      address,
      neighborhood,
      city,
      uf,
    });

    if (password && !old_password) {
      throw new AppError('Old password must be given.');
    }

    if (password && old_password) {
      const checkOldPassword = await this.hashProvider.compareHash(
        old_password,
        user.password,
      );

      if (!checkOldPassword) {
        throw new AppError('Old password does not match.');
      }

      user.password = await this.hashProvider.generateHash(password);
    }

    return this.usersRepository.save(user);
  }
}

export default UpdateProfileService;
