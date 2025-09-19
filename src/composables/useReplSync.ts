import type { ReplStore } from '@calmecac-vue/repl';

import { useDebounceFn } from '@vueuse/core';
import * as MonacoCore from 'monaco-editor-core';
import { onMounted, watch } from 'vue';

import { useToastsStore } from '@/components/toasts/useToastsStore';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { usePartyKitStore } from '@/composables/usePartyKitStore';

// Message types matching the refactored server
type ReplMessage = {
  type: 'repl';
  code: 'FULL_SYNC' | 'CONTENT' | 'SELECTION' | 'SCROLL';
  id: string;
  payload: any;
  timestamp: number;
};

type SystemMessage = {
  type: 'system';
  code: 'WELCOME' | 'INSTRUCTOR_CONNECTED' | 'INSTRUCTOR_DISCONNECTED';
  payload: any;
  timestamp: number;
};

// Specific payload types for type safety
type FullSyncPayload = {
  files: Record<string, string>;
  activeFile: string;
  editorStates?: Record<string, MonacoCore.editor.ICodeEditorViewState | null>;
};

type ContentPayload = {
  filename: string;
  content: string;
};

type SelectionPayload = {
  filename: string;
  selections: MonacoCore.ISelection[] | null;
};

type ScrollPayload = {
  filename: string;
  scrollTop: number;
  scrollLeft: number;
};

type AnyMessage = ReplMessage | SystemMessage;

