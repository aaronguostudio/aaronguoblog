<script setup lang="ts">
import { useI18n } from 'vue-i18n'

type VoiceState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error'
type TranscriptRole = 'user' | 'assistant'

type TranscriptLine = {
  id: number
  role: TranscriptRole
  text: string
  itemId?: string
}

type VoiceSession = {
  token: string
  agentId: string
}

type VoiceServerEvent = {
  type: string
  delta?: string
  transcript?: string
  item_id?: string
  response_id?: string
  error?: {
    message?: string
  }
}

const { locale } = useI18n()
const { trackEvent } = useRybbitAnalytics()

const isOpen = ref(false)
const state = ref<VoiceState>('idle')
const isMuted = ref(false)
const errorMessage = ref('')
const transcript = ref<TranscriptLine[]>([])
const liveUserTranscript = ref('')
const liveAssistantTranscript = ref('')
const transcriptScroller = ref<HTMLElement | null>(null)

const socket = shallowRef<WebSocket | null>(null)
const mediaStream = shallowRef<MediaStream | null>(null)
const audioContext = shallowRef<AudioContext | null>(null)
const sourceNode = shallowRef<MediaStreamAudioSourceNode | null>(null)
const processorNode = shallowRef<ScriptProcessorNode | null>(null)
const silentGain = shallowRef<GainNode | null>(null)
const playbackSources = new Set<AudioBufferSourceNode>()

let playbackTime = 0
let transcriptId = 0
let conversationStartedAt = 0
let userTurnCount = 0
let activeUserTranscriptItemId = ''
let lastCommittedUserTranscriptAt = 0
const committedUserTranscriptLines = new Map<string, number>()
let activeAssistantResponseId = ''
let lastCommittedAssistantResponseId = ''

function trackVoiceEvent(name: string, properties?: Record<string, string | number>) {
  trackEvent(name, {
    feature: 'voice_assistant',
    locale: locale.value,
    page: import.meta.client ? window.location.pathname : '',
    ...properties,
  })
}

const copy = computed(() => {
  if (locale.value === 'zh') {
    return {
      button: 'Aaron AI',
      title: '和 Aaron AI 聊聊',
      subtitle: 'Aaron 的 AI 语音助手',
      disclosure: '你正在和 Aaron AI 对话，不是真人 Aaron。',
      connect: '正在连接…',
      listening: '正在听',
      thinking: '正在思考',
      speaking: '正在回答',
      muted: '已静音',
      mute: '静音',
      unmute: '取消静音',
      end: '结束对话',
      retry: '重新连接',
      permission: '首次使用时，浏览器会请求麦克风权限。',
      accuracy: 'AI 可能犯错，请核实重要信息。',
      error: '语音助手暂时无法连接。',
      empty: '点击麦克风，开始和 Aaron AI 对话。',
      user: '你',
      assistant: 'Aaron AI',
    }
  }

  return {
    button: 'Aaron AI',
    title: 'Talk with Aaron AI',
    subtitle: "Aaron's AI voice assistant",
    disclosure: "You're talking with Aaron AI, not Aaron himself.",
    connect: 'Connecting…',
    listening: 'Listening',
    thinking: 'Thinking',
    speaking: 'Speaking',
    muted: 'Muted',
    mute: 'Mute',
    unmute: 'Unmute',
    end: 'End conversation',
    retry: 'Reconnect',
    permission: 'Your browser will ask for microphone permission the first time.',
    accuracy: 'AI can make mistakes. Verify important information.',
    error: 'The voice assistant could not connect right now.',
    empty: 'Tap the microphone to start talking with Aaron AI.',
    user: 'You',
    assistant: 'Aaron AI',
  }
})

const isActive = computed(() => state.value !== 'idle' && state.value !== 'error')
const hasTranscriptContent = computed(
  () =>
    transcript.value.some((line) => line.text.trim()) ||
    Boolean(liveUserTranscript.value) ||
    Boolean(liveAssistantTranscript.value),
)
const statusLabel = computed(() => {
  const labels: Record<VoiceState, string> = {
    idle: copy.value.button,
    connecting: copy.value.connect,
    listening: copy.value.listening,
    thinking: copy.value.thinking,
    speaking: copy.value.speaking,
    error: copy.value.error,
  }
  return labels[state.value]
})

function floatToPcm16Base64(input: Float32Array) {
  const bytes = new Uint8Array(input.length * 2)
  const view = new DataView(bytes.buffer)

  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] ?? 0))
    view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }

  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function addTranscript(role: TranscriptRole, text: string, itemId?: string) {
  const cleaned = text.trim()
  if (!cleaned) return undefined

  const line: TranscriptLine = { id: transcriptId++, role, text: cleaned, itemId }
  transcript.value.push(line)
  return line
}

