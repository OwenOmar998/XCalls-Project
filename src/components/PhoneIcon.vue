<script setup lang="ts">
  import { faPhone } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  defineProps<{
    bgColor: string;
    iconColor: string;
  }>();
</script>
<template>
  <div
    class="w-4 h-4 p-1 rounded relative"
    :class="bgColor"
  >
    <font-awesome-icon
      :class="iconColor"
      :icon="faPhone"
      class="w-2 h-2 absolute"
    />
  </div>
</template>
