let blogData = null;
let currentCategory = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch('posts.json?t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) throw new Error("Manifest not found");
            return response.json();
        })
        .then(data => {
            blogData = data;
            // Render categories and let the render function handle auto-selection via click()
            renderCategories(data);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('content').innerHTML = `<h1>Welcome to Tech Blog</h1><p>Select a category from the sidebar to get started.</p>`;
        });
});

function renderCategories(data) {
    const sidebar = document.getElementById('sidebar-options');
    sidebar.innerHTML = '';

    // Group categories by top-level folder
    const groups = {};
    Object.keys(data).forEach(key => {
        if (data[key].length === 0) return;
        
        const parts = key.split('/');
        const topLevel = parts[0];
        const subCategory = parts.length > 1 ? parts[1] : null;

        if (!groups[topLevel]) {
            groups[topLevel] = [];
        }
        
        if (subCategory) {
            groups[topLevel].push({ name: subCategory, fullPath: key });
        } else {
            // It's a top-level category with files (e.g. Settings)
            groups[topLevel].push({ name: topLevel, fullPath: key });
        }
    });

    // Sort top-level groups: Posting first, Settings last, others alphabetical
    const sortedGroups = Object.keys(groups).sort((a, b) => {
        if (a === 'Posting') return -1;
        if (b === 'Posting') return 1;
        if (a === 'Settings') return 1;
        if (b === 'Settings') return -1;
        return a.localeCompare(b);
    });

    for (const groupName of sortedGroups) {
        // Create container for group
        const groupDiv = document.createElement('div');
        groupDiv.className = 'nav-group';
        
        // Group Header (if it's Posting, or just display as item if it's single like Settings?)
        // User wants Posting -> AI, Blog, Unity. So Posting is a Header.
        // Settings is likely just a link.
        
        // Check if this group has subcategories or just itself
        const items = groups[groupName];
        
        // Heuristic: If "Posting", treat as header. If "Settings", treat as direct link (unless it has subs).
        // Actually, let's treat everything with subcategories as a Group, and direct items as links.
        
        // If the group name matches the item name (like Settings -> Settings), it's a flat category.
        const isFlat = items.length === 1 && items[0].name === groupName;

        if (isFlat) {
            const cat = items[0];
            const btn = createCategoryBtn(cat.name, cat.fullPath);
            sidebar.appendChild(btn);
        } else {
            // It's a group (like Posting)
            const header = document.createElement('div');
            header.className = 'nav-group-header';
            header.innerText = groupName;
            sidebar.appendChild(header);

            const container = document.createElement('div');
            container.className = 'nav-group-items';
            
            // Sort items: Blog, etc.
            items.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                const btn = createCategoryBtn(item.name, item.fullPath);
                btn.classList.add('sub-item');
                container.appendChild(btn);
            });
            sidebar.appendChild(container);
        }
    }
    
    // Auto-select first available
    const firstBtn = sidebar.querySelector('.category-btn');
    if (firstBtn) firstBtn.click();
}

function createCategoryBtn(name, key) {
    const btn = document.createElement('div');
    btn.className = 'category-btn';
    btn.innerText = name;
    btn.onclick = () => {
        showCategoryPosts(key);
        document.querySelectorAll('.category-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
    };
    return btn;
}

function showCategoryPosts(category) {
    currentCategory = category;
    const posts = blogData[category];
    const contentArea = document.getElementById('content');

    let html = `<h1>${category}</h1><div class="post-list">`;

    posts.forEach(post => {
        html += `
            <div class="post-item" onclick="loadPost('${post.path}')">
                <h3>${post.title}</h3>
                ${post.date ? `<span class="post-date">${post.date}</span>` : ''}
            </div>
        `;
    });

    html += '</div>';
    contentArea.innerHTML = html;
}

function loadPost(path) {
    fetch(path + '?t=' + new Date().getTime())
        .then(res => res.text())
        .then(text => {
            // Remove frontmatter
            const content = text.replace(/^---[\s\S]*?---\n/, '');
            const html = marked.parse(content);
            document.getElementById('content').innerHTML = DOMPurify.sanitize(html);
        })
        .catch(err => {
            document.getElementById('content').innerHTML = `<p>Error loading post: ${err.message}</p>`;
        });
}
