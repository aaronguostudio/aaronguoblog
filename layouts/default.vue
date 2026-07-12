<template>
  <div class="min-h-screen bg-background text-foreground transition-colors duration-300">
    <header class="sticky top-0 z-50">
      <MainHeader />
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <MainFooter />
    </footer>
    <ClientOnly>
      <VoiceAaronAssistant />
    </ClientOnly>
  </div>
</template>

<style scoped></style>
