<script setup lang="ts">
  import BaseAvatar from '@/components/base/BaseAvatar.vue';
  import BaseIcon from '@/components/base/BaseIcon.vue';
  import BaseNoDateMessage from '@/components/base/BaseNoDateMessage.vue';
  import CallLogDetail from '@/components/CallLogDetail.vue';
  import LineDetail from '@/components/LineDetail.vue';
  import PhoneIcon from '@/components/PhoneIcon.vue';
  import { useLocalStorageStore } from '@/stores/local-storage.store';
  import { useSipStore } from '@/stores/sip.store';
  import { Line } from '@/types/sip.types';
  import { faClose, faPhone, faRefresh } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { storeToRefs } from 'pinia';
  import { computed, ComputedRef, onBeforeMount, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  const localStorageStore = useLocalStorageStore();
  const sipStore = useSipStore();
  const { initialize, detectDevices, dial, refreshUserAgent } = sipStore;
  const { status, lines } = storeToRefs(sipStore);
  const { getData } = localStorageStore;
  const { logsArray } = storeToRefs(localStorageStore);
  const route = useRoute();
  const callId = computed(() => (route.params.callId as string) || '');
  const lineId = computed(() => (route.params.lineId as string) || '');
  const showPhoneDialog = ref(false);
  const phone = ref('');
  const phoneInputRef = ref<HTMLInputElement | null>(null);

  const deleteDigit = () => {
    if (phone.value.length > 0) phone.value = phone.value.slice(0, -1);
    phoneInputRef.value?.focus();
  };

  const handleInput = () => {
    phone.value = phone.value.replace(/[^\d\*\#\+]/g, '');
  };

  const addChar = (char: string) => {
    phone.value += char;
    phoneInputRef.value?.focus();
  };

  const numbers = [
    [
      ['1', ''],
      ['2', 'ABC'],
      ['3', 'DEF'],
    ],
    [
      ['4', 'GHI'],
      ['5', 'JKL'],
      ['6', 'MNO'],
    ],
    [
      ['7', 'PQRS'],
      ['8', 'TUV'],
      ['9', 'WXYZ'],
    ],
    [
      ['*', ''],
      ['0', ''],
      ['#', ''],
    ],
  ];

  onMounted(() => {
    detectDevices();
    getData();
    initialize();
    window.addEventListener('beforeunload', (e) => {
      if (lineDetails.value.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  });
  const lineDetails: ComputedRef<Omit<Line, 'sipSession'>[]> = computed(() =>
    lines.value
      .map((line) => ({
        id: line.id,
        number: line.number,
        displayName: line.displayName,
        logId: line.logId,
        callDirection: line.callDirection,
        startTime: line.startTime,
        answerTime: line.answerTime,
        rejectTime: line.rejectTime,
        endTime: line.endTime,
        status: line.status,
      }))
      .filter((line) => !line.endTime)
  );
  const dialHandler = () => {
    dial(phone.value);
    phone.value = '';
    showPhoneDialog.value = false;
  };
</script>

<template>
  <div class="flex h-dvh">
    <div
      :class="!callId && !lineId ? 'flex flex-col w-full' : 'hidden md:flex flex-col w-80 shrink-0'"
    >
      <header
        class="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 h-20 border-e border-e-gray-40"
      >
        <div class="flex flex-grow items-center justify-between p-4 md:px-6 2xl:px-12 gap-3">
          <div class="flex items-center gap-2">
            <BaseAvatar />
            <div class="flex flex-col gap-1">
              <div class="flex gap-1 items-center">
                <PhoneIcon
                  :bgColor="status == 'Registered' ? 'bg-green-600' : 'bg-gray-70'"
                  iconColor="text-black"
                />
                <div class="text-sm text-black">101</div>
              </div>
              <div class="text-xs text-gray-70">{{ status }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <BaseIcon
              :icon="faRefresh"
              :fn="refreshUserAgent"
            />
            <BaseIcon
              :fn="() => (showPhoneDialog = true)"
              :icon="faPhone"
            />
          </div>
        </div>
      </header>
      <div class="border-e border-b border-e-gray-40 border-b-gray-40 grow">
        <div v-if="!showPhoneDialog">
          <div
            v-if="logsArray.length === 0"
            class="p-4 md:px-6 2xl:px-12"
          >
            <BaseNoDateMessage
              title="No Call Logs Available"
              subTitle="It looks like you haven't made any calls yet. Start a call to see call logs and summaries here."
              buttonText="Start a New Call"
              :fn="() => (showPhoneDialog = true)"
              :prepend-icon="faPhone"
              block
            />
          </div>
          <div
            class="p-1 flex flex-col gap-1"
            v-else
          >
            <template v-if="lineDetails.length">
              <div
                v-for="(line, index) in lineDetails"
                :key="line.id"
              >
                <LineDetail
                  :index="index + 1"
                  :line="line"
                  :is-active="false"
                />
              </div>
              <div class="border-t border-t-gray-70"></div>
            </template>
            <CallLogDetail
              v-for="log in logsArray"
              :key="log.logId"
              :is-active="log.logId == callId"
              :call-log="log"
            />
          </div>
        </div>
        <div
          v-else
          class="flex flex-col gap-2"
        >
          <div class="text-right px-4">
            <BaseIcon
              :fn="() => (showPhoneDialog = false)"
              :icon="faClose"
            />
          </div>
          <div class="mt-4 mx-auto justify-center flex items-center">
            <input
              ref="phoneInputRef"
              class="h-8 text-gray-40 border-b border-b-gray-70 focus:outline-none text-center"
              :class="phone.length > 0 ? 'w-36' : 'w-40'"
              @input="handleInput"
              v-model="phone"
              type="tel"
            />
            <button
              @click="deleteDigit"
              :class="phone.length > 0 ? 'block w-4 text-blue-600' : 'hidden'"
            >
              ⌫
            </button>
          </div>
          <table class="mx-auto border-spacing-2 border-separate">
            <tbody>
              <tr v-for="row in numbers">
                <td v-for="number in row">
                  <button
                    class="text-white bg-gray-70 hover:bg-gray-60 w-12 h-12 rounded-full flex flex-col gap-1 items-center justify-center"
                    @click="addChar(number[0])"
                  >
                    <div class="leading-3">{{ number[0] }}</div>
                    <span class="text-xs">{{ number[1] }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button
            class="bg-green-600 hover:bg-green-500 w-12 h-12 rounded-full mx-auto"
            @click="dialHandler"
          >
            <font-awesome-icon
              :icon="faPhone"
              class="text-white text-2xl"
            />
          </button>
        </div>
      </div>
    </div>
    <div
      :class="callId || lineId ? 'block' : 'hidden'"
      class="grow flex flex-col"
    >
      <RouterView />
    </div>
  </div>
</template>
