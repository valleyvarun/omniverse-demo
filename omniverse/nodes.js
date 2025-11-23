/* ==========================================================================
   DYNAMIC NODE CREATION
   ========================================================================== */

    /**
     * Creates a text node HTML structure and appends it to the document body.
     * @param {string} id - The ID of the node element.
     * @param {string} headerText - The text to display in the header.
     * @param {string} inputValue - The default value for the header input.
     * @param {string} dataSource - The data-source attribute for the script content.
     * @param {string} connectorName - The data-connector attribute for the output circle.
     */
    function createTextNode(id, headerText, inputValue, dataSource, connectorName) {
      const div = document.createElement('div');
      div.id = id;
      div.className = 'generic-node';
      div.innerHTML = `
        <div class="text-node">
          <div class="node-header">
            <div class="node-header-left">
              <div class="node-header-text">${headerText}</div>
            </div>
            <div class="node-header-center">
              <input class="node-header-name" type="text" value="${inputValue}">
            </div>
            <div class="node-header-right"></div>
          </div>
          <div class="node-body">
            <div class="node-input-block">
               <div class="node-inputs">
                 <div class="node-group">
                  <div class="node-circle"></div>
                </div>
               </div>
            </div>
            <div class="node-middle-block">
              <div class="script-block">
                <div class="line-numbers"></div>
                <div class="script-content" data-node-id="${id}" data-source="${dataSource}" spellcheck="false"></div>
              </div>
            </div>
            <div class="node-output-block">
               <div class="node-width-resize-bar"></div>
               <div class="node-outputs">
                <div class="node-group">
                  <div class="node-circle" data-connector="${connectorName}"></div>
                </div>
               </div>
            </div>
          </div>
          <div class="node-footer">
             <div class="node-height-resize-bar"></div>
          </div>
        </div>
      `;
      document.body.appendChild(div);
    }

    // Instantiate Text Nodes
    createTextNode('text-node1', 'Text', 'file name', 'text1.txt', 'text-node1-output');
    createTextNode('text-node2', 'Text', 'folder path', 'text2.txt', 'text-node2-output');

    /**
     * Creates an app node HTML structure and appends it to the document body.
     * @param {string} id - The ID of the node element.
     * @param {string} headerText - The text to display in the header.
     * @param {string} logoSrc - The source URL for the logo image.
     * @param {string[]} inputs - Array of input names (excluding 'queue').
     * @param {string[]} outputs - Array of output names (excluding 'output' and 'queue').
     * @param {string} [headerCenterHtml=''] - Optional HTML for the center of the header.
     * @param {boolean} [hasQueue=true] - Whether to include queue inputs/outputs.
     * @param {string} [middleLogoSrc=null] - Optional source URL for the middle block image.
     */
    function createAppNode(id, headerText, logoSrc, inputs, outputs, headerCenterHtml = '', hasQueue = true, middleLogoSrc = null) {
      const inputHtml = inputs.map(name => `
        <div class="node-group"><div class="node-circle"></div><div class="node-name">${name}</div></div>
      `).join('');

      const outputHtml = outputs.map(name => `
        <div class="node-group"><div class="node-name">${name}</div><div class="node-circle"></div></div>
      `).join('');

      const queueInputHtml = hasQueue ? '<div class="node-group"><div class="node-circle"></div><div class="node-name"><h1>queue</h1></div></div>' : '';
      const queueOutputHtml = hasQueue ? '<div class="node-group"><div class="node-name"><h1>queue</h1></div><div class="node-circle"></div></div>' : '';
      
      const actualMiddleLogo = middleLogoSrc || logoSrc;

      const div = document.createElement('div');
      div.id = id;
      div.className = 'generic-node';
      div.innerHTML = `
          <div class="node-header">
            <div class="node-header-left">
              <img class="node-header-logo" src="${logoSrc}" alt="logo">
              <div class="node-header-text">${headerText}</div>
            </div>
            <div class="node-header-center">
              ${headerCenterHtml}
            </div>
            <div class="node-header-right"></div>
          </div>

          <div class="node-body">
            <div class="node-input-block">
               <div class="node-inputs">
                ${queueInputHtml}
                <div class="node-group"><div class="node-circle"></div><div class="node-name">input</div></div>
                ${inputHtml}
               </div>
            </div>

            <div class="node-middle-block">
              <img src="${actualMiddleLogo}" alt="${headerText} logo" class="node-middle-block-logo">
            </div>

            <div class="node-output-block">
               <div class="node-width-resize-bar resize-handle" data-direction="e"></div>
               <div class="node-outputs">
                <div class="node-group"><div class="node-name">output</div><div class="node-circle"></div></div>
                ${outputHtml}
                ${queueOutputHtml}
               </div>
            </div>
          </div>

          <div class="node-footer">
             <div class="node-height-resize-bar resize-handle" data-direction="s"></div>
          </div>
      `;
      document.body.appendChild(div);
    }

    const appNodesConfig = [
      {
        id: 'revit-file-node',
        text: 'Revit File',
        logo: '../logo/revit-logo.png',
        inputs: ['file', 'folder', 'script', 'geometry', 'data', 'sheet'],
        outputs: ['BIM', 'geometry', 'schedules', 'sheets']
      },
      {
        id: 'sketchup-file-node',
        text: 'Sketchup File',
        logo: '../logo/sketchup-logo.png',
        inputs: ['file', 'folder', 'script', 'geometry', 'layout'],
        outputs: ['geometry', 'tags', 'groups', 'layout']
      },
      {
        id: 'autocad-file-node',
        text: 'AutoCAD File',
        logo: '../logo/autocad-logo.png',
        inputs: ['file', 'folder', 'script', 'geometry', 'layers', 'layout'],
        outputs: ['geometry', 'layers', 'groups', 'layout']
      },
      {
        id: 'rhino8-file-node',
        text: 'Rhino 8 File',
        logo: '../logo/rhino8-logo.png',
        inputs: ['file', 'folder', 'script', 'geometry', 'layers', 'layout'],
        outputs: ['geometry', 'layers', 'groups', 'layout']
      },
      {
        id: 'solidworks-file-node',
        text: 'SolidWorks File',
        logo: '../logo/solidworks-logo.png',
        inputs: ['file', 'folder', 'script', 'parts', 'assemblies', 'drawings'],
        outputs: ['geometry', 'BOM', 'metadata', 'sheet']
      },
      {
        id: 'python-process-node',
        text: ' ',
        logo: '../logo/python-logo.png',
        inputs: ['script', 'modules', 'data', 'env'],
        outputs: ['logs', 'artifacts'],
        headerCenter: `
          <label class="visually-hidden" for="python-env-select">Python Environment</label>
          <select id="python-env-select" class="node-language-select">
            <option value="3-11">Python 3.11</option>
            <option value="3-10">Python 3.10</option>
            <option value="3-9">Python 3.9</option>
          </select>
        `
      },
      {
        id: 'isaac-sim-node',
        text: 'Isaac Sim',
        logo: '../logo/isaac-sim-logo.png',
        inputs: ['scenario', 'robot', 'sensors', 'USD', 'script'],
        outputs: ['telemetry', 'synthetic data', 'robot state']
      },
      {
        id: 'unreal-engine-node',
        text: 'Unreal Engine',
        logo: '../logo/unrealengine-logo.png',
        inputs: ['project', 'assets', 'blueprints', 'USD', 'plugins'],
        outputs: ['levels', 'render', 'assets']
      },
      {
        id: 'premiere-pro-node',
        text: 'Premiere Pro',
        logo: '../logo/premierpro-logo.png',
        inputs: ['project', 'media', 'timeline', 'effects'],
        outputs: ['render', 'sequence', 'metadata']
      },
      {
        id: 'autocad-layers-node',
        text: 'layers',
        logo: '../logo/autocad-logo.png',
        inputs: [],
        outputs: ['layer1', 'layer2', 'layer3'],
        hasQueue: false,
        middleLogo: '../logo/layers-icon.png'
      }
    ];

    appNodesConfig.forEach(config => {
      createAppNode(config.id, config.text, config.logo, config.inputs, config.outputs, config.headerCenter, config.hasQueue, config.middleLogo);
    });



