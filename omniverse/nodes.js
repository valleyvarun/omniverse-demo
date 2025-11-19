  // Current world transform (provided by parent)
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    // World/nodes setup
    let world = document.getElementById('world');
    let connectionsSvg = document.getElementById('connections');
    const svgNS = 'http://www.w3.org/2000/svg';
    const connectionDefs = [
      {
        id: 'start-to-runqueue',
        fromSelector: '[data-connector="start-output"]',
        toSelector: '[data-connector="run-queue-input"]'
      }
    ];
    const START_NODE_SELECTOR = '#plexus-node';
    const QUEUE_NODE_SELECTOR = '#script-node';
    const BOOLEAN_NODE_SELECTOR = '#boolean-node';
    const START_LABEL = 'start';
    const QUEUE_LABEL = 'queue';
    const RUN_INPUT_LABEL = 'run';
    const BOOLEAN_OUTPUT_LABEL = 'output';
    const BOOLEAN_OUTPUT_CONNECTOR = '[data-connector="boolean-output"]';
    const RUN_INPUT_CONNECTOR = '[data-connector="plexus-run-input"]';
    const TEXT_NODE1_OUTPUT_CONNECTOR = '#text-node1 [data-connector="text-node1-output"]';
    const TEXT_NODE2_OUTPUT_CONNECTOR = '#text-node2 [data-connector="text-node2-output"]';
    const PLEXUS_FILE_INPUT_CONNECTOR = '[data-connector="plexus-file-input"]';
    const PLEXUS_FOLDER_INPUT_CONNECTOR = '[data-connector="plexus-folder-input"]';
    const START_QUEUE_LINE_COLOR = '#4c34eb';
    const BOOLEAN_LINE_COLOR = '#76B900';
    const CONNECTOR_INNER_RADIUS = 3;
    let startQueueSketchInstance = null;
    let p5LoadingPromise = null;
    const nodeEls = Array.from(document.querySelectorAll('.generic-node')).filter(el => el.id !== 'node-generic');

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

    nodeEls.forEach(el => {
      if (el.parentElement !== world) {
        world.appendChild(el);
      }
    });

    if (!connectionsSvg) {
      connectionsSvg = document.createElementNS(svgNS, 'svg');
      connectionsSvg.setAttribute('id', 'connections');
      connectionsSvg.setAttribute('xmlns', svgNS);
      connectionsSvg.style.position = 'absolute';
      connectionsSvg.style.left = '0';
      connectionsSvg.style.top = '0';
      connectionsSvg.style.width = '100%';
      connectionsSvg.style.height = '100%';
      connectionsSvg.style.pointerEvents = 'none';
      world.appendChild(connectionsSvg);
    }

    initializeStartQueueLine();

    const headerFooterSyncById = {};

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

      sync();

      const observer = new ResizeObserver(() => sync());
      observer.observe(body);
      window.addEventListener('resize', sync);
      headerFooterSyncById[node.id] = sync;
    }

    function syncAllHeadersFooters() {
      Object.values(headerFooterSyncById).forEach(syncFn => {
        if (typeof syncFn === 'function') {
          syncFn();
        }
      });
    }
    // Track layout state for each node by id
    const nodeState = {};
    const nodeById = {};
    const middleBlockById = {};
    const middleBlockDefaultHeights = {};

        // Enable inline editing for text and script nodes on double-click
    let editingTextBlock = false;
    const textEditors = Array.from(document.querySelectorAll('.text-content, .script-content'));
    const editorResizeObservers = new WeakMap();
    const externalTextCache = new Map();
    const booleanToggleButtons = Array.from(document.querySelectorAll('.boolean-toggle'));
    const headerNameInputs = Array.from(document.querySelectorAll('.node-header-name'));

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

    const escapeHtml = (value) => (value || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    const languageTokenConfigs = {
      csharp: {
        keywords: new Set(['using','namespace','class','struct','enum','interface','public','private','protected','internal','static','readonly','const','void','int','string','var','new','return','true','false','if','else','for','foreach','while','do','switch','case','default','try','catch','finally','throw','this','bool','queue']),
        types: new Set(['Queue','RunQueue','List','Dictionary','String','Int32','Boolean'])
      }
    };

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

    function initializeBooleanToggle(button) {
      const node = button.closest('.generic-node');
      const key = button.dataset.booleanKey || 'value';
      const stored = node?.id ? nodeState[node.id]?.booleanValues?.[key] : undefined;
      const initialValue = typeof stored === 'boolean' ? stored : getBooleanToggleState(button);
      setBooleanToggleState(button, initialValue);
      storeBooleanToggleState(button, initialValue, { publish: false });
    }

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

    textEditors.forEach(editor => {
      editor.setAttribute('contenteditable', 'false');
      editor.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startEditingTextBlock(editor);
      });
      editor.addEventListener('blur', () => endEditingTextBlock(editor));
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          editor.blur();
        }
      });
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

    // Initialize node positions from computed styles (left/top from CSS) or defaults
    nodeEls.forEach(el => {
      if (!el.id) return;
      nodeById[el.id] = el;
      ensureHeaderFooterSync(el);
      const cs = getComputedStyle(el);
      const wx = parseFloat(cs.left) || 0;
      const wy = parseFloat(cs.top) || 0;
      const state = nodeState[el.id] || (nodeState[el.id] = {});
      state.x = wx;
      state.y = wy;
      // Ensure positions are applied inline so future updates are consistent
      el.style.left = wx + 'px';
      el.style.top  = wy + 'px';

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

    // Drag handling in screen space, convert to world space by dividing by scale
    let dragging = false;
    let draggingNodeId = null;
    let dragStartSX = 0, dragStartSY = 0; // screen
    let startWX = 0, startWY = 0; // world
    // Resize handling
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

    function getLabeledConnectorCircle(nodeSelector, label) {
      const node = document.querySelector(nodeSelector);
      if (!node || !label) return null;
      const searchValue = String(label).trim().toLowerCase();
      if (!searchValue) return null;
      const groups = node.querySelectorAll('.node-group');
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
        return getLabeledConnectorCircle(def.nodeSelector, def.label);
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

        function resizeCanvasToViewport() {
          const { width, height } = getCanvasViewportSize();
          if (canvas) {
            p.resizeCanvas(width, height);
          }
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
        };

        p.windowResized = () => resizeCanvasToViewport();

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
          }
        ];

        p.draw = () => {
          if (!canvas) return;
          p.clear();
          bezierConnections.forEach(def => {
            const startCircle = resolveConnectorEndpoint(def.from);
            const endCircle = resolveConnectorEndpoint(def.to);
            const startPoint = getConnectorCenter(startCircle);
            const endPoint = getConnectorCenter(endCircle);
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
