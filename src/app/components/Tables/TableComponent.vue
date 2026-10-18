<style scoped lang="scss" src="./TableComponent.scss"/>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { vStuck } from '../../directives/stuck';

const props = defineProps<{
  navItems: string[];
}>();

const gridColumns = computed(() => {
  return { gridTemplateColumns: `repeat(${props.navItems.length}, minmax(80px, 1fr))` };
});

const headRef = ref<HTMLElement | null>(null);
function syncHead(e: Event) {
  if (headRef.value) headRef.value.scrollLeft = (e.target as HTMLElement).scrollLeft;
}
</script>

<template>
  <div class="table-component">
    <div ref="headRef" v-stuck class="table-head-scroll">
      <div class="table-container">
        <nav :style="gridColumns">
          <li v-for="(item, index) in navItems" :key="index">{{ item }}</li>
        </nav>
      </div>
    </div>
    <div class="table-scroll-wrapper" @scroll="syncHead">
      <div class="table-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
