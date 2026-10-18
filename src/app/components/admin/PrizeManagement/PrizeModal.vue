<script setup lang="ts">
import { computed, ref } from 'vue';
import CustomModal from '../../Modals/CustomModal.vue';
import LabeledInput from '../../Inputs/LabeledInput.vue';
import { createPrize } from '../../../../middlewares/services';

const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>();

const name        = ref('');
const description = ref('');
const saving      = ref(false);
const error       = ref('');
const canSave     = computed(() => !!name.value.trim() && !saving.value);

async function submit() {
  if (!canSave.value) return;
  saving.value = true;
  error.value = '';
  try {
    await createPrize({ name: name.value.trim(), description: description.value.trim() || undefined });
    emit('saved');
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al crear el premio.';
  } finally { saving.value = false; }
}
</script>

<template>
  <CustomModal title="Nuevo premio" @close="emit('close')">
    <form class="modal-form" @submit.prevent="submit">
      <LabeledInput label="Nombre" id="prize-name" v-model="name" required />
      <label class="field">
        <span>Descripción (opcional)</span>
        <textarea v-model="description" maxlength="500" rows="3" placeholder="Qué incluye, cómo se entrega…"></textarea>
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="btn-submit" :disabled="!canSave">Crear premio</button>
    </form>
  </CustomModal>
</template>

<style scoped lang="scss">
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  font-size: .82rem;
  color: rgba(255, 255, 255, .6);

  textarea {
    resize: vertical;
    padding: .5rem .6rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, .05);
    border: 1px solid rgba(255, 255, 255, .12);
    color: rgba(255, 255, 255, .85);
    font-family: inherit;
    font-size: .85rem;

    &:focus { outline: none; border-color: rgba(227, 210, 168, .35); }
  }
}

.error {
  margin: 0;
  font-size: .78rem;
  color: #f87171;
}

.btn-submit {
  width: 100%;
  padding: .52rem;
  border-radius: 8px;
  font-size: .88rem;
  font-weight: 500;
  background: var(--color-primary);
  border: 1px solid transparent;
  color: #fff;
  cursor: pointer;
  transition: opacity .15s;

  &:hover:not(:disabled) { opacity: .85; }
  &:disabled { opacity: .4; cursor: not-allowed; }
}
</style>
