// =============================================================================
// OMNIVERSE DEMO APPLICATION JAVASCRIPT
// =============================================================================
// This file contains all the interactive functionality for the Omniverse demo

// -----------------------------------------------------------------------------
// USER ACCOUNT DROPDOWN FUNCTIONALITY
// -----------------------------------------------------------------------------

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
    
    // -----------------------------------------------------------------------------
    // COMMAND LINE FUNCTIONALITY
    // -----------------------------------------------------------------------------
    
    // Initialize command line functionality
    initializeCommandLine();
});

// -----------------------------------------------------------------------------
// COMMAND LINE FUNCTIONALITY
// -----------------------------------------------------------------------------

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
    
    // Global keydown listener to handle all keyboard interactions
    document.addEventListener('keydown', function(event) {
        // Don't interfere with typing in dropdowns or other inputs
        if (event.target.tagName === 'INPUT' && event.target !== commandInput) {
            return;
        }
        
        // Handle different states
        if (currentState === 'INPUT') {
            handleInputState(event, commandInput);
        } else if (currentState === 'CONFIRMATION') {
            handleConfirmationState(event);
        }
    });
}

/**
 * Handle keyboard input in INPUT state
 */
function handleInputState(event, commandInput) {
    // Regular typing - focus command input
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
        if (document.activeElement !== commandInput) {
            commandInput.focus();
            // For regular typing, prevent the default and manually add the character
            if (event.key.length === 1) {
                event.preventDefault();
                commandInput.value += event.key;
            }
        }
    }
    
    // Handle Enter key to execute command
    if (event.key === 'Enter' && document.activeElement === commandInput) {
        const command = commandInput.value.trim();
        if (command) {
            executeCommand(command);
            commandInput.value = '';
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
    } else {
        // Regular command handling
        pendingFunction = generateDummyFunction(command);
        
        // Create new command entry with command bubble and store reference
        currentCommandEntry = createCommandEntry(command, [
            `Would you like to perform ${command}?`,
            'Yes: <enter>    No: <esc>'
        ]);
    }
    
    currentState = 'CONFIRMATION';
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
    } else {
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

// -----------------------------------------------------------------------------
// HISTORY TOGGLE FUNCTIONALITY
// -----------------------------------------------------------------------------

/**
 * Toggle the size of the command history display
 */
function toggleHistorySize() {
    const functionDisplay = document.querySelector('.function-display');
    const commandLine = document.querySelector('.command-line-container');
    const body = document.body;
    const toggleBtn = document.getElementById('historyToggleBtn');
    const commandInput = document.getElementById('commandInput');
    
    // Toggle the expanded class on all elements
    functionDisplay.classList.toggle('expanded');
    commandLine.classList.toggle('expanded');
    body.classList.toggle('expanded');
    
    // Update button arrow direction and position
    if (functionDisplay.classList.contains('expanded')) {
        toggleBtn.innerHTML = '▲'; // Up arrow when expanded
        // Center in expanded history: 68px + 100px = 168px
        toggleBtn.style.top = '168px';
    } else {
        toggleBtn.innerHTML = '▼'; // Down arrow when collapsed
        // Center in collapsed history: 68px + 25px = 93px
        toggleBtn.style.top = '93px';
    }
    
    // Restore focus to command input immediately after toggle
    commandInput.focus();
    
    // Maintain scroll position during transition
    setTimeout(() => {
        adjustScrollPosition();
    }, 300); // Wait for transition to complete
}

// -----------------------------------------------------------------------------
// ADD ACCOUNT FLOW FUNCTIONALITY
// -----------------------------------------------------------------------------

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