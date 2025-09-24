import type { AttendeeMessage, ReplMessage, SystemMessage } from '@calmecac-vue/shared-types';
import { compressSync, decompressSync, strFromU8, strToU8 } from 'fflate';

// Create a minimal mock that only implements what we need for testing
export class MockConnection {
  private _state: any = {};

  constructor(
    public readonly id: string,
    private readonly onSendCallback?: (message: string | ArrayBuffer) => void,
  ) {}

  get state(): any {
    return this._state;
  }

  get uri(): string {
    return 'mock://test';
  }

  send(message: string | ArrayBuffer): void {
    this.onSendCallback?.(message);
  }

  setState(state: unknown): any {
    this._state = state;
    return this._state;
  }
}

export class MockRoom {
  private _storage = new Map<string, any>();
  private _connections = new Map<string, MockConnection>();

  constructor(
    public readonly id: string,
    public readonly internalID: string = `internal-${id}`,
  ) {}

  get storage(): {
    get: <T>(key: string) => Promise<T | undefined>;
    put: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<boolean>;
  } {
    return {
      get: async <T>(key: string) => this._storage.get(key) as T | undefined,
      put: async (key: string, value: any) => {
        this._storage.set(key, value);
      },
      delete: async (key: string) => {
        const existed = this._storage.has(key);
        this._storage.delete(key);
        return existed;
      },
    };
  }

  broadcast(message: string | ArrayBuffer, skipIds?: string[]): void {
    Array.from(this._connections.values())
      .filter(conn => !skipIds?.includes(conn.id))
      .forEach(conn => conn.send(message));
  }

  public addConnection(connection: MockConnection): void {
    this._connections.set(connection.id, connection);
  }

  public removeConnection(connectionId: string): void {
    this._connections.delete(connectionId);
  }

  // Helper method to automatically register a connection when onConnect is called
  public autoRegisterConnection(connection: MockConnection): void {
    this.addConnection(connection);
  }
}

export function compressMessage(message: any): ArrayBuffer {
  const compressed = compressSync(strToU8(JSON.stringify(message)));
  // Create a proper ArrayBuffer from the Uint8Array
  const arrayBuffer = new ArrayBuffer(compressed.length);
  const view = new Uint8Array(arrayBuffer);
  view.set(compressed);
  return arrayBuffer;
}

export function decompressMessage(message: ArrayBuffer | Uint8Array): any {
  const uint8Array = message instanceof Uint8Array ? message : new Uint8Array(message);
  return JSON.parse(strFromU8(decompressSync(uint8Array)));
}

export function createTestMessage(
  type: ReplMessage['type'] | SystemMessage['type'] = 'repl',
  code: AttendeeMessage['code'] | ReplMessage['code'] | SystemMessage['code'] = 'FULL_SYNC',
  payload: ReplMessage['payload'] | SystemMessage['payload'] = {},
): ArrayBuffer {
  return compressMessage({
    type,
    code,
    id: 'test-id',
    payload,
    timestamp: Date.now(),
  });
}
