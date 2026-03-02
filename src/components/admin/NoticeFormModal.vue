<!-- src/components/admin/NoticeFormModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop" @click.self="onClose">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">{{ isEdit ? '공지사항 수정' : '공지사항 등록' }}</h2>
            <button type="button" class="modal-close-btn" @click="onClose">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <form id="notice-form" @submit.prevent="handleSubmit">
              <!-- 제목 -->
              <div class="form-group">
                <label class="label-base" for="notice-title">
                  제목 <span class="text-red-500">*</span>
                </label>
                <input
                  id="notice-title"
                  v-model="form.title"
                  type="text"
                  class="input-base"
                  :class="{ 'input-error': errors.title }"
                  placeholder="제목을 입력하세요"
                  maxlength="200"
                />
                <p v-if="errors.title" class="error-text">{{ errors.title }}</p>
              </div>

              <!-- 공개 여부 -->
              <div class="form-group">
                <label class="label-base">공개 여부</label>
                <div class="toggle-wrap">
                  <button
                    type="button"
                    class="toggle-btn"
                    :class="form.visible ? 'toggle-on' : 'toggle-off'"
                    @click="form.visible = !form.visible"
                  >
                    <span class="toggle-knob"></span>
                  </button>
                  <span class="toggle-label">{{ form.visible ? '공개' : '숨김' }}</span>
                </div>
              </div>

              <!-- 본문 에디터 -->
              <div class="form-group">
                <label class="label-base">내용 <span class="text-red-500">*</span></label>

                <div class="editor-container" :class="{ 'editor-container-error': errors.content }">
                  <!-- 툴바 -->
                  <div class="editor-toolbar">
                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('bold') }"
                      title="굵게"
                      @click="editor?.chain().focus().toggleBold().run()"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('italic') }"
                      title="기울임"
                      @click="editor?.chain().focus().toggleItalic().run()"
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('strike') }"
                      title="취소선"
                      @click="editor?.chain().focus().toggleStrike().run()"
                    >
                      <s>S</s>
                    </button>
                    <div class="toolbar-divider"></div>

                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('heading', { level: 2 }) }"
                      title="제목2"
                      @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('heading', { level: 3 }) }"
                      title="제목3"
                      @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
                    >
                      H3
                    </button>
                    <div class="toolbar-divider"></div>

                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive({ textAlign: 'left' }) }"
                      title="왼쪽 정렬"
                      @click="editor?.chain().focus().setTextAlign('left').run()"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 6h16M4 12h10M4 18h14"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive({ textAlign: 'center' }) }"
                      title="가운데 정렬"
                      @click="editor?.chain().focus().setTextAlign('center').run()"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 6h16M7 12h10M5 18h14"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive({ textAlign: 'right' }) }"
                      title="오른쪽 정렬"
                      @click="editor?.chain().focus().setTextAlign('right').run()"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 6h16M10 12h10M6 18h14"
                        />
                      </svg>
                    </button>
                    <div class="toolbar-divider"></div>

                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('bulletList') }"
                      title="글머리 기호"
                      @click="editor?.chain().focus().toggleBulletList().run()"
                    >
                      ≡
                    </button>
                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('orderedList') }"
                      title="번호 목록"
                      @click="editor?.chain().focus().toggleOrderedList().run()"
                    >
                      1.
                    </button>
                    <div class="toolbar-divider"></div>

                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('blockquote') }"
                      title="인용"
                      @click="editor?.chain().focus().toggleBlockquote().run()"
                    >
                      "
                    </button>
                    <button
                      type="button"
                      class="toolbar-btn"
                      title="구분선"
                      @click="editor?.chain().focus().setHorizontalRule().run()"
                    >
                      —
                    </button>
                    <div class="toolbar-divider"></div>

                    <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ active: editor?.isActive('link') }"
                      title="링크 삽입"
                      @click="handleLinkClick"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </button>

                    <label class="toolbar-btn" title="이미지 삽입" style="cursor: pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <input
                        ref="imageInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleImageInsert"
                      />
                    </label>
                  </div>

                  <!-- 링크 입력 팝업 -->
                  <div v-if="linkPopup.visible" class="link-popup">
                    <input
                      ref="linkInputRef"
                      v-model="linkPopup.url"
                      type="url"
                      class="link-input"
                      placeholder="https://example.com"
                      @keydown.enter.prevent="applyLink"
                      @keydown.esc="closeLinkPopup"
                    />
                    <button type="button" class="link-apply-btn" @click="applyLink">적용</button>
                    <button type="button" class="link-cancel-btn" @click="closeLinkPopup">
                      취소
                    </button>
                  </div>

                  <!-- 에디터 본문 -->
                  <div class="editor-wrapper">
                    <EditorContent :editor="editor" class="editor-content" />
                  </div>
                </div>
                <p v-if="errors.content" class="error-text">{{ errors.content }}</p>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="onClose">취소</button>
            <button type="submit" form="notice-form" class="btn-primary" :disabled="submitting">
              {{ isEdit ? '완료' : '등록' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed, onBeforeUnmount, nextTick, defineComponent, h } from 'vue'
import { useEditor, EditorContent, VueNodeViewRenderer, NodeViewWrapper } from '@tiptap/vue-3'
import { Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { useNoticeManagement } from '@/composables/useNoticeManagement'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  notice: { type: Object, default: null },
})

