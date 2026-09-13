import { STORAGE_KEYS } from '../storageKeys';
import { createRepository } from './createRepository';

const repository = createRepository(STORAGE_KEYS.USERS);

export const userRepository = {
  ...repository,
  async findByEmail(email) {
    const users = await repository.list();
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  },
};
