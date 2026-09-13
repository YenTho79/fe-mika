import { STORAGE_KEYS } from '../storageKeys';
import { createRepository } from './createRepository';

export const bookRepository = createRepository(STORAGE_KEYS.BOOKS);
