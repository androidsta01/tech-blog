import os
import requests
import datetime
from bs4 import BeautifulSoup
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import nltk
from googletrans import Translator

# NLTK setup for CI/CD
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

# Core programming/software keywords (must have at least one)
CORE_TECH_KEYWORDS = [
    'programming', 'software', 'developer', 'code', 'coding',
    'python', 'javascript', 'typescript', 'rust', 'go', 'java', 'c++', 'c#',
    'react', 'vue', 'angular', 'node', 'django', 'flask', 'spring',
    'docker', 'kubernetes', 'git', 'github', 'gitlab',
    'database', 'sql', 'api', 'framework', 'library',
    'algorithm', 'data structure', 'compiler', 'interpreter',
    'backend', 'frontend', 'fullstack', 'devops', 'ci/cd',
    'machine learning', 'deep learning', 'neural network',
    'open source', 'repository', 'commit', 'pull request'
]

# Supporting tech keywords (nice to have)
SUPPORTING_KEYWORDS = [
    'ai', 'ml', 'cloud', 'aws', 'azure', 'gcp',
    'nosql', 'mongodb', 'postgresql', 'redis',
    'rest', 'graphql', 'microservices',
    'web development', 'mobile', 'ios', 'android',
    'security', 'encryption', 'blockchain'
]

def is_tech_related(title, text=''):
    """Check if content is programming/tech-related"""
    combined = (title + ' ' + text).lower()
    
    # Must have at least one core programming keyword
    has_core = any(keyword in combined for keyword in CORE_TECH_KEYWORDS)
    
    # Exclude non-tech topics even if they mention technology
    exclude_keywords = ['airport', 'travel', 'flight', 'passenger', 'security checkpoint']
    has_exclude = any(keyword in combined for keyword in exclude_keywords)
    
    return has_core and not has_exclude

def fetch_hacker_news_top_stories(limit=10, min_score=50):
    """Fetch top tech stories from Hacker News API with filtering"""
    try:
        response = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json')
        ids = response.json()[:50]  # Get top 50 to filter from
        
        tech_stories = []
        for story_id in ids:
            if len(tech_stories) >= limit:
                break
                
            item = requests.get(f'https://hacker-news.firebaseio.com/v0/item/{story_id}.json').json()
            
            # Filter criteria
            if 'url' not in item:  # Skip discussion-only posts
                continue
            if item.get('score', 0) < min_score:  # Minimum score threshold
                continue
            if not is_tech_related(item['title']):  # Tech keyword check
                continue
            
            tech_stories.append({
                'title': item['title'],
                'url': item['url'],
                'score': item.get('score', 0),
                'source': 'Hacker News'
            })
        
        return tech_stories[:limit]
    except Exception as e:
        print(f"Error fetching HN: {e}")
        return []

def summarize_url(url, sentences_count=3):
    """Summarize content from URL using Sumy"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract text from paragraphs
        text = ' '.join([p.text for p in soup.find_all('p')])
        
        if not text or len(text) < 200:
            return None
        
        # Summarize with Sumy (LSA)
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        stemmer = Stemmer("english")
        summarizer = LsaSummarizer(stemmer)
        summarizer.stop_words = get_stop_words("english")
        
        summary = []
        for sentence in summarizer(parser.document, sentences_count):
            summary.append(str(sentence))
        
        return ' '.join(summary) if summary else None
    except Exception as e:
        print(f"Summarization error for {url}: {e}")
        return None

def translate_to_korean(text):
    """Translate text to Korean using Google Translate"""
    try:
        translator = Translator()
        result = translator.translate(text, src='en', dest='ko')
        return result.text
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original if translation fails

def generate_markdown(stories):
    """Generate Markdown content with Korean translation"""
    display_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    
    content = f"""---
title: 기술 트렌드 브리핑 ({display_time})
date: {datetime.datetime.now().strftime('%Y-%m-%d')}
tags: Trend, Programming, Tech, Auto
---

# 기술 트렌드 브리핑 ({display_time})

오늘의 주요 프로그래밍 및 기술 소식입니다.

"""
    
    successful_posts = 0
    
    for story in stories:
        # Get English summary
        english_summary = summarize_url(story['url'])
        
        # Skip if summarization failed or content too short
        if not english_summary or len(english_summary) < 50:
            print(f"Skipping {story['title']}: summarization failed or too short")
            continue
        
        # Translate title and summary to Korean
        korean_title = translate_to_korean(story['title'])
        korean_summary = translate_to_korean(english_summary)
        
        # Validate translation (check for common error messages)
        error_indicators = ['javascript', '비활성화', 'disabled', 'enable javascript', 'browser']
        if any(indicator in korean_summary.lower() for indicator in error_indicators):
            if len(korean_summary) < 200:  # Short error messages
                print(f"Skipping {story['title']}: likely JavaScript error or paywall")
                continue
        
        content += f"""## {korean_title}
**출처**: {story['source']} (⬆️ {story['score']} votes)  
**원문**: [{story['url']}]({story['url']})

> **요약**: {korean_summary}

---
"""
        successful_posts += 1
    
    if successful_posts == 0:
        print("No valid posts generated. Aborting.")
        return None
    
    content += "\n*이 글은 Hacker News API + `sumy` 알고리즘 + Google Translate로 자동 생성되었습니다.*"
    return content

def main():
    print("Fetching tech trends from Hacker News...")
    stories = fetch_hacker_news_top_stories(limit=5, min_score=100)
    
    if not stories:
        print("No tech stories found.")
        return
    
    print(f"Found {len(stories)} tech stories. Generating content...")
    markdown = generate_markdown(stories)
    
    if not markdown:
        print("Failed to generate valid content.")
        return
    
    # Save to file
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d-%H%M')
    filename = f"posts/Posting/Trend/trend-{timestamp}.md"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    if not os.path.exists(filename):
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(markdown)
        print(f"Successfully created {filename}")
    else:
        print(f"File {filename} already exists. Skipping.")

if __name__ == "__main__":
    main()
