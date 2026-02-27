import { ref, reactive } from 'vue'
import client from '@/api/Client'

export function useDestination() {
  const errorMessage = ref('')
  const loading = ref(false)
  const countries = ref([])

  const cityForm = reactive({
    countryId: null,
    nameKr: '',
    nameEn: '',
    latitude: '',
    longitude: '',
  })

  const cityFormError = ref('')

  function resetCityForm() {
    cityForm.countryId = null
    cityForm.nameKr = ''
    cityForm.nameEn = ''
    cityForm.latitude = ''
    cityForm.longitude = ''
    cityFormError.value = ''
  }

  function validateCityForm() {
    cityFormError.value = ''
    if (!cityForm.countryId) {
      cityFormError.value = '나라를 선택해주세요.'
      return false
    }
    if (!cityForm.nameKr.trim()) {
      cityFormError.value = '한글 도시명을 입력해주세요.'
      return false
    }
    if (!cityForm.nameEn.trim()) {
      cityFormError.value = '영문 도시명을 입력해주세요.'
      return false
    }
    if (!cityForm.latitude) {
      cityFormError.value = '위도를 입력해주세요.'
      return false
    }
    if (!cityForm.longitude) {
      cityFormError.value = '경도를 입력해주세요.'
      return false
    }
    return true
  }

  async function getCountries(keyword = null) {
    try {
      const params = {}
      if (keyword?.trim()) {
        params.keyword = keyword.trim()
      }
      const res = await client.get('/api/admin/countries', { params })
      countries.value = res.data.data ?? []
      return countries.value
    } catch (err) {
      errorMessage.value = err?.response?.data?.message || '나라 목록 조회에 실패했습니다.'
      throw err
    }
  }

  async function fetchCitiesPage(countryId, keyword, pageNo, pageSize) {
    const params = { countryId, pageNo, pageSize }
    if (keyword?.trim()) {
      params.keyword = keyword.trim()
    }
    const res = await client.get('/api/admin/cities', { params })
    return res.data.data
  }

  async function createCity() {
    loading.value = true
    try {
      const res = await client.post('/api/admin/cities', {
        countryId: cityForm.countryId,
        nameKr: cityForm.nameKr.trim(),
        nameEn: cityForm.nameEn.trim(),
        latitude: Number(cityForm.latitude),
        longitude: Number(cityForm.longitude),
      })
      return res.data
    } catch (err) {
      cityFormError.value = err?.response?.data?.message || '도시 등록에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCity(cityId, data) {
    const res = await client.patch(`/api/admin/cities/${cityId}/name`, data)
    return res.data
  }

  async function deleteCities(cityIds) {
    const deletePromises = cityIds.map((id) => client.delete(`/api/admin/cities/${id}`))
    const results = await Promise.all(deletePromises)
    return { success: true, count: results.length }
  }

  async function updateCityPriority(cityId, priority) {
    const res = await client.patch(`/api/admin/cities/${cityId}/priority`, null, {
      params: { priority },
    })
    return res.data
  }

  return {
    errorMessage,
    loading,
    countries,
    cityForm,
    cityFormError,
    getCountries,
    fetchCitiesPage,
    createCity,
    updateCity,
    deleteCities,
    updateCityPriority,
    validateCityForm,
    resetCityForm,
  }
}
