<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground transition-colors duration-300">
    <header class="sticky top-0 z-50 flex-none">
      <MainHeader />
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="flex-none">
      <MainFooter />
    </footer>
    <ClientOnly>
      <VoiceAaronAssistant />
    </ClientOnly>
  </div>
</template>

<style scoped></style>
