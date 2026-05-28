<style scoped lang="scss" src="./ClanListCard.scss" />
<script setup lang="ts">
import { useStore } from '../../../../middlewares/store';
import { Ref, onMounted, ref } from 'vue';

const store: any = useStore();
const editionActive: Ref<boolean> = ref(false);
const deleteActive: Ref<boolean> = ref(false);

const name: Ref<string> = ref('');
const member: Ref<string> = ref('');
const leader: Ref<string> = ref('');

const props = defineProps(['clan']);

onMounted(() => {
  name.value = props.clan.name;
  member.value = props.clan.member;
  leader.value = props.clan.leader;
});

function handleEdit() {
  editionActive.value = true;
};

async function handleUpdate(clan: any) {
  const formData = {
    _id: clan._id,
    name: name.value,
  };

  await store.handleUpdateClan(formData);
  editionActive.value = false;
};

async function handleDeleteClan(id: string) {
  await store.handleDeleteClan(id);
};

function handleCancel() {
  editionActive.value = false;
  deleteActive.value = false;
};

function handleDelete() {
  deleteActive.value = true;
};

</script>

<template>
  <div class="list-container" v-if="editionActive && !deleteActive">
    <span>
      <i v-if="clan.status === 'claimed'" class="fas fa-link" :alt="clan.status" :title="clan.status"></i>
      <i v-if="clan.status === 'pending'" class="fas fa-hourglass-half" :alt="clan.status" :title="clan.status"></i>
      <i v-if="clan.status === 'unclaimed'" class="fas fa-unlink" :alt="clan.status" :title="clan.status"></i>
    </span>
    <span>
      <input type="text" v-model="name">
    </span>
    <span>
      <span>
        <button>Change leader ({{ clan.leader?.name }})</button>
      </span>
    </span>
    <span>
      <p>{{ clan.officer?.length ?? 0 }}</p>
    </span>
    <span>
      <p class="member-count">{{ clan.totalMembers }}/100</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" @click="handleUpdate(clan)" title="Guardar"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>
  <div class="list-container red-bg" v-if="!editionActive && deleteActive">
    <span>
      <i v-if="clan.status === 'claimed'" class="fas fa-link" :alt="clan.status" :title="clan.status"></i>
      <i v-if="clan.status === 'pending'" class="fas fa-hourglass-half" :alt="clan.status" :title="clan.status"></i>
      <i v-if="clan.status === 'unclaimed'" class="fas fa-unlink" :alt="clan.status" :title="clan.status"></i>
    </span>
    <span>
      <p>{{ clan.name }}</p>
    </span>
    <span>
      <p>{{ clan.leader?.name }}</p>
    </span>
    <span>
      <p>{{ clan.officer?.length ?? 0 }}</p>
    </span>
    <span>
      <p class="member-count">{{ clan.totalMembers }}/100</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button icon-button--confirm" @click="handleDeleteClan(clan._id)" title="Confirmar eliminación"><i class="fas fa-check"></i></button>
        <button class="icon-button" @click="handleCancel" title="Cancelar"><i class="fas fa-times"></i></button>
      </div>
    </span>
  </div>
  <div class="list-container" v-if="!editionActive && !deleteActive">
    <span>
      <i v-if="clan.status === 'claimed'" class="fas fa-link" :alt="clan.status" :title="clan.status"></i>
      <i v-if="clan.status === 'pending'" class="fas fa-hourglass-half" :alt="clan.status" :title="clan.status"></i>
      <i v-if="clan.status === 'unclaimed'" class="fas fa-unlink" :alt="clan.status" :title="clan.status"></i>
    </span>
    <span>
      <p>{{ clan.name }}</p>
    </span>
    <span>
      <p>{{ clan.leader?.name }}</p>
    </span>
    <span>
      <p>{{ clan.officer?.length ?? 0 }}</p>
    </span>
    <span>
      <p class="member-count">{{ clan.totalMembers }}/100</p>
    </span>
    <span>
      <div class="buttons-container">
        <button class="icon-button" @click="handleEdit" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="icon-button icon-button--danger" @click="handleDelete" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </span>
  </div>
</template>
