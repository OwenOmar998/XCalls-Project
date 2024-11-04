<script setup lang="ts">
  import { EnumSnackbarType } from '@/helper/enums/misc.enum';
  import { useSnackbarStore } from '@/stores/snackbar.store';
  import {
    faCheckCircle,
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle,
    faXmark,
  } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import { storeToRefs } from 'pinia';
  import { computed } from 'vue';

  const snackbarStore = useSnackbarStore();
  const { message, type } = storeToRefs(snackbarStore);
  const { clearMessage } = snackbarStore;
  const showSnackbar = computed({
    get: () => message.value.length > 0,
    set: (value: boolean) => {
      if (!value) clearMessage();
    },
  });
  const color = computed(() => {
    switch (type.value) {
      case EnumSnackbarType.ERROR:
        return 'error';
      case EnumSnackbarType.SUCCESS:
        return 'success';
      case EnumSnackbarType.WARNING:
        return 'warning';
      case EnumSnackbarType.INFO:
        return 'info';
    }
  });
  const icons = computed(() => {
    switch (type.value) {
      case EnumSnackbarType.ERROR:
        return faExclamationCircle;
      case EnumSnackbarType.SUCCESS:
        return faCheckCircle;
      case EnumSnackbarType.WARNING:
        return faExclamationTriangle;
      case EnumSnackbarType.INFO:
        return faInfoCircle;
      default:
        return faCheckCircle;
    }
  });
</script>
<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed z-9999 inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
  >
    <div class="flex w-full flex-col z-50 items-center space-y-4 sm:items-end">
      <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
      <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="message"
          :class="`bg-${color}`"
          class="pointer-events-auto border z-100 w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-blue-600 ring-opacity-5"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <font-awesome-icon
                  :icon="icons"
                  class="h-6 w-6 text-white"
                />
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-white">
                  {{ message }}
                </p>
              </div>
              <div class="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  @click="showSnackbar = false"
                  class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span class="sr-only">Close</span>
                  <font-awesome-icon
                    :icon="faXmark"
                    class="w-5 h-5 font-black"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
