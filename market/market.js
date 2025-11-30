function switchTab(tabIndex) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    // Add active class to clicked tab
    document.querySelectorAll('.tab')[tabIndex - 1].classList.add('active');
    
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    // Show selected tab pane
    document.getElementById(`tab-${tabIndex}-content`).classList.add('active');

    // Update search input based on tab
    const searchInput = document.querySelector('.market-search');
    if (tabIndex === 1) {
        searchInput.value = 'https://developer.nvidia.com/omniverse/legacy-tools';
        switchMarketTab('applications');
    } else if (tabIndex === 2) {
        searchInput.value = 'https://docs.nvidia.com/omniverse/index.html';
        switchMarketTab('sdks');
    } else {
        searchInput.value = '';
    }
}

function switchMarketTab(tabName) {
    // Update active tab styling
    document.querySelectorAll('.market-tab').forEach(tab => {
        if (tab.textContent.toLowerCase() === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Hide all views
    document.querySelectorAll('.market-view').forEach(view => {
        view.style.display = 'none';
    });

    // Show selected view
    const viewId = tabName + '-view';
    const view = document.getElementById(viewId);
    if (view) {
        view.style.display = 'block';
    }
}
