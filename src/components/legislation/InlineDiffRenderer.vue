<template>
  <span class="inline-diff" style="white-space: break-spaces">
    <template v-for="(part, i) in diffs" :key="i">
      <del v-if="part.removed" class="diff-removed">{{ part.value }}</del>
      <ins v-else-if="part.added" class="diff-added">{{ part.value }}</ins>
      <span v-else>{{ part.value }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { diffChars } from 'diff';

const props = defineProps<{
  oldString: string;
  newString: string;
}>();

const diffs = computed(() => {
  return diffChars(props.oldString || '', props.newString || '');
});
</script>

<style scoped>
.diff-added {
  color: #ff5555;
  text-decoration: underline;
}
.diff-removed {
  text-decoration: line-through;
  color: #ff5555;
}
</style>
