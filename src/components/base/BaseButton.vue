<script setup lang="ts">
  import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { computed } from 'vue';
  import type { RouteLocationRaw } from 'vue-router';

  const props = withDefaults(
    defineProps<{
      variant?: 'default' | 'outlined' | 'plain';
      color?: string;
      borderColor?: string;
      block?: boolean;
      size?: 'sm' | 'default' | 'lg';
      prependIcon?: IconDefinition;
      appendIcon?: IconDefinition;
      iconClasses?: string;
      to?: RouteLocationRaw;
      fn?: Function;
    }>(),
    {
      variant: 'default',
      color: 'blue-500',
      borderColor: '',
      block: false,
      size: 'default',
      iconClasses: '',
    }
  );

  const variantClasses = computed(() => {
    const borderClass = props.borderColor ? `border-${props.borderColor}` : `border-${props.color}`;

    switch (props.variant) {
      case 'outlined':
        return `border ${borderClass} text-${props.color}`;
      case 'plain':
        return `text-${props.color}`;
      default:
        return `bg-${props.color} border ${borderClass} hover:bg-opacity-90`;
    }
  });

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'px-3 py-2 text-xs';
      case 'lg':
        return 'px-7 py-4 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  });

  const iconSizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  });
  const clickHandler = () => {
    if (props.fn) {
      props.fn();
    }
  };
</script>

<template>
  <template v-if="to">
    <RouterLink
      :to="to"
      :class="[
        'rounded flex items-center justify-center cursor-pointer',
        variantClasses,
        sizeClasses,
        { 'w-full': props.block },
      ]"
    >
      <font-awesome-icon
        v-if="prependIcon"
        :icon="prependIcon"
        :class="[iconSizeClasses, `${$slots.default ? 'me-2' : ''}`, iconClasses]"
      />
      <slot></slot>
      <font-awesome-icon
        v-if="appendIcon"
        :icon="appendIcon"
        :class="[iconSizeClasses, 'ms-2', iconClasses]"
      />
    </RouterLink>
  </template>
  <button
    @click="clickHandler"
    v-else
    :class="[
      'rounded flex items-center justify-center cursor-pointer',
      variantClasses,
      sizeClasses,
      { 'w-full': props.block },
    ]"
  >
    <font-awesome-icon
      v-if="prependIcon"
      :icon="prependIcon"
      :class="[iconSizeClasses, `${$slots.default ? 'me-2' : ''}`, iconClasses]"
    />
    <slot></slot>
    <font-awesome-icon
      v-if="appendIcon"
      :icon="appendIcon"
      :class="[iconSizeClasses, 'ms-2', iconClasses]"
    />
  </button>
</template>
