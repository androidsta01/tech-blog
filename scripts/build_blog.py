import os
import json
import re

POSTS_DIR = 'posts'
OUTPUT_FILE = 'posts.json'

def parse_frontmatter(content):
    """Simple frontmatter parser"""
    meta = {}
    if content.startswith('---'):
        end = content.find('---', 3)
        if end != -1:
            yaml_block = content[3:end]
            for line in yaml_block.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    meta[key.strip()] = value.strip()
            return meta, content[end+3:].strip()
    return {}, content

blog_data = {}

for root, dirs, files in os.walk(POSTS_DIR):
    if root == POSTS_DIR:
        continue
        
    # Use relative path for category (e.g., "Posting/Blog" or "Settings")
    category = os.path.relpath(root, POSTS_DIR)
    
    if category not in blog_data:
        blog_data[category] = []
        
    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                meta, body = parse_frontmatter(content)
                
                # Parse tags: handle array syntax [a, b] or simple string a, b
                tags = meta.get('tags', '')
                # Remove brackets and quotes if present
                tags = tags.replace('[', '').replace(']', '').replace('"', '').replace("'", "")
                tag_list = [t.strip() for t in tags.split(',')] if tags.strip() else []

                post = {
                    'filename': file,
                    'path': filepath,
                    'title': meta.get('title', file.replace('.md', '')),
                    'date': meta.get('date', ''),
                    'tags': tag_list,
                    'category': category
                }
                blog_data[category].append(post)

# Sort posts by date (optional)
for category in blog_data:
    blog_data[category].sort(key=lambda x: x['date'], reverse=True)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(blog_data, f, ensure_ascii=False, indent=2)

    print(f"Generated {OUTPUT_FILE} with {sum(len(v) for v in blog_data.values())} posts.")

def generate_sitemap(data):
    """Generates sitemap.xml for SEO"""
    BASE_URL = "https://androidsta01.github.io/tech-blog"
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    # Add homepage
    sitemap_content += f"""    <url>
        <loc>{BASE_URL}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>\n"""

    # Add all posts
    for category in data:
        for post in data[category]:
            # Construct URL (assuming simple hash routing or direct path if supported later)
            # Currently the blog uses hash routing via loadPost() but raw markdown is fetched.
            # To support better SEO, we might need query params or hash.
            # However, standard sitemaps should point to crawlable URLs.
            # Since this is a SPA, linking to the markdown file directly allows bots to see content,
            # but ideally we want them to see the rendered page? 
            # Static site generators usually output .html files. 
            # For this SPA setup, we point to the main page with query param or hash?
            # Or better, point to the raw markdown for now so at least content is indexed?
            # NO, Googlebot executes JS now. Let's point to the SPA URL hash/query if possible.
            # But standard practice for this simple setup: point to index.html assuming JS navigation.
            # Actually, `?post=path/to/post` handling in `app.js` is best for SEO deep linking.
            # I will modify `app.js` later to handle query params. Use query param style here.
            
            # Use query parameter for deep linking (requires app.js update)
            safe_path = post['path'].replace(' ', '%20')
            url = f"{BASE_URL}/?post={safe_path}"
            
            lastmod = post['date'] if post['date'] else '2026-01-26'
            
            sitemap_content += f"""    <url>
        <loc>{url}</loc>
        <lastmod>{lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>\n"""

    sitemap_content += '</urlset>'
    
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    print("Generated sitemap.xml")

generate_sitemap(blog_data)
