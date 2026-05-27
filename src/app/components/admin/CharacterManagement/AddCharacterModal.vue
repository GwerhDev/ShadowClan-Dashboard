<style scoped lang="scss" src="./AddCharacterModal.scss" />
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../../../../middlewares/store';
import CustomModal from '../../Modals/CustomModal.vue';
import LabeledInput from '../../Inputs/LabeledInput.vue';

const emit = defineEmits(['close']);
const store: any = useStore();
const name = ref('');
const isCharacterEmpty = computed(() => name.value.trim() === '');

function handleCloseModal() {
  emit('close');
};

function handleSubmit() {
  const formData = {
    name: name.value,
  };
  store.handleCreateAdminCharacter(formData);
  handleCloseModal();
};
</script>

<template>
  <CustomModal title="Agregar personaje" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="modal-form">
      <LabeledInput label="Nombre del personaje" id="name" v-model="name" required />
      <button type="submit" :disabled="isCharacterEmpty" class="btn-submit">
        Agregar personaje
      </button>
    </form>
  </CustomModal>
</template>