function beginUserTranscript(itemId?: string) {
  const incomingItemId = itemId?.trim() || ''
  if (
    incomingItemId &&
    activeUserTranscriptItemId &&
    incomingItemId !== activeUserTranscriptItemId
  ) {
    liveUserTranscript.value = ''
  }

  if (incomingItemId) activeUserTranscriptItemId = incomingItemId

  // If the user interrupts an assistant response, place the next user turn
  // after the partial assistant message instead of leaving it in the live slot.
  if (!liveUserTranscript.value) commitLiveAssistantTranscript()
}

function updateUserTranscript(text: string, itemId?: string) {
  const cleaned = text.trim()
  if (!cleaned) return

  const incomingItemId = itemId?.trim() || ''
  if (incomingItemId) {
    const committedLineId = committedUserTranscriptLines.get(incomingItemId)
    if (committedLineId !== undefined) {
      const committedLine = transcript.value.find((line) => line.id === committedLineId)
      if (committedLine && cleaned.length >= committedLine.text.length) {
        committedLine.text = cleaned
      }
      liveUserTranscript.value = ''
      activeUserTranscriptItemId = ''
      return
    }

    if (activeUserTranscriptItemId && incomingItemId !== activeUserTranscriptItemId) {
      liveUserTranscript.value = ''
    }
    activeUserTranscriptItemId = incomingItemId
  } else {
    // Some realtime payloads omit item_id. If a longer cumulative transcript
    // arrives after a short final transcript, reconcile it into the existing
    // bubble instead of creating a second history entry.
    const lastUserLine = [...transcript.value].reverse().find((line) => line.role === 'user')
    const withinReconciliationWindow = Date.now() - lastCommittedUserTranscriptAt < 5000
    if (
      lastUserLine &&
      withinReconciliationWindow &&
      cleaned.length > lastUserLine.text.length &&
      cleaned.startsWith(lastUserLine.text)
    ) {
      lastUserLine.text = cleaned
      liveUserTranscript.value = ''
      return
    }
  }

  beginUserTranscript(incomingItemId)
  liveUserTranscript.value = cleaned
}

function commitLiveAssistantTranscript(responseId?: string) {
  const cleaned = liveAssistantTranscript.value.trim()
  if (!cleaned) return

  const resolvedResponseId = responseId || activeAssistantResponseId
  if (resolvedResponseId && resolvedResponseId === lastCommittedAssistantResponseId) {
    liveAssistantTranscript.value = ''
    return
  }

  addTranscript('assistant', cleaned)
  if (resolvedResponseId) lastCommittedAssistantResponseId = resolvedResponseId
  activeAssistantResponseId = ''
  liveAssistantTranscript.value = ''
}

function commitUserTranscript(finalText?: string, itemId?: string) {
  const resolvedItemId = itemId?.trim() || activeUserTranscriptItemId
  const cleaned = (finalText || liveUserTranscript.value).trim()

  if (resolvedItemId) {
    const committedLineId = committedUserTranscriptLines.get(resolvedItemId)
    if (committedLineId !== undefined) {
      const committedLine = transcript.value.find((line) => line.id === committedLineId)
      if (committedLine && cleaned.length >= committedLine.text.length) {
        committedLine.text = cleaned
      }
      liveUserTranscript.value = ''
      activeUserTranscriptItemId = ''
      return
    }
  }

  if (!cleaned) return

  const line = addTranscript('user', cleaned, resolvedItemId)
  if (!line) return

  if (resolvedItemId) committedUserTranscriptLines.set(resolvedItemId, line.id)
  lastCommittedUserTranscriptAt = Date.now()
  liveUserTranscript.value = ''
  activeUserTranscriptItemId = ''
  userTurnCount += 1
  trackVoiceEvent('voice_assistant_turn', { turn_number: userTurnCount })
}

