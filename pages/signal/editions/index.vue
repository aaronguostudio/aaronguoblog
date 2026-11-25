<script setup lang="ts">
import { coverImage, signalEditions } from '~/data/signal/editions'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const language = computed(() => (locale.value === 'zh' ? 'zh' : 'en'))
useSeoMeta({ title: () => 'Signal · ' + t('signal.coverArchive') })
</script>

<template>
  <main class="archive">
    <div class="shelf">
      <NuxtLink class="return" :to="localePath('/signal')"
        >← {{ t('signal.backToSignal') }}</NuxtLink
      >
      <h1>{{ t('signal.coverArchive') }}</h1>
      <ol class="covers">
        <li v-for="issue in signalEditions" :key="issue.date">
          <NuxtLink :to="localePath('/signal/editions/' + issue.date)" class="cover">
            <img :src="coverImage(issue)" alt="" width="560" height="352" />
            <div class="caption">
              <time :datetime="issue.date">{{ issue.date.replaceAll('-', '.') }}</time>
              <h2>{{ issue.headline[language] }}</h2>
              <p>{{ issue.signal?.claim[language] || issue.intro[language] }}</p>
            </div>
          </NuxtLink>
        </li>
      </ol>
    </div>
  </main>
</template>

<style scoped>
.archive {
  background: var(--background);
  color: var(--foreground);
  min-height: 75vh;
  padding: clamp(2rem, 5vw, 5rem) clamp(1.25rem, 6vw, 6rem);
  font-family: Georgia, 'Songti SC', serif;
}
.shelf {
  margin: auto;
  max-width: 76rem;
}
.return,
time {
  font:
    0.82rem/1.6 system-ui,
    sans-serif;
  color: var(--muted-foreground);
}
.return:hover,
.cover:hover h2 {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
h1 {
  margin: 1.5rem 0 2.5rem;
  font-size: clamp(2.7rem, 6vw, 5rem);
  line-height: 1.1;
}
.covers {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 28rem), 1fr));
}
.cover {
  display: block;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}
.cover img {
  width: 100%;
  aspect-ratio: 1.85;
  object-fit: cover;
}
.caption {
  padding-block: 1rem;
}
time {
  letter-spacing: 0.13em;
}
h2 {
  font-size: clamp(1.55rem, 3vw, 2.35rem);
  line-height: 1.2;
  margin: 0.6rem 0;
  text-wrap: balance;
}
p {
  color: var(--muted-foreground);
  line-height: 1.65;
  max-width: 48ch;
}
</style>