export function useReplSync(): void {
  const fm = useFileManagerStore();
  const pks = usePartyKitStore();
  const { toast } = useToastsStore();

  let instructorDecorations: string[] = [];
  let lastInstructorSelections: MonacoCore.ISelection[] = [];

  function sendReplMessage(code: ReplMessage['code'], payload: any): void {
    pks.send<ReplMessage>({
      type: 'repl',
      code,
      id: 'instructor',
      payload,
      timestamp: Date.now(),
    });
  }

  function sendFullSync(): void {
    const files: Record<string, string> = {};
    const editorStates: Record<string, MonacoCore.editor.ICodeEditorViewState | null> = {};

    for (const filename in fm.replStore.files) {
      const file = fm.replStore.files[filename];
      files[filename] = file.code;
      editorStates[filename] = file.editorViewState;
    }

    const payload: FullSyncPayload = {
      files,
      activeFile: fm.replStore.activeFilename,
      editorStates,
    };

    console.warn('[DEBUG] Instructor sending full sync:', {
      filesSending: Object.keys(files),
      activeFile: payload.activeFile,
      fileSizes: Object.entries(files).map(([name, content]) => ({ name, size: content.length })),
      activeFileContent: `${files[payload.activeFile]?.substring(0, 100)}...`, // First 100 chars of active file
    });

    sendReplMessage('FULL_SYNC', payload);
  }

  onMounted(() => {
    const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';
    const editor = fm.replStore.editor;

    if (!editor) {
      console.error('REPL editor instance not found for sync.');
      return;
    }

    pks.onMessage(async (message: AnyMessage) => {
      // Ignore system messages for now
      if (message.type === 'system') {
        return;
      }

      // Ignore instructor's own messages
      if (message.id === 'instructor' && isInstructor) {
        return;
      }

      switch (message.code) {
        case 'FULL_SYNC':
          await handleFullSync(message.payload);
          break;

        case 'CONTENT':
          await handleContentUpdate(message.payload);
          break;

        case 'SELECTION':
          handleSelectionUpdate(message.payload);
          break;

        case 'SCROLL':
          handleScrollUpdate(message.payload);
          break;
      }
    });

    if (isInstructor) {
      setupInstructorHandlers(fm.replStore, editor);

      // Watch for store readiness and connection state
      watch([
        () => pks.isConnected,
        () => Object.keys(fm.replStore.files).length, // Only watch file count, not content
        () => fm.replStore.activeFilename, // Only watch filename, not the file object
      ], ([isConnected, fileCount, activeFilename]) => {
        if (isConnected && fileCount > 0 && activeFilename) {
          console.warn('[DEBUG] Instructor state ready, sending sync...', {
            filesCount: fileCount,
            activeFile: activeFilename,
          });
          sendFullSync();
        }
      }, { immediate: true }); // Removed deep: true since we're not watching objects
    }
    else {
      console.warn('ATTENDEE, receiving instructor updates...');
    }

    async function handleFullSync(payload: FullSyncPayload): Promise<void> {
      try {
        console.warn('[DEBUG] Handling full sync from instructor...', {
          filesReceived: Object.keys(payload.files || {}),
          activeFile: payload.activeFile,
          editorStatesReceived: payload.editorStates ? Object.keys(payload.editorStates) : [],
          activeFileContent: `${payload.files[payload.activeFile]?.substring(0, 100)}...`, // First 100 chars of active file
        });

        if (!payload.files || !payload.activeFile) {
          console.error('Invalid sync payload received:', payload);
          return;
        }

        // Use applyFullState for efficient state application
        await fm.replStore.applyFullState(payload.files, payload.activeFile);

        console.warn('[DEBUG] State applied, current files:', Object.keys(fm.replStore.files));
        console.warn('[DEBUG] Active file content after sync:', `${fm.replStore.files[payload.activeFile]?.code?.substring(0, 100)}...`);

        // Restore editor view states if available
        if (payload.editorStates) {
          for (const [filename, viewState] of Object.entries(payload.editorStates)) {
            const file = fm.replStore.files[filename];
            if (file && viewState) {
              file.editorViewState = viewState;
            }
          }

          // Restore active editor view state
          const activeFile = fm.replStore.files[payload.activeFile];
          if (activeFile?.editorViewState && editor) {
            setTimeout(() => {
              try {
                editor.restoreViewState(activeFile.editorViewState!);
              }
              catch (error) {
                console.warn('Could not restore editor view state:', error);
              }
            }, 100);
          }
        }

        console.warn('[DEBUG] Full sync completed successfully');
      }
      catch (error) {
        console.error('Error during full sync:', error);
        toast.error('Failed to synchronize with instructor');
      }
    }

    async function handleContentUpdate(payload: ContentPayload): Promise<void> {
      try {
        // Check if file exists first
        if (!fm.replStore.files[payload.filename]) {
          console.warn(`File ${payload.filename} does not exist, requesting full sync`);
          // Could send a request for full sync here, but for now just warn
          return;
        }

        const success = fm.replStore.updateFileContent(payload.filename, payload.content);
        if (!success) {
          console.warn(`Failed to update file: ${payload.filename}`);
        }
      }
      catch (error) {
        console.error('Error during content update:', error);
        toast.error('Failed to update file content');
      }
    }

    function handleSelectionUpdate(payload: SelectionPayload): void {
      if (!editor || !editor.getModel()) {
        return;
      }

      // Only apply if we're viewing the same file
      if (payload.filename !== fm.replStore.activeFile?.filename) {
        return;
      }

      if (payload.selections) {
        lastInstructorSelections = payload.selections;
        paintInstructorSelections(editor, lastInstructorSelections);

        // Hook for repainting on model changes
        if (!(editor as any)._instructorRepaintHooked) {
          editor.onDidChangeModel(() => {
            if (lastInstructorSelections.length > 0) {
              paintInstructorSelections(editor, lastInstructorSelections);
            }
          });
          editor.onDidChangeModelContent(() => {
            if (lastInstructorSelections.length > 0) {
              paintInstructorSelections(editor, lastInstructorSelections);
            }
          });
          (editor as any)._instructorRepaintHooked = true;
        }
      }
    }

    function handleScrollUpdate(payload: ScrollPayload): void {
      if (!editor || !editor.getModel()) {
        return;
      }

      // Only apply if we're viewing the same file
      if (payload.filename !== fm.replStore.activeFile?.filename) {
        return;
      }

      editor.setScrollTop(payload.scrollTop);
      editor.setScrollLeft(payload.scrollLeft);
    }
  });

  function setupInstructorHandlers(
    store: ReplStore,
    editor: MonacoCore.editor.IStandaloneCodeEditor,
  ): void {
    console.warn('INSTRUCTOR, setting up REPL sync...');

    // Track file changes for CONTENT messages
    const fileContents = new Map<string, string>();

    function initializeFileContents(): void {
      fileContents.clear();
      for (const filename in store.files) {
        fileContents.set(filename, store.files[filename].code);
      }
    }

    initializeFileContents();

    // Watch for file content changes (avoiding editorViewState triggers)
    watch(() => {
      // Create a simple object with just filenames and content to avoid deep watching editorViewState
      const fileContentsOnly: Record<string, string> = {};
      for (const [filename, file] of Object.entries(store.files)) {
        fileContentsOnly[filename] = file.code;
      }
      return fileContentsOnly;
    }, (newFileContents, oldFileContents) => {
      if (!oldFileContents) {
        // Initial load - initialize tracking
        for (const [filename, content] of Object.entries(newFileContents)) {
          fileContents.set(filename, content);
        }
        return;
      }

      // Check for content changes
      for (const [filename, newContent] of Object.entries(newFileContents)) {
        const oldContent = oldFileContents[filename];

        if (oldContent !== newContent) {
          // Send CONTENT update for changed files
          const payload: ContentPayload = {
            filename,
            content: newContent,
          };
          sendReplMessage('CONTENT', payload);
          fileContents.set(filename, newContent);
        }
      }

      // Handle new files by sending full sync (file creation is complex)
      const currentFilenames = new Set(Object.keys(newFileContents));
      const oldFilenames = new Set(Object.keys(oldFileContents));

      for (const filename of currentFilenames) {
        if (!oldFilenames.has(filename)) {
          console.warn('New file created, sending full sync');
          sendFullSync();
          initializeFileContents();
          return; // Exit early since full sync handles everything
        }
      }

      // Handle deleted files by sending full sync
      for (const filename of oldFilenames) {
        if (!currentFilenames.has(filename)) {
          console.warn('File deleted, sending full sync');
          sendFullSync();
          initializeFileContents();
          break;
        }
      }
    }, { deep: true });

    // Watch for active file changes
    watch(() => store.activeFilename, (newFilename, oldFilename) => {
      if (newFilename && newFilename !== oldFilename) {
        console.warn('Active file changed, sending full sync');
        sendFullSync();
      }
    });

    // Send selection changes
    editor.onDidChangeCursorSelection(() => {
      const activeFile = store.activeFile;
      if (!activeFile)
        return;

      // Save view state
      activeFile.editorViewState = editor.saveViewState();

      const payload: SelectionPayload = {
        filename: activeFile.filename,
        selections: editor.getSelections(),
      };
      sendReplMessage('SELECTION', payload);
    });

    // Send scroll changes (debounced)
    const sendScrollUpdate = useDebounceFn(() => {
      const activeFile = store.activeFile;
      if (!activeFile)
        return;

      // Save view state
      activeFile.editorViewState = editor.saveViewState();

      const payload: ScrollPayload = {
        filename: activeFile.filename,
        scrollTop: editor.getScrollTop(),
        scrollLeft: editor.getScrollLeft(),
      };
      sendReplMessage('SCROLL', payload);
    }, 100);

    editor.onDidScrollChange(sendScrollUpdate);
  }

  function paintInstructorSelections(
    editor: MonacoCore.editor.IStandaloneCodeEditor,
    selections: MonacoCore.ISelection[],
  ): void {
    const newDecorations = selections.flatMap((sel) => {
      const decorations: MonacoCore.editor.IModelDeltaDecoration[] = [];

      if (
        sel.selectionStartLineNumber !== sel.positionLineNumber
        || sel.selectionStartColumn !== sel.positionColumn
      ) {
        decorations.push({
          range: new MonacoCore.Range(
            sel.selectionStartLineNumber,
            sel.selectionStartColumn,
            sel.positionLineNumber,
            sel.positionColumn,
          ),
          options: { className: 'instructor-selection' },
        });
      }

      decorations.push({
        range: new MonacoCore.Range(
          sel.positionLineNumber,
          sel.positionColumn,
          sel.positionLineNumber,
          sel.positionColumn,
        ),
        options: {
          className: 'instructor-cursor',
          stickiness: MonacoCore.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      });

      return decorations;
    });

    instructorDecorations = editor.getModel()?.deltaDecorations(instructorDecorations, newDecorations) ?? [];
  }
}
