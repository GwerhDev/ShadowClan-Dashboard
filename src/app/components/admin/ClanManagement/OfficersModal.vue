<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { getClanById, updateClan, searchCharacters } from '../../../../middlewares/services';
import CustomModal from '../../Modals/CustomModal.vue';
import ClassIcon from '../../ClassIcon.vue';

const props = defineProps<{ clan: any; editable: boolean }>();
const emit  = defineEmits<{ close: []; updated: [] }>();

const officers = ref<any[]>([]);
const loading  = ref(true);
const saving   = ref(false);

// Search
const query      = ref('');
const results    = ref<any[]>([]);
const searching  = ref(false);
let debounce: ReturnType<typeof setTimeout> | null = null;

onMounted(loadOfficers);

async function loadOfficers() {
  loading.value = true;
  try {
    const full = await getClanById(props.clan._id);
    officers.value = full.officer ?? [];
  } finally {
    loading.value = false;
  }
}

watch(query, (val) => {
  if (debounce) clearTimeout(debounce);
  results.value = [];
  if (val.trim().length < 2) return;
  debounce = setTimeout(doSearch, 600);
});

async function doSearch() {
  searching.value = true;
  try {
    const all = await searchCharacters(query.value.trim());
    const officerIds = new Set(officers.value.map((o: any) => String(o._id ?? o)));
    results.value = all.filter((c: any) => !officerIds.has(String(c._id)));
  } finally {
    searching.value = false;
  }
}

async function removeOfficer(id: string) {
  saving.value = true;
  try {
    const newOfficers = officers.value.map((o: any) => String(o._id ?? o)).filter(oid => oid !== id);
    await updateClan({ _id: props.clan._id, officer: newOfficers });
    officers.value = officers.value.filter((o: any) => String(o._id ?? o) !== id);
    emit('updated');
  } finally {
    saving.value = false;
  }
}

async function addOfficer(char: any) {
  saving.value = true;
  try {
    const newOfficers = [...officers.value.map((o: any) => String(o._id ?? o)), String(char._id)];
    await updateClan({ _id: props.clan._id, officer: newOfficers });
    officers.value.push(char);
    results.value = results.value.filter((c: any) => String(c._id) !== String(char._id));
    query.value = '';
    emit('updated');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <CustomModal :title="editable ? 'Gestionar oficiales' : 'Oficiales'" @close="emit('close')">
    <div class="officers-body">

      <p v-if="loading" class="hint">Cargando...</p>

      <template v-else>
        <p v-if="!officers.length" class="hint">Sin oficiales.</p>

        <ul class="officer-list">
          <li v-for="o in officers" :key="o._id ?? o" class="officer-row">
            <ClassIcon :value="o.currentClass" />
            <span class="officer-name">{{ o.name ?? o }}</span>
            <button
              v-if="editable"
              class="icon-button icon-button--danger"
              :disabled="saving"
              @click="removeOfficer(String(o._id ?? o))"
              title="Quitar oficial"
            >
              <i class="fas fa-user-minus"></i>
            </button>
          </li>
        </ul>

        <!-- Search to add (edit mode only) -->
        <template v-if="editable">
          <div class="divider"></div>
          <input
            v-model="query"
            class="search-input"
            placeholder="Buscar personaje para añadir como oficial..."
            :disabled="saving"
          />
          <p v-if="searching" class="hint">Buscando...</p>
          <ul v-if="results.length" class="result-list">
            <li
              v-for="c in results"
              :key="c._id"
              class="result-row"
              :class="{ disabled: saving }"
              @click="!saving && addOfficer(c)"
            >
              <ClassIcon :value="c.currentClass" />
              <span class="officer-name">{{ c.name }}</span>
              <span class="result-clan">{{ c.clan?.name ?? 'Sin clan' }}</span>
            </li>
          </ul>
        </template>
      </template>

    </div>
  </CustomModal>
</template>

<style scoped lang="scss">
.officers-body {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  min-width: 280px;
}

.hint {
  margin: 0;
  font-size: .8rem;
  color: rgba(255, 255, 255, .35);
}

.officer-list,
.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .35rem;
  max-height: 240px;
  overflow-y: auto;
}

.officer-row,
.result-row {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .45rem .75rem;
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 7px;
}

.result-row {
  cursor: pointer;
  transition: background .15s, border-color .15s;

  &:hover:not(.disabled) {
    background: rgba(255, 255, 255, .07);
    border-color: rgba(227, 210, 168, .2);
  }

  &.disabled { cursor: wait; opacity: .6; }
}

.officer-name {
  flex: 1;
  font-size: .86rem;
  color: rgba(255, 255, 255, .85);
}

.result-clan {
  font-size: .72rem;
  color: rgba(255, 255, 255, .3);
  font-style: italic;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, .07);
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
</style>
