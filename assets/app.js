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
            // Build search index after data is loaded
            buildSearchIndex();
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

    // Clear TOC when viewing category list
    const tocSidebar = document.getElementById('toc-sidebar');
    if (tocSidebar) {
        tocSidebar.innerHTML = '';
    }

    // If no posts (shouldn't happen for clickable categories, but safety first)
    if (!posts || posts.length === 0) {
        contentArea.innerHTML = `<h1>${category}</h1><p>No posts found.</p>`;
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = new Date(a.date || '1970-01-01');
        const dateB = new Date(b.date || '1970-01-01');
        return dateB - dateA; // Descending order (newest first)
    });

    let html = `<h1>${category}</h1><div class="post-list">`;

    sortedPosts.forEach(post => {
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
            const contentArea = document.getElementById('content');
            contentArea.innerHTML = DOMPurify.sanitize(html);

            // Generate TOC
            generateTOC(contentArea);

            // Check if this is the project history page and render table
            if (path.includes('project-history.md')) {
                renderHistoryTable();
            }
        })
        .catch(err => {
            document.getElementById('content').innerHTML = `<p>Error loading post: ${err.message}</p>`;
        });
}

function renderHistoryTable() {
    const container = document.getElementById('history-table-container');
    if (!container) return;

    fetch('assets/history.json?t=' + new Date().getTime())
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                container.innerHTML = '<p>No history data available.</p>';
                return;
            }

            // Group data by date
            const groupedData = {};
            data.forEach(item => {
                if (!groupedData[item.date]) {
                    groupedData[item.date] = [];
                }
                groupedData[item.date].push(item);
            });

            // Sort dates descending
            const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

            let html = '<div class="history-accordion">';

            sortedDates.forEach((date, index) => {
                const items = groupedData[date];
                // Sort items by time descending within date
                items.sort((a, b) => {
                    return a.time < b.time ? 1 : -1;
                });

                // First group (latest date) is open by default
                const isOpen = index === 0;

                html += `
                    <div class="history-group">
                        <button class="history-header ${isOpen ? 'active' : ''}" onclick="toggleHistory(this)">
                            <span class="history-date">
                                <svg class="toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                                ${date}
                            </span>
                            <span class="history-count">${items.length} items</span>
                        </button>
                        <div class="history-content" style="display: ${isOpen ? 'block' : 'none'}">
                            <table class="history-table compact">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Task</th>
                                        <th>Model</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;

                items.forEach(item => {
                    html += `
                        <tr>
                            <td class="time-col">${item.time}</td>
                            <td class="desc-col">${item.description}</td>
                            <td class="model-col"><span class="model-tag">${item.model}</span></td>
                        </tr>
                    `;
                });

                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;
        })
        .catch(err => {
            console.error('Failed to load history:', err);
            container.innerHTML = `<p>Error loading history data.</p>`;
        });
}

function toggleHistory(header) {
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    if (content.style.display === 'block') {
        content.style.display = 'none';
    } else {
        content.style.display = 'block';
    }
}

function generateTOC(contentElement) {
    const tocSidebar = document.getElementById('toc-sidebar');
    if (!tocSidebar) return;

    tocSidebar.innerHTML = '';
    const headers = contentElement.querySelectorAll('h1, h2, h3');

    if (headers.length === 0) return;

    const ul = document.createElement('ul');
    ul.className = 'toc-list';

    headers.forEach((header, index) => {
        // Generate ID if not present
        if (!header.id) {
            const idText = header.innerText.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-\uAC00-\uD7A3]+/g, '');
            header.id = idText || `header-${index}`;
        }

        const li = document.createElement('li');
        li.className = `toc-item ${header.tagName.toLowerCase()}-item`;

        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.innerText = header.innerText;
        li.appendChild(a);
        ul.appendChild(li);
    });

    tocSidebar.appendChild(ul);

    // Scroll Spy
    setupScrollSpy(headers);
}

function setupScrollSpy(headers) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.id;
                document.querySelectorAll('.toc-item a').forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === `#${activeId}`);
                });
            }
        });
    }, { rootMargin: '-100px 0px -66%' });

    headers.forEach(header => observer.observe(header));
}
// ===== Search Functionality =====

