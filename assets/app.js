let blogData = null;
let currentCategory = null;

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');

    // Check for saved user preference, if any, on load of the website
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });

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
        const items = groups[groupName];

        // Check if it should be a flat top-level button or a group header
        // It is flat if: 
        // 1. It has exactly one item
        // 2. That item's name matches the group name (e.g. Settings -> Settings)
        // 3. OR the User specifically wants "Settings" to be flat even if logic differs?
        // Let's rely on the name matching.

        const isFlat = items.length === 1 && items[0].name === groupName;

        if (isFlat) {
            // Render as a single top-level button
            const cat = items[0];
            const btn = createCategoryBtn(cat.name, cat.fullPath);
            btn.classList.add('top-level-btn');
            // Ensure unique ID or data attribute to prevent duplicates if any
            sidebar.appendChild(btn);
        } else {
            // Render as a Group Header + Items
            const header = document.createElement('div');
            header.className = 'nav-group-header';
            header.innerText = groupName;
            sidebar.appendChild(header);

            const container = document.createElement('div');
            container.className = 'nav-group-items';

            // Sort items: Blog, etc.
            items.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                // If the item name is same as group name, it's the "root" category of this group.
                // We should display it, but maybe style it differently?
                // For Posting, items are [Blog]. 'Blog' != 'Posting'.
                // So Blog is rendered.

                const btn = createCategoryBtn(item.name, item.fullPath);
                btn.classList.add('sub-item');
                container.appendChild(btn);
            });
            sidebar.appendChild(container);
        }
    }

    // Auto-select first available button (BFS)
    const firstBtn = sidebar.querySelector('.category-btn');
    if (firstBtn) firstBtn.click();
}

function createCategoryBtn(name, key) {
    const btn = document.createElement('div');
    btn.className = 'category-btn';
    btn.innerText = name;
    btn.setAttribute('data-category', key); // Add data attribute for easier debugging
    btn.onclick = () => {
        showCategoryPosts(key);
        document.querySelectorAll('.category-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
    };
    return btn;
}

function showCategoryPosts(category) {
    currentCategory = category;

    // Robust check for data existence
    const posts = blogData[category] || [];
    const contentArea = document.getElementById('content');

    // If no posts (shouldn't happen for clickable categories, but safety first)
    if (!posts || posts.length === 0) {
        contentArea.innerHTML = `<h1>${category}</h1><p>No posts found.</p>`;
        return;
    }

    let html = `<h1>${category}</h1><div class="post-list">`;

    posts.forEach(post => {
        // Generate tags HTML if tags exist
        let tagsHtml = '';
        if (post.tags && post.tags.length > 0) {
            tagsHtml = `<div class="post-tags">`;
            post.tags.forEach(tag => {
                tagsHtml += `<span class="post-tag">#${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        html += `
            <div class="post-item" onclick="loadPost('${post.path}')">
                <h3>${post.title}</h3>
                ${tagsHtml}
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
