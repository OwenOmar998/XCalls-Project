<script setup lang="ts">
  import useTimeComposable from '@/composable/useTime.composable';
  import { LogDetail } from '@/types/sip.types';
  import { faPhone } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { computed } from 'vue';
  const { useTimeAgoFormat, useFormatElapsedTime } = useTimeComposable();
  const props = defineProps<{
    item: LogDetail;
  }>();
  const duration = computed(() => {
    if (!props.item.answerTime || !props.item.endTime) return 0;
    const duration =
      new Date(props.item.endTime).getTime() - new Date(props.item.answerTime).getTime();
    return duration;
  });
  const formattedDuration = computed(() => useFormatElapsedTime(duration.value));
  const text = computed(() => {
    if (props.item.callDirection === 'outbound') {
      if (props.item.answerTime) {
        return `You made a call and spoke for ${formattedDuration.value}`;
      } else {
        return `You tried to make a call (${props.item.reasonText})`;
      }
    } else {
      if (props.item.answerTime)
        return `You received a call and spoke for ${formattedDuration.value}`;
      else return `You missed a call (${props.item.reasonText})`;
    }
  });
  const showingDate = computed(() => useTimeAgoFormat(props.item.startTime));
</script>
<template>
  <div
    :class="
      item.callDirection === 'outbound'
        ? 'self-end ms-5  bg-blue-500 text-white'
        : 'self-start me-5  bg-gray-30'
    "
    class="sm:max-w-96 rounded py-3 px-4 text-xs"
  >
    <div class="flex flex-col gap-2">
      <div class="flex gap-1 items-center">
        <font-awesome-icon
          class="w-4 h-4"
          :icon="faPhone"
          :class="item.answerTime ? 'text-green-600' : 'text-red-600'"
        />
        <div>{{ text }}</div>
      </div>
      <div class="text-gray-40 text-xs">
        {{ showingDate }}
      </div>
    </div>
  </div>
</template>
