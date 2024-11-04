<script setup lang="ts">
  import { mainEnumRoutes } from '@/routes/main/main.enum.routes';

  import BaseAvatar from '@/components/base/BaseAvatar.vue';
  import useTimeComposable from '@/composable/useTime.composable';
  import { useSipStore } from '@/stores/sip.store';
  import { Line } from '@/types/sip.types';
  import { storeToRefs } from 'pinia';
  import { computed, ComputedRef, onBeforeUnmount, ref, Ref, watch } from 'vue';
  import PhoneIcon from './PhoneIcon.vue';
  const { useFormatClockTime } = useTimeComposable();
  const props = defineProps<{
    line: Omit<Line, 'sipSession'>;
    isActive: boolean;
    index: number;
  }>();
  const lineDetail: ComputedRef<
    | (Omit<Line, 'sipSession'> & {
        index: number;
      })
    | undefined
  > = computed(() => {
    return {
      id: props.line.id,
      number: props.line.number,
      displayName: props.line.displayName,
      logId: props.line.logId,
      index: props.index,
      startTime: props.line.startTime,
      callDirection: props.line.callDirection,
      answerTime: props.line.answerTime,
      rejectTime: props.line.rejectTime,
      endTime: props.line.endTime,
      status: props.line.status,
    };
  });
  const duration = ref('');
  const setDuration = () => {
    if (!lineDetail.value) return '';
    const startDate = lineDetail.value.answerTime || lineDetail.value.startTime;
    duration.value = useFormatClockTime(startDate);
  };
  let interval: Ref<NodeJS.Timeout | null> = ref(null);
  watch(
    lineDetail,
    () => {
      if (!lineDetail.value || lineDetail.value.endTime) {
        if (interval.value) clearInterval(interval.value);
        return;
      }
      if (interval.value) clearInterval(interval.value);
      interval.value = setInterval(setDuration, 1000);
    },
    { immediate: true }
  );
  onBeforeUnmount(() => {
    if (interval.value) clearInterval(interval.value);
  });
  const sipStore = useSipStore();
  const { activeLineId } = storeToRefs(sipStore);
</script>
<template>
  <router-link
    @click="activeLineId = line.id"
    :to="{ name: mainEnumRoutes.line.name, params: { lineId: line.id } }"
    class="flex justify-between items-center p-4 md:px-6 2xl:px-12 rounded cursor-pointer border-l-4 relative"
    :class="
      activeLineId == line.id ? 'bg-gray-40 border-l-blue-600' : 'hover:bg-gray-20 border-l-gray-40'
    "
  >
    <div class="flex items-center gap-1">
      <BaseAvatar />
      <div class="flex gap-1 items-center">
        <PhoneIcon
          :bgColor="isActive ? 'bg-gray-20' : 'bg-gray-40'"
          iconColor="text-black"
        />
        <div class="text-sm text-black">{{ line.displayName }}<{{ line.number }}></div>
      </div>
    </div>
    {{ duration }}
  </router-link>
</template>