let searchIndex = [];
let selectedResultIndex = -1;

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchModal = document.getElementById('search-modal');

    if (!searchInput || !searchModal) return;

    if (!searchInput || !searchModal) return;

    // Search index will be built after data is loaded

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K or / to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        } else if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }

        // Esc to close
        if (e.key === 'Escape') {
            closeSearch();
        }

        // Arrow keys for navigation
        if (searchModal.classList.contains('hidden')) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateResults(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateResults(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            selectResult();
        }
    });

    // Input event for real-time search
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });

    // Focus event to show modal
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            performSearch(searchInput.value);
        }
        searchModal.classList.remove('hidden');
    });

    // Click outside to close
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearch();
        }
    });
}

function buildSearchIndex() {
    searchIndex = [];

    if (!blogData) return;

    // Iterate through all categories and posts
    for (const [category, posts] of Object.entries(blogData)) {
        posts.forEach(post => {
            searchIndex.push({
                title: post.title,
                category: category,
                path: post.path,
                tags: post.tags || [],
                date: post.date,
                // We'll fetch content on demand for snippet
            });
        });
    }
}

function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    const searchModal = document.getElementById('search-modal');

    if (!query.trim()) {
        searchResults.innerHTML = '';
        searchModal.classList.add('hidden');
        return;
    }

    searchModal.classList.remove('hidden');

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search through index
    searchIndex.forEach(item => {
        let score = 0;
        let matchType = '';

        // Title match (highest priority)
        if (item.title.toLowerCase().includes(lowerQuery)) {
            score += 10;
            matchType = 'title';
        }

        // Tag match (medium priority)
        if (item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
            score += 5;
            if (!matchType) matchType = 'tag';
        }

        // Category match (low priority)
        if (item.category.toLowerCase().includes(lowerQuery)) {
            score += 2;
            if (!matchType) matchType = 'category';
        }

        if (score > 0) {
            results.push({ ...item, score, matchType });
        }
    });

    // Sort by score (descending) then by date (newest first)
    results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.date) - new Date(a.date);
    });

    // Render results
    renderSearchResults(results, lowerQuery);
}

function renderSearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    selectedResultIndex = -1;

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                검색 결과가 없습니다.
            </div>
        `;
        return;
    }

    const html = results.map((result, index) => {
        const highlightedTitle = highlightText(result.title, query);
        const tags = result.tags.length > 0
            ? result.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join(' ')
            : '';

        return `
            <div class="search-result-item" data-index="${index}" data-path="${result.path}">
                <div class="search-result-title">${highlightedTitle}</div>
                <div class="search-result-category">${result.category}</div>
                ${tags ? `<div class="search-result-snippet">${tags}</div>` : ''}
            </div>
        `;
    }).join('');

    searchResults.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            loadPost(item.dataset.path);
            closeSearch();
        });
    });
}

function highlightText(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function navigateResults(direction) {
    const items = document.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    // Remove previous selection
    if (selectedResultIndex >= 0 && selectedResultIndex < items.length) {
        items[selectedResultIndex].classList.remove('selected');
    }

    // Update index
    selectedResultIndex += direction;

    // Wrap around
    if (selectedResultIndex < 0) selectedResultIndex = items.length - 1;
    if (selectedResultIndex >= items.length) selectedResultIndex = 0;

    // Add new selection
    items[selectedResultIndex].classList.add('selected');
    items[selectedResultIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function selectResult() {
    const items = document.querySelectorAll('.search-result-item');
    if (selectedResultIndex >= 0 && selectedResultIndex < items.length) {
        const selectedItem = items[selectedResultIndex];
        loadPost(selectedItem.dataset.path);
        closeSearch();
    }
}

function closeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchModal = document.getElementById('search-modal');

    searchInput.value = '';
    searchInput.blur();
    searchModal.classList.add('hidden');
    selectedResultIndex = -1;
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});