/* ==========================================================================
   LAYOUT SYNCHRONIZATION
   ========================================================================== */

    const headerFooterSyncById = {};

    /**
     * Ensures that a node's header and footer widths match its body width.
     * This is necessary because the body width can change based on content or resizing.
     * @param {HTMLElement} node - The node element to synchronize.
     */
    function ensureHeaderFooterSync(node) {
      if (!node || !node.id || headerFooterSyncById[node.id]) return;
      const header = node.querySelector('.node-header');
      const body = node.querySelector('.node-body');
      const footer = node.querySelector('.node-footer');
      if (!header || !body || !footer) return;

      const sync = () => {
        const bodyWidth = body.offsetWidth || body.clientWidth || body.getBoundingClientRect().width;
        if (!Number.isFinite(bodyWidth) || bodyWidth <= 0) return;
        header.style.width = bodyWidth + 'px';
        footer.style.width = bodyWidth + 'px';
      };

      // Initial sync
      sync();

      // Observe body resize to keep header/footer in sync
      const observer = new ResizeObserver(() => sync());
      observer.observe(body);
      window.addEventListener('resize', sync);
      headerFooterSyncById[node.id] = sync;
    }

    /**
     * Force synchronization of all registered nodes.
     */
    function syncAllHeadersFooters() {
      Object.values(headerFooterSyncById).forEach(syncFn => {
        if (typeof syncFn === 'function') {
          syncFn();
        }
      });
    }

















/* ==========================================================================
   GLOBAL VARIABLES & CONFIGURATION
   ========================================================================== */

    // Current world transform (provided by parent via postMessage)
    // These track the zoom level and pan offset of the node canvas
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    // DOM Elements for the node world and connection layer
    let world = document.getElementById('world');
    let connectionsSvg = document.getElementById('connections');
    const svgNS = 'http://www.w3.org/2000/svg';

    // Configuration for static connections (SVG based)
    const connectionDefs = [
      {
        id: 'start-to-runqueue',
        fromSelector: '[data-connector="start-output"]',
        toSelector: '[data-connector="run-queue-input"]'
      }
    ];

    // Constants for Node Selectors and Labels used in dynamic connections (P5.js)
    const START_NODE_SELECTOR = '#plexus-node';
    const QUEUE_NODE_SELECTOR = '#script-node';
    const BOOLEAN_NODE_SELECTOR = '#boolean-node';
    
    // Connector Labels (used to find specific connection points within nodes)
    const START_LABEL = 'start';
    const QUEUE_LABEL = 'queue';
    const RUN_INPUT_LABEL = 'run';
    const BOOLEAN_OUTPUT_LABEL = 'output';

    // Specific Connector Selectors
    const BOOLEAN_OUTPUT_CONNECTOR = '[data-connector="boolean-output"]';
    const RUN_INPUT_CONNECTOR = '[data-connector="plexus-run-input"]';
    const TEXT_NODE1_OUTPUT_CONNECTOR = '#text-node1 [data-connector="text-node1-output"]';
    const TEXT_NODE2_OUTPUT_CONNECTOR = '#text-node2 [data-connector="text-node2-output"]';
    const PLEXUS_FILE_INPUT_CONNECTOR = '[data-connector="plexus-file-input"]';
    const PLEXUS_FOLDER_INPUT_CONNECTOR = '[data-connector="plexus-folder-input"]';

    // Visual Styling Constants
    const START_QUEUE_LINE_COLOR = '#4c34eb';
    const BOOLEAN_LINE_COLOR = '#76B900';
    const CONNECTOR_INNER_RADIUS = 3;

    // P5.js Instance Management
    let startQueueSketchInstance = null;
    let p5LoadingPromise = null;

    // Collect all node elements, excluding the template
    const nodeEls = Array.from(document.querySelectorAll('.generic-node')).filter(el => el.id !== 'node-generic');

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

    // Ensure the 'world' container exists. This container holds all nodes and transforms them.
    if (!world) {
      world = document.createElement('div');
      world.id = 'world';
      world.style.position = 'absolute';
      world.style.left = '0';
      world.style.top = '0';
      world.style.width = '100%';
      world.style.height = '100%';
      world.style.transformOrigin = '0 0';
      document.body.insertBefore(world, document.body.firstChild || null);
    }

    // Move all nodes into the world container if they aren't already there
    nodeEls.forEach(el => {
      if (el.parentElement !== world) {
        world.appendChild(el);
      }
    });

    // Ensure the SVG layer for connections exists
    if (!connectionsSvg) {
      connectionsSvg = document.createElementNS(svgNS, 'svg');
      connectionsSvg.setAttribute('id', 'connections');
      connectionsSvg.setAttribute('xmlns', svgNS);
      connectionsSvg.style.position = 'absolute';
      connectionsSvg.style.left = '0';
      connectionsSvg.style.top = '0';
      connectionsSvg.style.width = '100%';
      connectionsSvg.style.height = '100%';
      connectionsSvg.style.pointerEvents = 'none'; // Let clicks pass through to nodes
      connectionsSvg.style.overflow = 'visible';
      world.appendChild(connectionsSvg);
    }

    // Initialize the P5.js sketch for drawing dynamic bezier curves
    initializeStartQueueLine();


