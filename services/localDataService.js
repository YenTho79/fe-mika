import localStorageService from './localStorageService';
import { STORAGE_KEYS } from './storageKeys';
import {
  loginUser,
  registerUser as registerUserApi,
  fetchStories,
  fetchStoryDetail,
  fetchChapterDetail,
  upgradeUserVip as upgradeUserVipApi,
  unlockChapter,
  fetchTransactions,
  fetchTransactionDetail,
  topupCoins,
  fetchUserProfile,
  fetchAdminStats,
  fetchAdminUsers,
  toggleUserStatusApi,
  adjustUserCoinsApi,
  createStoryApi,
  updateStoryApi,
  deleteStoryApi,
  fetchAdminChapters,
  createChapterApi,
  updateChapterApi,
  deleteChapterApi,
  moveChapterApi,
  updateTransactionStatusApi,
  fetchReviewsApi,
  createReviewApi,
  updateReviewApi,
  deleteReviewApi,
} from '../constants/api';
import { articleRepository } from './repositories/articleRepository';
import { bookRepository } from './repositories/bookRepository';
import { chapterRepository } from './repositories/chapterRepository';
// reviewRepository removed
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

const mapBackendBookToFrontend = (b) => {
  if (!b) return null;
  return {
    id: String(b.id),
    title: b.tieu_de || '',
    author: b.tac_gia || '',
    categories: b.the_loai || [],
    category: b.the_loai && b.the_loai.length > 0 ? b.the_loai[0] : 'Viễn tưởng',
    rating: Number(b.diem_danh_gia || 0),
    views: b.luot_doc !== undefined ? String(b.luot_doc) : '0',
    status: b.trang_thai || 'Đang ra',
    featured: b.featured || false,
    cover: b.anh_bia_url || '',
    description: b.mo_ta || '',
    publishedAt: b.ngay_tao ? b.ngay_tao.split('T')[0] : '2025-01-01',
    chaptersCount: b.so_chuong || 0,
  };
};

const mapBackendChapterToFrontend = (c, bookId) => {
  if (!c) return null;
  return {
    id: String(c.id),
    bookId: String(bookId || c.bookId),
    number: c.so_thu_tu_chuong || c.number || 0,
    title: c.tieu_de || c.title || '',
    content: c.noi_dung || c.content || '',
    locked: c.is_unlocked ? false : (c.is_paid !== undefined ? Boolean(c.is_paid) : (c.is_free !== undefined ? Boolean(c.co_khoa && !c.is_free) : Boolean(c.co_khoa || c.locked))),
    coinPrice: c.xu_yeu_cau !== undefined ? Number(c.xu_yeu_cau) : Number(c.coinPrice || 0),
    publishedAt: c.publishedAt || '2025-01-01',
  };
};

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
    [STORAGE_KEYS.USERS, []],
    [STORAGE_KEYS.BOOKS, []],
    [STORAGE_KEYS.CHAPTERS, []],
    [STORAGE_KEYS.SAVED_BOOKS, []],
    [STORAGE_KEYS.READING_PROGRESS, []],
    [STORAGE_KEYS.PURCHASED_CHAPTERS, []],
    [STORAGE_KEYS.REVIEWS, []],
    [STORAGE_KEYS.TRANSACTIONS, []],
    [STORAGE_KEYS.ARTICLES, []],
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
    [STORAGE_KEYS.BOOKS, []],
    [STORAGE_KEYS.CHAPTERS, []],
    [STORAGE_KEYS.ARTICLES, []],
  ]);
};

// Người dùng và xác thực local
export const getCurrentUser = () => localStorageService.get(STORAGE_KEYS.CURRENT_USER, null);
export const setCurrentUser = (user) => localStorageService.set(STORAGE_KEYS.CURRENT_USER, user);
export const logout = () => localStorageService.remove(STORAGE_KEYS.CURRENT_USER);
export const getUsers = async () => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      const res = await fetchAdminUsers(currentUser.token);
      if (res.success && res.results) {
        const mappedUsers = res.results.map((u) => ({
          id: String(u.id),
          name: u.ho_ten,
          email: u.email,
          role: u.vai_tro,
          coinBalance: Number(u.so_du_xu),
          status: u.trang_thai,
          createdAt: u.ngay_tao,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
        }));
        for (const u of mappedUsers) {
          await userRepository.save(u);
        }
        return mappedUsers;
      }
    } catch (err) {
      console.error('getUsers API failed, falling back to local userRepository:', err);
    }
  }
  return userRepository.list();
};

