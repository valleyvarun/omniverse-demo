/* ===================================================
   APPS INTERFACE FUNCTIONALITY
   =================================================== */

// DOM Elements
let searchInput;
let filterSelect;
let appItems;

// Global data storage
let appsDataGlobal = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
	initializeElements();
	setupEventListeners();
});

/* ===================================================
   INITIALIZATION
   =================================================== */
function initializeElements() {
	searchInput = document.querySelector('.apps-search');
	filterSelect = document.querySelector('.apps-filter');
	
	// Load apps from JSON file
	loadAppsFromJSON().then(() => {
		appItems = document.querySelectorAll('.app-item');
		console.log('Apps interface initialized with', appItems.length, 'apps from JSON');
	});
}

async function loadAppsFromJSON() {
	try {
		const response = await fetch('Design_Architecture_Engineering_Software_SimpleCategories.json');
		const appsData = await response.json();
		
		// Store data globally for company grouping
		appsDataGlobal = appsData;
		
		console.log('Loaded', appsData.length, 'apps from JSON');
		
		// Create app items from JSON data
		createAppItemsFromData(appsData);
		
	} catch (error) {
		console.error('Error loading apps JSON:', error);
		// Fall back to existing HTML apps if JSON fails
		console.log('Using existing HTML apps as fallback');
	}
}

function createAppItemsFromData(appsData) {
	const grid = document.querySelector('.apps-grid');
	
	// Clear existing apps
	grid.innerHTML = '';
	
	// Sort apps alphabetically by product name
	const sortedApps = appsData.sort((a, b) => {
		return a["Product Name"].localeCompare(b["Product Name"]);
	});
	
	// Create app items
	sortedApps.forEach(app => {
		const appItem = createAppElement(app);
		grid.appendChild(appItem);
	});
}

function createAppElement(appData) {
	// Create app container
	const appItem = document.createElement('div');
	appItem.className = 'app-item';
	appItem.dataset.category = categorizeApp(appData["What the Software Is Used For"]);
	appItem.dataset.company = appData["Company Name"]; // Store company for sorting
	appItem.dataset.productName = appData["Product Name"]; // Store product name
	appItem.dataset.functionality = appData["Category"] || 'Other'; // Store category directly from JSON
	
	// Create icon (using first letter of product name as fallback)
	const appIcon = document.createElement('div');
	appIcon.className = 'app-icon';
	
	const iconContent = getAppIcon(appData["Product Name"]);
	if (iconContent.startsWith('../logo/')) {
		// Create image element for logo files
		const iconImg = document.createElement('img');
		iconImg.src = iconContent;
		iconImg.alt = appData["Product Name"];
		iconImg.style.width = '4vw';
		iconImg.style.height = '4vw';
		iconImg.style.objectFit = 'contain';
		appIcon.appendChild(iconImg);
	} else {
		// Use text/emoji icon
		appIcon.textContent = iconContent;
	}
	
	// Create name
	const appName = document.createElement('div');
	appName.className = 'app-name';
	appName.textContent = appData["Product Name"];
	
	// Add click handler
	appItem.addEventListener('click', handleAppClick);
	
	// Assemble app item
	appItem.appendChild(appIcon);
	appItem.appendChild(appName);
	
	return appItem;
}

