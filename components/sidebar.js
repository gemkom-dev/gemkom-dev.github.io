class Sidebar {
    constructor(container) {
        this.container = container;
        this.sidebar = document.createElement('div');
        this.sidebar.className = 'sidebar';
        this.list = document.createElement('ul');
        this.sidebar.appendChild(this.list);
        this.container.appendChild(this.sidebar);
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
            itemLabel.addEventListener('click', () => {
                const isCollapsed = subList.style.display === 'none';
                subList.style.display = isCollapsed ? 'block' : 'none';
                itemLabel.classList.toggle('collapsed', !isCollapsed);
            });
        }

        this.list.appendChild(item);
        return item;
    }
}

export default Sidebar; 