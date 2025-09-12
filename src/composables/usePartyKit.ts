import type { Ref } from 'vue';

import PartySocket from 'partysocket';
import { onBeforeMount, onUnmounted, readonly, ref } from 'vue';

type MessageHandler = (message: any) => void;

type PartyBroadcast = {
  isConnected: Ref<boolean>;
  lastMessage: any;
  send: (data: any) => void;
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

    connection.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
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
    connection?.send(JSON.stringify(data));
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
