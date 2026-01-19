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
            renderCategories(data);
            // Load the first category by default
            const firstCategory = Object.keys(data)[0];
            if (firstCategory) {
                showCategoryPosts(firstCategory);
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('content').innerHTML = `<h1>Welcome to Tech Blog</h1><p>Select a category from the sidebar to get started.</p>`;
        });
});

function renderCategories(data) {
    const sidebar = document.getElementById('sidebar-options');
    sidebar.innerHTML = '';

    for (const category of Object.keys(data)) {
        if (data[category].length === 0) continue;

        const categoryBtn = document.createElement('div');
        categoryBtn.className = 'category-btn';
        categoryBtn.innerText = category;
        categoryBtn.onclick = () => {
            showCategoryPosts(category);
            // Update active state
            document.querySelectorAll('.category-btn').forEach(el => el.classList.remove('active'));
            categoryBtn.classList.add('active');
        };
        sidebar.appendChild(categoryBtn);
    }

    // Set first category as active
    const firstBtn = sidebar.querySelector('.category-btn');
    if (firstBtn) firstBtn.classList.add('active');
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
