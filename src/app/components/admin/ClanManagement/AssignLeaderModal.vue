<script setup lang="ts">
import { ref, watch } from 'vue';
import { searchCharacters, assignClanLeader } from '../../../../middlewares/services';
import CustomModal from '../../Modals/CustomModal.vue';

const props = defineProps<{ clan: any }>();
const emit  = defineEmits<{ close: []; updated: [] }>();

const query    = ref('');
const results  = ref<any[]>([]);
const loading  = ref(false);
const saving   = ref(false);
const error    = ref('');
let debounce: ReturnType<typeof setTimeout> | null = null;

watch(query, (val) => {
  if (debounce) clearTimeout(debounce);
  results.value = [];
  if (val.trim().length < 2) return;
  debounce = setTimeout(doSearch, 600);
});

async function doSearch() {
  loading.value = true;
  try {
    results.value = await searchCharacters(query.value.trim());
  } finally {
    loading.value = false;
  }
}

async function selectLeader(char: any) {
  saving.value = true;
  error.value  = '';
  try {
    await assignClanLeader(props.clan._id, char._id);
    emit('updated');
    emit('close');
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al asignar el líder.';
  } finally {
    saving.value = false;
  }
}

const hasLeader = !!props.clan.leader?.name;
const title     = hasLeader ? 'Cambiar líder' : 'Asignar líder';
</script>

<template>
  <CustomModal :title="title" @close="emit('close')">
    <div class="modal-body">
      <p v-if="hasLeader" class="current-leader">
        Líder actual: <strong>{{ clan.leader.name }}</strong>
        <span class="hint">(pasará a ser miembro)</span>
      </p>

      <input
        v-model="query"
        class="search-input"
        placeholder="Buscar personaje por nombre..."
        :disabled="saving"
      />

      <p v-if="loading" class="hint">Buscando...</p>

      <ul v-if="results.length" class="results">
        <li
          v-for="char in results"
          :key="char._id"
          class="result-item"
          :class="{ disabled: saving }"
          @click="!saving && selectLeader(char)"
        >
          <span class="result-name">{{ char.name }}</span>
          <span v-if="char.clan?.name" class="result-clan">{{ char.clan.name }}</span>
          <span v-else class="result-clan result-clan--none">Sin clan</span>
        </li>
      </ul>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </CustomModal>
</template>

<style scoped lang="scss">
.modal-body {
  display: flex;
  flex-direction: column;
  gap: .85rem;
}

.current-leader {
  margin: 0;
  font-size: .82rem;
  color: rgba(255, 255, 255, .55);

  strong { color: rgba(255, 255, 255, .85); }
}

.hint {
  margin: 0;
  font-size: .78rem;
  color: rgba(255, 255, 255, .35);
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 .75rem;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 6px;
  color: rgba(255, 255, 255, .85);
  font-size: .85rem;
  box-sizing: border-box;

  &:focus { outline: none; border-color: rgba(227, 210, 168, .4); }
  &::placeholder { color: rgba(255, 255, 255, .25); }
  &:disabled { opacity: .5; }
}

.results {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .35rem;
  max-height: 240px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .5rem .75rem;
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 7px;
  cursor: pointer;
  transition: background .15s, border-color .15s;

  &:hover:not(.disabled) {
    background: rgba(255, 255, 255, .07);
    border-color: rgba(227, 210, 168, .25);
  }

  &.disabled { cursor: wait; opacity: .6; }
}

.result-name { font-size: .88rem; color: rgba(255, 255, 255, .85); }

.result-clan {
  font-size: .72rem;
  color: rgba(255, 255, 255, .35);

  &--none { font-style: italic; }
}

.error {
  margin: 0;
  font-size: .82rem;
  color: #e57373;
}
</style>
