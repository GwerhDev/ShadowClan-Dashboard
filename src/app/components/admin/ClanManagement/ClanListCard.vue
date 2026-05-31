<style scoped lang="scss" src="./ClanListCard.scss" />
<script setup lang="ts">
import { useStore } from '../../../../middlewares/store';
import { useRouter } from 'vue-router';
import { Ref, onMounted, ref } from 'vue';
import AssignLeaderModal from './AssignLeaderModal.vue';
import OfficersModal from './OfficersModal.vue';
import ClanSyncModal from './ClanSyncModal.vue';
import { removeClanLeader } from '../../../../middlewares/services';

const store: any = useStore();
const router = useRouter();
const editionActive: Ref<boolean>  = ref(false);
const deleteActive: Ref<boolean>   = ref(false);
const leaderModal:   Ref<boolean> = ref(false);
const officersModal: Ref<boolean> = ref(false);
const syncModal:     Ref<boolean> = ref(false);
const removingLeader: Ref<boolean> = ref(false);

const name: Ref<string> = ref('');

const props = defineProps(['clan']);

onMounted(() => {
  name.value = props.clan.name;
});

function handleEdit() {
  editionActive.value = true;
}

async function handleUpdate(clan: any) {
  await store.handleUpdateClan({ _id: clan._id, name: name.value });
  editionActive.value = false;
}

async function handleDeleteClan(id: string) {
  await store.handleDeleteClan(id);
}

function handleCancel() {
  editionActive.value = false;
  deleteActive.value  = false;
  name.value = props.clan.name;
}

function handleDelete() {
  deleteActive.value = true;
}

async function onLeaderUpdated() {
  await store.handleGetClans();
}

async function handleRemoveLeader() {
  removingLeader.value = true;
  try {
    await removeClanLeader(props.clan._id);
    await store.handleGetClans();
  } finally {
    removingLeader.value = false;
  }
}
</script>

<template>
  <!-- Vista edición -->
  <div class="list-container" v-if="editionActive && !deleteActive">
    <span>
      <i v-if="clan.status === 'claimed'"   class="fas fa-link"          :title="clan.status"></i>
      <i v-if="clan.status === 'pending'"   class="fas fa-hourglass-half" :title="clan.status"></i>
      <i v-if="clan.status === 'unclaimed'" class="fas fa-unlink"         :title="clan.status"></i>
    </span>
    <span><input type="text" v-model="name" /></span>
    <span class="leader-cell">
      <span class="leader-name">{{ clan.leader?.name ?? '—' }}</span>
      <div class="leader-actions">
        <button @click="leaderModal = true" title="Cambiar líder">
          {{ clan.leader?.name ? 'Cambiar' : 'Asignar' }}
        </button>
        <button
          v-if="clan.leader?.name"
          class="icon-button icon-button--danger"
          :disabled="removingLeader"
          @click="handleRemoveLeader"
          title="Quitar líder"
        >
          <i class="fas fa-user-minus"></i>
        </button>
      </div>
    </span>
    <span>
      <p class="officer-count clickable" @click="officersModal = true" title="Ver / gestionar oficiales">
        {{ clan.officer?.length ?? 0 }}
      </p>
    </span>
    <span><p class="member-count">{{ clan.totalMembers }}/100</p></span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" @click="handleUpdate(clan)" title="Guardar"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Vista confirmar eliminación -->
  <div class="list-container red-bg" v-if="!editionActive && deleteActive">
    <span>
      <i v-if="clan.status === 'claimed'"   class="fas fa-link"          :title="clan.status"></i>
      <i v-if="clan.status === 'pending'"   class="fas fa-hourglass-half" :title="clan.status"></i>
      <i v-if="clan.status === 'unclaimed'" class="fas fa-unlink"         :title="clan.status"></i>
    </span>
    <span><p>{{ clan.name }}</p></span>
    <span><p>{{ clan.leader?.name ?? '—' }}</p></span>
    <span><p>{{ clan.officer?.length ?? 0 }}</p></span>
    <span><p class="member-count">{{ clan.totalMembers }}/100</p></span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" @click="handleDeleteClan(clan._id)" title="Confirmar eliminación"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>

  <!-- Vista normal -->
  <div class="list-container" v-if="!editionActive && !deleteActive">
    <span>
      <i v-if="clan.status === 'claimed'"   class="fas fa-link"          :title="clan.status"></i>
      <i v-if="clan.status === 'pending'"   class="fas fa-hourglass-half" :title="clan.status"></i>
      <i v-if="clan.status === 'unclaimed'" class="fas fa-unlink"         :title="clan.status"></i>
    </span>
    <span><p>{{ clan.name }}</p></span>
    <span><p>{{ clan.leader?.name ?? '—' }}</p></span>
    <span>
      <p class="officer-count clickable" @click="officersModal = true" title="Ver oficiales">
        {{ clan.officer?.length ?? 0 }}
      </p>
    </span>
    <span><p class="member-count">{{ clan.totalMembers }}/100</p></span>
    <span>
      <div class="buttons-container">
        <button class="icon-button" @click="router.push('/management/clans/' + clan._id)" title="Ver detalle"><i class="fas fa-eye"></i></button>
        <button class="icon-button" @click="syncModal = true" title="Actualizar desde archivo"><i class="fas fa-rotate"></i></button>
        <button class="icon-button" @click="handleEdit" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="icon-button icon-button--danger" @click="handleDelete" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </span>
  </div>

  <AssignLeaderModal
    v-if="leaderModal"
    :clan="clan"
    @close="leaderModal = false"
    @updated="onLeaderUpdated"
  />

  <OfficersModal
    v-if="officersModal"
    :clan="clan"
    :editable="editionActive"
    @close="officersModal = false"
    @updated="store.handleGetClans()"
  />

  <ClanSyncModal
    v-if="syncModal"
    :clan="clan"
    @close="syncModal = false"
    @updated="store.handleGetClans()"
  />
</template>
