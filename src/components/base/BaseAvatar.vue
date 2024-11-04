<script setup lang="ts">
  withDefaults(
    defineProps<{
      text?: string;
      width?: string;
      height?: string;
    }>(),
    {
      width: '40px',
      height: '40px',
    }
  );
</script>
<template>
  <div>
    <img
      v-if="!text"
      class="rounded-full border border-white"
      :width="width"
      :height="height"
      src="@/assets/images/default-user.svg"
    />
    <div
      v-else
      class="flex items-center justify-center rounded-full bg-blue-500 text-white border border-white"
      :style="{ width, height }"
    >
      {{ text }}
    </div>
  </div>
</template>
