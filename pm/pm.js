// Stub for Project Manager iframe behavior
(function(){
    'use strict';
    document.addEventListener('DOMContentLoaded', function(){
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
})();
