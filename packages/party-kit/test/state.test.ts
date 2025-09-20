import { beforeEach, describe, expect, it } from 'vitest';
import WorkshopParty from '../src/server';
import { asPartyConnection, asPartyRoom, asTestableServer } from './types';
import { decompressMessage, MockConnection, MockRoom } from './utils';

describe('state management', () => {
  let room: MockRoom;
  let server: WorkshopParty;

  beforeEach(() => {
    room = new MockRoom('test-room');
    server = new WorkshopParty(asPartyRoom(room));
  });

  it('loads persisted state on initialization', async () => {
    const initialState = {
      latestRepl: {
        type: 'full_sync' as const,
        id: 'instructor',
        payload: { files: { 'App.vue': 'content' } },
        timestamp: Date.now(),
      },
      latestSelections: null,
      latestScroll: null,
    };

    // Manually set state in storage
    await room.storage.put('workshopState', initialState);

    // Create new server instance that should load the state
    const newServer = new WorkshopParty(asPartyRoom(room));
    await new Promise(resolve => setTimeout(resolve, 100)); // Allow async state load

    expect(asTestableServer(newServer).latestRepl).toEqual(initialState.latestRepl);
  });

  it('persists state changes', async () => {
    const instructor = new MockConnection('instructor');
    await server.onConnect(asPartyConnection(instructor));

    const fullSyncMessage = {
      type: 'full_sync',
      payload: { files: { 'App.vue': 'new content' } },
      timestamp: Date.now(),
    };

    await server.onMessage(
      JSON.stringify(fullSyncMessage),
      asPartyConnection(instructor),
    );

    // Verify state was saved
    const savedState = await room.storage.get('workshopState') as any;
    expect(savedState).toBeDefined();
    expect(savedState.latestRepl.type).toBe('repl');
    expect(savedState.latestRepl.code).toBe('FULL_SYNC');
    expect(savedState.latestRepl.payload).toEqual(fullSyncMessage.payload);
  });

  it('sends cached state to new connections', async () => {
    // First set up some state
    const instructor = new MockConnection('instructor');
    await server.onConnect(asPartyConnection(instructor, room));

    const initialState = {
      type: 'full_sync',
      payload: { files: { 'App.vue': 'initial content' } },
      timestamp: Date.now(),
    };

    await server.onMessage(
      JSON.stringify(initialState),
      asPartyConnection(instructor, room),
    );

    // Connect new user
    const receivedMessages: (string | ArrayBuffer)[] = [];
    const newUser = new MockConnection('user1', (msg) => {
      receivedMessages.push(msg);
    });

    await server.onConnect(asPartyConnection(newUser, room));

    // Should receive cached state
    const decompressedMessages = receivedMessages
      .filter(msg => typeof msg !== 'string')
      .map(msg => decompressMessage(msg as ArrayBuffer | Uint8Array));

    const stateMessage = decompressedMessages.find(m => m.type === 'repl' && m.code === 'FULL_SYNC');
    expect(stateMessage).toBeDefined();
    expect(stateMessage?.payload).toEqual(initialState.payload);
  });

  it('broadcasts state changes to all connections', async () => {
    // Set up instructor and attendee
    const instructor = new MockConnection('instructor');
    await server.onConnect(asPartyConnection(instructor, room));

    let receivedMessage: string | ArrayBuffer | undefined;
    const attendee = new MockConnection('user1', (msg) => {
      // Only capture the latest message (after system message)
      receivedMessage = msg;
    });
    await server.onConnect(asPartyConnection(attendee, room));

    // Send state update from instructor
    const stateUpdate = {
      type: 'full_sync',
      payload: { files: { 'App.vue': 'updated content' } },
      timestamp: Date.now(),
    };

    await server.onMessage(
      JSON.stringify(stateUpdate),
      asPartyConnection(instructor, room),
    );

    // Verify attendee received update
    expect(receivedMessage).toBeDefined();
    const message = decompressMessage(receivedMessage! as ArrayBuffer);
    expect(message.type).toBe('repl');
    expect(message.code).toBe('FULL_SYNC');
    expect(message.payload).toEqual(stateUpdate.payload);
  });
});
