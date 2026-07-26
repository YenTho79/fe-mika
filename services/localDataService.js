import {
  mockArticles,
  mockBooks,
  mockChapters,
  mockReadingProgress,
  mockReviews,
  mockSavedBooks,
  mockTransactions,
  mockUsers,
} from '../data/books';
import localStorageService from './localStorageService';
import { STORAGE_KEYS } from './storageKeys';
import { articleRepository } from './repositories/articleRepository';
import { bookRepository } from './repositories/bookRepository';
import { chapterRepository } from './repositories/chapterRepository';
import { reviewRepository } from './repositories/reviewRepository';
import { transactionRepository } from './repositories/transactionRepository';
import { userRepository } from './repositories/userRepository';

const SEED_VERSION = 2;
const DEFAULT_READER_SETTINGS = {
  fontSize: 18,
  theme: 'dark',
  fontFamily: 'System',
  lineHeight: 1.7,
  textAlign: 'justify',
};
const DEFAULT_APP_SETTINGS = {
  appearance: 'dark',
  defaultFontSize: 18,
  newChapterNotifications: true,
  autoSaveProgress: true,
};
const DEFAULT_ADMIN_SETTINGS = {
  appName: 'Mika Books',
  bannerTitle: 'Mở trang sách, mở thế giới',
  bannerSubtitle: 'Khám phá những câu chuyện được yêu thích trên Mika.',
};
const DEFAULT_CATEGORIES = [
  'Viễn tưởng', 'Phiêu lưu', 'Kiếm hiệp', 'Huyền huyễn', 'Đô thị',
  'Trinh thám', 'Ngôn tình', 'Kinh dị', 'Tâm lý', 'Lịch sử',
];

const createDefaultNotifications = (userId) => [
  {
    id: `notification_chapter_${userId}`,
    userId,
    type: 'chapter',
    title: 'Chương mới đã phát hành',
    message: 'Hành Trình Qua Những Vì Sao vừa có chương mới. Mở truyện để đọc ngay.',
    route: '/chi-tiet',
    params: { id: 'b1' },
    read: false,
    createdAt: '2025-02-16T09:15:00Z',
  },
  {
    id: `notification_transaction_${userId}`,
    userId,
    type: 'transaction',
    title: 'Giao dịch thành công',
    message: 'Giao dịch nạp xu của bạn đã được ghi nhận.',
    route: String(userId) === 'u1' ? '/chi-tiet-giao-dich' : '/lich-su-giao-dich',
    params: String(userId) === 'u1' ? { id: 't1' } : {},
    read: false,
    createdAt: '2025-02-15T13:30:00Z',
  },
  {
    id: `notification_system_${userId}`,
    userId,
    type: 'system',
    title: 'Chào mừng đến Mika Books',
    message: 'Bạn có thể tùy chỉnh cỡ chữ và cách lưu tiến độ trong phần Cài đặt.',
    route: '/cai-dat',
    params: {},
    read: true,
    createdAt: '2025-02-10T08:00:00Z',
  },
];

export const generateLocalId = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const formatIsoDate = (date = new Date()) => {
  const value = date instanceof Date ? date : new Date(date);
  return Number.isNaN(value.getTime()) ? new Date().toISOString() : value.toISOString();
};

export const formatDisplayDate = (isoString, includeTime = false) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    ...(includeTime ? { timeStyle: 'short' } : {}),
  }).format(date);
};

