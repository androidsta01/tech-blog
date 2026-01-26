import os
import requests
import datetime
import feedparser
from bs4 import BeautifulSoup
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import ssl
import nltk

# NLTK setup for CI/CD
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def fetch_hacker_news_top_stories(limit=3):
    """Fetch top stories from Hacker News API"""
    try:
        response = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json')
        ids = response.json()[:limit]
        stories = []
        for id in ids:
            item = requests.get(f'https://hacker-news.firebaseio.com/v0/item/{id}.json').json()
            if 'url' in item:
                stories.append({
                    'title': item['title'],
                    'url': item['url'],
                    'source': 'Hacker News'
                })
        return stories
    except Exception as e:
        print(f"Error fetching HN: {e}")
        return []

def summarize_url(url, sentences_count=3):
    """Summarize content from URL using Simple extraction + Sumy"""
    try:
        # 1. Fetch Content
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Simple extraction of p tags
        text = ' '.join([p.text for p in soup.find_all('p')])
        
        if not text or len(text) < 200:
            return "내용을 가져올 수 없습니다. 원문을 확인해주세요."

        # 2. Summarize with Sumy (LSA)
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        stemmer = Stemmer("english")
        summarizer = LsaSummarizer(stemmer)
        summarizer.stop_words = get_stop_words("english")

        summary = []
        for sentence in summarizer(parser.document, sentences_count):
            summary.append(str(sentence))
        
        return ' '.join(summary)
    except Exception as e:
        return f"요약 실패 ({str(e)}). 원문을 참조하세요."

def generate_markdown(stories):
    """Generate Markdown content"""
    display_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    
    content = f"""---
title: Tech Trends Briefing ({display_time})
date: {datetime.datetime.now().strftime('%Y-%m-%d')}
tags: Trend, News, Auto
---

# Tech Trends Briefing ({display_time})

오늘의 주요 기술 소식입니다.

"""
    for story in stories:
        summary = summarize_url(story['url'])
        full_title = story['title']
        
        # Simple Translation attempt (optional, skipping for reliability implies English title is fine)
        # or we rely on the user reading English for tech news.
        
        content += f"""## {full_title}
**Source**: {story['source']}  
**Link**: [{story['url']}]({story['url']})

> **Summary**: {summary}

---
"""
    
    content += "\n*이 글은 `sumy` 알고리즘에 의해 자동 생성되었습니다.*"
    return content

def main():
    print("Fetching trends...")
    stories = fetch_hacker_news_top_stories(3)
    
    if not stories:
        print("No stories found.")
        return

    print("Generating content...")
    markdown = generate_markdown(stories)
    
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
