<script setup lang="ts">
import type { LearnContentItem } from '~/utils/learn'
import { filterLearn, prepareLearn } from '~/utils/learn'
import { useSeo } from '~/utils/seo'

const { locale, t } = useI18n()
const localePath = useLocalePath()

const query = ref('')
const selectedDomain = ref('all')
const searchInput = ref<HTMLInputElement | null>(null)

const { data } = await useAsyncData('all-learn-concepts', () =>
  Promise.all([queryCollection('learnEn').all(), queryCollection('learnZh').all()]),
)

const concepts = computed(() => {
  if (!data.value) return []
  const items = data.value[locale.value === 'zh' ? 1 : 0] as unknown as LearnContentItem[]
  return prepareLearn(items, { includeDrafts: process.env.NODE_ENV !== 'production' })
})

const domains = computed(() => {
  const counts = new Map<string, { key: string; label: string; count: number }>()

  concepts.value.forEach((concept) => {
    const current = counts.get(concept.domainKey)
    counts.set(concept.domainKey, {
      key: concept.domainKey,
      label: concept.domain,
      count: (current?.count || 0) + 1,
    })
  })

  return [...counts.values()].sort((left, right) => left.label.localeCompare(right.label))
})

const visibleConcepts = computed(() =>
  filterLearn(concepts.value, {
    query: query.value,
    domainKey: selectedDomain.value,
  }),
)

function clearFilters() {
  query.value = ''
  selectedDomain.value = 'all'
  searchInput.value?.focus()
}

function handleSearchShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (event.key !== '/' || target?.matches('input, textarea, select, [contenteditable="true"]'))
    return

  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', handleSearchShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', handleSearchShortcut))

watch(locale, () => {
  query.value = ''
  selectedDomain.value = 'all'
})

const canonicalPath = computed(() => (locale.value === 'zh' ? '/zh/learn' : '/learn'))

useSeo({
  title: t('learn.title'),
  description: t('learn.description'),
  url: canonicalPath.value,
  locale: locale.value === 'zh' ? 'zh_CN' : 'en_US',
})

defineOgImageComponent('About', {
  title: t('learn.title'),
  description: t('learn.description'),
})
</script>

<template>
  <main class="container mx-auto max-w-8xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8">
    <section
      class="relative overflow-hidden rounded-xl bg-secondary/55 px-6 py-8 sm:px-8 sm:py-10 sm:pr-48"
    >
      <h1 class="sr-only">{{ t('learn.title') }}</h1>
      <p class="max-w-4xl text-xl font-medium leading-8 text-foreground sm:text-2xl sm:leading-9">
        {{ t('learn.description') }}
      </p>
      <img
        src="/android-chrome-192x192.png"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute right-8 top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-3xl opacity-70 sm:block dark:opacity-45"
      />
    </section>

    <section class="pt-6 sm:pt-8" :aria-label="t('learn.archiveLabel')">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative min-w-0 flex-1 lg:max-w-2xl">
          <Icon
            name="heroicons:magnifying-glass"
            class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          />
          <label for="pattern-search" class="sr-only">{{ t('learn.searchLabel') }}</label>
          <input
            id="pattern-search"
            ref="searchInput"
            v-model="query"
            type="search"
            :placeholder="t('learn.searchPlaceholder')"
            aria-keyshortcuts="/"
            class="h-12 w-full rounded-lg border border-[color:var(--line-control)] bg-card/40 pl-12 pr-20 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <kbd
            class="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-[color:var(--line-control)] px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
            >/</kbd
          >
        </div>

        <div
          class="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end"
          :aria-label="t('learn.browseByDomain')"
        >
          <button
            type="button"
            class="min-h-9 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            :class="
              selectedDomain === 'all'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-[color:var(--line-control)] text-muted-foreground hover:border-primary/50 hover:text-foreground'
            "
            :aria-pressed="selectedDomain === 'all'"
            @click="selectedDomain = 'all'"
          >
            {{ t('learn.allDomains') }} · {{ concepts.length }}
          </button>
          <button
            v-for="domain in domains"
            :key="domain.key"
            type="button"
            class="min-h-9 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            :class="
              selectedDomain === domain.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-[color:var(--line-control)] text-muted-foreground hover:border-primary/50 hover:text-foreground'
            "
            :aria-pressed="selectedDomain === domain.key"
            @click="selectedDomain = domain.key"
          >
            {{ domain.label }} · {{ domain.count }}
          </button>
        </div>
      </div>

      <div
        v-if="visibleConcepts.length"
        class="grid grid-cols-1 gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <NuxtLink
          v-for="concept in visibleConcepts"
          :key="concept.path"
          :to="localePath(concept.path)"
          class="group relative grid min-h-[7.75rem] overflow-hidden rounded-xl border border-[color:var(--line-card)] bg-card/40 outline-none transition-colors hover:border-primary/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-primary"
          :class="concept.cardImage ? 'grid-cols-[5.5rem_minmax(0,1fr)]' : 'grid-cols-1'"
        >
          <div
            v-if="concept.cardImage"
            class="m-2 mr-0 aspect-[4/5] self-center overflow-hidden rounded-lg border border-[color:var(--line-subtle)] bg-secondary/45"
          >
            <NuxtImg
              :src="concept.cardImage"
              :alt="concept.cardImageAlt || concept.title"
              width="176"
              height="220"
              sizes="88px"
              format="webp"
              quality="72"
              loading="lazy"
              class="block h-full w-full object-contain"
            />
          </div>

          <div class="flex min-w-0 items-start justify-between gap-3 p-4">
            <div class="min-w-0 self-center">
              <h2
                class="text-base font-semibold leading-6 tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary"
              >
                {{ concept.title }}
              </h2>
              <p class="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {{ concept.description }}
              </p>
            </div>
            <Icon
              name="heroicons:arrow-up-right"
              class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
          </div>
        </NuxtLink>
      </div>

      <div v-else class="border-b border-[color:var(--line-subtle)] py-16 text-center">
        <h2 class="text-xl font-semibold text-foreground">{{ t('learn.noResultsTitle') }}</h2>
        <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {{ t('learn.noResultsDescription') }}
        </p>
        <button
          type="button"
          class="mt-5 min-h-10 rounded-md border border-[color:var(--line-control)] px-4 text-sm font-medium text-foreground outline-none hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary"
          @click="clearFilters"
        >
          {{ t('learn.clearFilters') }}
        </button>
      </div>
    </section>
  </main>
</template>
