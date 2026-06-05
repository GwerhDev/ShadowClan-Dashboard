<style scoped lang="scss" src="./CharacterListCard.scss" />
<script setup lang="ts">
import { classes } from '../../../../middlewares/misc/const';
import { useStore } from '../../../../middlewares/store';
import { Ref, onMounted, ref, computed } from 'vue';
import CustomModal from '../../Modals/CustomModal.vue';

const store: any = useStore();
const editionActive: Ref<boolean> = ref(false);
const deleteActive: Ref<boolean>  = ref(false);
const showStats:    Ref<boolean>  = ref(false);
const characterClan = ref<any>(null);

const name:          Ref<string> = ref('');
const status:        Ref<string> = ref('');
const originalStatus:Ref<string> = ref('');
const resonance:     Ref<number> = ref(0);
const currentClass:  Ref<string> = ref('');

const props = defineProps(['character']);
const emit  = defineEmits(['refresh']);

onMounted(() => {
  name.value          = props.character.name;
  resonance.value     = props.character.resonance;
  currentClass.value  = props.character.currentClass;
  status.value        = props.character.status;
  originalStatus.value= props.character.status;
  characterClan.value = props.character.clan ?? null;
});

const displayScore = computed(() => props.character.score ?? 0);

function handleEdit() { editionActive.value = true; }

function toggleStatus() {
  if (originalStatus.value === 'unclaimed') return;
  status.value = status.value === 'unclaimed' ? originalStatus.value : 'unclaimed';
}

async function handleUpdate(id: string) {
  const willUnclaim = status.value === 'unclaimed' && originalStatus.value !== 'unclaimed';

  if (willUnclaim) {
    await store.handleUnclaimCharacter(id);
    characterClan.value  = null;
    originalStatus.value = 'unclaimed';
  } else {
    await store.handleUpdateAdminCharacter({
      _id: id,
      character: name.value,
      resonance: resonance.value,
      class: currentClass.value,
    });
  }

  editionActive.value = false;
  emit('refresh');
}

async function handleDeleteMember(id: string) {
  await store.handleDeleteMember(id);
  emit('refresh');
}

function handleCancel() {
  editionActive.value  = false;
  deleteActive.value   = false;
  status.value         = originalStatus.value;
}

async function removeClan(id: string) {
  await store.handleRemoveCharacterClan(id);
  characterClan.value = null;
}
</script>

