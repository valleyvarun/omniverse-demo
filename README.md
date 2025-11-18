# omniverse-demo

## Core Palette

| Hex | Usage |
|-----|-------|
| `#000000` | Top black bar, command line, function display background |
| `#1e1e1e` | Main header and footer bars |
| `#2a2a2a` | Menu bar, secondary headers, scrollbar tracks |
| `#2c2c2c` | Application body, home page background |
| `#1a1a1a` | Agent and explorer interiors, popup body |
| `#222222` | Panel headers, popup header, node surfaces |
| `#333333` | Card backgrounds, modal borders, hover states |
| `#404040` | Utility buttons, dropdown borders, overlays |
| `#555555` | Workspace container background, scrollbar thumbs |
| `#666666` | Resize handles, placeholders, inactive controls |
| `#76B900` | NVIDIA accent for buttons, borders, highlights |
| `#4a90e2` | Active resize handle highlight, accent blue |
| `#f0f0f0` | Primary light text |
| `#b0b0b0` | Muted/status text |
| `#cccccc` | Secondary text, subtle separators |
| `#008000` | Temporary agent panel background (development aid) |
| `#0078d4` | Add-account primary action button |

## Built-in commands

- "clear" — Clear the command line history
- "open folders" — Open the Folders popup
- "open apps" — Open the Apps popup
- "open store" — Open the Store popup
- "open autocad"
- "open rhino8"
- "open sketchup"
- "open revit"
- "open d5render"
- "open photoshop"
- "open indesign" 
- "open chatgpt" 
- "open midjourney" 
- "open blender" 
- "open vscode" 
- "open openusd" 

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
| Explorer button (Open Project) | `.pm-btn` | `#1a1a1a` (border `#76B900`) | `pm/pm.css` |
| Explorer-resize handle | `.project-resize-handle` | `#666666` | `style.css` |
| Content modal overlay (backdrop) | `.content-modal-overlay.show` | `rgba(0,0,0,0.35)` | `style.css` |
| Content modal box | `.content-modal` | `#222222` | `style.css` |
| Agent panel container | `.chatbot-container` | `#008000` (`green`, visibility aid) | `style.css` |
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
- The Agent container's green background in `style.css` is for visibility during development and may be updated.

## Fonts and Typography

Below are the fonts used across the UI. Each row lists: 1) Component/Area, 2) Font Family, 3) Font Size, 4) Font Weight, 5) Font Color, 6) Where defined.

| Component/Area | Font Family | Font Size | Font Weight | Font Color | Defined In |
|----------------|-------------|-----------|-------------|------------|------------|
| Global default | `Arial, sans-serif` | `16px` (browser default) | `normal` | `#ffffff` | `style.css` body |
| Menu bar text | `Arial, sans-serif` | `12px` | `normal` | `#ffffff` | `style.css` |
| Function display prompt text | `Arial, sans-serif` | `11px` | `normal` | `#cccccc` | `style.css` |
| Function display command text | `Arial, sans-serif` | `11px` | `normal` | `#76B900` | `style.css` |
| Command line input | `'Courier New', Courier, monospace` | `14px` | `normal` | `#ffffff` | `style.css` |
| Explorer header title | `Arial, sans-serif` | `11px` | `normal` | `#cccccc` | `pm/pm.css` |
| Explorer button text | `Arial, sans-serif` | `12px` | `normal` | `#76B900` | `pm/pm.css` |
| Agent panel general | `Arial, sans-serif` | inherit | `normal` | `var(--agent-text)` (`#f0f0f0`) | `agent/agent.css` |
| Agent status text | `Arial, sans-serif` | `11px` | `normal` | `var(--agent-muted)` (`#b0b0b0`) | `agent/agent.css` |
| Agent message text | `Arial, sans-serif` | `12px` | `normal` | `var(--agent-text)` (`#f0f0f0`) | `agent/agent.css` |
| Agent input text | `Arial, sans-serif` | inherit | `normal` | `var(--agent-text)` (`#f0f0f0`) | `agent/agent.css` |
| Popup general | `Arial, sans-serif` | inherit | `normal` | `var(--agent-text)` (`#f0f0f0`) | `pages/popup.css` |
| Popup title | `Arial, sans-serif` | `11px` | `normal` | `var(--agent-muted)` (`#b0b0b0`) | `pages/popup.css` |
| Popup close button | `Arial, sans-serif` | `14px` | `normal` | `var(--agent-muted)` (`#b0b0b0`) | `pages/popup.css` |
| Popup option buttons | `Arial, sans-serif` | `14px` | `normal` | `#76B900` | `pages/popup.css` |
| Home page general | `Arial, sans-serif` | `16px` (browser default) | `normal` | `#ffffff` | `pages/home.css` |
| Home icon labels | `Arial, sans-serif` | `12px` | `normal` | `#ffffff` | `pages/home.css` |
| Folders header controls | `Arial, sans-serif` | `12px` | `normal` | `#ffffff` | `folders/folders.css` |
| Folders navigation buttons | `Arial, sans-serif` | `12px` | `normal` | `#76B900` | `folders/folders.css` |
| Folders input fields (path) | `Arial, sans-serif` | `12px` | `normal` | `#76B900` | `folders/folders.css` |
| Folders input fields (search) | `Arial, sans-serif` | `12px` | `normal` | `#fff` | `folders/folders.css` |
| Folders item list | `Arial, sans-serif` | `13px` | `normal` | `#ddd` | `folders/folders.css` |

Font Usage Notes:
- **Arial** is the global UI font across the application chrome and embedded surfaces.
- **Monospace fonts** (`'Courier New'`) power the command line input for a terminal feel, while history output remains proportional.
- **Arial** is used consistently across all panels (Agent, Explorer, Popup, Folders) for UI consistency.
- Font sizes range from 11px (small UI text) to 14px (buttons/emphasis)
- All text uses normal font weight - no bold styling is applied
- **NVIDIA Green** (`#76B900`) is used for interactive elements and accent text
- **Muted colors** (`#b0b0b0`, `#ccc`) are used for secondary/status text
- **Bright green** (`#76B900`) highlights command history callouts and actionable affordances