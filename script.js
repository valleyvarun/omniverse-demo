// =============================================================================
// OMNIVERSE DEMO APPLICATION JAVASCRIPT
// =============================================================================
// This file contains all the interactive functionality for the Omniverse demo
//
// =========================
// 0. TABLE OF CONTENTS:
// =========================
// 
// 1. GLOBAL KEYBOARD CONTROL (Lines ~10-35)
//    - disableGlobalKeyboard() - Disable global keyboard capture
//    - enableGlobalKeyboard() - Re-enable global keyboard capture
//
// 2. USER ACCOUNT DROPDOWN FUNCTIONALITY (Lines ~35-430)
//    - toggleDropdown() - Toggle account dropdown visibility
//    - Document initialization and event listeners
//    - Menu item click handlers
//    - Project manager resize handle functionality
//    - Message event listeners for iframe communication
//
// 3. COMMAND LINE FUNCTIONALITY (Lines ~430-1030)
//    - initializeCommandLine() - Initialize command line interface
//    - handleInputState() - Handle keyboard input in INPUT state
//    - handleConfirmationState() - Handle keyboard input in CONFIRMATION state
//    - executeCommand() - Execute commands and show confirmation
//    - showFunctionExecution() - Show function execution results
//    - showCancellation() - Show operation cancellation
//    - createCommandEntry() - Create new command history entries
//    - updateCommandEntry() - Update existing command entries
//    - adjustScrollPosition() - Handle scrolling and positioning
//    - updateFunctionDisplay() - Update function display content
//    - generateDummyFunction() - Generate dummy function names
//
// 4. HISTORY TOGGLE FUNCTIONALITY (Lines ~1030-1160)
//    - toggleHistorySize() - Toggle command history display size
//    - collapseHistory() - Collapse history display completely
//    - showHistory() - Show history display (restore to default)
//    - toggleWindowDropdown() - Toggle Window dropdown menu
//
// 5. ADD ACCOUNT FLOW FUNCTIONALITY (Lines ~1160-1420)
//    - startAddAccountFlow() - Start the add account flow
//    - showEmailPasswordForm() - Show email/password input form
//    - proceedTo2FA() - Proceed to 2FA verification step
//    - show2FAForm() - Show 2FA verification form
//    - setup2FAInputs() - Set up 2FA input behavior
//    - completeAddAccount() - Complete the add account process
//    - addEmailToDropdown() - Add new email to dropdown list
//    - cancelAddAccount() - Cancel add account flow
//    - resetAddAccountFlow() - Reset add account flow to normal
//    - resetDropdownToNormal() - Reset dropdown to normal state
//
// 6. CHATBOT INPUT FOCUS HELPER (Lines ~1420-1455)
//    - focusAgentChatInput() - Focus on agent chat input
//    - blurAgentChatInput() - Blur agent chat input
//
// 7. APPS LOADING MODAL FUNCTIONALITY (Lines ~1455-1600)
//    - showAppsLoadingModal() - Show apps loading modal
//    - handleAppsModalOpen() - Handle modal open button click
//    - handleAppsModalCancel() - Handle modal cancel button click
//    - hideAppsLoadingModal() - Hide apps loading modal
//    - enterAppsLoadingState() - Enter loading state
//    - resetAppsLoadingState() - Reset loading state
//    - handleAppsModalKeyboard() - Handle modal keyboard shortcuts


// =============================================================================
// 1. GLOBAL KEYBOARD CONTROL
// =============================================================================

// Global state for keyboard capture control
window.chatbotActive = false;

/**
 * Completely disable global keyboard capture
 */
function disableGlobalKeyboard() {
    console.log('🚫 DISABLING GLOBAL KEYBOARD CAPTURE');
    if (window.globalKeyboardListener) {
        document.removeEventListener('keydown', window.globalKeyboardListener, false);
    }
    window.chatbotActive = true;
}

/**
 * Re-enable global keyboard capture
 */
function enableGlobalKeyboard() {
    console.log('✅ ENABLING GLOBAL KEYBOARD CAPTURE');
    if (window.globalKeyboardListener) {
        // Remove any existing listener first
        document.removeEventListener('keydown', window.globalKeyboardListener, false);
        // Add it back
        document.addEventListener('keydown', window.globalKeyboardListener, false);
    }
    window.chatbotActive = false;
}






// =============================================================================
// 2. USER ACCOUNT DROPDOWN FUNCTIONALITY
// =============================================================================


/**
 * Toggle the visibility of the account dropdown menu
 */
function toggleDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    const arrow = document.querySelector('.dropdown-arrow');
    
    dropdown.classList.toggle('show');
    
    // Rotate arrow when dropdown is open
    if (dropdown.classList.contains('show')) {
        arrow.style.transform = 'rotate(180deg)';
    } else {
        arrow.style.transform = 'rotate(0deg)';
    }
}

