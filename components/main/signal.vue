<script lang="ts" setup>
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { coverImage, signalEditions } from '~/data/signal/editions'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const language = computed(() => (locale.value === 'zh' ? 'zh' : 'en'))
const headingId = useId()
const editionTitleId = useId()
const latestEdition = signalEditions[0]
</script>

<template>
  <section
    v-if="latestEdition"
    class="min-w-0 rounded-xl border border-border bg-card"
    :aria-labelledby="headingId"
  >
    <div class="flex items-center justify-between gap-3 px-3 pt-0.5 sm:px-4 sm:pt-1">
      <h2 :id="headingId" class="text-xl font-semibold tracking-tight text-foreground">Signal</h2>
      <NuxtLink
        :to="localePath('/signal/editions')"
        class="inline-flex min-h-10 items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-primary"
      >
        {{ t('signal.allEditions') }} <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <NuxtLink
      :to="localePath('/signal/editions/' + latestEdition.date)"
      :aria-labelledby="editionTitleId"
      class="group mx-1 grid grid-cols-[minmax(0,32%)_minmax(0,1fr)] items-center gap-3 rounded-lg px-2 pb-3 pt-1 focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:px-3"
    >
      <img
        :src="coverImage(latestEdition)"
        alt=""
        width="1200"
        height="800"
        class="aspect-[3/2] h-auto w-full rounded-md bg-muted object-contain"
      />
      <div class="min-w-0">
        <time
          :datetime="latestEdition.date"
          class="block text-xs font-medium tabular-nums tracking-wide text-muted-foreground"
          >{{ latestEdition.date.replaceAll('-', '.') }}</time
        >
        <h3
          :id="editionTitleId"
          class="edition-title mt-1.5 break-words text-lg font-semibold leading-[1.14] tracking-tight text-foreground underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-xl xl:text-[1.375rem]"
        >
          {{ latestEdition.headline[language] }}
        </h3>
      </div>
    </NuxtLink>
  </section>
</template>

<style scoped>
.edition-title {
  font-family: Georgia, 'Songti SC', 'Noto Serif CJK SC', 'Noto Serif SC', SimSun, serif;
  text-wrap: balance;
}
</style>
