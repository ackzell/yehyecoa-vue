import type { AnyMessage } from 'packages/shared-types/dist';

import { compressSync, decompressSync, strFromU8, strToU8 } from 'fflate';
import PartySocket from 'partysocket';
import { defineStore } from 'pinia';
import { onBeforeMount, onUnmounted, readonly, ref } from 'vue';

import { useToastsStore } from '@/components/toasts/useToastsStore';

type MessageHandler = (message: any) => void;

export const usePartyKitStore = defineStore('partyKitStore', () => {
  let connection: PartySocket | null = null;
  const isConnected = ref(false);
  const isFollowingInstructor = ref(true);
  const isInstructorConnected = ref(false);
  const isWorkshopAvailable = ref(false);
  const currentRoomId = ref('');
  const currentId = ref('');
  const messageHandlers = new Set<MessageHandler>();
  let initialized = false;

  const { toast } = useToastsStore();
  const isUserInstructor = ref(sessionStorage.getItem('isInstructor') === 'yes');

  // Get room from URL parameter or default to 'test-workshop'
  const urlParams = new URLSearchParams(window.location.search);
  currentRoomId.value = urlParams.get('room') || 'test-workshop';

  if (!initialized) {
    initialized = true;

    onBeforeMount(async () => {
      await checkForAvailableWorkshop(currentRoomId.value);
      if (isWorkshopAvailable.value) {
        initializeConnection(currentRoomId.value);
      }
    });

    onUnmounted(() => {
      connection?.close();
      messageHandlers.clear();
      initialized = false; // Reset for HMR or next full page load
    });
  }

  function initializeConnection(room: string): void {
    currentId.value = isUserInstructor.value
      ? 'instructor'
      : `attendee-${crypto.randomUUID().slice(0, 8)}`;

    connection = new PartySocket({
      host: 'http://127.0.0.1:1999',
      room,
      id: currentId.value,
    });

    connection.addEventListener('open', () => {
      isConnected.value = true;
    });

    connection.addEventListener('message', async (event) => {
      let message: AnyMessage;

      try {
        if (event.data instanceof Blob) {
          const buffer = await event.data.arrayBuffer();
          const decompressed = decompressSync(new Uint8Array(buffer));
          const jsonString = strFromU8(decompressed);
          message = JSON.parse(jsonString);

          if (message.type === 'system') {
            switch (message.code) {
              case 'WELCOME':
                currentRoomId.value = message.payload.roomId;
                isInstructorConnected.value = message.payload.isInstructorConnected;
                isFollowingInstructor.value = true;
                toast.success(currentRoomId.value, { description: 'Connected.' });
                console.warn(message.payload.comment);
                break;

              case 'INSTRUCTOR_CONNECTED':
                isInstructorConnected.value = true;
                isFollowingInstructor.value = true;
                if (!(isUserInstructor.value)) {
                  toast.success('Instructor is online');
                  console.warn(message.payload.comment);
                }
                break;

              case 'INSTRUCTOR_DISCONNECTED':
                isInstructorConnected.value = message.payload.isInstructorConnected;
                toast.warning('Instructor is offline');
                console.warn(message.payload.comment);
                break;

              default:
                break;
            }
          }
        }
        else if (typeof event.data === 'string') {
          message = JSON.parse(event.data);
        }
      }
      catch (error) {
        console.error('Failed to process incoming message:', error, 'Raw data:', event.data);
      }

      messageHandlers.forEach(handler => handler(message));
    });

    connection.addEventListener('close', () => {
      isConnected.value = false;
    });
  }

  function send<T>(data: T): void {
    try {
      const jsonString = JSON.stringify(data);
      const payload = strToU8(jsonString);
      const compressed = compressSync(payload);
      connection?.send(compressed);
    }
    catch (error) {
      console.error('Failed to serialize and compress message for sending:', error);
    }
  }

  function onMessage(handler: MessageHandler): () => void {
    messageHandlers.add(handler);
    return () => messageHandlers.delete(handler);
  }

  function disconnect(): void {
    connection?.close();
    isConnected.value = false;
    toast.info(currentRoomId.value, {
      description: 'Disconnected.',
    });
  }

  function reconnect(): void {
    connection?.reconnect();
  }

  /**
   * Checks if the PartyKit room (workshop) is available by making a fetch request to the PartyKit server.
   * Sets isWorkshopAvailable accordingly.
   * Returns true if available, false otherwise.
   */
  async function checkForAvailableWorkshop(room?: string): Promise<boolean> {
    // Use the same logic as connection for room name
    const urlParams = new URLSearchParams(window.location.search);
    const roomName = room || urlParams.get('room') || 'test-workshop';
    // Use PartySocket.fetch to check the /status endpoint
    try {
      const res = await PartySocket.fetch({
        host: 'http://127.0.0.1:1999',
        room: roomName,
        path: 'status',
      }, {
        method: 'GET',
      });
      if (res.ok) {
        isWorkshopAvailable.value = true;
        return true;
      }
      isWorkshopAvailable.value = false;
      return false;
    }
    catch {
      isWorkshopAvailable.value = false;
      return false;
    }
  }

  async function joinWorkshop(): Promise<void> {
    await checkForAvailableWorkshop();
    if (isWorkshopAvailable.value) {
      initializeConnection('test-workshop');
    }
    else {
      if (isUserInstructor.value) {
        toast.error('No workshop available', {
          description: 'Please create a workshop first.',
        });
        return;
      }
      toast.error('No workshop available', {
        description: 'Please wait for the instructor to start it.',
      });
    }
  }

  function toggleFollowingInstructor(newValue: boolean): void {
    isFollowingInstructor.value = newValue;
  }

  return {
    isConnected: readonly(isConnected),
    isFollowingInstructor: readonly(isFollowingInstructor),
    isUserInstructor: readonly(isUserInstructor),
    isInstructorConnected: readonly(isInstructorConnected),
    isWorkshopAvailable: readonly(isWorkshopAvailable),
    currentRoomId: readonly(currentRoomId),
    currentId: readonly(currentId),
    send,
    onMessage,
    disconnect,
    toggleFollowingInstructor,
    reconnect,
    checkForAvailableWorkshop,
    joinWorkshop,
  };
});
