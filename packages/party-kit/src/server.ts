/* eslint-disable no-console */
import type { AnyMessage, AttendeeMessage, ReplMessage, SystemMessage } from '@calmecac-vue/shared-types';
import type * as Party from 'partykit/server';

import { compressSync, decompressSync, strFromU8, strToU8 } from 'fflate';

export default class WorkshopParty implements Party.Server {
  private latestRepl: ReplMessage | null = null;
  private latestSelections: ReplMessage | null = null;
  private latestScroll: ReplMessage | null = null;
  private isInstructorConnected = false;
  private lastInstructorActivity = 0;

  constructor(readonly room: Party.Room) {
    this.loadState();
  }

  private async loadState(): Promise<void> {
    try {
      type StoredState = {
        latestRepl: ReplMessage | null;
        latestSelections: ReplMessage | null;
        latestScroll: ReplMessage | null;
      };

      const state = await this.room.storage.get<StoredState>('workshopState');
      if (state) {
        const { latestRepl, latestSelections, latestScroll } = state;
        this.latestRepl = latestRepl;
        this.latestSelections = latestSelections;
        this.latestScroll = latestScroll;
        // console.log('[DEBUG] Loaded persisted state:', state);
      }
    }
    catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await this.room.storage.put('workshopState', {
        latestRepl: this.latestRepl,
        latestSelections: this.latestSelections,
        latestScroll: this.latestScroll,
      });
      // console.log('[DEBUG] State persisted successfully');
    }
    catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  private broadcastSystemMessage(message: Omit<SystemMessage, 'timestamp'>, excludeIds?: string[]): void {
    const systemMessage: SystemMessage = {
      ...message,
      timestamp: Date.now(),
    };

    this.room.broadcast(
      compressSync(strToU8(JSON.stringify(systemMessage))),
      excludeIds,
    );
  }

  private sendSystemMessage(conn: Party.Connection, message: Omit<SystemMessage, 'timestamp'>): void {
    const systemMessage: SystemMessage = {
      ...message,
      timestamp: Date.now(),
    };

    conn.send(compressSync(strToU8(JSON.stringify(systemMessage))));
  }

  private broadcastReplMessage(message: Omit<ReplMessage, 'timestamp'>, excludeIds?: string[]): void {
    const replMessage: ReplMessage = {
      ...message,
      timestamp: Date.now(),
    };

    this.room.broadcast(
      compressSync(strToU8(JSON.stringify(replMessage))),
      excludeIds,
    );
  }

  private sendReplMessage(conn: Party.Connection, message: Omit<ReplMessage, 'timestamp'>): void {
    const replMessage: ReplMessage = {
      ...message,
      timestamp: Date.now(),
    };

    conn.send(compressSync(strToU8(JSON.stringify(replMessage))));
  }

  async onConnect(conn: Party.Connection): Promise<void> {
    console.log(`User ${conn.id} connected to room ${this.room.id}`);

    // Update instructor connection state first if this is an instructor
    if (conn.id === 'instructor') {
      this.isInstructorConnected = true;
      this.lastInstructorActivity = Date.now();
    }

    // Send welcome message to all connections (instructor and attendees)
    this.sendSystemMessage(conn, {
      type: 'system',
      code: 'WELCOME',
      payload: {
        roomId: this.room.id,
        isInstructorConnected: this.isInstructorConnected,
        comment: conn.id === 'instructor'
          ? 'Welcome to the workshop as instructor!'
          : 'Welcome to the workshop!',
      },
    });

    if (conn.id === 'instructor') {
      // Notify all attendees that instructor is online
      this.broadcastSystemMessage({
        type: 'system',
        code: 'INSTRUCTOR_CONNECTED',
        payload: {
          comment: 'Instructor is online.',
          isInstructorConnected: true,
        },
      // except the instructor themselves
      }, [conn.id]);
    }

    if (this.latestRepl) {
      console.warn(`[DEBUG] Sending cached REPL state to ${conn.id}`);
      // console.warn('[DEBUG] Cached state content for activeFile:', `${this.latestRepl.payload?.files?.[this.latestRepl.payload?.activeFile]?.substring(0, 100)}...`);
      this.sendReplMessage(conn, {
        type: 'repl',
        code: 'FULL_SYNC',
        id: conn.id,
        payload: this.latestRepl.payload,
      });
      console.warn('[DEBUG] Sent state:', JSON.stringify(this.latestRepl.payload, null, 2));
    }
    else {
      // console.warn(`[DEBUG] No cached REPL state available for ${conn.id}`);
    }

    if (this.latestSelections) {
      console.log(`Sending cached selections to ${conn.id}`);
      this.sendReplMessage(conn, {
        type: 'repl',
        code: 'SELECTION',
        id: conn.id,
        payload: this.latestSelections.payload,
      });
    }

    if (this.latestScroll) {
      console.log(`Sending cached scroll to ${conn.id}`);
      this.sendReplMessage(conn, {
        type: 'repl',
        code: 'SCROLL',
        id: conn.id,
        payload: this.latestScroll.payload,
      });
    }
  }

