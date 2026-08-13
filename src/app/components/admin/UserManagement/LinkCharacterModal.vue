<script setup lang="ts">
import { ref, watch } from 'vue';
import { searchCharacters } from '../../../../middlewares/services';
import { useStore } from '../../../../middlewares/store';
import CustomModal from '../../Modals/CustomModal.vue';

const props = defineProps<{
  initialSelectedIds: string[];
  userName: string;
  userId: string;
}>();

const store: any = useStore();
const emits = defineEmits<{ close: []; save: [selectedIds: string[]] }>();

const selectedMemberIds = ref<string[]>([...props.initialSelectedIds]);

const query    = ref('');
const results  = ref<any[]>([]);
const loading  = ref(false);
const toggling = ref('');
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

function isLinkedToOther(character: any) {
  return character.status === 'claimed' && !selectedMemberIds.value.includes(character._id);
}

async function toggleCharacter(character: any) {
  if (isLinkedToOther(character) || toggling.value) return;
  toggling.value = character._id;
  const formData = { userId: props.userId, characterId: character._id };
  try {
    if (selectedMemberIds.value.includes(character._id)) {
      await store.handleUnclaimCharacterAsAdmin(formData);
      selectedMemberIds.value = selectedMemberIds.value.filter((id) => id !== character._id);
      character.status = 'unclaimed';
    } else {
      await store.handleClaimCharacterAsAdmin(formData);
      selectedMemberIds.value = [...selectedMemberIds.value, character._id];
      character.status = 'claimed';
    }
    emits('save', selectedMemberIds.value);
  } finally {
    toggling.value = '';
  }
}
</script>

<template>
  <CustomModal :title="`Vincular personajes a ${userName}`" @close="emits('close')">
    <div class="modal-body">
      <p class="hint">
        {{ selectedMemberIds.length }} personaje{{ selectedMemberIds.length === 1 ? '' : 's' }} vinculado{{ selectedMemberIds.length === 1 ? '' : 's' }}
      </p>

      <input
        v-model="query"
        class="search-input"
        placeholder="Buscar personaje por nombre..."
      />

      <p v-if="loading" class="hint">Buscando...</p>
      <p v-else-if="query.trim().length >= 2 && !results.length" class="hint">Sin resultados.</p>

      <ul v-if="results.length" class="results">
        <li
          v-for="character in results"
          :key="character._id"
          class="result-item"
          :class="{ disabled: isLinkedToOther(character) || !!toggling }"
          @click="toggleCharacter(character)"
        >
          <span class="result-name">{{ character.name }}</span>
          <span v-if="isLinkedToOther(character)" class="result-hint">Vinculado a otro usuario</span>
          <i
            v-else
            class="fas result-check"
            :class="selectedMemberIds.includes(character._id) ? 'fa-check-square' : 'fa-square'"
          ></i>
        </li>
      </ul>
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
}

.results {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .35rem;
  max-height: 320px;
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

  &.disabled { cursor: not-allowed; opacity: .6; }
}

.result-name { font-size: .88rem; color: rgba(255, 255, 255, .85); }

.result-hint {
  font-size: .72rem;
  color: rgba(255, 255, 255, .35);
  font-style: italic;
}

.result-check {
  font-size: .95rem;
  color: rgba(227, 210, 168, .8);
}
</style>