export const getRememberedEmail = () => localStorageService.get(STORAGE_KEYS.REMEMBERED_EMAIL, '');

export const setRememberedEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail
    ? localStorageService.set(STORAGE_KEYS.REMEMBERED_EMAIL, normalizedEmail)
    : localStorageService.remove(STORAGE_KEYS.REMEMBERED_EMAIL);
};

export const login = async (email, password, remember = false) => {
  try {
    const res = await loginUser(email, password);
    if (res.success && res.user) {
      const user = {
        id: String(res.user.id),
        name: res.user.ho_ten,
        email: res.user.email,
        role: res.user.vai_tro || (res.user.email.includes('admin') ? 'admin' : 'user'),
        coinBalance: Number(res.user.so_du_xu || 0),
        isVip: Boolean(res.user.is_vip),
        vipExpiresAt: res.user.vip_expires_at || null,
        avatar: '',
        status: res.user.trang_thai || 'active',
        createdAt: res.user.ngay_tao,
        token: res.user.api_token,
      };
      await userRepository.save(user);
      await setCurrentUser(user);
      await setRememberedEmail(remember ? user.email : '');
      return { success: true, user };
    } else {
      return { success: false, message: res.message || 'Mật khẩu không chính xác.' };
    }
  } catch (err) {
    console.error('Backend login failed:', err);
    return { success: false, message: err.message || 'Không thể kết nối đến máy chủ backend.' };
  }
};

export const registerUser = async ({ name, email, password }) => {
  try {
    const res = await registerUserApi(name, email, password);
    if (res.success && res.user) {
      const user = {
        id: String(res.user.id),
        name: res.user.ho_ten,
        email: res.user.email,
        role: res.user.vai_tro || 'user',
        coinBalance: Number(res.user.so_du_xu || 0),
        isVip: Boolean(res.user.is_vip),
        vipExpiresAt: res.user.vip_expires_at || null,
        avatar: '',
        status: res.user.trang_thai || 'active',
        createdAt: res.user.ngay_tao,
        token: res.user.api_token,
      };
      await userRepository.save(user);
      await setCurrentUser(user);
      await setRememberedEmail('');
      return { success: true, user };
    } else {
      return { success: false, message: res.message || 'Lỗi đăng ký.' };
    }
  } catch (err) {
    console.error('Backend register failed:', err);
    return { success: false, message: err.message || 'Không thể kết nối đến máy chủ backend.' };
  }
};

export const saveUser = async (userData) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token && userData.id) {
    try {
      const localUser = await userRepository.findById(userData.id);
      if (localUser && localUser.status !== userData.status) {
        const res = await toggleUserStatusApi(userData.id, currentUser.token);
        if (res.success) {
          const updatedUser = { ...userData, status: res.status };
          await userRepository.save(updatedUser);
          return updatedUser;
        }
      }
    } catch (err) {
      console.error('saveUser status toggle API failed:', err);
    }
  }
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

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      const res = await adjustUserCoinsApi({ userId, amount, reason }, currentUser.token);
      if (res.success) {
        const balance = Number(res.balance);
        const localUser = await userRepository.findById(userId);
        if (localUser) {
          await userRepository.save({ ...localUser, coinBalance: balance });
        }
        const adjustment = {
          id: generateLocalId('adjustment'), userId, adminId, amount,
          reason: String(reason).trim(), balanceAfter: balance, createdAt: formatIsoDate(),
        };
        const items = await localStorageService.get(STORAGE_KEYS.COIN_ADJUSTMENTS, []);
        await localStorageService.set(STORAGE_KEYS.COIN_ADJUSTMENTS, [adjustment, ...items]);
        return { success: true, balance, adjustment };
      } else {
        return { success: false, message: res.message || 'Không thể điều chỉnh số dư xu.' };
      }
    } catch (err) {
      console.error('adjustUserCoinBalance API failed:', err);
    }
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
export const getAdminBooks = async () => {
  try {
    const res = await fetchStories();
    if (res.success && res.results) {
      return res.results.map(mapBackendBookToFrontend);
    }
  } catch (err) {
    console.error('getAdminBooks API failed:', err);
  }
  return [];
};

export const getBooks = async () => {
  try {
    const res = await fetchStories();
    if (res.success && res.results) {
      const books = res.results.map(mapBackendBookToFrontend);
      return books.filter((book) => book.status !== 'Bản nháp' && book.status !== 'draft');
    }
  } catch (err) {
    console.error('getBooks API failed:', err);
  }
  return [];
};