function getAppIcon(productName) {
	// Map specific product names to logo images or emoji icons
	const iconMap = {
		'AutoCAD': '../logo/autocad-logo.png',
		'Revit': '../logo/revit-logo.png',
		'SketchUp': '../logo/sketchup-logo.png',
		'3ds Max': '../logo/3dsmax-logo.png',
		'Photoshop': '../logo/photoshop-logo.png',
		'Rhino 8': '../logo/rhino8-logo.png',
		'Blender': '../logo/blender-logo.png',
		'D5 Render': '../logo/D5Render-logo.png',
		'Midjourney': '../logo/midjourney-logo.png',
        'ChatGPT': '../logo/chatgpt-logo.png',
		'After Effects': '🎞️',
		'ArchiCAD': '🏗️',
		'Illustrator': '🖌️',
		'InDesign': '../logo/indesign-logo.png',
		'Maya': '🎭',
		'SolidWorks': '⚙️',
		'ANSYS': '🔬',
		'MATLAB': '📊',
		'Unity': '🎮',
		'Unreal Engine': '🎮',
		'Visual Studio': '💻',
		'Visual Studio Code': '../logo/vscode-logo.png',
		'Excel': '📊',
		'Word': '📝',
		'PowerPoint': '📽️'
	};
	
	// Return specific icon if available, otherwise use first letter
	return iconMap[productName] || productName.charAt(0).toUpperCase();
}

function categorizeApp(description) {
	const desc = description.toLowerCase();
	
	if (desc.includes('3d') || desc.includes('modeling') || desc.includes('animation') || desc.includes('rendering')) {
		return 'creative';
	} else if (desc.includes('analysis') || desc.includes('simulation') || desc.includes('engineering')) {
		return 'development';
	} else if (desc.includes('design') || desc.includes('graphics') || desc.includes('visual')) {
		return 'creative';
	} else if (desc.includes('documentation') || desc.includes('office') || desc.includes('productivity')) {
		return 'productivity';
	} else {
		return 'utilities';
	}
}

function setupEventListeners() {
	// Search functionality
	if (searchInput) {
		searchInput.addEventListener('input', handleSearch);
	}
	
	// Filter functionality
	if (filterSelect) {
		filterSelect.addEventListener('change', handleFilter);
		
		// Apply default sorting after apps are loaded
		setTimeout(() => {
			applySorting(filterSelect.value);
		}, 100); // Small delay to ensure apps are rendered
	}
}

/* ===================================================
   SEARCH FUNCTIONALITY
   =================================================== */
function handleSearch(event) {
	const searchTerm = event.target.value.toLowerCase().trim();
	
	appItems.forEach(item => {
		const appName = item.querySelector('.app-name').textContent.toLowerCase();
		const matches = appName.includes(searchTerm);
		
		if (matches) {
			item.classList.remove('hidden');
		} else {
			item.classList.add('hidden');
		}
	});
	
	// Apply current filter after search
	const currentFilter = filterSelect.value;
	applySorting(currentFilter);
}

/* ===================================================
   FILTER FUNCTIONALITY
   =================================================== */
function handleFilter(event) {
	const selectedSorting = event.target.value;
	applySorting(selectedSorting);
}

function applySorting(sortType) {
	console.log('Applying sorting:', sortType);
	const searchTerm = searchInput.value.toLowerCase().trim();
	const grid = document.querySelector('.apps-grid');
	const visibleItems = [];
	
	// First, filter by search term and collect visible items
	appItems.forEach(item => {
		const appName = item.querySelector('.app-name').textContent.toLowerCase();
		const matchesSearch = searchTerm === '' || appName.includes(searchTerm);
		
		if (matchesSearch) {
			item.classList.remove('hidden');
			visibleItems.push(item);
		} else {
			item.classList.add('hidden');
		}
	});
	
	// Sort visible items based on selected criteria
	if (sortType === 'a-to-z') {
		createAlphabeticalGrouping(visibleItems);
		return; // Exit early as we handle the display differently
	} else if (sortType === 'by-company') {
		createCompanyGrouping(visibleItems);
		return; // Exit early as we handle the display differently
	} else if (sortType === 'by-functionality') {
		createFunctionalityGrouping(visibleItems);
		return; // Exit early as we handle the display differently
	} else if (sortType === 'by-industry') {
		// Group by industry type
		visibleItems.sort((a, b) => {
			const nameA = a.querySelector('.app-name').textContent;
			const nameB = b.querySelector('.app-name').textContent;
			const getIndustry = (name) => {
				if (['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects'].includes(name)) return 'Creative';
				if (['Word', 'Excel', 'PowerPoint', 'OneNote'].includes(name)) return 'Business';
				if (['VS Code', 'GitHub Desktop', 'Docker', 'Postman'].includes(name)) return 'Technology';
				return 'Consumer';
			};
			const industryA = getIndustry(nameA);
			const industryB = getIndustry(nameB);
			return industryA.localeCompare(industryB) || nameA.localeCompare(nameB);
		});
	}
	
	// Clear any existing alphabet headers for non-A-to-Z sorting
	clearAlphabetHeaders();
	
	// Re-append sorted items to maintain order
	visibleItems.forEach(item => {
		grid.appendChild(item);
	});
}

