<script setup lang="ts"></script>

<template>
  <div class="logo-container">
    <router-link to="/">
      <span class="logo-styles">ShadowclaN</span>
      <span class="logo-clan">Dashboard</span>
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.logo-container {
  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .1rem;
    text-decoration: none;
  }
}

.logo-clan {
  font-family: 'Cinzel', serif;
  font-size: .5rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--color-app-white);
  line-height: 1;
}
</style>
