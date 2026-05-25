# KliFox MVP Master Documentation

This document serves as the central architectural reference for the KliFox platform during the MVP Launch Phase.

## 1. System Overview & Core Purpose
KliFox is an AI-powered service marketplace connecting customers with craftsmen through a realtime dispatch network.
The platform uses a hybrid architecture:
1. **PWA Mobile Runtime** for immediate mobile accessibility.
2. **Realtime Socket/REST Layer** for live communication and background processing.
3. **AI Routing Hub** to analyze unstructured text and execute deterministic commands.

## 2. Directory Structure & Architecture Map

### `adapters/`
Acts as the interface layer between external systems, state, and UI.
- `socket.adapter.js`: Manages real-time connectivity, reconnection safety, and emit wrapping.
- `payment.adapter.js` / `escrow.adapter.js`: Mock layers mapping to future real-world banking integrations.
- `ai.adapter.js`: Formats and proxies queries to the target AI provider (OpenAI, Claude).
- `auth.adapter.js` & `pwa.runtime.js`: Device auth, service worker registrations, caching.

### `api/`
Defines contracts for both client and server boundaries.
- `contracts/`: Expected payloads for events.
- `endpoints/`: REST mappings.
- `types/`: Data schema models.

### `backend/`
The Node.js counterpart to the frontend PWA. Houses the actual Socket.io server (`socket-server.js`) and REST API (`server.js`).

### `engine/`
The brain of the platform. Executes background tasks entirely separated from UI components.
- `orchestrator.js`: Global event coordinator.
- `dispatch.js`: Handles geographical and temporal matching of requests to craftsmen.
- `ai.js`: The natural language parsing engine routing intents.
- `workers.js` & `queues.js`: Job processing layer ensuring async operations execute safely.

*(Experimental engines like `economy.js`, `predictive.js`, and `simulation.js` are paused during MVP Mode)*

### `rules/`
Stateless deterministic logic dictating system constraints.
- `dispatch.rules.js`: Logic on when and who to dispatch.
- `risk.rules.js`: Security, spam, and fraud detection.
- `wallet.rules.js`: Transaction validity rules.

### `ui/`
Component-based DOM managers. They listen to the `App.State` and `App.Adapters` instead of holding state themselves.
- `chat.js`: Core customer interface.
- `craftsman-dash.js`: Realtime jobs center for workers.
- `dom.js`: Centralized DOM utilities and layout syncing.

## 3. Realtime Flow Execution (The MVP Loop)
1. **User input** in `chat.js` triggers `App.Engine.AI.process()`.
2. **AI resolves intent** -> fires `SERVICE_REQUESTED` event.
3. **EventBus** routes this to `App.Engine.Dispatch`.
4. `Dispatch` applies rules (`rules/dispatch.rules.js`) and finds a Craftsman.
5. `Dispatch` adds a job to `App.Engine.Queues`.
6. `App.Engine.Workers` processes the queue asynchronously and emits `WORKER_DISPATCHED`.
7. `App.Adapters.Socket` broadcasts the update to connected clients.
8. `App.UI` reacts to socket updates and updates DOM.

## 4. Production Stability (MVP Mode)
When `App.Config.MVP_MODE` is `true` (`config/env.js`):
- Non-essential background tasks are frozen to free up memory on mobile devices.
- UI elements referencing predictive intelligence or complex topology are hidden.
- The focus remains exclusively on: **Auth -> Request -> Match -> Execute -> Pay.**
