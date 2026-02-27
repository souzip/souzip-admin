import client from '@/api/Client'

export function useNoticeManagement() {
  async function getNotices({ page, size }) {
    const res = await client.get('/api/admin/notices', { params: { page, size } })
    return res.data
  }

  async function createNotice(payload) {
    const res = await client.post('/api/admin/notices', payload)
    return res.data
  }

  async function updateNotice(id, payload) {
    const res = await client.put(`/api/admin/notices/${id}`, payload)
    return res.data
  }

  async function deleteNotices(ids) {
    const res = await client.delete('/api/admin/notices', { data: { ids } })
    return res.data
  }

  return { getNotices, createNotice, updateNotice, deleteNotices }
}
