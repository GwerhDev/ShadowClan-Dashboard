<script setup lang="ts">
import { onMounted } from 'vue';
import { useStore } from './middlewares/store';
import UnauthorizedPage from './app/pages/UnauthorizedPage.vue';

const store = useStore();

onMounted(async () => {
  await store.handleUserData();
  if (!store.unauthorized) {
    await store.handleFetchPendingRequests();
  }
});
</script>

<template>
  <UnauthorizedPage v-if="store.unauthorized" />
  <router-view v-else />
</template>
