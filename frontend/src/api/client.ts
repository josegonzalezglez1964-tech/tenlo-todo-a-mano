import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// En Termux + Expo Go en el mismo móvil, 127.0.0.1 apunta al propio dispositivo.
export const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(username: string, password: string) {
  const response = await api.post('/api/token/', { username, password });
  await AsyncStorage.setItem('access_token', response.data.access);
  await AsyncStorage.setItem('refresh_token', response.data.refresh);
}

export async function logout() {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
}

export async function isLoggedIn() {
  const token = await AsyncStorage.getItem('access_token');
  return !!token;
}
