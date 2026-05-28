<style scoped lang="scss" src="./NavComponent.scss" />
<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../../middlewares/store';
import { CLIENT_URL } from '../../middlewares/misc/const';
import { useRouter, useRoute } from 'vue-router';
import LogoComponent from './LogoComponent.vue';

const store = useStore();
const router = useRouter();
const route = useRoute();

const isRequestsActive = computed(() => route.path === '/requests');

function goToRequests() {
  router.push('/requests');
}
</script>

<template>
  <div class="nav-container">
    <nav>
      <section class="logo-section">
        <LogoComponent />
      </section>
      <div class="nav-sections">
        <section class="router-section">
          <router-link title="Overview" to="/" class="nav-item">
            <i class="fas fa-chart-line"></i>
            <small>Overview</small>
          </router-link>
          <router-link title="Gestión" to="/management" class="nav-item">
            <div class="nav-icon-wrap">
              <i class="fas fa-shield-halved"></i>
              <span v-if="store.pendingClanRequestsCount > 0" class="notif-badge">{{ store.pendingClanRequestsCount }}</span>
            </div>
            <small>Gestión</small>
          </router-link>
        </section>

        <section class="user-section">
          <div class="bell-wrapper">
            <button class="bell-btn" :class="{ 'user-active': isRequestsActive }" @click="goToRequests" title="Solicitudes">
              <i class="fas fa-bell"></i>
              <span v-if="store.pendingRequestsTotal > 0" class="notif-badge">{{ store.pendingRequestsTotal }}</span>
            </button>
          </div>

          <a :href="CLIENT_URL" title="Ir a la aplicación">
            <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
        </section>
      </div>
    </nav>
  </div>
</template>
