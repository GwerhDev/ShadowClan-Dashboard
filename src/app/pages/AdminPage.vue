<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../../middlewares/store';
import AppLayout from '../layouts/AppLayout.vue';

const store = useStore();

const isSuperAdmin = computed(() => store.currentUser.userData?.role === 'super_admin');

const tabs = computed(() => [
  { id: 'overview',    name: 'Overview',    icon: 'fas fa-chart-line',  path: '/overview' },
  ...(isSuperAdmin.value ? [
    { id: 'clans',      name: 'Clanes',      icon: 'fas fa-shield-alt',  path: '/clans',      badge: undefined },
    { id: 'characters', name: 'Personajes',  icon: 'fas fa-user-group',  path: '/characters' },
    { id: 'users',      name: 'Usuarios',    icon: 'fas fa-users',       path: '/users' },
  ] : []),
  { id: 'requests', name: 'Solicitudes', icon: 'fas fa-envelope', path: '/requests', badge: store.pendingRequestsTotal || undefined },
]);
</script>

<template>
  <AppLayout :tabs="tabs">
    <router-view />
  </AppLayout>
</template>
