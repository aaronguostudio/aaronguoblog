<script setup lang="ts">
import { useI18n } from 'vue-i18n'

definePageMeta({
  name: 'build-vinci',
  path: '/build/vinci',
})

const { t } = useI18n()
const localePath = useLocalePath()
const assetPath = '/projects/vinci'

const screens = [
  { key: 'workspace', file: 'workspace.webp', width: 2560, height: 1460 },
  { key: 'connections', file: 'connections.webp', width: 1616, height: 1150 },
  { key: 'automations', file: 'automations.webp', width: 2240, height: 1188 },
] as const

useSeoMeta({
  title: 'Vinci',
  description: () => t('vinciCase.description'),
  ogImage: `${assetPath}/cover.webp`,
})
</script>

<template>
  <article>
    <header class="vinci-hero">
      <div class="vinci-shell mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <div class="vinci-masthead">
          <NuxtLink :to="localePath('/build')" class="vinci-back">
            <Icon name="heroicons:arrow-left" class="h-4 w-4" aria-hidden="true" />
            {{ t('vinciCase.back') }}
          </NuxtLink>
          <img
            :src="`${assetPath}/wordmark.png`"
            alt="Vinci by AT Studio"
            width="1600"
            height="640"
            class="vinci-wordmark"
          />
        </div>

        <div class="vinci-intro">
          <h1 class="vinci-title">
            {{ t('vinciCase.category') }}
            <span>{{ t('vinciCase.purpose') }}</span>
          </h1>
          <div class="min-w-0">
            <p class="vinci-description">{{ t('vinciCase.description') }}</p>
            <p class="vinci-status">{{ t('vinciCase.status') }}</p>
          </div>
        </div>

        <figure class="vinci-cover">
          <div class="vinci-screens">
            <a
              v-for="screen in screens"
              :key="screen.key"
              :href="`${assetPath}/${screen.file}`"
              :aria-label="
                t('vinciCase.openScreen', { screen: t(`vinciCase.screens.${screen.key}.label`) })
              "
              :class="`vinci-screen--${screen.key}`"
              class="vinci-screen"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="vinci-frame">
                <img
                  :src="`${assetPath}/${screen.file}`"
                  :alt="t(`vinciCase.screens.${screen.key}.alt`)"
                  :width="screen.width"
                  :height="screen.height"
                  :fetchpriority="screen.key === 'workspace' ? 'high' : undefined"
                  decoding="async"
                />
              </span>
              <span class="vinci-screen-caption">
                {{ t(`vinciCase.screens.${screen.key}.label`) }}
                <Icon name="heroicons:arrow-up-right" class="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          </div>
          <figcaption class="vinci-caption">
            <img :src="`${assetPath}/avatar.webp`" alt="" width="28" height="28" />
            {{ t('vinciCase.sampleCaption') }}
          </figcaption>
        </figure>
      </div>
    </header>

    <section
      class="vinci-shell mx-auto max-w-[90rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
      aria-labelledby="vinci-workflow-title"
    >
      <div class="vinci-workflow-intro">
        <h2 id="vinci-workflow-title" class="text-3xl font-semibold tracking-tight sm:text-5xl">
          {{ t('vinciCase.workflowTitle') }}
        </h2>
        <p class="max-w-prose text-muted-foreground">{{ t('vinciCase.workflowDescription') }}</p>
      </div>
      <div class="vinci-workflow-grid">
        <figure class="min-w-0">
          <figcaption>
            <h3 class="text-xl font-semibold">{{ t('vinciCase.reviewTitle') }}</h3>
            <p class="mt-2 text-muted-foreground">{{ t('vinciCase.reviewDescription') }}</p>
          </figcaption>
          <a
            :href="`${assetPath}/run-consent.webp`"
            class="vinci-detail-image"
            :aria-label="t('vinciCase.openScreen', { screen: t('vinciCase.reviewTitle') })"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="`${assetPath}/run-consent.webp`"
              :alt="t('vinciCase.reviewImageAlt')"
              width="1292"
              height="1004"
              loading="lazy"
              decoding="async"
            />
          </a>
        </figure>
        <div class="min-w-0">
          <figure>
            <figcaption>
              <h3 class="text-xl font-semibold">{{ t('vinciCase.resultTitle') }}</h3>
              <p class="mt-2 text-muted-foreground">{{ t('vinciCase.resultDescription') }}</p>
            </figcaption>
            <a
              :href="`${assetPath}/run-result.webp`"
              class="vinci-detail-image"
              :aria-label="t('vinciCase.openScreen', { screen: t('vinciCase.resultTitle') })"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                :src="`${assetPath}/run-result.webp`"
                :alt="t('vinciCase.resultImageAlt')"
                width="1836"
                height="482"
                loading="lazy"
                decoding="async"
              />
            </a>
          </figure>
          <section class="mt-7 border-t border-border pt-5" aria-labelledby="vinci-decision-title">
            <h3 id="vinci-decision-title" class="text-xl font-semibold">
              {{ t('vinciCase.decisionTitle') }}
            </h3>
            <p class="mt-2 max-w-prose text-muted-foreground">{{ t('vinciCase.decision') }}</p>
          </section>
        </div>
      </div>
      <footer class="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-border pt-6 text-sm">
        <NuxtLink :to="localePath('/about')" class="underline-offset-4 hover:underline">
          {{ t('vinciCase.about') }}
        </NuxtLink>
        <a
          href="https://vinciat.com/"
          class="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vinci by AT Studio
          <Icon name="heroicons:arrow-up-right" class="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </footer>
    </section>
  </article>