/* ===================================================
   COMPANY GROUPING FUNCTIONALITY
   =================================================== */
function createCompanyGrouping(visibleItems) {
	console.log('Creating company grouping with', visibleItems.length, 'items');
	const grid = document.querySelector('.apps-grid');
	
	// Clear the grid
	grid.innerHTML = '';
	
	// Create Favorites section first
	createFavoritesSection(grid, visibleItems);
	
	// Group items by company
	const groupedItems = {};
	visibleItems.forEach(item => {
		const companyName = item.dataset.company || 'Unknown';
		if (!groupedItems[companyName]) {
			groupedItems[companyName] = [];
		}
		groupedItems[companyName].push(item);
	});
	
	// Sort companies alphabetically and create headers
	Object.keys(groupedItems).sort().forEach(company => {
		// Create company header with toggle functionality
		const companyHeader = document.createElement('div');
		companyHeader.className = 'alphabet-header collapsed'; // Start collapsed
		companyHeader.innerHTML = `<span class="alphabet-arrow">></span> ${company}`;
		companyHeader.dataset.letter = company; // Reuse data-letter attribute
		companyHeader.addEventListener('click', toggleAlphabetSection); // Reuse toggle function
		grid.appendChild(companyHeader);
		
		// Create container for apps under this company
		const appsContainer = document.createElement('div');
		appsContainer.className = 'alphabet-apps-container'; // Reuse alphabet container styling
		appsContainer.dataset.letter = company; // Reuse data-letter attribute
		appsContainer.style.display = 'none'; // Start collapsed
		
		// Sort apps within each company alphabetically
		const sortedCompanyApps = groupedItems[company].sort((a, b) => {
			const nameA = a.dataset.productName || a.querySelector('.app-name').textContent;
			const nameB = b.dataset.productName || b.querySelector('.app-name').textContent;
			return nameA.localeCompare(nameB);
		});
		
		// Add apps for this company to the container
		sortedCompanyApps.forEach(item => {
			appsContainer.appendChild(item);
		});
		
		grid.appendChild(appsContainer);
	});
}

/* ===================================================
   FUNCTIONALITY GROUPING FUNCTIONALITY
   =================================================== */
