<style scoped lang="scss" src="./NavMobileComponent.scss" />
<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../../middlewares/store';

const store = useStore();
const isSuperAdmin = computed(() => store.currentUser.userData?.role === 'super_admin');
</script>

<template>
  <div class="nav-container">
    <nav>
      <section class="router-section">

        <router-link title="Overview" to="/" class="nav-item">
          <i class="fas fa-chart-line"></i>
          <small>Overview</small>
        </router-link>

        <router-link v-if="isSuperAdmin" title="Gestión" to="/management" class="nav-item">
          <span class="icon-wrap">
            <i class="fas fa-shield-halved"></i>
          </span>
          <small>Gestión</small>
        </router-link>

      </section>
    </nav>
  </div>
</template>
