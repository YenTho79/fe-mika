import AsyncStorage from '@react-native-async-storage/async-storage';

const parseValue = (rawValue, fallback) => {
  if (rawValue == null) return fallback;

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn('Dữ liệu local không hợp lệ, sử dụng giá trị mặc định.', error);
    return fallback;
  }
};

export const localStorageService = {
  async get(key, fallback = null) {
    const value = await AsyncStorage.getItem(key);
    return parseValue(value, fallback);
  },

  async set(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return value;
  },

  async remove(key) {
    await AsyncStorage.removeItem(key);
  },

  async setMany(entries) {
    await AsyncStorage.multiSet(entries.map(([key, value]) => [key, JSON.stringify(value)]));
  },

  async removeMany(keys) {
    await AsyncStorage.multiRemove(keys);
  },
};

export default localStorageService;
