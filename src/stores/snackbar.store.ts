import { EnumSnackbarType } from '@/helper/enums/misc.enum';
import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';

export const useSnackbarStore = defineStore('snackbarStore', () => {
  const message: Ref<string> = ref('');
  const type: Ref<EnumSnackbarType> = ref(EnumSnackbarType.SUCCESS);
  const clearMessage = () => {
    message.value = '';
  };
  const showToast = ({
    msg,
    snackbarType,
    timeout,
  }: {
    msg: string;
    snackbarType: EnumSnackbarType;
    timeout?: number | undefined;
  }) => {
    type.value = snackbarType;
    message.value = msg;
    setTimeout(() => {
      clearMessage();
    }, timeout ?? 3000);
  };
  return { message, type, showToast, clearMessage };
});
