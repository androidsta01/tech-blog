---
title: Project Development History
date: 2026-01-16
---

# Project Development History

A chronological log of the setup and development process for this Tech Blog.

## 2026-01-16

- **18:22:00**: 작업 기록 시스템 설정 완료 `[Gemini 3 Pro]`
- **18:26:20**: Git 설치 명령어 'xcode-select --install' 실행 (사용자 승인 완료) `[Gemini 3 Pro]`
- **18:38:44**: Git 설치 확인 및 완료 `[Gemini 3 Pro]`
- **18:43:27**: Homebrew 설치 명령어 실행 (사용자 승인 완료) `[Gemini 3 Pro]`
- **18:47:51**: 터미널 앱 실행 및 설치 스크립트 전달 (비밀번호 입력 대기) `[Gemini 3 Pro]`
- **18:49:08**: Homebrew 설치 완료 확인 중 (실패: 경로 확인 불가) `[Gemini 3 Pro]`
- **18:55:17**: Homebrew 설치 재시도 (터미널 재실행) `[Gemini 3 Pro]`
- **18:56:19**: Homebrew 설치 재확인 중 `[Gemini 3 Pro]`
- **18:57:00**: PATH 설정 및 GitHub CLI (gh) 설치 시작 `[Gemini 3 Pro]`
- **18:57:30**: GitHub CLI 설치 완료. 인증(gh auth login) 절차 시작 `[Gemini 3 Pro]`
- **19:00:49**: GitHub 로그인 확인 (계정: androidsta01) 및 연동 완료 `[Gemini 3 Pro]`
- **19:10:14**: 'tech-blog' 리포지토리 생성 및 클론 시작 (public) `[Gemini 3 Pro]`
- **19:10:25**: 'tech-blog' 리포지토리 생성(GitHub) 및 로컬 클론 완료 확인 `[Gemini 3 Pro]`
- **19:15:30**: 'work_log.txt' 기반 README.md 생성 및 GitHub 푸시 완료 `[Gemini 3 Pro]`
- **19:19:05**: 'brew' 명령어 경로 에러로 재시도 (/opt/homebrew/bin/brew 사용) `[Gemini 3 Pro]`
- **19:22:00**: GitHub Desktop (GUI) 설치 완료 (/Applications/GitHub Desktop.app) `[Gemini 3 Pro]`
- **19:33:35**: 작업 환경 최적화: .zshrc 생성 및 PATH 변수 영구 설정 완료 `[Gemini 3 Pro]`
- **19:44:28**: 호스팅 비교 문서(hosting_comparison.md) GitHub 업로드 완료 `[Gemini 3 Pro]`
- **19:54:57**: GitHub Pages 설정을 위한 'index.html' 생성 및 푸시 시작 `[Gemini 3 Pro]`
- **19:56:00**: CSS 문법 오류 수정 및 GitHub Pages 활성화 API 호출 (branch: main) `[Gemini 3 Pro]`
- **20:00:50**: 블로그 UI 구축 (Sidebar Layout) 및 GitHub Actions 자동화 설정 시작 `[Gemini 3 Pro]`
- **20:06:57**: 'History' 카테고리 추가 및 작업 로그(work_log.txt) 기록 포스팅 완료 `[Gemini 3 Pro]`
- **20:09:55**: 사용자 요청에 따라 샘플 카테고리(Development, Personal) 삭제 `[Gemini 3 Pro]`
- **20:13:14**: 블로그 하단 푸터(Footer) 문구 추가 `[Gemini 3 Pro]`
- **20:16:03**: 푸터 위치 조정 (글로벌 하단 고정) `[Gemini 3 Pro]`
- **20:18:28**: 작업 내역(History) 최신화 및 블로그 반영 `[Gemini 3 Pro]`
- **20:22:38**: 블로그 동기화 지연 문제 해결 (캐시 방지 로직 추가) `[Gemini 3 Pro]`

## 2026-01-19

