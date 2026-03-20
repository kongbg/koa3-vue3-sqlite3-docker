import { createApp, h, ref } from 'vue'

interface MessageOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface MessageItem {
  id: number
  text: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const messages = ref<MessageItem[]>([])
let messageId = 0

const MessageComponent = {
  setup() {
    return () => {
      if (messages.value.length === 0) return null

      return h(
        'div',
        { class: 'message-container' },
        messages.value.map((msg) =>
          h(
            'div',
            {
              key: msg.id,
              class: ['message-item', `message-${msg.type}`],
              onClick: () => removeMessage(msg.id),
            },
            [
              h('span', { class: 'message-icon' }, getIcon(msg.type)),
              h('span', { class: 'message-text' }, msg.text),
            ],
          ),
        ),
      )
    }
  },
}

function getIcon(type: string) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  }
  return icons[type as keyof typeof icons] || 'i'
}

function removeMessage(id: number) {
  const index = messages.value.findIndex((m) => m.id === id)
  if (index > -1) {
    messages.value.splice(index, 1)
  }
}

function showMessage(text: string, options: MessageOptions = {}) {
  const type = options.type || 'info'
  const duration = options.duration ?? 3000

  const id = messageId++
  messages.value.push({ id, text, type })

  if (duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, duration)
  }

  return id
}

export const message = {
  success: (text: string, duration?: number) => showMessage(text, { type: 'success', duration }),
  error: (text: string, duration?: number) => showMessage(text, { type: 'error', duration }),
  warning: (text: string, duration?: number) => showMessage(text, { type: 'warning', duration }),
  info: (text: string, duration?: number) => showMessage(text, { type: 'info', duration }),
  close: removeMessage,
}

export function setupMessage() {
  const app = createApp(MessageComponent)
  const container = document.createElement('div')
  container.id = 'message-wrapper'
  document.body.appendChild(container)
  app.mount(container)
}
