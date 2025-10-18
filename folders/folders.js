(() => {
	const root = document.getElementById('foldersRoot');
	const handle = document.getElementById('foldersHandle');
	if (!root || !handle) return;

	let dragging = false;

	function px(n){ return `${n}px`; }

	function onDown(e){
		dragging = true;
		handle.classList.add('dragging');
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp, { once: true });
		e.preventDefault();
	}

	function onMove(e){
		if (!dragging) return;
		const rect = root.getBoundingClientRect();
		// Compute left pane width clamped between 10% and 70%
		let leftW = Math.max(rect.width * 0.1, Math.min(e.clientX - rect.left, rect.width * 0.7));
		const rightW = rect.width - leftW - 6; // subtract handle width
		root.style.gridTemplateColumns = `${px(leftW)} 6px ${px(rightW)}`;
	}

	function onUp(){
		dragging = false;
		handle.classList.remove('dragging');
		window.removeEventListener('mousemove', onMove);
	}

	handle.addEventListener('mousedown', onDown);

	// Cancel button functionality - close the popup
	const cancelBtn = document.querySelector('.folders-cancel-btn');
	if (cancelBtn) {
		cancelBtn.addEventListener('click', () => {
			// Send message to popup parent (which will forward to main window)
			window.parent.postMessage({ type: 'folders:close' }, '*');
		});
	}

	// Collapsible navigation groups functionality
	const groupHeaders = document.querySelectorAll('.folders-group-header');
	groupHeaders.forEach(header => {
		header.addEventListener('click', () => {
			const group = header.closest('.folders-group');
			if (group) {
				group.classList.toggle('collapsed');
			}
		});
	});
})();

