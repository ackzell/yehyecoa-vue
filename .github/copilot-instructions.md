# AI Assistant Instructions for yehyecoa-vue

## Project Overview
> **[yeh-yeh-CO-ah](https://nahuatl.wired-humanities.org/content/yeyecoa)** in Nahuatl means to try something; to try or experiment with something; to rehearse

Yehyecoa-vue is a collaborative Vue REPL (Read-Eval-Print Loop) platform originally designed to serve as the interactive playground component within [TutorialKit](https://tutorialkit.dev/) workshops. It extends the Vue Playground with:

1. **Real-time Collaboration**:
   - Instructor-led code demonstrations
   - Live synced editing sessions
   - Cursor and selection synchronization
   - Uses PartyKit for WebSocket communication

2. **Simplified Interface**:
   - Focused on basic Vue concepts
   - Removes version switching complexity
   - Hides compiled output for cleaner experience
   - Optimized for workshop learning scenarios

3. **TutorialKit Integration**:
   - Seamlessly embeds in TutorialKit preview windows
   - Dynamically updates with lesson content changes
   - Integrates with TutorialKit's webcontainer environment
   - Enables interactive Vue.js tutorials and workshops

While primarily designed for TutorialKit integration, it can also function as a standalone collaborative REPL for Vue.js workshops and pair programming sessions.

### Workspace Structure
This is a pnpm workspace project containing multiple packages:

1. **Root Project**: Main application integrating all components
2. **`packages/party-kit/`**: 
   - PartyKit server implementation
   - Handles real-time WebSocket communication
   - Manages room state and instructor/attendee connections

3. **`packages/vue-repl/`**: 
   - Forked from official `@vue/repl`
   - Enhanced store management for better external control
   - Improved state exposure and management patterns
   - Makes REPL state more accessible for workshop use cases
   - No direct real-time features, but enables integration

The workspace structure enables tight integration while maintaining separate concerns for:
- Real-time server logic (party-kit)
- Core REPL functionality and state management (vue-repl)
- Main application features and real-time integration (root)

### TutorialKit Integration
The project is designed to work as a standalone application or as an embedded component within a [TutorialKit](https://tutorialkit.dev/) project:

1. **Template Installation**:
   - When used in TutorialKit, the project is installed as a template in `amoxtli-vue/src/templates/yehyecoa/`
   - Build and install command: `npm bi` (builds project and copies `/dist` to template directory)

2. **Lesson File Integration**:
   - `server.js` in the template directory watches for lesson file changes
   - Dynamic updates are pushed to the REPL editor through the server
   - Enables seamless integration with TutorialKit's webcontainer environment

3. **File Change Detection**:
   ```javascript
   // amoxtli-vue/src/templates/yehyecoa/server.js
   // Notifies yehyecoa-vue when lesson file contents are updated
   // Enables dynamic content updates in the embedded REPL
   ```

## Technology Stack

### State Management
- **Pinia Stores**:
  - Central to application state management
  - Key stores in `/src/composables/`:
    ```typescript
    usePartyKitStore    // WebSocket and real-time state
    useFileManagerStore // REPL file management
    useSettingsStore    // Application configuration
    useToastsStore     // UI notifications
    ```
  - Leverages Vue Composition API integration
  - Enables clean separation of concerns
  - Facilitates state persistence where needed

### UI Layer
1. **UnoCSS Configuration**:
   - Uses UnoCSS with multiple presets for utility-first styling:
     ```typescript
     // uno.config.ts
     presets: [
       presetWind4(),           // Tailwind v4 compatible utilities
       presetAnimations(),      // Animation utilities
       presetTypography(),      // Typography utilities
       presetWebFonts(),        // Web fonts support
       presetShadcn(),          // shadcn integration
       presetIcons({
         collections: {
           carbon: () => import('@iconify-json/carbon/icons.json'),
           mynaui: () => import('@iconify-json/mynaui/icons.json'),
         }
       })
     ]
     ```

2. **shadcn-vue Components**:
   - Based on the "New York" style variant
   - Uses CSS variables for theming
   - Key components in `/src/components/ui/`:
     - Sheet components for overlays
     - Custom scroll areas
     - Select components with virtual scrolling
     - Tooltips and popovers
     - Drawer components

## Core Architecture

### Component Structure
- `/src/composables/`: Core state and sync functionality
  - `usePartyKitStore.ts`: Real-time communication store using PartyKit
  - `useReplSync.ts`: REPL state synchronization logic
  - `useFileManagerStore.ts`: File management and state

### Real-time Collaboration Model
- **Instructor-Attendee Pattern**: 
  ```typescript
  // src/composables/useReplSync.ts
  const isInstructor = sessionStorage.getItem('isInstructor') === 'yes';
  ```
- **Message Types**:
  ```typescript
  const AvailableMessageTypes = {
    FULL_SYNC: 'full_sync',      // Complete REPL state sync
    BATCH_UPDATE: 'batch_update', // Incremental file changes
    SELECTION: 'selection',       // Cursor/selection sync
    SCROLL: 'scroll',            // Viewport sync
    SYSTEM: 'system'             // System messages
  }
  ```

### State Management
1. **PartyKit Store** (`usePartyKitStore.ts`):
   - Manages WebSocket connections and real-time messaging
   - Handles instructor presence and connection state
   - Compression using `fflate` for efficient message transfer

2. **REPL Sync** (`useReplSync.ts`):
   - Synchronizes code editor state between instructor and attendees
   - Handles file changes, selections, and scroll positions
   - Uses Monaco Editor's view state for precise editor sync

## Key Workflows

### 1. Real-time Synchronization
The sync process follows a specific order:
1. Full state sync on initial connection
2. Incremental updates for file changes
3. Real-time cursor and selection sync
4. Scroll position synchronization

### 2. File Management
- Files are managed through batch operations:
  ```typescript
  type BatchUpdateOperation = {
    type: 'create' | 'update' | 'delete' | 'setActive';
    filename: string;
    content?: string;
  }
  ```

### 3. Error Handling
Error states are managed through the toast system:
```typescript
// Example from useReplSync.ts
catch (error) {
  console.error('Error during full sync:', error);
  toast.error('Failed to synchronize with instructor');
}
```

## Integration Points

### 1. PartyKit Server (`packages/party-kit/src/server.ts`)
- Handles WebSocket connections and message routing
- Maintains latest state for new connections
- Manages instructor presence and activity

### 2. Monaco Editor Integration
- Editor state synchronization includes:
  - File content
  - Cursor positions
  - Selections
  - Scroll state
  - View state

## Common Patterns

### 1. State Compression
Always compress state before sending over WebSocket:
```typescript
compressSync(strToU8(JSON.stringify(message)))
```

### 2. File State Management
Track file changes using local cache and diffs:
```typescript
const fileContents = new Map<string, string>();
// Update on changes
watch(() => store.files, (newFilesRecord) => {
  const updates: BatchUpdateOperation[] = [];
  // ... compute changes
});
```

### 3. Error Handling
Use toast notifications for user feedback and console logs for debugging:
```typescript
toast.error('Failed to synchronize');
console.error('Error details:', error);
```

## Project Setup

### Standalone Mode
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run local PartyKit server:
   ```bash
   # In packages/party-kit
   pnpm dev
   ```

3. Development mode with hot reload:
   ```bash
   # In root project
   pnpm dev
   ```

4. For working on vue-repl package:
   ```bash
   # In packages/vue-repl
   pnpm dev
   ```

### TutorialKit Template Mode
1. Build and install as template:
   ```bash
   npm bi  # Builds and copies to amoxtli-vue template directory
   ```
2. The template's `server.js` will automatically:
   - Watch for lesson file changes
   - Update REPL content dynamically
   - Handle webcontainer integration

## Code Style and Conventions

### TypeScript and Vue Patterns

1. **Function Declarations**:
   ```typescript
   // In components/composables, prefer function declarations for methods
   function handleFileChange() {
     // Implementation
   }
   
   // Use arrow functions for callbacks in higher-order methods
   files.forEach((file) => {
     processFile(file)
   })
   ```

2. **Variable Naming**:
   - Boolean values start with "is": `isConnected`, `isLoading`
   - Descriptive identifiers that convey purpose
   - Store instances can use abbreviated names for readability:
     ```typescript
     const pks = usePartyKitStore()    // PartyKit store
     const fm = useFileManagerStore()   // File manager store
     ```

3. **Destructuring Guidelines**:
   ```typescript
   // Good: Clear source context
   const { toast } = useToastsStore()
   
   // Prefer: Maintain context for complex objects
   const store = useStore()
   store.files.forEach(...)  // Clear that 'files' comes from store
   ```

4. **Store Composition**:
   ```typescript
   // Prefer composables with defineStore
   export const usePartyKitStore = defineStore('partyKitStore', () => {
     // State as refs
     const isConnected = ref(false)
     const currentRoomId = ref('')
     
     // Computed as readonly when exposed
     return {
       isConnected: readonly(isConnected),
       currentRoomId: readonly(currentRoomId)
     }
   })
   ```

5. **Type Definitions**:
   - Use TypeScript `type` over `interface`
   - Explicit message type definitions
   ```typescript
   type ReplMessageType = typeof AvailableMessageTypes[keyof typeof AvailableMessageTypes]
   type ReplMessage<T extends ReplMessageType = ReplMessageType> = {
     type: T
     id: string
     payload: ReplMessagePayloads[T]
   }
   ```

3. **Vue Component Structure**:
   - Props and emits defined at top
   - Composables initialized next
   - Computed and reactive state follow
   - Methods grouped by functionality
   - Event handlers last

4. **Error Handling**:
   ```typescript
   try {
     // Operation
   }
   catch (error) {
     console.error('Descriptive error:', error)
     toast.error('User-friendly message')
   }
   ```

### Code Organization
1. **File Structure**:
   - Composables in `/src/composables`
   - UI components in `/src/components/ui`
   - Stores follow pattern: `use[Feature]Store.ts`
   - Types near related functionality

2. **Naming Conventions**:
   - Component files: PascalCase.vue
   - Composables: camelCase.ts
   - Custom events: kebab-case
   - Store exports: `use` prefix

3. **Documentation**:
   - Clear type definitions
   - Comments for complex logic
   - Use JSDoc for public APIs
   - Include examples in comments

### ESLint Configuration
- Based on @antfu/eslint-config
- Single quotes, 2-space indent
- Strict TypeScript checks
- Vue template formatting rules
- Consistent component structure

## Testing Guidelines
- Unit tests should mock PartyKit connections
- Test both instructor and attendee scenarios
- Verify compression/decompression of messages
- Test synchronization edge cases