function sessionLanguageInstructions() {
  const defaultLanguage = locale.value === 'zh' ? 'Simplified Chinese' : 'English'
  return [
    'You are Aaron AI, an AI assistant representing the person behind aaronguo.com. You are not Aaron Guo himself and you must never imply that a visitor is speaking with the real Aaron.',
    'Refer to the represented person only as Aaron Guo. Do not use, translate, infer, or volunteer any Chinese name or other alias. If asked who he is, answer simply: Aaron Guo.',
    'Do not merge this Aaron Guo with any other person who shares the name, including people associated with xAI. xAI provides the voice platform; it is not evidence that Aaron works there.',
    'Only state personal facts that are explicitly present in the configured Aaron AI knowledge or on aaronguo.com. When a fact is missing, uncertain, or could belong to a namesake, say that you do not know rather than guessing.',
    'Be transparent that you are an AI and can make mistakes. Encourage visitors to verify important information.',
    "Preserve Aaron AI's existing knowledge, objectives, sales and connection scope, tone, safety rules, tools, and other configured behavior.",
    `The website locale is ${locale.value === 'zh' ? 'Chinese' : 'English'}. Use ${defaultLanguage} as the default response language.`,
    'Match the language the user is clearly speaking when it differs from the site locale.',
    'If the user explicitly asks for a language, switch to that language and continue using it until they request otherwise.',
    'If the language is ambiguous or mixed, use the website locale.',
  ].join(' ')
}

function schedulePcmAudio(base64Audio: string) {
  const context = audioContext.value
  if (!context) return

  const bytes = base64ToBytes(base64Audio)
  const sampleCount = Math.floor(bytes.byteLength / 2)
  const buffer = context.createBuffer(1, sampleCount, 24000)
  const channel = buffer.getChannelData(0)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  for (let index = 0; index < sampleCount; index += 1) {
    channel[index] = view.getInt16(index * 2, true) / 0x8000
  }

  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)

  const startAt = Math.max(context.currentTime + 0.02, playbackTime)
  source.start(startAt)
  playbackTime = startAt + buffer.duration
  playbackSources.add(source)
  state.value = 'speaking'

  source.onended = () => {
    playbackSources.delete(source)
    if (playbackSources.size === 0 && state.value === 'speaking') {
      state.value = 'listening'
    }
  }
}

function sendSessionUpdate() {
  const currentSocket = socket.value
  if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) return

  currentSocket.send(
    JSON.stringify({
      type: 'session.update',
      session: {
        instructions: sessionLanguageInstructions(),
        audio: {
          input: {
            format: { type: 'audio/pcm', rate: 24000 },
            transcription: {
              model: 'grok-transcribe',
              language_hint: locale.value === 'zh' ? 'zh' : 'en',
              keyterms: ['Aaron Guo', 'Aaron Studio', 'aaronguo.com', 'xAI', 'Grok', 'Codex'],
            },
          },
          output: { format: { type: 'audio/pcm', rate: 24000 } },
        },
        turn_detection: { type: 'server_vad' },
      },
    }),
  )
}

function startMicrophoneCapture() {
  const context = audioContext.value
  const stream = mediaStream.value
  const currentSocket = socket.value
  if (!context || !stream || !currentSocket) return

  const source = context.createMediaStreamSource(stream)
  const processor = context.createScriptProcessor(4096, 1, 1)
  const silent = context.createGain()
  silent.gain.value = 0

  processor.onaudioprocess = (event) => {
    if (isMuted.value || currentSocket.readyState !== WebSocket.OPEN) return
    const audio = event.inputBuffer.getChannelData(0)
    currentSocket.send(
      JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: floatToPcm16Base64(audio),
      }),
    )
  }

  source.connect(processor)
  processor.connect(silent)
  silent.connect(context.destination)
  sourceNode.value = source
  processorNode.value = processor
  silentGain.value = silent
}

function handleServerEvent(event: VoiceServerEvent) {
  switch (event.type) {
    case 'response.output_audio.delta':
      if (event.delta) schedulePcmAudio(event.delta)
      break
    case 'response.output_audio_transcript.delta':
      if (event.response_id) activeAssistantResponseId = event.response_id
      liveAssistantTranscript.value += event.delta || ''
      break
    case 'response.output_audio_transcript.done':
      if (event.response_id) activeAssistantResponseId = event.response_id
      if (event.transcript) liveAssistantTranscript.value = event.transcript
      commitLiveAssistantTranscript(event.response_id)
      break
    case 'conversation.item.input_audio_transcription.updated':
      updateUserTranscript(event.transcript || '', event.item_id)
      break
    case 'conversation.item.input_audio_transcription.completed':
      commitUserTranscript(event.transcript, event.item_id)
      break
    case 'input_audio_buffer.speech_started':
      beginUserTranscript()
      state.value = 'listening'
      break
    case 'response.created':
      if (event.response_id) activeAssistantResponseId = event.response_id
      state.value = 'thinking'
      break
    case 'response.done':
      commitLiveAssistantTranscript(event.response_id)
      if (playbackSources.size === 0) state.value = 'listening'
      break
    case 'error':
      trackVoiceEvent('voice_assistant_error', { phase: 'server' })
      errorMessage.value = event.error?.message || copy.value.error
      state.value = 'error'
      break
    default:
      break
  }
}

