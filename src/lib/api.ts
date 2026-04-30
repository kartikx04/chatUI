import axios from 'axios'
import type { APIResponse, Chat, ContactList } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: false,
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const apiClient = {
  health: () => api.get('/health'),
  verifyContact: (username: string) =>
    api.get<APIResponse>(`/verify-contact?username=${encodeURIComponent(username)}`),
  addContact: (id: string, contact: string) =>
    api.get<APIResponse>(`/add-contact?id=${id}&contact=${contact}`),
  getContacts: (id: string) =>
    api.get<APIResponse<ContactList[]>>(`/contacts?id=${id}`),
  getChatHistory: (id: string, contact: string, fromTs = '0', toTs = '+inf') =>
    api.get<Chat[]>(`/chat-history?id=${id}&contact=${contact}&from-ts=${fromTs}&to-ts=${toTs}`),
}

export default api