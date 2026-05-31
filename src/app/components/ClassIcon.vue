<script setup lang="ts">
import { computed } from 'vue';
import { classes } from '../../middlewares/misc/const';

const props = defineProps<{ value?: string | null }>();

const cls = computed(() => classes.find(c => c.value === props.value));
</script>

<template>
  <img v-if="cls" :src="cls.image" :alt="cls.name" :title="cls.name" width="28" />
  <span v-else>—</span>
</template>