export const getBookById = async (id) => {
  try {
    if (id && (!isNaN(id) || /^\d+$/.test(id))) {
      const res = await fetchStoryDetail(id);
      if (res.success && res.story) {
        return mapBackendBookToFrontend(res.story);
      }
    }
  } catch (err) {
    console.error('getBookById API failed:', err);
  }
  return null;
};
export const saveBook = async (bookData) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      let res;
      if (bookData.id && !bookData.id.startsWith('b_')) {
        res = await updateStoryApi(bookData.id, bookData, currentUser.token);
      } else {
        res = await createStoryApi(bookData, currentUser.token);
      }
      if (res.success && res.story) {
        const item = mapBackendBookToFrontend(res.story);
        await bookRepository.save(item);
        return item;
      }
    } catch (err) {
      console.error('saveBook API failed:', err);
    }
  }

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
export const deleteBook = async (id) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token && id && !id.startsWith('b_')) {
    try {
      const res = await deleteStoryApi(id, currentUser.token);
      if (res.success) {
        await bookRepository.remove(id);
        return true;
      }
    } catch (err) {
      console.error('deleteBook API failed:', err);
    }
  }
  await bookRepository.remove(id);
  return true;
};
export const deleteBookWithChapters = async (id) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token && id && !id.startsWith('b_')) {
    try {
      await deleteStoryApi(id, currentUser.token);
    } catch (err) {
      console.error('deleteBookWithChapters API failed:', err);
    }
  }
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
export const getAdminChapters = async (bookId = null) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      const res = await fetchAdminChapters(bookId, currentUser.token);
      if (res.success && res.results) {
        const mappedChapters = res.results.map((c) => mapBackendChapterToFrontend(c, bookId || c.bookId));
        for (const c of mappedChapters) {
          await chapterRepository.save(c);
        }
        return mappedChapters;
      }
    } catch (err) {
      console.error('getAdminChapters API failed:', err);
    }
  }
  if (bookId) {
    return getChapters(bookId);
  }
  return [];
};
export const getChapters = async (bookId = null) => {
  if (bookId && (!isNaN(bookId) || /^\d+$/.test(bookId))) {
    try {
      const res = await fetchStoryDetail(bookId);
      if (res.success && res.story && res.story.chuongs) {
        return res.story.chuongs.map((c) => mapBackendChapterToFrontend(c, bookId));
      }
    } catch (err) {
      console.error('getChapters API failed:', err);
    }
  }
  return [];
};
export const getChapterById = async (id) => {
  if (id && (!isNaN(id) || /^\d+$/.test(id))) {
    try {
      const currentUser = await getCurrentUser();
      const token = currentUser?.token || null;
      const res = await fetchChapterDetail(id, token);
      if (res.success && res.chapter) {
        return mapBackendChapterToFrontend(res.chapter);
      }
    } catch (err) {
      console.error('getChapterById API failed:', err);
    }
  }
  return null;
};
export const saveChapter = async (chapterData) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      let res;
      if (chapterData.id && !chapterData.id.startsWith('c_')) {
        res = await updateChapterApi(chapterData.id, chapterData, currentUser.token);
      } else {
        res = await createChapterApi(chapterData, currentUser.token);
      }
      if (res.success && res.chapter) {
        const item = mapBackendChapterToFrontend(res.chapter, chapterData.bookId);
        await chapterRepository.save(item);
        return item;
      }
    } catch (err) {
      console.error('saveChapter API failed:', err);
    }
  }

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
export const deleteChapter = async (id) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token && id && !id.startsWith('c_')) {
    try {
      const res = await deleteChapterApi(id, currentUser.token);
      if (res.success) {
        await chapterRepository.remove(id);
        return true;
      }
    } catch (err) {
      console.error('deleteChapter API failed:', err);
    }
  }
  await chapterRepository.remove(id);
  return true;
};

export const moveChapter = async (bookId, chapterId, direction) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token && chapterId && !chapterId.startsWith('c_')) {
    try {
      const res = await moveChapterApi(chapterId, direction, currentUser.token);
      if (res.success) {
        return await getAdminChapters(bookId);
      }
    } catch (err) {
      console.error('moveChapter API failed:', err);
    }
  }

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
  const user = await getCurrentUser();
  if (user && user.isVip) return true;
  const purchasedIds = await getPurchasedChapterIds(userId);
  return purchasedIds.includes(String(chapter.id));
};

