import type * as Party from 'partykit/server';
import type { MockConnection, MockRoom } from './utils';

// Type-safe interfaces for testing
export type TestableServer = {
  latestRepl: any;
  latestSelections: any;
  latestScroll: any;
  isInstructorConnected: boolean;
  onConnect: (conn: MockConnection) => Promise<void>;
  onMessage: (message: string | ArrayBuffer, sender: MockConnection) => Promise<void>;
  onClose: (conn: MockConnection) => Promise<void>;
  room: MockRoom; // Add room access for testing
};

// Type guard to check if server has testable properties
export function asTestableServer(server: Party.Server): TestableServer {
  return server as unknown as TestableServer;
}

// Type guard for mock connections with auto-registration
export function asPartyConnection(mock: MockConnection, room?: MockRoom): Party.Connection {
  if (room) {
    room.autoRegisterConnection(mock);
  }
  return mock as any as Party.Connection;
}

// Type guard for mock rooms
export function asPartyRoom(mock: MockRoom): Party.Room {
  return mock as any as Party.Room;
}
