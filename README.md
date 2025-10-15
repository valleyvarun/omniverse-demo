# omniverse-demo

## UI Background Colors

Below are the key background colors used across the UI. Each row lists: 1) Name, 2) Class/selector, 3) Color value, 4) Where the style is defined.

| Name | Class/Selector | Background Color | Defined In |
|------|-----------------|------------------|------------|
| Top black bar | `.black` | `#000000` | `style.css` |
| Main header (app chrome) | `header` | `#1e1e1e` | `style.css` |
| Menu bar | `.menu-bar` | `#2a2a2a` | `style.css` |
| Function display (history) | `.function-display` | `#000000` | `style.css` |
| Command line | `.command-line-container` | `#000000` | `style.css` |
| App body | `body` | `#2c2c2c` | `style.css` |
| Footer | `.footer-bar` | `#1e1e1e` | `style.css` |
| Main content area (container) | `.main-content` | `#555555` | `style.css` |
| Content iframe | `.main-content iframe` | `transparent` | `style.css` |
| Explorer sidebar | `.project-manager-container` | `transparent` | `style.css` |
| Explorer header | `.pm-header` | `#222222` | `pm/pm.css` |
| Explorer header border | `.pm-header` | `1px solid #444` (border) | `pm/pm.css` |
| Explorer button (Open Project) | `.pm-btn` | `#2c2c2c` (border `#76B900`) | `pm/pm.css` |
| Explorer-resize handle | `.project-resize-handle` | `#666666` | `style.css` |
| Content modal overlay (backdrop) | `.content-modal-overlay.show` | `rgba(0,0,0,0.35)` | `style.css` |
| Content modal box | `.content-modal` | `#222222` | `style.css` |
| Agent panel container | `.chatbot-container` | `green` (visibility aid) | `style.css` |
| Agent header | `.agent-header` | `#222222` | `agent/agent.css` |
| Agent body (chat area) | `.agent-root` body | `#1a1a1a` | `agent/agent.css` |
| Explorer body | `pm/pm.css body` | `#1a1a1a` | `pm/pm.css` |
| Agent input block | `.agent-input` | `var(--agent-surface)` (`#222222`) | `agent/agent.css` |
| Popup header | `.popup-header` | `#222222` | `pages/popup.css` |
| Popup body | `.popup-body` | `#1a1a1a` | `pages/popup.css` |
| Home page body | `pages/home.css body` | `#2c2c2c` | `pages/home.css` |
| Home icon tile logo box | `.icon-logo` | `transparent` | `pages/home.css` |
| Home icon item (card) | `.icon-item` | `transparent` | `pages/home.css` |

Notes:
- Some areas use variables (e.g., `--agent-surface`) that currently resolve to `#222222`.
- The Agent container’s green background in `style.css` is for visibility during development and may be updated.