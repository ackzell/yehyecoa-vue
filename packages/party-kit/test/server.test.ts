import { beforeEach, describe, expect, it } from 'vitest';
import WorkshopParty from '../src/server';
import { asPartyConnection, asPartyRoom, asTestableServer } from './types';
import { createTestMessage, decompressMessage, MockConnection, MockRoom } from './utils';

describe('workshopParty', () => {
  let room: MockRoom;
  let server: WorkshopParty;

  beforeEach(() => {
    room = new MockRoom('test-room');
    server = new WorkshopParty(asPartyRoom(room));
  });

  describe('onConnect', () => {
    it('sends welcome message to new connections', async () => {
      let sentMessage: string | ArrayBuffer | undefined;

      const connection = new MockConnection('test-user', (msg) => {
        sentMessage = msg;
      });

      await server.onConnect(asPartyConnection(connection, room));

      const message = decompressMessage(sentMessage as ArrayBuffer);
      expect(message.type).toBe('system');
      expect(message.code).toBe('WELCOME');
      expect(message.payload.roomId).toBe('test-room');
      expect(message.payload.isInstructorConnected).toBe(false);
    });

    it('handles instructor connection correctly', async () => {
      let welcomeMessage: string | ArrayBuffer | undefined;

      const instructor = new MockConnection('instructor', (msg) => {
        welcomeMessage = msg;
      });

      await server.onConnect(asPartyConnection(instructor, room));

      const message = decompressMessage(welcomeMessage as ArrayBuffer);
      expect(message.type).toBe('system');
      expect(message.code).toBe('WELCOME'); // Instructor receives WELCOME
      expect(message.payload.roomId).toBe('test-room');
      expect(message.payload.isInstructorConnected).toBe(true);
      expect(message.payload.comment).toBe('Welcome to the workshop as instructor!');
    });
  });

  describe('onMessage', () => {
    it('only processes messages from instructor', async () => {
      const regularUser = new MockConnection('test-user');
      const message = createTestMessage('repl', 'FULL_SYNC', { content: 'test' });

      await server.onMessage(message, asPartyConnection(regularUser, room));
      // Verify no state change or broadcasts occurred
      expect(asTestableServer(server).latestRepl).toBeNull();
    });

    it('processes full sync messages correctly', async () => {
      const instructor = new MockConnection('instructor');
      const payload = { files: { 'App.vue': 'content' } };
      const message = createTestMessage('repl', 'FULL_SYNC', payload);

      await server.onMessage(message, asPartyConnection(instructor, room));

      expect(asTestableServer(server).latestRepl?.type).toBe('repl');
      expect(asTestableServer(server).latestRepl?.code).toBe('FULL_SYNC');
      expect(asTestableServer(server).latestRepl?.payload).toEqual(payload);
    });

    it('processes selection messages correctly', async () => {
      const instructor = new MockConnection('instructor');
      const payload = {
        file: 'App.vue',
        selection: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
      };
      const message = createTestMessage('repl', 'SELECTION', payload);

      await server.onMessage(message, asPartyConnection(instructor, room));

      expect(asTestableServer(server).latestSelections?.type).toBe('repl');
      expect(asTestableServer(server).latestSelections?.code).toBe('SELECTION');
      expect(asTestableServer(server).latestSelections?.payload).toEqual(payload);
    });

    it('processes scroll messages correctly', async () => {
      const instructor = new MockConnection('instructor');
      const payload = {
        file: 'App.vue',
        scrollTop: 100,
      };
      const message = createTestMessage('repl', 'SCROLL', payload);

      await server.onMessage(message, asPartyConnection(instructor, room));

      expect(asTestableServer(server).latestScroll?.type).toBe('repl');
      expect(asTestableServer(server).latestScroll?.code).toBe('SCROLL');
      expect(asTestableServer(server).latestScroll?.payload).toEqual(payload);
    });
  });
});
