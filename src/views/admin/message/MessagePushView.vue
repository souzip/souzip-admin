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

    <nav class="push-tabs" aria-label="푸시 메뉴">
      <button
        type="button"
        class="push-tab"
        :class="{ 'push-tab-active': activeTab === 'send' }"
        @click="activeTab = 'send'"
      >
        메시지 발송
      </button>
      <button
        type="button"
        class="push-tab"
        :class="{ 'push-tab-active': activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        알람발송내역
      </button>
      <button
        type="button"
        class="push-tab"
        :class="{ 'push-tab-active': activeTab === 'email' }"
        @click="activeTab = 'email'"
      >
        이메일 테스트
      </button>
    </nav>

    <div v-show="activeTab === 'send'">
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
          <p v-else>
            이 기능은 <span class="font-semibold">ADMIN</span> 이상만 사용할 수 있습니다.
          </p>
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

    <div v-show="activeTab === 'history'" class="push-history">
      <div v-if="historyError" class="push-alert push-alert-error push-history-alert">
        <span>{{ historyError }}</span>
      </div>
      <div class="push-history-card">
        <div class="push-history-head">
          <h2 class="push-form-title">발송 이력</h2>
          <p class="push-form-hint">최근 브로드캐스트 푸시 기준으로 최신순입니다.</p>
        </div>
        <div v-if="historyLoading && historyRows.length === 0" class="push-history-loading">
          불러오는 중…
        </div>
        <div v-else-if="!historyLoading && historyRows.length === 0" class="push-history-empty">
          저장된 발송 이력이 없습니다.
        </div>
        <div v-else class="push-history-table-wrap">
          <table class="push-history-table">
            <thead>
              <tr>
                <th class="col-when">발송일시</th>
                <th class="col-title">제목</th>
                <th class="col-body">내용</th>
                <th class="col-num">대상</th>
                <th class="col-num">성공</th>
                <th class="col-num">실패</th>
                <th class="col-fb">Firebase</th>
                <th class="col-admin">관리자</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in historyRows" :key="row.id">
                <td class="col-when whitespace-nowrap">{{ formatDateTime(row.createdAt) }}</td>
                <td class="col-title-cell">{{ row.title || '—' }}</td>
                <td class="col-body">
                  <span class="push-body-clip" :title="row.body">{{ row.body || '—' }}</span>
                </td>
                <td class="col-num">{{ row.totalTargets }}</td>
                <td class="col-num text-emerald-700">{{ row.successCount }}</td>
                <td class="col-num" :class="{ 'text-red-700': row.failCount > 0 }">
                  {{ row.failCount }}
                </td>
                <td class="col-fb">
                  <span
                    class="push-fb-badge"
                    :class="row.firebaseConfigured ? 'push-fb-on' : 'push-fb-off'"
                  >
                    {{ row.firebaseConfigured ? '설정' : '미설정' }}
                  </span>
                </td>
                <td class="col-admin font-mono text-xs">{{ shortAdminId(row.adminId) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="historyPagination && historyRows.length > 0" class="push-history-pager">
          <span class="push-pager-info">
            {{ historyPagination.currentPage }} / {{ historyPagination.totalPages || 1 }} 페이지
            <span class="push-pager-total">· 전체 {{ historyPagination.totalItems }}건</span>
          </span>
          <div class="push-pager-btns">
            <button
              type="button"
              class="push-pager-btn"
              :disabled="historyLoading || !historyPagination.hasPrevious"
              @click="goHistoryPage(historyPagination.currentPage - 1)"
            >
              이전
            </button>
            <button
              type="button"
              class="push-pager-btn"
              :disabled="historyLoading || !historyPagination.hasNext"
              @click="goHistoryPage(historyPagination.currentPage + 1)"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'email'" class="push-email-dev">
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
          <p>이메일 테스트는 <span class="font-semibold">ADMIN</span> 이상만 사용할 수 있습니다.</p>
        </div>
      </div>

      <div v-else class="push-form-card push-email-card">
        <div class="push-form-head">
          <h2 class="push-form-title">SMTP 테스트 (임시)</h2>
          <p class="push-form-hint">
            아래 제목·본문으로 발송합니다. 「테스트 메일」은 수신 한 곳만, 「전체 회원」은 DB에 있는
            고유 이메일 전체(탈퇴 제외)입니다.
          </p>
        </div>

        <div class="push-field">
          <label for="email-test-to" class="label-base">수신 이메일</label>
          <input
            id="email-test-to"
            v-model="emailForm.to"
            type="email"
            class="input-base push-input"
            autocomplete="email"
            placeholder="name@example.com"
            :disabled="emailBusy"
          />
        </div>

        <div class="push-field">
          <div class="push-label-row">
            <label for="email-test-subject" class="label-base">제목</label>
            <span class="push-counter">{{ emailForm.subject.length }} / 200</span>
          </div>
          <input
            id="email-test-subject"
            v-model="emailForm.subject"
            type="text"
            class="input-base push-input"
            maxlength="200"
            :disabled="emailBusy"
          />
        </div>

        <div class="push-field">
          <div class="push-label-row">
            <label for="email-test-body" class="label-base">본문</label>
            <span class="push-counter">{{ emailForm.body.length }} / 20000</span>
          </div>
          <textarea
            id="email-test-body"
            v-model="emailForm.body"
            class="input-base push-textarea"
            rows="5"
            maxlength="20000"
            :disabled="emailBusy"
          />
        </div>

        <div v-if="emailError" class="push-alert push-alert-error">
          <span>{{ emailError }}</span>
        </div>

        <div v-if="emailResultMessage" class="push-alert" :class="emailResultAlertClass">
          <div class="push-result-text whitespace-pre-wrap">{{ emailResultMessage }}</div>
        </div>

        <div v-if="emailLastStats" class="push-stats">
          <div class="push-stat">
            <span class="push-stat-label">대상</span>
            <span class="push-stat-value">{{ emailLastStats.total }}</span>
          </div>
          <div class="push-stat push-stat-ok">
            <span class="push-stat-label">성공</span>
            <span class="push-stat-value">{{ emailLastStats.success }}</span>
          </div>
          <div class="push-stat" :class="{ 'push-stat-bad': emailLastStats.fail > 0 }">
            <span class="push-stat-label">실패</span>
            <span class="push-stat-value">{{ emailLastStats.fail }}</span>
          </div>
        </div>

        <div class="push-actions push-email-actions push-email-actions-row">
          <button
            type="button"
            class="push-submit push-email-btn"
            :disabled="
              emailBusy ||
              !emailForm.to.trim() ||
              !emailForm.subject.trim() ||
              !emailForm.body.trim()
            "
            @click="handleEmailTestSend"
          >
            <span v-if="emailTestSending" class="push-spinner" aria-hidden="true" />
            {{ emailTestSending ? '발송 중…' : '테스트 메일 발송' }}
          </button>
          <button
            type="button"
            class="push-submit push-email-btn-broadcast"
            :disabled="emailBusy || !emailForm.subject.trim() || !emailForm.body.trim()"
            @click="openEmailBroadcastConfirm"
          >
            <span v-if="emailBroadcastSending" class="push-spinner" aria-hidden="true" />
            {{ emailBroadcastSending ? '전체 발송 중…' : '전체 회원 이메일 발송' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :is-open="showEmailBroadcastConfirm"
      type="danger"
      :message="emailBroadcastConfirmMessage"
      confirm-text="전체 발송"
      cancel-text="취소"
      @confirm="confirmEmailBroadcast"
      @cancel="showEmailBroadcastConfirm = false"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import client from '@/api/Client'
import ConfirmModal from '@/components/ConfirmModal.vue'

const auth = useAuthStore()

const canSend = computed(() => {
  const r = auth.admin?.role
  return r === 'SUPER_ADMIN' || r === 'ADMIN'
})

const hasAdminRole = computed(() => Boolean(auth.admin?.role))

const isViewerRole = computed(() => auth.admin?.role === 'VIEWER')

const activeTab = ref('send')

const emailForm = reactive({
  to: 'johoon030@gmail.com',
  subject: '[souzip] SMTP 테스트',
  body: '관리자 화면에서 보낸 테스트 메일입니다.',
})
const emailTestSending = ref(false)
const emailBroadcastSending = ref(false)
const emailBusy = computed(() => emailTestSending.value || emailBroadcastSending.value)
const showEmailBroadcastConfirm = ref(false)
const emailError = ref('')
const emailResultMessage = ref('')
const emailLastStats = ref(null)
const emailSmtpConfigured = ref(true)

const emailBroadcastConfirmMessage = computed(() => {
  const sub = emailForm.subject.trim() || '(제목 없음)'
  return `「${sub}」제목으로 탈퇴하지 않은 회원 중 이메일이 있는 고유 주소 전체로 발송합니다. 되돌릴 수 없습니다. 계속할까요?`
})

const emailResultAlertClass = computed(() => {
  if (!emailResultMessage.value) return ''
  const warn =
    !emailSmtpConfigured.value ||
    (emailLastStats.value && (emailLastStats.value.total === 0 || emailLastStats.value.fail > 0))
  return warn ? 'push-alert-warn' : 'push-alert-success'
})

function openEmailBroadcastConfirm() {
  emailError.value = ''
  showEmailBroadcastConfirm.value = true
}

async function confirmEmailBroadcast() {
  showEmailBroadcastConfirm.value = false
  await handleEmailBroadcastSend()
}

async function handleEmailTestSend() {
  emailError.value = ''
  emailResultMessage.value = ''
  emailLastStats.value = null
  emailTestSending.value = true
  try {
    const res = await client.post('/api/admin/email/test-send', {
      to: emailForm.to.trim(),
      subject: emailForm.subject.trim(),
      body: emailForm.body.trim(),
    })
    applyEmailApiResult(res)
  } catch (e) {
    emailError.value = e?.response?.data?.message || '테스트 메일 발송에 실패했습니다.'
  } finally {
    emailTestSending.value = false
  }
}

async function handleEmailBroadcastSend() {
  emailError.value = ''
  emailResultMessage.value = ''
  emailLastStats.value = null
  emailBroadcastSending.value = true
  try {
    const res = await client.post('/api/admin/email/broadcast', {
      subject: emailForm.subject.trim(),
      body: emailForm.body.trim(),
    })
    applyEmailApiResult(res)
  } catch (e) {
    emailError.value = e?.response?.data?.message || '전체 이메일 발송에 실패했습니다.'
  } finally {
    emailBroadcastSending.value = false
  }
}

function applyEmailApiResult(res) {
  const data = res.data?.data
  const msg = res.data?.message || ''
  if (data) {
    emailSmtpConfigured.value = data.smtpConfigured !== false
    emailLastStats.value = {
      total: data.totalTargets ?? 0,
      success: data.successCount ?? 0,
      fail: data.failCount ?? 0,
    }
    const lines = [
      msg,
      data.smtpConfigured === false ? '※ 서버에 SMTP가 설정되지 않았습니다.' : null,
      `대상 ${data.totalTargets ?? 0}건 · 성공 ${data.successCount ?? 0}건 · 실패 ${data.failCount ?? 0}건`,
    ].filter(Boolean)
    emailResultMessage.value = lines.join('\n')
  } else {
    emailSmtpConfigured.value = true
    emailResultMessage.value = msg
  }
}

const historyRows = ref([])
const historyPagination = ref(null)
const historyLoading = ref(false)
const historyError = ref('')
const historyPageNo = ref(1)
const HISTORY_PAGE_SIZE = 10

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

function goHistoryPage(page) {
  if (page < 1) return
  loadHistory(page)
}

async function loadHistory(pageNo) {
  historyError.value = ''
  historyLoading.value = true
  historyPageNo.value = pageNo
  try {
    const res = await client.get('/api/admin/push/broadcast/history', {
      params: { pageNo, pageSize: HISTORY_PAGE_SIZE },
    })
    const wrapped = res.data?.data
    historyRows.value = wrapped?.content ?? []
    historyPagination.value = wrapped?.pagination ?? null
  } catch (e) {
    historyError.value = e?.response?.data?.message || '이력을 불러오지 못했습니다.'
    historyRows.value = []
    historyPagination.value = null
  } finally {
    historyLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'history') {
    loadHistory(historyPageNo.value)
  }
})

function formatDateTime(v) {
  if (v == null || v === '') return '—'
  if (Array.isArray(v) && v.length >= 3) {
    const [y, mo, d, h = 0, mi = 0] = v
    const dt = new Date(y, mo - 1, d, h, mi)
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }
  const s = typeof v === 'string' ? v : String(v)
  const dt = new Date(s)
  if (Number.isNaN(dt.getTime())) return s
  return dt.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortAdminId(uuid) {
  if (uuid == null || uuid === '') return '—'
  const t = String(uuid)
  return t.length > 10 ? `${t.slice(0, 8)}…` : t
}
</script>

<style scoped>
.push-layout {
  max-width: min(100%, 72rem);
  margin: 0 auto;
  padding: 1.75rem 4px 2rem;
}

.push-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
  padding: 0.25rem;
  border-radius: 0.875rem;
  background: rgb(243 244 246);
  border: 1px solid rgb(229 231 235);
}

.push-tab {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(107 114 128);
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.push-tab:hover {
  color: rgb(55 65 81);
  background: rgba(255, 255, 255, 0.6);
}

.push-tab-active {
  color: rgb(17 24 39);
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.push-history {
  margin-top: 0.25rem;
}

.push-history-alert {
  margin-bottom: 1rem;
}

.push-history-card {
  background: #fff;
  border-radius: 1rem;
  border: 1px solid rgb(229 231 235);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 8px 32px -12px rgba(0, 0, 0, 0.08);
  padding: 1.25rem 1rem 1.5rem;
  overflow: hidden;
}

@media (min-width: 640px) {
  .push-history-card {
    padding: 1.5rem 1.5rem 1.5rem;
  }
}

.push-history-head {
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid rgb(243 244 246);
}

.push-history-loading,
.push-history-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  font-size: 0.875rem;
  color: rgb(107 114 128);
}

.push-history-table-wrap {
  overflow-x: auto;
  margin: 0 -0.25rem;
}

.push-history-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.push-history-table th {
  text-align: left;
  padding: 0.5rem 0.625rem;
  font-weight: 600;
  color: rgb(75 85 99);
  border-bottom: 1px solid rgb(229 231 235);
  white-space: nowrap;
}

.push-history-table td {
  padding: 0.625rem 0.625rem;
  border-bottom: 1px solid rgb(243 244 246);
  vertical-align: top;
  color: rgb(31 41 55);
}

.push-history-table tbody tr:last-child td {
  border-bottom: none;
}

.col-when {
  width: 1%;
}

.col-title {
  width: 12%;
}

.col-title-cell {
  max-width: 8rem;
  word-break: break-word;
}

.col-body {
  min-width: 8rem;
  max-width: 14rem;
}

.push-body-clip {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  line-height: 1.45;
}

.col-num {
  width: 1%;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.col-fb {
  width: 1%;
  white-space: nowrap;
}

.col-admin {
  width: 1%;
}

.push-fb-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 0.375rem;
}

.push-fb-on {
  background: rgba(16, 185, 129, 0.12);
  color: rgb(4 120 87);
}

.push-fb-off {
  background: rgb(243 244 246);
  color: rgb(107 114 128);
}

.push-history-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(243 244 246);
}

.push-pager-info {
  font-size: 0.8125rem;
  color: rgb(75 85 99);
}

.push-pager-total {
  color: rgb(156 163 175);
}

.push-pager-btns {
  display: flex;
  gap: 0.5rem;
}

.push-pager-btn {
  padding: 0.45rem 0.9rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid rgb(229 231 235);
  background: #fff;
  color: rgb(55 65 81);
  cursor: pointer;
  transition: background 0.15s ease;
}

.push-pager-btn:hover:not(:disabled) {
  background: rgb(249 250 251);
}

.push-pager-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

.push-email-dev {
  margin-top: 0.25rem;
}

.push-email-card {
  border: 1px dashed rgb(199 210 254);
  background: linear-gradient(to bottom, #fff, rgb(248 250 252));
}

.push-email-actions .push-email-btn {
  background: linear-gradient(180deg, #818cf8 0%, #6366f1 45%, #4f46e5 100%);
  box-shadow: 0 4px 14px -4px rgba(79, 70, 229, 0.5);
}

.push-email-actions .push-email-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px -4px rgba(79, 70, 229, 0.6);
}

.push-email-actions-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .push-email-actions-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .push-email-actions-row .push-submit {
    flex: 1;
    min-width: 12rem;
  }
}

.push-email-btn-broadcast {
  background: linear-gradient(180deg, #f87171 0%, #ef4444 45%, #dc2626 100%) !important;
  box-shadow: 0 4px 14px -4px rgba(220, 38, 38, 0.55) !important;
}

.push-email-btn-broadcast:hover:not(:disabled) {
  box-shadow: 0 6px 20px -4px rgba(220, 38, 38, 0.65) !important;
}
</style>
