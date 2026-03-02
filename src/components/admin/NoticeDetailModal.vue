<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">공지사항 상세</h2>
            <button class="close-button" @click="handleClose">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-section">
              <div class="detail-field">
                <span class="field-label">제목</span>
                <span class="field-value">{{ notice?.title }}</span>
              </div>

              <div class="detail-field">
                <span class="field-label">상태</span>
                <span class="status-badge" :class="getStatus() ? 'status-public' : 'status-hidden'">
                  {{ getStatus() ? '공개' : '숨김' }}
                </span>
              </div>

              <div class="detail-field">
                <span class="field-label">작성자</span>
                <span class="field-value">{{ formatAuthor() }}</span>
              </div>

              <div class="detail-field">
                <span class="field-label">작성일</span>
                <span class="field-value">{{ formatDate(notice?.createdAt) }}</span>
              </div>

              <div class="detail-field">
                <span class="field-label">수정일</span>
                <span class="field-value">{{ formatDate(notice?.updatedAt) }}</span>
              </div>

              <div class="detail-field-full">
                <span class="field-label">내용</span>
                <div class="content-viewer" v-html="getProcessedContent()"></div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-danger" @click="handleDelete">삭제</button>
            <button class="btn btn-primary" @click="handleEdit">수정</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  notice: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'edit', 'delete'])

function handleClose() {
  emit('close')
}

function handleEdit() {
  emit('edit', props.notice)
}

function handleDelete() {
  emit('delete', props.notice.id)
}

function getStatus() {
  if (!props.notice) return false
  if ('status' in props.notice) {
    return props.notice.status === 'ACTIVE'
  }
  return props.notice.visible !== false
}

function formatAuthor() {
  if (!props.notice) return '관리자'
  const author = props.notice.author
  if (!author) return '관리자'
  if (typeof author === 'object') {
    return author.username ?? '관리자'
  }
  return author
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const utcString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  return new Date(utcString).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getProcessedContent() {
  if (!props.notice?.content) return ''

  let processedContent = props.notice.content

  if (props.notice.files && props.notice.files.length > 0) {
    const sortedFiles = [...props.notice.files].sort((a, b) => a.displayOrder - b.displayOrder)

    sortedFiles.forEach((file, index) => {
      const placeholder = `placeholder-${index}`
      processedContent = processedContent.replaceAll(placeholder, file.url)
    })
  }

  return processedContent
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  padding: 4px;
  color: #6b7280;
  transition: color 0.2s;
}

.close-button:hover {
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-field {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 16px;
  align-items: center;
}

.detail-field-full {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.field-value {
  font-size: 14px;
  color: #1f2937;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-public {
  background: #dcfce7;
  color: #16a34a;
}

.status-hidden {
  background: #f3f4f6;
  color: #9ca3af;
}

.content-viewer {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  min-height: 200px;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
}

/* 헤딩 스타일 */
.content-viewer :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  margin: 20px 0 12px;
  line-height: 1.3;
}

.content-viewer :deep(h2) {
  font-size: 20px;
  font-weight: 700;
  margin: 16px 0 8px;
  line-height: 1.4;
}

.content-viewer :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  margin: 14px 0 6px;
  line-height: 1.4;
}

/* 단락 스타일 */
.content-viewer :deep(p) {
  margin: 8px 0;
  line-height: 1.7;
}

/* 리스트 스타일 */
.content-viewer :deep(ul),
.content-viewer :deep(ol) {
  padding-left: 0;
  margin: 8px 0 8px 20px;
  line-height: 1.6;
}

.content-viewer :deep(ul) {
  list-style-type: disc;
}

.content-viewer :deep(ol) {
  list-style-type: decimal;
}

.content-viewer :deep(li) {
  margin-bottom: 4px;
}

.content-viewer :deep(ul li::marker),
.content-viewer :deep(ol li::marker) {
  color: #1f2937;
  font-weight: 500;
}

/* 인용구 스타일 */
.content-viewer :deep(blockquote) {
  border-left: 3px solid #e5e7eb;
  padding-left: 12px;
  color: #6b7280;
  margin: 8px 0;
  font-style: italic;
}

/* 구분선 스타일 */
.content-viewer :deep(hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 16px 0;
}

/* 링크 스타일 */
.content-viewer :deep(a) {
  color: #2563eb;
  text-decoration: underline;
  transition: color 0.15s;
}

.content-viewer :deep(a:hover) {
  color: #1d4ed8;
}

/* 이미지 스타일 */
.content-viewer :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 8px 0;
  display: block;
}

/* 텍스트 스타일 */
.content-viewer :deep(strong) {
  font-weight: 700;
}

.content-viewer :deep(em) {
  font-style: italic;
}

.content-viewer :deep(s) {
  text-decoration: line-through;
}

/* 코드 스타일 */
.content-viewer :deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: monospace;
}

.content-viewer :deep(pre) {
  background: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.content-viewer :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

/* 텍스트 정렬 */
.content-viewer :deep([style*='text-align: center']) {
  text-align: center;
}

.content-viewer :deep([style*='text-align: right']) {
  text-align: right;
}

.content-viewer :deep([style*='text-align: left']) {
  text-align: left;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #ff7738;
  color: white;
}

.btn-primary:hover {
  background: #e66a32;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .detail-field {
    grid-template-rows: 1fr;
    gap: 4px;
  }

  .field-value {
    justify-self: end;
  }

  .status-badge {
    justify-self: end;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .detail-section {
    gap: 12px;
  }
}

@media (max-width: 350px) {
  .detail-field {
    grid-template-columns: 1fr;
  }

  .field-value {
    justify-self: start;
  }

  .status-badge {
    justify-self: start;
  }
}
</style>
