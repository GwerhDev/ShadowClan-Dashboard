<style scoped lang="scss" src="./UserManagement.scss"/>
<script setup lang="ts">
import { useStore } from '../../../../middlewares/store';
import { ref, onMounted, onUnmounted } from 'vue';
import TableComponent from '../../Tables/TableComponent.vue';
import UserListCard from './UserListCard.vue';

const store: any = useStore();
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await store.handleGetUsers();
  loading.value = false;
});

onUnmounted(() => {
  store.admin.users = null;
});

const navItems = ['estado', 'battletag', 'rol', 'reclamados', 'acciones'];

</script>

<template>
  <div class="ul-container">
    <div v-if="!loading && store.admin.users">
      <TableComponent :navItems="navItems">
        <UserListCard v-for="user in store.admin.users" :key="user._id" :user="user" />
      </TableComponent>
    </div>
    <div v-else-if="loading" class="skeleton-table-container">
      <div class="skeleton-table-header">
        <div class="skeleton-box skeleton-header-item"></div>
        <div class="skeleton-box skeleton-header-item"></div>
        <div class="skeleton-box skeleton-header-item"></div>
        <div class="skeleton-box skeleton-header-item"></div>
        <div class="skeleton-box skeleton-header-item"></div>
      </div>
      <div class="skeleton-table-row" v-for="n in 5" :key="n">
        <div class="skeleton-box skeleton-cell"></div>
        <div class="skeleton-box skeleton-cell"></div>
        <div class="skeleton-box skeleton-cell"></div>
        <div class="skeleton-box skeleton-cell"></div>
        <div class="skeleton-box skeleton-cell"></div>
      </div>
    </div>
    <p v-else>No hay usuarios disponibles.</p>
  </div>
</template>
