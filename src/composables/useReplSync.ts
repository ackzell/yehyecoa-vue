import type * as MonacoCore from 'monaco-editor-core';

import { useDebounceFn, watchDebounced } from '@vueuse/core';
import { Selection } from 'monaco-editor-core';
import { nextTick, onMounted } from 'vue';

import { useFileManagerStore } from '@/composables/useFileManagerStore';
import { usePartyKitBroadcast } from '@/composables/usePartyKit';

type PartyKitMessage = {
  type: 'repl-update' | 'system';
  id: string;
  payload: {
    activeFile?: string;
    selections?: MonacoCore.Selection[];
    scrollTop?: number;
    scrollLeft?: number;
    files?: Record<string, string>;
    fileOrder?: string[];
  };
};

/**
 * A composable to handle real-time synchronization of the REPL state
 * between instructor and attendees using PartyKit.
 */
export function useReplSync(): void {
  const fm = useFileManagerStore();
  const pkb = usePartyKitBroadcast();

  onMounted(() => {
    const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';
    const editor = fm.replStore.editor;

    if (!editor) {
      console.error('REPL editor instance not found for sync.');
      return;
    }

    if (isInstructor) {
      console.warn('INSTRUCTOR, setting up REPL sync...');

      // Send selection changes immediately
      editor.onDidChangeCursorSelection(() => {
        pkb.send({
          id: 'instructor',
          type: 'repl-update',
          payload: {
            selections: editor.getSelections(),
            activeFile: fm.replStore.activeFile?.filename,
          },
        });
      });

      // Send scroll changes, debounced to avoid flooding
      const sendScrollUpdate = useDebounceFn(() => {
        pkb.send({
          id: 'instructor',
          type: 'repl-update',
          payload: {
            scrollTop: editor.getScrollTop(),
            scrollLeft: editor.getScrollLeft(),
            activeFile: fm.replStore.activeFile?.filename,
          },
        });
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
            selections: editor.getSelections(),
            scrollTop: editor.getScrollTop(),
            scrollLeft: editor.getScrollLeft(),
          };

          console.warn('INSTRUCTOR, sending repl-update', payload);
          pkb.send({
            id: 'instructor',
            type: 'repl-update',
            payload,
          });
        },
        { debounce: 50, deep: true },
      );
    }
    else {
      console.warn('ATTENDEE, receiving instructor updates...');
      pkb.onMessage(async (message: PartyKitMessage) => {
        if (message.type !== 'repl-update')
          return;

        console.warn('Received message', message);
        const {
          files,
          selections,
          scrollTop,
          scrollLeft,
          activeFile,
          fileOrder,
        } = message.payload;

        function applyImperativeUpdates(): void {
          if (!editor?.getModel())
            return;

          if (selections) {
            // Re-hydrate the selections into Monaco Selection objects, as they lose their methods during serialization
            const monacoSelections = selections.map(
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
          if (typeof scrollTop === 'number')
            editor.setScrollTop(scrollTop);

          if (typeof scrollLeft === 'number')
            editor.setScrollLeft(scrollLeft);
        };

        // If file content is changing, it's a major update that might reset the active file.
        if (files) {
          let filesToSet = files;
          // If an explicit file order is provided, reconstruct the files object
          // to ensure the REPL store processes them in that order. Modern JS engines
          // preserve property insertion order, which the REPL's `for...in` loop will respect.
          if (fileOrder) {
            const orderedFiles: Record<string, string> = {};
            for (const filename of fileOrder) {
              // Make sure the file exists in the payload
              if (files[filename] !== undefined) {
                orderedFiles[filename] = files[filename];
              }
            }
            // Add any files from the payload that weren't in the order array, just in case.
            for (const filename in files) {
              if (orderedFiles[filename] === undefined) {
                orderedFiles[filename] = files[filename];
              }
            }
            filesToSet = orderedFiles;
          }

          // 1. Set the files. This is an async operation. Awaiting it ensures the
          //    REPL store is ready before we proceed. We do NOT pass activeFile here,
          //    as that would force it to be the first tab.
          await fm.replStore.setFiles(filesToSet);
          // 2. Now that the files are set in the correct order, set the active tab.
          if (activeFile)
            fm.replStore.setActive(activeFile);
          // Use nextTick as a final safeguard to run after any Vue-related DOM updates.
          nextTick(applyImperativeUpdates);
        }
        // If no file content change, but the active file is out of sync (e.g., from a cursor-only message).
        else if (activeFile && fm.replStore.activeFile?.filename !== activeFile) {
          fm.replStore.setActive(activeFile);

          // Wait for the tab switch to render before applying updates.
          nextTick(applyImperativeUpdates);
        }
        // Otherwise, it's just a simple cursor/scroll update for the current file.
        else {
          applyImperativeUpdates();
        }
      });
    }
  });
}
