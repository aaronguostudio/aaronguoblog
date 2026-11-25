<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { SignalEdition } from '~/data/signal/editions'

const props = defineProps<{ edition: SignalEdition }>()
const localePath = useLocalePath()
const { locale, t } = useI18n()
const language = computed(() => (locale.value === 'zh' ? 'zh' : 'en'))
const cover = computed(() => props.edition.cover || 'atlas')
const selectedIndex = ref(0)
const current = computed(() => props.edition.items[selectedIndex.value])
const starGroupStart = computed(() => Math.floor(selectedIndex.value / 3) * 3)
const stars = computed(() =>
  props.edition.items.slice(starGroupStart.value, starGroupStart.value + 3),
)
const reader = ref<HTMLElement>()
const sky = ref<HTMLElement>()
const domain = (url: string) => new URL(url).hostname.replace(/^www\./, '')
function sourceLabel(url: string) {
  const source = new URL(url)
  const repository = source.pathname.split('/')[2]
  if (source.hostname === 'github.com' && repository) return repository + ' · GitHub'
  return domain(url)
}

function selectReading(index: number, fromMap = false) {
  selectedIndex.value = index
  if (window.matchMedia('(max-width: 760px)').matches || !fromMap) {
    nextTick(() => {
      reader.value?.focus({ preventScroll: true })
      if (window.matchMedia('(max-width: 760px)').matches)
        reader.value?.scrollIntoView({ block: 'start' })
    })
  }
}

function backToMap() {
  sky.value
    ?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
    ?.focus({ preventScroll: true })
  sky.value?.scrollIntoView({ block: 'start' })
}
</script>

<template>
  <section id="reading-desk" class="issue" :data-cover="cover" aria-labelledby="edition-heading">
    <div class="issue-inner">
      <div class="issue-mast">
        <div>
          <strong>Signal</strong><span aria-hidden="true">/</span
          >{{ t(cover === 'fieldnotes' ? 'signal.fieldNotes' : 'signal.atlasDesk') }}
        </div>
        <nav class="issue-links">
          <NuxtLink :to="localePath('/signal/editions')">{{ t('signal.coverArchive') }}</NuxtLink>
          <NuxtLink :to="localePath('/signal/editions/' + edition.date)">
            <time :datetime="edition.date">{{ edition.date.replaceAll('-', '.') }}</time>
          </NuxtLink>
        </nav>
      </div>

      <div class="issue-body">
        <div ref="sky" class="scene">
          <img
            v-if="cover === 'atlas'"
            class="atlas-art"
            src="/signal/covers/atlas.webp"
            alt=""
            fetchpriority="high"
          />
          <h1 id="edition-heading">{{ edition.headline[language] }}</h1>
          <p v-if="cover !== 'atlas'" class="issue-intro">{{ edition.intro[language] }}</p>
          <div
            v-if="cover === 'atlas'"
            class="stars"
            role="group"
            :aria-label="t('signal.mapLabel')"
          >
            <button
              v-for="(item, i) in stars"
              :key="item.id"
              type="button"
              class="star"
              :aria-pressed="current.id === item.id"
              aria-controls="edition-reader"
              @click="selectReading(starGroupStart + i, true)"
            >
              <span class="star-mark" aria-hidden="true" /><span>{{ item.title[language] }}</span>
            </button>
          </div>
          <a v-if="cover === 'eclipse'" class="source-link" href="#issue-contents"
            >{{ t('signal.readIssue') }} ↓</a
          >
        </div>

        <div v-if="cover === 'eclipse'" id="issue-contents" class="issue-contents">
          <article v-for="item in edition.items" :key="item.id">
            <h2>
              <a :href="item.evidence">{{ item.title[language] }}</a>
            </h2>
            <p>{{ item.note[language] }}</p>
            <a class="source-link" :href="item.evidence">{{ domain(item.evidence) }} ↗</a>
            <a v-if="item.discovery !== item.evidence" class="secondary-link" :href="item.discovery"
              >{{ domain(item.discovery) }} ↗</a
            >
          </article>
        </div>

        <template v-else>
          <nav v-if="cover !== 'atlas'" class="source-index" :aria-label="t('signal.editionLabel')">
            <button
              v-for="(item, i) in edition.items"
              :key="item.id"
              type="button"
              :aria-pressed="current.id === item.id"
              aria-controls="edition-reader"
              @click="selectReading(i)"
            >
              {{ item.title[language] }}
            </button>
          </nav>
          <img v-if="cover === 'fieldnotes'" class="plate" src="/signal/covers/plate.webp" alt="" />
          <div class="reading-column">
            <article
              id="edition-reader"
              ref="reader"
              tabindex="-1"
              aria-live="polite"
              aria-atomic="true"
            >
              <p class="rule-title">{{ t('signal.currentReading') }}</p>
              <h2>{{ current.title[language] }}</h2>
              <div class="byline">{{ sourceLabel(current.evidence) }}</div>
              <p class="reading-copy">{{ current.note[language] }}</p>
              <div class="reading-actions">
                <a
                  class="source-link"
                  :href="current.evidence"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ t('signal.openOriginal') }} ↗</a
                >
                <a
                  v-if="current.discovery !== current.evidence"
                  class="secondary-link"
                  :href="current.discovery"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{
                    domain(current.discovery) === 'x.com'
                      ? t('signal.sourcePost')
                      : domain(current.discovery)
                  }}
                  ↗</a
                >
              </div>
            </article>
            <button v-if="cover === 'atlas'" type="button" class="back-map" @click="backToMap">
              ↑ {{ t('signal.backToMap') }}
            </button>
            <nav
              v-if="cover === 'atlas' && edition.items.length > 1"
              class="other-readings"
              :aria-label="t('signal.otherReadings')"
            >
              <p class="rule-title">{{ t('signal.otherReadings') }}</p>
              <template v-for="(item, i) in edition.items" :key="item.id">
                <button
                  v-if="i !== selectedIndex"
                  type="button"
                  aria-controls="edition-reader"
                  @click="selectReading(i)"
                >
                  <span class="star-mark" aria-hidden="true" />
                  <span
                    >{{ item.title[language] }}<small>{{ sourceLabel(item.evidence) }}</small></span
                  >
                </button>
              </template>
            </nav>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped src="./reading-desk.css"></style>