/**
 * Initialize dropdown functionality when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const userAccount = document.querySelector('.user-account');
        const dropdown = document.getElementById('accountDropdown');
        
        if (!userAccount.contains(event.target)) {
            dropdown.classList.remove('show');
            document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
        }
    });

    // Handle dropdown item clicks for account selection
    document.querySelectorAll('.account-item').forEach(item => {
        item.addEventListener('click', function() {
            const selectedEmail = document.querySelector('.selected-email');
            selectedEmail.textContent = this.textContent;
            
            // Close dropdown after selection
            document.getElementById('accountDropdown').classList.remove('show');
            document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
        });
    });
    
    // Handle action item clicks (Add Account, Log Out)
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function(event) {
            console.log('Action clicked:', this.textContent);
            
            // Handle specific actions
            if (this.textContent === 'Add Account') {
                // Prevent event bubbling to avoid dropdown closing
                event.stopPropagation();
                // Start the add account flow (keep dropdown open)
                startAddAccountFlow();
            } else if (this.textContent === 'Log Out of Account') {
                // Handle logout functionality
                alert('Logout functionality would go here');
                // Close dropdown after logout action
                document.getElementById('accountDropdown').classList.remove('show');
                document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
            }
        });
    });
    
    // Handle menu item clicks
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(event) {
            const menuText = this.textContent.trim();
            console.log('Menu clicked:', menuText);
            
            if (menuText === 'Apps') {
                event.preventDefault();
                // Open Apps popup
                window.postMessage({ type: 'popup:open', title: 'Apps' }, '*');
            }
        });
    });
    
    // -----------------------------------------------------------------------------
    // COMMAND LINE FUNCTIONALITY
    // -----------------------------------------------------------------------------
    
    // Initialize command line functionality
    initializeCommandLine();
    
    // Initialize tab functionality
    initializeTabs();

    // Chatbot focus routing: clicking inside chatbot panel should focus its input
    const chatbotContainer = document.getElementById('chatbotContainer');
    if (chatbotContainer) {
        chatbotContainer.addEventListener('click', function(event) {
            // Don't steal focus when interacting with controls inside chatbot
            if (event.target.closest('select, button, input, textarea')) {
                return;
            }
            focusAgentChatInput();
        });
    }

    // ---------------------------------------------------------------------------
    // HEADER BRAND RELOAD: clicking the Omniverse logo or text reloads the app
    // ---------------------------------------------------------------------------
    const headerLogo = document.querySelector('.header-left .logo');
    const headerBrandText = document.querySelector('.header-left .brand-text');
    [headerLogo, headerBrandText].forEach(el => {
        if (!el) return;
        // Improve accessibility: make them focusable and button-like
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        // Click to reload
        el.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
        // Enter/Space to reload when focused
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.reload();
            }
        });
    });

    // ---------------------------------------------------------------------------
    // PROJECT MANAGER RESIZE HANDLE (drag to adjust left sidebar width)
    // ---------------------------------------------------------------------------
    const pmContainer = document.querySelector('.project-manager-container');
    const pmHandle = document.getElementById('projectResizeHandle');
    // Track last expanded width across collapse/reopen cycles (initialized conservatively)
    let lastExpandedPMWidth = 160;
    if (pmContainer && pmHandle) {
        const MIN_W = 150; // updated min width
        lastExpandedPMWidth = pmContainer.getBoundingClientRect().width || 160;
        let dragging = false;
        let startX = 0;
        let startWidth = 0;
        let lastX = 0;
        let rafPending = false;
        let overlay = null;
        let overlayMouseUpHandler = null;
        let safetyTimer = null;

        const applyWidth = () => {
            if (!dragging) return;
            const dx = lastX - startX;
            const viewportMax = Math.round(window.innerWidth * 0.20); // 20vw
            const target = Math.max(MIN_W, Math.min(viewportMax, Math.round(startWidth + dx)));
            pmContainer.style.width = target + 'px';
            lastExpandedPMWidth = target; // remember last width while resizing
            rafPending = false;
        };

        const onMove = (e) => {
            if (!dragging) return;
            lastX = e.clientX;
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(applyWidth);
            }
        };

        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            pmHandle.classList.remove('dragging');
            // Clean listeners
            window.removeEventListener('mousemove', onMove, true);
            window.removeEventListener('mouseup', endDrag, true);
            window.removeEventListener('mouseleave', endDrag, true);
            window.removeEventListener('blur', endDrag, true);
            document.removeEventListener('visibilitychange', endDrag, true);
            // Remove overlay
            if (overlay) {
                try { overlay.removeEventListener('mouseup', overlayMouseUpHandler, true); } catch(_) {}
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }
            overlay = null;
            if (safetyTimer) {
                clearTimeout(safetyTimer);
                safetyTimer = null;
            }
            // Restore selection
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };

        // Expose a safe cleanup so other parts (collapse/reopen) can end drags immediately
        window.__pmEndExplorerDrag = () => {
            try { endDrag(); } catch(_) {}
        };

        const usePointerEvents = 'onpointerdown' in window;

        if (usePointerEvents) {
            let pointerId = null;
            const onPointerDown = (e) => {
                if (document.body.classList.contains('explorer-collapsed')) {
                    // If collapsed, treat pointerdown as a reopen click passthrough
                    const reopen = document.getElementById('reopenExplorerBtn');
                    if (reopen) reopen.click();
                    return;
                }
                e.preventDefault();
                dragging = true;
                pointerId = e.pointerId;
                pmHandle.setPointerCapture(pointerId);
                startX = e.clientX;
                startWidth = pmContainer.getBoundingClientRect().width;
                lastX = startX;
                pmHandle.classList.add('dragging');
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'col-resize';
                // Create overlay to guard against iframe focus/selection during drag
                overlay = document.createElement('div');
                Object.assign(overlay.style, {
                    position: 'fixed',
                    inset: '0',
                    zIndex: '3000',
                    background: 'transparent',
                    cursor: 'col-resize'
                });
                document.body.appendChild(overlay);
                overlayMouseUpHandler = (ev) => { ev.preventDefault(); onPointerUp(); };
                overlay.addEventListener('mouseup', overlayMouseUpHandler, true);
                // Safety timer to ensure cleanup if pointerup is lost
                safetyTimer = setTimeout(() => { if (dragging) onPointerUp(); }, 10000);
                // End drag if window loses focus or page visibility changes
                window.addEventListener('blur', endDrag, true);
                document.addEventListener('visibilitychange', endDrag, true);
            };
            const onPointerMove = (e) => {
                if (!dragging) return;
                lastX = e.clientX;
                if (!rafPending) {
                    rafPending = true;
                    requestAnimationFrame(applyWidth);
                }
            };
            const onPointerUp = () => {
                if (!dragging) return;
                dragging = false;
                try { if (pointerId != null) pmHandle.releasePointerCapture(pointerId); } catch(_) {}
                pmHandle.classList.remove('dragging');
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
                if (overlay) {
                    try { overlay.removeEventListener('mouseup', overlayMouseUpHandler, true); } catch(_) {}
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }
                overlay = null;
                if (safetyTimer) {
                    clearTimeout(safetyTimer);
                    safetyTimer = null;
                }
                window.removeEventListener('blur', endDrag, true);
                document.removeEventListener('visibilitychange', endDrag, true);
            };
            pmHandle.addEventListener('pointerdown', onPointerDown);
            pmHandle.addEventListener('pointermove', onPointerMove);
            pmHandle.addEventListener('pointerup', onPointerUp);
            pmHandle.addEventListener('lostpointercapture', onPointerUp);
            pmHandle.addEventListener('pointercancel', onPointerUp);
            // Prevent native drag or context menu from interfering
            pmHandle.addEventListener('dragstart', (e) => e.preventDefault());
            pmHandle.addEventListener('contextmenu', (e) => e.preventDefault());
        } else {
            // Mouse fallback
            pmHandle.addEventListener('mousedown', (e) => {
                if (document.body.classList.contains('explorer-collapsed')) {
                    // If collapsed, reopen instead of starting drag
                    const reopen = document.getElementById('reopenExplorerBtn');
                    if (reopen) reopen.click();
                    return;
                }
                e.preventDefault();
                dragging = true;
                startX = e.clientX;
                startWidth = pmContainer.getBoundingClientRect().width;
                lastX = startX;
                pmHandle.classList.add('dragging');
                // Create full-screen overlay to capture events over iframes
                overlay = document.createElement('div');
                Object.assign(overlay.style, {
                    position: 'fixed',
                    inset: '0',
                    zIndex: '3000',
                    background: 'transparent',
                    cursor: 'col-resize'
                });
                document.body.appendChild(overlay);
                // Also add a mouseup on the overlay itself (some browsers route to target first)
                overlayMouseUpHandler = (ev) => { ev.preventDefault(); endDrag(); };
                overlay.addEventListener('mouseup', overlayMouseUpHandler, true);
                // Prevent text selection during drag
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'col-resize';
                // Listen at window level and in capture to win over iframes/others
                window.addEventListener('mousemove', onMove, true);
                window.addEventListener('mouseup', endDrag, true);
                window.addEventListener('mouseleave', endDrag, true);
                window.addEventListener('blur', endDrag, true);
                document.addEventListener('visibilitychange', endDrag, true);
                // Safety timeout to auto-clean if somehow mouseup is lost
                safetyTimer = setTimeout(() => {
                    if (dragging) endDrag();
                }, 10000); // 10s safety
            });
            pmHandle.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    }

    // Reopen buttons
    const reopenExplorerBtn = document.getElementById('reopenExplorerBtn');
    if (reopenExplorerBtn) {
        reopenExplorerBtn.addEventListener('click', () => {
            // Ensure any stale drag state is cleared before reopening
            try { window.__pmEndExplorerDrag && window.__pmEndExplorerDrag(); } catch(_) {}
            document.body.classList.remove('explorer-collapsed');
            // restore previous width (clamped to constraints)
            const viewportMax = Math.round(window.innerWidth * 0.20);
            const target = Math.max(150, Math.min(viewportMax, Math.round(lastExpandedPMWidth || 160)));
            if (pmContainer) pmContainer.style.width = target + 'px';
        });
    }

    const reopenAgentBtn = document.getElementById('reopenAgentBtn');
    if (reopenAgentBtn) {
        reopenAgentBtn.addEventListener('click', () => {
            document.body.classList.remove('agent-collapsed');
        });
    }

    // Listen to collapse requests from iframes
    window.addEventListener('message', (ev) => {
        const data = ev.data || {};
        if (data.type === 'pm:collapse') {
            // store last width, collapse explorer
            try {
                lastExpandedPMWidth = pmContainer?.getBoundingClientRect()?.width || lastExpandedPMWidth;
            } catch(_) {}
            // Force-stop any ongoing drag to avoid stuck overlays or capture
            try { window.__pmEndExplorerDrag && window.__pmEndExplorerDrag(); } catch(_) {}
            document.body.classList.add('explorer-collapsed');
        }
        if (data.type === 'agent:collapse') {
            // Force-stop agent drag if active (function from agent-resize.js)
            try { if (typeof forceStopResize === 'function') forceStopResize(); } catch(_) {}
            document.body.classList.add('agent-collapsed');
            // After collapsing the agent, route typing back to the command line automatically
            try {
                blurAgentChatInput();
                enableGlobalKeyboard();
                window.chatbotState = { ...(window.chatbotState||{}), inputFocused: false };
                const commandInput = document.getElementById('commandInput');
                if (commandInput) {
                    setTimeout(() => { commandInput.focus(); }, 10);
                }
            } catch(_) {}
        }

        // Open popup on explicit request from an iframe (e.g., PM 'Open Project Folder')
        if (data.type === 'popup:open') {
            try {
                const modalOverlay = document.getElementById('contentModalOverlay');
                const popupFrame = document.getElementById('popupFrame');
                if (modalOverlay && popupFrame?.contentWindow) {
                    // Show modal overlay
                    modalOverlay.classList.add('show');
                    modalOverlay.setAttribute('aria-hidden', 'false');
                    // Initialize popup with provided title
                    popupFrame.contentWindow.postMessage({ type: 'popup:init', title: data.title || 'Popup' }, '*');
                }
            } catch(_) {}
        }
        
        // Close popup on explicit request from an iframe (e.g., Cancel button in Folders)
        if (data.type === 'popup:close') {
            try {
                const modalOverlay = document.getElementById('contentModalOverlay');
                if (modalOverlay) {
                    modalOverlay.classList.remove('show');
                    modalOverlay.setAttribute('aria-hidden', 'true');
                    // After closing, ensure typing goes to the Command line
                    const commandInput = document.getElementById('commandInput');
                    if (commandInput) {
                        blurAgentChatInput();
                        enableGlobalKeyboard();
                        window.chatbotState = { ...(window.chatbotState||{}), inputFocused: false };
                        setTimeout(() => { commandInput.focus(); }, 10);
                    }
                }
            } catch(_) {}
        }

        // Show apps loading modal
        if (data.type === 'showAppsModal') {
            try {
                showAppsLoadingModal(data.appData);
            } catch(_) {}
        }
    });
});






// =============================================================================
// 3. COMMAND LINE FUNCTIONALITY
// =============================================================================

// State management for command execution flow
let currentState = 'INPUT'; // 'INPUT', 'CONFIRMATION', 'EXECUTED'
let pendingCommand = '';
let pendingFunction = '';
let currentCommandEntry = null; // Track the current command entry element

/**
 * Initialize command line interface
 */
