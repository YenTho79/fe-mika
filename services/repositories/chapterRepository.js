import { STORAGE_KEYS } from '../storageKeys';
import { createRepository } from './createRepository';

const repository = createRepository(STORAGE_KEYS.CHAPTERS);

export const chapterRepository = {
  ...repository,
  async listByBook(bookId) {
    const chapters = await repository.list();
    return chapters
      .filter((chapter) => String(chapter.bookId) === String(bookId))
      .sort((a, b) => a.number - b.number);
  },
};