/* ==========================================================================
   STATE MANAGEMENT & EDITOR LOGIC
   ========================================================================== */

    // Track layout state for each node by id (position, size, values)
    const nodeState = {};
    const nodeById = {};
    const middleBlockById = {};
    const middleBlockDefaultHeights = {};

    // Editor State
    let editingTextBlock = false; // Flag to check if user is currently editing text
    const textEditors = Array.from(document.querySelectorAll('.text-content, .script-content'));
    const editorResizeObservers = new WeakMap();
    const externalTextCache = new Map();
    
    // UI Controls
    const booleanToggleButtons = Array.from(document.querySelectorAll('.boolean-toggle'));
    const headerNameInputs = Array.from(document.querySelectorAll('.node-header-name'));

    /**
     * Fetches text content from an external file (e.g., for script nodes).
     * Caches the result to avoid redundant network requests.
     */
    function fetchExternalEditorText(path) {
      const normalized = (path || '').trim();
      if (!normalized) return Promise.resolve(null);
      if (externalTextCache.has(normalized)) {
        return externalTextCache.get(normalized);
      }
      const request = fetch(normalized)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load ${normalized}: ${response.status}`);
          }
          return response.text();
        })
        .catch(error => {
          console.warn('Failed to fetch editor content', normalized, error);
          return null;
        });
      externalTextCache.set(normalized, request);
      return request;
    }

    // Helper to escape HTML characters for safe rendering
    const escapeHtml = (value) => (value || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    // Configuration for syntax highlighting (currently supports C#)
    const languageTokenConfigs = {
      csharp: {
        keywords: new Set(['using','namespace','class','struct','enum','interface','public','private','protected','internal','static','readonly','const','void','int','string','var','new','return','true','false','if','else','for','foreach','while','do','switch','case','default','try','catch','finally','throw','this','bool','queue']),
        types: new Set(['Queue','RunQueue','List','Dictionary','String','Int32','Boolean'])
      }
    };

    /**
     * Tokenizes and highlights a single line of code.
     * @param {string} text - The line of code.
     * @param {string} language - The language to highlight (default: csharp).
     * @returns {string} HTML string with syntax highlighting spans.
     */
    function highlightLine(text, language = 'csharp') {
      if (text === undefined || text === null) return '';
      const config = languageTokenConfigs[language] || languageTokenConfigs.csharp;
      const isWordChar = (ch) => /[A-Za-z0-9_]/.test(ch);
      const isDigit = (ch) => /[0-9]/.test(ch);
      const wrap = (content, cls) => `<span class="${cls}">${escapeHtml(content)}</span>`;
      let result = '';
      let i = 0;
      const len = text.length;
      while (i < len) {
        const ch = text[i];
        const next = text[i + 1];
        // Comments
        if (ch === '/' && next === '/') {
          const comment = text.slice(i);
          result += wrap(comment, 'token-comment');
          break;
        }
        // Strings
        if (ch === '"') {
          let j = i + 1;
          let escaped = false;
          while (j < len) {
            if (!escaped && text[j] === '"') {
              j++;
              break;
            }
            escaped = !escaped && text[j] === '\\';
            j++;
          }
          const strLiteral = text.slice(i, j);
          result += wrap(strLiteral, 'token-string');
          i = j;
          continue;
        }
        // Numbers
        if (isDigit(ch)) {
          let j = i + 1;
          while (j < len && /[0-9xXa-fA-F_.]/.test(text[j])) j++;
          const numberLiteral = text.slice(i, j);
          result += wrap(numberLiteral, 'token-value');
          i = j;
          continue;
        }
        // Identifiers
        if (/[A-Za-z_]/.test(ch)) {
          let j = i + 1;
          while (j < len && isWordChar(text[j])) j++;
          const word = text.slice(i, j);
          let cls = '';
          if (config.keywords.has(word)) {
            cls = 'token-keyword';
          } else if (config.types.has(word) || /^[A-Z][A-Za-z0-9_]*$/.test(word)) {
            cls = 'token-type';
          } else if (word.startsWith('_')) {
            cls = 'token-field';
          } else {
            let k = j;
            while (k < len && /\s/.test(text[k])) k++;
            if (text[k] === '(') {
              cls = 'token-method';
            }
          }
          result += cls ? wrap(word, cls) : escapeHtml(word);
          i = j;
          continue;
        }
        // Other characters
        result += escapeHtml(ch);
        i++;
      }
      return result;
    }

    function renderHighlightedText(editor, rawText) {
      const language = editor?.dataset?.language || editor?.dataset?.lang || 'csharp';
      const lines = (rawText || '').split(/\n/);
      const fragments = lines.map(line => `<span class="code-line">${highlightLine(line, language) || '&nbsp;'}</span>`);
      editor.innerHTML = fragments.join('');
      return lines;
    }

    function refreshEditorContent(editor) {
      if (!editor) return;
      const textContent = (editor.innerText || '').replace(/\u00a0/g, ' ');
      renderHighlightedText(editor, textContent);
      updateLineNumbers(editor);
    }





















/* ==========================================================================
   BOOLEAN TOGGLE LOGIC
   ========================================================================== */

    /**
     * Updates the visual state of a boolean toggle button.
     */
    function setBooleanToggleState(button, nextState) {
      const normalized = !!nextState;
      button.dataset.state = normalized ? 'true' : 'false';
      button.textContent = normalized ? 'True' : 'False';
      button.classList.toggle('is-true', normalized);
      button.classList.toggle('is-false', !normalized);
      button.setAttribute('aria-pressed', normalized ? 'true' : 'false');
    }

    function getBooleanToggleState(button) {
      return (button?.dataset?.state || '').toLowerCase() === 'true';
    }

    /**
     * Persists the boolean state to the node's state object and optionally publishes it.
     */
    function storeBooleanToggleState(button, value, { publish = true } = {}) {
      const node = button.closest('.generic-node');
      if (!node || !node.id) return;
      const key = button.dataset.booleanKey || 'value';
      const state = nodeState[node.id] || (nodeState[node.id] = {});
      const target = state.booleanValues || (state.booleanValues = {});
      target[key] = !!value;
      if (publish) {
        publishNodesState();
      }
    }

    /**
     * Initializes a boolean toggle button based on stored state or default DOM state.
     */
    function initializeBooleanToggle(button) {
      const node = button.closest('.generic-node');
      const key = button.dataset.booleanKey || 'value';
      const stored = node?.id ? nodeState[node.id]?.booleanValues?.[key] : undefined;
      const initialValue = typeof stored === 'boolean' ? stored : getBooleanToggleState(button);
      setBooleanToggleState(button, initialValue);
      storeBooleanToggleState(button, initialValue, { publish: false });
    }

    /**
     * Refreshes all boolean toggles from the current nodeState.
     */
    function refreshBooleanToggleUI() {
      booleanToggleButtons.forEach(button => {
        const node = button.closest('.generic-node');
        if (!node || !node.id) return;
        const key = button.dataset.booleanKey || 'value';
        const stored = nodeState[node.id]?.booleanValues?.[key];
        if (typeof stored === 'boolean') {
          setBooleanToggleState(button, stored);
        }
      });
    }











/* ==========================================================================
   EDITOR INITIALIZATION & EVENTS
   ========================================================================== */

    /**
     * Loads content into an editor, either from the DOM or an external source.
     */
    function initializeEditorContent(editor) {
      const sourcePath = editor?.dataset?.source || editor?.dataset?.src;
      if (!sourcePath) {
        const initialText = editor.textContent || '';
        renderHighlightedText(editor, initialText);
        updateLineNumbers(editor);
        return;
      }
      fetchExternalEditorText(sourcePath)
        .then(text => {
          if (typeof text === 'string') {
            const normalizedText = text.replace(/\r\n?/g, '\n');
            renderHighlightedText(editor, normalizedText);
          }
        })
        .finally(() => updateLineNumbers(editor));
    }

    function observeEditorSize(editor) {
      if (!window.ResizeObserver || !editor || editorResizeObservers.has(editor)) return;
      const observer = new ResizeObserver(() => updateLineNumbers(editor));
      observer.observe(editor);
      editorResizeObservers.set(editor, observer);
    }

    // Attach event listeners to all text editors
    textEditors.forEach(editor => {
      editor.setAttribute('contenteditable', 'false');
      
      // Double click to start editing
      editor.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startEditingTextBlock(editor);
      });
      
      // Blur to stop editing
      editor.addEventListener('blur', () => endEditingTextBlock(editor));
      
      // Escape to cancel editing
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          editor.blur();
        }
      });
      
      // Input handling for live updates
      editor.addEventListener('input', () => {
        if (editor.isContentEditable && editor.classList.contains('editing')) {
          updateLineNumbers(editor);
        } else {
          refreshEditorContent(editor);
        }
      });
      
      observeEditorSize(editor);
      initializeEditorContent(editor);
    });

    booleanToggleButtons.forEach(button => {
      initializeBooleanToggle(button);
      const toggle = () => {
        const next = !getBooleanToggleState(button);
        setBooleanToggleState(button, next);
        storeBooleanToggleState(button, next);
      };
      button.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      });
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });

    headerNameInputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          input.blur();
          try {
            window.top.postMessage({ type: 'focusCommand' }, '*');
          } catch (_) {}
        }
      });
    });

    window.addEventListener('resize', () => {
      textEditors.forEach(editor => updateLineNumbers(editor));
    });

    function startEditingTextBlock(editor) {
      editingTextBlock = true;
      const block = editor.closest('.text-block, .script-block');
      if (block) block.classList.add('editing');
      editor.classList.add('editing');
      editor.setAttribute('contenteditable', 'true');
      const plainText = (editor.innerText || '').replace(/\u00a0/g, ' ');
      editor.textContent = plainText;
      updateLineNumbers(editor);
      editor.focus();
      // move caret to end
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function endEditingTextBlock(editor) {
      if (!editingTextBlock) return;
      const block = editor.closest('.text-block, .script-block');
      if (block) block.classList.remove('editing');
      editor.classList.remove('editing');
      editor.setAttribute('contenteditable', 'false');
      const textContent = (editor.innerText || '').replace(/\u00a0/g, ' ');
      renderHighlightedText(editor, textContent);
      editingTextBlock = false;
      updateLineNumbers(editor);
      try {
        window.top.postMessage({ type: 'focusCommand' }, '*');
      } catch (_) {}
    }

    function updateLineNumbers(editor) {
      const block = editor.closest('.text-block, .script-block');
      if (!block) return;
      const column = block.querySelector('.line-numbers');
      if (!column) return;
      const text = editor.innerText.replace(/\u00a0/g, ' ');
      const lines = text.split(/\n/);
      const codeLineEls = Array.from(editor.querySelectorAll('.code-line'));
      const cs = window.getComputedStyle(editor);
      const fallbackFontSize = parseFloat(cs.fontSize) || 16;
      const rawLineHeight = parseFloat(cs.lineHeight);
      const lineHeight = Number.isFinite(rawLineHeight) && rawLineHeight > 0 ? rawLineHeight : fallbackFontSize;
      column.style.fontFamily = cs.fontFamily || column.style.fontFamily;
      column.style.fontSize = cs.fontSize || column.style.fontSize;
      column.style.fontWeight = cs.fontWeight || column.style.fontWeight;
      column.style.lineHeight = lineHeight + 'px';
      const applyRowMetrics = (el, heightPx) => {
        const height = Math.max(lineHeight, heightPx || lineHeight);
        el.style.minHeight = height + 'px';
        el.style.height = height + 'px';
        el.style.lineHeight = lineHeight + 'px';
      };

      column.innerHTML = '';
      lines.forEach((lineText, index) => {
        let renderedHeight = null;
        const codeLine = codeLineEls[index];
        if (codeLine) {
          const rect = codeLine.getBoundingClientRect();
          renderedHeight = Math.max(rect.height, codeLine.offsetHeight);
        } else {
          const spanTexEl = document.createElement('span');
          spanTexEl.className = 'code-line';
          spanTexEl.textContent = lineText || '\u200B';
          editor.appendChild(spanTexEl);
          const rect = spanTexEl.getBoundingClientRect();
          renderedHeight = Math.max(rect.height, spanTexEl.offsetHeight);
          editor.removeChild(spanTexEl);
        }
        const numberDiv = document.createElement('div');
        numberDiv.textContent = index + 1;
        applyRowMetrics(numberDiv, renderedHeight);
        column.appendChild(numberDiv);
      });
    }











/* ==========================================================================
   NODE POSITIONING & LAYOUT
   ========================================================================== */

    // Initialize node positions from computed styles (left/top from CSS) or defaults
    nodeEls.forEach(el => {
      if (!el.id) return;
      nodeById[el.id] = el;
      ensureHeaderFooterSync(el);
      
      // Read initial position from CSS
      const cs = getComputedStyle(el);
      const wx = parseFloat(cs.left) || 0;
      const wy = parseFloat(cs.top) || 0;
      
      // Store in state
      const state = nodeState[el.id] || (nodeState[el.id] = {});
      state.x = wx;
      state.y = wy;
      
      // Ensure positions are applied inline so future updates are consistent
      el.style.left = wx + 'px';
      el.style.top  = wy + 'px';

      // Handle middle block sizing (for resizable nodes)
      const middleBlock = el.querySelector('.node-middle-block');
      if (middleBlock) {
        middleBlockById[el.id] = middleBlock;
        const middleCs = getComputedStyle(middleBlock);
        const rect = middleBlock.getBoundingClientRect();
        const defaultHeight = middleBlock.offsetHeight || parseFloat(middleCs.height) || rect.height || 0;
        middleBlockDefaultHeights[el.id] = defaultHeight;
        
        if (defaultHeight > 0) {
          middleBlock.style.minHeight = defaultHeight + 'px';
        }
        
        const initialWidth = parseFloat(middleCs.width);
        const initialHeight = parseFloat(middleCs.height);
        const widthVal = Number.isFinite(initialWidth) && initialWidth > 0 ? initialWidth : rect.width;
        const heightVal = Number.isFinite(initialHeight) && initialHeight > 0 ? initialHeight : rect.height;
        
        if (Number.isFinite(widthVal) && widthVal > 0) {
          state.width = widthVal;
        }
        if (Number.isFinite(heightVal) && heightVal > 0) {
          state.height = heightVal;
        }
      }
    });

    /**
     * Updates the world container's transform based on current scale and offset.
     */
    function updateWorldTransform() {
      if (world) {
        world.style.transformOrigin = '0 0';
        world.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      }
      syncAllHeadersFooters();
      updateConnections();
    }

    function updateAllNodePositions() {
      Object.entries(nodeState).forEach(([id, state]) => {
        if (!state) return;
        const el = nodeById[id];
        if (!el) return;
        ensureHeaderFooterSync(el);
        if (Number.isFinite(state.x)) {
          el.style.left = state.x + 'px';
        }
        if (Number.isFinite(state.y)) {
          el.style.top = state.y + 'px';
        }
        let middleBlock = middleBlockById[id];
        if (!middleBlock) {
          middleBlock = el.querySelector('.node-middle-block');
          if (middleBlock) {
            middleBlockById[id] = middleBlock;
          }
        }
        if (middleBlock) {
          const defaultHeight = middleBlockDefaultHeights[id];
          if (defaultHeight && defaultHeight > 0) {
            middleBlock.style.minHeight = defaultHeight + 'px';
          }
          if (Number.isFinite(state.width)) {
            middleBlock.style.width = state.width + 'px';
          }
          if (Number.isFinite(state.height)) {
            middleBlock.style.height = state.height + 'px';
          }
        }
        const sync = headerFooterSyncById[id];
        if (typeof sync === 'function') sync();
      });
      publishNodesState();
      syncAllHeadersFooters();
      updateConnections();
    }

/* ==========================================================================
   INTERACTION: DRAG & DROP
   ========================================================================== */

    // Drag State
    let dragging = false;
    let draggingNodeId = null;
    let dragStartSX = 0, dragStartSY = 0; // Screen coordinates
    let startWX = 0, startWY = 0; // World coordinates

    // Resize State
    let resizing = false;
    let resizingNode = null;
    let resizeStartSX = 0, resizeStartSY = 0;
    let resizeStartWidth = 0, resizeStartHeight = 0;
    let resizeDirection = 'se';
    let resizeTarget = null;
    let resizeMinWidth = 0;
    let resizeMinHeight = 0;

    function setDraggingCursor(isActive, targetNode) {
      if (isActive) {
        document.body.style.cursor = 'grabbing';
        if (world) world.style.cursor = 'grabbing';
        if (targetNode) targetNode.style.cursor = 'grabbing';
      } else {
        document.body.style.cursor = '';
        if (world) world.style.cursor = '';
        if (targetNode) targetNode.style.cursor = '';
      }
    }

    // Attach drag handlers to all nodes
    nodeEls.forEach(el => {
      el.addEventListener('mousedown', (e) => {
        // Only left or middle button
        if (e.button !== 0 && e.button !== 1) return;
        
        // Don't start dragging when interacting with controls (e.g., buttons inside node)
        if (e.target.closest('button, input, textarea, select, .text-block, .text-content, .script-block, .script-content')) return;
        
        e.preventDefault();
        if (!el.id) return;
        
        // Bring clicked node to front
        nodeEls.forEach(n => n.style.zIndex = '1');
        el.style.zIndex = '10';
        
        // Initialize drag state
        dragging = true;
        draggingNodeId = el.id;
        dragStartSX = e.clientX;
        dragStartSY = e.clientY;
        
        const state = nodeState[draggingNodeId] || (nodeState[draggingNodeId] = {});
        startWX = Number.isFinite(state.x) ? state.x : 0;
        startWY = Number.isFinite(state.y) ? state.y : 0;
        
        setDraggingCursor(true, el);
      });
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dSX = e.clientX - dragStartSX;
      const dSY = e.clientY - dragStartSY;
      const nx = startWX + dSX / scale; // convert screen delta to world delta
      const ny = startWY + dSY / scale;
      if (draggingNodeId) {
        const state = nodeState[draggingNodeId] || (nodeState[draggingNodeId] = {});
        state.x = nx;
        state.y = ny;
        const el = nodeById[draggingNodeId];
        if (el) {
          el.style.left = nx + 'px';
          el.style.top = ny + 'px';
        }
        publishNodesState();
        updateConnections();
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (!resizing || !resizingNode || !resizeTarget) return;
      const dSX = e.clientX - resizeStartSX;
      const dSY = e.clientY - resizeStartSY;
      const nodeId = resizingNode.id;
      if (!nodeId) return;
      const state = nodeState[nodeId] || (nodeState[nodeId] = {});
      let changed = false;
      if (resizeDirection.includes('e')) {
        const newWidth = Math.max(resizeMinWidth, resizeStartWidth + dSX / scale);
        resizeTarget.style.width = newWidth + 'px';
        if (state.width !== newWidth) {
          state.width = newWidth;
          changed = true;
        }
      }
      if (resizeDirection.includes('s')) {
        const newHeight = Math.max(resizeMinHeight, resizeStartHeight + dSY / scale);
        resizeTarget.style.height = newHeight + 'px';
        if (state.height !== newHeight) {
          state.height = newHeight;
          changed = true;
        }
      }
      if (changed) {
        publishNodesState();
        const sync = headerFooterSyncById[nodeId];
        if (typeof sync === 'function') sync();
      }
      updateConnections();
    });
    window.addEventListener('mouseup', () => {
      const wasDraggingId = draggingNodeId;
      const wasResizing = resizing;
      dragging = false;
      draggingNodeId = null;
      if (wasDraggingId) {
        const draggedNode = nodeById[wasDraggingId];
        setDraggingCursor(false, draggedNode);
      } else if (!resizing) {
        setDraggingCursor(false, null);
      }
      if (resizing && resizingNode) {
        resizingNode.classList.remove('resizing');
      }
      resizing = false;
      resizingNode = null;
      resizeTarget = null;
      if (wasResizing) {
        publishNodesState();
        setDraggingCursor(false, null);
      }
    });

    window.addEventListener('resize', () => updateConnections());

    const resizeHandles = Array.from(document.querySelectorAll('.resize-handle, .node-width-resize-bar, .node-height-resize-bar'));
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const node = handle.closest('.generic-node');
        if (!node || node.id === 'node-generic') return;
        const middleBlock = node.querySelector('.node-middle-block');
        if (!middleBlock) return;
        ensureHeaderFooterSync(node);
        resizing = true;
        resizingNode = node;
        resizeTarget = middleBlock;
        resizeStartSX = e.clientX;
        resizeStartSY = e.clientY;
        const cs = getComputedStyle(middleBlock);
        const state = nodeState[node.id] || (nodeState[node.id] = {});
        const computedWidth = parseFloat(cs.width) || middleBlock.offsetWidth || middleBlock.getBoundingClientRect().width || 0;
        const computedHeight = parseFloat(cs.height) || middleBlock.offsetHeight || middleBlock.getBoundingClientRect().height || 0;
        resizeStartWidth = Number.isFinite(state.width) ? state.width : computedWidth;
        resizeStartHeight = Number.isFinite(state.height) ? state.height : computedHeight;
        resizeMinWidth = Math.max(parseFloat(cs.minWidth) || 0, 40);
        const parsedMinHeight = parseFloat(cs.minHeight);
        if (Number.isFinite(parsedMinHeight) && parsedMinHeight > 0) {
          resizeMinHeight = parsedMinHeight;
        } else {
          const storedHeight = middleBlockDefaultHeights[node.id];
          resizeMinHeight = storedHeight && storedHeight > 0 ? storedHeight : 40;
        }
        const dirAttr = handle.dataset.direction;
        if (dirAttr) {
          resizeDirection = dirAttr;
        } else if (handle.classList.contains('node-width-resize-bar')) {
          resizeDirection = 'e';
        } else if (handle.classList.contains('node-height-resize-bar')) {
          resizeDirection = 's';
        } else {
          resizeDirection = 'se';
        }
        node.classList.add('resizing');
        if (Number.isFinite(resizeStartWidth) && resizeStartWidth > 0) {
          resizeTarget.style.width = resizeStartWidth + 'px';
        }
        if (Number.isFinite(resizeStartHeight) && resizeStartHeight > 0) {
          resizeTarget.style.height = resizeStartHeight + 'px';
        }
        const sync = headerFooterSyncById[node.id];
        if (typeof sync === 'function') sync();
      });
    });

/* ==========================================================================
   STATE PERSISTENCE
   ========================================================================== */

    /**
     * Collects the current state of all nodes (position, size, values)
     * and sends it to the parent window for saving/persistence.
     */
    function publishNodesState() {
      try {
        const payload = Object.entries(nodeState).map(([id, state]) => {
          const entry = {
            id,
            x: Number.isFinite(state?.x) ? state.x : 0,
            y: Number.isFinite(state?.y) ? state.y : 0
          };
          if (Number.isFinite(state?.width)) {
            entry.width = state.width;
          }
          if (Number.isFinite(state?.height)) {
            entry.height = state.height;
          }
          if (state?.booleanValues && typeof state.booleanValues === 'object') {
            const booleanEntries = Object.entries(state.booleanValues).filter(([, val]) => typeof val === 'boolean');
            if (booleanEntries.length) {
              entry.booleanValues = Object.fromEntries(booleanEntries);
            }
          }
          return entry;
        });
        window.top.postMessage({ type: 'nodes:state', nodes: payload }, '*');
      } catch (_) {}
    }

    function getConnectorCenter(el) {
      if (!el || !world) return null;
      const inner = el.querySelector('.connector-inner');
      const target = inner || el;
      const rect = target.getBoundingClientRect();
      const worldRect = world.getBoundingClientRect();
      const x = (rect.left + rect.width / 2 - worldRect.left) / scale;
      const y = (rect.top + rect.height / 2 - worldRect.top) / scale;
      return { x, y };
    }

    function getLabeledConnectorCircle(nodeSelector, label, type) {
      const node = document.querySelector(nodeSelector);
      if (!node || !label) return null;
      const searchValue = String(label).trim().toLowerCase();
      if (!searchValue) return null;
      
      let container = node;
      if (type === 'input') container = node.querySelector('.node-inputs');
      else if (type === 'output') container = node.querySelector('.node-outputs');
      
      if (!container) return null;

      const groups = container.querySelectorAll('.node-group');
      for (const group of groups) {
        const nameEl = group.querySelector('.node-name');
        const text = (nameEl?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (text.includes(searchValue)) {
          return group.querySelector('.node-circle');
        }
      }
      return null;
    }

    function resolveConnectorEndpoint(def) {
      if (!def) return null;
      if (def.selector) {
        return document.querySelector(def.selector);
      }
      if (def.nodeSelector && def.label) {
        return getLabeledConnectorCircle(def.nodeSelector, def.label, def.type);
      }
      if (def.element instanceof Element) {
        return def.element;
      }
      return null;
    }

    function computeBezierControls(startPoint, endPoint) {
      if (!startPoint || !endPoint) return null;
      const dx = endPoint.x - startPoint.x;
      const direction = dx >= 0 ? 1 : -1;
      const ctrlOffset = Math.max(60, Math.abs(dx) * 0.35);
      return {
        cp1: { x: startPoint.x + direction * ctrlOffset, y: startPoint.y },
        cp2: { x: endPoint.x - direction * ctrlOffset, y: endPoint.y }
      };
    }

/* ==========================================================================
   CONNECTIONS (SVG & P5.JS)
   ========================================================================== */

    /**
     * Updates the static SVG connections based on current node positions.
     */
    function updateConnections() {
      if (!connectionsSvg) return;
      connectionsSvg.innerHTML = '';
      connectionDefs.forEach(def => {
        const fromEl = document.querySelector(def.fromSelector);
        const toEl = document.querySelector(def.toSelector);
        if (!fromEl || !toEl) return;
        const start = getConnectorCenter(fromEl);
        const end = getConnectorCenter(toEl);
        if (!start || !end) return;
        
        // Calculate bezier control points
        const ctrlOffset = Math.max(40, Math.abs(end.x - start.x) * 0.35);
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', `M${start.x},${start.y} C${start.x + ctrlOffset},${start.y} ${end.x - ctrlOffset},${end.y} ${end.x},${end.y}`);
        path.setAttribute('class', 'connection-path');
        connectionsSvg.appendChild(path);
      });
    }

    function initializeStartQueueLine() {
      loadP5Library()
        .then(() => createStartQueueSketch())
        .catch(err => console.warn('Failed to load p5.js for start->queue line', err));
    }

    function loadP5Library() {
      if (window.p5) return Promise.resolve(window.p5);
      if (p5LoadingPromise) return p5LoadingPromise;
      p5LoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js';
        script.async = true;
        script.onload = () => resolve(window.p5);
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
      return p5LoadingPromise;
    }

    function createStartQueueSketch() {
      if (!window.p5 || startQueueSketchInstance || !world) return;
      const sketch = (p) => {
        let canvas;
        let canvasBounds = { x: 0, y: 0, w: 0, h: 0 };

        function placeCanvasAtWorldRoot(element) {
          element.style.position = 'absolute';
          element.style.left = '0';
          element.style.top = '0';
          element.style.pointerEvents = 'none';
          element.style.userSelect = 'none';
          element.style.zIndex = '999';
          element.setAttribute('aria-hidden', 'true');
          world.appendChild(element);
        }

        p.setup = () => {
          const { width, height } = getCanvasViewportSize();
          canvas = p.createCanvas(width, height);
          canvas.id('start-queue-connector');
          canvas.elt.style.backgroundColor = 'transparent';
          placeCanvasAtWorldRoot(canvas.elt);
          p.pixelDensity(window.devicePixelRatio || 1);
          p.noFill();
          p.strokeCap(p.ROUND);
          
          // Initialize bounds
          canvasBounds = { x: 0, y: 0, w: width, h: height };
        };

        // We handle resizing manually in draw loop based on node positions
        // p.windowResized = () => resizeCanvasToViewport();

        const bezierConnections = [
          {
            from: { nodeSelector: START_NODE_SELECTOR, label: START_LABEL },
            to: { nodeSelector: QUEUE_NODE_SELECTOR, label: QUEUE_LABEL },
            color: START_QUEUE_LINE_COLOR
          },
          {
            from: { selector: BOOLEAN_OUTPUT_CONNECTOR },
            to: { selector: RUN_INPUT_CONNECTOR },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { selector: TEXT_NODE1_OUTPUT_CONNECTOR },
            to: { selector: PLEXUS_FILE_INPUT_CONNECTOR },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { selector: TEXT_NODE2_OUTPUT_CONNECTOR },
            to: { selector: PLEXUS_FOLDER_INPUT_CONNECTOR },
            color: BOOLEAN_LINE_COLOR
          },
          
          {
            from: { nodeSelector: '#autocad-file-node', label: 'layers', type: 'output' },
            to: { nodeSelector: '#autocad-layers-node', label: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#autocad-layers-node', label: 'layer1' },
            to: { nodeSelector: '#sketchup-file-node', label: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#autocad-layers-node', label: 'layer2' },
            to: { nodeSelector: '#rhino8-file-node', label: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#autocad-layers-node', label: 'layer3' },
            to: { nodeSelector: '#revit-file-node', label: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#sketchup-file-node', label: 'geometry', type: 'output' },
            to: { nodeSelector: '#revit-file-node', label: 'geometry', type: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#rhino8-file-node', label: 'geometry', type: 'output' },
            to: { nodeSelector: '#revit-file-node', label: 'geometry', type: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#revit-file-node', label: 'output', type: 'output' },
            to: { nodeSelector: '#isaac-sim-node', label: 'scenario', type: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#python-process-node', label: 'output', type: 'output' },
            to: { nodeSelector: '#isaac-sim-node', label: 'script', type: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#solidworks-file-node', label: 'output', type: 'output' },
            to: { nodeSelector: '#isaac-sim-node', label: 'robot', type: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#isaac-sim-node', label: 'output', type: 'output' },
            to: { nodeSelector: '#unreal-engine-node', label: 'input', type: 'input' },
            color: BOOLEAN_LINE_COLOR
          },
          {
            from: { nodeSelector: '#unreal-engine-node', label: 'render', type: 'output' },
            to: { nodeSelector: '#premiere-pro-node', label: 'media', type: 'input' },
            color: BOOLEAN_LINE_COLOR
          }
        ];

        p.draw = () => {
          if (!canvas) return;
          
          // Calculate required bounds based on all nodes
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          const ids = Object.keys(nodeState);
          
          // If no nodes, default to viewport
          if (ids.length === 0) {
             minX = 0; minY = 0; 
             const vp = getCanvasViewportSize();
             maxX = vp.width; maxY = vp.height;
          } else {
             ids.forEach(id => {
                 const s = nodeState[id];
                 const x = s.x || 0;
                 const y = s.y || 0;
                 const w = s.width || 200; 
                 const h = s.height || 100;
                 if (x < minX) minX = x;
                 if (y < minY) minY = y;
                 if (x + w > maxX) maxX = x + w;
                 if (y + h > maxY) maxY = y + h;
             });
          }
          
          // Add padding
          const padding = 500;
          minX -= padding;
          minY -= padding;
          maxX += padding;
          maxY += padding;
          
          // Check if we need to expand canvas
          const curX = canvasBounds.x;
          const curY = canvasBounds.y;
          const curW = canvasBounds.w;
          const curH = canvasBounds.h;
          
          let needsResize = false;
          if (minX < curX || minY < curY || maxX > curX + curW || maxY > curY + curH) {
              needsResize = true;
          }
          
          if (needsResize) {
              // Expand to cover new area + extra buffer
              const buffer = 500;
              const newX = Math.min(minX, curX) - (minX < curX ? buffer : 0);
              const newY = Math.min(minY, curY) - (minY < curY ? buffer : 0);
              const newRight = Math.max(maxX, curX + curW) + (maxX > curX + curW ? buffer : 0);
              const newBottom = Math.max(maxY, curY + curH) + (maxY > curY + curH ? buffer : 0);
              
              const newW = newRight - newX;
              const newH = newBottom - newY;
              
              p.resizeCanvas(newW, newH);
              canvas.elt.style.left = newX + 'px';
              canvas.elt.style.top = newY + 'px';
              
              canvasBounds = { x: newX, y: newY, w: newW, h: newH };
          }

          p.clear();
          
          // Translate drawing context to align with world coordinates
          p.push();
          p.translate(-canvasBounds.x, -canvasBounds.y);
          
          bezierConnections.forEach(def => {
            const startCircle = resolveConnectorEndpoint(def.from);
            const endCircle = resolveConnectorEndpoint(def.to);
            const startPoint = getConnectorCenter(startCircle);
            const endPoint = getConnectorCenter(endCircle);
            
            if (!startPoint || !endPoint) return;
            
            const controls = computeBezierControls(startPoint, endPoint);
            if (!controls) return;
            p.stroke(def.color || START_QUEUE_LINE_COLOR);
            p.strokeWeight(2);
            p.noFill();
            p.bezier(
              startPoint.x,
              startPoint.y,
              controls.cp1.x,
              controls.cp1.y,
              controls.cp2.x,
              controls.cp2.y,
              endPoint.x,
              endPoint.y
            );
            p.noStroke();
            p.fill(def.color || START_QUEUE_LINE_COLOR);
            const diameter = CONNECTOR_INNER_RADIUS * 2;
            p.circle(startPoint.x, startPoint.y, diameter);
            p.circle(endPoint.x, endPoint.y, diameter);
          });
          
          p.pop();
        };
      };

      startQueueSketchInstance = new window.p5(sketch);
    }

    function getCanvasViewportSize() {
      const docEl = document.documentElement;
      const body = document.body;
      const width = Math.max(window.innerWidth || 0, docEl?.clientWidth || 0, body?.clientWidth || 0);
      const height = Math.max(window.innerHeight || 0, docEl?.clientHeight || 0, body?.clientHeight || 0);
      return { width, height };
    }

/* ==========================================================================
   MESSAGING & GLOBAL EVENTS
   ========================================================================== */

    // Request saved node state from top on load
    try { window.top.postMessage({ type: 'nodes:requestState' }, '*'); } catch (_) {}

    // Apply restored nodes positions
    window.addEventListener('message', (ev) => {
      const data = ev.data || {};
      if (data.type === 'nodes:restore' && Array.isArray(data.nodes)) {
        data.nodes.forEach(n => {
          if (!n || typeof n.id !== 'string') return;
          const state = nodeState[n.id] || (nodeState[n.id] = {});
          if (typeof n.x === 'number') {
            state.x = n.x;
          }
          if (typeof n.y === 'number') {
            state.y = n.y;
          }
          if (typeof n.width === 'number') {
            state.width = n.width;
          }
          if (typeof n.height === 'number') {
            state.height = n.height;
          }
          if (n.booleanValues && typeof n.booleanValues === 'object') {
            const target = state.booleanValues || (state.booleanValues = {});
            Object.entries(n.booleanValues).forEach(([key, val]) => {
              if (typeof val === 'boolean') {
                target[key] = val;
              }
            });
          }
        });
        updateAllNodePositions();
        refreshBooleanToggleUI();
      }
    });

    // Receive world transform from parent
    window.addEventListener('message', (ev) => {
      const data = ev.data || {};
      if (data.type === 'world:transform') {
        scale = data.scale;
        offsetX = data.offsetX;
        offsetY = data.offsetY;
        updateWorldTransform();
      }
    });

    // Forward wheel events to parent so zoom works over the nodes layer too
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      // Send to parent (plexus.html), not top, so it can handle zoom
      window.parent.postMessage({ type: 'world:wheel', clientX: e.clientX, clientY: e.clientY, deltaY: e.deltaY }, '*');
    }, { passive: false });

    // Any click inside nodes iframe should route focus back to the command line in the top window
    document.addEventListener('click', (e) => {
      if (editingTextBlock) return;
      if (e.target.closest('.text-block, .text-content, .script-block, .script-content, .script-language-select, .node-language-select, .node-header-name')) return;
      try {
        window.top.postMessage({ type: 'focusCommand' }, '*');
      } catch (_) {}
    });

    // Background double-click should prefill command input with "add: "
    document.addEventListener('dblclick', (e) => {
      if (e.target.closest('.generic-node, button, input, textarea, select, .text-block, .text-content, .script-block, .script-content')) return;
      try {
        window.top.postMessage({ type: 'command:prefill', value: 'add: ' }, '*');
      } catch (_) {}
    });

    // Background panning support: when clicking NOT on a node, pan the world via parent
    let bgPanning = false;
    document.addEventListener('mousedown', (e) => {
      // Ignore if starting on a node (node dragging takes priority)
      if (e.target.closest('.generic-node')) return;
      // Only left or middle button
      if (e.button !== 0 && e.button !== 1) return;
      e.preventDefault();
      bgPanning = true;
      window.parent.postMessage({ type: 'world:panStart', clientX: e.clientX, clientY: e.clientY }, '*');
    });
    window.addEventListener('mousemove', (e) => {
      if (!bgPanning) return;
      window.parent.postMessage({ type: 'world:panMove', clientX: e.clientX, clientY: e.clientY }, '*');
    });
    window.addEventListener('mouseup', () => {
      if (!bgPanning) return;
      bgPanning = false;
      window.parent.postMessage({ type: 'world:panEnd' }, '*');
    });

    // Initial paint
  updateWorldTransform();
  updateAllNodePositions();
    refreshBooleanToggleUI();