function createFunctionalityGrouping(visibleItems) {
	console.log('Creating functionality grouping with', visibleItems.length, 'items');
	const grid = document.querySelector('.apps-grid');
	
	// Clear the grid
	grid.innerHTML = '';
	
	// Create Favorites section first
	createFavoritesSection(grid, visibleItems);
	
	// Group items by functionality category
	const groupedItems = {};
	visibleItems.forEach(item => {
		const functionality = item.dataset.functionality || 'Other';
		if (!groupedItems[functionality]) {
			groupedItems[functionality] = [];
		}
		groupedItems[functionality].push(item);
	});
	
	// Sort functionality categories alphabetically and create headers
	Object.keys(groupedItems).sort().forEach(functionality => {
		// Create functionality header with toggle functionality
		const functionalityHeader = document.createElement('div');
		functionalityHeader.className = 'alphabet-header collapsed'; // Start collapsed
		functionalityHeader.innerHTML = `<span class="alphabet-arrow">></span> ${functionality}`;
		functionalityHeader.dataset.letter = functionality; // Reuse data-letter attribute
		functionalityHeader.addEventListener('click', toggleAlphabetSection); // Reuse toggle function
		grid.appendChild(functionalityHeader);
		
		// Create container for apps under this functionality
		const appsContainer = document.createElement('div');
		appsContainer.className = 'alphabet-apps-container'; // Reuse alphabet container styling
		appsContainer.dataset.letter = functionality; // Reuse data-letter attribute
		appsContainer.style.display = 'none'; // Start collapsed
		
		// Sort apps within each functionality alphabetically
		const sortedFunctionalityApps = groupedItems[functionality].sort((a, b) => {
			const nameA = a.dataset.productName || a.querySelector('.app-name').textContent;
			const nameB = b.dataset.productName || b.querySelector('.app-name').textContent;
			return nameA.localeCompare(nameB);
		});
		
		// Add apps for this functionality to the container
		sortedFunctionalityApps.forEach(item => {
			appsContainer.appendChild(item);
		});
		
		grid.appendChild(appsContainer);
	});
}

/* ===================================================
   ALPHABETICAL GROUPING FUNCTIONALITY
   =================================================== */
function createAlphabeticalGrouping(visibleItems) {
	console.log('Creating alphabetical grouping with', visibleItems.length, 'items');
	const grid = document.querySelector('.apps-grid');
	
	// Clear the grid
	grid.innerHTML = '';
	
	// Sort items alphabetically
	visibleItems.sort((a, b) => {
		const nameA = a.querySelector('.app-name').textContent;
		const nameB = b.querySelector('.app-name').textContent;
		return nameA.localeCompare(nameB);
	});
	
	// Create Favorites section first
	createFavoritesSection(grid, visibleItems);
	
	// Group items by first letter
	const groupedItems = {};
	visibleItems.forEach(item => {
		const firstLetter = item.querySelector('.app-name').textContent[0].toUpperCase();
		if (!groupedItems[firstLetter]) {
			groupedItems[firstLetter] = [];
		}
		groupedItems[firstLetter].push(item);
	});
	
	// Create alphabet headers and add items
	Object.keys(groupedItems).sort().forEach(letter => {
		// Create letter header with toggle functionality
		const letterHeader = document.createElement('div');
		letterHeader.className = 'alphabet-header';
		letterHeader.innerHTML = `<span class="alphabet-arrow">↓</span> ${letter}`;
		letterHeader.dataset.letter = letter;
		letterHeader.addEventListener('click', toggleAlphabetSection);
		grid.appendChild(letterHeader);
		
		// Create container for apps under this letter
		const appsContainer = document.createElement('div');
		appsContainer.className = 'alphabet-apps-container';
		appsContainer.dataset.letter = letter;
		
		// Add apps for this letter to the container
		groupedItems[letter].forEach(item => {
			appsContainer.appendChild(item);
		});
		
		grid.appendChild(appsContainer);
	});
}

function createFavoritesSection(grid, visibleItems) {
	// Define favorite app names based on user's preferences
	const favoriteAppNames = ['AutoCAD', 'Rhino 8', 'SketchUp', 'Revit', 'D5 Render', 'Photoshop', 'InDesign', 'ChatGPT', 'Midjourney', 'Blender', 'Visual Studio Code'];
	
	// Find favorite apps from visible items
	const favoriteApps = [];
	favoriteAppNames.forEach(favName => {
		const foundApp = visibleItems.find(item => 
			item.querySelector('.app-name').textContent === favName
		);
		if (foundApp) {
			favoriteApps.push(foundApp);
		}
	});
	
	// Only create section if we have favorites
	if (favoriteApps.length > 0) {
		// Create Favorites header
		const favoritesHeader = document.createElement('div');
		favoritesHeader.className = 'alphabet-header';
		favoritesHeader.innerHTML = `<span class="alphabet-arrow">↓</span> Favorites`;
		favoritesHeader.dataset.letter = 'favorites';
		favoritesHeader.addEventListener('click', toggleAlphabetSection);
		grid.appendChild(favoritesHeader);
		
		// Create container for favorite apps
		const favoritesContainer = document.createElement('div');
		favoritesContainer.className = 'alphabet-apps-container';
		favoritesContainer.dataset.letter = 'favorites';
		
		// Add favorite apps to the container
		favoriteApps.forEach(app => {
			// Clone the app to avoid removing it from its original letter section
			const appClone = app.cloneNode(true);
			// Re-add event listener to the cloned app
			appClone.addEventListener('click', handleAppClick);
			favoritesContainer.appendChild(appClone);
		});
		
		grid.appendChild(favoritesContainer);
	}
}

