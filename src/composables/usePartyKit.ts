import type { Ref } from 'vue';

import PartySocket from 'partysocket';
import { onBeforeMount, onUnmounted, readonly, ref } from 'vue';

type PartyBroadcast = {
  isConnected: Ref<boolean>;
  lastMessage: any;
  send: (data: any) => void;
};

export function usePartyKitBroadcast(room = 'test-workshop'): PartyBroadcast {
  let connection: PartySocket | null = null;

  const isConnected = ref(false);
  const lastMessage = ref<any | null>(null);
  const id = sessionStorage.getItem('isInstructor') === 'yes'
    ? 'instructor'
    : `attendee-${crypto.randomUUID().slice(0, 8)}`;

  onBeforeMount(() => {
    connection = new PartySocket({
      host: 'https://party-kit.ackzell.partykit.dev',
      room,
      id,
    });

    connection.addEventListener('open', () => {
      isConnected.value = true;
    });

    connection.addEventListener('message', (event) => {
      console.log('message', event.data);
      lastMessage.value = JSON.parse(event.data);
    });

    connection.addEventListener('close', () => {
      isConnected.value = false;
    });
  });

  onUnmounted(() => {
    connection?.close();
  });

  function send(data: any): void {
    connection?.send(JSON.stringify(data));
  }

  return {
    isConnected: readonly(isConnected),
    lastMessage,
    send,
  };
}
