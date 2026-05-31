<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from '../../middlewares/store';
import AppLayout from '../layouts/AppLayout.vue';

const store: any = useStore();

type ViewType = 'users' | 'characters' | 'clans';
const view = ref<ViewType>('users');

const userActivations = ref<any[]>([]);
const characterRequests = ref<any[]>([]);
const clanCreationRequests = ref<any[]>([]);
const clanClaimRequests    = ref<any[]>([]);
const loading = ref(true);
const selected = ref<any>(null);
const processingId = ref<string | null>(null);
const actionError = ref('');
const showDetail = ref(false);

onMounted(async () => {
  const [users, claims, creations, clanCreations, clanClaims] = await Promise.all([
    store.handleGetPendingUserActivations().catch(() => []),
    store.handleGetCharacterClaims().catch(() => []),
    store.handleGetCharacterCreationRequests().catch(() => []),
    store.handleGetClanCreationRequests().catch(() => []),
    store.handleGetClanClaimRequests().catch(() => []),
  ]);
  userActivations.value = users ?? [];
  characterRequests.value = [
    ...(claims ?? []).map((c: any) => ({ ...c, _requestType: 'claim' })),
    ...(creations ?? []).map((c: any) => ({ ...c, _requestType: 'creation' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  clanCreationRequests.value = clanCreations ?? [];
  clanClaimRequests.value    = clanClaims    ?? [];
  loading.value = false;
});

// Merge clan creation + clan claim requests in the "clans" tab
const allClanRequests = computed(() => [
  ...(clanCreationRequests.value.map((r: any) => ({ ...r, _clanReqType: 'creation' }))),
  ...(clanClaimRequests.value.map((r: any) => ({ ...r, _clanReqType: 'claim' }))),
].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

const activeList = computed(() => {
  if (view.value === 'users') return userActivations.value;
  if (view.value === 'clans') return allClanRequests.value;
  return characterRequests.value;
});

const usersPendingCount      = computed(() => userActivations.value.length);
const charactersPendingCount = computed(() => characterRequests.value.length);
const clansPendingCount      = computed(() => allClanRequests.value.length);

function switchView(v: ViewType) {
  view.value = v;
  selected.value = null;
  actionError.value = '';
  showDetail.value = false;
}

function selectItem(item: any) {
  selected.value = item;
  actionError.value = '';
  showDetail.value = true;
}

function backToList() {
  showDetail.value = false;
}

async function review(id: string, action: string) {
  processingId.value = id;
  actionError.value = '';
  try {
    if (view.value === 'users') {
      await store.handleReviewUserActivation(id, action as 'activate' | 'reject');
      userActivations.value = userActivations.value.filter((u: any) => u._id !== id);
      if (store.pendingUsersCount > 0) store.pendingUsersCount--;
    } else if (view.value === 'clans') {
      if (selected.value?._clanReqType === 'claim') {
        await store.handleReviewClanClaimRequest(id, action as 'accept' | 'reject');
        clanClaimRequests.value = clanClaimRequests.value.filter((r: any) => r._id !== id);
        if (store.pendingClanClaimsCount > 0) store.pendingClanClaimsCount--;
      } else {
        await store.handleReviewClanCreationRequest(id, action as 'accept' | 'reject');
        clanCreationRequests.value = clanCreationRequests.value.filter((r: any) => r._id !== id);
        if (store.pendingClanCreationsCount > 0) store.pendingClanCreationsCount--;
      }
    } else {
      const type = selected.value?._requestType;
      if (type === 'claim') {
        await store.handleReviewCharacterClaim(id, action as 'accept' | 'reject');
        if (store.pendingClaimsCount > 0) store.pendingClaimsCount--;
      } else {
        await store.handleReviewCharacterCreationRequest(id, action as 'accept' | 'reject');
        if (store.pendingCreationsCount > 0) store.pendingCreationsCount--;
      }
      characterRequests.value = characterRequests.value.filter((r: any) => r._id !== id);
    }
    selected.value = null;
    showDetail.value = false;
  } catch (e: any) {
    actionError.value = e?.response?.data?.message ?? 'Error al procesar la solicitud.';
  } finally {
    processingId.value = null;
  }
}

watch(() => store.lastIncomingRequest, (payload) => {
  if (!payload) return;
  if (payload.type === 'user-activation') {
    userActivations.value.unshift({
      _id: payload.id,
      battletag: payload.user?.battletag,
      role: 'user',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } else if (payload.type === 'character-claim') {
    characterRequests.value.unshift({
      _id: payload.id,
      _requestType: 'claim',
      user: payload.user,
      character: payload.character,
      createdAt: new Date().toISOString(),
    });
  } else if (payload.type === 'character-creation') {
    characterRequests.value.unshift({
      _id: payload.id,
      _requestType: 'creation',
      user: payload.user,
      name: payload.character?.name,
      currentClass: payload.character?.currentClass,
      resonance: payload.character?.resonance,
      createdAt: new Date().toISOString(),
    });
  } else if (payload.type === 'clan-creation') {
    clanCreationRequests.value.unshift({
      _id: payload.id, clanName: payload.clanName,
      user: { battletag: payload.user }, createdAt: new Date().toISOString(),
    });
  } else if (payload.type === 'clan-claim') {
    clanClaimRequests.value.unshift({
      _id: payload.id, clanName: payload.clanName, requestedRole: payload.requestedRole,
      user: { battletag: payload.user }, createdAt: new Date().toISOString(),
    });
  }
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
</script>

<template>
  <main class="red-shadow-fx">
    <div class="req-page-container">
      <AppLayout :tabs="[]" :hide-title="true">
        <div class="req-layout" :class="{ 'show-detail': showDetail }">

          <aside class="req-sidebar">
            <div class="req-sidebar-header">
              <h4 class="req-sidebar-label">gestión de la app</h4>
              <h2 class="req-sidebar-title">Solicitudes</h2>
              <div class="req-type-toggle">
                <button :class="{ active: view === 'users' }" @click="switchView('users')">
                  Usuarios
                  <span v-if="usersPendingCount > 0" class="toggle-badge">{{ usersPendingCount }}</span>
                </button>
                <button :class="{ active: view === 'characters' }" @click="switchView('characters')">
                  Personajes
                  <span v-if="charactersPendingCount > 0" class="toggle-badge">{{ charactersPendingCount }}</span>
                </button>
                <button :class="{ active: view === 'clans' }" @click="switchView('clans')">
                  Clanes
                  <span v-if="clansPendingCount > 0" class="toggle-badge">{{ clansPendingCount }}</span>
                </button>
              </div>
            </div>

            <div v-if="loading" class="req-empty">Cargando...</div>

            <div v-else-if="!activeList.length" class="req-empty">
              <i class="fas fa-inbox"></i>
              <p>Sin solicitudes pendientes.</p>
            </div>

            <ul v-else class="req-list">
              <li
                v-for="item in activeList"
                :key="item._id"
                class="req-item"
                :class="{ active: selected?._id === item._id }"
                @click="selectItem(item)"
              >
                <div class="req-item-icon-wrap">
                  <i v-if="view === 'users'" class="fas fa-user-clock"></i>
                  <i v-else-if="view === 'clans' && item._clanReqType === 'claim'" class="fas fa-key"></i>
                  <i v-else-if="view === 'clans'" class="fas fa-shield-halved"></i>
                  <i v-else-if="item._requestType === 'claim'" class="fas fa-link"></i>
                  <i v-else class="fas fa-wand-sparkles"></i>
                </div>
                <div class="req-item-body">
                  <span class="req-item-title">{{ item.user?.battletag ?? item.battletag ?? '—' }}</span>
                  <span class="req-item-sub">
                    <template v-if="view === 'users'">solicita activación de cuenta</template>
                    <template v-else-if="view === 'clans'">solicita crear clan <strong>{{ item.clanName ?? '—' }}</strong></template>
                    <template v-else-if="view === 'clan-claims'">quiere reclamar <strong>{{ item.clanName ?? item.clan?.name ?? '—' }}</strong> como {{ item.requestedRole === 'leader' ? 'Líder' : 'Oficial' }}</template>
                    <template v-else-if="item._requestType === 'claim'">reclama a <strong>{{ item.character?.name ?? '—' }}</strong></template>
                    <template v-else>solicita crear <strong>{{ item.name ?? '—' }}</strong></template>
                  </span>
                </div>
                <span class="req-item-date">{{ formatDate(item.createdAt) }}</span>
              </li>
            </ul>
          </aside>

          <div class="req-detail">
            <button class="req-back-btn" @click="backToList">
              <i class="fas fa-arrow-left"></i> Volver
            </button>

            <div v-if="!selected" class="req-detail-empty">
              <i class="fas fa-scroll"></i>
              <p>Selecciona una solicitud para ver el detalle.</p>
            </div>

            <div v-else class="req-detail-content">
              <div class="req-detail-header">
                <div class="req-detail-type">
                  <i v-if="view === 'users'" class="fas fa-user-clock"></i>
                  <i v-else-if="view === 'clans' && selected._clanReqType === 'claim'" class="fas fa-key"></i>
                  <i v-else-if="view === 'clans'" class="fas fa-shield-halved"></i>
                  <i v-else-if="selected._requestType === 'claim'" class="fas fa-link"></i>
                  <i v-else class="fas fa-wand-sparkles"></i>
                  <span v-if="view === 'users'">Activación de usuario</span>
                  <span v-else-if="view === 'clans' && selected._clanReqType === 'claim'">Reclamar clan</span>
                  <span v-else-if="view === 'clans'">Creación de clan</span>
                  <span v-else-if="selected._requestType === 'claim'">Reclamo de personaje</span>
                  <span v-else>Creación de personaje</span>
                </div>
                <span class="req-detail-date">{{ formatDate(selected.createdAt) }}</span>
              </div>

              <!-- User activation detail -->
              <template v-if="view === 'users'">
                <div class="req-detail-card">
                  <div class="req-detail-player">
                    <i class="fas fa-user"></i>
                    <div>
                      <span class="req-detail-card-label">Jugador</span>
                      <span class="req-detail-card-value">{{ selected.battletag ?? '—' }}</span>
                    </div>
                  </div>
                </div>
                <div class="req-detail-grid">
                  <div class="req-detail-item">
                    <span class="req-detail-label">Rol actual</span>
                    <span class="req-detail-value">{{ selected.role ?? '—' }}</span>
                  </div>
                  <div class="req-detail-item">
                    <span class="req-detail-label">Estado</span>
                    <span class="req-detail-value">{{ selected.status ?? '—' }}</span>
                  </div>
                </div>
                <p v-if="actionError" class="req-error">{{ actionError }}</p>
                <div class="req-detail-actions">
                  <button class="req-btn accept" :disabled="processingId === selected._id" @click="review(selected._id, 'activate')">
                    <i class="fas fa-check"></i> Activar cuenta
                  </button>
                  <button class="req-btn reject" :disabled="processingId === selected._id" @click="review(selected._id, 'reject')">
                    <i class="fas fa-times"></i> Rechazar
                  </button>
                </div>
              </template>

              <!-- Character claim detail -->
              <template v-else-if="selected._requestType === 'claim'">
                <div class="req-detail-card">
                  <div class="req-detail-player">
                    <i class="fas fa-user"></i>
                    <div>
                      <span class="req-detail-card-label">Jugador</span>
                      <span class="req-detail-card-value">{{ selected.user?.battletag ?? '—' }}</span>
                    </div>
                  </div>
                  <div class="req-detail-arrow"><i class="fas fa-arrow-right"></i></div>
                  <div class="req-detail-character">
                    <i class="fas fa-sword"></i>
                    <div>
                      <span class="req-detail-card-label">Personaje</span>
                      <span class="req-detail-card-value">{{ selected.character?.name ?? '—' }}</span>
                    </div>
                  </div>
                </div>
                <div class="req-detail-grid">
                  <div v-if="selected.character?.currentClass" class="req-detail-item">
                    <span class="req-detail-label">Clase</span>
                    <span class="req-detail-value">{{ selected.character.currentClass }}</span>
                  </div>
                  <div v-if="selected.character?.resonance" class="req-detail-item">
                    <span class="req-detail-label">Resonancia</span>
                    <span class="req-detail-value">{{ selected.character.resonance }}</span>
                  </div>
                </div>
                <p v-if="actionError" class="req-error">{{ actionError }}</p>
                <div class="req-detail-actions">
                  <button class="req-btn accept" :disabled="processingId === selected._id" @click="review(selected._id, 'accept')">
                    <i class="fas fa-check"></i> Aprobar vinculación
                  </button>
                  <button class="req-btn reject" :disabled="processingId === selected._id" @click="review(selected._id, 'reject')">
                    <i class="fas fa-times"></i> Rechazar
                  </button>
                </div>
              </template>

              <!-- Clan claim request detail -->
              <template v-else-if="view === 'clan-claims'">
                <div class="req-detail-card">
                  <div class="req-detail-player">
                    <i class="fas fa-user"></i>
                    <div>
                      <span class="req-detail-card-label">Jugador</span>
                      <span class="req-detail-card-value">{{ selected.user?.battletag ?? '—' }}</span>
                    </div>
                  </div>
                  <div class="req-detail-arrow"><i class="fas fa-arrow-right"></i></div>
                  <div class="req-detail-character">
                    <i class="fas fa-shield-halved"></i>
                    <div>
                      <span class="req-detail-card-label">Clan a reclamar</span>
                      <span class="req-detail-card-value">{{ selected.clanName ?? selected.clan?.name ?? '—' }}</span>
                    </div>
                  </div>
                </div>
                <div class="req-detail-grid">
                  <div class="req-detail-item">
                    <span class="req-detail-label">Rol solicitado</span>
                    <span class="req-detail-value">{{ selected.requestedRole === 'leader' ? 'Líder' : 'Oficial' }}</span>
                  </div>
                  <div class="req-detail-item" v-if="selected.character?.name">
                    <span class="req-detail-label">Personaje</span>
                    <span class="req-detail-value">{{ selected.character.name }}</span>
                  </div>
                </div>
                <p v-if="actionError" class="req-error">{{ actionError }}</p>
                <div class="req-detail-actions">
                  <button class="req-btn accept" :disabled="processingId === selected._id" @click="review(selected._id, 'accept')">
                    <i class="fas fa-check"></i> Aprobar
                  </button>
                  <button class="req-btn reject" :disabled="processingId === selected._id" @click="review(selected._id, 'reject')">
                    <i class="fas fa-times"></i> Rechazar
                  </button>
                </div>
              </template>

              <!-- Clan creation request detail -->
              <template v-else-if="view === 'clans'">
                <div class="req-detail-card">
                  <div class="req-detail-player">
                    <i class="fas fa-user"></i>
                    <div>
                      <span class="req-detail-card-label">Jugador</span>
                      <span class="req-detail-card-value">{{ selected.user?.battletag ?? '—' }}</span>
                    </div>
                  </div>
                  <div class="req-detail-arrow"><i class="fas fa-arrow-right"></i></div>
                  <div class="req-detail-character">
                    <i class="fas fa-shield-halved"></i>
                    <div>
                      <span class="req-detail-card-label">Nombre solicitado</span>
                      <span class="req-detail-card-value">{{ selected.clanName ?? '—' }}</span>
                    </div>
                  </div>
                </div>
                <div class="req-detail-grid">
                  <div class="req-detail-item">
                    <span class="req-detail-label">Personaje</span>
                    <span class="req-detail-value">{{ selected.character?.name ?? '—' }}</span>
                  </div>
                </div>
                <p v-if="actionError" class="req-error">{{ actionError }}</p>
                <div class="req-detail-actions">
                  <button class="req-btn accept" :disabled="processingId === selected._id" @click="review(selected._id, 'accept')">
                    <i class="fas fa-check"></i> Crear clan
                  </button>
                  <button class="req-btn reject" :disabled="processingId === selected._id" @click="review(selected._id, 'reject')">
                    <i class="fas fa-times"></i> Rechazar
                  </button>
                </div>
              </template>

              <!-- Character creation request detail -->
              <template v-else>
                <div class="req-detail-card">
                  <div class="req-detail-player">
                    <i class="fas fa-user"></i>
                    <div>
                      <span class="req-detail-card-label">Jugador</span>
                      <span class="req-detail-card-value">{{ selected.user?.battletag ?? '—' }}</span>
                    </div>
                  </div>
                  <div class="req-detail-arrow"><i class="fas fa-arrow-right"></i></div>
                  <div class="req-detail-character">
                    <i class="fas fa-wand-sparkles"></i>
                    <div>
                      <span class="req-detail-card-label">Nuevo personaje</span>
                      <span class="req-detail-card-value">{{ selected.name ?? '—' }}</span>
                    </div>
                  </div>
                </div>
                <div class="req-detail-grid">
                  <div v-if="selected.currentClass" class="req-detail-item">
                    <span class="req-detail-label">Clase</span>
                    <span class="req-detail-value">{{ selected.currentClass }}</span>
                  </div>
                  <div v-if="selected.resonance" class="req-detail-item">
                    <span class="req-detail-label">Resonancia</span>
                    <span class="req-detail-value">{{ selected.resonance }}</span>
                  </div>
                </div>
                <p v-if="actionError" class="req-error">{{ actionError }}</p>
                <div class="req-detail-actions">
                  <button class="req-btn accept" :disabled="processingId === selected._id" @click="review(selected._id, 'accept')">
                    <i class="fas fa-check"></i> Aprobar creación
                  </button>
                  <button class="req-btn reject" :disabled="processingId === selected._id" @click="review(selected._id, 'reject')">
                    <i class="fas fa-times"></i> Rechazar
                  </button>
                </div>
              </template>

            </div>
          </div>

        </div>
      </AppLayout>
    </div>
  </main>
</template>

<style scoped lang="scss">
$gold: rgb(227, 210, 168);
$gold-dim: rgba(227, 210, 168, .12);
$border: rgba(255, 255, 255, .07);

.req-page-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.req-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100%;
  overflow: hidden;
}

.req-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid $border;
  overflow: hidden;
}

.req-sidebar-header {
  padding: 1.5rem 1.25rem 1rem;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
}

.req-sidebar-label {
  font-size: .6rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .3);
  margin: 0 0 .2rem;
}

.req-sidebar-title {
  font-size: 1.1rem;
  margin: 0 0 .85rem;
  color: var(--color-app-white);
}

.req-type-toggle {
  display: flex;
  gap: .35rem;

  button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .4rem;
    padding: .35rem .5rem;
    border-radius: 6px;
    border: 1px solid $border;
    background: transparent;
    color: rgba(255, 255, 255, .4);
    font-size: .72rem;
    cursor: pointer;
    transition: all .15s;

    &:hover { color: rgba(255, 255, 255, .7); border-color: rgba(255, 255, 255, .15); }

    &.active {
      background: $gold-dim;
      border-color: rgba(227, 210, 168, .3);
      color: $gold;
    }
  }
}

.toggle-badge {
  background: rgba(229, 115, 115, .25);
  color: #e57373;
  border-radius: 10px;
  padding: 0 .4rem;
  font-size: .65rem;
  font-weight: 700;
  line-height: 1.6;
}

.req-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, .3);
  font-size: .85rem;
  text-align: center;

  i { font-size: 1.6rem; }
  p { margin: 0; }
}

.req-list {
  list-style: none;
  margin: 0;
  padding: .5rem 0;
  overflow-y: auto;
  flex: 1;
}

.req-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .75rem 1.25rem;
  cursor: pointer;
  transition: background .15s;
  border-left: 3px solid transparent;

  &:hover { background: rgba(255, 255, 255, .03); }

  &.active {
    background: rgba(227, 210, 168, .05);
    border-left-color: $gold;
  }
}

.req-item-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: .85rem;
  background: $gold-dim;
  color: $gold;
}

.req-item-body {
  display: flex;
  flex-direction: column;
  gap: .1rem;
  flex: 1;
  min-width: 0;
}

.req-item-title {
  font-size: .88rem;
  font-weight: 600;
  color: var(--color-app-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.req-item-sub {
  font-size: .72rem;
  color: rgba(255, 255, 255, .4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  strong { color: rgba(255, 255, 255, .65); }
}

.req-item-date {
  font-size: .68rem;
  color: rgba(255, 255, 255, .25);
  flex-shrink: 0;
}

.req-detail {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 2rem;
}

.req-back-btn {
  display: none;
  align-items: center;
  gap: .5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, .45);
  font-size: .82rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;

  &:hover { color: rgba(255, 255, 255, .8); }
}

.req-detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  color: rgba(255, 255, 255, .2);
  font-size: .9rem;
  text-align: center;

  i { font-size: 2.5rem; }
  p { margin: 0; }
}

.req-detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.req-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.req-detail-type {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .7rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  font-family: 'Cinzel', serif;
  padding: .3rem .75rem;
  border-radius: 4px;
  background: $gold-dim;
  border: 1px solid rgba(227, 210, 168, .25);
  color: rgba(227, 210, 168, .85);
}

.req-detail-date {
  font-size: .75rem;
  color: rgba(255, 255, 255, .3);
}

.req-detail-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, .03);
  border: 1px solid $gold-dim;
  border-radius: 10px;
}

