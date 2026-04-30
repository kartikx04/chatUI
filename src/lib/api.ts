import axios from 'axios'
import type { APIResponse, Chat, ContactList } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true, // ← was false, breaks JWT cookie
})

export const apiClient = {
  health: () => api.get('/health'),

  verifyContact: (username: string) =>
    api.get<APIResponse>(`/verify-contact?username=${encodeURIComponent(username)}`),

  addContact: (id: string, contact: string) =>
    api.get<APIResponse>(`/add-contact?id=${id}&contact=${contact}`),

  getContacts: (id: string) =>
    api.get<APIResponse<ContactList[]>>(`/contacts?id=${id}`),

  // ← was u1/u2, now id/contact to match backend
  getChatHistory: (id: string, contact: string, fromTs = '0', toTs = '+inf') =>
    api.get<Chat[]>(
      `/chat-history?id=${id}&contact=${contact}&from-ts=${fromTs}&to-ts=${toTs}`
    ),
}

export default api