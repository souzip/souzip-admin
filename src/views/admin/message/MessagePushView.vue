<template>
  <div class="push-layout">
    <div class="push-hero">
      <div class="push-hero-glow" aria-hidden="true" />
      <div class="push-hero-inner">
        <div class="push-hero-icon-wrap">
          <svg
            class="push-hero-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C8.5 2 6 4.5 6 8v4.5c0 1.1-.4 2.1-1 2.9V19c0 .6.4 1 1 1h10c.6 0 1-.4 1-1v-3.6c-.6-.8-1-1.8-1-2.9V8c0-3.5-2.5-6-6-6z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M10 21h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <div class="push-hero-text">
          <span class="push-badge">Push</span>
          <h1 class="push-title">메시지 발송</h1>
          <p class="push-lead">
            앱에 등록된 <strong class="text-primary-600">활성 FCM 기기</strong>로 푸시 알림을
            보냅니다. 제목과 내용은 사용자 기기 알림에 그대로 표시됩니다.
          </p>
        </div>
      </div>
    </div>

    <div v-if="!canSend" class="push-restrict">
      <svg class="push-restrict-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <div class="push-restrict-text">
        <p v-if="isViewerRole">
          현재 계정은 <span class="font-semibold">조회 전용(VIEWER)</span>입니다. 푸시 발송은
          <span class="font-semibold">ADMIN</span> 또는
          <span class="font-semibold">SUPER_ADMIN</span>
          권한이 필요합니다.
        </p>
        <p v-else-if="!hasAdminRole">
          역할 정보를 확인할 수 없습니다. 다시 로그인한 뒤 이용해 주세요.
        </p>
        <p v-else>이 기능은 <span class="font-semibold">ADMIN</span> 이상만 사용할 수 있습니다.</p>
      </div>
    </div>

    <form v-else class="push-form-card" @submit.prevent="handleSubmit">
      <div class="push-form-head">
        <h2 class="push-form-title">알림 내용</h2>
        <p class="push-form-hint">발송 전 내용을 한 번 더 확인해 주세요.</p>
      </div>

      <div class="push-field">
        <div class="push-label-row">
          <label for="push-title" class="label-base">제목</label>
          <span class="push-counter" :class="{ 'push-counter-warn': titleLen >= 180 }">
            {{ titleLen }} / 200
          </span>
        </div>
        <input
          id="push-title"
          v-model="form.title"
          type="text"
          class="input-base push-input"
          maxlength="200"
          required
          placeholder="예: 새로운 이벤트가 시작되었어요"
          :disabled="sending"
        />
      </div>

      <div class="push-field">
        <div class="push-label-row">
          <label for="push-body" class="label-base">내용</label>
          <span class="push-counter" :class="{ 'push-counter-warn': bodyLen >= 900 }">
            {{ bodyLen }} / 1000
          </span>
        </div>
        <textarea
          id="push-body"
          v-model="form.body"
          class="input-base push-textarea"
          rows="6"
          maxlength="1000"
          required
          placeholder="알림 본문을 입력하세요. 짧고 명확할수록 좋습니다."
          :disabled="sending"
        />
      </div>

      <div v-if="errorMessage" class="push-alert push-alert-error">
        <svg class="push-alert-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="resultMessage" class="push-alert" :class="resultAlertClass">
        <svg
          v-if="resultIsWarning"
          class="push-alert-ic shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <svg
          v-else
          class="push-alert-ic shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="push-result-text whitespace-pre-wrap">{{ resultMessage }}</div>
      </div>

      <div v-if="lastStats" class="push-stats">
        <div class="push-stat">
          <span class="push-stat-label">대상</span>
          <span class="push-stat-value">{{ lastStats.total }}</span>
        </div>
        <div class="push-stat push-stat-ok">
          <span class="push-stat-label">성공</span>
          <span class="push-stat-value">{{ lastStats.success }}</span>
        </div>
        <div class="push-stat" :class="{ 'push-stat-bad': lastStats.fail > 0 }">
          <span class="push-stat-label">실패</span>
          <span class="push-stat-value">{{ lastStats.fail }}</span>
        </div>
      </div>

      <div class="push-actions">
        <button
          type="submit"
          class="push-submit"
          :disabled="sending || !form.title.trim() || !form.body.trim()"
        >
          <span v-if="sending" class="push-spinner" aria-hidden="true" />
          <svg
            v-else
            class="push-submit-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          {{ sending ? '발송 중…' : '푸시 발송' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import client from '@/api/Client'

const auth = useAuthStore()

const canSend = computed(() => {
  const r = auth.admin?.role
  return r === 'SUPER_ADMIN' || r === 'ADMIN'
})

const hasAdminRole = computed(() => Boolean(auth.admin?.role))

const isViewerRole = computed(() => auth.admin?.role === 'VIEWER')

const form = reactive({
  title: '',
  body: '',
})

const titleLen = computed(() => form.title.length)
const bodyLen = computed(() => form.body.length)

const sending = ref(false)
const errorMessage = ref('')
const resultMessage = ref('')
const lastStats = ref(null)
const firebaseConfigured = ref(true)

const resultIsWarning = computed(() => {
  if (!lastStats.value) return false
  return !firebaseConfigured.value || lastStats.value.total === 0 || lastStats.value.fail > 0
})

const resultAlertClass = computed(() => {
  if (!resultMessage.value) return ''
  return resultIsWarning.value ? 'push-alert-warn' : 'push-alert-success'
})

