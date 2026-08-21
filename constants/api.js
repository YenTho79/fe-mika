import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Tự động lấy IP của máy tính đang chạy Expo để thiết bị thật (Android/iOS) kết nối được
const getDevServerIp = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0].trim();
  }
  return '192.168.1.8';
};

const DEV_IP = getDevServerIp();

// API Base URL Configuration
export const API_BASE_URL = Platform.select({
  web: 'http://192.168.1.8:8000/api',
  default: `http://${DEV_IP}:8000/api`,
});

// Helper fetch với Timeout 8 giây để tránh treo lâu khi server không phản hồi
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw error;
  }
}

// Helper phân tích phản hồi JSON an toàn tránh lỗi parse HTML
async function safeParseJson(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let message = `Lỗi từ máy chủ (${response.status})`;
    if (isJson) {
      try {
        const errData = await response.json();
        message = errData.message || message;
      } catch (e) {
        // bỏ qua lỗi parse json khi server trả về lỗi không đúng dạng
      }
    }
    return { success: false, message };
  }

  if (!isJson) {
    throw new Error(`Định dạng phản hồi không hợp lệ (Mong đợi JSON, nhận được: ${contentType})`);
  }

  return await response.json();
}

/**
 * Call Login API endpoint: POST /api/login/
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function loginUser(email, password) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
      }),
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API login error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s). Vui lòng kiểm tra xem server backend Django đã bật chưa hoặc kiểm tra lại địa chỉ IP.'
        : 'Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra xem server backend Django đang chạy hay chưa.',
    };
  }
}

/**
 * Call Register API endpoint: POST /api/register/
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function registerUser(name, email, password) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ho_ten: name.trim(),
        email: email.trim(),
        password: password,
      }),
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API register error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s). Vui lòng kiểm tra xem server backend Django đã bật chưa hoặc kiểm tra lại địa chỉ IP.'
        : 'Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra xem server backend Django đang chạy hay chưa.',
    };
  }
}

/**
 * Call List Stories API endpoint: GET /api/stories/ or GET /api/stories/?q=query
 * @param {string} search 
 * @returns {Promise<{success: boolean, results?: Array, message?: string}>}
 */
export async function fetchStories(search = '') {
  try {
    const url = search ? `${API_BASE_URL}/stories/?q=${encodeURIComponent(search)}` : `${API_BASE_URL}/stories/`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchStories error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể kết nối đến máy chủ backend.',
    };
  }
}

/**
 * Call Story Detail API endpoint: GET /api/stories/:id/
 * @param {number|string} id 
 * @returns {Promise<{success: boolean, story?: object, message?: string}>}
 */
