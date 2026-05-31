<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getClanById,
  getClanDetailMembersPage,
} from '../../../middlewares/services';
import {
  updateAdminCharacter,
  getUsers,
  updateUser,
} from '../../../middlewares/services';
import TableComponent from '../../components/Tables/TableComponent.vue';
import ClassIcon from '../../components/ClassIcon.vue';
import CustomModal from '../../components/Modals/CustomModal.vue';
import { classes } from '../../../middlewares/misc/const';

const route  = useRoute();
const router = useRouter();
const clanId = route.params.id as string;

// ── Clan meta ──
const clan        = ref<any>(null);
const clanLoading = ref(true);

// ── Members (paginated) ──
const members        = ref<any[]>([]);
const membersLoading = ref(false);
const membersPage    = ref(1);
const membersHasMore = ref(false);
const membersTotal   = ref(0);
const searchQuery    = ref('');
const sentinel       = ref<HTMLElement | null>(null);

let scrollObserver: IntersectionObserver | null = null;
let searchDebounce:  ReturnType<typeof setTimeout> | null = null;

function scrollParent(el: HTMLElement | null): HTMLElement | null {
  let p = el?.parentElement;
  while (p && p !== document.documentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) return p;
    p = p.parentElement;
  }
  return null;
}

onMounted(async () => {
  try { clan.value = await getClanById(clanId); } finally { clanLoading.value = false; }
  await loadMembers(true);
  const root = scrollParent(sentinel.value);
  scrollObserver = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && membersHasMore.value && !membersLoading.value) loadMembers(false);
  }, { root, threshold: 0, rootMargin: '200px' });
  if (sentinel.value) scrollObserver.observe(sentinel.value);
});
onUnmounted(() => scrollObserver?.disconnect());
watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => loadMembers(true), 500);
});

async function loadMembers(reset: boolean) {
  if (membersLoading.value) return;
  if (reset) { membersPage.value = 1; members.value = []; membersHasMore.value = false; }
  membersLoading.value = true;
  try {
    const res = await getClanDetailMembersPage(clanId, {
      page: membersPage.value, limit: 20,
      q: searchQuery.value || undefined,
    });
    members.value        = reset ? res.members : [...members.value, ...res.members];
    membersTotal.value   = res.total;
    membersHasMore.value = res.hasMore;
    if (res.hasMore) membersPage.value++;
  } finally { membersLoading.value = false; }
}

// ── Inline edit ──
const editingId    = ref<string | null>(null);
const editClass    = ref('');
const editRes      = ref<number | ''>('');
const editStatus   = ref('');
const editSaving   = ref(false);

function startEdit(row: any) {
  editingId.value  = row._id;
  editClass.value  = row.currentClass ?? '';
  editRes.value    = row.resonance ?? '';
  editStatus.value = row.memberStatus ?? 'activo';
}

function cancelEdit() { editingId.value = null; }

async function saveEdit(row: any) {
  editSaving.value = true;
  try {
    await updateAdminCharacter({
      _id:          row._id,
      currentClass: editClass.value  || undefined,
      resonance:    editRes.value !== '' ? Number(editRes.value) : undefined,
      memberStatus: editStatus.value || undefined,
    });
    row.currentClass = editClass.value  || undefined;
    row.resonance    = editRes.value !== '' ? Number(editRes.value) : undefined;
    row.memberStatus = editStatus.value;
    editingId.value  = null;
  } finally { editSaving.value = false; }
}

// ── Vincular (link to user) ──
const linkTarget  = ref<any>(null);
const allUsers    = ref<any[]>([]);
const userSearch  = ref('');
const linkSaving  = ref(false);
const linkError   = ref('');

async function openLink(row: any) {
  linkTarget.value = row;
  userSearch.value = '';
  linkError.value  = '';
  if (!allUsers.value.length) allUsers.value = await getUsers();
}

const filteredUsers = () => {
  const q = userSearch.value.toLowerCase().trim();
  return q ? allUsers.value.filter((u: any) => u.battletag?.toLowerCase().includes(q)) : allUsers.value.slice(0, 10);
};

async function confirmLink(user: any) {
  if (!linkTarget.value) return;
  linkSaving.value = true;
  linkError.value  = '';
  try {
    const charId = linkTarget.value._id;
    const chars  = [...(user.character ?? []).map(String), charId];
    await Promise.all([
      updateAdminCharacter({ _id: charId, status: 'claimed' }),
      updateUser(user._id, { character: chars, ...(user.role === 'walker' ? { role: 'user' } : {}) }),
    ]);
    linkTarget.value.status = 'claimed';
    linkTarget.value = null;
    await loadMembers(true);
  } catch { linkError.value = 'Error al vincular.'; }
  finally { linkSaving.value = false; }
}

