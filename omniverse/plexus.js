// p5.js sketch to draw curved connectors between node circles
// This canvas sits between the grid and the nodes iframe.

(function () {
	// Safeguard if p5 isn't loaded
	if (typeof window.p5 === 'undefined') {
		console.warn('p5.js not loaded yet; connectors will initialize after p5 is available.');
	}

	// Current world transform (mirrors plexus.html)
	let scale = 1;
	let offsetX = 0;
	let offsetY = 0;

	// Keep a simple list of connections defined by CSS selectors inside the nodes iframe
	// Each item: { from: string, to: string }
	const connections = [
		{ from: '#script-node .output-circle', to: '#node1 .inputs .input-item:nth-child(1) .input-circle' },
		{ from: '#node3 .output-circle', to: '#node1 .inputs .input-item:nth-child(2) .input-circle' },
		{ from: '#node4 .output-circle', to: '#node1 .inputs .input-item:nth-child(3) .input-circle' }
	];

	// Utility: get the iframe document
	function getNodesDoc() {
		const frame = document.getElementById('nodesFrame');
		try {
			return frame && frame.contentDocument;
		} catch (_) {
			return null;
		}
	}

	// Utility: get the screen center of an element (in CSS pixels)
	function getElementCenterScreen(el) {
		if (!el) return null;
		const rect = el.getBoundingClientRect();
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
		};
	}

	// p5 sketch instance mode to avoid polluting globals
		const sketch = (p) => {
		let nodesDoc = null;
		let cachedPairs = []; // array of {fromEl, toEl}
			let frameCount = 0;

		p.setup = function () {
			p.createCanvas(p.windowWidth, p.windowHeight);
			// Style the canvas to sit between grid (z=0) and nodes (z=2)
					Object.assign(p.canvas.style, {
				position: 'fixed',
				inset: '0px',
				width: '100vw',
				height: '100vh',
						zIndex: '3', // render above nodes so lines are visible
				pointerEvents: 'none', // allow clicks to go to nodes
			});
			p.pixelDensity(1);
			p.strokeCap(p.ROUND);

			// Try to resolve elements when iframe loads
			const frame = document.getElementById('nodesFrame');
			if (frame) {
				frame.addEventListener('load', () => {
					nodesDoc = getNodesDoc();
					cacheEndpoints();
				});
			}
			// Also attempt immediately in case iframe is already loaded
			nodesDoc = getNodesDoc();
			cacheEndpoints();
		};

		p.windowResized = function () {
			p.resizeCanvas(p.windowWidth, p.windowHeight);
		};

			function cacheEndpoints() {
			cachedPairs = [];
			if (!nodesDoc) return;
			for (const c of connections) {
				const fromEl = nodesDoc.querySelector(c.from);
				const toEl = nodesDoc.querySelector(c.to);
				if (fromEl && toEl) cachedPairs.push({ fromEl, toEl });
			}
		}

			function updateConnectedClasses() {
				if (!nodesDoc) return;
				// Remove previous connected marks
				nodesDoc.querySelectorAll('.input-circle.connected, .output-circle.connected')
					.forEach(el => el.classList.remove('connected'));
				// Mark current endpoints as connected
				for (const pair of cachedPairs) {
					if (pair.fromEl) pair.fromEl.classList.add('connected');
					if (pair.toEl) pair.toEl.classList.add('connected');
				}
			}

		function drawConnection(a, b) {
			// Draw a cubic Bezier with horizontal tangents from right of A to left of B
			const dx = Math.abs(b.x - a.x);
			const handle = Math.max(40, dx * 0.35); // curvature factor
			p.noFill();
			p.stroke(118, 185, 0, 220); // NVIDIA green-ish
			p.strokeWeight(2);
			p.bezier(
				a.x, a.y,
				a.x + handle, a.y,
				b.x - handle, b.y,
				b.x, b.y
			);
		}

			p.draw = function () {
			// Clear to transparent
			p.clear();

				if (!cachedPairs.length) return;

				// Throttle class updates to avoid excessive DOM churn
				frameCount++;
				if (frameCount % 10 === 0) updateConnectedClasses();

			for (const pair of cachedPairs) {
				const a = getElementCenterScreen(pair.fromEl);
				const b = getElementCenterScreen(pair.toEl);
				if (!a || !b) continue;
						// Draw endpoint dots via CSS (connected class), so just draw the line here
						drawConnection(a, b);
			}
		};
	};

	// Start the sketch when p5 is available
	function startSketchWhenReady() {
		if (typeof window.p5 !== 'undefined') {
			new window.p5(sketch);
			return true;
		}
		return false;
	}

	if (!startSketchWhenReady()) {
		// Retry shortly in case p5 is still loading
		let attempts = 0;
		const t = setInterval(() => {
			attempts += 1;
			if (startSketchWhenReady() || attempts > 20) clearInterval(t);
		}, 100);
	}

	// Track world transform (if needed later for world-space effects)
	window.addEventListener('message', (ev) => {
		const data = ev.data || {};
		if (data.type === 'world:transform') {
			scale = data.scale;
			offsetX = data.offsetX;
			offsetY = data.offsetY;
			// Currently we render in screen space each frame using element rects,
			// so no immediate action required here.
		}
	});
})();