# Physics Sandbox

An interactive portfolio project exploring how a React interface can drive a custom canvas editor backed by a Matter.js physics world.

Physics Sandbox is built as a small editor rather than a static demo. Objects can be created, edited, moved, copied, grouped into prefabs, affected by simulation modifiers, and inspected while the physics simulation is running or paused.

## Highlights

| Area | What it demonstrates |
| --- | --- |
| Editor UI | Panels, toolbar, inspector, status bar, dialogs, tooltips, and context menus built in React. |
| Canvas Rendering | Imperative canvas drawing kept separate from the React component tree. |
| Physics | Matter.js bodies synchronized with editable object metadata. |
| Commands | Undoable object creation, deletion, property updates, paste actions, and prefab spawning. |
| Interaction | Selection, movement, camera, stamp placement, clipboard, drag select, shortcuts, and zoom controls. |
| Simulation | Gravity, wind, radial push/pull forces, collision roles, and play/pause controls. |
| Portfolio UX | Prefabs, demo scenes, theme modes, and an about panel with recorded feature demos. |

## Technical Focus

### React + Canvas Integration

React owns the editor chrome: panels, toolbar, inspector, status bar, dialogs, tooltips, context menus, and persistent UI state. The canvas remains an imperative rendering surface so physics objects can be drawn directly from simulation state without forcing every visual update through React components.

That separation is the main purpose of the project:

- React handles stateful controls, forms, panels, and editor workflows.
- Canvas handles the visual world.
- Matter.js handles physics stepping and collision state.
- Zustand connects UI state to the renderer and input layer.

### Physics Objects as Editable Data

Sandbox objects are editor entities with metadata for both visual and physical behaviour:

- size, colour, border colour, and border style
- mass, bounce, friction, and static/dynamic state
- collision roles for destructive interactions
- radial force settings for push and pull fields

Matter.js bodies are updated from that metadata, so inspector edits affect both rendering and simulation behaviour. Static objects can still be moved as editor objects, while dynamic objects remain under physics control when the simulation is running.

### Commands and Editor Safety

Most mutating actions run through a command bus:

- create object
- delete object
- update object properties
- paste objects
- spawn prefab

Commands report success or failure and support undo/redo where appropriate. This keeps high-level editor behaviour consistent across toolbar actions, inspector edits, context menus, keyboard shortcuts, clipboard actions, and prefab spawning.

### Input and Interaction

The editor has explicit interaction modes for selection, object movement, and camera control. It also supports middle-mouse camera panning, keyboard shortcuts, selection boxes, right-click context menus, object stamp placement, copy/cut/paste, duplicate, fit-to-view, and zoom controls.

The input layer is intentionally separated from the UI components so shortcuts, pointer actions, context menus, and clipboard behaviour can share the same application commands.

### Shared Editor State

Zustand is used for most editor-level state instead of keeping everything in local React state. The sandbox has several non-React systems that need access to the same data: input handling, command execution, camera updates, canvas rendering, tooltips, status displays, and panels.

Keeping that state in a small external store makes those systems easier to coordinate without passing large prop chains through the React tree or forcing the renderer and physics code to behave like React components. Local React state is still used for component-only concerns such as dialog visibility, draft form values, and temporary UI details.

### Prefabs and Demo Scenes

Prefabs are serialized scene snippets that can be spawned into the sandbox. They are useful for testing editor behaviour quickly and for showing off more complex setups such as boulder runs, Rube Goldberg machines, radial force chambers, and solar-system style scenes.

In development, selected objects can be exported as prefab data to make new reusable setups easier to build.

## Running Locally

```bash
npm install
npm run dev
```

### Scripts

```bash
npm run build
npm run lint
npm test
```

Demo media helpers are available if FFmpeg is installed:

```bash
npm run demo:webm
npm run demo:gif
```

## Stack

```text
React       UI layer
TypeScript  Application code
Vite        Development and production build
Matter.js   Physics engine
Zustand     Editor state
Jest        Unit tests
ESLint      Static checks
```

## Project Structure

```text
src/
  application/  App-level orchestration
  camera/       Camera pan, zoom, and fit-to-view logic
  canvas/       Canvas host and overlays
  commands/     Undoable editor commands
  config/       Tunable editor, physics, input, and object settings
  input/        Keyboard, pointer, clipboard, and context interactions
  physics/      Matter.js world integration
  prefabs/      Built-in prefab definitions and serialization
  rendering/    Canvas renderer
  sandbox/      Object types, flags, and metadata
  store/        Zustand editor state
  ui/           React panels, controls, dialogs, and toolbars
```

## Portfolio Intent

This project is intended to show practical frontend engineering around a complex interactive surface.

The core challenge is keeping React state, canvas rendering, physics simulation, command history, keyboard input, and editor UI behaviour aligned without letting one layer take over the whole application.
