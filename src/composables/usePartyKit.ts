import type { Ref } from 'vue';

import { compressSync, decompressSync, strFromU8, strToU8 } from 'fflate';
import PartySocket from 'partysocket';
import { onBeforeMount, onUnmounted, readonly, ref } from 'vue';

type MessageHandler = (message: any) => void;

type PartyBroadcast = {
  isConnected: Ref<boolean>;
  lastMessage: any;
  send: <T>(data: T) => void;
  onMessage: (handler: MessageHandler) => () => void; // Returns unsubscribe function
};

export function usePartyKitBroadcast(room = 'test-workshop'): PartyBroadcast {
  let connection: PartySocket | null = null;

  const isConnected = ref(false);
  const lastMessage = ref<any | null>(null);
  const messageHandlers = new Set<MessageHandler>();

  const id = sessionStorage.getItem('isInstructor') === 'yes'
    ? 'instructor'
    : `attendee-${crypto.randomUUID().slice(0, 8)}`;

  onBeforeMount(() => {
    connection = new PartySocket({
      // host: 'https://party-kit.ackzell.partykit.dev',
      host: 'http://127.0.0.1:1999',
      room,
      id,
    });

    connection.addEventListener('open', () => {
      isConnected.value = true;
    });

    connection.addEventListener('message', async (event) => {
      let message: any;

      try {
        if (event.data instanceof ArrayBuffer) {
          const decompressed = decompressSync(new Uint8Array(event.data));
          const jsonString = strFromU8(decompressed);
          message = JSON.parse(jsonString);
        }
        else if (event.data instanceof Blob) {
          // The server broadcasts binary data, which can be received as a Blob
          const buffer = await event.data.arrayBuffer();
          const decompressed = decompressSync(new Uint8Array(buffer));
          const jsonString = strFromU8(decompressed);
          message = JSON.parse(jsonString);
        }
        else if (typeof event.data === 'string') {
          // Fallback for non-compressed string messages
          message = JSON.parse(event.data);
        }
        else {
          console.warn('Received message of unknown type:', event.data);
          return;
        }
      }
      catch (error) {
        console.error('Failed to process incoming message:', error, 'Raw data:', event.data);
        return;
      }

      console.log('message', message);

      // Update lastMessage for backward compatibility
      lastMessage.value = message;

      // Call all registered message handlers
      messageHandlers.forEach((handler) => {
        try {
          handler(message);
        }
        catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    });

    connection.addEventListener('close', () => {
      isConnected.value = false;
    });
  });

  onUnmounted(() => {
    connection?.close();
    messageHandlers.clear();
  });

  function send(data: any): void {
    try {
      const jsonString = JSON.stringify(data);
      const payload = strToU8(jsonString);
      // Using fflate to compress the payload.
      // This returns a Uint8Array, which PartySocket can send as binary.
      const compressed = compressSync(payload);
      connection?.send(compressed);
    }
    catch (error) {
      console.error('Failed to serialize and compress message for sending:', error);
    }
  }

  function onMessage(handler: MessageHandler): () => void {
    messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      messageHandlers.delete(handler);
    };
  }

  return {
    isConnected: readonly(isConnected),
    lastMessage,
    send,
    onMessage,
  };
}
