<script setup lang="ts">
  import { RouteLocationRaw } from 'vue-router';
  import BaseButton from '@/components/base/BaseButton.vue';
  import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  defineProps<{
    title: string;
    subTitle: string;
    buttonText: string;
    to?: RouteLocationRaw;
    fn?: Function;
    appendIcon?: IconDefinition;
    prependIcon?: IconDefinition;
    block?: boolean;
  }>();
</script>
<template>
  <h2 class="text-2xl font-semibold text-gray-70 mb-2">{{ title }}</h2>
  <p class="text-gray-40 mb-4">{{ subTitle }}</p>
  <BaseButton
    :to="to"
    color="blue-500"
    :fn="fn"
    :block="block"
    :class="block ? '' : 'w-fit'"
    :append-icon="appendIcon"
    :prepend-icon="prependIcon"
    icon-classes="text-white"
  >
    <span class="text-white font-semibold"> {{ buttonText }} </span>
  </BaseButton>
</template>
