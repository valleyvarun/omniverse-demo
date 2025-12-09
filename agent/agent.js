(() => {
	'use strict';

	// ===============================================================
	// DOM LOOKUPS
	// Grab references to the key UI elements in the iframe
	// ===============================================================
	const chat = document.getElementById('agentChat');      // Scrollable chat transcript container
	const form = document.getElementById('agentForm');      // Chat form (handles submit)
	const input = document.getElementById('chatInput');     // Auto-growing textarea input
	const status = document.getElementById('agentStatus');  // Connection/typing status text
	const addRefBtn = document.getElementById('addRefBtn'); // Paperclip button to add references
	const refFileInput = document.getElementById('refFileInput'); // Hidden file input element
	const chatMode = document.getElementById('chatMode');   // Mode selector (e.g., agent / ask)

	// Max height for the auto-growing textarea (px)
	const MAX_INPUT_HEIGHT = 160;
    // Track if we've inserted the top separator above the first message pair
    let topSeparatorInserted = false;

	// ===============================================================
	// UTIL: Append a message bubble to the transcript
	// role: 'user' | 'bot'
	// ===============================================================
		function getCurrentUsername() {
			// Try to read the selected email from the parent header and derive username (before @)
			try {
				const emailEl = parent?.document?.querySelector?.('.selected-email');
				const email = emailEl?.textContent?.trim() || '';
				if (email && email.includes('@')) return email.split('@')[0];
			} catch (_) {}
			return 'user';
		}

		function appendMessage(text, role = 'bot') {
			// Ensure there is a top separator just above the first pair of messages.
			// We insert this once, immediately before the first user message is added.
			if (role === 'user' && !topSeparatorInserted) {
				const sepTop = document.createElement('div');
				sepTop.className = 'chat-separator top';
				const markTop = document.createElement('span');
				markTop.className = 'bookmark';
				markTop.innerHTML = `
					<svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
						<g fill="none" stroke="currentColor" stroke-width="1">
							<path d="M1 11 V1 H7 V11 L4 9 Z"/>
						</g>
					</svg>
				`;
				sepTop.appendChild(markTop);
				chat.appendChild(sepTop);
				topSeparatorInserted = true;
			}
			const div = document.createElement('div');
			div.className = `msg ${role}`;
			if (role === 'user') {
				// Build a user bubble with username label and body
				const name = getCurrentUsername();
				const label = document.createElement('span');
				label.className = 'msg-username';
				label.textContent = name;
				const body = document.createElement('div');
				body.className = 'msg-body';
				body.textContent = text;
				div.appendChild(label);
				div.appendChild(body);
			} else {
				// Bot: plain text without bubble chrome
				div.textContent = text;
			}
			chat.appendChild(div);
			// Keep newest message in view
			chat.scrollTop = chat.scrollHeight;

				// If this was a bot message and the previous message was a user message,
				// insert a separator line with a bookmark icon to mark the pair boundary.
				if (role === 'bot') {
					const nodes = Array.from(chat.children);
					const last = nodes[nodes.length - 1];
					const prev = nodes[nodes.length - 2];
					if (prev && prev.classList && prev.classList.contains('msg') && prev.classList.contains('user')) {
								const sep = document.createElement('div');
								sep.className = 'chat-separator';
								const mark = document.createElement('span');
								mark.className = 'bookmark';
								// Minimal line-only motif (bookmark-like) using strokes only
								mark.innerHTML = `
									<svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
										<g fill="none" stroke="currentColor" stroke-width="1">
											<path d="M1 11 V1 H7 V11 L4 9 Z"/>
										</g>
									</svg>
								`;
								sep.appendChild(mark);
						chat.appendChild(sep);
						chat.scrollTop = chat.scrollHeight;
					}
				}
		}

	// ===============================================================
	// FORM SUBMIT: Send message (Enter or click Send)
	// - Includes the selected mode as a prefix for demo clarity
	// - Clears the input and resets its height
	// - Echo reply simulates a bot response
	// ===============================================================
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const text = input.value.trim();
		if (!text) return; // Ignore empty submits

		// Include mode prefix for demo; could be rendered separately later
		// Do not prefix with mode label; append user text as-is
		appendMessage(text, 'user');

		// Clear input and reset height
		input.value = '';
		autoGrow(input);

				// Simulated bot response: always return the provided gibberish with numbered middle points
				const summary = [
					'Lognode : v4.9.a',
					'',
					'Pretext: fral nexu qinor belta syn varinex loopra delt maron 78.4. Kretu voss linef pariq dulon fexla rem toru setin korv belti runa-φ. Marix 08.12 replo iden varu tex 7.4, bindrel joth synclad ponex ral tuvar mirdis corep flux eltan mode 3.0x. Silen varu kon dexlin phora setram lique travo denir opalun fextor min drax 22.9 kelta rephi sonq relim volta.',
					'',
					'1) Nex : 42.01 : pelq runa : trix-α7',
					'2) Mod : 9x4.23 / tol : 0.6f',
					'3) Sel : q-chan 12b : reff loop.on',
					'4) Val : set=Δ3.9 / port: v-12k',
					'5) Bind : jex-23.08 : path_4 : alt-syn off',
					'',
					'Endtext: korv relin datu spun varel 9.07 — fin exlo parax lum ϟ-run, merin thal qevu syn detra fold. Ralit nom vexa surid ental trovan mird 16b-arc fequ dral oson meru lathex. Veriq tuno seltran parud nivex morta-12 loopra finx recald synj pavor in delt. Drith nomath ilra vecton 9.3, strem viq haldor enum seten vel tral – fin varonex.'
				].join('\n');
			setTimeout(() => appendMessage(summary, 'bot'), 200);
	});

	// ===============================================================
	// FOCUS UX: Clicking the chat transcript or the empty middle row
	// should place caret in the textarea for quick typing.
	// ===============================================================
	const chatArea = document.getElementById('agentChat');
	if (chatArea) {
		chatArea.addEventListener('mousedown', () => {
			if (document.activeElement !== input) setTimeout(() => input.focus(), 0);
		});
	}

	const middleRow = document.querySelector('.input-row.middle');
	if (middleRow) {
		middleRow.addEventListener('mousedown', (e) => {
			// Only when clicking the empty space, not the textarea itself
			if (e.target === middleRow) setTimeout(() => input.focus(), 0);
		});
	}

	// ===============================================================
	// PARENT INTEGRATION: Toggle the host page's global keyboard
	// handlers when the iframe input is focused/blurred.
	// ===============================================================
	input.addEventListener('focus', () => {
		try { if (parent && typeof parent.disableGlobalKeyboard === 'function') parent.disableGlobalKeyboard(); } catch(_) {}
		try { parent.window.chatbotState = { ...(parent.window.chatbotState||{}), inputFocused: true }; } catch(_) {}
		status.textContent = 'Agent';
	});

	input.addEventListener('blur', () => {
		try { if (parent && typeof parent.enableGlobalKeyboard === 'function') parent.enableGlobalKeyboard(); } catch(_) {}
		try { parent.window.chatbotState = { ...(parent.window.chatbotState||{}), inputFocused: false }; } catch(_) {}
		status.textContent = 'Agent';
	});

	// ===============================================================
	// AUTO-GROW TEXTAREA: Expands up to MAX_INPUT_HEIGHT, then
	// enables vertical scrolling if content exceeds the cap.
	// ===============================================================
	function autoGrow(el) {
		// Reset to auto to measure the natural scroll height
		el.style.height = 'auto';
		const target = Math.min(el.scrollHeight, MAX_INPUT_HEIGHT);
		el.style.height = target + 'px';
		// Toggle vertical scrollbar only when capped
		el.style.overflowY = (el.scrollHeight > MAX_INPUT_HEIGHT) ? 'auto' : 'hidden';
	}

	// Grow as the user types
	input.addEventListener('input', () => autoGrow(input));
	// Initialize base height on load
	autoGrow(input);

	// ===============================================================
	// KEYBOARD BEHAVIOR: Enter to send, Shift+Enter for newline
	// ===============================================================
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			// Use requestSubmit when available (respects form validation)
			form.requestSubmit ? form.requestSubmit() : form.submit();
		}
	});

	// Start with an empty chat (no default greeting)

	// ===============================================================
	// ATTACH REFERENCES: Paperclip opens file picker; on selection,
	// inform the user how many files were attached (demo behavior).
	// ===============================================================
	if (addRefBtn && refFileInput) {
		addRefBtn.addEventListener('click', () => refFileInput.click());
		refFileInput.addEventListener('change', () => {
			const count = refFileInput.files?.length || 0;
			if (count > 0) appendMessage(`Attached ${count} file(s)`, 'bot');
		});
	}

	// ===============================================================
	// MODE SELECT: Keep interactions local so parent focus routing
	// logic doesn't steal focus while using the dropdown.
	// ===============================================================
	if (chatMode) {
		['mousedown','click','focus'].forEach(evt => {
			chatMode.addEventListener(evt, (e) => {
				e.stopPropagation();
			});
		});
	}

	// ===============================================================
	// PARENT COMMUNICATION & EVENTS
	// ===============================================================

	// View Switching Logic
	const agentAppView = document.getElementById('agentAppView');
	const agentAppImage = document.getElementById('agentAppImage');
	const agentSubHeader = document.getElementById('agentSubHeader');
	const agentCLayersHeader = document.getElementById('agentCLayersHeader');
	const agentCLayersContent = document.getElementById('agentCLayersContent');
    const agentCLayersList = document.getElementById('agentCLayersList');
    const agentCLayersResizeHandle = document.getElementById('agentCLayersResizeHandle');
	const agentCLayersArrow = document.getElementById('agentCLayersArrow');
	const agentAppNameBtn = document.getElementById('agentAppName');
	const agentAppArrow = document.getElementById('agentAppArrow');
	const agentStatusBtn = document.getElementById('agentStatus');
	const agentInput = document.querySelector('.agent-input');
    const agent3DView = document.getElementById('agent3DView');
    const agent3DFrame = document.getElementById('agent3DFrame');

	let currentAppName = null;

	function showAgentView() {
		if (agentAppView) agentAppView.style.display = 'none';
        if (agent3DView) agent3DView.style.display = 'none';
		if (chat) chat.style.display = 'flex';
		if (agentInput) agentInput.style.display = 'block';
		if (agentAppArrow) agentAppArrow.classList.add('collapsed');
		if (agentStatusBtn) agentStatusBtn.classList.add('active');
		if (agentAppNameBtn) agentAppNameBtn.classList.remove('active');

		// Show C Layers header if an app is open (and sidebar is closed/agent view active)
		if (agentCLayersHeader) {
			if (currentAppName) {
				agentCLayersHeader.style.display = 'flex';
                // Default to open
                if (agentCLayersContent) {
                    agentCLayersContent.style.display = 'flex';
                    if (agentCLayersArrow) agentCLayersArrow.classList.remove('collapsed');
                    agentCLayersHeader.classList.add('expanded');
                }
			} else {
				agentCLayersHeader.style.display = 'none';
                if (agentCLayersContent) agentCLayersContent.style.display = 'none';
                agentCLayersHeader.classList.remove('expanded');
			}
		}
	}

	function showAppView() {
		if (!currentAppName) return;
		if (agentAppView) agentAppView.style.display = 'flex';
        if (agent3DView) agent3DView.style.display = 'none';
		if (chat) chat.style.display = 'none';
		if (agentInput) agentInput.style.display = 'none';
		if (agentAppArrow) agentAppArrow.classList.remove('collapsed');
		if (agentStatusBtn) agentStatusBtn.classList.remove('active');
		if (agentAppNameBtn) agentAppNameBtn.classList.add('active');

		// Hide C Layers header when sidebar is open
		if (agentCLayersHeader) {
			agentCLayersHeader.style.display = 'none';
            if (agentCLayersContent) agentCLayersContent.style.display = 'none';
            agentCLayersHeader.classList.remove('expanded');
		}
		
		// Update image source based on app name
		if (agentAppImage) {
            const lowerName = (currentAppName || '').toLowerCase();
            agentAppImage.style.display = 'block';
            if (lowerName === 'photoshop') {
                agentAppImage.src = '../apps/apps-content/photoshop-sidebar.png';
            } else if (lowerName === 'd5 render') {
                agentAppImage.src = '../apps/apps-content/d5render-sidebar.png';
            } else if (lowerName === 'rhino 8') {
                agentAppImage.src = '../apps/apps-content/rhino8-sidebar.png';
            } else if (lowerName === 'revit') {
                agentAppImage.src = '../apps/apps-content/revit-sidebar2.png';
                agentAppImage.style.display = 'block';
            } else if (lowerName === 'autocad') {
                agentAppImage.src = '../apps/apps-content/autocad-sidebar.png';
                agentAppImage.style.display = 'block';
            } else {
			    // Blank black space for others
			    agentAppImage.src = '';
                agentAppImage.style.display = 'none';
            }
		}
	}

    function show3DView() {
        // Send message to parent to load 3D view in main content area
        try {
            parent.postMessage({ 
                type: 'content:load', 
                src: 'agent/c-layer.html' 
            }, '*');
        } catch (e) {
            console.error('Failed to post message to parent:', e);
        }
    }

	if (agentStatusBtn) {
		agentStatusBtn.addEventListener('click', () => {
			showAgentView();
		});
	}

	if (agentAppNameBtn) {
		agentAppNameBtn.addEventListener('click', () => {
			showAppView();
		});
	}

	if (agentAppArrow) {
		agentAppArrow.addEventListener('click', () => {
			// Toggle between views if app is active
			if (currentAppName) {
				if (agentAppView && agentAppView.style.display === 'none') {
					showAppView();
				} else {
					showAgentView();
				}
			}
		});
	}

    // Toggle C Layers Content
    if (agentCLayersHeader && agentCLayersContent && agentCLayersArrow) {
        agentCLayersHeader.addEventListener('click', () => {
            if (agentCLayersContent.style.display === 'none') {
                agentCLayersContent.style.display = 'flex';
                agentCLayersArrow.classList.remove('collapsed');
                agentCLayersHeader.classList.add('expanded');
            } else {
                agentCLayersContent.style.display = 'none';
                agentCLayersArrow.classList.add('collapsed');
                agentCLayersHeader.classList.remove('expanded');
            }
        });
    }

    // Layer Selection Logic
    if (agentCLayersList) {
        agentCLayersList.addEventListener('click', (e) => {
            const row = e.target.closest('.layer-row');
            if (row) {
                // Remove selected from all siblings
                const allRows = agentCLayersList.querySelectorAll('.layer-row');
                allRows.forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');

                // Show 3D View
                show3DView();
            }
        });
    }

    // Add Layer Logic
    const addLayerBtn = document.getElementById('addLayerBtn');
    if (addLayerBtn && agentCLayersList) {
        addLayerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent header toggle if inside header (it's not, but good practice)
            
            // Count existing layers to name the new one
            const existingLayers = agentCLayersList.querySelectorAll('.layer-row').length;
            const newLayerName = `Layer ${String(existingLayers + 1).padStart(2, '0')}`;

            // Create new layer row
            const newRow = document.createElement('div');
            newRow.className = 'layer-row';
            newRow.innerHTML = `
                <span class="layer-name">${newLayerName}</span>
                <div class="layer-controls">
                    <span class="icon-check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span class="icon-bulb">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path>
                        </svg>
                    </span>
                    <span class="icon-lock">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path>
                        </svg>
                    </span>
                    <span class="color-box" style="background-color: #${Math.floor(Math.random()*16777215).toString(16)};"></span>
                </div>
            `;
            
            // Append to content
            agentCLayersList.appendChild(newRow);
        });
    }

    // Delete Layer Logic
    const deleteLayerBtn = document.getElementById('deleteLayerBtn');
    if (deleteLayerBtn && agentCLayersList) {
        deleteLayerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedRow = agentCLayersList.querySelector('.layer-row.selected');
            if (selectedRow) {
                selectedRow.remove();
            }
        });
    }

    // Resize Logic
    if (agentCLayersResizeHandle && agentCLayersContent) {
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;

        agentCLayersResizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startY = e.clientY;
            startHeight = agentCLayersContent.offsetHeight;
            document.body.style.cursor = 'ns-resize';
            e.preventDefault(); // Prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const dy = e.clientY - startY;
            const newHeight = startHeight + dy;
            if (newHeight > 60) { // Min height check
                agentCLayersContent.style.height = `${newHeight}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
            }
        });
    }

	// Communicate focus state to parent if needed (helps route global keyboard events)
	window.addEventListener('focusin', () => { 
		try { parent.window.chatbotState = { ...(parent.window.chatbotState||{}), inputFocused: document.activeElement?.id === 'chatInput' }; } catch(_) {} 
	});
	
	window.addEventListener('focusout', () => { 
		try { parent.window.chatbotState = { ...(parent.window.chatbotState||{}), inputFocused: false }; } catch(_) {} 
	});

	// Collapse button -> notify parent
	const collapseBtn = document.getElementById('agentCollapseBtn');
	if (collapseBtn) {
		collapseBtn.addEventListener('click', () => {
			try { parent.postMessage({ type: 'agent:collapse' }, '*'); } catch(_) {}
		});
	}

	// Show/hide internal collapse button based on parent instruction
	window.addEventListener('message', (ev) => {
		try {
			const data = ev.data || {};
			if (data.type === 'agent:headerButtonVisibility') {
				const btn = document.getElementById('agentCollapseBtn');
				if (btn) {
					btn.style.display = data.visible ? 'inline-flex' : 'none';
				}
			}
			// Handle app change to show/hide sub-header
			if (data.type === 'agent:app-changed') {
				currentAppName = data.appName;
				if (agentSubHeader && agentAppNameBtn) {
					if (data.appName) {
						agentAppNameBtn.textContent = data.appName;
						agentSubHeader.style.display = 'flex';
						// Switch to App View by default when app opens
						showAppView();
					} else {
						agentSubHeader.style.display = 'none';
						// Switch back to Agent View when on Home
						showAgentView();
					}
				}
			}
		} catch(_) {}
	});

})();
