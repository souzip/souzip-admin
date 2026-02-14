import { ref } from 'vue'

export function useInfiniteScroll(options = {}) {
  const {
    pageSize = 20,
    rootMargin = '200px',
    threshold = 0,
    scrollThreshold = 0.85,
    fetchFunction = null,
  } = options

  const loading = ref(false)
  const loadingMore = ref(false)
  const items = ref([])
  const currentPage = ref(1)
  const hasMore = ref(true)
  const error = ref(null)

  const scrollContainer = ref(null)
  const sentinel = ref(null)
  let observer = null

  // Intersection Observer 설정
  function setupIntersectionObserver() {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore.value && !loadingMore.value && !loading.value) {
          loadMore()
        }
      },
      {
        root: scrollContainer.value,
        rootMargin,
        threshold,
      }
    )

    if (sentinel.value) {
      observer.observe(sentinel.value)
    }
  }

  // 스크롤 이벤트 핸들러 (백업용)
  function handleScroll() {
    if (!scrollContainer.value || loadingMore.value || !hasMore.value || loading.value) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    if (scrollPercentage > scrollThreshold) {
      loadMore()
    }
  }

  // 데이터 로드
  async function loadItems() {
    if (loading.value || loadingMore.value || !fetchFunction) return

    const isInitialLoad = currentPage.value === 1

    if (isInitialLoad) {
      loading.value = true
    } else {
      loadingMore.value = true
    }

    error.value = null

    try {
      const response = await fetchFunction(currentPage.value, pageSize)

      const newItems = response.content || []
      const pagination = response.pagination || {}

      if (isInitialLoad) {
        items.value = newItems
      } else {
        items.value = [...items.value, ...newItems]
      }

      hasMore.value = pagination.hasNext || false
    } catch (err) {
      error.value = err
      console.error('데이터 로드 실패:', err)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  // 더 보기
  async function loadMore() {
    if (!hasMore.value || loadingMore.value || loading.value) return

    currentPage.value++
    await loadItems()
  }

  // 초기화 및 로드
  async function resetAndLoad() {
    currentPage.value = 1
    items.value = []
    hasMore.value = true
    error.value = null
    await loadItems()
  }

  // 초기화
  function initialize() {
    loadItems()

    setTimeout(() => {
      setupIntersectionObserver()
    }, 100)
  }

  // 정리
  function cleanup() {
    if (observer) {
      observer.disconnect()
    }
  }

  return {
    // 상태
    loading,
    loadingMore,
    items,
    currentPage,
    hasMore,
    error,

    // Refs
    scrollContainer,
    sentinel,

    // 메서드
    handleScroll,
    loadMore,
    resetAndLoad,
    initialize,
    cleanup,
  }
}