export const initLocalData = async (forceReset = false) => {
  const version = await localStorageService.get(STORAGE_KEYS.SEED_VERSION, 0);
  if (!forceReset && version === SEED_VERSION) return;

  if (!forceReset && version > 0 && version < SEED_VERSION) {
    const [adminSettings, categories, adjustments] = await Promise.all([
      localStorageService.get(STORAGE_KEYS.ADMIN_SETTINGS, null),
      localStorageService.get(STORAGE_KEYS.CATEGORIES, null),
      localStorageService.get(STORAGE_KEYS.COIN_ADJUSTMENTS, null),
    ]);
    await localStorageService.setMany([
      [STORAGE_KEYS.ADMIN_SETTINGS, adminSettings || DEFAULT_ADMIN_SETTINGS],
      [STORAGE_KEYS.CATEGORIES, categories || DEFAULT_CATEGORIES],
      [STORAGE_KEYS.COIN_ADJUSTMENTS, adjustments || []],
      [STORAGE_KEYS.SEED_VERSION, SEED_VERSION],
    ]);
    return;
  }

  await localStorageService.setMany([
    [STORAGE_KEYS.USERS, mockUsers],
    [STORAGE_KEYS.BOOKS, mockBooks],
    [STORAGE_KEYS.CHAPTERS, mockChapters],
    [STORAGE_KEYS.SAVED_BOOKS, mockSavedBooks],
    [STORAGE_KEYS.READING_PROGRESS, mockReadingProgress],
    [STORAGE_KEYS.PURCHASED_CHAPTERS, []],
    [STORAGE_KEYS.REVIEWS, mockReviews],
    [STORAGE_KEYS.TRANSACTIONS, mockTransactions],
    [STORAGE_KEYS.ARTICLES, mockArticles],
    [STORAGE_KEYS.ARTICLE_FAVORITES, []],
    [STORAGE_KEYS.READER_SETTINGS, DEFAULT_READER_SETTINGS],
    [STORAGE_KEYS.APP_SETTINGS, DEFAULT_APP_SETTINGS],
    [STORAGE_KEYS.NOTIFICATIONS, []],
    [STORAGE_KEYS.SEARCH_HISTORY, []],
    [STORAGE_KEYS.REMEMBERED_EMAIL, ''],
    [STORAGE_KEYS.ADMIN_SETTINGS, DEFAULT_ADMIN_SETTINGS],
    [STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES],
    [STORAGE_KEYS.COIN_ADJUSTMENTS, []],
    [STORAGE_KEYS.CURRENT_USER, null],
    [STORAGE_KEYS.SEED_VERSION, SEED_VERSION],
  ]);
};

export const resetToDefaultData = () => initLocalData(true);

export const restoreDemoContent = async () => {
  await localStorageService.setMany([
    [STORAGE_KEYS.BOOKS, mockBooks],
    [STORAGE_KEYS.CHAPTERS, mockChapters],
    [STORAGE_KEYS.ARTICLES, mockArticles],
  ]);
};

// Người dùng và xác thực local
export const getCurrentUser = () => localStorageService.get(STORAGE_KEYS.CURRENT_USER, null);
export const setCurrentUser = (user) => localStorageService.set(STORAGE_KEYS.CURRENT_USER, user);
export const logout = () => localStorageService.remove(STORAGE_KEYS.CURRENT_USER);
export const getUsers = () => userRepository.list();

export const getRememberedEmail = () => localStorageService.get(STORAGE_KEYS.REMEMBERED_EMAIL, '');

export const setRememberedEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail
    ? localStorageService.set(STORAGE_KEYS.REMEMBERED_EMAIL, normalizedEmail)
    : localStorageService.remove(STORAGE_KEYS.REMEMBERED_EMAIL);
};