<template>
  <!-- Edición -->
  <div class="list-container" v-if="editionActive && !deleteActive">
    <span>
      <button
        type="button"
        class="status-toggle"
        :class="{ 'is-unclaiming': status === 'unclaimed' && originalStatus !== 'unclaimed' }"
        :title="originalStatus !== 'unclaimed' ? 'Click para desvincular' : status"
        @click="toggleStatus"
      >
        <i v-if="status === 'claimed'" class="fas fa-link"></i>
        <i v-else-if="status === 'pending'" class="fas fa-hourglass-half"></i>
        <i v-else class="fas fa-unlink"></i>
      </button>
    </span>
    <span><input type="text" v-model="name"></span>
    <span>
      <button class="score-btn score-btn--edit" @click="showStats = true" title="Ver atributos">
        <i class="fas fa-chart-bar"></i> Stats
      </button>
    </span>
    <span>
      <select v-model="currentClass">
        <option v-for="cls in classes" :key="cls.value" :value="cls.value">{{ cls.name }}</option>
      </select>
    </span>
    <span>
      <span v-if="characterClan?.name" class="clan-edit-row">
        <i class="fas fa-shield-halved"></i>
        <span class="clan-edit-name">{{ characterClan.name }}</span>
        <button type="button" class="clan-remove-btn" @click="removeClan(character._id)" title="Quitar del clan">
          <i class="fas fa-trash"></i>
        </button>
      </span>
      <span v-else class="clan-label muted">Sin clan</span>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" @click="handleUpdate(character._id)" title="Guardar"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Confirmar eliminar -->
  <div class="list-container red-bg" v-if="!editionActive && deleteActive">
    <span>
      <i v-if="status === 'claimed'" class="fas fa-link" :title="status"></i>
      <i v-else-if="status === 'pending'" class="fas fa-hourglass-half" :title="status"></i>
      <i v-else class="fas fa-unlink" :title="status"></i>
    </span>
    <span><p>{{ character.name }}</p></span>
    <span><p>{{ displayScore > 0 ? displayScore.toLocaleString('es') : '—' }}</p></span>
    <span>
      <ul class="class-container">
        <img :src="classes.find(cls => cls.value === character.currentClass)?.image" alt="" width="30">
      </ul>
    </span>
    <span>
      <p v-if="characterClan?.name" class="clan-label">
        <i class="fas fa-shield-halved"></i> {{ characterClan.name }}
      </p>
      <p v-else class="clan-label muted">Sin clan</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" @click="handleDeleteMember(character._id)" title="Confirmar eliminación"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Vista normal -->
  <div class="list-container" v-if="!editionActive && !deleteActive">
    <span>
      <i v-if="status === 'claimed'" class="fas fa-link" :title="status"></i>
      <i v-else-if="status === 'pending'" class="fas fa-hourglass-half" :title="status"></i>
      <i v-else class="fas fa-unlink" :title="status"></i>
    </span>
    <span><p>{{ character.name }}</p></span>
    <span>
      <button class="score-btn" @click="showStats = true" :title="'Ver atributos'">
        {{ displayScore > 0 ? displayScore.toLocaleString('es') : '—' }}
      </button>
    </span>
    <span>
      <ul class="class-container">
        <img :src="classes.find(cls => cls.value === character.currentClass)?.image"
          :alt="character.currentClass" :title="character.currentClass" width="30">
      </ul>
    </span>
    <span>
      <p v-if="characterClan?.name" class="clan-label">
        <i class="fas fa-shield-halved"></i> {{ characterClan.name }}
      </p>
      <p v-else class="clan-label muted">Sin clan</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button" @click="handleEdit" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="icon-button icon-button--danger" @click="deleteActive = true" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </span>
  </div>

  <!-- Modal stats -->
  <CustomModal v-if="showStats" :title="character.name" @close="showStats = false">
    <div class="stats-modal">
      <div class="stats-row" v-for="stat in [
        { label: 'Resonancia',  key: 'resonance'        },
        { label: 'Armadura',    key: 'armor'             },
        { label: 'Penetración', key: 'armorPenetration'  },
        { label: 'Potencia',    key: 'power'             },
        { label: 'Resistencia', key: 'resistance'        },
      ]" :key="stat.key">
        <span class="stats-label">{{ stat.label }}</span>
        <span class="stats-value">
          {{ (character[stat.key] ?? null) !== null ? Number(character[stat.key]).toLocaleString('es') : '—' }}
        </span>
      </div>
      <div class="stats-total">
        <span class="stats-label">Puntaje total</span>
        <span class="stats-value stats-value--total">
          {{ displayScore > 0 ? displayScore.toLocaleString('es') : '—' }}
        </span>
      </div>
    </div>
  </CustomModal>
</template>

<style scoped lang="scss">
.score-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 5px;
  color: rgba(255, 255, 255, .7);
  font-size: .82rem;
  padding: .15rem .5rem;
  cursor: pointer;
  transition: border-color .15s, color .15s, background .15s;

  &:hover {
    border-color: rgba(227, 210, 168, .4);
    color: rgb(227, 210, 168);
    background: rgba(227, 210, 168, .05);
  }

  &--edit {
    display: flex;
    align-items: center;
    gap: .3rem;
    font-size: .75rem;
    color: rgba(227, 210, 168, .7);
    border-color: rgba(227, 210, 168, .2);
  }
}

.stats-modal {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  min-width: 240px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: .4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, .06);
}

.stats-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: .5rem;
}

.stats-label {
  font-size: .78rem;
  color: rgba(255, 255, 255, .4);
  text-transform: uppercase;
  letter-spacing: .06em;
}

.stats-value {
  font-size: .9rem;
  color: rgba(255, 255, 255, .8);
  font-weight: 500;

  &--total {
    font-size: 1rem;
    color: rgba(227, 210, 168, .9);
    font-weight: 700;
  }
}
</style>
