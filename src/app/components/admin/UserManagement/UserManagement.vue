<style scoped lang="scss" src="./UserManagement.scss"/>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import TableComponent from '../../Tables/TableComponent.vue';
import UserListCard from './UserListCard.vue';
import { getUsersPage } from '../../../../middlewares/services';

const users       = ref<any[]>([]);
const loading     = ref(false);
const page        = ref(1);
const hasMore     = ref(false);
const total       = ref(0);
const searchQuery = ref('');
const sentinel    = ref<HTMLElement | null>(null);

let scrollObserver: IntersectionObserver | null = null;
let searchDebounce: ReturnType<typeof setTimeout> | null = null;

function scrollParent(el: HTMLElement | null): HTMLElement | null {
  let p = el?.parentElement;
  while (p && p !== document.documentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) return p;
    p = p.parentElement;
  }
  return null;
}

onMounted(async () => {
  await load(true);
  const root = scrollParent(sentinel.value);
  scrollObserver = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && hasMore.value && !loading.value) load(false);
  }, { root, threshold: 0, rootMargin: '200px' });
  if (sentinel.value) scrollObserver.observe(sentinel.value);
});

onUnmounted(() => scrollObserver?.disconnect());

watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => load(true), 500);
});

async function load(reset: boolean) {
  if (loading.value) return;
  if (reset) { page.value = 1; users.value = []; hasMore.value = false; }
  loading.value = true;
  try {
    const res = await getUsersPage({ page: page.value, limit: 20, q: searchQuery.value || undefined });
    users.value = reset ? res.data : [...users.value, ...res.data];
    total.value = res.total;
    hasMore.value = res.hasMore;
    if (res.hasMore) page.value++;
  } finally { loading.value = false; }
}

const navItems = ['estado', 'battletag', 'rol', 'personajes', 'acciones'];
</script>

<template>
  <div class="ul-container">
    <div class="search-bar">
      <div class="search-wrap">
        <i class="fas fa-magnifying-glass search-icon"></i>
        <input v-model="searchQuery" class="search-input" placeholder="Buscar por battletag..." />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <span v-if="total > 0" class="total-count">
        <i class="fas fa-users"></i> {{ total }}
      </span>
    </div>

    <TableComponent v-if="users.length || loading" :navItems="navItems">
      <UserListCard v-for="user in users" :key="user._id" :user="user" @refresh="load(true)" />
      <div v-if="loading" v-for="n in 5" :key="'sk'+n" class="skeleton-row">
        <div class="skeleton-box skeleton-cell" v-for="c in 5" :key="c"></div>
      </div>
    </TableComponent>

    <p v-else-if="!loading && searchQuery" class="empty">Sin resultados para "{{ searchQuery }}".</p>
    <p v-else-if="!loading" class="empty">No hay usuarios disponibles.</p>

    <div ref="sentinel" class="sentinel"></div>
  </div>
</template>

<style scoped lang="scss">
.search-bar {
  display: flex; align-items: center; gap: .75rem;
  padding: .25rem 0 .75rem;
}
.search-wrap {
  position: relative; flex: 1; max-width: 360px;
  display: flex; align-items: center;
}
.search-icon {
  position: absolute; left: .65rem; font-size: .75rem;
  color: rgba(255,255,255,.3); pointer-events: none;
}
.search-input {
  width: 100%; height: 30px; padding: 0 2rem 0 2rem;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12);
  border-radius: 6px; color: rgba(255,255,255,.85); font-size: .82rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: rgba(227,210,168,.35); }
  &::placeholder { color: rgba(255,255,255,.25); }
}
.search-clear {
  position: absolute; right: .5rem; background: transparent; border: none;
  color: rgba(255,255,255,.35); cursor: pointer; font-size: .75rem;
  display: flex; align-items: center; padding: 0;
  &:hover { color: rgba(255,255,255,.7); }
}
.total-count {
  font-size: .75rem; color: rgba(255,255,255,.35);
  display: flex; align-items: center; gap: .35rem; white-space: nowrap;
}
.skeleton-row {
  width: 100%; display: grid; grid-template-columns: repeat(5, 1fr);
  gap: .75rem; padding: .6rem 1rem;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 8px;
}
.skeleton-box {
  border-radius: 6px; background: rgba(255,255,255,.08);
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-cell { height: 28px; }
.sentinel { height: 1px; }
.empty { font-size: .82rem; color: rgba(255,255,255,.3); padding: .5rem 0; }
@keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:.9; } }
</style>
