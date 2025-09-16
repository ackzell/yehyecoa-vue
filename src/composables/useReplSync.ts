import type * as MonacoCore from 'monaco-editor-core';

import { useDebounceFn, watchDebounced } from '@vueuse/core';
import { Selection } from 'monaco-editor-core';
import { nextTick, onMounted } from 'vue';

import { useToastsStore } from '@/components/toasts/useToastsStore';
import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { usePartyKitBroadcast } from '@/composables/usePartyKit';

const AvailableMessageTypes = {
  content: 'content',
  selection: 'selection',
  scroll: 'scroll',
} as const;

type ReplMessageType = typeof AvailableMessageTypes[keyof typeof AvailableMessageTypes];

// Map message types to payloads
type ReplMessagePayloads = {
  content: {
    files: Record<string, string>;
    fileOrder?: string[];
    activeFile?: string;
  };
  selection: {
    selections: MonacoCore.ISelection[] | null;
    activeFile?: string;
  };
  scroll: {
    scrollTop?: number;
    scrollLeft?: number;
    activeFile?: string;
  };
};

// Generic message type
type ReplMessage<T extends ReplMessageType = ReplMessageType> = {
  type: T;
  id: string;
  payload: ReplMessagePayloads[T];
};

// Concrete union
type AnyReplUpdateMessage
  = | ReplMessage<'content'>
    | ReplMessage<'selection'>
    | ReplMessage<'scroll'>;

type SystemMessage = {
  type: 'system';
  message: string;
};

/**
 * A composable to handle real-time synchronization of the REPL state
 * between instructor and attendees using PartyKit.
 */
export function useReplSync(): void {
  const fm = useFileManagerStore();
  const pkb = usePartyKitBroadcast();
  const { toast } = useToastsStore();

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

  onMounted(() => {
    const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';
    const editor = fm.replStore.editor;

    if (!editor) {
      console.error('REPL editor instance not found for sync.');
      return;
    }

    pkb.onMessage(async (message: SystemMessage) => {
      if (message.type === 'system') {
        toast.info(message.message);
      }
    },
    );

    if (isInstructor) {
      console.warn('INSTRUCTOR, setting up REPL sync...');

      // Send selection changes immediately
      editor.onDidChangeCursorSelection(() => {
        const payload = {
          selections: editor.getSelections(),
          activeFile: fm.replStore.activeFile?.filename,
        };
        sendReplMessage('selection', payload);
      });

      // Send scroll changes, debounced to avoid flooding
      const sendScrollUpdate = useDebounceFn(() => {
        const payload = {
          scrollTop: editor.getScrollTop(),
          scrollLeft: editor.getScrollLeft(),
          activeFile: fm.replStore.activeFile?.filename,
        };
        sendReplMessage('scroll', payload);
      }, 100);
      editor.onDidScrollChange(sendScrollUpdate);

      // Send file content changes
      watchDebounced(
        () => fm.replStore.getFiles(),
        (files) => {
          const payload = {
            files,
            fileOrder: Object.keys(files),
            activeFile: fm.replStore.activeFile?.filename,
          };

          console.warn('INSTRUCTOR, sending repl-update');
          sendReplMessage('content', payload);
        },
        {
          debounce: 50,
          deep: true,
          immediate: true,
        },
      );
    }
    else {
      console.warn('ATTENDEE, receiving instructor updates...');
      pkb.onMessage(async (message: AnyReplUpdateMessage) => {
        if (AvailableMessageTypes[message.type] !== message.type)
          return;

        console.warn('Received message', message);

        function applyImperativeUpdates(): void {
          if (!editor?.getModel())
            return;

          if (message.type === 'selection' && message.payload.selections) {
            // Re-hydrate the selections into Monaco Selection objects, as they lose their methods during serialization
            const monacoSelections = message.payload.selections.map(
              s =>
                new Selection(
                  s.selectionStartLineNumber,
                  s.selectionStartColumn,
                  s.positionLineNumber,
                  s.positionColumn,
                ),
            );
            editor.setSelections(monacoSelections);
            // Reveal the primary cursor if it's off-screen
            if (monacoSelections.length > 0)
              editor.revealPositionInCenterIfOutsideViewport(monacoSelections[0].getStartPosition());
            editor.focus();
          }

          if (message.type === 'scroll' && message.payload.scrollTop && message.payload.scrollLeft) {
            if (typeof message.payload.scrollTop === 'number') {
              editor.setScrollTop(message.payload.scrollTop);
            }

            if (typeof message.payload.scrollLeft === 'number') {
              editor.setScrollLeft(message.payload.scrollLeft);
            }
          }
        };

        const willTabChange = message.payload.activeFile && fm.replStore.activeFile?.filename !== message.payload.activeFile;

        // If the active tab is going to change, we must listen for the editor to
        // confirm the switch before applying selections/scroll. `nextTick` is not
        // sufficient because Monaco's model change is asynchronous.
        if (willTabChange) {
          const disposable = editor.onDidChangeModel((e: any) => {
            if (e.newModelUrl?.path === `/${message.payload.activeFile}`) {
              console.log(`[yv-sync] Editor model switched to ${message.payload.activeFile}. Applying imperative updates.`);
              nextTick(applyImperativeUpdates);
              disposable.dispose();
            }
          });
        }

        // If file content is changing, it's a major update that might reset the active file.
        if (message.type === 'content' && message.payload.files) {
          let filesToSet = message.payload.files;
          // If an explicit file order is provided, reconstruct the files object
          // to ensure the REPL store processes them in that order. Modern JS engines
          // preserve property insertion order, which the REPL's `for...in` loop will respect.
          if (message.payload.fileOrder) {
            const orderedFiles: Record<string, string> = {};
            for (const filename of message.payload.fileOrder) {
              // Make sure the file exists in the payload
              if (message.payload.files[filename] !== undefined) {
                orderedFiles[filename] = message.payload.files[filename];
              }
            }
            // Add any files from the payload that weren't in the order array, just in case.
            for (const filename in message.payload.files) {
              if (orderedFiles[filename] === undefined) {
                orderedFiles[filename] = message.payload.files[filename];
              }
            }
            filesToSet = orderedFiles;
          }

          // 1. Atomically update files and active file to prevent a race condition.
          // First, set active file to a non-existent name. This makes the `activeFile`
          // computed property become `undefined`, preventing Monaco from trying to
          // switch to a stale model when `setFiles` is called.
          fm.replStore.setActive(`__temp_file_for_sync__.vue`);

          // 2. Set the new file content without auto-activating.
          await fm.replStore.setFiles(filesToSet, undefined, false);

          // 3. Now, make the single, definitive call to set the correct active file.
          // This will trigger the watcher in the Editor once, causing a clean model switch.
          if (message.payload.activeFile)
            fm.replStore.setActive(message.payload.activeFile);

          // The onDidChangeModel listener will handle applying imperative updates.
          if (!willTabChange)
            nextTick(applyImperativeUpdates);
        }
        // If no file content change, but the active file is out of sync (e.g., from a cursor-only message).
        else if (message.payload.activeFile && fm.replStore.activeFile?.filename !== message.payload.activeFile) {
          fm.replStore.setActive(message.payload.activeFile);

          // Wait for the tab switch to render before applying updates.
          // The onDidChangeModel listener will handle applying imperative updates.
          if (!willTabChange)
            nextTick(applyImperativeUpdates);
        }
        else {
          // No file or tab change, just a cursor/scroll update on the current file.
          applyImperativeUpdates();
        }
      });
    }
  });
}
