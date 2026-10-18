<style scoped lang="scss" src="./AppLayout.scss" />
<script setup lang="ts">
import SideBar from './SideBar.vue';
import TabBar from './TabBar.vue';
import diabloIcon from '../../assets/png/shadowclan-icon.png';
import NavComponent from './NavComponent.vue';
import NavMobileComponent from './NavMobileComponent.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

defineProps({
  loading: {
    type: Boolean,
    required: false,
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
  tabs: Array as () => Array<{
    id: string;
    name: string;
    icon: string;
    length?: number;
    path: string;
    badge?: number;
  }>,
});

const dynamicTitle = computed(() => route.meta.title as string | undefined);
</script>

<template>
  <div class="container-lo-page">
    <div class="lo-container">
      <section>
        <NavComponent />
      </section>
      <div class="section-container">
        <section class="menu-section desktop" v-if="tabs && tabs.length">
          <div class="sidebar-icon-wrap">
            <img :src="diabloIcon" alt="icon" />
          </div>
          <SideBar :tabs="tabs" />
        </section>

        <section class="content-section">
          <section class="menu-section mobile" v-if="tabs && tabs.length">
            <TabBar :tabs="tabs" />
          </section>
          <div class="scrollable-content">
            <div class="header-section" v-if="!hideTitle">
              <span class="title-section">
                <img :src="diabloIcon" alt="icon" />
                <h1>{{ dynamicTitle }}</h1>
              </span>
            </div>
            <slot></slot>
          </div>
        </section>
      </div>
    </div>
    <!-- Fuera de .lo-container: su backdrop-filter convertiría el position:fixed en relativo a él. -->
    <NavMobileComponent />
  </div>
</template>
