<script setup lang="ts">
  import {
    faAddressCard,
    faArrowLeft,
    faPhone,
    faThumbtack,
    faThumbTackSlash,
  } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

  import { useLocalStorageStore } from '@/stores/local-storage.store';
  import { useSipStore } from '@/stores/sip.store';
  import { storeToRefs } from 'pinia';
  import { computed, Ref, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import BaseAvatar from '@/components/base/BaseAvatar.vue';
  import BaseIcon from '@/components/base/BaseIcon.vue';
  import BaseNoDateMessage from '@/components/base/BaseNoDateMessage.vue';
  import MessageDetail from '@/components/MessageDetail.vue';
  import { mainEnumRoutes } from '@/routes/main/main.enum.routes';

  const route = useRoute();
  const callId = computed(() => (route.params.callId as string) || '');
  const localStorageStore = useLocalStorageStore();
  const sipStore = useSipStore();
  const { dial } = sipStore;
  const { logsArray, logsDetails } = storeToRefs(localStorageStore);
  const { updateLog } = localStorageStore;
  const log = computed(() => logsArray.value.find((log) => log.logId === callId.value));
  const pinHandler = () => {
    updateLog(callId.value, { pinned: !log.value?.pinned });
  };
  const logDetailsArray = computed(() => {
    if (!log.value?.logId) return [];
    return logsDetails.value[log.value.logId].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  });
  const messageDetailRef: Ref<InstanceType<typeof MessageDetail>[] | null> = ref(null);
  watch(
    () => messageDetailRef.value?.length,
    () => {
      if (messageDetailRef.value?.length) {
        messageDetailRef.value?.[messageDetailRef.value.length - 1].$el.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    }
  );
</script>
<template>
  <div
    v-if="!log"
    class="p-4"
  >
    <BaseNoDateMessage
      title="No Call Log Available"
      subTitle="It's looked like this call log des not exist."
      buttonText="Go to Home"
      :to="{ name: mainEnumRoutes.phone.name }"
    />
  </div>
  <div
    v-else
    class="flex flex-col grow"
  >
    <header class="sticky top-0 z-999 flex w-full bg-white h-20 drop-shadow-1">
      <div class="flex flex-grow items-center justify-between p-4 md:px-4 2xl:px-12 gap-3">
        <div class="flex items-center gap-1">
          <router-link
            :to="{
              name: mainEnumRoutes.phone.name,
            }"
          >
            <BaseIcon :icon="faArrowLeft" />
          </router-link>
          <BaseAvatar />
          <div class="flex gap-1 items-center">
            <font-awesome-icon
              :icon="faAddressCard"
              class="w-4 h-4 font-black"
            />
            <div class="text-sm text-black">{{ log.displayName }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <BaseIcon
            @click="dial(log.number)"
            :icon="faPhone"
          />
          <BaseIcon
            @click="pinHandler"
            :icon="log.pinned ? faThumbTackSlash : faThumbtack"
          />
        </div>
      </div>
    </header>
    <div
      class="border-e border-b border-e-gray-40 border-b-gray-40 grow p-4 h-[calc(100dvh-5rem)] overflow-y-auto"
    >
      <div class="flex flex-col gap-2">
        <MessageDetail
          ref="messageDetailRef"
          v-for="logDetail in logDetailsArray"
          :id="logDetail.id"
          :item="logDetail"
        ></MessageDetail>
      </div>
    </div>
  </div>
</template>
