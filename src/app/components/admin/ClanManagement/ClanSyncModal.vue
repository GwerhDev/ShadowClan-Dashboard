<script setup lang="ts">
import { ref } from 'vue';
import { syncClanFromFile } from '../../../../middlewares/services';
import CustomModal from '../../Modals/CustomModal.vue';

const props = defineProps<{ clan: any }>();
const emit  = defineEmits<{ close: []; updated: [] }>();

const file    = ref<File | null>(null);
const loading = ref(false);
const error   = ref('');
const results = ref<{ name: string; status: string }[]>([]);
const removed = ref(0);
const done    = ref(false);

function onFileChange(e: Event) {
  file.value  = (e.target as HTMLInputElement).files?.[0] ?? null;
  error.value = '';
  done.value  = false;
  results.value = [];
}

async function handleSync() {
  if (!file.value) return;
  loading.value = true;
  error.value   = '';
  done.value    = false;
  try {
    const res = await syncClanFromFile(props.clan._id, file.value);
    results.value = res.results ?? [];
    removed.value = res.removed ?? 0;
    done.value    = true;
  } catch (e: any) {
    const data = (e as any)?.response?.data;
    error.value = data?.message ?? data?.details ?? data?.error ?? 'Error al sincronizar.';
  } finally {
    loading.value = false;
    emit('updated');
  }
}
</script>

<template>
  <CustomModal title="Actualizar clan desde archivo" @close="emit('close')">
    <div class="sync-body">
      <p class="hint">
        El archivo reemplaza los <strong>miembros</strong> del clan. Los personajes del archivo son creados o actualizados; los que no aparezcan son eliminados del clan.<br />
        Columnas requeridas: <strong>Jugador, Resonancia, Armadura, Penetracion, Potencia, Resistencia, Clase, Whatsapp</strong>.
      </p>

      <div class="field">
        <label class="field-label">Archivo (.csv o .xlsx)</label>
        <input type="file" accept=".csv,.xlsx" class="file-input" @change="onFileChange" :disabled="loading" />
      </div>

      <button class="btn-sync" :disabled="loading || !file" @click="handleSync">
        <i class="fas fa-rotate"></i>
        {{ loading ? 'Sincronizando...' : 'Sincronizar' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>

      <template v-if="done">
        <div class="summary">
          <span>{{ results.length }} procesados</span>
          <span v-if="removed > 0" class="removed">· {{ removed }} eliminados del clan</span>
        </div>
        <ul class="result-list">
          <li v-for="r in results" :key="r.name" class="result-row" :class="'row--' + r.status">
            <span class="result-name">{{ r.name }}</span>
            <span class="result-badge">{{ r.status === 'created' ? 'Creado' : 'Actualizado' }}</span>
          </li>
        </ul>
      </template>
    </div>
  </CustomModal>
</template>

<style scoped lang="scss">
.sync-body {
  display: flex;
  flex-direction: column;
  gap: .9rem;
  min-width: 320px;
}

.hint {
  margin: 0;
  font-size: .8rem;
  color: rgba(255, 255, 255, .4);
  line-height: 1.55;

  strong { color: rgba(255, 255, 255, .65); }
}

.field { display: flex; flex-direction: column; gap: .35rem; }

.field-label {
  font-size: .78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, .55);
}

.file-input {
  font-size: .8rem;
  color: rgba(255, 255, 255, .6);
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 6px;
  padding: .4rem .6rem;
  cursor: pointer;

  &::file-selector-button {
    background: rgba(255, 255, 255, .08);
    border: 1px solid rgba(255, 255, 255, .15);
    border-radius: 4px;
    color: rgba(255, 255, 255, .7);
    font-size: .75rem;
    padding: .2rem .6rem;
    margin-right: .6rem;
    cursor: pointer;
    transition: background .15s;
    &:hover { background: rgba(255, 255, 255, .14); }
  }
}

.btn-sync {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  height: 32px;
  background: transparent;
  border: 1px solid rgba(227, 210, 168, .3);
  color: rgba(227, 210, 168, .8);
  border-radius: 6px;
  font-size: .84rem;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;

  &:hover:not(:disabled) {
    background: rgba(227, 210, 168, .08);
    border-color: rgba(227, 210, 168, .55);
    color: rgb(227, 210, 168);
  }

  &:disabled { opacity: .4; cursor: not-allowed; }
}

.error {
  margin: 0;
  font-size: .82rem;
  color: #e57373;
}

.summary {
  font-size: .78rem;
  color: rgba(255, 255, 255, .4);
  display: flex;
  gap: .5rem;
}

.removed { color: #e57373; }

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .3rem;
  max-height: 220px;
  overflow-y: auto;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .38rem .7rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .06);
  font-size: .8rem;

  &.row--created { border-color: rgba(102, 187, 106, .2); }
  &.row--updated { border-color: rgba(147, 197, 253, .15); }
}

.result-name { color: rgba(255, 255, 255, .8); }

.result-badge {
  font-size: .65rem;
  letter-spacing: .07em;
  text-transform: uppercase;
  font-weight: 600;
  padding: .1rem .4rem;
  border-radius: 4px;

  .row--created & { background: rgba(102,187,106,.12); color: #66bb6a; border: 1px solid rgba(102,187,106,.25); }
  .row--updated & { background: rgba(147,197,253,.1);  color: #93c5fd; border: 1px solid rgba(147,197,253,.2); }
}
</style>
