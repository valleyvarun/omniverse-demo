(() => {
	const titleEl = document.getElementById('popupTitle');
	const closeBtn = document.getElementById('popupClose');
	const bodyEl = document.querySelector('.popup-body');

	function clearBody() {
		if (bodyEl) bodyEl.innerHTML = '';
	}

	function renderOmniverseOptions() {
		clearBody();
		const wrap = document.createElement('div');
		wrap.className = 'popup-options';

		const createBtn = document.createElement('button');
		createBtn.className = 'popup-option';
		createBtn.type = 'button';
		createBtn.textContent = 'Create New Omniverse';
		createBtn.addEventListener('click', () => {
			// Placeholder: wire real action later
			console.log('[Popup] Create New Omniverse clicked');
		});

		const openBtn = document.createElement('button');
		openBtn.className = 'popup-option';
		openBtn.type = 'button';
		openBtn.textContent = 'Open Existing Omniverse';
		openBtn.addEventListener('click', () => {
			// Placeholder: wire real action later
			console.log('[Popup] Open Existing Omniverse clicked');
		});

		wrap.appendChild(createBtn);
		wrap.appendChild(openBtn);
		bodyEl.appendChild(wrap);
	}

	// Receive initial data from parent (e.g., { type: 'popup:init', title: 'Apps' })
	window.addEventListener('message', (ev) => {
		const data = ev.data || {};
		if (data.type === 'popup:init') {
			if (typeof data.title === 'string') {
				titleEl.textContent = data.title;
					// Conditional content based on the clicked item
					if (data.title.trim().toLowerCase() === 'omniverse') {
						renderOmniverseOptions();
					} else {
						clearBody();
					}
			}
		}
	});

	// Close button -> notify parent to close
	closeBtn.addEventListener('click', () => {
		try {
			parent.postMessage({ type: 'popup:close' }, '*');
		} catch (_) {}
	});
})();
