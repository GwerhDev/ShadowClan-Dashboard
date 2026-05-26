<style scoped lang="scss" src="./SideBar.scss" />
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = withDefaults(defineProps<{
  tabs: Array<{
    id: string;
    name: string;
    icon: string;
    length?: number;
    path: string;
    disabled?: boolean;
    badge?: number;
  }>,
}>(), {
  tabs: () => []
});

const route = useRoute();
const router = useRouter();

const regularTabs = computed(() => props.tabs.filter(t => t.id !== 'external'));
const externalTab = computed(() => props.tabs.find(t => t.id === 'external') ?? null);

function handleType(tab: { id: string; name: string; icon: string; path: string }) {
  router.push(tab.path);
}

function openExternal(path: string) {
  window.open(path, '_blank');
}

function styleActive(path: string) {
  if (route.path === path) return { backgroundColor: 'var(--color-primary)' };
  if (path !== '/' && route.path.startsWith(path)) return { backgroundColor: 'var(--color-primary)' };
  return {};
}
</script>

<template>
  <div class="container-lateral">
    <ul>
      <li v-for="(tab, index) in regularTabs" :key="tab.id">
        <button
          :title="tab.name"
          :class="{ first: index === 0, last: index === regularTabs.length - 1, disabled: tab.disabled }"
          @click="handleType(tab)"
          :style="styleActive(tab.path)"
          :disabled="tab.disabled"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.name }}</span>
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
          <span v-else></span>
        </button>
      </li>
    </ul>

    <div v-if="externalTab" class="sidebar-bottom">
      <button class="dashboard-btn" :title="externalTab.name" @click="openExternal(externalTab.path)">
        <div class="dashboard-btn-left">
          <i :class="externalTab.icon"></i>
          <span>{{ externalTab.name }}</span>
        </div>
        <i class="fas fa-arrow-up-right-from-square dashboard-ext-icon"></i>
      </button>
    </div>
  </div>
</template>
