<script setup lang="ts">
import AppLayout from '../layouts/AppLayout.vue';

const tabs = [
  { id: 'overview',  name: 'Overview',      icon: 'fas fa-chart-line',        path: '/overview' },
  { id: 'stats',     name: 'Estadísticas',  icon: 'fas fa-chart-bar',         path: '/stats' },
  { id: 'activity',  name: 'Actividad',     icon: 'fas fa-clock-rotate-left',  path: '/activity' },
];
</script>

<template>
  <AppLayout :tabs="tabs" :hide-title="true">
    <router-view />
  </AppLayout>
</template>
