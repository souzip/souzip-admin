import client from '@/api/Client'

// 전체 목록을 캐시
let allNoticesCache = null
let lastFetchTime = 0
const CACHE_DURATION = 30000 // 30초

export function useNoticeManagement() {
  // 페이지네이션 시뮬레이션 (백엔드는 전체 목록만 반환)
  async function getNotices({ page = 0, size = 20 } = {}) {
    // 캐시 확인
    const now = Date.now()
    if (!allNoticesCache || now - lastFetchTime > CACHE_DURATION) {
      const res = await client.get('/api/admin/notices')
      allNoticesCache = res.data.data || []
      // 최신순 정렬
      allNoticesCache.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      lastFetchTime = now
    }

    // 클라이언트 페이지네이션
    const start = page * size
    const end = start + size
    const content = allNoticesCache.slice(start, end)

    // ✅ data 래퍼 제거 - useInfiniteScroll이 직접 content와 pagination에 접근 가능
    return {
      content,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(allNoticesCache.length / size),
        totalItems: allNoticesCache.length,
        pageSize: size,
        first: page === 0,
        last: end >= allNoticesCache.length,
        hasNext: end < allNoticesCache.length,
        hasPrevious: page > 0,
      },
    }
  }

  // 공지사항 등록 (multipart/form-data)
  async function createNotice({ title, content, status, files }) {
    const formData = new FormData()

    const noticeData = { title, content, status: status || 'ACTIVE' }
    formData.append('notice', new Blob([JSON.stringify(noticeData)], { type: 'application/json' }))

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file)
      })
    }

    // 캐시 무효화
    allNoticesCache = null

    const res = await client.post('/api/admin/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  }

  // 공지사항 수정 (multipart/form-data)
  async function updateNotice(id, { title, content, status, deleteFileIds, newFiles }) {
    const formData = new FormData()

    const noticeData = { title, content, status }
    formData.append('notice', new Blob([JSON.stringify(noticeData)], { type: 'application/json' }))

    if (deleteFileIds && deleteFileIds.length > 0) {
      formData.append(
        'deleteFileIds',
        new Blob([JSON.stringify(deleteFileIds)], { type: 'application/json' })
      )
    }

    if (newFiles && newFiles.length > 0) {
      newFiles.forEach((file) => {
        formData.append('newFiles', file)
      })
    }

    // 캐시 무효화
    allNoticesCache = null

    const res = await client.put(`/api/admin/notices/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  }

  // 공지사항 삭제 (단일)
  async function deleteNotice(id) {
    const res = await client.delete(`/api/admin/notices/${id}`)
    // 캐시 무효화
    allNoticesCache = null
    return res.data.data
  }

  // 여러 공지사항 삭제 (병렬 처리)
  async function deleteNotices(ids) {
    const promises = ids.map((id) => deleteNotice(id))
    await Promise.all(promises)
    // 캐시 무효화
    allNoticesCache = null
    return { count: ids.length }
  }

  // 공지사항 상세 조회
  async function getNoticeById(id) {
    const res = await client.get(`/api/admin/notices/${id}`)
    return res.data.data
  }

  // 공지사항 활성화
  async function activateNotice(id) {
    const res = await client.patch(`/api/admin/notices/${id}/activate`)
    // 캐시 무효화
    allNoticesCache = null
    return res.data.data
  }

  // 공지사항 비활성화
  async function deactivateNotice(id) {
    const res = await client.patch(`/api/admin/notices/${id}/deactivate`)
    // 캐시 무효화
    allNoticesCache = null
    return res.data.data
  }

  // 공지사항 FCM 푸시 발송
  async function broadcastNotice(title, body) {
    const res = await client.post('/api/admin/push/broadcast', { title, body })
    return res.data
  }

  // 캐시 수동 무효화
  function invalidateCache() {
    allNoticesCache = null
  }

  return {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    deleteNotices,
    getNoticeById,
    activateNotice,
    deactivateNotice,
    broadcastNotice,
    invalidateCache,
  }
}