export const login = async (email, password, remember = false) => {
  const user = await userRepository.findByEmail(email.trim());
  if (!user) {
    return { success: false, field: 'email', code: 'EMAIL_NOT_FOUND', message: 'Không tìm thấy tài khoản với email này.' };
  }
  if (user.status === 'disabled' || user.status === 'blocked' || user.status === 'locked') {
    return { success: false, field: 'email', code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' };
  }
  if (user.password !== password) {
    return { success: false, field: 'password', code: 'WRONG_PASSWORD', message: 'Mật khẩu không chính xác.' };
  }
  await setCurrentUser(user);
  await setRememberedEmail(remember ? user.email : '');
  return { success: true, user };
};

export const registerUser = async ({ name, email, password }) => {
  if (await userRepository.findByEmail(email.trim())) {
    return { success: false, message: 'Email này đã được sử dụng.' };
  }
  const user = {
    id: generateLocalId('u'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: 'user',
    coinBalance: 0,
    avatar: '',
    status: 'active',
    createdAt: formatIsoDate(),
  };
  await userRepository.save(user);
  await setCurrentUser(user);
  await setRememberedEmail('');
  return { success: true, user };
};

export const saveUser = async (userData) => {
  const item = { ...userData, id: userData.id || generateLocalId('u') };
  await userRepository.save(item);
  return item;
};
export const deleteUser = (id) => userRepository.remove(id);

export const updateCurrentUserProfile = async ({ name, email, avatar }) => {
  const current = await getCurrentUser();
  if (!current) return { success: false, message: 'Phiên đăng nhập đã hết hạn.' };

  const normalizedName = String(name || '').trim();
  const normalizedEmail = String(email || current.email).trim().toLowerCase();
  if (normalizedName.length < 2) {
    return { success: false, field: 'name', message: 'Họ tên phải có ít nhất 2 ký tự.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, field: 'email', message: 'Email không đúng định dạng.' };
  }
  const emailOwner = await userRepository.findByEmail(normalizedEmail);
  if (emailOwner && String(emailOwner.id) !== String(current.id)) {
    return { success: false, field: 'email', message: 'Email này đã được sử dụng.' };
  }

  const updated = {
    ...current,
    name: normalizedName,
    email: normalizedEmail,
    avatar: String(avatar || '').trim(),
    createdAt: current.createdAt || '2025-01-01T00:00:00Z',
    updatedAt: formatIsoDate(),
  };
  await userRepository.save(updated);
  await setCurrentUser(updated);

  const reviews = await reviewRepository.list();
  const nextReviews = reviews.map((review) => (
    String(review.userId) === String(updated.id)
      ? { ...review, userName: updated.name, userAvatar: updated.avatar }
      : review
  ));
  await localStorageService.set(STORAGE_KEYS.REVIEWS, nextReviews);
  return { success: true, user: updated };
};

export const updateUserCoinBalance = async (userId, amountChange) => {
  const user = await userRepository.findById(userId);
  if (!user) return 0;
  const updated = { ...user, coinBalance: Math.max(0, (user.coinBalance || 0) + amountChange) };
  await userRepository.save(updated);
  const currentUser = await getCurrentUser();
  if (currentUser?.id === updated.id) await setCurrentUser(updated);
  return updated.coinBalance;
};

export const adjustUserCoinBalance = async ({ userId, amountChange, reason, adminId }) => {
  const amount = Number(amountChange);
  if (!Number.isFinite(amount) || amount === 0) {
    return { success: false, message: 'Số xu điều chỉnh phải khác 0.' };
  }
  if (!String(reason || '').trim()) {
    return { success: false, message: 'Vui lòng nhập lý do điều chỉnh.' };
  }
  const user = await userRepository.findById(userId);
  if (!user) return { success: false, message: 'Không tìm thấy người dùng.' };
  if (Number(user.coinBalance || 0) + amount < 0) {
    return { success: false, message: 'Số dư sau điều chỉnh không thể âm.' };
  }
  const balance = await updateUserCoinBalance(userId, amount);
  const adjustment = {
    id: generateLocalId('adjustment'), userId, adminId, amount,
    reason: String(reason).trim(), balanceAfter: balance, createdAt: formatIsoDate(),
  };
  const items = await localStorageService.get(STORAGE_KEYS.COIN_ADJUSTMENTS, []);
  await localStorageService.set(STORAGE_KEYS.COIN_ADJUSTMENTS, [adjustment, ...items]);
  await addTransaction({
    userId, type: 'admin_adjustment', coin: amount, amount: 0, status: 'success',
    description: `Admin điều chỉnh: ${adjustment.reason}`,
  });
  return { success: true, balance, adjustment };
};

// Sách
export const getAdminBooks = () => bookRepository.list();
export const getBooks = async () => {
  const books = await bookRepository.list();
  return books.filter((book) => book.status !== 'Bản nháp' && book.status !== 'draft');
};
export const getBookById = (id) => bookRepository.findById(id);
export const saveBook = async (bookData) => {
  const item = {
    rating: 5,
    views: '0',
    status: 'Đang ra',
    featured: false,
    publishedAt: formatIsoDate(),
    ...bookData,
    id: bookData.id || generateLocalId('b'),
  };
  await bookRepository.save(item);
  return item;
};
export const deleteBook = (id) => bookRepository.remove(id);
export const deleteBookWithChapters = async (id) => {
  const chapters = await chapterRepository.list();
  const related = chapters.filter((item) => String(item.bookId) === String(id));
  await bookRepository.remove(id);
  await localStorageService.set(
    STORAGE_KEYS.CHAPTERS,
    chapters.filter((item) => String(item.bookId) !== String(id))
  );
  return related.length;
};

// Chương
export const getAdminChapters = (bookId = null) =>
  bookId ? chapterRepository.listByBook(bookId) : chapterRepository.list();
export const getChapters = async (bookId = null) => {
  const chapters = bookId ? await chapterRepository.listByBook(bookId) : await chapterRepository.list();
  return chapters.filter((chapter) => chapter.status !== 'draft');
};
export const getChapterById = (id) => chapterRepository.findById(id);
export const saveChapter = async (chapterData) => {
  const item = {
    locked: false,
    coinPrice: 0,
    publishedAt: formatIsoDate(),
    ...chapterData,
    id: chapterData.id || generateLocalId('c'),
  };
  await chapterRepository.save(item);
  return item;
};
export const deleteChapter = (id) => chapterRepository.remove(id);

export const moveChapter = async (bookId, chapterId, direction) => {
  const chapters = await chapterRepository.listByBook(bookId);
  const index = chapters.findIndex((item) => String(item.id) === String(chapterId));
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= chapters.length) return chapters;
  const current = chapters[index];
  const target = chapters[targetIndex];
  await chapterRepository.save({ ...current, number: target.number });
  await chapterRepository.save({ ...target, number: current.number });
  return chapterRepository.listByBook(bookId);
};

// Tủ sách
export const getSavedBooks = async (userId) => {
  const savedItems = await localStorageService.get(STORAGE_KEYS.SAVED_BOOKS, []);
  const books = await getBooks();
  return savedItems
    .filter((item) => String(item.userId) === String(userId))
    .map((item) => {
      const book = books.find((entry) => String(entry.id) === String(item.bookId));
      return book ? { ...book, savedAt: item.savedAt } : null;
    })
    .filter(Boolean);
};

export const getBookSaveCount = async (bookId) => {
  const items = await localStorageService.get(STORAGE_KEYS.SAVED_BOOKS, []);
  return items.filter((item) => String(item.bookId) === String(bookId)).length;
};

export const isBookSaved = async (userId, bookId) => {
  const items = await localStorageService.get(STORAGE_KEYS.SAVED_BOOKS, []);
  return items.some(
    (item) => String(item.userId) === String(userId) && String(item.bookId) === String(bookId)
  );
};

export const toggleSaveBook = async (userId, bookId) => {
  const items = await localStorageService.get(STORAGE_KEYS.SAVED_BOOKS, []);
  const index = items.findIndex(
    (item) => String(item.userId) === String(userId) && String(item.bookId) === String(bookId)
  );
  const saved = index < 0;
  if (saved) items.unshift({ userId, bookId, savedAt: formatIsoDate() });
  else items.splice(index, 1);
  await localStorageService.set(STORAGE_KEYS.SAVED_BOOKS, items);
  return saved;
};

// Quyền truy cập chương trả phí được lưu riêng theo từng người dùng.
export const getPurchasedChapterIds = async (userId) => {
  const items = await localStorageService.get(STORAGE_KEYS.PURCHASED_CHAPTERS, []);
  return items
    .filter((item) => String(item.userId) === String(userId))
    .map((item) => String(item.chapterId));
};

export const isChapterUnlocked = async (userId, chapter) => {
  if (!chapter?.locked) return true;
  const purchasedIds = await getPurchasedChapterIds(userId);
  return purchasedIds.includes(String(chapter.id));
};

export const purchaseChapter = async (userId, chapter) => {
  if (!userId || !chapter) return { success: false, code: 'INVALID_CHAPTER' };
  if (!chapter.locked || await isChapterUnlocked(userId, chapter)) {
    return { success: true, alreadyUnlocked: true };
  }

  const user = await userRepository.findById(userId);
  const price = Number(chapter.coinPrice || 0);
  if (!user || Number(user.coinBalance || 0) < price) {
    return {
      success: false,
      code: 'INSUFFICIENT_COINS',
      balance: Number(user?.coinBalance || 0),
      required: price,
    };
  }

  const purchasedItems = await localStorageService.get(STORAGE_KEYS.PURCHASED_CHAPTERS, []);
  purchasedItems.push({
    userId,
    chapterId: chapter.id,
    bookId: chapter.bookId,
    coinPrice: price,
    purchasedAt: formatIsoDate(),
  });
  await localStorageService.set(STORAGE_KEYS.PURCHASED_CHAPTERS, purchasedItems);
  const balance = await updateUserCoinBalance(userId, -price);
  await addTransaction({
    userId,
    type: 'chapter_purchase',
    amount: -price,
    description: `Mở khóa chương ${chapter.number}: ${chapter.title}`,
  });
  return { success: true, balance };
};

// Tiến độ đọc và cài đặt trình đọc
export const getReadingProgress = async (userId, bookId) => {
  const items = await localStorageService.get(STORAGE_KEYS.READING_PROGRESS, []);
  return items.find(
    (item) => String(item.userId) === String(userId) && String(item.bookId) === String(bookId)
  ) || null;
};

export const getReadingProgressList = async (userId) => {
  const items = await localStorageService.get(STORAGE_KEYS.READING_PROGRESS, []);
  return items
    .filter((item) => String(item.userId) === String(userId))
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
};

export const saveReadingProgress = async ({ userId, bookId, chapterId, page = 1, percent = 0 }) => {
  const items = await localStorageService.get(STORAGE_KEYS.READING_PROGRESS, []);
  const index = items.findIndex(
    (item) => String(item.userId) === String(userId) && String(item.bookId) === String(bookId)
  );
  const previous = index >= 0 ? items[index] : null;
  const progress = {
    ...previous,
    userId,
    bookId,
    chapterId,
    page,
    percent: Math.min(100, Math.max(0, Math.round(percent))),
    updatedAt: formatIsoDate(),
  };
  if (index >= 0) items[index] = progress;
  else items.push(progress);
  await localStorageService.set(STORAGE_KEYS.READING_PROGRESS, items);
  return progress;
};

export const deleteReadingProgress = async (userId, bookId = null) => {
  const items = await localStorageService.get(STORAGE_KEYS.READING_PROGRESS, []);
  const nextItems = items.filter((item) => {
    if (String(item.userId) !== String(userId)) return true;
    return bookId != null && String(item.bookId) !== String(bookId);
  });
  await localStorageService.set(STORAGE_KEYS.READING_PROGRESS, nextItems);
  return nextItems;
};

export const getReaderSettings = async () => ({
  ...DEFAULT_READER_SETTINGS,
  ...await localStorageService.get(STORAGE_KEYS.READER_SETTINGS, DEFAULT_READER_SETTINGS),
});
export const saveReaderSettings = (settings) =>
  localStorageService.set(STORAGE_KEYS.READER_SETTINGS, { ...DEFAULT_READER_SETTINGS, ...settings });

export const getAppSettings = async () => ({
  ...DEFAULT_APP_SETTINGS,
  ...await localStorageService.get(STORAGE_KEYS.APP_SETTINGS, DEFAULT_APP_SETTINGS),
});

export const saveAppSettings = async (settings) => {
  const next = { ...DEFAULT_APP_SETTINGS, ...settings };
  await localStorageService.set(STORAGE_KEYS.APP_SETTINGS, next);
  const readerSettings = await getReaderSettings();
  if (Number(next.defaultFontSize) !== Number(readerSettings.fontSize)) {
    await saveReaderSettings({ ...readerSettings, fontSize: Number(next.defaultFontSize) });
  }
  return next;
};

// Lịch sử tìm kiếm
export const getSearchHistory = () => localStorageService.get(STORAGE_KEYS.SEARCH_HISTORY, []);

export const addSearchHistory = async (keyword) => {
  const value = keyword.trim();
  if (!value) return getSearchHistory();
  const current = await getSearchHistory();
  const next = [value, ...current.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 8);
  await localStorageService.set(STORAGE_KEYS.SEARCH_HISTORY, next);
  return next;
};

export const clearSearchHistory = () => localStorageService.set(STORAGE_KEYS.SEARCH_HISTORY, []);

export const getAccountStats = async (userId) => {
  const [savedBooks, progress] = await Promise.all([
    getSavedBooks(userId),
    getReadingProgressList(userId),
  ]);
  return {
    saved: savedBooks.length,
    reading: progress.filter((item) => Number(item.percent || 0) < 100).length,
    completed: progress.filter((item) => Number(item.percent || 0) >= 100).length,
  };
};

// Đánh giá
export const getReviews = (bookId = null) =>
  bookId ? reviewRepository.listByBook(bookId) : reviewRepository.list();
export const addReview = async (reviewData) => {
  const item = {
    status: 'pending',
    ...reviewData,
    id: reviewData.id || generateLocalId('r'),
    createdAt: reviewData.createdAt || formatIsoDate(),
  };
  await reviewRepository.save(item);
  return item;
};
export const deleteReview = (id) => reviewRepository.remove(id);
export const updateReview = async (id, changes) => {
  const current = await reviewRepository.findById(id);
  if (!current) return null;
  const updated = { ...current, ...changes, id: current.id, updatedAt: formatIsoDate() };
  await reviewRepository.save(updated);
  return updated;
};
export const hideReview = (id) => updateReview(id, { status: 'hidden' });

// Tin tức
export const getArticles = () => articleRepository.list();
export const getArticleById = (id) => articleRepository.findById(id);
export const saveArticle = async (articleData) => {
  const item = {
    status: 'published',
    ...articleData,
    id: articleData.id || generateLocalId('a'),
    publishedAt: articleData.publishedAt || formatIsoDate(),
  };
  await articleRepository.save(item);
  return item;
};
export const deleteArticle = (id) => articleRepository.remove(id);
export const getFavoriteArticleIds = (userId) =>
  localStorageService.get(`${STORAGE_KEYS.ARTICLE_FAVORITES}_${userId}`, []);
export const toggleFavoriteArticle = async (userId, articleId) => {
  const key = `${STORAGE_KEYS.ARTICLE_FAVORITES}_${userId}`;
  const current = await localStorageService.get(key, []);
  const exists = current.some((id) => String(id) === String(articleId));
  const next = exists
    ? current.filter((id) => String(id) !== String(articleId))
    : [String(articleId), ...current];
  await localStorageService.set(key, next);
  return !exists;
};

// Giao dịch
export const getTransactions = (userId = null) =>
  userId ? transactionRepository.listByUser(userId) : transactionRepository.list();
export const getTransactionById = (id) => transactionRepository.findById(id);
export const addTransaction = async (transactionData) => {
  const item = {
    status: 'success',
    ...transactionData,
    id: transactionData.id || generateLocalId('t'),
    createdAt: transactionData.createdAt || formatIsoDate(),
  };
  await transactionRepository.save(item);
  return item;
};

export const updateTransactionStatus = async (id, status) => {
  const current = await transactionRepository.findById(id);
  if (!current) return { success: false, message: 'Không tìm thấy giao dịch.' };
  if (current.status === status) return { success: true, transaction: current, alreadyProcessed: true };

  let updated = { ...current, status, updatedAt: formatIsoDate() };
  const shouldCredit = status === 'success'
    && current.type === 'deposit'
    && current.status !== 'success'
    && !current.creditedAt;
  if (shouldCredit) {
    const creditedCoin = Math.max(0, Number(current.coin || current.baseCoin || 0));
    if (creditedCoin > 0) {
      const balance = await updateUserCoinBalance(current.userId, creditedCoin);
      updated = { ...updated, creditedAt: formatIsoDate(), balanceAfter: balance };
    }
  }
  await transactionRepository.save(updated);
  return { success: true, transaction: updated, alreadyProcessed: false };
};

export const getAdminSettings = async () => ({
  ...DEFAULT_ADMIN_SETTINGS,
  ...await localStorageService.get(STORAGE_KEYS.ADMIN_SETTINGS, DEFAULT_ADMIN_SETTINGS),
});
export const saveAdminSettings = async (settings) => {
  const next = { ...DEFAULT_ADMIN_SETTINGS, ...settings };
  await localStorageService.set(STORAGE_KEYS.ADMIN_SETTINGS, next);
  return next;
};
export const getCategories = () => localStorageService.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
export const saveCategories = async (categories) => {
  const next = [...new Set(categories.map((item) => String(item).trim()).filter(Boolean))];
  await localStorageService.set(STORAGE_KEYS.CATEGORIES, next);
  return next;
};

export const exportLocalData = async () => {
  const entries = await Promise.all(
    Object.entries(STORAGE_KEYS).map(async ([name, key]) => [name, await localStorageService.get(key, null)])
  );
  return JSON.stringify(Object.fromEntries(entries), null, 2);
};

const topupLocks = new Map();

// Hoàn tất giao dịch nạp xu theo mã duy nhất. Cùng một mã chỉ có thể cộng xu một lần.
export const completeCoinTopup = async ({
  transactionId,
  userId,
  coin,
  bonus = 0,
  price,
  method,
}) => {
  const id = String(transactionId || '');
  if (!id || !userId) throw new Error('Thông tin giao dịch không hợp lệ.');
  if (topupLocks.has(id)) return topupLocks.get(id);

  const operation = (async () => {
    const existing = await transactionRepository.findById(id);
    if (existing?.status === 'success') {
      const currentUser = await userRepository.findById(userId);
      return { transaction: existing, balance: Number(currentUser?.coinBalance || 0), alreadyProcessed: true };
    }

    const baseCoin = Math.max(0, Number(coin) || 0);
    const bonusCoin = Math.max(0, Number(bonus) || 0);
    const creditedCoin = baseCoin + bonusCoin;
    if (!creditedCoin) throw new Error('Gói xu không hợp lệ.');

    const balance = await updateUserCoinBalance(userId, creditedCoin);
    const transaction = await addTransaction({
      id,
      userId,
      type: 'deposit',
      coin: creditedCoin,
      baseCoin,
      bonus: bonusCoin,
      amount: Number(price) || 0,
      method: method || 'Không xác định',
      status: 'success',
      balanceAfter: balance,
      description: `Nạp ${baseCoin} xu${bonusCoin ? ` + ${bonusCoin} xu thưởng` : ''}`,
    });
    return { transaction, balance, alreadyProcessed: false };
  })();

  topupLocks.set(id, operation);
  try {
    return await operation;
  } finally {
    topupLocks.delete(id);
  }
};

// Thông báo local được tách theo người dùng và có trạng thái đã đọc riêng.
export const getNotifications = async (userId) => {
  if (!userId) return [];
  const all = await localStorageService.get(STORAGE_KEYS.NOTIFICATIONS, []);
  const userItems = all.filter((item) => String(item.userId) === String(userId));
  if (userItems.length) {
    return userItems.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  const defaults = createDefaultNotifications(userId);
  await localStorageService.set(STORAGE_KEYS.NOTIFICATIONS, [...defaults, ...all]);
  return defaults;
};

export const markNotificationRead = async (userId, notificationId, read = true) => {
  await getNotifications(userId);
  const all = await localStorageService.get(STORAGE_KEYS.NOTIFICATIONS, []);
  const next = all.map((item) => (
    String(item.userId) === String(userId) && String(item.id) === String(notificationId)
      ? { ...item, read, readAt: read ? formatIsoDate() : null }
      : item
  ));
  await localStorageService.set(STORAGE_KEYS.NOTIFICATIONS, next);
  return next.filter((item) => String(item.userId) === String(userId));
};

export const markAllNotificationsRead = async (userId) => {
  await getNotifications(userId);
  const all = await localStorageService.get(STORAGE_KEYS.NOTIFICATIONS, []);
  const readAt = formatIsoDate();
  const next = all.map((item) => (
    String(item.userId) === String(userId) ? { ...item, read: true, readAt } : item
  ));
  await localStorageService.set(STORAGE_KEYS.NOTIFICATIONS, next);
  return next.filter((item) => String(item.userId) === String(userId));
};

export const restoreDemoData = async () => {
  const current = await getCurrentUser();
  await localStorageService.setMany([
    [STORAGE_KEYS.USERS, mockUsers],
    [STORAGE_KEYS.BOOKS, mockBooks],
    [STORAGE_KEYS.CHAPTERS, mockChapters],
    [STORAGE_KEYS.SAVED_BOOKS, mockSavedBooks],
    [STORAGE_KEYS.READING_PROGRESS, mockReadingProgress],
    [STORAGE_KEYS.PURCHASED_CHAPTERS, []],
    [STORAGE_KEYS.REVIEWS, mockReviews],
    [STORAGE_KEYS.TRANSACTIONS, mockTransactions],
    [STORAGE_KEYS.ARTICLES, mockArticles],
    [STORAGE_KEYS.ARTICLE_FAVORITES, []],
    [STORAGE_KEYS.SEARCH_HISTORY, []],
    [STORAGE_KEYS.READER_SETTINGS, DEFAULT_READER_SETTINGS],
    [STORAGE_KEYS.APP_SETTINGS, DEFAULT_APP_SETTINGS],
    [STORAGE_KEYS.NOTIFICATIONS, []],
    [STORAGE_KEYS.ADMIN_SETTINGS, DEFAULT_ADMIN_SETTINGS],
    [STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES],
    [STORAGE_KEYS.COIN_ADJUSTMENTS, []],
  ]);
  if (current) await setCurrentUser(current);
  return current;
};
