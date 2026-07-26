import localStorageService from '../localStorageService';

export const createRepository = (storageKey) => ({
  async list() {
    return localStorageService.get(storageKey, []);
  },

  async findById(id) {
    const items = await this.list();
    return items.find((item) => String(item.id) === String(id)) || null;
  },

  async save(item) {
    const items = await this.list();
    const index = items.findIndex((entry) => String(entry.id) === String(item.id));
    if (index >= 0) items[index] = { ...items[index], ...item };
    else items.push(item);
    await localStorageService.set(storageKey, items);
    return item;
  },

  async remove(id) {
    const items = await this.list();
    const nextItems = items.filter((item) => String(item.id) !== String(id));
    await localStorageService.set(storageKey, nextItems);
    return nextItems;
  },
});
