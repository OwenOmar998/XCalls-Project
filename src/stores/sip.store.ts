import { EnumSnackbarType } from '@/helper/enums/misc.enum';
import { mainEnumRoutes } from '@/routes/main/main.enum.routes';
import { Line, LineStatus } from '@/types/sip.types';
import { cloneDeep } from 'lodash';
import { defineStore, storeToRefs } from 'pinia';
import {
  Bye,
  Cancel,
  Invitation,
  Inviter,
  Registerer,
  RegistererState,
  SessionState,
  TransportState,
  UserAgent,
  UserAgentOptions,
} from 'sip.js';
import { IncomingResponse } from 'sip.js/lib/core';
import { ref, Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLocalStorageStore } from './local-storage.store';
import { useSnackbarStore } from './snackbar.store';

export const useSipStore = defineStore('sipStore', () => {
  const router = useRouter();
  const route = useRoute();
  const userAgent: Ref<UserAgent | null> = ref(null);
  const registerer: Ref<Registerer | null> = ref(null);
  const status: Ref<string> = ref('');
  const localeStore = useLocalStorageStore();
  const snackbarStore = useSnackbarStore();
  const hasAudioDevice = ref(false);
  const hasSpeakerDevice = ref(false);
  const lines = ref<Line[]>([]);
  const activeLineId = ref('');
  const { logsArray } = storeToRefs(localeStore);
  const { updateLog, sortLogs, addLogDetail, addLog } = localeStore;
  const { showToast } = snackbarStore;
  const isReRegistering = ref(false);

  const detectDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      for (const device of devices) {
        if (device.kind === 'audioinput') hasAudioDevice.value = true;
        else if (device.kind === 'audiooutput') hasSpeakerDevice.value = true;
      }
      if (!hasAudioDevice.value || !hasSpeakerDevice.value) {
        showToast({ msg: 'No audio device found', snackbarType: EnumSnackbarType.ERROR });
        return;
      }
    } catch (error) {
      showToast({ msg: 'Failed to detect audio devices', snackbarType: EnumSnackbarType.ERROR });
    }
  };

  const userAgentOptions: UserAgentOptions = {
    uri: UserAgent.makeURI(
      `sip:${import.meta.env.VITE_SIP_USERNAME}@${import.meta.env.VITE_SIP_DOMAIN}`
    ),
    transportOptions: {
      server: `wss://${import.meta.env.VITE_SIP_DOMAIN}:${import.meta.env.VITE_SIP_PORT}/${import.meta.env.VITE_SIP_PATH}`,
    },
    authorizationUsername: import.meta.env.VITE_SIP_USERNAME,
    authorizationPassword: import.meta.env.VITE_SIP_PASSWORD,
    displayName: import.meta.env.VITE_SIP_DISPLAY_NAME,
    delegate: {
      onInvite: function (invitation: Invitation) {
        receiveCall(invitation);
      },
    },
  };

  const receiveCall = (invitation: Invitation) => {
    const displayName = invitation.remoteIdentity.displayName;
    const user = invitation.remoteIdentity.uri.user;
    let logDetail = logsArray.value.find((log) => log.number === user);
    const logId = logDetail?.logId || Math.random().toString(36).substring(2);

    if (logDetail) {
      updateLog(logId, {
        lastActivity: new Date().toISOString(),
        displayName: displayName || user,
      });
    } else {
      logDetail = {
        number: user || 'Unknown',
        displayName: displayName || user || 'Unknown',
        lastActivity: new Date().toISOString(),
        pinned: false,
        logId,
      };
      addLog(cloneDeep(logDetail));
    }
    const line: Line = {
      displayName: displayName || user || 'Unknown',
      number: user || 'Unknown',
      id: Math.random().toString(36).substring(2),
      sipSession: invitation,
      callDirection: 'inbound',
      startTime: new Date().toISOString(),
      logId,
      status: LineStatus.Ringing,
    };
    lines.value.push(line);
    if (lines.value.length && lines.value.some((line) => line.status === LineStatus.InProgress)) {
      rejectCall(line.id, true);
      return;
    }
    if (route.name !== mainEnumRoutes.line.name) {
      activeLineId.value = line.id;
      router.push({ name: mainEnumRoutes.line.name, params: { lineId: line.id } });
    }

    sortLogs();
    if (!hasAudioDevice.value) {
      showToast({
        msg: 'No audio device found',
        snackbarType: EnumSnackbarType.ERROR,
      });
      return;
    }
    if (!line.sipSession) return;
    // Session Delegates
    line.sipSession.delegate = {
      onBye: (bye: Bye) => {
        bye.accept();
        teardownSession(line, LineStatus.Ended, 'Bye');
      },
      onCancel: (cancel: Cancel) => {
        if (cancel.request.headers['Reason']?.[0]?.raw?.includes('Call completed elsewhere')) {
          teardownSession(line, LineStatus.Ended, 'Call completed elsewhere');
        } else {
          teardownSession(line, LineStatus.Cancelled, 'Call Terminated');
        }
      },
    };
  };

  const rejectCall = (lineId: string, busyWithAnotherCall?: boolean) => {
    const line = lines.value.find((line) => line.id === lineId);
    if (!line) {
      showToast({
        msg: 'Line not found',
        snackbarType: EnumSnackbarType.WARNING,
      });
      return;
    }
    const session: Invitation = line.sipSession as Invitation;
    if (session?.state == SessionState.Established)
      session?.bye().catch(() => {
        showToast({
          msg: 'Failed to reject the session',
          snackbarType: EnumSnackbarType.ERROR,
        });
      });
    else {
      session?.reject().catch(() => {
        showToast({
          msg: 'Failed to reject the session',
          snackbarType: EnumSnackbarType.ERROR,
        });
      });
    }
    updateLine(line.id, { status: LineStatus.Rejected, rejectTime: new Date().toISOString() });
    teardownSession(
      line as Line,
      LineStatus.Rejected,
      busyWithAnotherCall ? 'Busy with another call' : 'Busy Here'
    );
  };

  const initialize = () => {
    userAgent.value = new UserAgent(userAgentOptions);
    registerer.value = new Registerer(userAgent.value);
    registerer.value.stateChange.addListener((newState) => {
      if (userAgent.value?.transport.state != TransportState.Connected) return;
      switch (newState) {
        case RegistererState.Initial:
          status.value = 'Sending Registration...';
          break;
        case RegistererState.Registered:
          status.value = 'Registered';
          break;
        case RegistererState.Unregistered:
          status.value = 'Unregistered';
          if (!isReRegistering.value)
            showToast({
              msg: 'Failed to register',
              snackbarType: EnumSnackbarType.ERROR,
            });

          break;
        case RegistererState.Terminated:
          status.value = 'Terminated';
          break;
      }
    });
    userAgent.value.transport.stateChange.addListener((newState) => {
      status.value = newState;
      switch (newState) {
        case TransportState.Disconnected:
          showToast({
            msg: 'Failed to connect to web socket',
            snackbarType: EnumSnackbarType.ERROR,
          });
          status.value = 'Disconnected from web socket';
          registerer.value?.unregister();
          break;
        case TransportState.Connecting:
          status.value = 'Connecting to web socket';
          break;
        case TransportState.Connected:
          registerer.value?.register();
      }
    });
    userAgent.value.start();
  };

  const dial = (dialNumber: string) => {
    if (!userAgent.value || status.value !== 'Registered') return;

    let logDetail = logsArray.value.find((log) => log.number === dialNumber);
    const logId = logDetail?.logId || Math.random().toString(36).substring(2);

    if (logDetail) {
      updateLog(logId, { lastActivity: new Date().toISOString() });
    } else {
      logDetail = {
        number: dialNumber,
        displayName: dialNumber,
        lastActivity: new Date().toISOString(),
        pinned: false,
        logId,
      };
      addLog(cloneDeep(logDetail));
    }
    sortLogs();

    if (!hasAudioDevice.value) {
      showToast({
        msg: 'No audio device found',
        snackbarType: EnumSnackbarType.ERROR,
      });
      return;
    }

    const targetURI = UserAgent.makeURI(`sip:${dialNumber}@${import.meta.env.VITE_SIP_DOMAIN}`);
    if (!targetURI) throw new Error('Failed to create target URI');
    const line: Line = {
      id: Math.random().toString(36).substring(2),
      number: logDetail.number,
      displayName: logDetail.displayName,
      logId,
      sipSession: null,
      callDirection: 'outbound',
      startTime: new Date().toISOString(),
      status: LineStatus.Ringing,
    };
    lines.value.push(line);
    router.push({
      name: mainEnumRoutes.line.name,
      params: { lineId: line.id },
    });
    activeLineId.value = line.id;
    // Updated SIP session setup with status and removal on rejection
    line.sipSession = new Inviter(userAgent.value, targetURI, {
      sessionDescriptionHandlerOptions: {
        constraints: { audio: { deviceId: 'default' }, video: false },
      },
    });

    line.sipSession.delegate = {
      onBye: (bye: Bye) => {
        bye.accept();
        teardownSession(line, LineStatus.Ended, 'Bye');
      },
    };

    line.sipSession
      .invite({
        requestDelegate: {
          onTrying: (_response: IncomingResponse) => {
            updateLine(line.id, { status: LineStatus.Trying });
          },
          onProgress: (_response: IncomingResponse) => {
            updateLine(line.id, { status: LineStatus.Ringing });
          },
          onAccept: (_response: IncomingResponse) => {
            updateLine(line.id, {
              status: LineStatus.InProgress,
              answerTime: new Date().toISOString(),
            });
          },
        },
      })
      .catch((e) => {
        showToast({
          msg: 'Failed to dial',
          snackbarType: EnumSnackbarType.ERROR,
        });
        teardownSession(line, LineStatus.Cancelled, 'Failed to dial');
      });
  };
  const updateLine = (lineId: string, data: Partial<Line>) => {
    lines.value.map((line) => {
      if (line.id === lineId) {
        line.status = data.status || line.status;
        line.startTime = data.startTime || line.startTime;
        line.answerTime = data.answerTime || line.answerTime;
        line.rejectTime = data.rejectTime || line.rejectTime;
        line.endTime = data.endTime || line.endTime;
      }
      return line;
    });
  };

  const teardownSession = async (lineObj: Line, status: LineStatus, reasonText: string) => {
    // Remove line from lines array
    updateLog(lineObj.logId, { lastActivity: new Date().toISOString() });
    updateLine(lineObj.id, { status, endTime: new Date().toISOString() });
    const line = lines.value.find((line) => line.id === lineObj.id);
    if (!line) {
      showToast({
        msg: 'Line not found',
        snackbarType: EnumSnackbarType.WARNING,
      });
      return;
    }
    addLogDetail({
      logId: line?.logId || '',
      id: Math.random().toString(36).substring(2),
      number: line?.number || '',
      callDirection: line?.callDirection,
      startTime: line.startTime,
      answerTime: line?.answerTime,
      rejectTime: line?.rejectTime,
      endTime: line?.endTime,
      reasonText,
    });
    setTimeout(() => {
      lines.value = lines.value.filter((line) => line.id !== lineObj.id);
      router.push({ name: mainEnumRoutes.call.name, params: { callId: lineObj.logId } });
    }, 5000);
  };
  const cancelSession = (lineId: string) => {
    const line = lines.value.find((line) => line.id === lineId);
    if (!line) {
      showToast({
        msg: 'Line not found',
        snackbarType: EnumSnackbarType.WARNING,
      });
      return;
    }
    const session: Inviter = line.sipSession as Inviter;
    session?.cancel().catch(() => {
      showToast({
        msg: 'Failed to cancel the session',
        snackbarType: EnumSnackbarType.ERROR,
      });
    });
    teardownSession(line as Line, LineStatus.Cancelled, 'Call Cancelled');
  };

  const endSession = (lineId: string) => {
    const line = lines.value.find((line) => line.id === lineId);
    if (!line) {
      showToast({
        msg: 'Line not found',
        snackbarType: EnumSnackbarType.WARNING,
      });
      return;
    }
    line.sipSession?.bye().catch(() => {
      showToast({
        msg: 'Failed to end the session',
        snackbarType: EnumSnackbarType.ERROR,
      });
    });
    teardownSession(line as Line, LineStatus.Ended, 'Call Ended');
  };
  const answerCall = (lineId: string) => {
    const line = lines.value.find((line) => line.id === lineId);
    if (!line) {
      showToast({
        msg: 'Line not found',
        snackbarType: EnumSnackbarType.WARNING,
      });
      return;
    }
    if (!hasAudioDevice.value) {
      showToast({
        msg: 'No audio device found',
        snackbarType: EnumSnackbarType.ERROR,
      });
      return;
    }
    const spdOptions = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: { deviceId: 'default' },
          video: false,
        },
      },
    };
    const session: Invitation = line.sipSession as Invitation;
    session
      .accept(spdOptions)
      .then(function () {
        updateLine(line.id, {
          status: LineStatus.InProgress,
          answerTime: new Date().toISOString(),
        });
      })
      .catch((e) => {
        showToast({
          msg: 'Failed to answer call',
          snackbarType: EnumSnackbarType.ERROR,
        });
        teardownSession(line as Line, LineStatus.Ended, 'Client Error');
      });
    updateLine(line.id, { status: LineStatus.InProgress, answerTime: new Date().toISOString() });
  };
  const refreshUserAgent = async () => {
    isReRegistering.value = true;
    status.value = 'Unregister...';
    lines.value.forEach((line) => {
      teardownSession(line as Line, LineStatus.Ended, 'Re-registering');
    });
    await registerer.value?.unregister();
    setTimeout(() => {
      status.value = 'Unregister complete';
      isReRegistering.value = false;
      initialize();
    }, 500);
  };

  return {
    initialize,
    status,
    detectDevices,
    dial,
    lines,
    cancelSession,
    endSession,
    rejectCall,
    answerCall,
    activeLineId,
    refreshUserAgent,
  };
});
