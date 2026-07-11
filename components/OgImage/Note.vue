<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  number?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Builder Notes',
  description: 'Short observations from building an AI-native life.',
  number: '01',
})
</script>

<template>
  <div
    class="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#09090b] px-[76px] py-[64px] text-white"
    style="background-image: linear-gradient(135deg, rgba(245, 158, 11, 0.12), transparent 42%)"
  >
    <div class="absolute inset-x-0 top-0 h-[6px] bg-[#f59e0b]"></div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-5">
        <img
          src="/android-chrome-192x192.png"
          alt="Aaron Guo"
          class="h-[72px] w-[72px] rounded-2xl"
        />
        <div>
          <p class="m-0 text-[28px] font-semibold">Aaron Guo</p>
          <p class="m-0 mt-1 text-[20px] uppercase tracking-[0.18em] text-[#fbbf24]">
            Builder Notes
          </p>
        </div>
      </div>
      <p class="m-0 font-mono text-[24px] uppercase tracking-[0.16em] text-[#a1a1aa]">
        Note {{ number }}
      </p>
    </div>

    <div class="max-w-[980px]">
      <h1 class="m-0 text-[64px] font-semibold leading-[1.08] tracking-[-0.035em]">{{ title }}</h1>
      <p class="m-0 mt-7 max-w-[900px] text-[28px] leading-[1.4] text-[#d4d4d8]">
        {{ description }}
      </p>
    </div>

    <div
      class="flex items-center justify-between border-t border-white/15 pt-6 text-[20px] text-[#a1a1aa]"
    >
      <span>A working thought, kept in public.</span>
      <span>aaronguo.com/notes</span>
    </div>
  </div>
</template>
