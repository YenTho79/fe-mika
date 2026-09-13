import { STORAGE_KEYS } from '../storageKeys';
import { createRepository } from './createRepository';

export const articleRepository = createRepository(STORAGE_KEYS.ARTICLES);
