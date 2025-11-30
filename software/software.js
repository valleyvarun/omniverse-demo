// Software page behavior
// If the active app is Photoshop, show a demo image instead of plain black background

document.addEventListener('DOMContentLoaded', () => {
	const appName = getActiveAppNameFromParent();
    if (!appName) return;
    
    const lowerName = appName.toLowerCase();
	if (lowerName === 'photoshop') {
		showDemoImage('../apps/apps-content/photoshop-demo.png');
	} else if (lowerName === 'd5 render') {
        showDemoImage('../apps/apps-content/d5render-demo.png');
    } else if (lowerName === 'rhino 8') {
        showDemoImage('../apps/apps-content/rhino8-demo.png');
    } else if (lowerName === 'revit') {
        showDemoImage('../apps/apps-content/revit-demo.png');
    } else {
        // For all other apps, show a blank black space
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '#000';
        // Remove any fallback img element if present
        const existingImg = document.querySelector('img[style*="position: absolute"]');
        if (existingImg) existingImg.remove();
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

function showDemoImage(src) {
	try {
		// Stretch background image to fill (distort aspect if needed)
		document.body.style.backgroundColor = '#000';
		document.body.style.backgroundImage = `url('${src}')`;
		document.body.style.backgroundPosition = 'center center';
		document.body.style.backgroundRepeat = 'no-repeat';
		document.body.style.backgroundSize = '100% 100%'; // stretch to fill
	} catch (_) {
		// Fallback: append an <img>
		const img = document.createElement('img');
		img.src = src;
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