const emit = defineEmits(['close', 'success'])

const { createNotice, updateNotice } = useNoticeManagement()

const isEdit = computed(() => !!props.notice)
const form = reactive({ title: '', visible: true })
const errors = reactive({ title: '', content: '' })
const submitting = ref(false)
const imageInput = ref(null)
const linkInputRef = ref(null)
const linkPopup = reactive({ visible: false, url: '' })
const imageFiles = ref([])
const deleteFileIds = ref([])

const ImageChip = defineComponent({
  props: {
    node: Object,
    deleteNode: Function,
  },
  setup(props) {
    const src = computed(() => props.node?.attrs?.src ?? '')
    const alt = computed(() => props.node?.attrs?.alt ?? '')
    const fileId = computed(() => props.node?.attrs?.fileId ?? null)

    const filename = computed(() => {
      if (alt.value) return alt.value
      if (src.value.startsWith('placeholder-')) return '새 이미지'
      if (src.value.startsWith('existing-')) return '기존 이미지'
      return src.value.split('/').pop()?.split('?')[0] || '이미지'
    })

    const handleDelete = (event) => {
      event.preventDefault()
      event.stopPropagation()

      if (src.value.startsWith('placeholder-')) {
        const match = src.value.match(/placeholder-(\d+)/)
        if (match) {
          const index = parseInt(match[1])
          imageFiles.value.splice(index, 1)
        }
      } else if (src.value.startsWith('existing-') && fileId.value) {
        deleteFileIds.value.push(fileId.value)
      }

      props.deleteNode?.()
    }

    return () =>
      h(NodeViewWrapper, { as: 'span', style: { display: 'inline-block', margin: '4px 0' } }, () =>
        h(
          'span',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px 4px 12px',
              background: '#fff5f0',
              border: '1px solid #ffb899',
              borderRadius: '99px',
              fontSize: '13px',
              color: '#ff7738',
              userSelect: 'none',
              cursor: 'default',
              verticalAlign: 'middle',
            },
          },
          [
            h('span', {}, ['📎 ', filename.value]),
            h(
              'button',
              {
                type: 'button',
                onClick: handleDelete,
                style: {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  padding: '0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ff7738',
                  fontSize: '18px',
                  lineHeight: '1',
                  transition: 'opacity 0.15s',
                  opacity: '0.6',
                },
                onMouseenter: (e) => {
                  e.target.style.opacity = '1'
                },
                onMouseleave: (e) => {
                  e.target.style.opacity = '0.6'
                },
              },
              '×'
            ),
          ]
        )
      )
  },
})

