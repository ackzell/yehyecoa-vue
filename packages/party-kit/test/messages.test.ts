import { beforeEach, describe, expect, it } from 'vitest';
import WorkshopParty from '../src/server';
import { asPartyConnection, asPartyRoom } from './types';
import { decompressMessage, MockConnection, MockRoom } from './utils';

describe('message handling', () => {
  let server: WorkshopParty;
  let room: MockRoom;
  let instructor: MockConnection;
  let attendee: MockConnection;
  let receivedMessage: ArrayBuffer | undefined;

  beforeEach(() => {
    room = new MockRoom('test-room');
    server = new WorkshopParty(asPartyRoom(room));
    instructor = new MockConnection('instructor');
    attendee = new MockConnection('attendee');
    receivedMessage = undefined;

    // Set up message capture
    attendee.send = (message: ArrayBuffer) => {
      receivedMessage = message;
    };
  });

  describe('full sync messages', () => {
    it('processes and broadcasts full sync from instructor', async () => {
      await server.onConnect(asPartyConnection(instructor, room));
      await server.onConnect(asPartyConnection(attendee, room));

      const fullSyncPayload = {
        files: { 'App.vue': 'test content' },
        activeFile: 'App.vue',
        editorStates: {},
      };

      await server.onMessage(
        JSON.stringify({
          type: 'repl',
          code: 'FULL_SYNC',
          payload: fullSyncPayload,
        }),
        asPartyConnection(instructor, room),
      );

      expect(receivedMessage).toBeDefined();
      const message = decompressMessage(receivedMessage!);
      expect(message.type).toBe('repl');
      expect(message.code).toBe('FULL_SYNC');
      expect(message.payload).toEqual(fullSyncPayload);
    });

    it('ignores full sync from non-instructor', async () => {
      await server.onConnect(asPartyConnection(attendee, room));

      // Reset after system message from connection
      receivedMessage = undefined;

      const fullSyncPayload = {
        files: { 'App.vue': 'test content' },
        activeFile: 'App.vue',
        editorStates: {},
      };

      await server.onMessage(
        JSON.stringify({
          type: 'repl',
          code: 'FULL_SYNC',
          payload: fullSyncPayload,
        }),
        asPartyConnection(attendee, room),
      );

      expect(receivedMessage).toBeUndefined();
    });
  });

  describe('selection messages', () => {
    it('processes and broadcasts selection updates from instructor', async () => {
      await server.onConnect(asPartyConnection(instructor, room));
      await server.onConnect(asPartyConnection(attendee, room));

      const selectionPayload = {
        filename: 'App.vue',
        selection: { startLineNumber: 1, startColumn: 1 },
      };

      await server.onMessage(
        JSON.stringify({
          type: 'repl',
          code: 'SELECTION',
          payload: selectionPayload,
        }),
        asPartyConnection(instructor, room),
      );

      expect(receivedMessage).toBeDefined();
      const message = decompressMessage(receivedMessage!);
      expect(message.type).toBe('repl');
      expect(message.code).toBe('SELECTION');
      expect(message.payload).toEqual(selectionPayload);
    });

    it('ignores selection updates from non-instructor', async () => {
      await server.onConnect(asPartyConnection(attendee, room));

      // Reset after system message from connection
      receivedMessage = undefined;

      const selectionPayload = {
        filename: 'App.vue',
        selection: { startLineNumber: 1, startColumn: 1 },
      };

      await server.onMessage(
        JSON.stringify({
          type: 'repl',
          code: 'SELECTION',
          payload: selectionPayload,
        }),
        asPartyConnection(attendee, room),
      );

      expect(receivedMessage).toBeUndefined();
    });
  });

  describe('scroll messages', () => {
    it('processes and broadcasts scroll updates from instructor', async () => {
      await server.onConnect(asPartyConnection(instructor, room));
      await server.onConnect(asPartyConnection(attendee, room));

      const scrollPayload = {
        filename: 'App.vue',
        scrollTop: 100,
      };

      await server.onMessage(
        JSON.stringify({
          type: 'repl',
          code: 'SCROLL',
          payload: scrollPayload,
        }),
        asPartyConnection(instructor, room),
      );

      expect(receivedMessage).toBeDefined();
      const message = decompressMessage(receivedMessage!);
      expect(message.type).toBe('repl');
      expect(message.code).toBe('SCROLL');
      expect(message.payload).toEqual(scrollPayload);
    });

    it('ignores scroll updates from non-instructor', async () => {
      await server.onConnect(asPartyConnection(attendee, room));

      // Reset after system message from connection
      receivedMessage = undefined;

      const scrollPayload = {
        filename: 'App.vue',
        scrollTop: 100,
      };

      await server.onMessage(
        JSON.stringify({
          type: 'repl',
          code: 'SCROLL',
          payload: scrollPayload,
        }),
        asPartyConnection(attendee, room),
      );

      expect(receivedMessage).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('handles invalid JSON messages gracefully', async () => {
      await server.onConnect(asPartyConnection(instructor, room));
      await server.onConnect(asPartyConnection(attendee, room));

      // Reset after system messages from connections
      receivedMessage = undefined;

      await server.onMessage(
        'invalid json',
        asPartyConnection(instructor, room),
      );

      expect(receivedMessage).toBeUndefined();
    });

    it('ignores unknown message types from instructor', async () => {
      await server.onConnect(asPartyConnection(instructor, room));
      await server.onConnect(asPartyConnection(attendee, room));

      // Reset after system messages from connections
      receivedMessage = undefined;

      await server.onMessage(
        JSON.stringify({
          type: 'unknown',
          code: 'UNKNOWN_CODE',
          payload: { data: 'test' },
        }),
        asPartyConnection(instructor, room),
      );

      expect(receivedMessage).toBeUndefined();
    });
  });
});
