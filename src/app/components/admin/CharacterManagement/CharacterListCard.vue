<style scoped lang="scss" src="./CharacterListCard.scss" />
<script setup lang="ts">
import { classes } from '../../../../middlewares/misc/const';
import { useStore } from '../../../../middlewares/store';
import { Ref, onMounted, ref } from 'vue';

const store: any = useStore();
const editionActive: Ref<boolean> = ref(false);
const deleteActive: Ref<boolean> = ref(false);
const characterClan = ref<any>(null);

const name: Ref<string> = ref('');
const status: Ref<string> = ref('');
const originalStatus: Ref<string> = ref('');
const resonance: Ref<number> = ref(0);
const currentClass: Ref<string> = ref('');

const props = defineProps(['character']);

onMounted(() => {
  name.value = props.character.name;
  resonance.value = props.character.resonance;
  currentClass.value = props.character.currentClass;
  status.value = props.character.status;
  originalStatus.value = props.character.status;
  characterClan.value = props.character.clan ?? null;
});

function handleEdit() { editionActive.value = true; }

function toggleStatus() {
  if (originalStatus.value === 'unclaimed') return;
  status.value = status.value === 'unclaimed' ? originalStatus.value : 'unclaimed';
}

async function handleUpdate(id: string) {
  const willUnclaim = status.value === 'unclaimed' && originalStatus.value !== 'unclaimed';

  if (willUnclaim) {
    await store.handleUnclaimCharacter(id);
    characterClan.value = null;
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
}

async function handleDeleteMember(id: string) {
  await store.handleDeleteMember(id);
}

function handleCancel() {
  editionActive.value = false;
  deleteActive.value = false;
  status.value = originalStatus.value;
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
    <span><input type="number" v-model.number="resonance"></span>
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
      <ul class="buttons-container">
        <button @click="handleUpdate(character._id)">✔️</button>
        <button @click="handleCancel">❌</button>
      </ul>
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
    <span><p>{{ character.resonance }}</p></span>
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
      <ul class="buttons-container">
        <button @click="handleDeleteMember(character._id)">✔️</button>
        <button @click="handleCancel">❌</button>
      </ul>
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
    <span><p>{{ character.resonance }}</p></span>
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
      <ul class="buttons-container">
        <button @click="handleEdit" title="Editar">
          <img src="../../../../assets/svg/edit-icon.svg" alt="" width="18px">
        </button>
        <button @click="deleteActive = true" title="Eliminar">
          <img src="../../../../assets/svg/delete-icon.svg" alt="" width="22px">
        </button>
      </ul>
    </span>
  </div>
</template>
