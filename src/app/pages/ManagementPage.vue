<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../../middlewares/store';
import AppLayout from '../layouts/AppLayout.vue';

const store = useStore();

const isSuperAdmin = computed(() => store.currentUser.userData?.role === 'super_admin');

const tabs = computed(() => [
  ...(isSuperAdmin.value ? [
    { id: 'users',      name: 'Usuarios',   icon: 'fas fa-users',       path: '/management/users' },
    { id: 'characters', name: 'Personajes', icon: 'fas fa-user-group',  path: '/management/characters' },
    { id: 'clans',      name: 'Clanes',     icon: 'fas fa-shield-alt',  path: '/management/clans' },
  ] : []),
]);
</script>

<template>
  <AppLayout :tabs="tabs">
    <router-view />
  </AppLayout>
</template>
