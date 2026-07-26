import { STORAGE_KEYS } from '../storageKeys';
import { createRepository } from './createRepository';

const repository = createRepository(STORAGE_KEYS.TRANSACTIONS);

export const transactionRepository = {
  ...repository,
  async listByUser(userId) {
    const transactions = await repository.list();
    return transactions.filter((item) => String(item.userId) === String(userId));
  },
};