export async function fetchStoryDetail(id) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/stories/${id}/`, {
      method: 'GET',
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchStoryDetail error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể kết nối đến máy chủ backend.',
    };
  }
}

/**
 * Call Chapter Detail API endpoint: GET /api/chuong/:id/
 * @param {number|string} id 
 * @param {string} token
 * @returns {Promise<{success: boolean, chapter?: object, message?: string}>}
 */
export async function fetchChapterDetail(id, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    const response = await fetchWithTimeout(`${API_BASE_URL}/chuong/${id}/`, {
      method: 'GET',
      headers,
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchChapterDetail error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể kết nối đến máy chủ backend.',
    };
  }
}

/**
 * Helper to ensure image URLs are valid for React Native Image component
 * @param {string} url 
 * @param {string} fallback 
 * @returns {string}
 */
export function getImageUrl(url, fallback = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop') {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  const hostBase = API_BASE_URL.replace(/\/api\/?$/, '');
  if (cleanUrl.startsWith('/')) {
    return `${hostBase}${cleanUrl}`;
  }
  return `${hostBase}/${cleanUrl}`;
}

/**
 * Call Upgrade VIP API endpoint: POST /api/user/upgrade-vip/
 * @param {string} token 
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function upgradeUserVip(token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/user/upgrade-vip/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API upgrade VIP error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể kết nối đến máy chủ backend.',
    };
  }
}

/**
 * Call Unlock Chapter API endpoint: POST /api/chapters/:chapterId/unlock/
 * @param {number|string} chapterId 
 * @param {string} token 
 * @returns {Promise<{success: boolean, message?: string, so_du_xu?: number}>}
 */
export async function unlockChapter(chapterId, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/chapters/${chapterId}/unlock/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API unlock chapter error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể kết nối đến máy chủ backend.',
    };
  }
}

/**
 * Call List Transactions API endpoint: GET /api/transactions/
 * @param {string} token 
 * @returns {Promise<{success: boolean, results?: Array, message?: string}>}
 */
export async function fetchTransactions(token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/transactions/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchTransactions error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể kết nối đến máy chủ backend.',
    };
  }
}

/**
 * Call Get Transaction Detail API endpoint: GET /api/transactions/:id/
 * @param {string} id 
 * @param {string} token 
 * @returns {Promise<{success: boolean, transaction?: object, message?: string}>}
 */
export async function fetchTransactionDetail(id, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/transactions/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchTransactionDetail error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể kết nối đến máy chủ backend.',
    };
  }
}

/**
 * Call Topup Coin API endpoint: POST /api/transactions/topup/
 * @param {object} params 
 * @param {string} token 
 * @returns {Promise<{success: boolean, balance?: number, transaction?: object, alreadyProcessed?: boolean, message?: string}>}
 */
export async function topupCoins({ transactionId, coin, bonus, price, method }, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/transactions/topup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        transactionId,
        coin,
        bonus,
        price,
        method,
      }),
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API topupCoins error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể nạp xu. Kết nối đến máy chủ backend thất bại.',
    };
  }
}

/**
 * Fetch dynamic user profile from backend: GET /api/user/profile/
 * @param {string} token
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function fetchUserProfile(token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/user/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchUserProfile error:', error);
    const isTimeout = error.message === 'TIMEOUT';
    return {
      success: false,
      message: isTimeout
        ? 'Kết nối quá thời gian chờ (Timeout 8s).'
        : 'Không thể tải thông tin cá nhân. Kết nối thất bại.',
    };
  }
}

/**
 * Fetch dashboard statistics for administrator: GET /api/admin/stats/
 * @param {string} token
 * @returns {Promise<{success: boolean, stats?: object, message?: string}>}
 */
export async function fetchAdminStats(token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/stats/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchAdminStats error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch all users list: GET /api/admin/users/
 * @param {string} token
 * @returns {Promise<{success: boolean, results?: Array, message?: string}>}
 */
export async function fetchAdminUsers(token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/users/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchAdminUsers error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Block/unblock a user status: POST /api/admin/users/:userId/toggle-status/
 * @param {number|string} userId
 * @param {string} token
 * @returns {Promise<{success: boolean, status?: string, message?: string}>}
 */
export async function toggleUserStatusApi(userId, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/users/${userId}/toggle-status/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API toggleUserStatusApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Adjust user's coin balance: POST /api/admin/users/:userId/adjust-coins/
 * @param {object} params { userId, amount, reason }
 * @param {string} token
 * @returns {Promise<{success: boolean, balance?: number, message?: string}>}
 */
export async function adjustUserCoinsApi({ userId, amount, reason }, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/users/${userId}/adjust-coins/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ amount, reason }),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API adjustUserCoinsApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a new story/book: POST /api/admin/stories/
 * @param {object} storyData
 * @param {string} token
 * @returns {Promise<{success: boolean, story?: object, message?: string}>}
 */
export async function createStoryApi(storyData, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/stories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(storyData),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API createStoryApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update a story/book: PUT /api/admin/stories/:id/
 * @param {number|string} storyId
 * @param {object} storyData
 * @param {string} token
 * @returns {Promise<{success: boolean, story?: object, message?: string}>}
 */
export async function updateStoryApi(storyId, storyData, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/stories/${storyId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(storyData),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API updateStoryApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a story/book: DELETE /api/admin/stories/:id/
 * @param {number|string} storyId
 * @param {string} token
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteStoryApi(storyId, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/stories/${storyId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API deleteStoryApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * List chapters (optionally filter by story/book): GET /api/admin/chapters/?bookId=:bookId
 * @param {number|string} bookId
 * @param {string} token
 * @returns {Promise<{success: boolean, results?: Array, message?: string}>}
 */
export async function fetchAdminChapters(bookId, token) {
  try {
    const url = bookId ? `${API_BASE_URL}/admin/chapters/?bookId=${bookId}` : `${API_BASE_URL}/admin/chapters/`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchAdminChapters error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a new chapter: POST /api/admin/chapters/create/
 * @param {object} chapterData
 * @param {string} token
 * @returns {Promise<{success: boolean, chapter?: object, message?: string}>}
 */
export async function createChapterApi(chapterData, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/chapters/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(chapterData),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API createChapterApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update a chapter: PUT /api/admin/chapters/:id/
 * @param {number|string} chapterId
 * @param {object} chapterData
 * @param {string} token
 * @returns {Promise<{success: boolean, chapter?: object, message?: string}>}
 */
export async function updateChapterApi(chapterId, chapterData, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/chapters/${chapterId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(chapterData),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API updateChapterApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a chapter: DELETE /api/admin/chapters/:id/
 * @param {number|string} chapterId
 * @param {string} token
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteChapterApi(chapterId, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/chapters/${chapterId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API deleteChapterApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Move/reorder a chapter: POST /api/admin/chapters/:id/move/
 * @param {number|string} chapterId
 * @param {string} direction 'up' | 'down'
 * @param {string} token
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function moveChapterApi(chapterId, direction, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/chapters/${chapterId}/move/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ direction }),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API moveChapterApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update transaction status on backend: POST /api/admin/transactions/:txId/status/
 * @param {number|string} txId
 * @param {string} status 'success' | 'failed'
 * @param {string} token
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function updateTransactionStatusApi(txId, status, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/transactions/${txId}/status/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API updateTransactionStatusApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Fetch reviews: GET /api/reviews/?bookId=:bookId
 * @param {number|string|null} bookId
 * @returns {Promise<{success: boolean, results?: Array, message?: string}>}
 */
export async function fetchReviewsApi(bookId = null) {
  try {
    const url = bookId ? `${API_BASE_URL}/reviews/?bookId=${bookId}` : `${API_BASE_URL}/reviews/`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API fetchReviewsApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Create a review: POST /api/reviews/
 * @param {object} reviewData
 * @param {string} token
 * @returns {Promise<{success: boolean, review?: object, message?: string}>}
 */
export async function createReviewApi(reviewData, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reviews/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API createReviewApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update a review: PUT/PATCH /api/reviews/:id/
 * @param {number|string} reviewId
 * @param {object} changes
 * @param {string} token
 * @returns {Promise<{success: boolean, review?: object, message?: string}>}
 */
export async function updateReviewApi(reviewId, changes, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reviews/${reviewId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(changes),
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API updateReviewApi error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete a review: DELETE /api/reviews/:id/
 * @param {number|string} reviewId
 * @param {string} token
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteReviewApi(reviewId, token) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/reviews/${reviewId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return await safeParseJson(response);
  } catch (error) {
    console.error('API deleteReviewApi error:', error);
    return { success: false, message: error.message };
  }
}
