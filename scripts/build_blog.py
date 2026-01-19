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
                
                post = {
                    'filename': file,
                    'path': filepath,
                    'title': meta.get('title', file.replace('.md', '')),
                    'date': meta.get('date', ''),
                    'category': category
                }
                blog_data[category].append(post)

# Sort posts by date (optional)
for category in blog_data:
    blog_data[category].sort(key=lambda x: x['date'], reverse=True)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(blog_data, f, ensure_ascii=False, indent=2)

print(f"Generated {OUTPUT_FILE} with {sum(len(v) for v in blog_data.values())} posts.")