async function connect() {
  if (isActive.value) return

  errorMessage.value = ''
  state.value = 'connecting'
  transcript.value = []
  liveUserTranscript.value = ''
  liveAssistantTranscript.value = ''
  userTurnCount = 0
  activeUserTranscriptItemId = ''
  lastCommittedUserTranscriptAt = 0
  committedUserTranscriptLines.clear()
  activeAssistantResponseId = ''
  lastCommittedAssistantResponseId = ''

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is not supported in this browser.')
    }

    const session = await $fetch<VoiceSession>('/api/voice/session', { method: 'POST' })
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
    audioContext.value = new AudioContext({ sampleRate: 24000 })
    await audioContext.value.resume()

    const currentSocket = new WebSocket(
      `wss://api.x.ai/v1/realtime?agent_id=${encodeURIComponent(session.agentId)}`,
      [`xai-client-secret.${session.token}`],
    )
    socket.value = currentSocket

    currentSocket.onopen = () => {
      sendSessionUpdate()
      startMicrophoneCapture()
      conversationStartedAt = Date.now()
      trackVoiceEvent('voice_assistant_started')
      state.value = 'listening'
    }
    currentSocket.onmessage = (message) => {
      try {
        handleServerEvent(JSON.parse(message.data as string) as VoiceServerEvent)
      } catch {
        errorMessage.value = copy.value.error
        state.value = 'error'
      }
    }
    currentSocket.onerror = () => {
      trackVoiceEvent('voice_assistant_error', { phase: 'socket' })
      errorMessage.value = copy.value.error
      state.value = 'error'
    }
    currentSocket.onclose = () => {
      if (state.value !== 'idle' && state.value !== 'error') state.value = 'idle'
    }
  } catch (error) {
    trackVoiceEvent('voice_assistant_error', { phase: 'connect' })
    errorMessage.value = error instanceof Error ? error.message : copy.value.error
    state.value = 'error'
    await disconnect(false)
  }
}

async function disconnect(resetState = true) {
  if (conversationStartedAt) {
    trackVoiceEvent('voice_assistant_ended', {
      duration_seconds: Math.max(0, Math.round((Date.now() - conversationStartedAt) / 1000)),
      turns: userTurnCount,
    })
    conversationStartedAt = 0
  }

  processorNode.value?.disconnect()
  sourceNode.value?.disconnect()
  silentGain.value?.disconnect()
  processorNode.value = null
  sourceNode.value = null
  silentGain.value = null

  mediaStream.value?.getTracks().forEach((track) => track.stop())
  mediaStream.value = null

  playbackSources.forEach((source) => source.stop())
  playbackSources.clear()
  playbackTime = 0

  if (socket.value && socket.value.readyState < WebSocket.CLOSING) {
    socket.value.close(1000, 'User ended the conversation')
  }
  socket.value = null

  if (audioContext.value && audioContext.value.state !== 'closed') {
    await audioContext.value.close()
  }
  audioContext.value = null

  if (resetState) {
    state.value = 'idle'
    isMuted.value = false
  }
}

async function toggleAssistant() {
  if (isOpen.value) {
    trackVoiceEvent('voice_assistant_closed')
    isOpen.value = false
    await disconnect()
    return
  }

  trackVoiceEvent('voice_assistant_opened', { source: 'floating_trigger' })
  isOpen.value = true
  await connect()
}

async function retry() {
  await disconnect()
  await connect()
}

async function endConversation() {
  isOpen.value = false
  await disconnect()
}

function toggleMute() {
  isMuted.value = !isMuted.value
}

watch(
  () => [
    transcript.value.map((line) => `${line.id}:${line.text}`).join('|'),
    liveUserTranscript.value,
    liveAssistantTranscript.value,
  ],
  async () => {
    await nextTick()
    if (transcriptScroller.value) {
      transcriptScroller.value.scrollTop = transcriptScroller.value.scrollHeight
    }
  },
)

