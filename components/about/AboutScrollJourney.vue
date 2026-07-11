<script setup lang="ts">
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion-v'

const { t } = useI18n()
const localePath = useLocalePath()

const journeyRef = ref<HTMLElement | null>(null)
const activeStageIndex = ref(0)
const prefersReducedMotion = useReducedMotion()

const stages = computed(() => [
  {
    key: 'build',
    label: t('about.stages.build.label'),
    railLabel: t('about.stages.build.railLabel'),
    title: t('about.stages.build.title'),
    description: t('about.stages.build.description'),
    cta: t('about.stages.build.cta'),
    path: '/build',
  },
  {
    key: 'think',
    label: t('about.stages.think.label'),
    railLabel: t('about.stages.think.railLabel'),
    title: t('about.stages.think.title'),
    description: t('about.stages.think.description'),
    cta: t('about.stages.think.cta'),
    path: '/blogs',
  },
  {
    key: 'play',
    label: t('about.stages.play.label'),
    railLabel: t('about.stages.play.railLabel'),
    title: t('about.stages.play.title'),
    description: t('about.stages.play.description'),
    cta: t('about.stages.play.cta'),
    path: '/videos',
  },
])

const ways = computed(() => [
  {
    key: 'build',
    icon: 'heroicons:cube-transparent',
    title: t('about.ways.build.title'),
    description: t('about.ways.build.description'),
    path: '/build',
  },
  {
    key: 'write',
    icon: 'heroicons:pencil-square',
    title: t('about.ways.write.title'),
    description: t('about.ways.write.description'),
    path: '/blogs',
  },
  {
    key: 'play',
    icon: 'heroicons:musical-note',
    title: t('about.ways.play.title'),
    description: t('about.ways.play.description'),
    path: '/videos',
  },
  {
    key: 'live',
    icon: 'heroicons:heart',
    title: t('about.ways.live.title'),
    description: t('about.ways.live.description'),
    path: '/notes',
  },
])

const activeStage = computed(() => stages.value[activeStageIndex.value] ?? stages.value[0])

const { scrollYProgress } = useScroll({
  target: journeyRef,
  offset: ['start start', 'end end'],
})
const smoothProgress = useSpring(scrollYProgress, {
  stiffness: 92,
  damping: 28,
  mass: 0.32,
})
const heroScale = useTransform(smoothProgress, [0, 1], [1.035, 1])
const heroX = useTransform(smoothProgress, [0, 1], [0, -18])

const stageTransition = {
  duration: 0.68,
  ease: [0.22, 1, 0.36, 1] as const,
}
const revealTransition = {
  duration: 0.78,
  ease: [0.22, 1, 0.36, 1] as const,
}

let stopScrollListener: (() => void) | undefined

onMounted(() => {
  stopScrollListener = scrollYProgress.on('change', (progress) => {
    const nextStage = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2
    if (nextStage !== activeStageIndex.value) activeStageIndex.value = nextStage
  })
})

onBeforeUnmount(() => {
  stopScrollListener?.()
})
</script>

