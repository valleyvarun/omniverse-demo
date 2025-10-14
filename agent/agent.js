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
})();
