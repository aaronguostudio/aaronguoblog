<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { data } = await useBuildProjects()

const featuredProjects = computed(() => {
  const projects = data.value?.[locale.value === 'zh' ? 'zh' : 'en'] ?? []
  return projects
    .map((project) => ({
      ...project,
      cover: project.cardImage || project.logo || project.screenshots?.[0],
    }))
    .filter((project) => project.featured && project.cover)
    .slice(0, 3)
})
</script>

<template>
  <section
    v-if="featuredProjects.length"
    aria-labelledby="home-build-heading"
    class="showcase rounded-2xl border px-4 pb-3 pt-3 sm:mx-4 sm:px-6 sm:pb-5 sm:pt-4"
  >
    <div class="flex flex-wrap items-center justify-between gap-x-4">
      <h2 id="home-build-heading" class="scroll-mt-28 text-2xl font-semibold tracking-tight">
        {{ t('build.title') }}
      </h2>
      <NuxtLink
        :to="localePath('/build')"
        class="showcase-link inline-flex min-h-10 items-center gap-2 rounded-sm text-sm font-medium underline-offset-4 hover:underline"
      >
        {{ t('build.viewAllProjects') }}
        <Icon name="heroicons:arrow-right" aria-hidden="true" class="h-4 w-4" />
      </NuxtLink>
    </div>

    <div class="showcase-grid mt-2 grid">
      <a
        v-for="project in featuredProjects"
        :key="project.slug"
        :data-project="project.slug"
        :href="localePath(project.caseStudy || { path: '/build', hash: '#' + project.slug })"
        class="showcase-project"
      >
        <div class="showcase-art" aria-hidden="true">
          <div class="showcase-object">
            <NuxtImg
              :src="project.cover"
              alt=""
              sizes="104px md:224px"
              format="webp"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div class="showcase-copy">
          <h3 class="showcase-name">
            {{ project.name }}
            <Icon name="heroicons:arrow-right" aria-hidden="true" class="showcase-arrow" />
          </h3>
          <p class="showcase-summary">{{ project.cardSummary || project.description }}</p>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.showcase {
  --showcase-divider: rgb(255 255 255 / 11%);
  --showcase-muted: #bfc7c1;
  border-color: #363e38;
  background: linear-gradient(155deg, #1b201d, #151816 76%);
  color: #f4f6f4;
}

.showcase-link,
.showcase-summary {
  color: var(--showcase-muted);
}

.showcase-link:hover {
  color: #fff;
}

.showcase-link:focus-visible,
.showcase-project:focus-visible {
  outline: 2px solid #c6edda;
  outline-offset: 3px;
}

.showcase-project {
  display: grid;
  grid-template-columns: minmax(0, 6.5rem) minmax(0, 1fr);
  min-width: 0;
  align-items: center;
  gap: 0.875rem;
  padding-block: 0.625rem;
}

.showcase-project + .showcase-project {
  border-top: 1px solid var(--showcase-divider);
}

.showcase-art {
  display: grid;
  min-height: 4rem;
  place-items: center;
}

.showcase-object {
  width: 4.125rem;
}

.showcase-object img {
  display: block;
  width: 100%;
  height: auto;
}

.showcase-project[data-project='orbit-courier'] .showcase-object {
  width: 5.5rem;
}

.showcase-copy {
  min-width: 0;
}

.showcase-name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: inherit;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.015em;
  overflow-wrap: anywhere;
}

.showcase-arrow {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  color: var(--showcase-muted);
}

.showcase-project:hover .showcase-arrow,
.showcase-project:focus-visible .showcase-arrow {
  color: #fff;
}

.showcase-summary {
  margin-top: 0.3rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  text-wrap: pretty;
}

@media (min-width: 768px) {
  .showcase-grid {
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
  }

  .showcase-project {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 10rem 1fr;
    align-items: start;
    gap: 0.75rem;
    padding: 0.25rem clamp(0.75rem, 2vw, 2rem) 0.5rem;
    text-align: center;
  }

  .showcase-project + .showcase-project {
    border-top: 0;
    border-inline-start: 1px solid var(--showcase-divider);
  }

  .showcase-art {
    height: 100%;
  }

  .showcase-object {
    width: 6.5rem;
    max-width: 84%;
  }

  .showcase-project[data-project='orbit-courier'] .showcase-object {
    width: 8.5rem;
  }

  .showcase-name {
    justify-content: center;
    font-size: 1.125rem;
  }

}
</style>