function toggleAlphabetSection(event) {
	const header = event.currentTarget;
	const letter = header.dataset.letter;
	const arrow = header.querySelector('.alphabet-arrow');
	const container = document.querySelector(`.alphabet-apps-container[data-letter="${letter}"]`);
	
	if (container && arrow) {
		const isCollapsed = container.style.display === 'none';
		
		if (isCollapsed) {
			// Expand
			container.style.display = '';
			arrow.textContent = '↓';
			header.classList.remove('collapsed');
		} else {
			// Collapse
			container.style.display = 'none';
			arrow.textContent = '>';
			header.classList.add('collapsed');
		}
	}
}

function clearAlphabetHeaders() {
	const grid = document.querySelector('.apps-grid');
	const headers = grid.querySelectorAll('.alphabet-header');
	const containers = grid.querySelectorAll('.alphabet-apps-container');
	headers.forEach(header => header.remove());
	containers.forEach(container => container.remove());
}

/* ===================================================
   APP INTERACTION
   =================================================== */
function handleAppClick(event) {
	const appItem = event.currentTarget;
	const appName = appItem.querySelector('.app-name').textContent;
	
	console.log(`Launching app: ${appName}`);
	
	// Add visual feedback
	appItem.style.transform = 'scale(0.95)';
	setTimeout(() => {
		appItem.style.transform = '';
	}, 150);
	
	// Here you would implement actual app launching logic
	// For now, just show a message
	showLaunchMessage(appName);
}

function showLaunchMessage(appName) {
	// Create temporary message
	const message = document.createElement('div');
	message.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #2c2c2c;
		border: 2px solid #76B900;
		color: #ffffff;
		padding: 15px 25px;
		border-radius: 8px;
		font-size: 14px;
		z-index: 1000;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
	`;
	message.textContent = `Launching ${appName}...`;
	
	document.body.appendChild(message);
	
	// Remove message after 2 seconds
	setTimeout(() => {
		document.body.removeChild(message);
	}, 2000);
}

/* ===================================================
   UTILITY FUNCTIONS
   =================================================== */
function clearSearch() {
	if (searchInput) {
		searchInput.value = '';
		handleSearch({ target: { value: '' } });
	}
}

function resetFilter() {
	if (filterSelect) {
		filterSelect.value = 'a-to-z';
		handleFilter({ target: { value: 'a-to-z' } });
	}
}

function resetAppsView() {
	clearSearch();
	resetFilter();
}

/* ===================================================
   KEYBOARD SHORTCUTS
   =================================================== */
document.addEventListener('keydown', function(event) {
	// Escape key to clear search and filter
	if (event.key === 'Escape') {
		resetAppsView();
		event.preventDefault();
	}
	
	// Ctrl+F to focus search
	if (event.ctrlKey && event.key === 'f') {
		if (searchInput) {
			searchInput.focus();
			searchInput.select();
		}
		event.preventDefault();
	}
});

/* ===================================================
   EXPORT FOR TESTING (if needed)
   =================================================== */
window.appsInterface = {
	handleSearch,
	handleFilter,
	handleAppClick,
	resetAppsView,
	clearSearch,
	resetFilter
};