export const upgradeVip = async () => {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Yêu cầu đăng nhập để nâng cấp VIP.' };

  try {
    if (user.token) {
      const res = await upgradeUserVipApi(user.token);
      if (res.success && res.user) {
        user.isVip = Boolean(res.user.is_vip);
        user.coinBalance = Number(res.user.so_du_xu);
        user.vipExpiresAt = res.user.vip_expires_at || null;
        await userRepository.save(user);
        await setCurrentUser(user);
        return { success: true, user };
      } else {
        return { success: false, message: res.message || 'Lỗi nâng cấp VIP.' };
      }
    } else {
      return { success: false, message: 'Yêu cầu tài khoản đăng nhập qua hệ thống để nâng cấp VIP.' };
    }
  } catch (err) {
    console.error('Backend VIP upgrade failed:', err);
    return { success: false, message: err.message || 'Không thể kết nối đến máy chủ backend.' };
  }
};

export const syncUserProfile = async () => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      const res = await fetchUserProfile(currentUser.token);
      if (res.success && res.user) {
        currentUser.name = res.user.ho_ten;
        currentUser.email = res.user.email;
        currentUser.coinBalance = Number(res.user.so_du_xu || 0);
        currentUser.isVip = Boolean(res.user.is_vip);
        currentUser.vipExpiresAt = res.user.vip_expires_at || null;
        await userRepository.save(currentUser);
        await setCurrentUser(currentUser);
        return currentUser;
      }
    } catch (err) {
      console.error('syncUserProfile error:', err);
    }
  }
  return currentUser;
};

export const purchaseChapter = async (userId, chapter) => {
  if (!userId || !chapter) return { success: false, code: 'INVALID_CHAPTER' };
  if (!chapter.locked || await isChapterUnlocked(userId, chapter)) {
    return { success: true, alreadyUnlocked: true };
  }

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      const res = await unlockChapter(chapter.id, currentUser.token);
      if (res.success) {
        currentUser.coinBalance = Number(res.so_du_xu);
        await setCurrentUser(currentUser);
        await userRepository.save(currentUser);

        // Đồng bộ local purchases phòng khi cần sử dụng offline
        const purchasedItems = await localStorageService.get(STORAGE_KEYS.PURCHASED_CHAPTERS, []);
        if (!purchasedItems.some(item => String(item.chapterId) === String(chapter.id) && String(item.userId) === String(userId))) {
          purchasedItems.push({
            userId,
            chapterId: chapter.id,
            bookId: chapter.bookId,
            coinPrice: Number(chapter.coinPrice || 0),
            purchasedAt: formatIsoDate(),
          });
          await localStorageService.set(STORAGE_KEYS.PURCHASED_CHAPTERS, purchasedItems);
        }

        return { success: true, balance: currentUser.coinBalance, user: currentUser };
      } else {
        if (res.message && (res.message.includes('không đủ') || res.message.includes('không đủ để mở khoá') || res.message.includes('Số dư xu không đủ'))) {
          return {
            success: false,
            code: 'INSUFFICIENT_COINS',
            balance: currentUser.coinBalance,
            required: Number(chapter.coinPrice || 0),
          };
        }
        return { success: false, message: res.message || 'Mở khóa chương thất bại.' };
      }
    } catch (err) {
      console.error('purchaseChapter API error:', err);
      return { success: false, message: err.message || 'Không thể kết nối đến máy chủ backend để mở khóa chương.' };
    }
  }

  return { success: false, message: 'Yêu cầu đăng nhập để mua chương.' };
};

