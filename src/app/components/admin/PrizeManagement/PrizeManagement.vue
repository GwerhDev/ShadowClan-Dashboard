<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { vStickyBar } from '../../../directives/stickyBar';
import TableComponent from '../../Tables/TableComponent.vue';
import PrizeListCard from './PrizeListCard.vue';
import PrizeModal from './PrizeModal.vue';
import { getPrizes } from '../../../../middlewares/services';
import type { Prize } from '../../../../interfaces';

// Catálogo de premios para sorteos: los líderes/oficiales eligen entre los activos.

const prizes    = ref<Prize[]>([]);
const loading   = ref(false);
const showModal = ref(false);

async function load() {
  loading.value = true;
  try { prizes.value = await getPrizes(); }
  finally { loading.value = false; }
}

onMounted(load);

const navItems = ['estado', 'nombre', 'descripción', 'sorteos', 'acciones'];
</script>

<template>
  <div class="ul-container">
    <div class="button-list" v-sticky-bar>
      <button class="btn-add" @click="showModal = true">
        <i class="fas fa-plus"></i>
        <span>Agregar premio</span>
      </button>
    </div>

    <TableComponent v-if="prizes.length || loading" :navItems="navItems">
      <PrizeListCard v-for="prize in prizes" :key="prize._id" :prize="prize" @refresh="load" />
      <div v-if="loading && !prizes.length" v-for="n in 4" :key="'sk' + n" class="skeleton-row">
        <div class="skeleton-box skeleton-cell" v-for="c in 5" :key="c"></div>
      </div>
    </TableComponent>

    <p v-else class="empty">Aún no hay premios. Agrega el primero para que los clanes puedan sortearlo.</p>

    <PrizeModal v-if="showModal" @close="showModal = false" @saved="showModal = false; load()" />
  </div>
</template>

<style scoped lang="scss">
.ul-container {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
}

.button-list {
  gap: .75rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: .5rem 0;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  height: 30px;
  padding: 0 1.2rem;
  font-size: .82rem;
  font-weight: 400;
  border-radius: 6px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, .15);
  color: rgba(255, 255, 255, .6);
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;

  i { font-size: .72rem; }
  &:hover {
    background: rgba(255, 255, 255, .07);
    border-color: rgba(255, 255, 255, .3);
    color: rgba(255, 255, 255, .9);
  }
}

.skeleton-row {
  width: 100%; display: grid; grid-template-columns: repeat(5, minmax(80px, 1fr));
  gap: .75rem; padding: .6rem 1rem;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 8px;
}
.skeleton-box {
  border-radius: 6px; background: rgba(255,255,255,.08);
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-cell { height: 28px; }
.empty { font-size: .82rem; color: rgba(255,255,255,.3); padding: .5rem 0; }
@keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:.9; } }
</style>
