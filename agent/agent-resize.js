// =============================================================================
// CHATBOT RESIZE HANDLE FUNCTIONALITY
// =============================================================================
// Complete resize system for the chatbot container

// Global state variables
let isDragging = false;
let startX = 0;
let startChatbotWidth = 0;
let dragOverlay = null;              // Full-page overlay to capture mouse over iframes
let pendingWidth = null;             // For requestAnimationFrame batching
let rafId = null;                    // RAF handle

// Get DOM elements
let resizeHandle = null;
let chatbotContainer = null;

// Bound functions (so we can properly remove them)
let boundHandleResize = null;
let boundStopResize = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeChatbotResize();
    // If the parent toggles panels and posts a message into the iframe (optional), we can stop drags
    try {
        window.addEventListener('message', (ev) => {
            if (ev.data && ev.data.type === 'agent:pre-collapse') {
                try { forceStopResize(); } catch(_) {}
            }
        });
    } catch(_) {}
});

/**
 * Initialize the chatbot resize functionality
 */
function initializeChatbotResize() {
    // Get elements
    resizeHandle = document.querySelector('.chatbot-resize-handle');
    chatbotContainer = document.querySelector('.chatbot-container');
    
    if (!resizeHandle || !chatbotContainer) {
        console.log('❌ Resize elements not found');
        return;
    }
    
    console.log('✅ Initializing chatbot resize...');
    
    // Set initial cursor
    resizeHandle.style.cursor = 'col-resize';
    
    // Create bound functions so we can remove them later
    boundHandleResize = handleResize.bind(null);
    boundStopResize = stopResize.bind(null);
    
    // Add mousedown listener
    resizeHandle.addEventListener('mousedown', startResize);
}

/**
 * Start the resize operation
 */
function startResize(e) {
    // If agent is collapsed, ignore resize so the reopen button remains clickable
    if (document.body && document.body.classList && document.body.classList.contains('agent-collapsed')) {
        return;
    }
    console.log('🖱️ Starting resize - isDragging was:', isDragging);
    
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Force stop any existing drag operation
    if (isDragging) {
        console.log('⚠️ Forcing stop of existing drag');
        forceStopResize();
    }
    
    // Set dragging state
    isDragging = true;
    startX = e.clientX;
    startChatbotWidth = chatbotContainer.offsetWidth;
    
    console.log('📐 Starting drag - startX:', startX, 'startWidth:', startChatbotWidth);
    
    // Visual feedback
    resizeHandle.style.backgroundColor = '#4a90e2';
    resizeHandle.style.cursor = 'grabbing';
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // Create an overlay to ensure we capture mouse events even over iframes and outside the handle
    createDragOverlay();
    
    // Attach listeners to the overlay for consistent capture
    dragOverlay.addEventListener('mousemove', boundHandleResize);
    dragOverlay.addEventListener('mouseup', boundStopResize);
    // Extra safety on window mouseup in case mouseup happens outside the overlay (rare)
    window.addEventListener('mouseup', boundStopResize);
    
    console.log('✅ Event listeners added');
}

/**
 * Handle the resize during mouse movement
 */
function handleResize(e) {
    if (!isDragging) return;
    
    // Calculate the change in X position
    const currentX = e.clientX;
    const deltaX = startX - currentX;  // Inverted: move left = positive = wider chatbot
    const newWidth = startChatbotWidth + deltaX;
    
    // Apply constraints via clamp helper (min 300px, max 50% viewport)
    const constrainedWidth = clampWidth(newWidth);

    // Batch DOM updates via requestAnimationFrame for smoother UI
    pendingWidth = constrainedWidth;
    if (rafId === null) {
        rafId = requestAnimationFrame(() => {
            if (pendingWidth != null) {
                chatbotContainer.style.width = pendingWidth + 'px';
                pendingWidth = null;
            }
            rafId = null;
        });
    }
}

/**
 * Stop the resize operation
 */
function stopResize(e) {
    console.log('🖱️ Stop resize called - isDragging:', isDragging);
    
    if (!isDragging) {
        console.log('⚠️ Not dragging, ignoring stop call');
        return;
    }
    
    console.log('� Actually stopping resize');
    
    // Reset dragging state FIRST
    isDragging = false;
    
    // Reset visual feedback
    if (resizeHandle) {
        resizeHandle.style.backgroundColor = '#666666';
        resizeHandle.style.cursor = 'col-resize';
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Remove overlay and listeners
    if (dragOverlay) {
        dragOverlay.removeEventListener('mousemove', boundHandleResize);
        dragOverlay.removeEventListener('mouseup', boundStopResize);
    }
    window.removeEventListener('mouseup', boundStopResize);
    destroyDragOverlay();

    // Cancel any pending RAF
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    
    console.log('✅ Resize completed and all listeners removed');
}

/**
 * Force stop resize (used for cleanup)
 */
function forceStopResize() {
    console.log('🚨 Force stopping resize');
    isDragging = false;
    
    // Reset visual feedback
    if (resizeHandle) {
        resizeHandle.style.backgroundColor = '#666666';
        resizeHandle.style.cursor = 'col-resize';
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Remove all possible event listeners and overlay
    if (boundHandleResize && boundStopResize) {
        if (dragOverlay) {
            dragOverlay.removeEventListener('mousemove', boundHandleResize);
            dragOverlay.removeEventListener('mouseup', boundStopResize);
        }
        window.removeEventListener('mouseup', boundStopResize);
    }
    destroyDragOverlay();

    // Cancel any pending RAF
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

// -----------------------------------------------------------------------------
// Overlay helpers
// -----------------------------------------------------------------------------
function createDragOverlay() {
    if (dragOverlay) return; // already exists
    dragOverlay = document.createElement('div');
    dragOverlay.style.position = 'fixed';
    dragOverlay.style.inset = '0';
    dragOverlay.style.cursor = 'col-resize';
    dragOverlay.style.background = 'transparent';
    dragOverlay.style.zIndex = '2000'; // above app chrome
    dragOverlay.style.userSelect = 'none';
    dragOverlay.style.pointerEvents = 'auto';
    document.body.appendChild(dragOverlay);
}

function destroyDragOverlay() {
    if (!dragOverlay) return;
    try {
        document.body.removeChild(dragOverlay);
    } catch (_) { /* ignore */ }
    dragOverlay = null;
}

/**
 * Update chatbot width programmatically
 */
function setChatbotWidth(width) {
    if (!chatbotContainer) return;
    const constrainedWidth = clampWidth(width);
    chatbotContainer.style.width = constrainedWidth + 'px';
    console.log(`📐 Chatbot width set to: ${constrainedWidth}px`);
}

/**
 * Get current chatbot width
 */
function getChatbotWidth() {
    return chatbotContainer ? chatbotContainer.offsetWidth : 350;
}

// -----------------------------------------------------------------------------
// Constraints: min 300px, max 50% of viewport width
// -----------------------------------------------------------------------------
function clampWidth(width) {
    const minWidth = 300;                  // requested min
    const maxWidth = Math.floor(window.innerWidth * 0.5); // requested max = 50vw
    // Also ensure at least 200px remains for workspace area
    const workspaceGuard = window.innerWidth - 200;
    const effectiveMax = Math.min(maxWidth, workspaceGuard);
    return Math.max(minWidth, Math.min(effectiveMax, width));
}

// Keep width within bounds when window resizes
window.addEventListener('resize', () => {
    if (!chatbotContainer) return;
    const current = chatbotContainer.offsetWidth;
    const clamped = clampWidth(current);
    if (current !== clamped) {
        chatbotContainer.style.width = clamped + 'px';
    }
});