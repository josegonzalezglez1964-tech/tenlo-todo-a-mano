import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// En Termux + Expo Go en el mismo móvil, 127.0.0.1 apunta al propio dispositivo.
// En el navegador del Mac, 127.0.0.1 también funciona porque backend y frontend corren en la misma máquina.
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

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  if (!refreshToken) return null;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
      refresh: refreshToken,
    });
    const newAccess = response.data.access;
    await AsyncStorage.setItem('access_token', newAccess);
    return newAccess;
  } catch (error) {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    return null;
  }
}

// Si una petición falla con 401 (token caducado), intenta renovarlo automáticamente
// con el refresh_token y repite la petición original una sola vez.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshWaiters.push((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    refreshWaiters.forEach((waiter) => waiter(newToken));
    refreshWaiters = [];

    if (!newToken) {
      return Promise.reject(error);
    }
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  }
);

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

export type NewDocumentInput = {
  title: string;
  merchant_name: string;
  date: string;
  total: string;
  taxes: string;
  currency: string;
  payment_method: string;
  category: string;
  imageUri?: string | null;
};

// Acepta "15-09-2026" o "15/09/2026" y lo convierte a "2026-09-15" (formato que espera el backend).
function normalizeDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(trimmed);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

// Quita símbolos de moneda, espacios y cambia coma decimal por punto.
function normalizeNumber(raw: string): string {
  return raw.replace(/[^\d,.-]/g, '').replace(',', '.').trim();
}

export async function createDocument(input: NewDocumentInput) {
  const form = new FormData();
  form.append('title', input.title);
  form.append('merchant_name', input.merchant_name);

  const date = normalizeDate(input.date);
  if (date) form.append('date', date);

  const total = normalizeNumber(input.total);
  if (total) form.append('total', total);

  const taxes = normalizeNumber(input.taxes);
  if (taxes) form.append('taxes', taxes);

  form.append('currency', input.currency);
  form.append('payment_method', input.payment_method);
  form.append('category', input.category);

  if (input.imageUri) {
    const filename = input.imageUri.split('/').pop()?.split('?')[0] || 'foto.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    if (Platform.OS === 'web') {
      const response = await fetch(input.imageUri);
      const blob = await response.blob();
      form.append('file', blob, filename);
    } else {
      // @ts-ignore React Native (iOS/Android) acepta este formato de objeto para archivos.
      form.append('file', {
        uri: input.imageUri,
        name: filename,
        type: mime,
      });
    }
  }

  const response = await api.post('/api/documents/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}