import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Kiểm tra thiết bị có hỗ trợ sinh trắc học và đã đăng ký dữ liệu không
 * @returns {Promise<boolean>}
 */
export async function isBiometricAvailable() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch {
    return false;
  }
}

/**
 * Luôn trả về tên chung "Sinh trắc học" để hiển thị thống nhất
 * bất kể thiết bị dùng vân tay, Face ID hay mống mắt.
 * @returns {Promise<string>}
 */
export async function getBiometricTypeName() {
  return 'Sinh trắc học';
}

/**
 * Trả về icon chung cho sinh trắc học (dùng finger-print làm biểu tượng phổ quát).
 * @returns {Promise<string>}
 */
export async function getBiometricIcon() {
  return 'finger-print';
}

/**
 * Kiểm tra người dùng đã bật đăng nhập sinh trắc học chưa
 * @returns {Promise<boolean>}
 */
export async function isBiometricEnabled() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Lưu credentials và bật tính năng sinh trắc học
 * @param {string} email
 * @param {string} password
 * @returns {Promise<boolean>} true nếu thành công
 */
export async function enableBiometric(email, password) {
  try {
    const credentials = JSON.stringify({ email, password });
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.BIOMETRIC_ENABLED, 'true'],
      [STORAGE_KEYS.BIOMETRIC_CREDENTIALS, credentials],
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Tắt sinh trắc học và xóa credentials đã lưu
 * @returns {Promise<boolean>}
 */
export async function disableBiometric() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      STORAGE_KEYS.BIOMETRIC_CREDENTIALS,
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lấy credentials đã lưu để tự động đăng nhập
 * @returns {Promise<{email: string, password: string} | null>}
 */
export async function getBiometricCredentials() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_CREDENTIALS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Xác thực sinh trắc học với người dùng
 * @param {string} promptMessage Tin nhắn hiển thị trên dialog xác thực
 * @returns {Promise<{success: boolean, error?: string, isFallback?: boolean}>}
 */
export async function authenticateWithBiometric(promptMessage = 'Xác thực để đăng nhập vào Mika Books') {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Hủy',
      fallbackLabel: 'Dùng mật khẩu',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    }

    const errorMap = {
      UserCancel: 'Bạn đã hủy xác thực.',
      UserFallback: 'FALLBACK',
      SystemCancel: 'Hệ thống đã hủy xác thực.',
      PasscodeNotSet: 'Thiết bị chưa thiết lập mã PIN.',
      BiometryNotAvailable: 'Sinh trắc học không khả dụng.',
      BiometryNotEnrolled: 'Chưa đăng ký dữ liệu sinh trắc.',
      BiometryLockout: 'Sinh trắc bị khóa tạm thời do quá nhiều lần thử. Vui lòng dùng mật khẩu.',
    };

    return {
      success: false,
      error: errorMap[result.error] || 'Xác thực thất bại.',
      isFallback: result.error === 'UserFallback',
    };
  } catch {
    return { success: false, error: 'Không thể xác thực sinh trắc học.' };
  }
}
