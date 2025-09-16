import type { BatchUpdateOperation, ReplStore } from '@calmecac-vue/repl';
import { compileFile, File } from '@calmecac-vue/repl';

import { useDebounceFn } from '@vueuse/core';
import * as MonacoCore from 'monaco-editor-core';

import { onMounted, watch } from 'vue';

import { useToastsStore } from '@/components/toasts/useToastsStore';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { usePartyKitBroadcast } from '@/composables/usePartyKit';

const AvailableMessageTypes = {
  FULL_SYNC: 'full_sync',
  BATCH_UPDATE: 'batch_update',
  SELECTION: 'selection',
  SCROLL: 'scroll',
  SYSTEM: 'system',
} as const;

type ReplMessageType = typeof AvailableMessageTypes[keyof typeof AvailableMessageTypes];

type ReplMessagePayloads = {
  [AvailableMessageTypes.FULL_SYNC]: {
    files: Record<string, { code: string; editorViewState: MonacoCore.editor.ICodeEditorViewState | null }>;
    activeFile: string;
    fileOrder: string[];
  };
  [AvailableMessageTypes.BATCH_UPDATE]: {
    updates: BatchUpdateOperation[];
  };
  [AvailableMessageTypes.SELECTION]: {
    selections: MonacoCore.ISelection[] | null;
    activeFile: string;
  };
  [AvailableMessageTypes.SCROLL]: {
    scrollTop: number;
    scrollLeft: number;
    activeFile: string;
  };
  [AvailableMessageTypes.SYSTEM]: {
    message: string;
  };
};

type ReplMessage<T extends ReplMessageType = ReplMessageType> = {
  type: T;
  id: string;
  payload: ReplMessagePayloads[T];
};

type AnyReplUpdateMessage
  = | ReplMessage<'full_sync'>
    | ReplMessage<'batch_update'>
    | ReplMessage<'selection'>
    | ReplMessage<'scroll'>
    | ReplMessage<'system'>;

