(() => {
	const titleEl = document.getElementById('popupTitle');
	const closeBtn = document.getElementById('popupClose');
	const bodyEl = document.querySelector('.popup-body');
    const logoEl = document.getElementById('popupLogo');

	// Map popup titles to logo filenames in ../logo
	const logoMap = {
		'omniverse': 'omniverse-logo.png',
		'apps': 'apps-logo.png',
		'nucleus': 'nucleus-logo.png',
		'browser': 'browser-logo.png',
		'store': 'store-logo.png',
		'folders': 'folders-logo.png'
	};

	function setHeaderLogo(title) {
		if (!logoEl) return;
		const key = String(title || '').trim().toLowerCase();
		const file = logoMap[key];
		if (file) {
			logoEl.src = `../logo/${file}`;
			logoEl.alt = `${title} Logo`;
			logoEl.classList.add('visible');
		} else {
			logoEl.removeAttribute('src');
			logoEl.classList.remove('visible');
		}
	}

	function clearBody() {
		if (bodyEl) bodyEl.innerHTML = '';
	}

	function renderOmniverseOptions() {
		clearBody();

		// Hero image at the top
		const hero = document.createElement('img');
		hero.className = 'popup-hero';
		hero.src = '../logo/omniverse-graphic2.png';
		hero.alt = 'Omniverse';
		bodyEl.appendChild(hero);

		// Invisible square overlay centered over the image
		const overlay = document.createElement('div');
		overlay.className = 'popup-overlay-square';

		// Options stack inside the overlay, centered both ways
		const wrap = document.createElement('div');
		wrap.className = 'popup-options';

		const createBtn = document.createElement('button');
		createBtn.className = 'popup-option';
		createBtn.type = 'button';
		createBtn.innerHTML = '+ Create New Omniverse';
		createBtn.addEventListener('click', () => {
			// Instruct parent to load omniverse.html in the Project Manager iframe
			// Ask parent to open Omniverse as an app tab, with specific content source
			try {
				parent.postMessage({
					type: 'app:open',
					appData: { name: 'Omniverse', icon: 'logo/omniverse-logo.png', contentSrc: 'omniverse/omniverse.html' }
				}, '*');
			} catch (_) {}
			// Optionally close the popup after action
			try { parent.postMessage({ type: 'popup:close' }, '*'); } catch (_) {}
		});

		const openBtn = document.createElement('button');
		openBtn.className = 'popup-option';
		openBtn.type = 'button';
		openBtn.innerHTML = 'Open Existing Omniverse';
		openBtn.addEventListener('click', () => {
			// Placeholder: wire real action later
			console.log('[Popup] Open Existing Omniverse clicked');
		});

		wrap.appendChild(createBtn);
		wrap.appendChild(openBtn);
		overlay.appendChild(wrap);
		bodyEl.appendChild(overlay);
	}

	// Receive initial data from parent (e.g., { type: 'popup:init', title: 'Apps' })
	window.addEventListener('message', (ev) => {
		const data = ev.data || {};
		if (data.type === 'popup:init') {
			if (typeof data.title === 'string') {
				titleEl.textContent = data.title;
				setHeaderLogo(data.title);
					// Conditional content based on the clicked item
					if (data.title.trim().toLowerCase() === 'omniverse') {
						renderOmniverseOptions();
					} else if (data.title.trim().toLowerCase() === 'folders') {
						clearBody();
						// Embed the folders split layout into the popup body
						const iframe = document.createElement('iframe');
						iframe.src = '../folders/folders.html';
						iframe.title = 'Folders';
						iframe.style.width = '100%';
						iframe.style.height = '100%';
						iframe.style.border = 'none';
						iframe.style.display = 'block';
						bodyEl.appendChild(iframe);
					} else if (data.title.trim().toLowerCase() === 'apps') {
						clearBody();
						// Embed the apps interface into the popup body
						const iframe = document.createElement('iframe');
						iframe.src = '../apps/apps.html';
						iframe.title = 'Apps';
						iframe.style.width = '100%';
						iframe.style.height = '100%';
						iframe.style.border = 'none';
						iframe.style.display = 'block';
						bodyEl.appendChild(iframe);
					} else {
						clearBody();
					}
			}
		}
		
		// Forward close request from folders iframe to main window
		if (data.type === 'folders:close') {
			try {
				parent.postMessage({ type: 'popup:close' }, '*');
			} catch (_) {}
		}
		
		// Forward close request from apps iframe to main window
		if (data.type === 'closeAppsPopup') {
			try {
				parent.postMessage({ type: 'popup:close' }, '*');
			} catch (_) {}
		}
	});

	// Close button -> notify parent to close
	closeBtn.addEventListener('click', () => {
		try {
			parent.postMessage({ type: 'popup:close' }, '*');
		} catch (_) {}
	});
})();
