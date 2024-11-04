<script setup lang="ts">
  import { mainEnumRoutes } from '@/routes/main/main.enum.routes';

  import BaseAvatar from '@/components/base/BaseAvatar.vue';
  import { LogItem } from '@/types/sip.types';
  import { faThumbTack } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { computed } from 'vue';
  import useTimeComposable from '@/composable/useTime.composable';
  import PhoneIcon from './PhoneIcon.vue';
  const { useTimeAgoFormat } = useTimeComposable();
  const props = defineProps<{
    callLog: LogItem;
    isActive: boolean;
  }>();
  const showingDate = computed(() => useTimeAgoFormat(props.callLog.lastActivity));
</script>
<template>
  <router-link
    :to="{ name: mainEnumRoutes.call.name, params: { callId: callLog.logId } }"
    class="flex justify-between items-center p-4 md:px-6 2xl:px-12 rounded cursor-pointer border-l-4 relative h-16"
    :class="isActive ? 'bg-gray-40 border-l-blue-600' : 'hover:bg-gray-20 border-l-transparent'"
  >
    <div class="flex items-center gap-1">
      <BaseAvatar />
      <div class="flex gap-1 items-center">
        <PhoneIcon
          :bgColor="isActive ? 'bg-gray-20' : 'bg-gray-40'"
          iconColor="text-black"
        />
        <div class="text-sm text-black">{{ callLog.displayName }}</div>
      </div>
    </div>
    <div class="text-gray-70 text-xs flex flex-col gap-1 items-end">
      {{ showingDate }}
      <font-awesome-icon
        v-if="callLog.pinned"
        :icon="faThumbTack"
        class="w-3 h-3 text-blue-600"
      />
    </div>
  </router-link>
</template>
