import AppError from '@shared/errors/AppError';

import FakeStorageProvider from '@shared/container/providers/StorageProvider/fakes/FakeStorageProvider';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import UpdateUserAvatarService from './UpdateUserAvatarService';

describe('UpdateUserAvatar', () => {
  it('should be able to update user avatar', async () => {
    const fakeStorageProvider = new FakeStorageProvider();
    const fakeUsersRepository = new FakeUsersRepository();

    const updateUserAvatar = new UpdateUserAvatarService(
      fakeUsersRepository,
      fakeStorageProvider,
    );

    const user = await fakeUsersRepository.create({
      name: 'Joe',
      surname: 'Doe',
      cpf: 12345678900,
      phone: 42955325823,
      gender: 'M',
      address: 'Rua 1, n 500',
      neighborhood: 'Centro',
      uf: 'DF',
      city: 'Brasilia',
      email: 'joedoe@gmail.com',
      password: '123456',
    });

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFilename: 'new_avatar.png',
    });

    expect(user.avatar).toBe('new_avatar.png');
  });

  it('should not be able to update avatar from non existing user', async () => {
    const fakeStorageProvider = new FakeStorageProvider();
    const fakeUsersRepository = new FakeUsersRepository();

    const updateUserAvatar = new UpdateUserAvatarService(
      fakeUsersRepository,
      fakeStorageProvider,
    );

    expect(
      updateUserAvatar.execute({
        user_id: 'non-existing-user',
        avatarFilename: 'new_avatar.png',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should delete old avatar when uploading a new one', async () => {
    const fakeStorageProvider = new FakeStorageProvider();
    const fakeUsersRepository = new FakeUsersRepository();

    const deleteFile = jest.spyOn(fakeStorageProvider, 'deleteFile');

    const updateUserAvatar = new UpdateUserAvatarService(
      fakeUsersRepository,
      fakeStorageProvider,
    );

    const user = await fakeUsersRepository.create({
      name: 'Joe',
      surname: 'Doe',
      cpf: 12345678900,
      phone: 42955325823,
      gender: 'M',
      address: 'Rua 1, n 500',
      neighborhood: 'Centro',
      uf: 'DF',
      city: 'Brasilia',
      email: 'joedoe@gmail.com',
      password: '123456',
    });

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFilename: 'avatar.png',
    });

    await updateUserAvatar.execute({
      user_id: user.id,
      avatarFilename: 'new_avatar.png',
    });

    expect(deleteFile).toHaveBeenCalledWith('avatar.png');
    expect(user.avatar).toBe('new_avatar.png');
  });
});
