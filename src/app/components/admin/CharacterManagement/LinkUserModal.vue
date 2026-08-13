<script setup lang="ts">
import { ref, watch } from 'vue';
import { getUsersPage } from '../../../../middlewares/services';
import { useStore } from '../../../../middlewares/store';
import CustomModal from '../../Modals/CustomModal.vue';

const props = defineProps<{ characterId: string; characterName: string }>();
const emit  = defineEmits<{ close: []; updated: [] }>();

const store: any = useStore();

const query   = ref('');
const results = ref<any[]>([]);
const loading = ref(false);
const saving  = ref(false);
const error   = ref('');
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
    const res = await getUsersPage({ page: 1, limit: 10, q: query.value.trim() });
    results.value = res.data;
  } finally {
    loading.value = false;
  }
}

async function selectUser(user: any) {
  saving.value = true;
  error.value  = '';
  try {
    await store.handleClaimCharacterAsAdmin({ userId: user._id, characterId: props.characterId });
    emit('updated');
    emit('close');
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Error al vincular el usuario.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <CustomModal :title="`Vincular ${characterName} a un usuario`" @close="emit('close')">
    <div class="modal-body">
      <input
        v-model="query"
        class="search-input"
        placeholder="Buscar usuario por battletag..."
        :disabled="saving"
      />

      <p v-if="loading" class="hint">Buscando...</p>

      <ul v-if="results.length" class="results">
        <li
          v-for="user in results"
          :key="user._id"
          class="result-item"
          :class="{ disabled: saving }"
          @click="!saving && selectUser(user)"
        >
          <span class="result-name">{{ user.battletag }}</span>
          <span class="result-characters">
            {{ user.character?.length ?? 0 }} personaje{{ (user.character?.length ?? 0) === 1 ? '' : 's' }}
          </span>
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

.result-characters {
  font-size: .72rem;
  color: rgba(255, 255, 255, .35);
}

.error {
  margin: 0;
  font-size: .82rem;
  color: #e57373;
}
</style>
