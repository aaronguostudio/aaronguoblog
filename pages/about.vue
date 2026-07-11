<script lang="ts" setup>
import { MotionConfig, motion, useReducedMotion } from 'motion-v'
import AboutScrollJourney from '~/components/about/AboutScrollJourney.vue'
import { socialLinks } from '~/data'

const { t } = useI18n()
const localePath = useLocalePath()
const prefersReducedMotion = useReducedMotion()

useHead({
  title: t('about.title'),
  meta: [
    {
      name: 'description',
      content: t('about.description'),
    },
  ],
})

defineOgImageComponent('About', {
  headline: 'About 👋',
  title: t('about.title'),
  description: t('about.description'),
})

const nowItems = computed(() => [
  {
    key: 'building',
    icon: 'heroicons:cube-transparent',
    title: t('about.now.building.title'),
    description: t('about.now.building.description'),
  },
  {
    key: 'writing',
    icon: 'heroicons:pencil-square',
    title: t('about.now.writing.title'),
    description: t('about.now.writing.description'),
  },
  {
    key: 'making-room',
    icon: 'heroicons:moon',
    title: t('about.now.makingRoom.title'),
    description: t('about.now.makingRoom.description'),
  },
])

const socialItems = computed(() => [
  { key: 'linkedin', label: 'LinkedIn', icon: 'mdi:linkedin', href: socialLinks.linkedinLink },
  { key: 'github', label: 'GitHub', icon: 'mdi:github', href: socialLinks.githubLink },
  { key: 'twitter', label: 'X', icon: 'ri:twitter-x-fill', href: socialLinks.twitterLink },
  { key: 'youtube', label: 'YouTube', icon: 'mdi:youtube', href: socialLinks.youtubeLink },
])

const revealTransition = {
  duration: 0.82,
  ease: [0.22, 1, 0.36, 1] as const,
}
</script>

<template>
  <div class="about-page">
    <MotionConfig reduced-motion="user" :transition="{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }">
      <main class="overflow-clip">
        <AboutScrollJourney />

        <section class="about-section border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <motion.div
            class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:items-end"
            :initial="prefersReducedMotion ? false : { opacity: 0, y: 44 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, amount: 0.3 }"
            :transition="revealTransition"
          >
            <div>
              <p class="about-accent font-mono text-[11px] uppercase tracking-[0.18em]">
                {{ t('about.humanFirst.eyebrow') }}
              </p>
              <blockquote class="mt-6 flex gap-5 sm:gap-8">
                <Icon
                  name="tabler:quote"
                  class="about-accent mt-1 h-10 w-10 shrink-0 sm:h-14 sm:w-14"
                />
                <p
                  class="about-heading max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-5xl lg:text-7xl"
                >
                  {{ t('about.humanFirst.quote') }}
                </p>
              </blockquote>
            </div>
            <p class="about-description-rule about-muted border-l pl-6 text-base leading-7">
              {{ t('about.humanFirst.description') }}
            </p>
          </motion.div>
        </section>

        <section class="about-section border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
          <div class="mx-auto max-w-7xl">
            <motion.div
              :initial="prefersReducedMotion ? false : { opacity: 0, y: 30 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :viewport="{ once: true, amount: 0.45 }"
              :transition="revealTransition"
            >
              <p class="about-accent font-mono text-[11px] uppercase tracking-[0.18em]">
                {{ t('about.now.eyebrow') }}
              </p>
              <h2 class="about-heading mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                {{ t('about.now.title') }}
              </h2>
            </motion.div>

            <div class="about-divider-grid mt-12 grid border-y md:grid-cols-3">
              <motion.article
                v-for="(item, index) in nowItems"
                :key="item.key"
                class="about-divider-card border-b py-8 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
                :initial="prefersReducedMotion ? false : { opacity: 0, y: 30 }"
                :while-in-view="{ opacity: 1, y: 0 }"
                :viewport="{ once: true, amount: 0.45 }"
                :transition="{ ...revealTransition, delay: index * 0.08 }"
              >
                <div
                  class="about-icon-box flex h-10 w-10 items-center justify-center rounded-lg border"
                >
                  <Icon :name="item.icon" class="h-5 w-5" />
                </div>
                <h3 class="about-heading mt-5 text-xl font-semibold">{{ item.title }}</h3>
                <p class="about-muted mt-3 max-w-sm leading-7">{{ item.description }}</p>
              </motion.article>
            </div>
          </div>
        </section>

        <section class="about-section border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div
            class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:items-center"
          >
            <motion.figure
              class="about-media-frame group overflow-hidden rounded-2xl border"
              :initial="prefersReducedMotion ? false : { opacity: 0, y: 42, scale: 0.985 }"
              :while-in-view="{ opacity: 1, y: 0, scale: 1 }"
              :viewport="{ once: true, amount: 0.3 }"
              :transition="revealTransition"
            >
              <img
                src="/blogs-img/2026-06-20-ai-os-cover.webp"
                :alt="t('about.road.body1')"
                width="2048"
                height="1152"
                loading="lazy"
                decoding="async"
                class="aspect-video h-auto w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.018] motion-reduce:transition-none"
              />
            </motion.figure>

            <motion.div
              :initial="prefersReducedMotion ? false : { opacity: 0, y: 38 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :viewport="{ once: true, amount: 0.35 }"
              :transition="{ ...revealTransition, delay: 0.08 }"
            >
              <p class="about-accent font-mono text-[11px] uppercase tracking-[0.18em]">
                {{ t('about.road.eyebrow') }}
              </p>
              <h2
                class="about-heading mt-4 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl"
              >
                {{ t('about.road.title') }}
              </h2>
              <p class="about-copy mt-7 text-lg leading-8">{{ t('about.road.body1') }}</p>
              <p class="about-muted mt-5 leading-7">{{ t('about.road.body2') }}</p>
              <NuxtLink
                :to="localePath('/blogs')"
                class="about-outline-link group mt-8 inline-flex items-center gap-3 rounded-lg border px-5 py-3 font-medium outline-none transition-colors focus-visible:ring-2"
              >
                {{ t('about.road.cta') }}
                <Icon
                  name="heroicons:arrow-right"
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </NuxtLink>
            </motion.div>
          </div>
        </section>

        <section class="about-section border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <motion.div
            class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-end"
            :initial="prefersReducedMotion ? false : { opacity: 0, y: 36 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, amount: 0.35 }"
            :transition="revealTransition"
          >
            <div>
              <p class="about-accent font-mono text-[11px] uppercase tracking-[0.18em]">
                {{ t('about.connect.eyebrow') }}
              </p>
              <h2
                class="about-heading mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl"
              >
                {{ t('about.connect.title') }}
              </h2>
              <p class="about-muted mt-6 max-w-xl text-lg leading-8">
                {{ t('about.connect.description') }}
              </p>
            </div>

            <div>
              <div class="flex flex-wrap gap-3">
                <a
                  v-for="item in socialItems"
                  :key="item.key"
                  :href="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="about-outline-link group inline-flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2"
                  data-rybbit-event="outbound_click"
                  :data-rybbit-prop-platform="item.key"
                  data-rybbit-prop-location="about"
                >
                  <Icon :name="item.icon" class="h-4 w-4" />
                  {{ item.label }}
                  <Icon
                    name="heroicons:arrow-up-right"
                    class="about-faint h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </a>
              </div>
              <NuxtLink
                :to="localePath('/notes')"
                class="about-text-link mt-5 inline-flex items-center gap-3 font-medium outline-none focus-visible:ring-2"
              >
                {{ t('about.connect.notesCta') }}
                <Icon name="heroicons:arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </div>
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  </div>
</template>