function initializeCommandLine() {
    const commandInput = document.getElementById('commandInput');
    
    // Focus on command input when page loads
    commandInput.focus();
    
    // Store the global keyboard listener so we can disable it
    window.globalKeyboardListener = function(event) {
        // COMPLETE OVERRIDE: If chatbot is active, do nothing at all
        if (window.chatbotActive) {
            return;
        }
        
        // Don't interfere with chatbot input when it's focused
        if (window.chatbotState && window.chatbotState.inputFocused) {
            console.log('Blocked global capture - chatbot focused');
            return;
        }
        
        // Don't interfere with typing in dropdowns or other inputs (except commandInput)
        if (event.target.tagName === 'INPUT' && event.target !== commandInput) {
            return;
        }
        
        // Don't interfere if user is typing in the chatbot area
        const chatbotContainer = document.getElementById('chatbotContainer');
        if (chatbotContainer && chatbotContainer.contains(event.target)) {
            console.log('Blocked global capture - event target in chatbot');
            return;
        }
        
        // Additional check - if the active element is the chat input
        const chatInput = document.getElementById('chatInput');
        if (document.activeElement === chatInput) {
            console.log('Blocked global capture - chat input is active element');
            return;
        }
        
        // Handle different states
        if (currentState === 'INPUT') {
            handleInputState(event, commandInput);
        } else if (currentState === 'CONFIRMATION') {
            handleConfirmationState(event);
        }
    };
    
    // Add the global keyboard listener
    document.addEventListener('keydown', window.globalKeyboardListener, false);
    
    // Also capture keydown events from iframe content
    const iframe = document.getElementById('contentFrame');
    if (iframe) {
        iframe.addEventListener('load', function() {
            try {
                // Access iframe document (only works if same origin)
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                // Add keydown listener to iframe document
                iframeDoc.addEventListener('keydown', function(event) {
                    // Don't interfere with chatbot input when it's focused
                    if (window.chatbotState && window.chatbotState.inputFocused) {
                        return;
                    }
                    
                    // Don't interfere with typing in iframe inputs
                    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                        return;
                    }
                    
                    // Don't interfere if user is typing in the chatbot area
                    const chatbotContainer = document.getElementById('chatbotContainer');
                    if (chatbotContainer && chatbotContainer.contains(event.target)) {
                        return;
                    }
                    
                    // Redirect all other keyboard input to main command line
                    if (currentState === 'INPUT') {
                        handleInputState(event, commandInput);
                    } else if (currentState === 'CONFIRMATION') {
                        handleConfirmationState(event);
                    }
                });
                
                // Prevent iframe from capturing focus when clicked
                iframeDoc.addEventListener('click', function() {
                    // Explicitly re-enable global keyboard routing to command line
                    try {
                        blurAgentChatInput();
                        enableGlobalKeyboard();
                        window.chatbotState = { ...(window.chatbotState||{}), inputFocused: false };
                    } catch(_) {}
                    // Always return focus to command input after any click in iframe
                    setTimeout(() => {
                        commandInput.focus();
                    }, 10);
                });

                // Centered modal overlay logic for home icons
                const modalOverlay = document.getElementById('contentModalOverlay');
                const popupFrame = document.getElementById('popupFrame');
                const showModal = () => {
                    if (!modalOverlay) return;
                    modalOverlay.classList.add('show');
                    modalOverlay.setAttribute('aria-hidden', 'false');
                };
                const hideModal = () => {
                    if (!modalOverlay) return;
                    modalOverlay.classList.remove('show');
                    modalOverlay.setAttribute('aria-hidden', 'true');
                    // After closing, ensure typing goes to the Command line
                    try {
                        blurAgentChatInput();
                        enableGlobalKeyboard();
                        window.chatbotState = { ...(window.chatbotState||{}), inputFocused: false };
                    } catch(_) {}
                    setTimeout(() => { commandInput.focus(); }, 10);
                };
                // Open on any home .icon-item click
                try {
                    iframeDoc.querySelectorAll('.icon-item').forEach(el => {
                        el.style.cursor = 'pointer';
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            // Extract the name shown in the icon (fallback to alt text)
                            const name = el.querySelector('.icon-name')?.textContent?.trim() ||
                                         el.querySelector('img.icon-image')?.alt || 'Item';
                            showModal();
                            // Pass the title into the popup iframe
                            try {
                                const popupWin = popupFrame?.contentWindow;
                                popupWin?.postMessage({ type: 'popup:init', title: name }, '*');
                            } catch(_) {}
                        });
                    });
                } catch(_) {}
                    // Note: Do not close on backdrop click or on Escape.
                    // The only way to close is via the popup iframe cross button (popup:close message).

                // Listen for popup close requests from the iframe
                window.addEventListener('message', (ev) => {
                    if (ev.data && ev.data.type === 'popup:close') {
                        hideModal();
                    }
                });
                
            } catch (e) {
                console.log('Cannot access iframe content (cross-origin)');
            }
        });
    }

    // Ensure Explorer (pm iframe) never traps typing: route to command line
    const pmFrame = document.getElementById('pmFrame');
    if (pmFrame) {
        // Helper to bind routing into the PM iframe, works even if it already loaded
        const bindPmRouting = () => {
            try {
                const pmDoc = pmFrame.contentDocument || pmFrame.contentWindow?.document;
                if (!pmDoc) return false;
                // Avoid duplicate bindings for the same document
                if (pmDoc.__omniversePmRoutingBound) return true;
                pmDoc.__omniversePmRoutingBound = true;

                // Route ALL keystrokes in Explorer to command line (even inside inputs)
                pmDoc.addEventListener('keydown', function(event) {
                    // If chatbot input is focused, don't override
                    if (window.chatbotState && window.chatbotState.inputFocused) return;
                    // Prevent Explorer from consuming the keystroke
                    event.preventDefault();
                    event.stopPropagation();
                    if (currentState === 'INPUT') {
                        handleInputState(event, commandInput);
                    } else if (currentState === 'CONFIRMATION') {
                        handleConfirmationState(event);
                    }
                }, true); // capture to intercept early

                // Clicking anywhere in Explorer should focus command input
                pmDoc.addEventListener('click', function() {
                    try {
                        blurAgentChatInput();
                        enableGlobalKeyboard();
                        window.chatbotState = { ...(window.chatbotState||{}), inputFocused: false };
                    } catch(_) {}
                    setTimeout(() => { commandInput.focus(); }, 10);
                }, true);

                return true;
            } catch (e) {
                console.log('Cannot access PM iframe content (cross-origin)');
                return false;
            }
        };

        // Try immediate bind in case iframe already loaded
        let bound = bindPmRouting();
        // Bind on load for normal cases
        pmFrame.addEventListener('load', () => {
            setTimeout(() => { bindPmRouting(); }, 0);
        });
        // If not bound yet (e.g., load fired before we attached), poll briefly
        if (!bound) {
            let tries = 0;
            const iv = setInterval(() => {
                if (bindPmRouting() || ++tries > 20) {
                    clearInterval(iv);
                }
            }, 100);
        }

        // If the iframe element itself gains focus (e.g., click), shift focus to command input
        pmFrame.addEventListener('focus', () => {
            try {
                blurAgentChatInput();
                enableGlobalKeyboard();
                window.chatbotState = { ...(window.chatbotState||{}), inputFocused: false };
            } catch(_) {}
            setTimeout(() => { commandInput.focus(); }, 10);
        });
    }
    
    // Global click listener to return focus to command input
    document.addEventListener('click', function(event) {
        // Don't interfere with dropdown interactions
        if (event.target.closest('.dropdown-menu') || 
            event.target.closest('.account-dropdown') ||
            event.target.closest('.window-dropdown')) {
            return;
        }
        // Don't steal focus if clicking inside the chatbot container
        if (event.target.closest('#chatbotContainer')) {
            return;
        }
        
        // Explicitly blur chatbot input and re-enable global keyboard capture
        blurAgentChatInput();
        try {
            enableGlobalKeyboard();
            window.chatbotState = { ...(window.chatbotState||{}), inputFocused: false };
        } catch(_) {}

        // Always focus command input after any click outside chatbot
        setTimeout(() => {
            commandInput.focus();
        }, 10);
    });
}

/**
 * Handle keyboard input in INPUT state
 */
