<script setup lang="ts">
import type { SignalEdition } from '~/data/signal/editions'

defineProps<{ edition: SignalEdition }>()
const { locale, t } = useI18n()
const language = computed(() => (locale.value === 'zh' ? 'zh' : 'en'))
</script>

<template>
  <section v-if="edition.signal" class="finding" aria-labelledby="issue-finding">
    <div>
      <p class="label">
        {{ t('signal.issueFinding') }} · <time :datetime="edition.date">{{ edition.date }}</time>
      </p>
      <h2 id="issue-finding">{{ edition.signal.claim[language] }}</h2>
      <p
        v-for="(paragraph, index) in edition.signal.reasoning[language].split(/\n\s*\n/)"
        :key="index"
        class="interpretation"
      >
        {{ paragraph }}
      </p>
      <h3 class="label">{{ t('signal.nextCheck') }}</h3>
      <p class="question">{{ edition.signal.nextCheck[language] }}</p>
    </div>
    <aside>
      <h3 class="label">{{ t('signal.issueEvidence') }}</h3>
      <ul>
        <li v-for="item in edition.items" :key="item.id">
          <a :href="item.evidence">{{ item.title[language] }} <span aria-hidden="true">↗</span></a>
          <p>{{ item.note[language] }}</p>
        </li>
      </ul>
    </aside>
  </section>
</template>

<style scoped>
.finding {
  display: grid;
  gap: clamp(2rem, 5vw, 6rem);
  padding-block: clamp(2.5rem, 5vw, 5rem);
  border-bottom: 1px solid var(--signal-line);
}
@media (min-width: 900px) {
  .finding {
    grid-template-columns: 1.35fr 1fr;
  }
}
.label {
  color: var(--muted-foreground);
  font:
    600 0.78rem/1.5 system-ui,
    sans-serif;
  letter-spacing: 0.06em;
}
h2 {
  font-size: clamp(2rem, 3.3vw, 3.4rem);
  line-height: 1.12;
  letter-spacing: -0.035em;
  text-wrap: balance;
  margin: 0.8rem 0 1.3rem;
}
.interpretation,
.question {
  max-width: 54ch;
  line-height: 1.7;
}
.interpretation {
  font-size: 1.1rem;
  margin-bottom: 1.8rem;
}
.question {
  margin-top: 0.4rem;
}
li {
  padding-block: 1rem;
  border-bottom: 1px solid var(--signal-line);
}
li:last-child {
  border-bottom: 0;
}
li a {
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
li p {
  margin-top: 0.4rem;
  font-size: 0.94rem;
  line-height: 1.65;
  color: var(--muted-foreground);
}
</style>
