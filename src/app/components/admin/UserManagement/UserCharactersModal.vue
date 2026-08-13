<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminCharactersByIds } from '../../../../middlewares/services';
import { classes } from '../../../../middlewares/misc/const';
import CustomModal from '../../Modals/CustomModal.vue';

const props = defineProps<{ characterIds: string[]; userName: string }>();
const emit  = defineEmits<{ close: [] }>();

const characters = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    characters.value = await getAdminCharactersByIds(props.characterIds);
  } finally {
    loading.value = false;
  }
});

function getClassImage(className: string | undefined) {
  return classes.find((c) => c.value === className)?.image ?? '';
}
</script>

<template>
  <CustomModal :title="`Personajes de ${userName}`" @close="emit('close')">
    <div class="modal-body">
      <p v-if="loading" class="hint">Cargando...</p>

      <ul v-else-if="characters.length" class="results">
        <li v-for="character in characters" :key="character._id" class="result-item">
          <img
            v-if="character.currentClass"
            :src="getClassImage(character.currentClass)"
            :title="character.currentClass"
            :alt="character.currentClass"
            class="class-image"
          />
          <span class="result-name">{{ character.name }}</span>
          <span class="result-clan">{{ character.clan?.name ?? 'Sin clan' }}</span>
          <span class="result-score">{{ (character.score ?? 0).toLocaleString('es') }}</span>
        </li>
      </ul>

      <p v-else class="hint">Este usuario no tiene personajes vinculados.</p>
    </div>
  </CustomModal>
</template>

<style scoped lang="scss">
.modal-body {
  display: flex;
  flex-direction: column;
  gap: .85rem;
  min-width: 320px;
}

.hint {
  margin: 0;
  font-size: .78rem;
  color: rgba(255, 255, 255, .35);
}

.results {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .35rem;
  max-height: 360px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .5rem .75rem;
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 7px;
}

.class-image {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.result-name {
  font-size: .85rem;
  color: rgba(255, 255, 255, .85);
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.result-clan {
  font-size: .72rem;
  color: rgba(255, 255, 255, .35);
  white-space: nowrap;
}

.result-score {
  font-size: .78rem;
  color: rgba(227, 210, 168, .8);
  font-weight: 600;
  white-space: nowrap;
}
</style>
