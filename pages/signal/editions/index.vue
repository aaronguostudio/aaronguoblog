<script setup lang="ts">
import { coverImage, signalEditions } from '~/data/signal/editions'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const language = computed(() => (locale.value === 'zh' ? 'zh' : 'en'))
useSeoMeta({ title: () => 'Signal · ' + t('signal.coverArchive') })
</script>

<template>
  <main class="signal-page archive">
    <div class="shelf">
      <NuxtLink class="return" :to="localePath('/signal')">
        <span aria-hidden="true">←</span> {{ t('signal.backToSignal') }}
      </NuxtLink>
      <h1>{{ t('signal.coverArchive') }}</h1>
      <ol class="covers">
        <li v-for="issue in signalEditions" :key="issue.date">
          <NuxtLink :to="localePath('/signal/editions/' + issue.date)" class="cover">
            <img :src="coverImage(issue)" alt="" width="1200" height="800" loading="lazy" />
            <div class="caption">
              <time :datetime="issue.date">{{ issue.date.replaceAll('-', '.') }}</time>
              <h2>{{ issue.headline[language] }}</h2>
              <p>{{ issue.signal?.claim[language] || issue.intro[language] }}</p>
            </div>
            <span class="arrow" aria-hidden="true">→</span>
          </NuxtLink>
        </li>
      </ol>
    </div>
  </main>
</template>

<style scoped>
.archive {
  padding-block: clamp(1rem, 3vw, 2.75rem) 4rem;
}

.shelf {
  width: min(100% - 2.5rem, 70rem);
  margin-inline: auto;
}

.return,
time {
  color: var(--muted-foreground);
  font-size: 0.82rem;
}

.return:hover,
.cover:hover h2 {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

h1,
h2 {
  font-family: Georgia, 'Songti SC', 'Noto Serif CJK SC', 'Noto Serif SC', SimSun, serif;
  font-weight: 600;
  letter-spacing: -0.035em;
}

h1 {
  margin: 0.5rem 0 1.4rem;
  font-size: clamp(2.2rem, 4.5vw, 3.5rem);
  line-height: 1.1;
}

.covers {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 26rem), 1fr));
}

.cover {
  display: grid;
  grid-template-columns: minmax(0, 32%) minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.8rem;
  height: 100%;
  border: 1px solid var(--signal-line);
  border-radius: 0.6rem;
  padding: clamp(0.65rem, 1.5vw, 1rem);
}

.cover:hover {
  background: var(--signal-row-hover);
}

.cover img {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: contain;
  border-radius: 0.28rem;
  background: var(--signal-control);
}

time {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.055em;
}

h2 {
  font-size: clamp(1.15rem, 2.1vw, 1.55rem);
  line-height: 1.17;
  margin: 0.2rem 0 0.35rem;
}

p {
  color: var(--muted-foreground);
  font-size: 0.87rem;
  line-height: 1.45;
}

.arrow {
  color: var(--muted-foreground);
}

@media (max-width: 460px) {
  .cover {
    grid-template-columns: minmax(0, 28%) minmax(0, 1fr);
  }

  .arrow {
    display: none;
  }
}
</style>
