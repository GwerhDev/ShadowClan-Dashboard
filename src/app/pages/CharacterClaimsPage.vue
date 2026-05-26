<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from '../../middlewares/store';
import AppLayout from '../layouts/AppLayout.vue';

const store: any = useStore();

const claims = ref<any[]>([]);
const loading = ref(true);
const selected = ref<any>(null);
const processingId = ref<string | null>(null);
const actionError = ref('');
const showDetail = ref(false);

onMounted(async () => {
  claims.value = await store.handleGetCharacterClaims() ?? [];
  loading.value = false;
});

function selectItem(claim: any) {
  selected.value = claim;
  actionError.value = '';
  showDetail.value = true;
}

function backToList() {
  showDetail.value = false;
}

async function review(id: string, action: 'accept' | 'reject') {
  processingId.value = id;
  actionError.value = '';
  try {
    await store.handleReviewCharacterClaim(id, action);
    claims.value = claims.value.filter((c: any) => c._id !== id);
    if (store.pendingClaimsCount > 0) store.pendingClaimsCount--;
    selected.value = null;
    showDetail.value = false;
  } catch (e: any) {
    actionError.value = e?.response?.data?.message ?? 'Error al procesar la solicitud.';
  } finally {
    processingId.value = null;
  }
}

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
              <h4 class="req-sidebar-label">gestión de personajes</h4>
              <h2 class="req-sidebar-title">Vinculaciones</h2>
            </div>

            <div v-if="loading" class="req-empty">Cargando...</div>

            <div v-else-if="!claims.length" class="req-empty">
              <i class="fas fa-inbox"></i>
              <p>Sin vinculaciones pendientes.</p>
            </div>

            <ul v-else class="req-list">
              <li
                v-for="claim in claims"
                :key="claim._id"
                class="req-item"
                :class="{ active: selected?._id === claim._id }"
                @click="selectItem(claim)"
              >
                <div class="req-item-icon-wrap">
                  <i class="fas fa-link"></i>
                </div>
                <div class="req-item-body">
                  <span class="req-item-title">{{ claim.character?.name ?? '—' }}</span>
                  <span class="req-item-sub">{{ claim.user?.battletag ?? '—' }}</span>
                </div>
                <span class="req-item-date">{{ formatDate(claim.createdAt) }}</span>
              </li>
            </ul>
          </aside>

          <div class="req-detail">
            <button class="req-back-btn" @click="backToList">
              <i class="fas fa-arrow-left"></i> Volver
            </button>

            <div v-if="!selected" class="req-detail-empty">
              <i class="fas fa-scroll"></i>
              <p>Selecciona una vinculación para ver el detalle.</p>
            </div>

            <div v-else class="req-detail-content">
              <div class="req-detail-header">
                <div class="req-detail-type claim">
                  <i class="fas fa-link"></i>
                  <span>Solicitud de vinculación</span>
                </div>
                <span class="req-detail-date">{{ formatDate(selected.createdAt) }}</span>
              </div>

              <div class="req-detail-clan">
                <i class="fas fa-user req-clan-icon"></i>
                <div>
                  <h2 class="req-clan-name">{{ selected.character?.name ?? '—' }}</h2>
                  <p class="req-clan-sub">solicitado por {{ selected.user?.battletag ?? '—' }}</p>
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
                  <i class="fas fa-check"></i> Aprobar
                </button>
                <button class="req-btn reject" :disabled="processingId === selected._id" @click="review(selected._id, 'reject')">
                  <i class="fas fa-times"></i> Rechazar
                </button>
              </div>
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
  border-left: 1px solid $border;
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
  margin: 0;
  color: var(--color-app-white);
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

  &.claim {
    background: $gold-dim;
    border: 1px solid rgba(227, 210, 168, .25);
    color: rgba(227, 210, 168, .85);
  }
}

.req-detail-date {
  font-size: .75rem;
  color: rgba(255, 255, 255, .3);
}

.req-detail-clan {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, .03);
  border: 1px solid $gold-dim;
  border-radius: 10px;
}

.req-clan-icon {
  font-size: 1.8rem;
  color: $gold;
  flex-shrink: 0;
}

.req-clan-name {
  margin: 0;
  font-size: 1.3rem;
  font-family: 'Cinzel', serif;
  color: var(--color-app-white);
}

.req-clan-sub {
  margin: .25rem 0 0;
  font-size: .82rem;
  color: rgba(255, 255, 255, .45);
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

  .req-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
