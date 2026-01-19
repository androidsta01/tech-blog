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
        // User also wants Settings to look like Posting (Header style).

        const items = groups[groupName];

        // Treat everything as a group now to maintain consistent styling for top-level items
        const header = document.createElement('div');
        header.className = 'nav-group-header';
        header.innerText = groupName;
        sidebar.appendChild(header);

        const container = document.createElement('div');
        container.className = 'nav-group-items';

        // If it's a flat category (like Settings originally), it still needs an item inside
        // If it was flat, items[0].name was 'Settings'. We want to keep clicking it functional.
        // BUT, if Settings is a folder containing files, we might want to list those files?
        // Wait, Settings contains 'project-history.md' etc.
        // In the previous logic: if isFlat, we rendered a button. 
        // Now, we render a Header 'Settings', and inside it we should render the items.
        // If Settings is a folder name, the items inside are the posts?
        // No, 'groups' logic grouped by top-level folder.
        // If 'Settings' has files directly inside posts/Settings/*.md, then keys are Settings/file.md
        // In that case 'subCategory' would be 'file.md' if we logic it right?
        // Let's re-read the grouping logic.
        /* 
           const parts = key.split('/');
           const topLevel = parts[0]; 
           const subCategory = parts.length > 1 ? parts[1] : null;
        */
        // If key is 'Settings/project-history.md', topLevel='Settings', subCategory='project-history.md'.
        // So items will contain {name: 'project-history.md', fullPath: ...}
        // Actually, the previous logic:
        /*
        if (subCategory) {
            groups[topLevel].push({ name: subCategory, fullPath: key });
        } else {
            groups[topLevel].push({ name: topLevel, fullPath: key });
        }
        */
        // Wait, if it's 'Settings/project-history.md', subCategory is 'project-history.md'.
        // If it's 'Posting/Blog/post.md', key might be 'Posting/Blog'. 
        // scripts/build_blog.py uses os.path.relpath(root, POSTS_DIR).
        // If structure is posts/Posting/Blog/post.md, root is posts/Posting/Blog. relpath is Posting/Blog.
        // So category key is 'Posting/Blog'.
        // parts[0] = Posting, parts[1] = Blog.
        // If structure is posts/Settings/project-history.md, root is posts/Settings. category key is 'Settings'.
        // parts[0] = Settings, parts[1] undefined.
        // So for Settings, subCategory is null.
        // groups['Settings'].push({ name: 'Settings', fullPath: 'Settings' });

        // So for Settings, we have one item named 'Settings'.
        // If we render 'Settings' as a Header, we need a clickable item inside?
        // Or should the Header be clickable if it has no children?
        // User said: "Settings and Posting should be same size/color" (Header style).
        // And "Blog" should be smaller.

        // If Settings is just a category containing posts, usually you click the category to see posts.
        // If we make Settings a Header, clicking it does nothing usually.
        // But Posting has sub-categories (Blog, AI). Clicking Posting does nothing?
        // Clicking Blog shows posts.

        // Settings has NO sub-categories. It just has posts.
        // So we should probably render Settings as a Header, but maybe make the Header clickable?
        // OR, render a generic "All" or "General" sub-item? No that's ugly.

        // Alternative: Render Settings as a Header, AND have it functionality act as a button?
        // The user wants visual consistency.

        // Let's try this:
        // Always render the Group Name as a .nav-group-header.
        // If the group has sub-items (like Posting -> Blog), render them below.
        // If the group IS the item (like Settings, which is a leaf category itself), 
        // we have a dilemma. A header isn't usually a button.

        // Maybe the user wants Settings to be a "Category" that looks like a "Parent"?
        // Or maybe they want Posting to be a Category, and Blog to be a Sub-Category.

        // Current CSS: .nav-group-header is small text (uppercase).
        // .category-btn is block, bigger text.
        // User says: "Posting and Settings same size/color (Big)". "Blog smaller".

        // So Posting (Header) should look Big.
        // Settings (Item) should look Big.
        // Blog (Sub-item) should look Small.

        // Currently:
        // Posting is .nav-group-header (Small, Uppercase, Gray).
        // Blog is .category-btn (Medium, Black).
        // Settings is .category-btn (Medium, Black).

        // User wants:
        // Posting (Big), Settings (Big).
        // Blog (Small).

        // So I should change CSS!
        // .nav-group-header -> Make it look like a primary category.
        // .category-btn -> If it's a sub-item, make it smaller.
        // .category-btn -> If it's a top-level item (Settings), make it look like a primary category?

        // Let's change the structure slightly.
        // Everything is a .category-btn.
        // Top level items have 'top-level' class.
        // Sub items have 'sub-item' class.

        // Posting is NOT a category with posts, it's a folder of categories.
        // So Posting itself doesn't have posts.
        // So Posting definitely is a Header.

        // Settings IS a category with posts.
        // So Settings IS a button.

        // So visual mapping:
        // Header (Posting) = Big, Bold.
        // Top-Level Btn (Settings) = Big, Bold (same as Header).
        // Sub-Level Btn (Blog) = Small, Indented.

        // So in app.js, we need to distinguish:
        // 1. Groups that are just containers (Posting) -> Render as Header.
        // 2. Groups that are actual categories (Settings) -> Render as Button (but styled like Header).
        // 3. Sub-categories (Blog) -> Render as Button (styled smaller).

        // Code change:
        // Determine if group is 'container' or 'leaf'.
        // logic: if items[0].name === groupName, it is a leaf (Settings).
        // else it is a container (Posting).

        if (items.length === 1 && items[0].name === groupName) {
            // Leaf Top-Level (Settings)
            // Render as a button, but add class 'top-level-btn' to match Header style
            const cat = items[0];
            const btn = createCategoryBtn(cat.name, cat.fullPath);
            btn.classList.add('top-level-btn');
            sidebar.appendChild(btn);
        } else {
            // Container Top-Level (Posting)
            // Render as Header
            const header = document.createElement('div');
            header.className = 'nav-group-header'; // We will style this to look big
            header.innerText = groupName;
            sidebar.appendChild(header);

            const container = document.createElement('div');
            container.className = 'nav-group-items';

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