function handleInputState(event, commandInput) {
    // ABSOLUTE OVERRIDE: If chatbot is active, never interfere
    if (window.chatbotActive) {
        console.log('handleInputState blocked - chatbot is active');
        return;
    }
    
    // Don't interfere with chatbot input when it's focused or active
    if (window.chatbotState && window.chatbotState.inputFocused) {
        console.log('handleInputState blocked - chatbot input focused');
        return;
    }
    
    // Don't interfere if user is typing in the chatbot area
    const chatbotContainer = document.getElementById('chatbotContainer');
    if (chatbotContainer && chatbotContainer.contains(event.target)) {
        console.log('handleInputState blocked - event target in chatbot');
        return;
    }
    
    // Don't interfere if the active element is the chat input
    const chatInput = document.getElementById('chatInput');
    if (document.activeElement === chatInput) {
        console.log('handleInputState blocked - chat input is active element');
        return;
    }
    
    // Only proceed if we're absolutely sure we should handle this
    console.log('handleInputState proceeding - commandInput will handle event');
    
    // Regular typing - always redirect to command input
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
        // Always focus command input and handle the keystroke
        event.preventDefault(); // Prevent default behavior
        
        if (document.activeElement !== commandInput) {
            commandInput.focus();
        }
        
        // Handle the keystroke manually
        if (event.key.length === 1) {
            // Add character to command input
            const cursorPos = commandInput.selectionStart;
            const currentValue = commandInput.value;
            commandInput.value = currentValue.slice(0, cursorPos) + event.key + currentValue.slice(cursorPos);
            commandInput.setSelectionRange(cursorPos + 1, cursorPos + 1);
        } else if (event.key === 'Backspace') {
            // Handle backspace
            const cursorPos = commandInput.selectionStart;
            if (cursorPos > 0) {
                const currentValue = commandInput.value;
                commandInput.value = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
                commandInput.setSelectionRange(cursorPos - 1, cursorPos - 1);
            }
        } else if (event.key === 'Delete') {
            // Handle delete
            const cursorPos = commandInput.selectionStart;
            const currentValue = commandInput.value;
            if (cursorPos < currentValue.length) {
                commandInput.value = currentValue.slice(0, cursorPos) + currentValue.slice(cursorPos + 1);
                commandInput.setSelectionRange(cursorPos, cursorPos);
            }
        }
    }
    
    // Handle Enter key to execute command
    if (event.key === 'Enter') {
        event.preventDefault();
        const command = commandInput.value.trim();
        if (command) {
            executeCommand(command);
            commandInput.value = '';
        }
        commandInput.focus();
    }
    
    // Handle arrow keys for command input navigation
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || 
        event.key === 'Home' || event.key === 'End') {
        if (document.activeElement !== commandInput) {
            event.preventDefault();
            commandInput.focus();
        }
    }
}

/**
 * Handle keyboard input in CONFIRMATION state
 */
function handleConfirmationState(event) {
    if (event.key === 'Enter') {
        // User confirmed - show function execution
        showFunctionExecution();
        currentState = 'INPUT';
    } else if (event.key === 'Escape') {
        // User cancelled
        showCancellation();
        currentState = 'INPUT';
    }
    event.preventDefault(); // Prevent any default behavior
}

/**
 * Execute the command and show confirmation prompt
 */
function executeCommand(command) {
    pendingCommand = command;
    
    // Special handling for "clear" command
    if (command.toLowerCase() === 'clear') {
        // Create confirmation entry for clear command
        currentCommandEntry = createCommandEntry(command, [
            'Are you sure you would like to clear the Command Line History',
            'Yes: <enter>    No: <esc>'
        ]);
        pendingFunction = 'clear_history()';
        currentState = 'CONFIRMATION';
    } 
    // Immediate execution commands (no confirmation needed)
    else if (command.toLowerCase() === 'open folders') {
        // Execute immediately - open the folders popup
        window.postMessage({ type: 'popup:open', title: 'Folders' }, '*');
        
        // Create command entry with immediate result
        currentCommandEntry = createCommandEntry(command, [
            'Folders popup opened'
        ]);
        
        // Reset state immediately since no confirmation needed
        currentState = 'INPUT';
        currentCommandEntry = null;
        pendingCommand = '';
        pendingFunction = '';
    }
    else if (command.toLowerCase() === 'open apps') {
        // Execute immediately - open the apps popup
        window.postMessage({ type: 'popup:open', title: 'Apps' }, '*');
        
        // Create command entry with immediate result
        currentCommandEntry = createCommandEntry(command, [
            'Apps popup opened'
        ]);
        
        // Reset state immediately since no confirmation needed
        currentState = 'INPUT';
        currentCommandEntry = null;
        pendingCommand = '';
        pendingFunction = '';
    }
    else if (command.toLowerCase() === 'open store') {
        // Execute immediately - open the store popup
        window.postMessage({ type: 'popup:open', title: 'Store' }, '*');
        
        // Create command entry with immediate result
        currentCommandEntry = createCommandEntry(command, [
            'Store popup opened'
        ]);
        
        // Reset state immediately since no confirmation needed
        currentState = 'INPUT';
        currentCommandEntry = null;
        pendingCommand = '';
        pendingFunction = '';
    }
    else if (command.toLowerCase() === 'open agent') {
        // Open the Agent panel if collapsed; otherwise leave as-is
        try {
            const body = document.body;
            if (body.classList.contains('agent-collapsed')) {
                const btn = document.getElementById('reopenAgentBtn');
                if (btn) {
                    btn.click();
                } else {
                    body.classList.remove('agent-collapsed');
                }
            }
        } catch (e) {
            console.warn('open agent: failed to toggle agent state', e);
        }

        // Create command entry with immediate result
        currentCommandEntry = createCommandEntry(command, [
            'Agent opened'
        ]);
        
        // Reset state immediately since no confirmation needed
        currentState = 'INPUT';
        currentCommandEntry = null;
        pendingCommand = '';
        pendingFunction = '';
    }
    else if (command.toLowerCase() === 'open explorer') {
        // Open the Explorer sidebar if collapsed; otherwise leave as-is
        try {
            const body = document.body;
            if (body.classList.contains('explorer-collapsed')) {
                // Prefer triggering the existing reopen button logic to restore width/state
                const btn = document.getElementById('reopenExplorerBtn');
                if (btn) {
                    // Ensure any stale drag state is cleared
                    try { window.__pmEndExplorerDrag && window.__pmEndExplorerDrag(); } catch(_) {}
                    btn.click();
                } else {
                    body.classList.remove('explorer-collapsed');
                }
            }
        } catch (e) {
            console.warn('open explorer: failed to toggle explorer state', e);
        }

        // Create command entry with immediate result
        currentCommandEntry = createCommandEntry(command, [
            'Explorer opened'
        ]);
        
        // Reset state immediately since no confirmation needed
        currentState = 'INPUT';
        currentCommandEntry = null;
        pendingCommand = '';
        pendingFunction = '';
    }
    // Generic: open {favorite software name}
    else if (/^open\s+.+/i.test(command)) {
        const namePart = command.replace(/^open\s+/i, '').trim();
        const appData = resolveFavoriteApp(namePart);
        if (appData) {
            try {
                showAppsLoadingModal(appData);
                handleAppsModalOpen();
            } catch (e) {
                console.warn('Failed to auto-open app via modal flow, creating tab directly:', e);
                try { createAppTab(appData); } catch (_) {}
            }

            currentCommandEntry = createCommandEntry(command, [
                `${appData.name} opening...`
            ]);
            currentState = 'INPUT';
            currentCommandEntry = null;
            pendingCommand = '';
            pendingFunction = '';
        } else {
            // Not a known favorite - fall through to regular confirmation flow
            pendingFunction = generateDummyFunction(command);
            currentCommandEntry = createCommandEntry(command, [
                `Would you like to perform ${command}?`,
                'Yes: <enter>    No: <esc>'
            ]);
            currentState = 'CONFIRMATION';
        }
    }
    // Immediate app open commands: open blender/sketchup/photoshop/rhino8
    else if ((() => {
        const lc = command.toLowerCase();
        return lc === 'open blender' || lc === 'open sketchup' || lc === 'open photoshop' || lc === 'open rhino8';
    })()) {
        const lc = command.toLowerCase();
        let appData = null;
        if (lc === 'open blender') {
            appData = { name: 'Blender', icon: 'logo/blender-logo.png' };
        } else if (lc === 'open sketchup') {
            appData = { name: 'SketchUp', icon: 'logo/sketchup-logo.png' };
        } else if (lc === 'open photoshop') {
            appData = { name: 'Photoshop', icon: 'logo/photoshop-logo.png' };
        } else if (lc === 'open rhino8') {
            appData = { name: 'Rhino 8', icon: 'logo/rhino8-logo.png' };
        }

        try {
            // Show loading modal (auto-hides after 5s) and immediately proceed to open
            showAppsLoadingModal(appData);
            // Immediately simulate clicking Open
            handleAppsModalOpen();
        } catch (e) {
            console.warn('Failed to auto-open app via modal flow, creating tab directly:', e);
            try { createAppTab(appData); } catch (_) {}
        }

        // Create command entry with immediate result
        currentCommandEntry = createCommandEntry(command, [
            `${appData.name} opening...`
        ]);
        
        // Reset state immediately since no confirmation needed
        currentState = 'INPUT';
        currentCommandEntry = null;
        pendingCommand = '';
        pendingFunction = '';
    }
    else {
        // Regular command handling with confirmation
        pendingFunction = generateDummyFunction(command);
        
        // Create new command entry with command bubble and store reference
        currentCommandEntry = createCommandEntry(command, [
            `Would you like to perform ${command}?`,
            'Yes: <enter>    No: <esc>'
        ]);
        currentState = 'CONFIRMATION';
    }
}

/**
 * Show that the function was executed
 */
function showFunctionExecution() {
    // Special handling for clear command
    if (pendingCommand.toLowerCase() === 'clear') {
        // Clear all history entries
        const functionBubbles = document.getElementById('functionBubbles');
        functionBubbles.innerHTML = '';
        
        // Add only the confirmation text without command bubble
        const clearEntry = document.createElement('div');
        clearEntry.className = 'command-history-entry';
        
        const resultLine = document.createElement('div');
        resultLine.className = 'function-line';
        resultLine.textContent = 'Command Line History cleared';
        clearEntry.appendChild(resultLine);
        
        functionBubbles.appendChild(clearEntry);
        
        // Ensure scroll position is properly adjusted after clearing
        adjustScrollPosition();
    }
    else {
        // Regular command execution result
        updateCommandEntry(currentCommandEntry, [
            `${pendingCommand}`,
            `${pendingFunction}`
        ]);
    }
    
    currentCommandEntry = null; // Clear reference
}