<style scoped>
.about-page {
  --about-bg: #f6f3ec;
  --about-surface: #fffdf8;
  --about-text: #191714;
  --about-copy: #45413a;
  --about-muted: #625f58;
  --about-faint: #817c73;
  --about-line: rgb(25 23 20 / 0.13);
  --about-line-strong: rgb(25 23 20 / 0.24);
  --about-accent: #0e7490;
  --about-accent-hover: #075985;

  background: var(--about-bg);
  color: var(--about-text);
  transition:
    background-color 300ms ease,
    color 300ms ease;
}

:global(html.dark .about-page) {
  --about-bg: #050608;
  --about-surface: #070809;
  --about-text: #f8f1e4;
  --about-copy: rgb(255 255 255 / 0.68);
  --about-muted: rgb(255 255 255 / 0.58);
  --about-faint: rgb(255 255 255 / 0.38);
  --about-line: rgb(255 255 255 / 0.1);
  --about-line-strong: rgb(255 255 255 / 0.18);
  --about-accent: #67e8f9;
  --about-accent-hover: #cffafe;
}

.about-section,
.about-divider-grid,
.about-divider-card,
.about-description-rule {
  border-color: var(--about-line);
}

.about-heading {
  color: var(--about-text);
}

.about-copy {
  color: var(--about-copy);
}

.about-muted {
  color: var(--about-muted);
}

.about-faint {
  color: var(--about-faint);
}

.about-accent {
  color: var(--about-accent);
}

.about-icon-box {
  border-color: var(--about-line-strong);
  color: var(--about-accent);
}

.about-media-frame {
  border-color: var(--about-line);
  background: var(--about-surface);
}

.about-outline-link {
  border-color: var(--about-line-strong);
  color: var(--about-text);
  --tw-ring-color: var(--about-accent);
}

.about-outline-link:hover {
  border-color: var(--about-accent);
  color: var(--about-accent-hover);
}

.about-text-link {
  color: var(--about-accent);
  --tw-ring-color: var(--about-accent);
}

.about-text-link:hover {
  color: var(--about-accent-hover);
}
</style>
