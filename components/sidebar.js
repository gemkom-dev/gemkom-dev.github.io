class Sidebar {
    constructor(container) {
        this.container = container;
        this.sidebar = document.createElement('div');
        this.sidebar.className = 'sidebar';
        this.toggleButton = document.createElement('div');
        this.toggleButton.className = 'sidebar-toggle';
        this.toggleButton.innerHTML = '&#9776;';
        this.sidebar.appendChild(this.toggleButton);
        this.list = document.createElement('ul');
        this.sidebar.appendChild(this.list);
        this.container.appendChild(this.sidebar);
        this.toggleButton.addEventListener('click', () => {
            this.sidebar.classList.toggle('collapsed');
            this.container.classList.toggle('closed', this.sidebar.classList.contains('collapsed'));
        });
    }

    addItem(label, options = {}) {
        const item = document.createElement('li');
        item.className = 'sidebar-item';
        const itemLabel = document.createElement('span');
        itemLabel.textContent = label;
        itemLabel.className = 'sidebar-label';
        item.appendChild(itemLabel);

        if (options.subItems && Array.isArray(options.subItems)) {
            const subList = document.createElement('ul');
            subList.className = 'sidebar-sublist';
            subList.style.display = 'none';
            options.subItems.forEach(sub => {
                const subItem = document.createElement('li');
                subItem.className = 'sidebar-subitem';
                subItem.textContent = sub;
                subList.appendChild(subItem);
            });
            item.appendChild(subList);
            itemLabel.classList.add('collapsible');
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('sidebar-subitem')) return;
                const isCollapsed = subList.style.display === 'none';
                subList.style.display = isCollapsed ? 'block' : 'none';
                itemLabel.classList.toggle('collapsed', isCollapsed);
            });
        }

        this.list.appendChild(item);
        return item;
    }
}

export default Sidebar; 