/**
 * Show that the operation was cancelled
 */
function showCancellation() {
    // Update the current command entry with cancellation message
    updateCommandEntry(currentCommandEntry, [
        `${pendingCommand}`,
        'cancelled'
    ]);
    
    currentCommandEntry = null; // Clear reference
}

/**
 * Create a new command entry in the function display
 * @param {string} command - The user's command text
 * @param {Array<string>} lines - Array of text lines to display (max 2)
 * @returns {HTMLElement} - The created command entry element
 */
function createCommandEntry(command, lines) {
    const functionBubbles = document.getElementById('functionBubbles');
    
    // Create a command entry container
    const commandEntry = document.createElement('div');
    commandEntry.className = 'command-history-entry';
    
    // Create command bubble to show what user typed
    const commandBubble = document.createElement('div');
    commandBubble.className = 'command-bubble';
    commandBubble.textContent = command;
    commandEntry.appendChild(commandBubble);
    
    // Add each prompt/result line
    lines.slice(0, 2).forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'function-line';
        lineDiv.textContent = line;
        commandEntry.appendChild(lineDiv);
    });
    
    // Add entry to the display
    functionBubbles.appendChild(commandEntry);
    
    // Handle scrolling and positioning
    adjustScrollPosition();
    
    return commandEntry;
}

/**
 * Update an existing command entry with new content
 * @param {HTMLElement} commandEntry - The command entry element to update
 * @param {Array<string>} lines - Array of text lines to display (max 2)
 */
function updateCommandEntry(commandEntry, lines) {
    if (!commandEntry) return;
    
    // Find and preserve the existing command bubble
    const existingBubble = commandEntry.querySelector('.command-bubble');
    
    // Clear existing content but keep the command bubble
    commandEntry.innerHTML = '';
    
    // Re-add the command bubble first
    if (existingBubble) {
        commandEntry.appendChild(existingBubble);
    }
    
    // Add new lines
    lines.slice(0, 2).forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'function-line';
        lineDiv.textContent = line;
        commandEntry.appendChild(lineDiv);
    });
    
    // Handle scrolling and positioning
    adjustScrollPosition();
}

/**
 * Adjust scroll position to show latest content while allowing full scroll access
 */
function adjustScrollPosition() {
    const functionDisplay = document.querySelector('.function-display');
    const functionBubbles = document.getElementById('functionBubbles');
    
    // Ensure the container exists and has content
    if (!functionDisplay || !functionBubbles) return;
    
    // Always scroll to bottom to show latest content
    functionDisplay.scrollTop = functionDisplay.scrollHeight;
    
    // Reset any previous justify-content settings
    functionBubbles.style.justifyContent = '';
    functionBubbles.style.minHeight = '';
    
    // If content is less than container height, adjust styling to push to bottom
    if (functionBubbles.scrollHeight <= functionDisplay.clientHeight) {
        functionBubbles.style.justifyContent = 'flex-end';
        functionBubbles.style.minHeight = '100%';
    } else {
        functionBubbles.style.justifyContent = 'flex-start';
        functionBubbles.style.minHeight = 'auto';
    }
    
    // Ensure scroll position is at bottom after adjustments
    setTimeout(() => {
        functionDisplay.scrollTop = functionDisplay.scrollHeight;
    }, 0);
}

/**
 * Update the function display with new content
 * @param {Array<string>} lines - Array of text lines to display (max 2)
 * @param {boolean} append - Whether to append or replace content (default: append)
 */
function updateFunctionDisplay(lines, append = true) {
    const functionBubbles = document.getElementById('functionBubbles');
    
    if (!append) {
        // Clear previous content only if explicitly requested
        functionBubbles.innerHTML = '';
    }
    
    // Create a command entry container for this set of lines
    const commandEntry = document.createElement('div');
    commandEntry.className = 'command-history-entry';
    
    // Add each line to the entry
    lines.slice(0, 2).forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'function-line';
        lineDiv.textContent = line;
        commandEntry.appendChild(lineDiv);
    });
    
    // Add entry to the display
    functionBubbles.appendChild(commandEntry);
    
    // Auto-scroll to show the latest entry
    functionBubbles.scrollTop = functionBubbles.scrollHeight;
}

/**
 * Generate a dummy function name based on the command
 * @param {string} command - The input command
 * @returns {string} - A dummy function call
 */
function generateDummyFunction(command) {
    // Simple function generation based on command keywords
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('create') || lowerCommand.includes('make')) {
        return `create_object("${command}")`;
    } else if (lowerCommand.includes('delete') || lowerCommand.includes('remove')) {
        return `delete_object("${command}")`;
    } else if (lowerCommand.includes('move') || lowerCommand.includes('translate')) {
        return `move_object("${command}", x, y, z)`;
    } else if (lowerCommand.includes('rotate')) {
        return `rotate_object("${command}", angle)`;
    } else if (lowerCommand.includes('scale') || lowerCommand.includes('resize')) {
        return `scale_object("${command}", factor)`;
    } else if (lowerCommand.includes('render') || lowerCommand.includes('display')) {
        return `render_scene("${command}")`;
    } else if (lowerCommand.includes('load') || lowerCommand.includes('import')) {
        return `load_asset("${command}")`;
    } else if (lowerCommand.includes('save') || lowerCommand.includes('export')) {
        return `save_project("${command}")`;
    } else {
        return `execute_command("${command}")`;
    }
}








// =============================================================================
// 4. HISTORY TOGGLE FUNCTIONALITY
// =============================================================================

/**
 * Toggle the size of the command history display
 */
function toggleHistorySize() {
    const functionDisplay = document.querySelector('.function-display');
    const commandLine = document.querySelector('.command-line-container');
    const body = document.body;
    const toggleBtn = document.getElementById('historyToggleBtn');
    const collapseBtn = document.getElementById('historyCollapseBtn');
    const commandInput = document.getElementById('commandInput');
    
    // Toggle the expanded class on all elements
    functionDisplay.classList.toggle('expanded');
    commandLine.classList.toggle('expanded');
    body.classList.toggle('expanded');
    
    // Update button arrow direction and position
    if (functionDisplay.classList.contains('expanded')) {
        toggleBtn.innerHTML = '▲'; // Up arrow when expanded
        // Position buttons in expanded history (starting at 68px + 150px/2 - button heights)
        toggleBtn.style.top = '133px'; // Top button in expanded state
        collapseBtn.style.top = '150px'; // Bottom button in expanded state
    } else {
        toggleBtn.innerHTML = '▼'; // Down arrow when collapsed
        // Position buttons in collapsed history
        toggleBtn.style.top = '78px'; // Top button in collapsed state
        collapseBtn.style.top = '95px'; // Bottom button in collapsed state
    }
    
    // Restore focus to command input immediately after toggle
    commandInput.focus();
    
    // Maintain scroll position during transition
    setTimeout(() => {
        adjustScrollPosition();
    }, 300); // Wait for transition to complete
}

/**
 * Collapse the history display completely
 */
function collapseHistory() {
    const functionDisplay = document.querySelector('.function-display');
    const commandLine = document.querySelector('.command-line-container');
    const body = document.body;
    const toggleBtn = document.getElementById('historyToggleBtn');
    const collapseBtn = document.getElementById('historyCollapseBtn');
    const showHistoryBtn = document.getElementById('showHistoryBtn');
    
    // Remove any expanded classes first
    functionDisplay.classList.remove('expanded');
    commandLine.classList.remove('expanded');
    body.classList.remove('expanded');
    
    // Hide the history display using a CSS class (removes it from flow)
    functionDisplay.classList.add('collapsed');
    
    // In in-flow layout, no manual positioning or body padding is needed
    
    // Hide history control buttons since history is collapsed
    toggleBtn.style.display = 'none';
    collapseBtn.style.display = 'none';
    
    // Show the show-history button in command line
    showHistoryBtn.style.display = 'flex';
}

/**
 * Show the history display (restore to default state)
 */
function showHistory() {
    const functionDisplay = document.querySelector('.function-display');
    const commandLine = document.querySelector('.command-line-container');
    const body = document.body;
    const toggleBtn = document.getElementById('historyToggleBtn');
    const collapseBtn = document.getElementById('historyCollapseBtn');
    const showHistoryBtn = document.getElementById('showHistoryBtn');
    
    // Show the history display via CSS class toggle
    functionDisplay.classList.remove('collapsed');
    
    // Reset to default collapsed state
    functionDisplay.classList.remove('expanded');
    commandLine.classList.remove('expanded');
    body.classList.remove('expanded');
    
    // Reset command line position (remove any inline styles to use CSS defaults)
    commandLine.style.top = '';
    
    // Reset body padding (remove any inline styles to use CSS defaults)
    body.style.paddingTop = '';
    
    // Show and reset toggle button to collapsed state
    toggleBtn.style.display = 'flex';
    toggleBtn.innerHTML = '▼';
    toggleBtn.style.top = '78px'; // Top button in collapsed state
    
    // Show and reset collapse button position
    collapseBtn.style.display = 'flex';
    collapseBtn.style.top = '95px'; // Bottom button in collapsed state
    
    // Hide the show-history button since history is now visible
    showHistoryBtn.style.display = 'none';
    
    // Close window dropdown
    document.getElementById('windowDropdown').classList.remove('show');
}

