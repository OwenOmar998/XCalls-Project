<script setup lang="ts">
  import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  const props = defineProps<{
    icon: IconDefinition;
    fn?: Function;
  }>();
  const clickHandler = () => {
    if (props.fn) {
      props.fn();
    }
  };
</script>

<template>
  <font-awesome-icon
    @click="clickHandler"
    :icon="icon"
    class="w-4 h-4 text-blue-600 hover:bg-gray-70 hover:text-white p-2 rounded-full cursor-pointer"
  />
</template>