const ImageChipExtension = Node.create({
  name: 'image',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      fileId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        style: 'max-width:100%;border-radius:6px;margin:8px 0;display:block;',
      }),
    ]
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs: options })
        },
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageChip)
  },
})

const editor = useEditor({
  extensions: [
    StarterKit,
    ImageChipExtension,
    Placeholder.configure({ placeholder: '내용을 입력하세요' }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'notice-link', target: '_blank', rel: 'noopener noreferrer' },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  content: '',
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.title = props.notice?.title ?? ''
      form.visible = props.notice?.status === 'ACTIVE' || props.notice?.visible !== false

      if (isEdit.value && props.notice?.content) {
        let processedContent = props.notice.content

        if (props.notice.files && props.notice.files.length > 0) {
          const sortedFiles = [...props.notice.files].sort(
            (a, b) => a.displayOrder - b.displayOrder
          )

          sortedFiles.forEach((file, index) => {
            const placeholder = `placeholder-${index}`
            const imgRegex = new RegExp(`<img([^>]*?)src="${placeholder}"([^>]*?)>`, 'g')
            processedContent = processedContent.replace(
              imgRegex,
              `<img$1src="existing-${file.id}"$2 data-file-id="${file.id}">`
            )
          })
        }

        editor.value?.commands.setContent(processedContent)
      } else {
        editor.value?.commands.setContent('')
      }

      errors.title = ''
      errors.content = ''
      linkPopup.visible = false
      linkPopup.url = ''
      imageFiles.value = []
      deleteFileIds.value = []
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function handleImageInsert(event) {
  const file = event.target.files?.[0]
  if (!file) return

  imageFiles.value.push(file)

  editor.value
    ?.chain()
    .focus()
    .setImage({
      src: `placeholder-${imageFiles.value.length - 1}`,
      alt: file.name,
    })
    .run()

  event.target.value = ''
}

async function handleLinkClick() {
  if (editor.value?.isActive('link')) {
    editor.value?.chain().focus().unsetLink().run()
    return
  }
  const prevUrl = editor.value?.getAttributes('link').href ?? ''
  linkPopup.url = prevUrl
  linkPopup.visible = true
  await nextTick()
  linkInputRef.value?.focus()
}

function applyLink() {
  const url = linkPopup.url.trim()
  if (!url) {
    editor.value?.chain().focus().unsetLink().run()
  } else {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
  closeLinkPopup()
}

function closeLinkPopup() {
  linkPopup.visible = false
  linkPopup.url = ''
}

function validate() {
  let valid = true
  errors.title = ''
  errors.content = ''

  if (!form.title.trim()) {
    errors.title = '제목을 입력해주세요.'
    valid = false
  }

  const text = editor.value?.getText() ?? ''
  const html = editor.value?.getHTML() ?? ''
  if (!text.trim() && !html.includes('<img')) {
    errors.content = '내용을 입력해주세요.'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true

  try {
    let contentToSave = editor.value?.getHTML() ?? ''

    if (isEdit.value && props.notice?.files) {
      props.notice.files.forEach((file) => {
        const existingPattern = `existing-${file.id}`
        if (!deleteFileIds.value.includes(file.id)) {
          const fileIndex = props.notice.files.findIndex((f) => f.id === file.id)
          contentToSave = contentToSave.replaceAll(existingPattern, `placeholder-${fileIndex}`)
        }
      })
    }

    if (isEdit.value) {
      await updateNotice(props.notice.id, {
        title: form.title.trim(),
        content: contentToSave,
        status: form.visible ? 'ACTIVE' : 'INACTIVE',
        deleteFileIds: deleteFileIds.value,
        newFiles: imageFiles.value,
      })
      emit('success', 'update')
    } else {
      await createNotice({
        title: form.title.trim(),
        content: contentToSave,
        status: form.visible ? 'ACTIVE' : 'INACTIVE',
        files: imageFiles.value,
      })
      emit('success', 'create')
    }
  } catch (error) {
    errors.title = error?.response?.data?.message || '저장에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

function onClose() {
  if (submitting.value) return
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.modal-close-btn {
  padding: 4px;
  border-radius: 6px;
  color: #6b7280;
  transition: background 0.15s;
}

.modal-close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.modal-body form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #ff7738;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #e66a32;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-base {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.input-base {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.15s;
}

.input-base:focus {
  outline: none;
  border-color: #ff7738;
  box-shadow: 0 0 0 3px rgba(255, 119, 56, 0.1);
}

.input-error {
  border-color: #f87171;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
}

.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-btn {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle-on {
  background: #ff7738;
}

.toggle-off {
  background: #d1d5db;
}

.toggle-knob {
  position: absolute;
  top: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-on .toggle-knob {
  left: 23px;
}

.toggle-off .toggle-knob {
  left: 3px;
}

.toggle-label {
  font-size: 13px;
  color: #374151;
}

.editor-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.editor-container:focus-within {
  border-color: #ff7738;
  box-shadow: 0 0 0 1px rgba(255, 119, 56, 0.2);
}

.editor-container-error {
  border-color: #f87171;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.toolbar-btn:hover {
  background: #e5e7eb;
}

.toolbar-btn.active {
  background: rgba(255, 119, 56, 0.15);
  color: rgba(255, 119, 56, 1);
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background: #e5e7eb;
  margin: 0 4px;
}

.link-popup {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.link-input {
  flex: 1;
  padding: 5px 10px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  outline: none;
  color: #1f2937;
}

.link-input:focus {
  border-color: #ff7738;
  box-shadow: 0 0 0 2px rgba(255, 119, 56, 0.1);
}

.link-apply-btn {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  background: #ff7738;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.link-apply-btn:hover {
  background: #e8642a;
}

.link-cancel-btn {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.link-cancel-btn:hover {
  background: #e5e7eb;
}

.editor-wrapper {
  min-height: 300px;
  cursor: text;
}

.hidden {
  display: none;
}

.text-red-500 {
  color: #ef4444;
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
  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>

<style>
.editor-content .ProseMirror {
  padding: 14px 16px;
  min-height: 300px;
  outline: none;
  font-size: 14px;
  line-height: 1.7;
  color: #1f2937;
}

.editor-content .ProseMirror h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 16px 0 8px;
  line-height: 1.4;
}

.editor-content .ProseMirror h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 14px 0 6px;
  line-height: 1.4;
}

.editor-content .ProseMirror p {
  margin: 0 0 8px;
  line-height: 1.7;
}

.editor-content .ProseMirror ul,
.editor-content .ProseMirror ol {
  padding-left: 0;
  margin: 8px 0 8px 20px;
}

.editor-content .ProseMirror ul {
  list-style-type: disc;
}

.editor-content .ProseMirror ol {
  list-style-type: decimal;
}

.editor-content .ProseMirror li {
  margin-bottom: 4px;
  line-height: 1.6;
}

.editor-content .ProseMirror blockquote {
  border-left: 3px solid #e5e7eb;
  padding-left: 12px;
  color: #6b7280;
  margin: 8px 0;
}

.editor-content .ProseMirror hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 16px 0;
}

.editor-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.editor-content .ProseMirror a.notice-link {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}

.editor-content .ProseMirror a.notice-link:hover {
  color: #1d4ed8;
}

.editor-content .ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 8px 0;
  display: block;
}

.editor-content .ProseMirror [style*='text-align: center'] {
  text-align: center;
}

.editor-content .ProseMirror [style*='text-align: right'] {
  text-align: right;
}

.editor-content .ProseMirror [style*='text-align: left'] {
  text-align: left;
}
</style>