/**
 * Toggle Window dropdown menu
 */
function toggleWindowDropdown() {
    const dropdown = document.getElementById('windowDropdown');
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeWindowDropdown(event) {
            if (!event.target.closest('.menu-item-with-dropdown')) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeWindowDropdown);
            }
        });
    }, 0);
}








// =============================================================================
// 5. ADD ACCOUNT FLOW FUNCTIONALITY
// =============================================================================


let addAccountStep = 0; // 0: normal, 1: email/password, 2: 2FA
let newAccountData = { email: '', password: '' };

/**
 * Start the add account flow
 */
function startAddAccountFlow() {
    addAccountStep = 1;
    showEmailPasswordForm();
}

/**
 * Show email and password input form
 */
function showEmailPasswordForm() {
    const dropdown = document.getElementById('accountDropdown');
    
    // Create email/password form
    const formHTML = `
        <div class="dropdown-item account-item">valleyvarun@gmail.com</div>
        <div class="dropdown-item account-item">vas2154@columbia.edu</div>
        <div class="dropdown-item account-item">2020barc020@spab.ac.in</div>
        <div class="dropdown-divider"></div>
        <div class="add-account-form">
            <div class="form-title">Add New Account</div>
            <input type="email" class="form-input" id="newEmail" placeholder="Email address" autocomplete="off">
            <input type="password" class="form-input" id="newPassword" placeholder="Password" autocomplete="off">
            <button class="form-next-btn" onclick="event.stopPropagation(); proceedTo2FA()">></button>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item action-item" onclick="cancelAddAccount()">Cancel</div>
        <div class="dropdown-item action-item">Log Out of Account</div>
    `;
    
    dropdown.innerHTML = formHTML;
    
    // Focus on email input
    setTimeout(() => {
        document.getElementById('newEmail').focus();
    }, 100);
}

/**
 * Proceed to 2FA step
 */
function proceedTo2FA() {
    const email = document.getElementById('newEmail').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    // Store the data
    newAccountData.email = email;
    newAccountData.password = password;
    
    addAccountStep = 2;
    show2FAForm();
}

/**
 * Show 2FA verification form
 */
function show2FAForm() {
    const dropdown = document.getElementById('accountDropdown');
    
    // Create 2FA form with 6 input boxes
    const formHTML = `
        <div class="dropdown-item account-item">valleyvarun@gmail.com</div>
        <div class="dropdown-item account-item">vas2154@columbia.edu</div>
        <div class="dropdown-item account-item">2020barc020@spab.ac.in</div>
        <div class="dropdown-divider"></div>
        <div class="add-account-form">
            <div class="form-email">${newAccountData.email}</div>
            <div class="form-message">A code has been sent to your email</div>
            <div class="code-inputs">
                <input type="text" class="code-input" maxlength="1" id="code1" autocomplete="off">
                <input type="text" class="code-input" maxlength="1" id="code2" autocomplete="off">
                <input type="text" class="code-input" maxlength="1" id="code3" autocomplete="off">
                <input type="text" class="code-input" maxlength="1" id="code4" autocomplete="off">
                <input type="text" class="code-input" maxlength="1" id="code5" autocomplete="off">
                <input type="text" class="code-input" maxlength="1" id="code6" autocomplete="off">
            </div>
            <button class="form-next-btn" onclick="event.stopPropagation(); completeAddAccount()">></button>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item action-item" onclick="cancelAddAccount()">Cancel</div>
        <div class="dropdown-item action-item">Log Out of Account</div>
    `;
    
    dropdown.innerHTML = formHTML;
    
    // Set up 2FA input behavior
    setup2FAInputs();
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('code1').focus();
    }, 100);
}

/**
 * Set up 2FA input behavior (auto-advance on typing)
 */
function setup2FAInputs() {
    const inputs = document.querySelectorAll('.code-input');
    
    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            // Move to next input if current is filled
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Move to previous input on backspace if current is empty
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

/**
 * Complete the add account process
 */
function completeAddAccount() {
    // Get all 2FA code values
    const codes = [];
    for (let i = 1; i <= 6; i++) {
        const code = document.getElementById(`code${i}`).value.trim();
        if (!code) {
            alert('Please enter the complete 6-digit code');
            return;
        }
        codes.push(code);
    }
    
    const fullCode = codes.join('');
    
    // Simulate verification (in real app, this would validate with server)
    if (fullCode.length === 6) {
        // Add the new email to the dropdown (but don't switch to it)
        addEmailToDropdown(newAccountData.email);
        
        // Reset state but keep dropdown open
        addAccountStep = 0;
        newAccountData = { email: '', password: '' };
        
        // Account added successfully (dropdown remains open showing the new email)
    } else {
        alert('Please enter a valid 6-digit code');
    }
}

// State for storing added emails
let addedEmails = [];

/**
 * Add new email to dropdown list
 */
function addEmailToDropdown(email) {
    // Store the original selected email before resetting
    const originalEmail = document.querySelector('.selected-email').textContent;
    
    // Add email to our persistent list
    if (!addedEmails.includes(email)) {
        addedEmails.push(email);
    }
    
    // Reset dropdown to normal state (which will now include the new email)
    resetDropdownToNormal();
    
    // Restore the original selected email (don't switch to new account)
    document.querySelector('.selected-email').textContent = originalEmail;
}

/**
 * Cancel add account flow
 */
function cancelAddAccount() {
    resetAddAccountFlow();
}

/**
 * Reset add account flow to normal state
 */
function resetAddAccountFlow() {
    addAccountStep = 0;
    newAccountData = { email: '', password: '' };
    resetDropdownToNormal();
    
    // Close dropdown
    document.getElementById('accountDropdown').classList.remove('show');
    document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
}

/**
 * Reset dropdown to normal state
 */
function resetDropdownToNormal() {
    const dropdown = document.getElementById('accountDropdown');
    
    // Build the HTML with original emails plus any added emails
    let emailItemsHTML = `
        <div class="dropdown-item account-item">valleyvarun@gmail.com</div>
        <div class="dropdown-item account-item">vas2154@columbia.edu</div>
        <div class="dropdown-item account-item">2020barc020@spab.ac.in</div>`;
    
    // Add any newly added emails at the bottom
    addedEmails.forEach(email => {
        emailItemsHTML += `<div class="dropdown-item account-item">${email}</div>`;
    });
    
    const normalHTML = emailItemsHTML + `
        <div class="dropdown-divider"></div>
        <div class="dropdown-item action-item">Add Account</div>
        <div class="dropdown-item action-item">Log Out of Account</div>
    `;
    
    dropdown.innerHTML = normalHTML;
    
    // Re-attach event listeners for all account items (including new ones)
    document.querySelectorAll('.account-item').forEach(item => {
        item.addEventListener('click', function() {
            const selectedEmail = document.querySelector('.selected-email');
            selectedEmail.textContent = this.textContent;
            
            document.getElementById('accountDropdown').classList.remove('show');
            document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
        });
    });
    
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function(event) {
            if (this.textContent === 'Add Account') {
                // Prevent event bubbling to avoid dropdown closing
                event.stopPropagation();
                // Start the add account flow (keep dropdown open)
                startAddAccountFlow();
            } else if (this.textContent === 'Log Out of Account') {
                alert('Logout functionality would go here');
                // Close dropdown after logout action
                document.getElementById('accountDropdown').classList.remove('show');
                document.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
            }
        });
    });
}








// =============================================================================
// 6. CHATBOT INPUT FOCUS HELPER
// =============================================================================

function focusAgentChatInput() {
    const iframe = document.getElementById('agentFrame');
    if (!iframe) return false;
    try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const input = doc.getElementById('chatInput');
        if (input) {
            input.focus();
            return true;
        }
    } catch (e) {
        console.log('Unable to focus agent chat input:', e);
    }
    return false;
}

function blurAgentChatInput() {
    const iframe = document.getElementById('agentFrame');
    if (!iframe) return false;
    try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const input = doc.getElementById('chatInput');
        if (input && doc.activeElement === input) {
            input.blur();
            return true;
        }
    } catch (e) {
        console.log('Unable to blur agent chat input:', e);
    }
    return false;
}









// =============================================================================
// 7. APPS LOADING MODAL FUNCTIONALITY
// =============================================================================

let appsCurrentSelectedApp = null;
let appsLoadingTimerId = null; // ensures modal auto-hides after 5s regardless of clicks

function showAppsLoadingModal(appData) {
    appsCurrentSelectedApp = appData;
    
    const overlay = document.getElementById('appsLoadingOverlay');
    const appIcon = document.getElementById('appsModalAppIcon');
    const appName = document.getElementById('appsModalAppName');
    const openButton = document.getElementById('appsModalOpenButton');
    const cancelButton = document.getElementById('appsModalCancelButton');
    
    if (!overlay || !appIcon || !appName || !openButton || !cancelButton) {
        console.error('Apps modal elements not found');
        return;
    }
    
    // Update modal content
    appName.textContent = appData.name;
    
    // Handle icon display (image vs text/emoji)
    if (appData.icon && appData.icon.includes('logo/')) {
        appIcon.innerHTML = `<img src="${appData.icon}" alt="${appData.name}" style="width: 20px; height: 20px; object-fit: contain;">`;
    } else {
        appIcon.textContent = appData.icon || appData.name.charAt(0).toUpperCase();
    }
    
    // Reset loading state
    resetAppsLoadingState();
    
    // Show modal
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    
    // Add event listeners (remove existing ones first)
    openButton.removeEventListener('click', handleAppsModalOpen);
    cancelButton.removeEventListener('click', handleAppsModalCancel);
    openButton.addEventListener('click', handleAppsModalOpen);
    cancelButton.addEventListener('click', handleAppsModalCancel);
    
    // Focus on Open button
    setTimeout(() => {
        openButton.focus();
    }, 100);

    // Start or restart the auto-hide timer (max lifetime 5s)
    try { if (appsLoadingTimerId) { clearTimeout(appsLoadingTimerId); } } catch(_) {}
    appsLoadingTimerId = setTimeout(() => {
        hideAppsLoadingModal();
    }, 5000);

    // Handle keyboard shortcuts
    document.addEventListener('keydown', handleAppsModalKeyboard);
}