<template>
  <section ref="journeyRef" class="about-journey">
    <!-- Desktop: one cinematic scene whose narrative changes as the page scrolls. -->
    <div class="about-journey__desktop hidden lg:block">
      <div class="about-journey__sticky">
        <div
          class="about-hero-panel relative min-h-0 overflow-hidden border-b border-white/10 bg-[#050608] text-[#f8f1e4]"
        >
          <motion.div
            class="absolute inset-0"
            :style="prefersReducedMotion ? undefined : { scale: heroScale, x: heroX }"
          >
            <img
              src="/about/aaron-about-road-hero.webp"
              :alt="t('about.stages.build.description')"
              width="1664"
              height="936"
              fetchpriority="high"
              decoding="async"
              class="h-full w-full object-cover object-center"
            />
          </motion.div>

          <div class="relative z-10 mx-auto h-full max-w-8xl px-4">
            <div class="flex h-full min-w-0 flex-col justify-center px-12 py-7 xl:px-20">
              <div class="about-stage-meta mb-7 flex flex-wrap items-center gap-4">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/35 p-1 backdrop-blur-md"
                >
                  <NuxtImg
                    src="/ai-native-builder-avatar.jpg"
                    alt="Aaron Guo"
                    width="88"
                    height="88"
                    sizes="36px"
                    format="webp"
                    quality="82"
                    class="h-full w-full rounded-full object-cover ring-1 ring-white/20"
                  />
                </div>

                <ol
                  class="about-stage-switch flex h-11 w-fit items-center gap-7 rounded-full border border-white/15 bg-black/35 px-5 text-xs font-medium backdrop-blur-md"
                  aria-label="Scroll story stages"
                >
                  <li
                    v-for="(stage, index) in stages"
                    :key="stage.key"
                    class="flex items-center gap-2.5 transition-colors duration-500"
                    :class="index === activeStageIndex ? 'text-white' : 'text-white/50'"
                    :aria-current="index === activeStageIndex ? 'step' : undefined"
                  >
                    <Icon
                      :name="index === activeStageIndex ? 'ph:circle-fill' : 'ph:minus'"
                      class="h-2.5 w-2.5"
                      :class="index === activeStageIndex ? 'text-cyan-300' : 'text-white/35'"
                    />
                    {{ stage.label }}
                  </li>
                </ol>
              </div>

              <AnimatePresence mode="wait" :initial="false">
                <motion.div
                  :key="activeStage.key"
                  class="about-stage-copy max-w-[38rem]"
                  :initial="prefersReducedMotion ? false : { opacity: 0, y: 28 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :exit="prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }"
                  :transition="stageTransition"
                >
                  <h1
                    class="about-display max-w-[11ch] text-5xl font-semibold leading-[0.96] tracking-[-0.055em] xl:text-7xl"
                  >
                    {{ activeStage.title }}
                  </h1>
                  <div class="about-stage-description mt-6 flex max-w-[34rem] items-center gap-4">
                    <p class="text-base leading-7 text-white/72 xl:text-lg">
                      {{ activeStage.description }}
                    </p>
                    <Icon
                      name="ph:wave-sine"
                      class="hidden h-10 w-24 shrink-0 text-cyan-300 xl:block"
                    />
                  </div>
                  <NuxtLink
                    :to="localePath(activeStage.path)"
                    class="about-stage-cta group inline-flex items-center gap-4 rounded-lg bg-[#f8f1e4] px-6 py-3.5 font-semibold text-[#09090b] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transition-none"
                  >
                    {{ activeStage.cta }}
                    <Icon
                      name="heroicons:arrow-right"
                      class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                    />
                  </NuxtLink>
                </motion.div>
              </AnimatePresence>

              <div
                class="about-scroll-hint mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/42"
              >
                <Icon name="heroicons:arrow-down" class="h-3.5 w-3.5 text-cyan-300" />
                {{ t('about.scrollHint') }}
              </div>
            </div>
          </div>
        </div>

        <div class="about-ways-panel min-h-0 overflow-hidden">
          <div
            class="about-ways-grid mx-auto grid h-full max-w-8xl min-h-0 min-w-0 grid-cols-[0.82fr_repeat(4,minmax(0,1fr))] overflow-hidden px-12 py-7 xl:px-20"
          >
            <div class="pr-7">
              <p class="about-accent font-mono text-[10px] uppercase tracking-[0.16em]">
                {{ t('about.ways.eyebrow') }}
              </p>
              <h2
                class="about-heading mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em]"
              >
                {{ t('about.ways.title') }}
              </h2>
              <p class="about-muted about-ways-intro mt-3 text-sm leading-6">
                {{ t('about.ways.intro') }}
              </p>
            </div>

            <article
              v-for="way in ways"
              :key="way.key"
              class="about-divider-left about-way-card group border-l px-5 xl:px-7"
            >
              <div
                class="about-icon-box flex h-9 w-9 items-center justify-center rounded-lg border"
              >
                <Icon :name="way.icon" class="h-[18px] w-[18px]" />
              </div>
              <h3 class="about-heading mt-4 text-[15px] font-semibold leading-5 xl:text-base">
                {{ way.title }}
              </h3>
              <p class="about-muted mt-2 line-clamp-3 text-xs leading-5 xl:text-sm">
                {{ way.description }}
              </p>
              <NuxtLink
                :to="localePath(way.path)"
                class="about-text-link mt-3 inline-flex items-center gap-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2"
              >
                {{ t('about.ways.explore') }}
                <Icon name="heroicons:arrow-right" class="h-3.5 w-3.5" />
              </NuxtLink>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: the same story unfolds as readable sections instead of a pinned canvas. -->
    <div class="lg:hidden">
      <figure class="relative h-[58svh] min-h-[430px] overflow-hidden border-b border-white/10">
        <img
          src="/about/aaron-about-road-hero.webp"
          :alt="t('about.stages.build.description')"
          width="1664"
          height="936"
          fetchpriority="high"
          decoding="async"
          class="h-full w-full object-cover object-[68%_center]"
        />
        <div class="absolute left-5 top-5 flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/55 p-1 backdrop-blur-md"
          >
            <NuxtImg
              src="/ai-native-builder-avatar.jpg"
              alt="Aaron Guo"
              width="80"
              height="80"
              sizes="32px"
              format="webp"
              quality="82"
              class="h-full w-full rounded-full object-cover ring-1 ring-white/20"
            />
          </div>
          <div
            class="flex h-10 items-center whitespace-nowrap rounded-full border border-white/20 bg-black/55 px-4 font-mono text-[10px] tracking-[0.14em] text-white backdrop-blur-md"
          >
            {{ stages.map((stage) => stage.label).join(' · ') }}
          </div>
        </div>
      </figure>

      <article
        v-for="(stage, index) in stages"
        :id="`about-${stage.key}`"
        :key="stage.key"
        class="about-divider-bottom flex min-h-[68svh] items-center border-b px-5 py-20 sm:px-8"
      >
        <motion.div
          class="mx-auto w-full max-w-2xl"
          :initial="prefersReducedMotion ? false : { opacity: 0, y: 34 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.35 }"
          :transition="revealTransition"
        >
          <div class="about-accent font-mono text-[11px] uppercase tracking-[0.16em]">
            {{ String(index + 1).padStart(2, '0') }} / {{ stage.label }}
          </div>
          <h1
            v-if="index === 0"
            class="about-heading mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl"
          >
            {{ stage.title }}
          </h1>
          <h2
            v-else
            class="about-heading mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl"
          >
            {{ stage.title }}
          </h2>
          <p class="about-copy mt-6 max-w-xl text-base leading-7 sm:text-lg">
            {{ stage.description }}
          </p>
          <NuxtLink
            :to="localePath(stage.path)"
            class="about-primary-cta group mt-8 inline-flex items-center gap-3 rounded-lg px-5 py-3 font-semibold outline-none focus-visible:ring-2"
          >
            {{ stage.cta }}
            <Icon name="heroicons:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </motion.div>
      </article>

      <section class="px-5 py-20 sm:px-8">
        <div class="mx-auto max-w-2xl">
          <p class="about-accent font-mono text-[11px] uppercase tracking-[0.16em]">
            {{ t('about.ways.eyebrow') }}
          </p>
          <h2 class="about-heading mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {{ t('about.ways.title') }}
          </h2>
          <p class="about-muted mt-4 max-w-lg leading-7">
            {{ t('about.ways.intro') }}
          </p>

          <div class="about-divided-list mt-10 divide-y border-y">
            <motion.article
              v-for="(way, index) in ways"
              :key="way.key"
              class="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-7"
              :initial="prefersReducedMotion ? false : { opacity: 0, y: 24 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :viewport="{ once: true, amount: 0.45 }"
              :transition="{ ...revealTransition, delay: index * 0.06 }"
            >
              <div
                class="about-icon-box flex h-10 w-10 items-center justify-center rounded-lg border"
              >
                <Icon :name="way.icon" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="about-heading font-semibold">{{ way.title }}</h3>
                <p class="about-muted mt-2 text-sm leading-6">{{ way.description }}</p>
                <NuxtLink
                  :to="localePath(way.path)"
                  class="about-text-link mt-3 inline-flex items-center gap-2 text-sm font-medium"
                >
                  {{ t('about.ways.explore') }}
                  <Icon name="heroicons:arrow-right" class="h-3.5 w-3.5" />
                </NuxtLink>
              </div>
            </motion.article>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.about-journey {
  background: var(--about-bg, #f6f3ec);
  color: var(--about-text, #191714);
  transition:
    background-color 300ms ease,
    color 300ms ease;
}

.about-ways-panel {
  background: var(--about-surface, #fffdf8);
  color: var(--about-text, #191714);
  transition:
    background-color 300ms ease,
    color 300ms ease;
}

.about-heading {
  color: var(--about-text, #191714);
}

.about-copy {
  color: var(--about-copy, #45413a);
}

.about-muted {
  color: var(--about-muted, #625f58);
}

.about-accent {
  color: var(--about-accent, #0e7490);
}

.about-divider-left,
.about-divider-bottom,
.about-divided-list {
  border-color: var(--about-line, rgb(25 23 20 / 0.13));
}

.about-divided-list > * + * {
  border-color: var(--about-line, rgb(25 23 20 / 0.13));
}

.about-icon-box {
  border-color: var(--about-line-strong, rgb(25 23 20 / 0.24));
  color: var(--about-text, #191714);
}

.about-text-link {
  color: var(--about-accent, #0e7490);
  --tw-ring-color: var(--about-accent, #0e7490);
}

.about-text-link:hover {
  color: var(--about-accent-hover, #075985);
}

.about-primary-cta {
  background: var(--about-text, #191714);
  color: var(--about-bg, #f6f3ec);
  --tw-ring-color: var(--about-accent, #0e7490);
}

.about-journey__desktop {
  min-height: 286svh;
}

.about-journey__sticky {
  position: sticky;
  top: 88px;
  display: flex;
  height: calc(100svh - 88px);
  min-height: 620px;
  flex-direction: column;
}

.about-hero-panel {
  flex: 1 1 auto;
}

.about-ways-panel {
  flex: 0 0 306px;
}

.about-stage-copy {
  display: flex;
  min-height: 23rem;
  flex-direction: column;
}

.about-stage-cta {
  align-self: flex-start;
  margin-top: auto;
}

@media (min-width: 1024px) and (max-height: 820px) {
  .about-journey__sticky {
    min-height: 0;
  }

  .about-ways-panel {
    flex-basis: 250px;
  }

  .about-display {
    font-size: 3rem;
  }

  .about-stage-meta {
    margin-bottom: 1rem;
  }

  .about-stage-copy {
    min-height: 17rem;
  }

  .about-stage-switch {
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
  }

  .about-stage-description {
    margin-top: 1rem;
  }

  .about-stage-cta {
    margin-top: 1rem;
    padding-top: 0.72rem;
    padding-bottom: 0.72rem;
  }

  .about-scroll-hint {
    display: none;
  }

  .about-ways-grid {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .about-ways-grid > div:first-child h2 {
    font-size: 1.2rem;
  }

  .about-ways-intro {
    display: none;
  }

  .about-way-card h3 {
    margin-top: 0.6rem;
  }

  .about-way-card p {
    -webkit-line-clamp: 2;
  }

  .about-way-card a {
    margin-top: 0.5rem;
  }
}
</style>
