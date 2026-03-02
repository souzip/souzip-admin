<template>
  <div class="custom-select" :class="{ open: isOpen, disabled: disabled }" ref="containerRef">
    <!-- 트리거 버튼 -->
    <button type="button" class="select-trigger" :disabled="disabled" @click="toggleOpen">
      <span class="select-value">{{ selectedLabel }}</span>
      <svg
        class="select-arrow"
        :class="{ rotated: isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 드롭다운: body에 텔레포트 -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="isOpen" class="select-dropdown" :style="dropdownStyle">
          <!-- 검색창 추가 -->
          <div class="search-wrapper">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="나라명 검색"
              @click.stop
              @keydown.esc="isOpen = false"
            />
          </div>

          <ul class="select-list" role="listbox">
            <!-- 검색 결과 없음 -->
            <li v-if="filteredOptions.length === 0" class="empty-option">검색 결과가 없습니다.</li>

            <!-- 필터링된 옵션 표시 -->
            <li
              v-for="option in filteredOptions"
              :key="option[valueKey]"
              class="select-option"
              :class="{ selected: modelValue === option[valueKey] }"
              role="option"
              :aria-selected="modelValue === option[valueKey]"
              @click="selectOption(option)"
            >
              <span class="option-label">{{ option[labelKey] }}</span>
              <svg
                v-if="modelValue === option[valueKey]"
                class="option-check"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String, null],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  valueKey: {
    type: String,
    default: 'id',
  },
  labelKey: {
    type: String,
    default: 'nameKr',
  },
  placeholder: {
    type: String,
    default: '선택해주세요',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const containerRef = ref(null)
const searchInputRef = ref(null)
const dropdownStyle = ref({})
const searchQuery = ref('')

const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return props.placeholder
  }
  const found = props.options.find((o) => o[props.valueKey] === props.modelValue)
  return found ? found[props.labelKey] : props.placeholder
})

// 필터링된 옵션
const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter((option) => {
    const label = option[props.labelKey]?.toLowerCase() || ''
    return label.includes(query)
  })
})

// 트리거 위치 기준으로 드롭다운 좌표 계산
function calcDropdownStyle() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  }
}

async function toggleOpen() {
  if (props.disabled) return
  if (!isOpen.value) {
    searchQuery.value = '' // 검색어 초기화
    calcDropdownStyle()
    await nextTick()
    isOpen.value = true
    // 검색창에 자동 포커스
    await nextTick()
    searchInputRef.value?.focus()
  } else {
    isOpen.value = false
  }
}

function selectOption(option) {
  emit('update:modelValue', option[props.valueKey])
  emit('change', option[props.valueKey])
  isOpen.value = false
  searchQuery.value = '' // 검색어 초기화
}

function handleOutsideClick(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
    searchQuery.value = '' // 검색어 초기화
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    isOpen.value = false
    searchQuery.value = '' // 검색어 초기화
  }
}

// 스크롤/리사이즈 시 위치 재계산
function handleScrollOrResize() {
  if (isOpen.value) calcDropdownStyle()
}

// isOpen이 닫힐 때 검색어 초기화
watch(isOpen, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
  }
})

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<style scoped>
.custom-select {
  position: relative;
  display: inline-block;
  min-width: 240px;
  user-select: none;
}

/* 트리거 */
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 10px 8px 12px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  color: #111827;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  white-space: nowrap;
}

.open .select-trigger {
  border-color: #ff7738;
  box-shadow: 0 0 0 2px rgba(255, 119, 56, 0.2);
}

.select-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.select-value {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-arrow {
  width: 15px;
  height: 15px;
  color: #6b7280;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

/* 드롭다운 */
.select-dropdown {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* 검색창 영역 */
.search-wrapper {
  padding: 8px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
  background: #fff;
}

.search-input:focus {
  border-color: #ff7738;
  box-shadow: 0 0 0 2px rgba(255, 119, 56, 0.1);
}

/* 옵션 리스트 */
.select-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 4px;
}

.select-list::-webkit-scrollbar {
  width: 4px;
}

.select-list::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 4px;
}

/* 옵션 항목 */
.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 7px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background 0.1s;
}

.select-option:hover {
  background: #f3f4f6;
}

.select-option.selected {
  background: #fff5f0;
  color: #ff7738;
  font-weight: 500;
}

.select-option.selected:hover {
  background: #ffe8dc;
}

.option-label {
  flex: 1;
}

.option-check {
  width: 15px;
  height: 15px;
  color: #ff7738;
  flex-shrink: 0;
}

/* 검색 결과 없음 */
.empty-option {
  padding: 20px 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* 드롭다운 애니메이션 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
