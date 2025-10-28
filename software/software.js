// Software page behavior
// If the active app is Photoshop, show a demo image instead of plain black background

document.addEventListener('DOMContentLoaded', () => {
	const appName = getActiveAppNameFromParent();
	if (appName && appName.toLowerCase() === 'photoshop') {
		showPhotoshopDemo();
	}
});

function getActiveAppNameFromParent() {
	try {
		// Access the parent (main app) DOM to find the currently active tab
		const doc = window.top?.document || window.parent?.document;
		if (!doc) return null;
		const activeTab = doc.querySelector('.content-tabs-list .content-tab.active');
		const name = activeTab?.getAttribute('data-app-name');
		return name || null;
	} catch (e) {
		// Cross-origin or other access issues
		return null;
	}
}

function showPhotoshopDemo() {
	try {
		// Stretch background image to fill (distort aspect if needed)
		document.body.style.backgroundColor = '#000';
		document.body.style.backgroundImage = "url('../logo/photoshop-demo.png')";
		document.body.style.backgroundPosition = 'center center';
		document.body.style.backgroundRepeat = 'no-repeat';
		document.body.style.backgroundSize = '100% 100%'; // stretch to fill
	} catch (_) {
		// Fallback: append an <img>
		const img = document.createElement('img');
		img.src = "../logo/photoshop-demo.png";
		Object.assign(img.style, {
			position: 'absolute',
			inset: '0',
			width: '100%',
			height: '100%',
			objectFit: 'fill', // stretch to fill
			display: 'block',
			background: '#000'
		});
		document.body.appendChild(img);
	}
}