onBeforeUnmount(() => {
  void disconnect()
})
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
    <div
      v-if="isOpen"
      class="voice-panel mb-3 flex h-[80dvh] max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-1.5rem),24rem)] flex-col overflow-hidden rounded-2xl border border-border shadow-2xl backdrop-blur-2xl sm:w-[min(calc(100vw-2rem),24rem)]"
      role="dialog"
      :aria-label="copy.title"
    >
      <div class="flex items-start justify-between border-b border-border px-4 py-4">
        <div>
          <p class="text-sm font-semibold text-foreground">{{ copy.title }}</p>
          <p class="mt-0.5 text-xs text-muted-foreground">{{ copy.subtitle }}</p>
        </div>
        <button
          type="button"
          class="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :aria-label="copy.end"
          @click="endConversation"
        >
          <svg
            aria-hidden="true"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div ref="transcriptScroller" class="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <p v-if="!hasTranscriptContent" class="text-sm leading-6 text-muted-foreground">
          {{ copy.empty }}
        </p>
        <template v-for="line in transcript" :key="line.id">
          <div v-if="line.text" :class="line.role === 'user' ? 'text-right' : 'text-left'">
            <span
              class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              {{ line.role === 'user' ? copy.user : copy.assistant }}
            </span>
            <p
              class="inline-block max-w-[92%] rounded-xl px-3 py-2 text-sm leading-6"
              :class="
                line.role === 'user'
                  ? 'bg-secondary text-foreground'
                  : 'bg-background text-foreground'
              "
            >
              {{ line.text }}
            </p>
          </div>
        </template>
        <div v-if="liveUserTranscript" class="text-right">
          <span
            class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            {{ copy.user }}
          </span>
          <p
            class="inline-block max-w-[92%] px-3 py-2 text-sm italic leading-6 text-muted-foreground"
          >
            {{ liveUserTranscript }}
          </p>
        </div>
        <div v-if="liveAssistantTranscript" class="text-left">
          <span
            class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            {{ copy.assistant }}
          </span>
          <p
            class="inline-block max-w-[92%] rounded-xl bg-background px-3 py-2 text-sm leading-6 text-foreground"
          >
            {{ liveAssistantTranscript }}
          </p>
        </div>
      </div>

      <div class="border-t border-border px-4 py-3">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-2">
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              :class="
                isActive
                  ? 'bg-emerald-500'
                  : state === 'error'
                    ? 'bg-red-500'
                    : 'bg-muted-foreground'
              "
            />
            <span class="truncate text-xs text-muted-foreground" aria-live="polite">{{
              statusLabel
            }}</span>
          </div>
          <div class="flex w-full justify-end gap-2 sm:w-auto sm:items-center sm:gap-1.5">
            <button
              v-if="isActive"
              type="button"
              class="inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              :aria-label="isMuted ? copy.unmute : copy.mute"
              @click="toggleMute"
            >
              <svg
                aria-hidden="true"
                class="mr-1 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <rect x="8" y="3" width="8" height="12" rx="4" />
                <path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6" stroke-linecap="round" />
                <path v-if="!isMuted" d="M4 4l16 16" stroke-linecap="round" />
              </svg>
              {{ isMuted ? copy.unmute : copy.mute }}
            </button>
            <button
              v-if="isActive"
              type="button"
              class="inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              @click="endConversation"
            >
              {{ copy.end }}
            </button>
            <button
              v-else-if="state === 'error'"
              type="button"
              class="inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              @click="retry"
            >
              {{ copy.retry }}
            </button>
          </div>
        </div>
        <p v-if="errorMessage" class="mt-2 text-xs leading-5 text-red-500">{{ errorMessage }}</p>
        <p class="mt-3 text-[11px] leading-5 text-muted-foreground">{{ copy.disclosure }}</p>
        <p class="mt-1 text-[11px] leading-5 text-muted-foreground">{{ copy.accuracy }}</p>
        <p class="mt-1 text-[11px] leading-5 text-muted-foreground">{{ copy.permission }}</p>
      </div>
    </div>

    <button
      type="button"
      class="voice-trigger group flex h-11 w-11 items-center justify-center rounded-full border border-border p-0 text-xs font-medium text-foreground shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-auto sm:w-auto sm:justify-start sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-sm"
      :class="{ 'ml-auto': isOpen }"
      :aria-expanded="isOpen"
      :aria-label="copy.button"
      @click="toggleAssistant"
    >
      <span
        class="relative flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background sm:h-7 sm:w-7"
      >
        <span
          v-if="isActive"
          class="absolute inset-0 animate-ping rounded-full bg-foreground/30 motion-reduce:animate-none"
        />
        <svg
          aria-hidden="true"
          class="relative h-3.5 w-3.5 sm:h-4 sm:w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="8" y="3" width="8" height="12" rx="4" />
          <path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6" stroke-linecap="round" />
        </svg>
      </span>
      <span class="hidden sm:inline">{{ copy.button }}</span>
    </button>
  </div>
</template>

<style scoped>
.voice-panel {
  background-color: color-mix(in srgb, var(--card) 96%, transparent);
}

.voice-trigger {
  background-color: color-mix(in srgb, var(--card) 98%, transparent);
}

@media (max-width: 639px) {
  .voice-panel {
    background-color: color-mix(in srgb, var(--card) 99%, transparent);
  }
}
</style>