function handleAppsModalOpen() {
    if (!appsCurrentSelectedApp) return;
    
    // Close the main apps popup first
    try {
        const modalOverlay = document.getElementById('contentModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
            modalOverlay.setAttribute('aria-hidden', 'true');
        }
    } catch (e) {
        console.log('Error closing popup:', e);
    }
    
    // Enter loading state
    enterAppsLoadingState();

    // Create a new tab for this app
    createAppTab(appsCurrentSelectedApp);

    // Do NOT start a new timer here; respect the original 5s lifetime started on show
}

/**
 * Initialize tab functionality for existing tabs
 */
function initializeTabs() {
    // Get all existing tabs (including Home tab)
    const allTabs = document.querySelectorAll('.content-tabs-list .content-tab, .content-tab.home-tab');

    // Add click event listeners to all tabs
    allTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            setActiveTab(this);
        });
    });

    // Set up nav buttons
    const header = document.querySelector('.content-tabs-header');
    const scrollWrap = document.querySelector('.content-tabs-scroll');
    const tabsList = document.querySelector('.content-tabs-list');
    const leftBtn = document.querySelector('.tabs-nav-left');
    const rightBtn = document.querySelector('.tabs-nav-right');

    const updateArrowState = () => {
        if (!scrollWrap || !tabsList || !leftBtn || !rightBtn) return;
        const maxScroll = Math.max(0, tabsList.scrollWidth - scrollWrap.clientWidth);
        if (maxScroll <= 0) {
            // No overflow: hide both
            leftBtn.style.display = 'none';
            rightBtn.style.display = 'none';
            return;
        }
        // At start: hide left, else show
        if (scrollWrap.scrollLeft <= 0) {
            leftBtn.style.display = 'none';
        } else {
            leftBtn.style.display = 'inline-flex';
        }
        // At end: hide right, else show
        if (scrollWrap.scrollLeft >= maxScroll - 1) {
            rightBtn.style.display = 'none';
        } else {
            rightBtn.style.display = 'inline-flex';
        }
    };

    if (leftBtn && rightBtn && tabsList && scrollWrap) {
        leftBtn.addEventListener('click', () => {
            const delta = Math.max(80, Math.floor(scrollWrap.clientWidth * 0.8));
            scrollWrap.scrollBy({ left: -delta, behavior: 'smooth' });
            setTimeout(updateArrowState, 200);
        });
        rightBtn.addEventListener('click', () => {
            const delta = Math.max(80, Math.floor(scrollWrap.clientWidth * 0.8));
            scrollWrap.scrollBy({ left: delta, behavior: 'smooth' });
            setTimeout(updateArrowState, 200);
        });
        scrollWrap.addEventListener('scroll', updateArrowState, { passive: true });
    }

    // Initial layout check
    updateTabsLayout();

    // Recompute on window resize
    window.addEventListener('resize', updateTabsLayout);
}

/**
 * Create a new tab for an opened app
 */
function createAppTab(appData) {
    if (!appData) return;
    
    // Get the tabs list container
    const tabsList = document.querySelector('.content-tabs-list');
    if (!tabsList) return;
    
    // Count existing tabs for this app to determine instance number
    const existingTabs = tabsList.querySelectorAll(`[data-app-name="${appData.name}"]`);
    const instanceCount = existingTabs.length;
    
    // Determine the display name for the new tab (apply short aliases)
    const shortNameMap = {
        'visual studio code': 'VS Code'
    };
    const baseName = shortNameMap[appData.name?.toLowerCase?.()] || appData.name;
    let instanceSuffix = '';
    if (instanceCount > 0) {
        // If there are existing tabs for this app, add instance number
        instanceSuffix = ` #${instanceCount + 1}`;
    }
    const displayName = `${baseName}${instanceSuffix}`;
    
    // Deactivate all current tabs
    const allTabs = tabsList.querySelectorAll('.content-tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Create new tab element
    const newTab = document.createElement('div');
    newTab.className = 'content-tab active';
    newTab.setAttribute('data-app-name', appData.name);
    newTab.setAttribute('data-app-icon', appData.icon);
    newTab.setAttribute('data-instance-number', instanceCount + 1);
    
    // Create tab icon container
    const tabIcon = document.createElement('div');
    tabIcon.className = 'tab-icon';
    
    // Set the icon content based on app data
    const iconContent = getTabIcon(appData.name, appData.icon);
    console.log('Creating tab for:', appData.name, 'with icon:', iconContent); // Debug log

    // Decide if this is an image path/URL
    const isImageUrl = (val) => {
        if (!val || typeof val !== 'string') return false;
        const v = val.trim();
        return (
            v.startsWith('http://') ||
            v.startsWith('https://') ||
            v.startsWith('data:image') ||
            v.startsWith('logo/') ||
            v.startsWith('../logo/') ||
            /\.(png|jpe?g|gif|svg)$/i.test(v)
        );
    };

    if (isImageUrl(iconContent)) {
        // Create image element for logo files or absolute URLs
        const iconImg = document.createElement('img');
        let src = iconContent;
        // Normalize relative paths: index.html lives at project root
        if (src.startsWith('../logo/')) src = src.replace('../', '');
        iconImg.src = src;
        iconImg.alt = appData.name + ' logo';
        iconImg.title = appData.name;
        iconImg.style.width = '100%';
        iconImg.style.height = '100%';
        iconImg.style.objectFit = 'contain';
        console.log('Loading image from:', iconImg.src); // Debug log

        // Add error handling
        iconImg.onerror = function() {
            console.error('Failed to load image:', iconImg.src);
            // Fallback to text icon
            tabIcon.innerHTML = '';
            tabIcon.textContent = appData.name.charAt(0).toUpperCase();
            tabIcon.style.fontSize = '11px';
            tabIcon.style.fontWeight = 'bold';
        };

        iconImg.onload = function() {
            console.log('Successfully loaded image:', iconImg.src);
        };

        tabIcon.appendChild(iconImg);
    } else {
        // Use text/emoji icon
        tabIcon.textContent = iconContent;
        tabIcon.style.fontSize = '11px';
        console.log('Using text/emoji icon:', iconContent); // Debug log
    }
    
    // Create tab text container
    const tabText = document.createElement('div');
    tabText.className = 'tab-text';
    tabText.textContent = displayName;
    
    
    // Add click handler for tab switching
    newTab.addEventListener('click', function() {
        setActiveTab(this);
    });
    
    // Add close button to tab
    const closeButton = document.createElement('span');
    closeButton.className = 'tab-close-btn';
    closeButton.innerHTML = '×';
    closeButton.title = 'Close tab';
    closeButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent tab activation
        closeAppTab(newTab);
    });
    
    // Assemble tab elements
    newTab.appendChild(tabIcon);
    newTab.appendChild(tabText);
    newTab.appendChild(closeButton);
    
    // Insert the new tab after the Home tab
    const homeTab = tabsList.querySelector('.content-tab.home-tab');
    if (homeTab && homeTab.nextSibling) {
        tabsList.insertBefore(newTab, homeTab.nextSibling);
    } else {
        tabsList.appendChild(newTab);
    }
    
    // Recompute layout and arrows
    updateTabsLayout();
    
    // Load software.html since this is an app tab and it's now active
    const contentFrame = document.getElementById('contentFrame');
    if (contentFrame) {
        contentFrame.src = 'software/software.html';
    }
}

/**
 * Get the appropriate icon for a tab based on app name and icon data
 */
