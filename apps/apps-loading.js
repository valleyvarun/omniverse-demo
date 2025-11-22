// Modal elements
let appLaunchModal;
let modalAppIcon;
let modalAppName;
let modalOpenButton;
let modalCancelButton;
let modalPreviewImage;
let currentSelectedApp = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
	initializeModal();
});

function initializeModal() {
	appLaunchModal = document.getElementById('appLaunchModal');
	modalAppIcon = document.getElementById('modalAppIcon');
	modalAppName = document.getElementById('modalAppName');
	modalOpenButton = document.getElementById('modalOpenButton');
	modalCancelButton = document.getElementById('modalCancelButton');
	modalPreviewImage = document.getElementById('modalPreviewImage');
	
	// Add event listeners
	modalOpenButton.addEventListener('click', handleModalOpen);
	modalCancelButton.addEventListener('click', handleModalCancel);
	
	// Close modal when clicking outside
	appLaunchModal.addEventListener('click', function(event) {
		if (event.target === appLaunchModal) {
			handleModalCancel();
		}
	});

	// Keyboard navigation
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleModalOpen();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			handleModalCancel();
		}
	});

	// Listen for app data from parent window
	window.addEventListener('message', function(event) {
		const data = event.data;
		if (data.type === 'showAppModal') {
			showAppModal(data.appData);
		}
	});

	// Focus on Open button for keyboard navigation
	setTimeout(() => {
		if (modalOpenButton) {
			modalOpenButton.focus();
		}
	}, 100);
}

function showAppModal(appData) {
	currentSelectedApp = appData;
	
	// Update modal content
	modalAppName.textContent = appData.name;
	
	// Handle icon display (image vs text/emoji)
	if (appData.icon.includes('logo/')) {
		modalAppIcon.innerHTML = `<img src="${appData.icon}" alt="${appData.name}" style="width: 20px; height: 20px; object-fit: contain;">`;
	} else {
		modalAppIcon.textContent = appData.icon;
	}
	
	const coverSrc = getAppCoverImage(appData.name);
	if (modalPreviewImage) {
		modalPreviewImage.src = coverSrc;
		modalPreviewImage.alt = `${appData.name} preview`;
	}
	
	// Reset loading state
	resetLoadingState();
	
	// Modal is already visible since this page is the modal
}

function handleModalOpen() {
	if (currentSelectedApp) {
		// Close the main apps popup immediately
		try {
			// Send message to parent popup to close
			window.parent.postMessage({ type: 'closeAppsPopup' }, '*');
		} catch (e) {
			console.log('Error closing popup:', e);
		}
		
		// Enter loading state
		enterLoadingState();
		
		// Hide modal after 5 seconds by closing this window
		setTimeout(() => {
			window.close();
		}, 5000);
	}
}

function handleModalCancel() {
	// Close this modal window
	window.close();
}

function enterLoadingState() {
	// Hide the buttons
	const modalButtons = document.querySelector('.modal-buttons');
	modalButtons.style.display = 'none';
	
	// Create and show loading text
	const loadingText = document.createElement('div');
	loadingText.className = 'modal-loading-text';
	loadingText.textContent = 'Loading...';
	loadingText.id = 'modalLoadingText';
	
	// Add loading text to the footer
	const modalFooter = document.querySelector('.modal-footer');
	modalFooter.appendChild(loadingText);
}

function resetLoadingState() {
	// Show the buttons again
	const modalButtons = document.querySelector('.modal-buttons');
	if (modalButtons) {
		modalButtons.style.display = 'flex';
	}
	
	// Remove loading text if it exists
	const loadingText = document.getElementById('modalLoadingText');
	if (loadingText) {
		loadingText.remove();
	}
}

function getAppCoverImage(appName) {
	const normalized = (appName || '').trim().toLowerCase();
	if (normalized === 'd5 render') {
		return '../logo/d5render-cover.png';
	}
	if (normalized === 'rhino 8' || normalized === 'rhino8') {
		return '../logo/rhino-cover.png';
	}
	if (normalized === 'midjourney') {
		return '../logo/midjourney-cover.png';
	}
	if (normalized === 'blender') {
		return '../logo/blender-cover.png';
	}
	if (normalized === 'autocad') {
		return '../logo/autocad-cover.png';
	}
	if (normalized === 'revit') {
		return '../logo/revit-cover.png';
	}
	if (normalized === 'chatgpt') {
		return '../logo/chatgpt-cover.png';
	}
	if (normalized === 'photoshop') {
		return '../logo/photoshop-cover.png';
	}
	if (normalized === 'sketchup') {
		return '../logo/sketchup-cover.png';
	}
	if (normalized === 'indesign') {
		return '../logo/indesign-cover.png';
	}
	if (normalized === 'visual studio code' || normalized === 'vs code' || normalized === 'vscode') {
		return '../logo/vscode-cover.png';
	}
	if (normalized === 'fusion 360' || normalized === 'fusion360') {
		return '../logo/fusion360-cover.png';
	}
	if (normalized === '3ds max' || normalized === '3dsmax') {
		return '../logo/3dsmax-cover.png';
	}
	return '../logo/dummy-cover1.png';
}