// ── Helpers ──
function roleLabel(r: string) {
  return r === 'leader' ? 'Líder' : r === 'officer' ? 'Oficial' : 'Miembro';
}
function statusIcon(s: string) {
  return s === 'claimed' ? 'fas fa-link' : s === 'pending' ? 'fas fa-hourglass-half' : 'fas fa-unlink';
}
const navItems = ['estado', 'nombre', 'rol', 'clase', 'resonancia', 'acciones'];
</script>

<template>
  <div class="clan-detail">

    <!-- Header -->
    <div class="detail-header">
      <button class="btn-back" @click="router.push('/management/clans')">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      <h2 v-if="clan">{{ clan.name }}</h2>
    </div>

    <!-- Search bar -->
    <div class="search-bar">
      <div class="search-wrap">
        <i class="fas fa-magnifying-glass search-icon"></i>
        <input v-model="searchQuery" class="search-input" placeholder="Buscar por nombre..." />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <span v-if="membersTotal > 0" class="members-count">
        <i class="fas fa-users"></i> {{ membersTotal }}
      </span>
    </div>

    <!-- Initial skeleton -->
    <div v-if="clanLoading && !members.length" class="skeleton-table-container">
      <div class="skeleton-table-row" v-for="n in 6" :key="n">
        <div class="skeleton-box skeleton-cell" v-for="m in 6" :key="m"></div>
      </div>
    </div>

    <!-- Table -->
    <TableComponent v-else-if="members.length || membersLoading" :navItems="navItems">

      <!-- Member rows -->
      <template v-for="row in members" :key="row._id">

        <!-- Edit mode -->
        <div class="list-container" v-if="editingId === row._id">
          <span><i :class="statusIcon(row.status)" class="status-icon"></i></span>
          <span><p>{{ row.name }}</p></span>
          <span><span :class="['role-badge', row.role]">{{ roleLabel(row.role) }}</span></span>
          <span>
            <select v-model="editClass" class="edit-select">
              <option value="">—</option>
              <option v-for="c in classes" :key="c.value" :value="c.value">{{ c.name }}</option>
            </select>
          </span>
          <span><input type="number" v-model.number="editRes" class="edit-input" placeholder="Res." /></span>
          <span>
            <div class="buttons-container">
              <button class="icon-button icon-button--confirm" :disabled="editSaving" @click="saveEdit(row)" title="Guardar"><i class="fas fa-check"></i></button>
              <button class="icon-button" @click="cancelEdit" title="Cancelar"><i class="fas fa-times"></i></button>
            </div>
          </span>
        </div>

        <!-- Normal mode -->
        <div class="list-container" v-else>
          <span><i :class="statusIcon(row.status)" class="status-icon" :title="row.status"></i></span>
          <span><p>{{ row.name }}</p></span>
          <span><span :class="['role-badge', row.role]">{{ roleLabel(row.role) }}</span></span>
          <span><ClassIcon :value="row.currentClass" /></span>
          <span><p>{{ row.resonance ?? '—' }}</p></span>
          <span>
            <div class="buttons-container">
              <button class="icon-button" @click="startEdit(row)" title="Editar"><i class="fas fa-pen"></i></button>
              <button
                v-if="row.status !== 'claimed'"
                class="icon-button icon-button--link"
                @click="openLink(row)"
                title="Vincular a usuario"
              ><i class="fas fa-link"></i></button>
            </div>
          </span>
        </div>
      </template>

      <!-- Skeleton rows while loading more -->
      <div v-if="membersLoading" v-for="n in 5" :key="'sk' + n" class="skeleton-member-row">
        <div v-for="c in 6" :key="c" class="skeleton-box skeleton-cell"></div>
      </div>

    </TableComponent>

    <p v-else-if="!membersLoading" class="empty">
      {{ searchQuery ? `Sin resultados para "${searchQuery}".` : 'Sin miembros registrados.' }}
    </p>

    <div ref="sentinel" class="sentinel"></div>
  </div>

  <!-- Vincular modal -->
  <CustomModal v-if="linkTarget" title="Vincular personaje a usuario" @close="linkTarget = null">
    <div class="link-body">
      <p class="link-char">Personaje: <strong>{{ linkTarget?.name }}</strong></p>
      <input v-model="userSearch" class="link-search" placeholder="Buscar usuario por battletag..." />
      <ul class="user-list">
        <li
          v-for="u in filteredUsers()"
          :key="u._id"
          class="user-row"
          :class="{ saving: linkSaving }"
          @click="!linkSaving && confirmLink(u)"
        >
          <span class="user-tag">{{ u.battletag }}</span>
          <span class="user-role">{{ u.role }}</span>
        </li>
      </ul>
      <p v-if="linkError" class="link-error">{{ linkError }}</p>
    </div>
  </CustomModal>
</template>

<style scoped lang="scss">
.clan-detail {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;

  h2 { margin: 0; font-size: 1.2rem; color: #fff; }
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
  &:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); border-color: rgba(255,255,255,.25); }
}

