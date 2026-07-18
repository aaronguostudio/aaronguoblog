<script setup lang="ts">
import type { NoteContentItem } from '~/utils/notes'
import { formatNoteDate, formatNoteNumber, prepareNotes } from '~/utils/notes'

const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data } = await useAsyncData('homepage-builder-notes', () =>
  Promise.all([queryCollection('notesEn').all(), queryCollection('notesZh').all()]),
)

const latestNotes = computed(() => {
  if (!data.value) return []

  const items = data.value[locale.value === 'zh' ? 1 : 0] as unknown as NoteContentItem[]
  return prepareNotes(items, { includeDrafts: process.env.NODE_ENV !== 'production' }).slice(0, 5)
})

const activeMobileIndex = ref(0)
const activeMobileNote = computed(
  () => latestNotes.value[activeMobileIndex.value] || latestNotes.value[0],
)
const desktopNote = activeMobileNote
const hasMultipleNotes = computed(() => latestNotes.value.length > 1)
const mobileTrackStyle = computed(() => ({
  transform: `translateX(-${activeMobileIndex.value * 100}%)`,
}))
const carouselDirection = ref<1 | -1>(1)
const desktopTransitionName = computed(() =>
  carouselDirection.value === 1 ? 'note-slide-next' : 'note-slide-previous',
)

const prefersReducedMotion = ref(false)
const isCarouselPaused = ref(false)

let carouselTimer: ReturnType<typeof setInterval> | undefined
let visibilitySyncTimer: ReturnType<typeof setTimeout> | undefined
let motionQuery: MediaQueryList | undefined
let touchStartX = 0

function noteDate(date: string) {
  return formatNoteDate(date, locale.value === 'zh' ? 'zh-CN' : 'en-US')
}

function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = undefined
  }
}

function startCarousel() {
  stopCarousel()

  if (
    !import.meta.client ||
    !hasMultipleNotes.value ||
    prefersReducedMotion.value ||
    isCarouselPaused.value ||
    document.hidden
  ) {
    return
  }

  carouselTimer = window.setInterval(() => {
    carouselDirection.value = 1
    activeMobileIndex.value = (activeMobileIndex.value + 1) % latestNotes.value.length
  }, 6500)
}

function pauseCarousel() {
  isCarouselPaused.value = true
  stopCarousel()
}

function resumeCarousel() {
  isCarouselPaused.value = false
  startCarousel()
}

function handleCarouselFocusOut(event: FocusEvent) {
  const section = event.currentTarget as HTMLElement | null
  const nextTarget = event.relatedTarget as Node | null

  if (section && nextTarget && section.contains(nextTarget)) return
  resumeCarousel()
}

function goToNote(index: number) {
  if (index === activeMobileIndex.value) return

  carouselDirection.value = index > activeMobileIndex.value ? 1 : -1
  activeMobileIndex.value = index
  startCarousel()
}

function stepNote(direction: 1 | -1) {
  if (!hasMultipleNotes.value) return

  carouselDirection.value = direction
  activeMobileIndex.value =
    (activeMobileIndex.value + direction + latestNotes.value.length) % latestNotes.value.length
  startCarousel()
}

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0]?.clientX ?? 0
  stopCarousel()
}

function handleTouchEnd(event: TouchEvent) {
  const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX
  const distance = touchEndX - touchStartX

  if (Math.abs(distance) > 48 && hasMultipleNotes.value) {
    const direction = distance > 0 ? -1 : 1
    stepNote(direction)
  }

  startCarousel()
}

function syncMotionPreference() {
  prefersReducedMotion.value = motionQuery?.matches ?? false
  startCarousel()
}

function syncPageVisibility() {
  if (document.hidden) stopCarousel()
  else startCarousel()
}

watch(
  () => latestNotes.value.length,
  (length) => {
    if (activeMobileIndex.value >= length) activeMobileIndex.value = 0
    startCarousel()
  },
)

watch(prefersReducedMotion, startCarousel)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  motionQuery.addEventListener('change', syncMotionPreference)
  document.addEventListener('visibilitychange', syncPageVisibility)
  syncMotionPreference()
  visibilitySyncTimer = window.setTimeout(syncPageVisibility, 250)
})

onBeforeUnmount(() => {
  stopCarousel()
  if (visibilitySyncTimer) clearTimeout(visibilitySyncTimer)
  motionQuery?.removeEventListener('change', syncMotionPreference)
  document.removeEventListener('visibilitychange', syncPageVisibility)
})
</script>

