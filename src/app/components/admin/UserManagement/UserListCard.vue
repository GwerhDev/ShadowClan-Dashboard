<style scoped lang="scss" src="./UserListCard.scss" />
<script setup lang="ts">
import { useStore } from '../../../../middlewares/store';
import { Ref, ref } from 'vue';
import LinkCharacterModal from './LinkCharacterModal.vue';

const store: any = useStore();
const props = defineProps<{ user: any }>();
const emit  = defineEmits(['refresh']);

const loading: Ref<boolean> = ref(true);
const role: Ref<string> = ref(props.user.role);
const status: Ref<string> = ref(props.user.status);
const character: Ref<string[]> = ref(props.user.character || []);

const editionActive = ref(false);
const deleteActive = ref(false);
const isModalOpen = ref(false);

function handleEdit() {
  editionActive.value = true;
}

async function handleUpdate(id: string) {
  const formData = {
    role: role.value,
    status: status.value,
    character: character.value,
  };

  await store.handleUpdateUser(formData, id);
  await store.handleGetAdminNotifications();
  editionActive.value = false;
  emit('refresh');
}

async function handleDeleteUser(id: string) {
  await store.handleDeleteUser(id);
  await store.handleGetAdminNotifications();
  emit('refresh');
}

function handleCancel() {
  // Reset fields to original values
  role.value = props.user.role;
  status.value = props.user.status;
  character.value = props.user.character || [];
  editionActive.value = false;
  deleteActive.value = false;
}

function handleDelete() {
  deleteActive.value = true;
}

async function openLinkModal() {
  await store.handleGetAdminCharacters();
  loading.value = false;
  isModalOpen.value = true;
}

function handleModalClose() {
  isModalOpen.value = false;
}

function handleModalSave(selectedIds: string[]) {
  character.value = selectedIds;
}

function styleStatus(status: string) {
  if (status === 'active') {
    return { backgroundColor: '#99d499' };
  }
  if (status === 'pending') {
    return { backgroundColor: '#eaec72' };
  }
  if (status === 'inactive') {
    return { backgroundColor: '#b67f75' };
  }
}
</script>

<template>
  <!-- Edit Mode -->
  <div class="list-container" v-if="editionActive && !deleteActive">
    <span v-if="user.role !== 'super_admin'">
      <select v-model="status">
        <option value="active">active</option>
        <option value="pending">pending</option>
        <option value="inactive">inactive</option>
      </select>
    </span>
    <span v-else class="status-container">
      <div class="status-image">
        <img src="../../../../assets/svg/profile-icon.svg" alt="">
        <span class="status" :style="styleStatus(user.status)"></span>
      </div>
    </span>
    <span>
      <p>{{ user.battletag }}</p>
    </span>
    <span>
      <select v-model="role" v-if="user.role !== 'super_admin'">
        <option disabled value="super_admin">super_admin</option>
        <option value="admin">admin</option>
        <option value="user">user</option>
      </select>
      <p v-else>{{ user.role }}</p>
    </span>
    <span>
      <p>{{ user.character?.length || 0 }}</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button" @click="openLinkModal" title="Vincular personajes"><i class="fas fa-link"></i></button>
        <button class="icon-button icon-button--confirm" :disabled="user.role === 'super_admin'" @click="handleUpdate(user._id)" title="Guardar"><i class="fas fa-check"></i></button>
        <button class="icon-button" :disabled="user.role === 'super_admin'" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Delete Confirmation Mode -->
  <div class="list-container red-bg" v-if="!editionActive && deleteActive">
    <span class="status-container">
      <div class="status-image">
        <img src="../../../../assets/svg/profile-icon.svg" alt="">
        <span class="status" :style="styleStatus(user.status)"></span>
      </div>
    </span>
    <span>
      <p>{{ user.battletag }}</p>
    </span>
    <span>
      <p>{{ user.role }}</p>
    </span>
    <span>
      <p>{{ user.character?.length || 0 }}</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button" @click="openLinkModal" title="Vincular personajes"><i class="fas fa-link"></i></button>
        <button class="icon-button icon-button--confirm" :disabled="user.role === 'super_admin'" @click="handleDeleteUser(user._id)" title="Confirmar eliminación"><i class="fas fa-check"></i></button>
        <button class="icon-button" :disabled="user.role === 'super_admin'" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Display Mode -->
  <div class="list-container" v-if="!editionActive && !deleteActive">
    <span class="status-container">
      <div class="status-image">
        <img src="../../../../assets/svg/profile-icon.svg" alt="">
        <span class="status" :style="styleStatus(user.status)"></span>
      </div>
    </span>
    <span>
      <p>{{ user.battletag }}</p>
    </span>
    <span>
      <p>{{ user.role }}</p>
    </span>
    <span>
      <p>{{ user.character?.length || 0 }}</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button" @click="openLinkModal" title="Vincular personajes"><i class="fas fa-link"></i></button>
        <button class="icon-button" :disabled="user.role === 'super_admin'" @click="handleEdit" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="icon-button icon-button--danger" :disabled="user.role === 'super_admin'" @click="handleDelete" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </span>
  </div>

  <LinkCharacterModal :user-id="user._id" :loading="loading" v-if="isModalOpen" :initial-selected-ids="character"
    :user-name="user.battletag" @close="handleModalClose" @save="handleModalSave" />
</template>