async function handleSubmit() {
  errorMessage.value = ''
  resultMessage.value = ''
  lastStats.value = null
  sending.value = true
  try {
    const res = await client.post('/api/admin/push/broadcast', {
      title: form.title.trim(),
      body: form.body.trim(),
    })
    const data = res.data?.data
    const msg = res.data?.message || ''
    if (data) {
      firebaseConfigured.value = data.firebaseConfigured !== false
      lastStats.value = {
        total: data.totalTargets ?? 0,
        success: data.successCount ?? 0,
        fail: data.failCount ?? 0,
      }
      const lines = [
        msg,
        data.firebaseConfigured === false ? `※ Firebase가 서버에 설정되지 않았습니다.` : null,
        `대상 ${data.totalTargets ?? 0}건 · 성공 ${data.successCount ?? 0}건 · 실패 ${data.failCount ?? 0}건`,
      ].filter(Boolean)
      resultMessage.value = lines.join('\n')
    } else {
      firebaseConfigured.value = true
      resultMessage.value = msg
    }
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || '발송에 실패했습니다.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.push-layout {
  max-width: 42rem;
  margin: 0 auto;
  padding: 1.75rem 4px 2rem;
}

@media (min-width: 640px) {
  .push-layout {
    padding-top: 2rem;
  }
}

.push-hero {
  position: relative;
  margin-bottom: 2.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #fff 0%, #fff5f0 45%, #ffe8dc 100%);
  border: 1px solid rgba(255, 119, 56, 0.2);
  box-shadow: 0 4px 24px -8px rgba(255, 119, 56, 0.25);
  overflow: hidden;
}

.push-hero-glow {
  position: absolute;
  top: -40%;
  right: -20%;
  width: 60%;
  height: 140%;
  background: radial-gradient(circle, rgba(255, 119, 56, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.push-hero-inner {
  position: relative;
  display: flex;
  gap: 1rem;
  padding: 1.5rem 1.25rem;
  align-items: flex-start;
}

@media (min-width: 640px) {
  .push-hero-inner {
    padding: 1.75rem 1.5rem;
    gap: 1.25rem;
  }
}

.push-hero-icon-wrap {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
  background: linear-gradient(145deg, #ff7738 0%, #e66a32 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px -6px rgba(230, 106, 50, 0.55);
}

.push-hero-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.push-hero-text {
  min-width: 0;
}

.push-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #e66a32;
  background: rgba(255, 119, 56, 0.12);
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  margin-bottom: 0.5rem;
}

.push-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: rgb(17 24 39);
  letter-spacing: -0.02em;
  line-height: 1.25;
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .push-title {
    font-size: 1.5rem;
  }
}

.push-lead {
  font-size: 0.875rem;
  color: rgb(75 85 99);
  line-height: 1.65;
}

.push-restrict {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  margin-top: 0.25rem;
  padding: 1.125rem 1.25rem;
  border-radius: 0.875rem;
  background: linear-gradient(to bottom, #fffbeb, #fef3c7);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: rgb(146 64 14);
  font-size: 0.875rem;
  line-height: 1.5;
}

.push-restrict-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  opacity: 0.9;
}

.push-restrict-text p {
  margin: 0;
}

.push-form-card {
  margin-top: 0.25rem;
  background: #fff;
  border-radius: 1rem;
  border: 1px solid rgb(229 231 235);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 8px 32px -12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 1.25rem 1.5rem;
}

@media (min-width: 640px) {
  .push-form-card {
    padding: 1.75rem 1.75rem 1.5rem;
  }
}

.push-form-head {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(243 244 246);
}

.push-form-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(17 24 39);
}

.push-form-hint {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: rgb(107 114 128);
}

.push-field {
  margin-bottom: 1.125rem;
}

.push-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.push-counter {
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: rgb(156 163 175);
}

.push-counter-warn {
  color: #e66a32;
  font-weight: 500;
}

.push-input:focus,
.push-textarea:focus {
  border-color: rgba(255, 119, 56, 0.45);
  box-shadow: 0 0 0 3px rgba(255, 119, 56, 0.12);
}

.push-textarea {
  min-height: 9rem;
  resize: vertical;
  line-height: 1.55;
}

.push-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.55;
  margin-bottom: 1rem;
}

.push-alert-error {
  background: rgb(254 242 242);
  border: 1px solid rgb(254 202 202);
  color: rgb(185 28 28);
}

.push-alert-success {
  background: rgb(236 253 245);
  border: 1px solid rgb(167 243 208);
  color: rgb(4 120 87);
}

.push-alert-warn {
  background: rgb(255 251 235);
  border: 1px solid rgb(253 230 138);
  color: rgb(146 64 14);
}

.push-alert-ic {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.1rem;
}

.push-result-text {
  flex: 1;
  min-width: 0;
}

.push-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.push-stat {
  text-align: center;
  padding: 0.75rem 0.5rem;
  border-radius: 0.75rem;
  background: rgb(249 250 251);
  border: 1px solid rgb(229 231 235);
}

.push-stat-ok {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.25);
}

.push-stat-bad {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.2);
}

.push-stat-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(107 114 128);
  margin-bottom: 0.25rem;
}

.push-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: rgb(17 24 39);
}

.push-stat-ok .push-stat-value {
  color: rgb(4 120 87);
}

.push-stat-bad .push-stat-value {
  color: rgb(185 28 28);
}

.push-actions {
  padding-top: 0.25rem;
}

.push-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  color: #fff;
  background: linear-gradient(180deg, #ff8a4d 0%, #ff7738 40%, #e66a32 100%);
  border: none;
  box-shadow: 0 4px 14px -4px rgba(255, 119, 56, 0.65);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.push-submit:hover:not(:disabled) {
  box-shadow: 0 6px 20px -4px rgba(255, 119, 56, 0.75);
  transform: translateY(-1px);
}

.push-submit:active:not(:disabled) {
  transform: translateY(0);
}

.push-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.push-submit-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.push-spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: push-spin 0.7s linear infinite;
}

@keyframes push-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
