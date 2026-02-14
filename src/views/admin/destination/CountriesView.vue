<template>
  <div class="countries-container">
    <!-- 헤더 -->
    <div class="page-header">
      <h1 class="text-xl font-semibold text-gray-900">나라 관리</h1>
      <div class="header-buttons">
        <!-- 등록 버튼 -->
        <button
          type="button"
          class="px-4 py-2 bg-primary-500 text-white rounded transition-colors text-sm"
        >
          나라 등록
        </button>
      </div>
    </div>

    <!-- 컨텐츠 -->
    <div class="content-area">
      <p class="text-gray-600">나라 관리 페이지입니다.</p>
    </div>
  </div>
</template>

<script setup>
// 추후 기능 추가 예정
</script>

<style scoped>
.countries-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
