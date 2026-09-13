import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getBooks } from '../services/localDataService';

export const useLocalBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setBooks(await getBooks());
    } catch (loadError) {
      console.error(loadError);
      setError('Không thể đọc danh sách truyện trên thiết bị.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadBooks(); }, [loadBooks]));
  return { books, loading, error, reload: loadBooks };
};
