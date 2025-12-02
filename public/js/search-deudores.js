// Funcionalidad de búsqueda para deudores
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que la tabla se cargue
    setTimeout(() => {
        const tableContainer = document.querySelector('.user-table-container');
        if (tableContainer && !document.getElementById('search-deudores')) {
            const searchContainer = document.createElement('div');
            searchContainer.style.cssText = 'margin: 12px 0 16px 0;';
            
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id = 'search-deudores';
            searchInput.placeholder = 'Buscar por nombre...';
            searchInput.style.cssText = 'width: 100%; max-width: 50%; padding: 10px 15px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: all 0.2s ease;';
            
            searchInput.addEventListener('focus', function() {
                this.style.borderColor = '#2196f3';
                this.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)';
            });
            
            searchInput.addEventListener('blur', function() {
                this.style.borderColor = '#e0e0e0';
                this.style.boxShadow = 'none';
            });
            
            // Wrap input in a container for positioning the clear button
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.width = '100%';
            wrapper.style.maxWidth = '50%';
            
            searchInput.style.maxWidth = '100%'; // Reset max-width as wrapper handles it
            
            // Create Clear Button
            const clearBtn = document.createElement('span');
            clearBtn.innerHTML = '&times;';
            clearBtn.style.position = 'absolute';
            clearBtn.style.right = '10px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.style.fontSize = '18px';
            clearBtn.style.color = '#999';
            clearBtn.style.display = 'none'; // Initially hidden
            clearBtn.style.userSelect = 'none';

            // Toggle clear button visibility
            function toggleClearBtn() {
                clearBtn.style.display = searchInput.value.trim() !== '' ? 'block' : 'none';
            }

            // Clear action
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                toggleClearBtn();
                searchInput.focus();
                // Trigger input event to refresh list
                searchInput.dispatchEvent(new Event('input'));
            });

            searchInput.addEventListener('input', (e) => {
                toggleClearBtn();
                const query = e.target.value.toLowerCase().trim();
                const rows = document.querySelectorAll('#deudores-table-body tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            });
            
            wrapper.appendChild(searchInput);
            wrapper.appendChild(clearBtn);
            searchContainer.appendChild(wrapper);
            tableContainer.parentElement.insertBefore(searchContainer, tableContainer);
        }
    }, 500);
});
