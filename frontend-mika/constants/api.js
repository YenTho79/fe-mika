import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Tự động lấy IP của máy tính đang chạy Expo để thiết bị thật (Android/iOS) kết nối được
const getDevServerIp = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.69.121';
};

const DEV_IP = getDevServerIp();

// API Base URL Configuration
export const API_BASE_URL = Platform.select({
  web: 'http://192.168.69.121:8000/api',
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

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Lỗi kết nối máy chủ (${response.status})`,
      };
    }

    return data;
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

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Lỗi kết nối máy chủ (${response.status})`,
      };
    }

    return data;
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

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Lỗi kết nối máy chủ (${response.status})`,
      };
    }

    return data;
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

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Lỗi kết nối máy chủ (${response.status})`,
      };
    }

    return data;
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

