(() => {
	const titleEl = document.getElementById('popupTitle');
	const closeBtn = document.getElementById('popupClose');

	// Receive initial data from parent (e.g., { type: 'popup:init', title: 'Apps' })
	window.addEventListener('message', (ev) => {
		const data = ev.data || {};
		if (data.type === 'popup:init') {
			if (typeof data.title === 'string') {
				titleEl.textContent = data.title;
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
