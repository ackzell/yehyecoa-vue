import { compressSync, decompressSync, strFromU8, strToU8 } from 'fflate';
import PartySocket from 'partysocket';
import { defineStore } from 'pinia';
import { onBeforeMount, onUnmounted, readonly, ref, shallowRef } from 'vue';

import { useToastsStore } from '@/components/toasts/useToastsStore';

type MessageHandler = (message: any) => void;

export const usePartyKitStore = defineStore('partyKitStore', () => {
  let connection: PartySocket | null = null;
  const isConnected = ref(false);
  const isInstructorConnected = ref(false);
  // const isWorkshopActive = ref(false);
  const currentRoomId = ref('');
  const offlineInstructorTimeLeft = shallowRef(0);
  const messageHandlers = new Set<MessageHandler>();
  let initialized = false;

  const { toast } = useToastsStore();
  const isUserInstructor = ref(sessionStorage.getItem('isInstructor') === 'yes');

  if (!initialized) {
    initialized = true;

    const id = isUserInstructor.value
      ? 'instructor'
      : `attendee-${crypto.randomUUID().slice(0, 8)}`;

    onBeforeMount(() => {
      connection = new PartySocket({
        host: 'http://127.0.0.1:1999',
        room: 'test-workshop',
        id,
      });

      connection.addEventListener('open', () => {
        isConnected.value = true;
      });

      connection.addEventListener('message', async (event) => {
        let message: any;

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
                  // isWorkshopActive.value = message.payload.isWorkshopActive;
                  // if (isWorkshopActive.value) {
                  toast.success(currentRoomId.value, { description: 'Connected.' });
                  console.warn(message.payload.comment);
                  // }

                  break;

                case 'INSTRUCTOR_CONNECTED':
                  isInstructorConnected.value = true;
                  // isWorkshopActive.value = message.payload.isWorkshopActive;
                  if (!(sessionStorage.getItem('isInstructor') === 'yes')) {
                    toast.success('Instructor is online');
                    console.warn(message.payload.comment);
                  }
                  break;

                case 'INSTRUCTOR_DISCONNECTED':
                  isInstructorConnected.value = message.payload.isInstructorConnected;
                  toast.warning('Instructor is offline');
                  console.warn(message.payload.comment);
                  break;

                  // case 'WORKSHOP_ENDED':
                  //   isWorkshopActive.value = message.payload.isWorkshopActive;
                  //   toast.info('Workshop ended');
                  //   console.warn(message.payload.comment);
                  //   break;

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
    });

    onUnmounted(() => {
      connection?.close();
      messageHandlers.clear();
      initialized = false; // Reset for HMR or next full page load
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

  return {
    isConnected: readonly(isConnected),
    isUserInstructor: readonly(isUserInstructor),
    isInstructorConnected: readonly(isInstructorConnected),
    // isWorkshopActive: readonly(isWorkshopActive),
    currentRoomId: readonly(currentRoomId),
    offlineInstructorTimeLeft: readonly(offlineInstructorTimeLeft),
    send,
    onMessage,
    disconnect,
    reconnect,
  };
});