</template>

<style scoped>
.vinci-hero {
  background: #101b17;
  color: #f5f8f4;
  padding-block: 1rem 1.625rem;
}

.vinci-masthead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.vinci-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding-block: 0.375rem;
  color: #c5d9cb;
  font-size: 0.875rem;
}

.vinci-back:hover {
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

.vinci-back:focus-visible,
.vinci-screen:focus-visible,
.vinci-detail-image:focus-visible {
  outline: 2px solid #7ca78d;
  outline-offset: 4px;
}

.vinci-intro {
  display: grid;
  grid-template-columns: minmax(0, 1.26fr) minmax(0, 1fr);
  align-items: end;
  gap: clamp(1rem, 4vw, 3.5rem);
  padding-block: 0.5rem 1.125rem;
}

.vinci-wordmark {
  display: block;
  width: clamp(7rem, 13vw, 11.75rem);
  height: auto;
}

.vinci-title {
  font-size: clamp(1.75rem, 3.6vw, 3rem);
  font-weight: 560;
  letter-spacing: -0.046em;
  line-height: 1.05;
}

.vinci-title span {
  display: block;
  color: #c5e2d1;
}

.vinci-description {
  max-width: 58ch;
  color: #d1ddd4;
  line-height: 1.55;
}

.vinci-status {
  margin-top: 0.625rem;
  color: #b6c9bd;
  font-size: 0.8125rem;
}

.vinci-cover {
  padding: clamp(0.875rem, min(2.15vw, 3svh), 1.875rem) clamp(0.875rem, 2.65vw, 2.25rem) 0.875rem;
  border: 1px solid #a3c8ae4d;
  border-radius: 1rem;
  background:
    radial-gradient(ellipse at 78% 86%, #548b72 0%, #335b4a 32%, #263d34 59%, transparent 82%),
    linear-gradient(120deg, #202e29 0%, #1b2622 54%, #16231f 100%);
}

.vinci-screens {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: clamp(0.625rem, 1.2vw, 1rem);
}

.vinci-screen {
  display: block;
  min-width: 0;
  color: #f1f8f2;
  border-radius: 0.625rem;
}

.vinci-screen--workspace {
  grid-column: 1 / -1;
}

.vinci-frame {
  display: block;
  overflow: hidden;
  border: 1px solid #e0eee3be;
  border-radius: 0.625rem;
  background: #fbfcfb;
  box-shadow: 0 12px 28px -6px #071b13a8;
}

.vinci-frame img,
.vinci-detail-image img {
  display: block;
  width: 100%;
  height: auto;
}

.vinci-screen:not(.vinci-screen--workspace) .vinci-frame {
  aspect-ratio: 1.85;
}

.vinci-screen:not(.vinci-screen--workspace) img {
  height: 100%;
  object-fit: cover;
  object-position: left top;
}

.vinci-screen-caption,
.vinci-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.vinci-screen-caption {
  padding: 0.5rem 0.125rem 0;
  font-weight: 600;
}

.vinci-screen--workspace .vinci-screen-caption {
  justify-content: flex-start;
}

.vinci-screen:hover .vinci-screen-caption {
  text-decoration: underline;
  text-underline-offset: 0.16em;
}

.vinci-caption {
  justify-content: flex-start;
  gap: 0.5rem;
  margin-top: 0.875rem;
  color: #d5e7dc;
}

.vinci-caption img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.vinci-workflow-intro,
.vinci-workflow-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 2rem;
}

.vinci-workflow-intro {
  align-items: end;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.vinci-workflow-grid {
  padding-top: 1.5rem;
}

.vinci-detail-image {
  display: block;
  overflow: hidden;
  margin-top: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}

@media (min-width: 900px) {
  .vinci-hero .vinci-shell {
    max-width: clamp(62rem, 138svh, 90rem);
  }

  .vinci-wordmark {
    max-width: 18svh;
  }

  .vinci-title {
    font-size: clamp(1.75rem, min(3.6vw, 5.4svh), 3rem);
  }

  .vinci-screens {
    grid-template-columns: minmax(0, 3fr) repeat(2, minmax(0, 2fr));
  }

  .vinci-screen--workspace {
    grid-row: 1;
    width: 76%;
    margin-bottom: clamp(2.5rem, 4svh, 3.75rem);
  }

  .vinci-screen--connections,
  .vinci-screen--automations {
    grid-row: 1;
    z-index: 1;
    align-self: end;
  }

  .vinci-screen--connections {
    grid-column: 2;
  }

  .vinci-screen--automations {
    grid-column: 3;
  }
}

@media (max-width: 899px) {
  .vinci-intro {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }
}

@media (max-width: 820px) {
  .vinci-workflow-intro,
  .vinci-workflow-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
