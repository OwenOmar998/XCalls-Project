import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { LogDetail, LogItem } from '@/types/sip.types';

export const useLocalStorageStore = defineStore('localStorageStore', () => {
  const logsArray: Ref<LogItem[]> = ref([]);
  const logsDetails: Ref<{ [key: string]: LogDetail[] }> = ref({});

  const getData = () => {
    const logsItems = JSON.parse(localStorage.getItem('logsArray') || '[]') as LogItem[];
    const detailsItems = JSON.parse(localStorage.getItem('logsDetails') || '{}') as {
      [key: string]: LogDetail[];
    };
    logsArray.value = cloneDeep(logsItems);
    logsDetails.value = cloneDeep(detailsItems);
  };

  const saveDataToLocaleStorage = () => {
    localStorage.setItem('logsArray', JSON.stringify(cloneDeep(logsArray.value)));
    localStorage.setItem('logsDetails', JSON.stringify(cloneDeep(logsDetails.value)));
  };

  const sortLogs = () => {
    logsArray.value
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
    saveDataToLocaleStorage();
  };

  const updateLog = (logId: string, logDetail: Partial<LogItem>) => {
    logsArray.value = cloneDeep(logsArray.value).map((log) =>
      log.logId === logId ? { ...log, ...logDetail } : log
    );
    sortLogs();
  };

  const updateLogDetail = (id: string, logId: string, logDetail: Partial<LogDetail>) => {
    logsDetails.value = {
      ...logsDetails.value,
      [logId]: cloneDeep(logsDetails.value[logId]).map((item) =>
        item.id === id ? { ...cloneDeep(item), ...cloneDeep(logDetail) } : cloneDeep(item)
      ),
    };
    saveDataToLocaleStorage();
  };

  const addLogDetail = (logDetail: LogDetail) => {
    if (!logsDetails.value[logDetail.logId]) {
      logsDetails.value[logDetail.logId] = [];
    }
    logsDetails.value[logDetail.logId].push(cloneDeep(logDetail));
    saveDataToLocaleStorage();
  };

  const addLog = (log: LogItem) => {
    logsArray.value.push(cloneDeep(log));
    sortLogs();
  };

  return {
    logsArray,
    logsDetails,
    getData,
    sortLogs,
    updateLog,
    updateLogDetail,
    addLog,
    addLogDetail,
  };
});