// ── Search ──
.search-bar {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 360px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: .65rem;
  font-size: .75rem;
  color: rgba(255,255,255,.3);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 30px;
  padding: 0 2rem 0 2rem;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 6px;
  color: rgba(255,255,255,.85);
  font-size: .82rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: rgba(227,210,168,.35); }
  &::placeholder { color: rgba(255,255,255,.25); }
}

.search-clear {
  position: absolute;
  right: .5rem;
  background: transparent;
  border: none;
  color: rgba(255,255,255,.35);
  cursor: pointer;
  font-size: .75rem;
  display: flex;
  align-items: center;
  padding: 0;
  &:hover { color: rgba(255,255,255,.7); }
}

.members-count {
  font-size: .75rem;
  color: rgba(255,255,255,.35);
  display: flex;
  align-items: center;
  gap: .35rem;
  white-space: nowrap;
}

// ── Table rows ──
.list-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: center;
  padding: .45rem 0;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  transition: background .15s;

  &:hover { background: rgba(255,255,255,.05); }

  span {
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    padding-inline: .5rem;
    align-items: center;
    p { margin: 0; font-size: .85rem; color: rgba(255,255,255,.75); }
  }
}

.status-icon { font-size: .85rem; color: rgba(255,255,255,.4); }

.role-badge {
  font-size: .68rem;
  padding: .15rem .5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  &.leader  { background: rgba(227,210,168,.15); color: rgb(227,210,168);   border: 1px solid rgba(227,210,168,.3); }
  &.officer { background: rgba(147,197,253,.1);  color: #93c5fd;            border: 1px solid rgba(147,197,253,.25); }
  &.member  { background: rgba(255,255,255,.06); color: rgba(255,255,255,.5); border: 1px solid rgba(255,255,255,.1); }
}

// ── Edit inputs ──
.edit-select,
.edit-input {
  height: 26px;
  max-width: 90%;
  padding: 0 .45rem;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 5px;
  color: rgba(255,255,255,.85);
  font-size: .78rem;
}

// ── Action buttons ──
.buttons-container {
  display: flex;
  gap: .35rem;
  align-items: center;
}

.icon-button {
  width: 28px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 5px;
  color: rgba(255,255,255,.45);
  cursor: pointer;
  font-size: .75rem;
  transition: background .15s, color .15s, border-color .15s;

  &:hover:not(:disabled) { background: rgba(255,255,255,.07); color: rgba(255,255,255,.85); border-color: rgba(255,255,255,.25); }
  &:disabled { opacity: .4; cursor: not-allowed; }

  &--confirm { color: #4ade80; border-color: rgba(74,222,128,.25);
    &:hover:not(:disabled) { color: #4ade80; background: rgba(74,222,128,.07); border-color: rgba(74,222,128,.45); } }

  &--link { color: rgba(147,197,253,.7); border-color: rgba(147,197,253,.2);
    &:hover:not(:disabled) { color: #93c5fd; background: rgba(147,197,253,.07); border-color: rgba(147,197,253,.4); } }
}

// ── Skeletons ──
.skeleton-member-row {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: center;
  gap: .75rem;
  padding: .6rem 1rem;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
}

.skeleton-table-container { display: flex; flex-direction: column; gap: .4rem; }
.skeleton-table-row { display: flex; gap: .5rem; }
.skeleton-box { border-radius: 6px; background: rgba(255,255,255,.06); animation: pulse 1.5s ease-in-out infinite; }
.skeleton-cell { flex: 1; height: 36px; }

.sentinel { height: 1px; }
.empty { font-size: .85rem; color: rgba(255,255,255,.3); margin: 0; }

// ── Vincular modal ──
.link-body {
  display: flex;
  flex-direction: column;
  gap: .8rem;
  min-width: 300px;
}

.link-char {
  margin: 0;
  font-size: .82rem;
  color: rgba(255,255,255,.5);
  strong { color: rgba(255,255,255,.85); }
}

.link-search {
  width: 100%;
  height: 30px;
  padding: 0 .75rem;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 6px;
  color: rgba(255,255,255,.85);
  font-size: .82rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: rgba(227,210,168,.35); }
  &::placeholder { color: rgba(255,255,255,.25); }
}

.user-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: .3rem;
  max-height: 240px; overflow-y: auto;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .45rem .7rem;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 7px;
  cursor: pointer;
  transition: background .15s, border-color .15s;
  &:hover:not(.saving) { background: rgba(255,255,255,.07); border-color: rgba(227,210,168,.2); }
  &.saving { cursor: wait; opacity: .6; }
}

.user-tag { font-size: .86rem; color: rgba(255,255,255,.85); }
.user-role { font-size: .72rem; color: rgba(255,255,255,.3); font-style: italic; }
.link-error { margin: 0; font-size: .82rem; color: #e57373; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}
</style>
