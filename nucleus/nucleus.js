document.addEventListener('DOMContentLoaded', () => {
    const headers = document.querySelectorAll('.nucleus-section-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const arrow = header.querySelector('.nucleus-section-arrow');
            const isCollapsed = header.classList.toggle('collapsed');
            
            // Rotate arrow
            if (arrow) {
                arrow.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
            }

            // Find content to toggle
            let content = header.nextElementSibling;
            
            while (content) {
                // Stop if we hit another section header or end of parent
                if (content.classList.contains('nucleus-section-header')) break;
                
                // Toggle visibility for relevant containers
                if (content.classList.contains('nucleus-drives-container') || 
                    content.classList.contains('nucleus-list-header') || 
                    content.classList.contains('nucleus-file-list')) {
                    
                    // If we are collapsing, set display to none.
                    // If we are expanding, remove the inline style to revert to CSS default (flex, grid, block etc)
                    content.style.display = isCollapsed ? 'none' : '';
                }
                
                content = content.nextElementSibling;
            }
        });
    });
});