function getTabIcon(appName, appIcon) {
    console.log('getTabIcon called with:', { appName, appIcon }); // Debug log

    // If apps iframe provided an absolute URL (e.g., http://.../logo/xxx.png) or data URI, use it directly
    if (appIcon && typeof appIcon === 'string') {
        const v = appIcon.trim();
        if (
            v.startsWith('http://') ||
            v.startsWith('https://') ||
            v.startsWith('data:image') ||
            v.includes('/logo/') ||
            /\.(png|jpe?g|gif|svg)$/i.test(v)
        ) {
            console.log('Using provided icon URL:', v); // Debug log
            return v;
        }
        // If appIcon is already a relative logo path, use it
        if (v.startsWith('logo/') || v.startsWith('../logo/')) {
            console.log('Using provided logo path:', v); // Debug log
            return v;
        }
    }
    
    // Map specific app names to logo images
    const logoMap = {
        'AutoCAD': 'logo/autocad-logo.png',
        'Revit': 'logo/revit-logo.png',
        'SketchUp': 'logo/sketchup-logo.png',
        '3ds Max': 'logo/3dsmax-logo.png',
        'Photoshop': 'logo/photoshop-logo.png',
        'Rhino 8': 'logo/rhino8-logo.png',
        'Blender': 'logo/blender-logo.png',
        'D5 Render': 'logo/D5Render-logo.png',
        'Midjourney': 'logo/midjourney-logo.png',
        'ChatGPT': 'logo/chatgpt-logo.png',
        'InDesign': 'logo/indesign-logo.png',
        'Visual Studio Code': 'logo/vscode-logo.png',
        'VS Code': 'logo/vscode-logo.png'
    };
    
    // Check if we have a specific logo for this app
    if (logoMap[appName]) {
        console.log('Found logo mapping for', appName, ':', logoMap[appName]); // Debug log
        return logoMap[appName];
    }
    
    // If appIcon is provided and is not a path, use it as emoji/text
    if (appIcon && !appIcon.includes('/')) {
        return appIcon;
    }
    
    // Default emoji icons based on app name patterns
    const emojiMap = {
        'photoshop': '🎨',
        'illustrator': '🖌️',
        'after effects': '🎞️',
        'premiere': '🎬',
        'maya': '🎭',
        'unity': '🎮',
        'unreal': '🎮',
        'word': '📝',
        'excel': '📊',
        'powerpoint': '📽️',
        'autocad': '📐',
        'revit': '🏗️',
        'sketchup': '🏠',
        'blender': '🔮',
        'spotify': '🎵',
        'netflix': '📺',
        'steam': '🎮',
        'discord': '📻'
    };
    
    // Try to find emoji based on app name
    const lowerAppName = appName.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (lowerAppName.includes(key)) {
            return emoji;
        }
    }
    
    // Fall back to first letter of app name
    return appName.charAt(0).toUpperCase();
}

/**
 * Check if tabs are overflowing and enable compact mode if needed
 */
function updateTabsLayout() {
    const header = document.querySelector('.content-tabs-header');
    const scrollWrap = document.querySelector('.content-tabs-scroll');
    const tabsList = document.querySelector('.content-tabs-list');
    const leftBtn = document.querySelector('.tabs-nav-left');
    const rightBtn = document.querySelector('.tabs-nav-right');
    if (!header || !scrollWrap || !tabsList || !leftBtn || !rightBtn) return;

    // Measure natural content width by temporarily disabling shrink
    const prevListWidth = tabsList.style.width;
    const prevTabFlex = [];
    const tabs = Array.from(tabsList.querySelectorAll('.content-tab'));
    tabs.forEach((t, i) => {
        prevTabFlex[i] = t.style.flex;
        t.style.flex = '0 0 auto';
    });
    tabsList.style.width = 'auto';
    const naturalWidth = tabsList.scrollWidth; // intrinsic total width
    const visibleWidth = scrollWrap.clientWidth;
    // Restore shrink settings for normal mode
    tabsList.style.width = prevListWidth || '';
    tabs.forEach((t, i) => { t.style.flex = prevTabFlex[i] || ''; });

    // Determine modes
    const enableScrollMode = naturalWidth > visibleWidth; // show arrows as soon as content exceeds bar

    if (enableScrollMode) {
        // In scroll mode, tabs do not shrink; list is natural width
        header.classList.add('tabs-scroll-mode');
        // Make them visible first; update will hide as needed
        leftBtn.style.display = 'inline-flex';
        rightBtn.style.display = 'inline-flex';
        // Update arrow visibility state
        const updateArrowState = () => {
            const maxScroll = Math.max(0, tabsList.scrollWidth - scrollWrap.clientWidth);
            if (maxScroll <= 0) {
                leftBtn.style.display = 'none';
                rightBtn.style.display = 'none';
                return;
            }
            if (scrollWrap.scrollLeft <= 0) {
                leftBtn.style.display = 'none';
            } else {
                leftBtn.style.display = 'inline-flex';
            }
            if (scrollWrap.scrollLeft >= maxScroll - 1) {
                rightBtn.style.display = 'none';
            } else {
                rightBtn.style.display = 'inline-flex';
            }
        };
        // Slight delay to let layout settle, then update
        setTimeout(updateArrowState, 0);
    } else {
        // Non-scroll mode: tabs shrink to fit; hide arrows
        header.classList.remove('tabs-scroll-mode');
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
        // Ensure list uses width: 100% to enforce shrinking
        tabsList.style.width = '100%';
    }
}

/**
 * Set the active tab
 */
function setActiveTab(tabElement) {
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.content-tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    tabElement.classList.add('active');
    
    // Get the content iframe
    const contentFrame = document.getElementById('contentFrame');
    if (!contentFrame) return;
    
    // Switch content based on tab type
    const tabText = tabElement.textContent.trim();
    const isHomeTab = tabText === 'Home';
    
    if (isHomeTab) {
        // Load home.html for Home tab
        contentFrame.src = 'pages/home.html';
    } else {
        // Load software.html for app tabs
        contentFrame.src = 'software/software.html';
    }
}

/**
 * Close an app tab
 */
function closeAppTab(tabElement) {
    const isActive = tabElement.classList.contains('active');
    
    // Remove the tab
    tabElement.remove();
    // Recompute layout after removing tab
    updateTabsLayout();
    
    // If this was the active tab, activate the Home tab
    if (isActive) {
        const homeTab = document.querySelector('.content-tab'); // First tab is Home
        if (homeTab) {
            setActiveTab(homeTab);
        }
    }
}

function handleAppsModalCancel() {
    hideAppsLoadingModal();
}

function hideAppsLoadingModal() {
    const overlay = document.getElementById('appsLoadingOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
    }
    // Clear auto-hide timer if any
    if (appsLoadingTimerId) {
        try { clearTimeout(appsLoadingTimerId); } catch(_) {}
        appsLoadingTimerId = null;
    }

    // Remove keyboard listener
    document.removeEventListener('keydown', handleAppsModalKeyboard);
    
    // Reset state
    appsCurrentSelectedApp = null;
    
    // Focus back to command input
    const commandInput = document.getElementById('commandInput');
    if (commandInput) {
        setTimeout(() => { commandInput.focus(); }, 10);
    }
}

function enterAppsLoadingState() {
    const buttonsContainer = document.querySelector('.apps-modal-buttons');
    const footer = document.querySelector('.apps-modal-footer');
    
    if (buttonsContainer && footer) {
        // Hide buttons
        buttonsContainer.style.display = 'none';
        
        // Add loading text
        const loadingText = document.createElement('div');
        loadingText.className = 'apps-modal-loading-text';
        loadingText.textContent = 'Loading...';
        loadingText.id = 'appsModalLoadingText';
        footer.appendChild(loadingText);
    }
}

function resetAppsLoadingState() {
    const buttonsContainer = document.querySelector('.apps-modal-buttons');
    const loadingText = document.getElementById('appsModalLoadingText');
    
    if (buttonsContainer) {
        buttonsContainer.style.display = 'flex';
    }
    
    if (loadingText) {
        loadingText.remove();
    }
}

function handleAppsModalKeyboard(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleAppsModalOpen();
    } else if (event.key === 'Escape') {
        event.preventDefault();
        handleAppsModalCancel();
    }
}

/**
 * Resolve a user-entered name to a favorite app with icon
 * @param {string} rawName
 * @returns {{name:string, icon:string}|null}
 */
function resolveFavoriteApp(rawName) {
    if (!rawName) return null;
    const n = rawName.trim().toLowerCase();

    // Canonical names set from favorites section
    const canonical = {
        'autocad': { name: 'AutoCAD', icon: 'logo/autocad-logo.png' },
        'rhino 8': { name: 'Rhino 8', icon: 'logo/rhino8-logo.png' },
        'rhino8': { name: 'Rhino 8', icon: 'logo/rhino8-logo.png' },
        'sketchup': { name: 'SketchUp', icon: 'logo/sketchup-logo.png' },
        'revit': { name: 'Revit', icon: 'logo/revit-logo.png' },
        'd5 render': { name: 'D5 Render', icon: 'logo/D5Render-logo.png' },
        'd5render': { name: 'D5 Render', icon: 'logo/D5Render-logo.png' },
        'photoshop': { name: 'Photoshop', icon: 'logo/photoshop-logo.png' },
        'indesign': { name: 'InDesign', icon: 'logo/indesign-logo.png' },
        'chatgpt': { name: 'ChatGPT', icon: 'logo/chatgpt-logo.png' },
        'midjourney': { name: 'Midjourney', icon: 'logo/midjourney-logo.png' },
        'blender': { name: 'Blender', icon: 'logo/blender-logo.png' },
        'visual studio code': { name: 'Visual Studio Code', icon: 'logo/vscode-logo.png' },
        'vs code': { name: 'Visual Studio Code', icon: 'logo/vscode-logo.png' },
        'vscode': { name: 'Visual Studio Code', icon: 'logo/vscode-logo.png' }
    };

    if (canonical[n]) return canonical[n];

    // Fuzzy: try to match by stripping spaces and punctuation
    const deSlug = (s) => s.replace(/[^a-z0-9]/g, '');
    const key = deSlug(n);
    const keys = Object.keys(canonical);
    for (const k of keys) {
        if (deSlug(k) === key) return canonical[k];
    }
    return null;
}