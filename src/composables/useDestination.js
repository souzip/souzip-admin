import { ref } from 'vue'
import client from '@/api/Client'

export function useDestination() {
  const errorMessage = ref('')
  const countries = ref([])

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

  async function createCity(data) {
    const res = await client.post('/api/admin/cities', data)
    return res.data
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
    countries,
    getCountries,
    fetchCitiesPage,
    createCity,
    updateCity,
    deleteCities,
    updateCityPriority,
  }
}
