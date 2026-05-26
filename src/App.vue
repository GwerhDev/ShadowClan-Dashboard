<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from './middlewares/store';
import UnauthorizedPage from './app/pages/UnauthorizedPage.vue';
import SplashComponent from './app/components/SplashComponent.vue';

const store = useStore();
const loading = ref(true);
const authDone = ref(false);

onMounted(async () => {
  try {
    await store.handleUserData();
    if (!store.unauthorized) {
      store.initSocket();
      await store.handleFetchPendingCounts();
    }
  } finally {
    authDone.value = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    loading.value = false;
  }
});
</script>

<template>
  <SplashComponent v-if="loading" :done="authDone" />
  <template v-else>
    <UnauthorizedPage v-if="store.unauthorized" />
    <router-view v-else />
  </template>
</template>
