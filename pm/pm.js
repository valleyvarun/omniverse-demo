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
    });
})();
