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
		const viewportWidth = window.innerWidth;
		// Compute left pane width clamped between 200px and 40vw
		const minWidth = 200; // 200px minimum
		const maxWidth = viewportWidth * 0.4; // 40vw maximum
		let leftW = Math.max(minWidth, Math.min(e.clientX - rect.left, maxWidth));
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

	// Folder row selection functionality
	const folderItems = document.querySelectorAll('.folders-item:not(.folders-empty-row)');
	
	// Add click listeners to folder rows
	folderItems.forEach(item => {
		item.addEventListener('click', (e) => {
			e.stopPropagation(); // Prevent event from bubbling to document
			
			// Remove selected class from all other items
			folderItems.forEach(otherItem => {
				otherItem.classList.remove('selected');
			});
			
			// Add selected class to clicked item
			item.classList.add('selected');
		});
	});
	
	// Click anywhere else to deselect
	document.addEventListener('click', () => {
		folderItems.forEach(item => {
			item.classList.remove('selected');
		});
	});
})();