.req-detail-player,
.req-detail-character {
  display: flex;
  align-items: center;
  gap: .75rem;
  flex: 1;

  > i {
    font-size: 1.4rem;
    color: $gold;
    flex-shrink: 0;
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: .15rem;
  }
}

.req-detail-arrow {
  color: rgba(255, 255, 255, .2);
  font-size: .9rem;
  flex-shrink: 0;
}

.req-detail-card-label {
  font-size: .6rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .35);
}

.req-detail-card-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-app-white);
  font-family: 'Cinzel', serif;
}

.req-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.req-detail-item {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  padding: .85rem 1rem;
  background: rgba(255, 255, 255, .03);
  border: 1px solid $border;
  border-radius: 8px;
}

.req-detail-label {
  font-size: .65rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, .35);
  font-family: 'Cinzel', serif;
}

.req-detail-value {
  font-size: .95rem;
  color: var(--color-app-white);
}

.req-detail-actions {
  display: flex;
  gap: .75rem;
}

.req-btn {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .55rem 1.25rem;
  border-radius: 6px;
  font-family: 'Cinzel', serif;
  font-size: .78rem;
  letter-spacing: .04em;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background .2s, border-color .2s;

  &:disabled { opacity: .4; cursor: not-allowed; }

  &.accept {
    background: transparent;
    border-color: rgba(129, 199, 132, .4);
    color: #81c784;
    &:hover:not(:disabled) { background: rgba(129, 199, 132, .08); border-color: #81c784; }
  }

  &.reject {
    background: transparent;
    border-color: rgba(229, 115, 115, .4);
    color: #e57373;
    &:hover:not(:disabled) { background: rgba(229, 115, 115, .08); border-color: #e57373; }
  }
}

.req-error {
  margin: 0;
  font-size: .82rem;
  color: #e57373;
  padding: .5rem .75rem;
  background: rgba(229, 115, 115, .08);
  border: 1px solid rgba(229, 115, 115, .3);
  border-radius: 6px;
}

@media (max-width: 1100px) {
  .req-page-container { padding: 0; }

  .req-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;

    .req-detail { display: none; }

    &.show-detail {
      .req-sidebar { display: none; }
      .req-detail {
        display: flex;
        padding: 1.25rem;
      }
      .req-back-btn { display: flex; }
    }
  }

  .req-detail-grid { grid-template-columns: 1fr; }
  .req-detail-card { flex-direction: column; align-items: flex-start; gap: .75rem; }
  .req-detail-arrow { display: none; }
}
</style>