export function useReplSync(): void {
  const fm = useFileManagerStore();
  const pkb = usePartyKitBroadcast();
  const { toast } = useToastsStore();

  let instructorDecorations: string[] = [];
  let lastInstructorSelections: MonacoCore.ISelection[] = [];

  function sendReplMessage<T extends ReplMessageType>(
    type: T,
    payload: ReplMessagePayloads[T],
  ): void {
    pkb.send<ReplMessage<T>>({
      id: 'instructor',
      type,
      payload,
    });
  }

  // NEW FUNCTION: Send the full REPL state
  function sendFullSync(): void {
    const files: ReplMessagePayloads['full_sync']['files'] = {};
    for (const filename in fm.replStore.files) {
      const file = fm.replStore.files[filename];
      files[filename] = {
        code: file.code,
        editorViewState: file.editorViewState,
      };
    }
    sendReplMessage(AvailableMessageTypes.FULL_SYNC, {
      files,
      activeFile: fm.replStore.activeFilename,
      fileOrder: Object.keys(files),
    });
  }

  onMounted(() => {
    const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';
    const editor = fm.replStore.editor;

    if (!editor) {
      console.error('REPL editor instance not found for sync.');
      return;
    }

    pkb.onMessage(async (message: AnyReplUpdateMessage) => {
      if (message.id === 'instructor' && isInstructor)
        return;

      switch (message.type) {
        case AvailableMessageTypes.SYSTEM:
          toast.info(message.payload.message);
          break;

        case AvailableMessageTypes.FULL_SYNC:
          handleFullSync(message.payload);
          break;

        case AvailableMessageTypes.BATCH_UPDATE:
          await fm.replStore.batchUpdate(message.payload.updates);
          break;

        case AvailableMessageTypes.SELECTION:
        case AvailableMessageTypes.SCROLL:
          handleImperativeUpdates(message);
          break;
      }
    });

    if (isInstructor) {
      setupInstructorHandlers(fm.replStore, editor, sendReplMessage);
      // NEW: Send full sync on instructor init
      sendFullSync();
    }
    else {
      console.warn('ATTENDEE, receiving instructor updates...');
    }

    async function handleFullSync(payload: ReplMessagePayloads['full_sync']): Promise<void> {
      const { files: incomingFiles, activeFile, fileOrder } = payload;

      const filesToCompile: File[] = [];

      // Update existing files or create new ones
      for (const filename of fileOrder) {
        const incoming = incomingFiles[filename];
        if (!incoming)
          continue;

        if (fm.replStore.files[filename]) {
          // update content without replacing ref
          fm.replStore.files[filename].updateContent(incoming.code);
          fm.replStore.files[filename].editorViewState = incoming.editorViewState;
        }
        else {
          // add new file
          fm.replStore.files[filename] = new File(filename, incoming.code);
          fm.replStore.files[filename].editorViewState = incoming.editorViewState;
        }

        filesToCompile.push(fm.replStore.files[filename]);
      }

      // Remove deleted files
      for (const filename of Object.keys(fm.replStore.files)) {
        if (!incomingFiles[filename])
          delete fm.replStore.files[filename];
      }

      // Set active file
      fm.replStore.activeFilename = activeFile;
      const activeFileRef = fm.replStore.files[activeFile];

      // Compile active file first (JS + CSS) for preview
      if (activeFileRef) {
        const errs = await compileFile(fm.replStore, activeFileRef);
        fm.replStore.errors = errs;

        // Inject compiled CSS into preview iframe
        if (activeFileRef.compiled.css && fm.replStore.editor?.getDomNode()) {
          const iframe = document.querySelector<HTMLIFrameElement>('#preview-iframe');
          if (iframe?.contentDocument) {
            let styleTag = iframe.contentDocument.getElementById(
              `file-style-${activeFileRef.filename}`,
            ) as HTMLStyleElement;
            if (!styleTag) {
              styleTag = iframe.contentDocument.createElement('style');
              styleTag.id = `file-style-${activeFileRef.filename}`;
              iframe.contentDocument.head.appendChild(styleTag);
            }
            styleTag.textContent = activeFileRef.compiled.css;
          }
        }

        // Restore editor view state
        if (activeFileRef.editorViewState && fm.replStore.editor) {
          fm.replStore.editor.restoreViewState(activeFileRef.editorViewState);
        }
      }

      // Compile the rest of the files in background
      const otherFiles = filesToCompile.filter(f => f !== activeFileRef);
      await Promise.all(otherFiles.map(f => compileFile(fm.replStore, f)));

      // Repaint instructor selections if needed
      if (lastInstructorSelections.length > 0 && fm.replStore.editor) {
        paintInstructorSelections(fm.replStore.editor, lastInstructorSelections);
      }
    }

    function handleImperativeUpdates(message: ReplMessage<'selection'> | ReplMessage<'scroll'>): void {
      if (!editor || !editor.getModel())
        return;

      if (message.payload.activeFile !== fm.replStore.activeFile?.filename) {
        // The active file is not in sync, but we can still try to apply the update
        // if the file exists in the store.
        const file = fm.replStore.files[message.payload.activeFile];
        if (!file) {
          console.warn(`File ${message.payload.activeFile} not found in REPL store.`);
          return;
        }
      }

      if (message.type === 'selection' && message.payload.selections) {
        lastInstructorSelections = message.payload.selections;

        paintInstructorSelections(editor, lastInstructorSelections);

        // add once so repaint always happens
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
      if (message.type === 'scroll') {
        editor.setScrollTop(message.payload.scrollTop);
        editor.setScrollLeft(message.payload.scrollLeft);
      }
    }
  });

  function setupInstructorHandlers(
    store: ReplStore,
    editor: MonacoCore.editor.IStandaloneCodeEditor,
    sendReplMessage: <T extends ReplMessageType>(type: T, payload: ReplMessagePayloads[T]) => void,
  ): void {
    console.warn('INSTRUCTOR, setting up REPL sync...');

    // Maintain a local copy of file contents for comparison
    const fileContents = new Map<string, string>();
    const initializeFileContents = (): void => {
      fileContents.clear();
      for (const filename in store.files) {
        fileContents.set(filename, store.files[filename].code);
      }
    };
    initializeFileContents();

    // Watch for all file changes
    watch(() => store.files, (newFilesRecord) => {
      const newFilenames = new Set(Object.keys(newFilesRecord));
      const updates: BatchUpdateOperation[] = [];

      // Check for deletions
      for (const filename of fileContents.keys()) {
        if (!newFilenames.has(filename)) {
          updates.push({ type: 'delete', filename });
        }
      }

      // Check for creations and updates
      for (const filename of newFilenames) {
        const newFile = newFilesRecord[filename];
        const oldCode = fileContents.get(filename);

        if (oldCode === undefined) {
        // New file created
          updates.push({ type: 'create', filename, content: newFile.code });
        }
        else if (oldCode !== newFile.code) {
        // File content updated
          updates.push({ type: 'update', filename, content: newFile.code });
        }
      }

      if (updates.length > 0) {
        sendReplMessage(AvailableMessageTypes.BATCH_UPDATE, { updates });
        // NEW: Send full sync after batch updates
        sendFullSync();
        // After sending updates, sync the local copy
        initializeFileContents();
      }
    }, { deep: true });

    // Watch for active file changes
    watch(() => store.activeFilename, (newFilename) => {
      if (newFilename) {
        sendReplMessage(AvailableMessageTypes.BATCH_UPDATE, { updates: [{ type: 'setActive', filename: newFilename }] });
        // NEW: Send full sync after active file change
        sendFullSync();
      }
    });

    // Send selection changes
    editor.onDidChangeCursorSelection(() => {
      const activeFile = store.activeFile;
      if (!activeFile)
        return;
      activeFile.editorViewState = editor.saveViewState();
      sendReplMessage(AvailableMessageTypes.SELECTION, {
        selections: editor.getSelections(),
        activeFile: activeFile.filename,
      });
    });

    // Send scroll changes
    const sendScrollUpdate = useDebounceFn(() => {
      const activeFile = store.activeFile;
      if (!activeFile)
        return;
      activeFile.editorViewState = editor.saveViewState();
      sendReplMessage(AvailableMessageTypes.SCROLL, {
        scrollTop: editor.getScrollTop(),
        scrollLeft: editor.getScrollLeft(),
        activeFile: activeFile.filename,
      });
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
