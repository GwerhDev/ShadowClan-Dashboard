<script setup lang="ts">
import { ref } from 'vue';
import { updatePrize, deletePrize } from '../../../../middlewares/services';
import type { Prize } from '../../../../interfaces';

const props = defineProps<{ prize: Prize }>();
const emit  = defineEmits<{ (e: 'refresh'): void }>();

const editing     = ref(false);
const deleting    = ref(false);
const busy        = ref(false);
const error       = ref('');
const name        = ref(props.prize.name);
const description = ref(props.prize.description ?? '');

function reset() {
  editing.value = false;
  deleting.value = false;
  error.value = '';
  name.value = props.prize.name;
  description.value = props.prize.description ?? '';
}

async function run(action: () => Promise<unknown>, fallback: string) {
  busy.value = true;
  error.value = '';
  try {
    await action();
    reset();
    emit('refresh');
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? fallback;
  } finally { busy.value = false; }
}

const save         = () => run(() => updatePrize(props.prize._id, { name: name.value.trim(), description: description.value.trim() }), 'Error al guardar el premio.');
const toggleActive = () => run(() => updatePrize(props.prize._id, { active: !props.prize.active }), 'Error al cambiar el estado.');
const remove       = () => run(() => deletePrize(props.prize._id), 'Error al eliminar el premio.');
</script>

<template>
  <!-- Vista edición -->
  <div class="list-container" v-if="editing">
    <span><i :class="prize.active ? 'fas fa-circle-check active' : 'fas fa-circle-pause'"></i></span>
    <span><input v-model="name" maxlength="80" placeholder="Nombre" /></span>
    <span><input v-model="description" maxlength="500" placeholder="Descripción" /></span>
    <span><p class="muted">{{ prize.rafflesCount ?? 0 }}</p></span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" :disabled="busy || !name.trim()" @click="save" title="Guardar"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="reset" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Vista confirmar eliminación -->
  <div class="list-container red-bg" v-else-if="deleting">
    <span><i :class="prize.active ? 'fas fa-circle-check active' : 'fas fa-circle-pause'"></i></span>
    <span><p class="name">{{ prize.name }}</p></span>
    <span><p class="muted">¿Eliminar este premio?</p></span>
    <span><p class="muted">{{ prize.rafflesCount ?? 0 }}</p></span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" :disabled="busy" @click="remove" title="Confirmar eliminación"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="reset" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Vista normal -->
  <div class="list-container" v-else :class="{ inactive: !prize.active }">
    <span>
      <button class="status-toggle" :class="{ active: prize.active }" :disabled="busy" @click="toggleActive"
        :title="prize.active ? 'Activo: visible para los clanes (clic para desactivar)' : 'Inactivo: oculto para los clanes (clic para activar)'">
        <i :class="prize.active ? 'fas fa-circle-check' : 'fas fa-circle-pause'"></i>
        {{ prize.active ? 'Activo' : 'Inactivo' }}
      </button>
    </span>
    <span><p class="name">{{ prize.name }}</p></span>
    <span><p class="muted description">{{ prize.description || '—' }}</p></span>
    <span><p class="muted">{{ prize.rafflesCount ?? 0 }}</p></span>
    <span>
      <div class="buttons-container">
        <button class="icon-button" @click="editing = true" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="icon-button icon-button--danger" @click="deleting = true" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </span>
  </div>

  <p v-if="error" class="row-error">{{ error }}</p>
</template>

<style scoped lang="scss">
span {
  width: 100%;
  min-width: 0;
  gap: 1rem;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

p { margin: 0; }

.buttons-container {
  display: flex;
  align-items: center;
  gap: .5rem;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .35rem;
  height: 28px;
  padding: 0 .75rem;
  border-radius: 6px;
  font-size: .78rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, .12);
  color: rgba(255, 255, 255, .6);
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, .07);
    border-color: rgba(255, 255, 255, .25);
    color: rgba(255, 255, 255, .9);
  }

  &:disabled { opacity: .35; cursor: not-allowed; }
}

.icon-button {
  width: 32px;
  padding: 0;
  color: rgba(255, 255, 255, .5);

  &:hover:not(:disabled) {
    color: rgb(227, 210, 168);
    background: rgba(255, 255, 255, .05);
    border-color: rgba(227, 210, 168, .35);
  }

  &--danger {
    color: rgba(248, 113, 113, .65);
    border-color: rgba(239, 68, 68, .2);
    &:hover:not(:disabled) { color: #f87171; background: rgba(239, 68, 68, .06); border-color: rgba(239, 68, 68, .4); }
  }

  &--confirm {
    color: #4ade80;
    border-color: rgba(34, 197, 94, .3);
    &:hover:not(:disabled) { color: #4ade80; background: rgba(34, 197, 94, .06); border-color: rgba(34, 197, 94, .5); }
  }
}

.status-toggle {
  color: rgba(255, 255, 255, .4);

  &.active {
    color: #4ade80;
    border-color: rgba(34, 197, 94, .3);
  }
}

i.active { color: #4ade80; }

input {
  width: 100%;
  max-width: 220px;
  height: 28px;
}

.name {
  font-size: .85rem;
  font-weight: 600;
  color: var(--color-app-white, #fff);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}

.muted {
  font-size: .78rem;
  color: rgba(255, 255, 255, .5);
}

.description {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}

.list-container {
  width: 100%;
  display: grid;
  padding: .45rem 0;
  grid-template-columns: repeat(5, minmax(80px, 1fr));
  align-items: center;
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 8px;
  transition: background .15s;

  &:hover { background: rgba(255, 255, 255, .05); }

  &.inactive .name { color: rgba(255, 255, 255, .45); }

  & > span:last-child {
    position: sticky;
    right: 0;
    background: rgba(255, 255, 255, .03);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 1;
  }
}

.red-bg {
  background: rgba(123, 41, 23, .35);
  border-color: rgba(229, 115, 115, .25);
}

.row-error {
  margin: -.1rem 0 .2rem;
  font-size: .75rem;
  color: #f87171;
  text-align: right;
}
</style>