// Tiến độ đọc và cài đặt trình đọc
export const getReadingProgress = async (userId, bookId) => {
  const items = await localStorageService.get(STORAGE_KEYS.READING_PROGRESS, []);
  if (!userId && !bookId) return items;
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
const mapReviewApiToLocal = (item) => ({
  ...item,
  id: item.id,
  bookId: item.sach,
  userId: item.nguoi_dung,
  rating: item.rating,
  content: item.content,
  status: item.status,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  userName: item.user_name || 'Người dùng',
  userAvatar: 'https://ui-avatars.com/api/?name=' + (item.user_name || 'U'),
});

export const getReviews = async (bookId = null) => {
  const result = await fetchReviewsApi(bookId);
  if (result && result.success === false) return [];
  const reviews = Array.isArray(result) ? result : (result?.results || []);
  return reviews.map(mapReviewApiToLocal);
};
export const addReview = async (reviewData, token) => {
  const result = await createReviewApi(reviewData, token);
  if (result && result.success === false) {
    console.error("Lỗi thêm đánh giá", result);
    return null;
  }
  return mapReviewApiToLocal(result?.data || result);
};
export const deleteReview = async (id, token) => {
  return await deleteReviewApi(id, token);
};
export const updateReview = async (id, changes, token) => {
  const result = await updateReviewApi(id, changes, token);
  if (result && result.success === false) {
    console.error("Lỗi cập nhật đánh giá", result);
    return null;
  }
  return mapReviewApiToLocal(result?.data || result);
};
export const hideReview = (id, token) => updateReview(id, { status: 'hidden' }, token);



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
export const getTransactions = async (userId = null) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      const res = await fetchTransactions(currentUser.token);
      if (res.success && res.results) {
        // Đồng bộ dữ liệu giao dịch về local repository phòng khi offline
        for (const tx of res.results) {
          await transactionRepository.save({
            id: tx.id,
            userId: tx.userId || currentUser.id,
            type: tx.type,
            coin: tx.coin,
            amount: tx.amount,
            status: tx.status,
            method: tx.method,
            createdAt: tx.createdAt,
            description: tx.description,
            bonus: tx.bonus,
            balanceAfter: tx.balanceAfter,
          });
        }
        return res.results;
      }
    } catch (err) {
      console.error('getTransactions API error, using local fallback:', err);
    }
  }
  return userId ? transactionRepository.listByUser(userId) : transactionRepository.list();
};

export const getTransactionById = async (id) => {
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token) {
    try {
      const res = await fetchTransactionDetail(id, currentUser.token);
      if (res.success && res.transaction) {
        return res.transaction;
      }
    } catch (err) {
      console.error('getTransactionById API error, using local fallback:', err);
    }
  }
  return transactionRepository.findById(id);
};
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
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.token && String(id).startsWith('dep-')) {
    const pk = String(id).split('-')[1];
    if (pk && !isNaN(pk)) {
      try {
        const res = await updateTransactionStatusApi(pk, status, currentUser.token);
        if (res.success) {
          const current = await transactionRepository.findById(id);
          if (current) {
            const updated = { ...current, status, updatedAt: formatIsoDate() };
            await transactionRepository.save(updated);
            return { success: true, transaction: updated, alreadyProcessed: false };
          }
          return { success: true, transaction: { id, status }, alreadyProcessed: false };
        } else {
          return { success: false, message: res.message || 'Lỗi cập nhật trạng thái giao dịch trên server.' };
        }
      } catch (err) {
        console.error('updateTransactionStatus API failed:', err);
      }
    }
  }

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
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.token) {
      try {
        const res = await topupCoins({
          transactionId: id,
          coin: Number(coin),
          bonus: Number(bonus),
          price: Number(price),
          method: method || 'MoMo',
        }, currentUser.token);

        if (res.success && res.transaction) {
          // Sync local storage user balance
          const updatedUser = {
            ...currentUser,
            coinBalance: Number(res.balance),
          };
          await userRepository.save(updatedUser);
          await setCurrentUser(updatedUser);

          // Save transaction locally for offline use
          await transactionRepository.save({
            id: id,
            userId: currentUser.id,
            type: 'deposit',
            coin: Number(coin) + Number(bonus),
            amount: Number(price),
            status: 'success',
            method: method || 'MoMo',
            createdAt: res.transaction.createdAt || formatIsoDate(),
            description: `Nạp ${coin} xu${bonus ? ` + ${bonus} xu thưởng` : ''}`,
            bonus: Number(bonus),
            balanceAfter: res.balance,
          });

          return {
            transaction: res.transaction,
            balance: res.balance,
            alreadyProcessed: res.alreadyProcessed || false,
          };
        } else {
          throw new Error(res.message || 'Không thể hoàn tất giao dịch trên máy chủ backend.');
        }
      } catch (err) {
        console.error('completeCoinTopup API error, falling back to local storage:', err);
      }
    }

    const existing = await transactionRepository.findById(id);
    if (existing?.status === 'success') {
      const u = await userRepository.findById(userId);
      return { transaction: existing, balance: Number(u?.coinBalance || 0), alreadyProcessed: true };
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
    [STORAGE_KEYS.USERS, []],
    [STORAGE_KEYS.BOOKS, []],
    [STORAGE_KEYS.CHAPTERS, []],
    [STORAGE_KEYS.SAVED_BOOKS, []],
    [STORAGE_KEYS.READING_PROGRESS, []],
    [STORAGE_KEYS.PURCHASED_CHAPTERS, []],
    [STORAGE_KEYS.REVIEWS, []],
    [STORAGE_KEYS.TRANSACTIONS, []],
    [STORAGE_KEYS.ARTICLES, []],
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