<template>
  <section
    v-if="latestNotes.length"
    class="border-t border-[color:var(--line-subtle)] lg:hidden"
    :aria-label="t('notes.latest')"
  >
    <div class="px-5 py-4 sm:px-6 sm:py-5">
      <div class="mb-3 flex items-center justify-between gap-3">
        <span
          class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--notes-accent)]"
        >
          {{ t('notes.latest') }}
        </span>
        <div v-if="activeMobileNote" class="flex min-w-0 items-center gap-2">
          <time
            :datetime="activeMobileNote.date"
            class="truncate text-right font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {{ noteDate(activeMobileNote.date) }}
          </time>
          <NuxtLink
            :to="localePath('/notes')"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:text-[color:var(--notes-accent)] focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
            :aria-label="t('notes.viewAll')"
          >
            <Icon name="heroicons:arrow-up-right" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        :aria-label="t('notes.latest')"
        class="overflow-hidden"
        @mouseenter="pauseCarousel"
        @mouseleave="resumeCarousel"
        @focusin="pauseCarousel"
        @focusout="handleCarouselFocusOut"
        @touchstart.passive="handleTouchStart"
        @touchend.passive="handleTouchEnd"
      >
        <div
          class="flex will-change-transform transition-transform duration-700 ease-out motion-reduce:transition-none"
          :style="mobileTrackStyle"
        >
          <article v-for="note in latestNotes" :key="note.path" class="w-full shrink-0">
            <NuxtLink
              v-if="note.image"
              :to="localePath(note.path)"
              class="group relative mb-4 hidden aspect-video overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)] md:block"
            >
              <NuxtImg
                :src="note.image"
                :alt="note.alt || note.title"
                width="768"
                height="432"
                sizes="(max-width: 639px) calc(100vw - 40px), 640px"
                format="webp"
                quality="82"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
              />
              <Icon
                name="heroicons:arrow-up-right"
                class="absolute right-3 top-3 h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
              />
            </NuxtLink>

            <NuxtLink
              :to="localePath(note.path)"
              class="group block outline-none focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
            >
              <h2
                class="mb-1.5 text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-[color:var(--notes-accent)]"
              >
                {{ note.title }}
              </h2>
              <p class="line-clamp-2 text-[15px] leading-6 text-muted-foreground">
                {{ note.hook }}
              </p>
            </NuxtLink>
          </article>
        </div>
      </div>

      <div v-if="hasMultipleNotes" class="mt-4 flex items-center justify-center gap-2">
        <button
          v-for="(_, index) in latestNotes"
          :key="index"
          type="button"
          :aria-label="t('notes.showSlide', { number: index + 1 })"
          :aria-current="index === activeMobileIndex ? 'true' : undefined"
          class="h-3 min-w-3 rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
          @click="goToNote(index)"
        >
          <span
            class="block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none"
            :class="
              index === activeMobileIndex ? 'w-5 bg-[var(--notes-accent)]' : 'w-1.5 bg-border'
            "
          />
        </button>
      </div>
    </div>
  </section>

  <section
    v-if="desktopNote"
    class="hidden h-full flex-col border-l border-[color:var(--line-subtle)] lg:flex"
    :aria-label="t('notes.latest')"
    role="region"
    aria-roledescription="carousel"
    @mouseenter="pauseCarousel"
    @mouseleave="resumeCarousel"
    @focusin="pauseCarousel"
    @focusout="handleCarouselFocusOut"
  >
    <div class="h-full overflow-hidden px-7 py-6">
      <div class="flex h-full flex-col">
        <div class="min-h-0 flex-1 overflow-hidden">
          <Transition :name="desktopTransitionName" mode="out-in">
            <article
              :key="desktopNote.path"
              class="grid h-full w-full gap-6"
              :class="
                desktopNote.image
                  ? 'grid-cols-[minmax(0,1fr)_minmax(9.5rem,0.52fr)]'
                  : 'grid-cols-1'
              "
            >
              <div class="min-w-0">
                <NuxtLink
                  :to="localePath(desktopNote.path)"
                  class="group block outline-none focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
                >
                  <div
                    class="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--notes-accent)]"
                  >
                    <span>{{ t('notes.latest') }}</span>
                    <span class="h-3 w-px bg-[var(--notes-accent-muted)]" aria-hidden="true" />
                    <span>{{ formatNoteNumber(desktopNote.number, activeMobileIndex) }}</span>
                  </div>
                  <h2
                    class="mb-2 text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-[color:var(--notes-accent)]"
                  >
                    {{ desktopNote.title }}
                  </h2>
                  <p class="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {{ desktopNote.hook }}
                  </p>
                </NuxtLink>
              </div>

              <div v-if="desktopNote.image" class="flex min-w-0 flex-col">
                <time
                  :datetime="desktopNote.date"
                  class="mb-2 text-right font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {{ noteDate(desktopNote.date) }}
                </time>
                <NuxtLink
                  :to="localePath(desktopNote.path)"
                  class="group relative aspect-video w-full flex-none overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
                >
                  <NuxtImg
                    :src="desktopNote.image"
                    :alt="desktopNote.alt || desktopNote.title"
                    width="640"
                    height="360"
                    sizes="(max-width: 1279px) 164px, 252px"
                    format="webp"
                    quality="82"
                    class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
                  />
                  <Icon
                    name="heroicons:arrow-up-right"
                    class="absolute right-3 top-3 h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                  />
                </NuxtLink>
              </div>
            </article>
          </Transition>
        </div>

        <div class="mt-4 flex min-h-9 shrink-0 items-center justify-between gap-4">
          <NuxtLink
            :to="localePath('/notes')"
            class="inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm font-medium text-foreground outline-none transition-colors hover:text-[color:var(--notes-accent)] focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
          >
            {{ t('notes.viewAll') }}
            <Icon name="heroicons:arrow-right" class="h-4 w-4" />
          </NuxtLink>

          <div v-if="hasMultipleNotes" class="flex shrink-0 items-center gap-1">
            <button
              v-for="(_, index) in latestNotes"
              :key="index"
              type="button"
              :aria-label="t('notes.showSlide', { number: index + 1 })"
              :aria-current="index === activeMobileIndex ? 'true' : undefined"
              class="inline-flex h-8 min-w-4 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--notes-accent)]"
              @click="goToNote(index)"
            >
              <span
                class="block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none"
                :class="
                  index === activeMobileIndex ? 'w-5 bg-[var(--notes-accent)]' : 'w-1.5 bg-border'
                "
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.note-slide-next-enter-active,
.note-slide-next-leave-active,
.note-slide-previous-enter-active,
.note-slide-previous-leave-active {
  transition:
    opacity 260ms ease,
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.note-slide-next-enter-from,
.note-slide-previous-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.note-slide-next-leave-to,
.note-slide-previous-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

@media (prefers-reduced-motion: reduce) {
  .note-slide-next-enter-active,
  .note-slide-next-leave-active,
  .note-slide-previous-enter-active,
  .note-slide-previous-leave-active {
    transition: none;
  }
}
</style>
