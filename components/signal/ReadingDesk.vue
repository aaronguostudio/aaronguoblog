<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { coverImage, type SignalEdition } from '~/data/signal/editions'

const props = defineProps<{ edition: SignalEdition; previousEditions?: SignalEdition[] }>()
const localePath = useLocalePath()
const { locale, t } = useI18n()
const language = computed(() => (locale.value === 'zh' ? 'zh' : 'en'))
const selectedIndex = ref(0)
const current = computed(() => props.edition.items[selectedIndex.value])

const domain = (url: string) => new URL(url).hostname.replace(/^www\./, '')

function sourceLabel(url: string) {
  const source = new URL(url)
  const repository = source.pathname.split('/')[2]
  if (source.hostname === 'github.com' && repository) return repository + ' · GitHub'
  return domain(url)
}
</script>

<template>
  <section id="reading-desk" class="issue" aria-labelledby="edition-heading">
    <div class="issue-inner">
      <header class="issue-mast">
        <div class="mast-title">
          <NuxtLink :to="localePath('/signal')" class="wordmark">Signal</NuxtLink>
          <span>{{ t('signal.atlasDesk') }}</span>
        </div>
        <NuxtLink :to="localePath('/signal/editions')" class="archive-link">
          {{ t('signal.allEditions') }} <span aria-hidden="true">→</span>
        </NuxtLink>
      </header>

      <div class="issue-body">
        <div class="feature">
          <div class="feature-copy">
            <NuxtLink :to="localePath('/signal/editions/' + edition.date)" class="issue-date">
              <time :datetime="edition.date">{{ edition.date.replaceAll('-', '.') }}</time>
            </NuxtLink>
            <h1 id="edition-heading">{{ edition.headline[language] }}</h1>
            <p class="issue-intro">{{ edition.intro[language] }}</p>
          </div>
          <img
            class="feature-cover"
            :src="coverImage(edition)"
            alt=""
            width="1200"
            height="800"
            fetchpriority="high"
          />
        </div>

        <div class="reading-column">
          <h2 id="issue-readings" class="reading-label">{{ t('signal.editionLabel') }}</h2>
          <div class="reading-index" role="group" aria-labelledby="issue-readings">
            <button
              v-for="(item, index) in edition.items"
              :key="item.id"
              type="button"
              :aria-pressed="selectedIndex === index"
              aria-controls="edition-reader"
              @click="selectedIndex = index"
            >
              <span>{{ item.title[language] }}</span>
            </button>
          </div>
          <article id="edition-reader" aria-live="polite" aria-atomic="true">
            <h3>{{ current.title[language] }}</h3>
            <p class="byline">{{ sourceLabel(current.evidence) }}</p>
            <p class="reading-copy">{{ current.note[language] }}</p>
            <div class="reading-actions">
              <a :href="current.evidence" target="_blank" rel="noopener noreferrer"
                >{{ t('signal.openOriginal') }} <span aria-hidden="true">↗</span></a
              >
              <a
                v-if="current.discovery !== current.evidence"
                class="discovery-link"
                :href="current.discovery"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{
                  domain(current.discovery) === 'x.com'
                    ? t('signal.sourcePost')
                    : domain(current.discovery)
                }}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </div>

      <nav
        v-if="previousEditions?.length"
        class="previous-editions"
        aria-labelledby="previous-editions-heading"
      >
        <h2 id="previous-editions-heading">
          <NuxtLink :to="localePath('/signal/editions')">
            {{ t('signal.coverArchive') }} <span aria-hidden="true">→</span>
          </NuxtLink>
        </h2>
        <ul>
          <li v-for="issue in previousEditions" :key="issue.date">
            <NuxtLink :to="localePath('/signal/editions/' + issue.date)" class="past-edition">
              <img :src="coverImage(issue)" alt="" width="84" height="56" />
              <span>
                <time :datetime="issue.date">{{ issue.date.replaceAll('-', '.') }}</time>
                <span class="past-title">{{ issue.headline[language] }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </section>
</template>

<style scoped src="./reading-desk.css"></style>
