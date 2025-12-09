// Stub for Project Manager iframe behavior
(function(){
    'use strict';
    
    // Define pmBody globally within the IIFE to ensure it's accessible
    let pmBody;

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function(){
        pmBody = document.querySelector('.pm-body');
        
        // Collapse button posts a message to parent to collapse Explorer sidebar
        const collapseBtn = document.getElementById('pmCollapseBtn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', function(){
                try {
                    parent.postMessage({ type: 'pm:collapse' }, '*');
                } catch(_) {}
            });
        }

        // Open Project Folder button -> open 'Folders' popup in parent
        const openProjectBtn = document.getElementById('openProjectBtn');
        if (openProjectBtn) {
            openProjectBtn.addEventListener('click', function(){
                try {
                    // Ask parent to show the popup and initialize with title 'Folders'
                    parent.postMessage({ type: 'popup:open', title: 'Folders' }, '*');
                } catch(_) {}
            });
        }
    });

    // Listen for messages from parent - OUTSIDE DOMContentLoaded to catch early messages if any
    window.addEventListener('message', function(event) {
        const data = event.data;
        if (!data) return;

        if (data.type === 'pm:load-project') {
            // Ensure pmBody is available (if message comes very fast)
            if (!pmBody) pmBody = document.querySelector('.pm-body');
            loadProject(data.projectName);
        }
    });

    function loadProject(projectName) {
        if (!pmBody) {
            console.error('pmBody not found');
            return;
        }
        
        // Normalize name for comparison
        const normalizedName = (projectName || '').toLowerCase().trim();
        
        if (normalizedName.includes('boston dynamics atlas')) {
            renderBostonDynamicsTree();
        } else {
            // Generic fallback
            pmBody.innerHTML = `<div style="padding:10px; color: #ccc;">Project: ${projectName}<br>(Empty)</div>`;
            pmBody.style.display = 'block';
        }
    }

    function renderBostonDynamicsTree() {
        if (!pmBody) return;
        
        // Clear current content (removes the Open Project button)
        pmBody.innerHTML = '';
        pmBody.style.display = 'block'; // Reset flex centering
        pmBody.style.padding = '0';

        const treeContainer = document.createElement('div');
        treeContainer.className = 'file-tree';

        // Helper to create a folder row
        function createFolder(name, level, isOpen = true, isRoot = false) {
            const div = document.createElement('div');
            div.className = `tree-item ${isRoot ? 'root' : ''}`;
            
            // Add indentation classes
            if (level === 1) div.classList.add('indent-1');
            if (level === 2) div.classList.add('indent-2');

            const arrow = document.createElement('span');
            arrow.className = 'tree-arrow';
            arrow.textContent = '▼'; // Default open
            div.appendChild(arrow);

            const label = document.createElement('span');
            label.className = `tree-label ${isRoot ? 'bold' : ''}`;
            label.textContent = isRoot ? name.toUpperCase() : name;
            div.appendChild(label);

            // Toggle logic
            div.addEventListener('click', function(e) {
                e.stopPropagation();
                const nextSibling = div.nextElementSibling;
                if (nextSibling && nextSibling.classList.contains('tree-children')) {
                    const isHidden = nextSibling.classList.contains('hidden');
                    if (isHidden) {
                        nextSibling.classList.remove('hidden');
                        div.classList.remove('collapsed');
                        arrow.style.transform = 'rotate(0deg)';
                    } else {
                        nextSibling.classList.add('hidden');
                        div.classList.add('collapsed');
                        arrow.style.transform = 'rotate(-90deg)';
                    }
                }
            });

            return div;
        }

        // Helper to create a file row
        function createFile(name, icon, level) {
            const div = document.createElement('div');
            div.className = 'tree-item';
            if (level === 1) div.classList.add('indent-1');
            if (level === 2) div.classList.add('indent-2');

            // Spacer for arrow alignment
            const spacer = document.createElement('span');
            spacer.className = 'tree-arrow'; 
            div.appendChild(spacer);

            const iconSpan = document.createElement('span');
            iconSpan.className = 'tree-icon';
            
            // Check if icon is an image path or emoji/text
            if (icon.includes('/') || icon.includes('.')) {
                const img = document.createElement('img');
                img.src = icon;
                img.alt = '';
                // Style inline or via class - keeping it simple here
                img.style.width = '14px';
                img.style.height = '14px';
                img.style.verticalAlign = 'middle';
                img.style.objectFit = 'contain';
                iconSpan.appendChild(img);
            } else {
                iconSpan.textContent = icon;
            }
            
            div.appendChild(iconSpan);

            const label = document.createElement('span');
            label.className = 'tree-label';
            label.textContent = name;
            div.appendChild(label);
            
            div.addEventListener('click', function(e) {
                e.stopPropagation();
                // Deselect others
                const allItems = treeContainer.querySelectorAll('.tree-item');
                allItems.forEach(i => i.classList.remove('selected'));
                div.classList.add('selected');
            });

            return div;
        }

        // Root: Boston Dynamics Atlas
        const rootFolder = createFolder('BOSTON DYNAMICS ATLAS', 0, true, true);
        treeContainer.appendChild(rootFolder);

        const rootChildren = document.createElement('div');
        rootChildren.className = 'tree-children';
        treeContainer.appendChild(rootChildren);

        // Folder: senario
        rootChildren.appendChild(createFolder('senario', 1));
        const senarioChildren = document.createElement('div');
        senarioChildren.className = 'tree-children';
        rootChildren.appendChild(senarioChildren);

        // Files in senario
        senarioChildren.appendChild(createFile('autocad file.dwg', '../logo/autocad-logo.png', 2));
        senarioChildren.appendChild(createFile('rhino file.3dm', '../logo/rhino8-logo.png', 2));
        senarioChildren.appendChild(createFile('sketchup file.skp', '../logo/sketchup-logo.png', 2));
        senarioChildren.appendChild(createFile('revit file.rvt', '../logo/revit-logo.png', 2));

        // Folder: robot
        rootChildren.appendChild(createFolder('robot', 1));
        const robotChildren = document.createElement('div');
        robotChildren.className = 'tree-children';
        rootChildren.appendChild(robotChildren);

        // Files in robot
        robotChildren.appendChild(createFile('python script.py', '../logo/python-logo.png', 2));
        robotChildren.appendChild(createFile('solidworks file.sldprt', '../logo/solidworks-logo.png', 2));

        // Folder: renders
        rootChildren.appendChild(createFolder('renders', 1));
        const rendersChildren = document.createElement('div');
        rendersChildren.className = 'tree-children';
        rootChildren.appendChild(rendersChildren);

        // Files in renders
        rendersChildren.appendChild(createFile('unreal project.uproject', '../logo/unrealengine-logo.png', 2));
        rendersChildren.appendChild(createFile('premiere pro.prproj', '../logo/premierpro-logo.png', 2));
        // For mp4, using a generic video icon SVG as data URI to avoid emoji
        const videoIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iMi4xOCIgcnk9IjIuMTgiPjwvcmVjdD48bGluZSB4MT0iNyIgeTE9IjIiIHgyPSI3IiB5Mj0iMjIiPjwvbGluZT48bGluZSB4MT0iMTciIHkxPSIyIiB4Mj0iMTciIHkyPSIyMiI+PC9saW5lPjxsaW5lIHgxPSIyIiB5MT0iMTIiIHgyPSIyMiIgeTI9IjEyIj48L2xpbmU+PHBhdGggZD0iTTIgN2g1Ij48L3BhdGg+PHBhdGggZD0iTTIgMTdoNSI+PC9wYXRoPjxwYXRoIGQ9Ik0xNyA3aDUiPjwvcGF0aD48cGF0aCBkPSJNMTcgMTdoNSI+PC9wYXRoPjwvc3ZnPg==';
        rendersChildren.appendChild(createFile('final render.mp4', videoIcon, 2));

        pmBody.appendChild(treeContainer);
    }

    // ===============================================================
    // VIEW SWITCHING LOGIC (Explorer vs App View)
    // ===============================================================
    const pmAppView = document.getElementById('pmAppView');
    const pmAppImage = document.getElementById('pmAppImage');
    const pmSubHeader = document.getElementById('pmSubHeader');
    const pmAppNameBtn = document.getElementById('pmAppName');
    const pmAppArrow = document.getElementById('pmAppArrow');
    const pmStatusBtn = document.getElementById('pmStatus');
    
    let currentAppName = null;

    function showExplorerView() {
        if (pmAppView) pmAppView.style.display = 'none';
        if (pmBody) {
            // Restore display based on content
            if (pmBody.querySelector('.file-tree') || (pmBody.textContent && pmBody.textContent.includes('Project:'))) {
                pmBody.style.display = 'block';
            } else {
                pmBody.style.display = 'flex';
            }
        }
        if (pmAppArrow) pmAppArrow.classList.add('collapsed');
        if (pmStatusBtn) pmStatusBtn.classList.add('active');
        if (pmAppNameBtn) pmAppNameBtn.classList.remove('active');
    }

    function showAppView() {
        if (!currentAppName) return;
        if (pmAppView) pmAppView.style.display = 'flex';
        if (pmBody) pmBody.style.display = 'none';
        if (pmAppArrow) pmAppArrow.classList.remove('collapsed');
        if (pmStatusBtn) pmStatusBtn.classList.remove('active');
        if (pmAppNameBtn) pmAppNameBtn.classList.add('active');
        
        // Update image source
        if (pmAppImage) {
            const lowerName = (currentAppName || '').toLowerCase();
            pmAppImage.style.display = 'block';
            if (lowerName === 'photoshop') {
                pmAppImage.src = '../apps/apps-content/photoshop-sidebar2.png';
            } else if (lowerName === 'd5 render') {
                pmAppImage.src = '../apps/apps-content/d5render-sidebar2.png';
            } else if (lowerName === 'rhino 8') {
                pmAppImage.src = '../apps/apps-content/rhino8-sidebar2.png';
            } else if (lowerName === 'revit') {
                pmAppImage.src = '../apps/apps-content/revit-sidebar.png';
                pmAppImage.style.display = 'block';
            } else if (lowerName === 'autocad') {
                pmAppImage.src = '../apps/apps-content/autocad-sidebar.png';
                pmAppImage.style.display = 'block';
            } else {
                // Blank black space for others
                pmAppImage.src = '';
                pmAppImage.style.display = 'none';
            }
        }
    }

    if (pmStatusBtn) {
        pmStatusBtn.addEventListener('click', () => {
            showExplorerView();
        });
    }

    if (pmAppNameBtn) {
        pmAppNameBtn.addEventListener('click', () => {
            showAppView();
        });
    }

    if (pmAppArrow) {
        pmAppArrow.addEventListener('click', () => {
            if (currentAppName) {
                if (pmAppView && pmAppView.style.display === 'none') {
                    showAppView();
                } else {
                    showExplorerView();
                }
            }
        });
    }

    // Listen for app-changed messages
    window.addEventListener('message', function(event) {
        const data = event.data;
        if (!data) return;

        if (data.type === 'pm:app-changed') {
            currentAppName = data.appName;
            if (pmSubHeader && pmAppNameBtn) {
                if (data.appName) {
                    pmAppNameBtn.textContent = data.appName;
                    pmSubHeader.style.display = 'flex';
                    showAppView();
                } else {
                    pmSubHeader.style.display = 'none';
                    showExplorerView();
                }
            }
        }
    });

})();
