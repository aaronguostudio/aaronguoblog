<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header>
      <MainHeader />
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <MainFooter />
    </footer>
  </div>
</template>

<style scoped></style>
