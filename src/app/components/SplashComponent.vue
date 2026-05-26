<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{ done: boolean }>();

const progress = ref(0);
const label = ref('Verificando sesión...');
let ticker: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  ticker = setInterval(() => {
    progress.value += (89 - progress.value) * 0.035;
  }, 50);
});

watch(() => props.done, (isDone) => {
  if (isDone) {
    if (ticker) clearInterval(ticker);
    label.value = 'Listo';
    progress.value = 100;
  }
});

onUnmounted(() => {
  if (ticker) clearInterval(ticker);
});
</script>

<template>
  <main>
    <div class="splash-content">
      <span class="logo-styles f-size-large">ShadowClan</span>
      <p class="subtitle">Dashboard</p>
      <div class="loader-container">
        <span class="loader-label">{{ label }}</span>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../../assets/di-bg-splash.png');
  background-size: cover;
  background-position: top;
  background-repeat: no-repeat;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
}

.subtitle {
  font-family: 'Cinzel', serif;
  font-size: .8rem;
  letter-spacing: .25em;
  text-transform: uppercase;
  color: rgba(227, 210, 168, 0.5);
  margin: 0;
}

.loader-container {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-top: 2rem;
}

.loader-label {
  font-family: 'Cinzel', serif;
  font-size: .75rem;
  color: rgba(227, 210, 168, 0.6);
  text-align: center;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.progress-track {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, .08);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #7B2917, rgb(227, 210, 168));
  box-shadow: 0 0 8px rgba(255, 60, 0, .45);
  transition: width .15s ease-out;
}
</style>
