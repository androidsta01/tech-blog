document.addEventListener('DOMContentLoaded', () => {
    fetch('posts.json')
        .then(response => {
            if (!response.ok) throw new Error("Manifest not found");
            return response.json();
        })
        .then(data => {
            renderSidebar(data);
            // Load the first post of the first category by default
            const firstCategory = Object.keys(data)[0];
            if (firstCategory && data[firstCategory].length > 0) {
                loadPost(data[firstCategory][0].path);
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('content').innerHTML = `<h1>Welcome to Tech Blog</h1><p>Select a post from the sidebar to get started.</p>`;
        });
});

function renderSidebar(data) {
    const sidebar = document.getElementById('sidebar-options');
    sidebar.innerHTML = '';

    for (const [category, posts] of Object.entries(data)) {
        if (posts.length === 0) continue;

        const title = document.createElement('div');
        title.className = 'category-title';
        title.innerText = category;
        sidebar.appendChild(title);

        posts.forEach(post => {
            const link = document.createElement('a');
            link.className = 'post-link';
            link.innerText = post.title;
            link.onclick = () => {
                loadPost(post.path);
                // Update active state
                document.querySelectorAll('.post-link').forEach(el => el.classList.remove('active'));
                link.classList.add('active');
            };
            sidebar.appendChild(link);
        });
    }
}

function loadPost(path) {
    fetch(path)
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
