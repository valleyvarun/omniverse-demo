// Modal elements
let appLaunchModal;
let modalAppIcon;
let modalAppName;
let modalOpenButton;
let modalCancelButton;
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