  async onMessage(message: string | ArrayBuffer, sender: Party.Connection): Promise<void> {
    let parsed: AnyMessage | AttendeeMessage;
    try {
      if (message instanceof ArrayBuffer) {
        const decompressed = decompressSync(new Uint8Array(message));
        parsed = JSON.parse(strFromU8(decompressed));
      }
      else {
        parsed = JSON.parse(message);
      }
    }
    catch {
      return;
    }

    this.lastInstructorActivity = Date.now();

    if (!parsed || !parsed.type || !parsed.code) {
      return;
    }

    if (parsed.type !== 'repl') {
      // log and ignore unknown message types
      console.error('Unknown message type received from instructor:', parsed.type);
      console.error('Ignoring message:', JSON.stringify(parsed, null, 2));

      return;
    }

    switch (parsed.code) {
      case 'FULL_SYNC':
        // console.warn('[DEBUG] Instructor sent FULL_SYNC, updating cache');
        // console.warn('[DEBUG] New content for activeFile:', `${parsed.payload?.files?.[parsed.payload?.activeFile]?.substring(0, 100)}...`);
        this.latestRepl = {
          type: 'repl',
          code: 'FULL_SYNC',
          id: 'instructor',
          payload: parsed.payload,
          timestamp: Date.now(),
        };
        await this.saveState();
        this.broadcastReplMessage({
          type: 'repl',
          code: 'FULL_SYNC',
          id: 'instructor',
          payload: parsed.payload,
        }, [sender.id]);
        break;

      case 'CONTENT':
        // console.warn('[DEBUG] Instructor sent CONTENT update, updating cache');
        // console.warn('[DEBUG] Updating file:', parsed.payload?.filename);

        // Update the cached state with the new content
        if (this.latestRepl && this.latestRepl.payload?.files) {
          this.latestRepl.payload.files[parsed.payload.filename] = parsed.payload.content;
          await this.saveState();
          // console.warn('[DEBUG] Cache updated for file:', parsed.payload.filename);
        }
        else {
          // console.warn('[DEBUG] No cached state to update, CONTENT ignored');
        }

        this.broadcastReplMessage({
          type: 'repl',
          code: 'CONTENT',
          id: 'instructor',
          payload: parsed.payload,
        }, [sender.id]);
        break;

      case 'SELECTION':
        this.latestSelections = {
          type: 'repl',
          code: 'SELECTION',
          id: 'instructor',
          payload: parsed.payload,
          timestamp: Date.now(),
        };
        await this.saveState();
        this.broadcastReplMessage({
          type: 'repl',
          code: 'SELECTION',
          id: 'instructor',
          payload: parsed.payload,
        }, [sender.id]);
        break;

      case 'SCROLL':
        this.latestScroll = {
          type: 'repl',
          code: 'SCROLL',
          id: 'instructor',
          payload: parsed.payload,
          timestamp: Date.now(),
        };
        await this.saveState();
        this.broadcastReplMessage({
          type: 'repl',
          code: 'SCROLL',
          id: 'instructor',
          payload: parsed.payload,
        }, [sender.id]);
        break;

      case 'REQUEST_FULL_SYNC':
        if (this.latestRepl) {
          console.warn(`[DEBUG] Attendee ${sender.id} requested FULL_SYNC, sending cached state`);
          this.sendReplMessage(sender, {
            type: 'repl',
            code: 'FULL_SYNC',
            id: sender.id,
            payload: this.latestRepl.payload,
          });
        }

        if (this.latestSelections) {
          console.log(`Sending cached selections to ${sender.id}`);
          this.sendReplMessage(sender, {
            type: 'repl',
            code: 'SELECTION',
            id: sender.id,
            payload: this.latestSelections.payload,
          });
        }

        if (this.latestScroll) {
          console.log(`Sending cached scroll to ${sender.id}`);
          this.sendReplMessage(sender, {
            type: 'repl',
            code: 'SCROLL',
            id: sender.id,
            payload: this.latestScroll.payload,
          });
        }
        break;
    }
  }

  async onClose(conn: Party.Connection): Promise<void> {
    if (conn.id === 'instructor') {
      this.isInstructorConnected = false;

      // Notify attendees instructor disconnected
      this.broadcastSystemMessage({
        type: 'system',
        code: 'INSTRUCTOR_DISCONNECTED',
        payload: {
          isInstructorConnected: this.isInstructorConnected,
          comment: 'Instructor is offline.',
        },
      });
    }

    console.log(`User ${conn.id} disconnected`);
  }

  // HTTP endpoint for room status: GET /status
  onRequest(req: Party.Request): Response | Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'GET' && url.pathname.endsWith('/status')) {
      return new Response(
        JSON.stringify({
          isInstructorConnected: this.isInstructorConnected,
          hasCachedState: !!this.latestRepl,
          lastInstructorActivity: this.lastInstructorActivity,
          roomId: this.room.id,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        },
      );
    }
    // Handle CORS preflight
    if (req.method === 'OPTIONS' && url.pathname.endsWith('/status')) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    return new Response('Not found', { status: 404 });
  }
}
