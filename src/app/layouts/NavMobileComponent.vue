<style scoped lang="scss" src="./NavMobileComponent.scss" />
<script setup lang="ts">
import { useStore } from '../../middlewares/store';

const store = useStore();
</script>

<template>
  <div class="nav-container">
    <nav>
      <section class="router-section">

        <router-link title="Overview" to="/" class="nav-item">
          <i class="fas fa-chart-line"></i>
          <small>Overview</small>
        </router-link>

        <router-link title="Gestión" to="/management" class="nav-item">
          <span class="icon-wrap">
            <i class="fas fa-shield-halved"></i>
            <span v-if="store.pendingClanRequestsCount > 0" class="notif-badge">
              {{ store.pendingClanRequestsCount }}
            </span>
          </span>
          <small>Gestión</small>
        </router-link>

      </section>
    </nav>
  </div>
</template>
