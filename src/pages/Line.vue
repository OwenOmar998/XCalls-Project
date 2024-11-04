<script setup lang="ts">
  import { faArrowLeft, faPhone } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

  import BaseAvatar from '@/components/base/BaseAvatar.vue';
  import BaseButton from '@/components/base/BaseButton.vue';
  import BaseNoDateMessage from '@/components/base/BaseNoDateMessage.vue';
  import { mainEnumRoutes } from '@/routes/main/main.enum.routes';
  import { useSipStore } from '@/stores/sip.store';
  import { Line, LineStatus } from '@/types/sip.types';
  import { storeToRefs } from 'pinia';
  import { computed, ComputedRef, onBeforeUnmount, Ref, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import useTimeComposable from '@/composable/useTime.composable';
  const { useFormatClockTime } = useTimeComposable();
  const route = useRoute();
  const lineId = computed(() => (route.params.lineId as string) || '');
  const sipStore = useSipStore();
  const { cancelSession, endSession, rejectCall, answerCall } = sipStore;
  const { lines } = storeToRefs(sipStore);
  const lineDetail: ComputedRef<
    | (Omit<Line, 'sipSession'> & {
        index: number;
      })
    | undefined
  > = computed(() => {
    let item:
      | undefined
      | (Omit<Line, 'sipSession'> & {
          index: number;
        }) = undefined;
    lines.value.forEach((line, index) => {
      if (line.id === lineId.value) {
        item = {
          id: line.id,
          number: line.number,
          displayName: line.displayName,
          logId: line.logId,
          index: index + 1,
          startTime: line.startTime,
          callDirection: line.callDirection,
          answerTime: line.answerTime,
          rejectTime: line.rejectTime,
          endTime: line.endTime,
          status: line.status,
        };
      }
    });
    return item;
  });
  const duration = ref('');
  const setDuration = () => {
    if (!lineDetail.value) return '';
    const startDate = lineDetail.value.answerTime || lineDetail.value.startTime;
    duration.value = useFormatClockTime(startDate);
  };
  let interval: Ref<NodeJS.Timeout | null> = ref(null);
  watch(lineDetail, () => {
    if (!lineDetail.value || lineDetail.value.endTime) {
      if (interval.value) clearInterval(interval.value);
      return;
    }
    if (interval.value) clearInterval(interval.value);
    interval.value = setInterval(setDuration, 1000);
  });
  onBeforeUnmount(() => {
    if (interval.value) clearInterval(interval.value);
  });
  const cancelHandler = () => {
    if (lineDetail.value) cancelSession(lineDetail.value?.id);
  };
  const endHandler = () => {
    if (lineDetail.value) endSession(lineDetail.value?.id);
  };
  const answerHandler = () => {
    if (lineDetail.value) answerCall(lineDetail.value?.id);
  };
  const rejectHandler = () => {
    if (lineDetail.value) rejectCall(lineDetail.value?.id);
  };
</script>
<template>
  <div
    v-if="!lineDetail"
    class="p-4"
  >
    <BaseNoDateMessage
      title="No Line Available"
      subTitle="It's looked like this Line des not exist."
      buttonText="Go to Home"
      :to="{ name: mainEnumRoutes.phone.name }"
    />
  </div>
  <div
    v-else
    class="flex flex-col grow"
  >
    <header class="sticky top-0 z-999 flex w-full bg-white h-20 drop-shadow-1">
      <div class="flex items-center gap-1 px-2">
        <router-link
          :to="{
            name: mainEnumRoutes.phone.name,
          }"
        >
          <font-awesome-icon
            :icon="faArrowLeft"
            class="w-4 h-4 text-blue-600"
          />
        </router-link>
        <BaseAvatar :text="lineDetail.index.toString()" />
        <div class="flex flex-col flex-grow p-4 md:px-4 2xl:px-12 gap-2">
          <div class="flex gap-1 items-center">
            <font-awesome-icon
              :icon="faPhone"
              class="w-4 h-4 font-black"
            />
            <div class="text-sm text-black">Line {{ lineDetail.index }}</div>
          </div>
          <div class="text-sm text-gray-40">
            {{ lineDetail.displayName }}
          </div>
        </div>
      </div>
    </header>
    <div class="border-e border-b border-e-gray-40 border-b-gray-40 grow p-4 flex flex-col gap-3">
      <div class="rounded-lg bg-gray-40 p-2 flex justify-between items-center gap-3">
        {{ lineDetail.status }}
        <div class="text-black">{{ duration }}</div>
      </div>
      <div class="flex justify-center p-4">
        <BaseButton
          v-if="lineDetail.status == LineStatus.Ringing && lineDetail.callDirection == 'outbound'"
          :fn="cancelHandler"
          :prepend-icon="faPhone"
          icon-classes="text-white"
          color="red-600"
        >
          <span class="text-white font-semibold"> Cancel Call</span>
        </BaseButton>
        <BaseButton
          v-else-if="lineDetail.status == LineStatus.InProgress"
          :fn="endHandler"
          :prepend-icon="faPhone"
          icon-classes="text-white"
          color="red-600"
        >
          <span class="text-white font-semibold"> End Call</span>
        </BaseButton>
        <div
          class="flex gap-3 items-center justify-center"
          v-else-if="lineDetail.status == LineStatus.Ringing"
        >
          <BaseButton
            :fn="answerHandler"
            :prepend-icon="faPhone"
            icon-classes="text-white"
            color="green-600"
          >
            <span class="text-white font-semibold"> Answer Call</span>
          </BaseButton>

          <BaseButton
            :prepend-icon="faPhone"
            color="red-600"
            icon-classes="text-white"
            :fn="rejectHandler"
          >
            <span class="text-white font-semibold"> Reject Call </span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
