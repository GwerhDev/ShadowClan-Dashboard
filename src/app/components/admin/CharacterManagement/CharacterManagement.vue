<style scoped lang="scss" src="./CharacterManagement.scss"/>
<script setup lang="ts">
import { useStore } from '../../../../middlewares/store';
import { ref, onMounted, onUnmounted } from 'vue';
import TableComponent from '../../Tables/TableComponent.vue';
import CharacterListCard from './CharacterListCard.vue';
import AddCharacterModal from './AddCharacterModal.vue';

const store: any = useStore();
const showModal = ref(false);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await store.handleGetAdminCharacters();
  loading.value = false;
});

onUnmounted(() => {
  store.admin.characters = null;
});

function handleAddMember() {
  showModal.value = true;
};

const navItems = ['status', 'name', 'resonance', 'class', 'clan', 'actions'];

</script>

<template>
  <div class="ul-container">
    <span class="button-list">
      <button @click="handleAddMember">Agregar personaje</button>
    </span>
    <div v-if="!loading && store.admin.characters">
      <TableComponent :navItems="navItems">
        <CharacterListCard v-for="character in store.admin.characters" :key="character._id" :character="character" />
      </TableComponent>
    </div>
    <div v-else-if="loading" class="skeleton-table-container">
      <div class="skeleton-table-header">
        <div class="skeleton-box skeleton-header-item"></div>
        <div class="skeleton-box skeleton-header-item"></div>
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
        <div class="skeleton-box skeleton-cell"></div>
        <div class="skeleton-box skeleton-cell"></div>
      </div>
    </div>
    <p v-else>No hay miembros disponibles.</p>

    <AddCharacterModal v-if="showModal" @close="showModal = false" />
  </div>
</template>
