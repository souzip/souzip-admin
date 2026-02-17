import { ref, reactive } from 'vue'
import client from '@/api/Client'

export function useDestination() {
  const loading = ref(false)
  const errorMessage = ref('')

  // ─── 나라 목록 ────────────────────────────────────────────────────────
  const countries = ref([])

  async function getCountries() {
    try {
      const res = await client.get('/api/admin/countries')
      countries.value = res.data.data ?? []
      return countries.value
    } catch (err) {
      errorMessage.value = err?.response?.data?.message || '나라 목록 조회에 실패했습니다.'
      throw err
    }
  }

  // ─── 도시 목록 (페이징) ───────────────────────────────────────────────
  async function fetchCitiesPage(countryId, keyword, pageNo, pageSize = 20) {
    const params = { countryId, pageNo, pageSize }
    if (keyword?.trim()) params.keyword = keyword.trim()
    const res = await client.get('/api/admin/cities', { params })
    return res.data.data // { content, pagination }
  }

  // ─── 도시 추가 ────────────────────────────────────────────────────────
  const cityForm = reactive({
    nameEn: '',
    nameKr: '',
    latitude: '',
    longitude: '',
    countryId: null,
  })

  const cityFormError = ref('')

  function validateCityForm() {
    cityFormError.value = ''
    if (!cityForm.nameEn.trim()) {
      cityFormError.value = '영문 도시명을 입력해주세요.'
      return false
    }
    if (!cityForm.nameKr.trim()) {
      cityFormError.value = '한글 도시명을 입력해주세요.'
      return false
    }
    const lat = parseFloat(cityForm.latitude)
    if (cityForm.latitude === '' || isNaN(lat) || lat < -90 || lat > 90) {
      cityFormError.value = '위도를 올바르게 입력해주세요. (-90 ~ 90)'
      return false
    }
    const lng = parseFloat(cityForm.longitude)
    if (cityForm.longitude === '' || isNaN(lng) || lng < -180 || lng > 180) {
      cityFormError.value = '경도를 올바르게 입력해주세요. (-180 ~ 180)'
      return false
    }
    if (!cityForm.countryId) {
      cityFormError.value = '나라를 선택해주세요.'
      return false
    }
    return true
  }

  async function createCity() {
    loading.value = true
    cityFormError.value = ''
    try {
      await client.post('/api/admin/cities', {
        nameEn: cityForm.nameEn.trim(),
        nameKr: cityForm.nameKr.trim(),
        latitude: parseFloat(cityForm.latitude),
        longitude: parseFloat(cityForm.longitude),
        countryId: cityForm.countryId,
      })
      resetCityForm()
    } catch (err) {
      cityFormError.value = err?.response?.data?.message || '도시 추가에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetCityForm() {
    cityForm.nameEn = ''
    cityForm.nameKr = ''
    cityForm.latitude = ''
    cityForm.longitude = ''
    cityForm.countryId = null
    cityFormError.value = ''
  }

  async function deleteCity(cityId) {
    await client.delete(`/api/admin/cities/${cityId}`)
  }

  async function deleteCities(cityIds) {
    loading.value = true
    errorMessage.value = ''
    try {
      await Promise.all(cityIds.map((id) => deleteCity(id)))
      return { success: true, count: cityIds.length }
    } catch (err) {
      errorMessage.value = err?.response?.data?.message || '도시 삭제에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ─── 우선순위 설정 ────────────────────────────────────────────────────
  async function updateCityPriority(cityId, priority) {
    errorMessage.value = ''
    try {
      const params = new URLSearchParams()
      if (priority !== null && priority !== '' && priority !== undefined) {
        params.append('priority', priority)
      }
      await client.patch(`/api/admin/cities/${cityId}/priority`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    } catch (err) {
      errorMessage.value = err?.response?.data?.message || '우선순위 업데이트에 실패했습니다.'
      throw err
    }
  }

  return {
    loading,
    errorMessage,
    countries,
    getCountries,
    fetchCitiesPage,
    cityForm,
    cityFormError,
    validateCityForm,
    createCity,
    resetCityForm,
    deleteCity,
    deleteCities,
    updateCityPriority,
  }
}
