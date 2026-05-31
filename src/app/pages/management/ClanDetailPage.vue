<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getClanById } from '../../../middlewares/services';
import TableComponent from '../../components/Tables/TableComponent.vue';
import ClassIcon from '../../components/ClassIcon.vue';

const route  = useRoute();
const router = useRouter();

const clan    = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    clan.value = await getClanById(route.params.id as string);
  } finally {
    loading.value = false;
  }
});

const rows = computed(() => {
  if (!clan.value) return [];
  const result: any[] = [];
  if (clan.value.leader) result.push({ ...clan.value.leader, role: 'leader' });
  for (const c of clan.value.officer ?? []) result.push({ ...c, role: 'officer' });
  for (const c of clan.value.member  ?? []) result.push({ ...c, role: 'member'  });
  return result;
});

function roleLabel(r: string) {
  if (r === 'leader')  return 'Líder';
  if (r === 'officer') return 'Oficial';
  return 'Miembro';
}

function statusIcon(s: string) {
  if (s === 'claimed')   return 'fas fa-link';
  if (s === 'pending')   return 'fas fa-hourglass-half';
  return 'fas fa-unlink';
}

const navItems = ['rol', 'nombre', 'clase', 'resonancia', 'estado'];
</script>

<template>
  <div class="clan-detail">
    <div class="detail-header">
      <button class="btn-back" @click="router.push('/management/clans')">
        <i class="fas fa-arrow-left"></i>
        <span>Volver</span>
      </button>
      <h2 v-if="clan">{{ clan.name }}</h2>
    </div>

    <div v-if="loading" class="skeleton-table-container">
      <div class="skeleton-table-row" v-for="n in 6" :key="n">
        <div class="skeleton-box skeleton-cell" v-for="m in 5" :key="m"></div>
      </div>
    </div>

    <TableComponent v-else-if="rows.length" :navItems="navItems">
      <div class="list-container" v-for="row in rows" :key="row._id">
        <span><span :class="['role-badge', row.role]">{{ roleLabel(row.role) }}</span></span>
        <span><p>{{ row.name }}</p></span>
        <span><ClassIcon :value="row.currentClass" /></span>
        <span><p>{{ row.resonance ?? '—' }}</p></span>
        <span><i :class="statusIcon(row.status)" :title="row.status"></i></span>
      </div>
    </TableComponent>

    <p v-else class="empty">Sin miembros registrados.</p>
  </div>
</template>

<style scoped lang="scss">
.clan-detail {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #fff;
  }
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.55);
  border-radius: 6px;
  padding: .3rem .7rem;
  font-size: .8rem;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;

  &:hover {
    background: rgba(255,255,255,.07);
    color: rgba(255,255,255,.9);
    border-color: rgba(255,255,255,.25);
  }
}

.list-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  padding: .45rem 0;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;

  span {
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    p { margin: 0; font-size: .85rem; color: rgba(255,255,255,.75); }
    i { font-size: .85rem; color: rgba(255,255,255,.4); }
  }
}

.role-badge {
  font-size: .7rem;
  padding: .15rem .55rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;

  &.leader  { background: rgba(227,210,168,.15); color: rgb(227,210,168); border: 1px solid rgba(227,210,168,.3); }
  &.officer { background: rgba(147,197,253,.1);  color: #93c5fd;          border: 1px solid rgba(147,197,253,.25); }
  &.member  { background: rgba(255,255,255,.06); color: rgba(255,255,255,.5); border: 1px solid rgba(255,255,255,.1); }
}

.skeleton-table-container {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.skeleton-table-row {
  display: flex;
  gap: .5rem;
}

.skeleton-box {
  border-radius: 6px;
  background: rgba(255,255,255,.06);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-cell { flex: 1; height: 38px; }

.empty {
  font-size: .85rem;
  color: rgba(255,255,255,.3);
  margin: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}
</style>