- **16:15:00**: 이전 작업 검증 및 누락된 History 항목 추가 `[Claude Sonnet 4.5]`
- **16:18:54**: 블로그 네비게이션 2단계 구조로 개편 (카테고리 → 포스트 목록 → 내용) `[Claude Sonnet 4.5]`
- **16:24:31**: AI 모델 정보를 각 작업 항목에 추가 `[Claude Sonnet 4.5]`
- **16:26:32**: 네비게이션 배포 문제 분석 및 캐시 버스팅 적용 (index.html에 v=2.0 추가) `[Claude Sonnet 4.5]`
- **16:30:46**: 작업 규칙(WORKFLOW_RULES.md) 파일 생성 및 누락된 History 업데이트 `[Claude Sonnet 4.5]`
- **16:37:05**: WORKFLOW_RULES.md에 모든 사용자 요청 규칙 통합 (민감정보 보호, 파일 위치, 화면녹화 제한 등) `[Claude Sonnet 4.5]`
- **16:39:01**: WORKFLOW_RULES.md에서 민감한 정보 제거 (계정명, 사용자 경로 등) `[Claude Sonnet 4.5]`
- **16:42:08**: WORKFLOW_RULES.md에서 모든 계정명 예시 완전 제거 `[Claude Sonnet 4.5]`
- **16:46:48**: Posting 카테고리 추가 (posts/Posting 폴더 생성) `[Claude Sonnet 4.5]`
- **16:48:20**: 호스팅 플랫폼 비교 분석 글을 Posting 카테고리에 추가 `[Claude Sonnet 4.5]`
- **16:49:32**: Posting 카테고리 작성 스타일 규칙 추가 (구어체 한글) 및 호스팅 비교 글 재작성 `[Claude Sonnet 4.5]`
- **16:52:36**: Posting 작성 스타일을 ~습니다/~합니다 체로 수정 및 호스팅 비교 글 재작성 `[Claude Sonnet 4.5]`
- **16:57:58**: 불필요한 파일 정리 (중복 파일, 샘플 파일, 시스템 파일 제거) `[Claude Sonnet 4.5]`
- **17:05:46**: Push 완료 시 블로그 링크 제공 규칙 추가 `[Claude Sonnet 4.5]`
- **17:08:52**: Posting 파일에 작성 날짜 및 AI 모델 정보 표시 규칙 추가 `[Claude Sonnet 4.5]`
- **17:17:28**: 프로젝트 구조 변경 (History → Settings 폴더명 변경, 규칙 파일 이동 및 블로그 포스트화) `[Claude Sonnet 4.5]`
- **17:25:06**: 카테고리 정렬 로직 개선 (Posting 최상단, Settings 최하단 고정) `[Claude Sonnet 4.5]`
- **17:34:26**: 하위 카테고리 지원 구조로 개편 (Posting 하위에 Blog 추가, 계층형 사이드바 구현) `[Claude Sonnet 4.5]`
- **17:46:56**: Posting 카테고리 하위 구조 개편 (Posting > Blog 등 2단 구조 지원) 및 기존 글 이동 `[Claude Sonnet 4.5]`
- **18:30:27**: 사이드바 디자인 수정 (Posting/Settings 메인 헤더 스타일 통일, 하위 메뉴 위계 구분 강화) `[Gemini 3 Pro]`
- **18:36:32**: 사이드바 중복 표시 버그 수정 (동일 이름 카테고리 처리 로직 개선) `[Gemini 3 Pro]`
- **18:42:18**: History 파일 정렬 및 AI 모델명(Gemini 3 Pro) 수정 `[Gemini 3 Pro]`
- **18:43:46**: 작업 규칙(workflow-rules.md) 업데이트 (AI 모델명, 시간순 정렬, 사이드바 구조 규정 명시) `[Gemini 3 Pro]`
- **18:46:00**: History 파일 오류 수정: 과거 작업(Claude)과 현재 작업(Gemini) 모델명 명확히 구분하여 복구 `[Gemini 3 Pro]`
- **18:55:00**: 포스트 카드 해시태그(키워드) 기능 구현 (Frontmatter 'tags' 필드 파싱 및 UI 표시) `[Gemini 3 Pro]`
- **19:01:11**: 마크다운 Frontmatter 문법 오류 수정(구분선 누락) 및 캐시 갱신 (v=2.1) `[Gemini 3 Pro]`
- **19:16:44**: GitHub Actions 배포 자동화 최적화 (Push 시 build_blog.py 자동 실행으로 폴더/파일 구조 즉시 반영) `[Gemini 3 Pro]`
- **19:22:00**: 자동 배포 검증을 위한 테스트 포스트(automation-test.md) 작성 및 Push `[Gemini 3 Pro]`
- **19:24:05**: 테스트 완료된 포스트(automation-test.md) 삭제 및 정리 `[Gemini 3 Pro]`
- **19:35:00**: Unity 최신 버전(Unity 6) 및 2025 로드맵 분석 포스트 작성 (이미지 포함) `[Gemini 3 Pro]`
- **19:42:00**: 이미지 엑박 문제 해결 (외부 링크를 로컬 assets/images 폴더로 다운로드하여 대체) `[Gemini 3 Pro]`
