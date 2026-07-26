import { STORAGE_KEYS } from '../storageKeys';
import { createRepository } from './createRepository';

const repository = createRepository(STORAGE_KEYS.REVIEWS);

export const reviewRepository = {
  ...repository,
  async listByBook(bookId) {
    const reviews = await repository.list();
    return reviews.filter((review) => String(review.bookId) === String(bookId));
  },
};
