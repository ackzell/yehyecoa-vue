import { beforeEach, describe, expect, it } from 'vitest';
import WorkshopParty from '../src/server';
import { asPartyConnection, asPartyRoom } from './types';
import { decompressMessage, MockConnection, MockRoom } from './utils';

describe('connection handling', () => {
  let room: MockRoom;
  let server: WorkshopParty;

  beforeEach(() => {
    room = new MockRoom('test-room');
    server = new WorkshopParty(asPartyRoom(room));
  });

  it('sends welcome message to new connections', async () => {
    let sentMessage: string | ArrayBuffer | undefined;
    const connection = new MockConnection('user1', (msg) => {
      sentMessage = msg;
    });

    await server.onConnect(asPartyConnection(connection, room));
    expect(sentMessage).toBeDefined();

    const message = decompressMessage(sentMessage as ArrayBuffer);
    expect(message.type).toBe('system');
    expect(message.code).toBe('WELCOME');
    expect(message.payload.roomId).toBe('test-room');
    expect(message.payload.isInstructorConnected).toBe(false);
  });

  it('handles instructor connection correctly', async () => {
    let systemMessage: string | ArrayBuffer | undefined;
    const instructor = new MockConnection('instructor', (msg) => {
      systemMessage = msg;
    });

    await server.onConnect(asPartyConnection(instructor, room));
    expect(systemMessage).toBeDefined();

    const message = decompressMessage(systemMessage as ArrayBuffer);
    expect(message.type).toBe('system');
    expect(message.code).toBe('WELCOME'); // Instructor now gets WELCOME message
    expect(message.payload.roomId).toBe('test-room');
    expect(message.payload.isInstructorConnected).toBe(true);
    expect(message.payload.comment).toBe('Welcome to the workshop as instructor!');
  });

  it('handles late joiners by sending cached state', async () => {
    // First, instructor connects and sends state
    const instructor = new MockConnection('instructor');
    await server.onConnect(asPartyConnection(instructor, room));

    const fullSyncPayload = {
      files: { 'App.vue': 'export default {}' },
    };

    await server.onMessage(
      JSON.stringify({
        type: 'repl',
        code: 'FULL_SYNC',
        payload: fullSyncPayload,
      }),
      asPartyConnection(instructor, room),
    );

    // Connect with a new user
    const receivedMessages: (string | ArrayBuffer)[] = [];
    const lateJoiner = new MockConnection('user2', (msg) => {
      receivedMessages.push(msg);
    });

    await server.onConnect(asPartyConnection(lateJoiner, room));

    // Should receive messages (welcome + cached state)
    expect(receivedMessages.length).toBeGreaterThan(1);

    const decompressedMessages = receivedMessages
      .filter(msg => typeof msg !== 'string')
      .map(msg => decompressMessage(msg as ArrayBuffer | Uint8Array));

    // Should have at least one message
    expect(decompressedMessages.length).toBeGreaterThan(0);

    // Find the full sync message (cached state)
    const syncMessage = decompressedMessages.find(msg => msg.type === 'repl' && msg.code === 'FULL_SYNC');
    expect(syncMessage).toBeDefined();
    expect(syncMessage?.payload).toEqual(fullSyncPayload);
  });

  it('handles attendee joining before instructor', async () => {
    // Step 1: Attendee joins first (no instructor yet)
    const attendeeMessages: (string | ArrayBuffer)[] = [];
    const attendee = new MockConnection('attendee1', (msg) => {
      attendeeMessages.push(msg);
    });

    await server.onConnect(asPartyConnection(attendee, room));

    // Attendee should get welcome message but no REPL state
    expect(attendeeMessages.length).toBe(1);
    const welcomeMessage = decompressMessage(attendeeMessages[0] as ArrayBuffer);
    expect(welcomeMessage.type).toBe('system');
    expect(welcomeMessage.code).toBe('WELCOME');
    expect(welcomeMessage.payload.isInstructorConnected).toBe(false);

    // Reset to capture new messages
    attendeeMessages.length = 0;

    // Step 2: Instructor joins
    const instructor = new MockConnection('instructor');
    await server.onConnect(asPartyConnection(instructor, room));

    // Attendee should receive instructor connected notification
    expect(attendeeMessages.length).toBe(1);
    const instructorConnectedMessage = decompressMessage(attendeeMessages[0] as ArrayBuffer);
    expect(instructorConnectedMessage.type).toBe('system');
    expect(instructorConnectedMessage.code).toBe('INSTRUCTOR_CONNECTED');

    // Reset to capture REPL messages
    attendeeMessages.length = 0;

    // Step 3: Instructor sends initial REPL state
    const initialReplState = {
      files: { 'App.vue': 'export default { message: "Hello Workshop!" }' },
      activeFile: 'App.vue',
    };

    await server.onMessage(
      JSON.stringify({
        type: 'repl',
        code: 'FULL_SYNC',
        payload: initialReplState,
      }),
      asPartyConnection(instructor, room),
    );

    // Step 4: Attendee should receive the instructor's REPL state
    expect(attendeeMessages.length).toBe(1);
    const replMessage = decompressMessage(attendeeMessages[0] as ArrayBuffer);
    expect(replMessage.type).toBe('repl');
    expect(replMessage.code).toBe('FULL_SYNC');
    expect(replMessage.payload).toEqual(initialReplState);

    // Reset for next test
    attendeeMessages.length = 0;

    // Step 5: Instructor makes subsequent changes
    const updatedState = {
      files: {
        'App.vue': 'export default { message: "Updated!" }',
        'components/Button.vue': '<template><button>Click me</button></template>',
      },
      activeFile: 'components/Button.vue',
    };

    await server.onMessage(
      JSON.stringify({
        type: 'repl',
        code: 'FULL_SYNC',
        payload: updatedState,
      }),
      asPartyConnection(instructor, room),
    );

    // Attendee should receive the update
    expect(attendeeMessages.length).toBe(1);
    const updateMessage = decompressMessage(attendeeMessages[0] as ArrayBuffer);
    expect(updateMessage.type).toBe('repl');
    expect(updateMessage.code).toBe('FULL_SYNC');
    expect(updateMessage.payload).toEqual(updatedState);

    // Step 6: Simulate attendee reconnecting (new connection)
    const reconnectedAttendee = new MockConnection('attendee2', (msg) => {
      attendeeMessages.push(msg);
    });

    // Reset to capture reconnection messages
    attendeeMessages.length = 0;

    await server.onConnect(asPartyConnection(reconnectedAttendee, room));

    // Should receive welcome + cached state immediately
    expect(attendeeMessages.length).toBe(2);

    const messages = attendeeMessages.map(msg => decompressMessage(msg as ArrayBuffer));

    // First message: welcome
    expect(messages[0].type).toBe('system');
    expect(messages[0].code).toBe('WELCOME');
    expect(messages[0].payload.isInstructorConnected).toBe(true);

    // Second message: cached REPL state (latest state from instructor)
    expect(messages[1].type).toBe('repl');
    expect(messages[1].code).toBe('FULL_SYNC');
    expect(messages[1].payload).toEqual(updatedState);
  });

  it('maintains instructor connection state', async () => {
    const instructor = new MockConnection('instructor');
    await server.onConnect(asPartyConnection(instructor, room));

    // Instructor should be marked as connected
    expect((server as any).isInstructorConnected).toBe(true);

    await server.onClose(asPartyConnection(instructor, room));

    // Instructor should no longer be connected
    expect((server as any).isInstructorConnected).toBe(false);
  });
});
