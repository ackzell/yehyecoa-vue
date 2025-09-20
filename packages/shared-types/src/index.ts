// Import Monaco types for internal use in our shared types
import type * as Monaco from 'monaco-editor-core';

// Collaboration Message Types
export type ReplMessage = {
  type: 'repl';
  code: 'FULL_SYNC' | 'CONTENT' | 'SELECTION' | 'SCROLL';
  id: string;
  payload: any;
  timestamp: number;
};

export type SystemMessage = {
  type: 'system';
  code: 'WELCOME' | 'INSTRUCTOR_CONNECTED' | 'INSTRUCTOR_DISCONNECTED';
  payload: any;
  timestamp: number;
};

export type AnyMessage = ReplMessage | SystemMessage;

// Specific payload types using Monaco types internally
export type FullSyncPayload = {
  files: Record<string, string>;
  activeFile: string;
  editorStates?: Record<string, Monaco.editor.ICodeEditorViewState | null>;
};

export type ContentPayload = {
  filename: string;
  content: string;
};

export type SelectionPayload = {
  filename: string;
  selections: Monaco.ISelection[] | null;
};

export type ScrollPayload = {
  filename: string;
  scrollTop: number;
  scrollLeft: number;
};

// Map message codes to their payload types
export type ReplMessagePayloads = {
  FULL_SYNC: FullSyncPayload;
  CONTENT: ContentPayload;
  SELECTION: SelectionPayload;
  SCROLL: ScrollPayload;
};

export type SystemMessagePayloads = {
  WELCOME: {
    roomId: string;
    isInstructorConnected: boolean;
    comment: string;
  };
  INSTRUCTOR_CONNECTED: {
    comment: string;
    isInstructorConnected: boolean;
  };
  INSTRUCTOR_DISCONNECTED: {
    isInstructorConnected: boolean;
    comment: string;
  };
};
