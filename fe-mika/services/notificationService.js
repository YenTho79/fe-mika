/**
 * notificationService.js
 * Dịch vụ quản lý tất cả thông báo của Mika Books.
 *
 * NOTE: expo-notifications Remote Push bị loại khỏi Expo Go từ SDK 53+.
 * File này dùng require() an toàn và fallback gracefully để không crash trong Expo Go.
 * Local notification scheduling (nhắc đọc sách) vẫn hoạt động nếu thiết bị hỗ trợ.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { STORAGE_KEYS } from './storageKeys';
import localStorageService from './localStorageService';

// ─── Kiểm tra môi trường trước khi load expo-notifications ───────────────────
// Expo Go từ SDK 53+ loại bỏ remote push, và require() sẽ gây lỗi overlay.
// Chỉ load module khi KHÔNG phải Expo Go.
const IS_EXPO_GO = Constants.appOwnership === 'expo';

let Notifications = null;
let Device = null;

if (!IS_EXPO_GO) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Notifications = require('expo-notifications');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Device = require('expo-device');
  } catch (err) {
    console.warn('[notif] Không load được expo-notifications:', err.message);
  }
} else {
  console.log('[notif] Expo Go — push & local notifications bị tắt. Dùng Development Build để bật đầy đủ.');
}

// ─── Cấu hình handler thông báo (gọi 1 lần khi app khởi động) ────────────────
export function configureNotificationHandler() {
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (err) {
    console.warn('[notif] configureNotificationHandler lỗi:', err.message);
  }
}

// ─── Android notification channel ─────────────────────────────────────────────
async function ensureAndroidChannel() {
  if (!Notifications || Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('mika-default', {
      name: 'Mika Books',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('mika-daily', {
      name: 'Nhắc đọc sách hàng ngày',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  } catch (err) {
    console.warn('[notif] ensureAndroidChannel lỗi:', err.message);
  }
}

// ─── Đăng ký push token và gửi lên backend ───────────────────────────────────

/**
 * Xin quyền thông báo, lấy Expo Push Token và gửi lên backend.
 * Tự động bị bỏ qua khi chạy Expo Go (SDK 53+ không hỗ trợ remote push).
 * @param {string} authToken - api_token của user hiện tại
 * @returns {Promise<string|null>}
 */
export async function registerForPushNotifications(authToken) {
  if (!Notifications || !Device) {
    return null;
  }

  if (IS_EXPO_GO) {
    console.log('[push] Đang chạy Expo Go — remote push không được hỗ trợ từ SDK 53. Cần Development Build.');
    return null;
  }

  try {
    await ensureAndroidChannel();

    if (!Device.isDevice) {
      console.log('[push] Push token chỉ hoạt động trên thiết bị thật.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[push] Người dùng từ chối quyền thông báo.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    if (authToken && pushToken) {
      try {
        const { registerPushToken } = await import('../constants/api');
        await registerPushToken(pushToken, authToken);
        console.log('[push] Đã đăng ký push token:', pushToken);
      } catch (err) {
        console.warn('[push] Không gửi được push token lên backend:', err);
      }
    }

    return pushToken;
  } catch (err) {
    console.warn('[push] registerForPushNotifications lỗi:', err.message);
    return null;
  }
}

// ─── Local Notifications ──────────────────────────────────────────────────────

const DAILY_REMINDER_ID_KEY = 'mika_daily_reminder_id';

/**
 * Lên lịch thông báo nhắc đọc sách hàng ngày.
 * @param {number} hour - Giờ (0-23), mặc định 20
 * @param {number} minute - Phút (0-59), mặc định 0
 * @returns {Promise<string|null>}
 */
export async function scheduleDailyReadingReminder(hour = 20, minute = 0) {
  if (!Notifications) {
    console.warn('[local] expo-notifications không khả dụng.');
    return null;
  }
  try {
    await ensureAndroidChannel();
    await cancelDailyReadingReminder();

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('[local] Không có quyền thông báo.');
      return null;
    }

    const reminderMessages = [
      'Đã đến giờ đọc sách rồi! 📚 Mở Mika Books và tiếp tục câu chuyện của bạn nhé.',
      'Đọc sách 15 phút mỗi ngày giúp bạn thông minh hơn. 🌟 Hãy bắt đầu ngay!',
      'Truyện bạn đang đọc đang chờ. 🔖 Tiếp tục đọc thôi nào!',
      'Nghỉ ngơi với một chương sách hay nhé! ✨',
      'Câu chuyện vẫn đang đợi bạn. 📖 Mở Mika Books ngay!',
    ];
    const body = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];

    const triggerInput = Notifications.SchedulableTriggerInputTypes
      ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute }
      : { hour, minute, repeats: true };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Mika Books — Giờ đọc sách!',
        body,
        data: { route: '/trang-chu', type: 'daily_reminder' },
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'mika-daily' } : {}),
      },
      trigger: triggerInput,
    });

    await localStorageService.set(DAILY_REMINDER_ID_KEY, identifier);
    console.log(`[local] Đã lên lịch nhắc đọc sách lúc ${hour}:${String(minute).padStart(2, '0')} hàng ngày.`);
    return identifier;
  } catch (err) {
    console.warn('[local] scheduleDailyReadingReminder lỗi:', err.message);
    return null;
  }
}

/**
 * Hủy reminder đọc sách hàng ngày đã lên lịch.
 */
export async function cancelDailyReadingReminder() {
  if (!Notifications) return;
  try {
    const identifier = await localStorageService.get(DAILY_REMINDER_ID_KEY, null);
    if (identifier) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      await localStorageService.remove(DAILY_REMINDER_ID_KEY);
    }
  } catch (err) {
    console.warn('[local] cancelDailyReadingReminder lỗi:', err.message);
  }
}

/**
 * Kiểm tra xem có reminder đang hoạt động không.
 * @returns {Promise<boolean>}
 */
export async function isDailyReminderScheduled() {
  if (!Notifications) return false;
  try {
    const identifier = await localStorageService.get(DAILY_REMINDER_ID_KEY, null);
    if (!identifier) return false;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.some((n) => n.identifier === identifier);
  } catch {
    return false;
  }
}

/**
 * Hiển thị thông báo local ngay lập tức.
 * @param {string} title
 * @param {string} body
 * @param {object} data
 */
export async function showImmediateNotification(title, body, data = {}) {
  if (!Notifications) return;
  try {
    await ensureAndroidChannel();
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'mika-default' } : {}),
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[local] showImmediateNotification lỗi:', err.message);
  }
}

// ─── Lưu thông báo vào AsyncStorage ──────────────────────────────────────────

/**
 * Thêm 1 thông báo vào danh sách thông báo local của user.
 * @param {string} userId
 * @param {{ type: string, title: string, message: string, route?: string, params?: object }} notifData
 */
export async function addNotificationToStore(userId, notifData) {
  if (!userId) return;
  try {
    const all = await localStorageService.get(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: String(userId),
      type: notifData.type || 'system',
      title: notifData.title || '',
      message: notifData.message || '',
      route: notifData.route || null,
      params: notifData.params || {},
      read: false,
      createdAt: new Date().toISOString(),
    };
    await localStorageService.set(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...all]);
    return newNotif;
  } catch (err) {
    console.warn('[notif] addNotificationToStore lỗi:', err.message);
  }
}

