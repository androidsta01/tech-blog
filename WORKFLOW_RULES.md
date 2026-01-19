# 작업 규칙 (Workflow Rules)

## 필수 규칙: 모든 작업은 History에 기록

**중요:** 사용자와 함께 수행한 모든 작업은 반드시 다음 두 곳에 기록되어야 합니다:

### 1. 로컬 작업 로그 업데이트
- 파일: `/Users/hugh/Desktop/Antigravity/work_log.txt`
- 형식: `[날짜 시간] 작업 내용 설명`
- 예시: `[2026-01-19 16:30:46] 작업 규칙 파일 생성 및 누락된 History 업데이트`

### 2. 블로그 History 포스트 업데이트
- 파일: `/Users/hugh/Desktop/Antigravity/tech-blog/posts/History/project-history.md`
- 형식: `- **시간**: 작업 내용 설명 \`[AI 모델명]\``
- 예시: `- **16:30:46**: 작업 규칙 파일 생성 및 누락된 History 업데이트 \`[Claude Sonnet 4.5]\``

### 3. GitHub에 Push
- 모든 History 업데이트는 즉시 GitHub에 Push하여 웹페이지에서 확인 가능하도록 함
- 명령어: `git add posts/History/project-history.md && git commit -m "Update history" && git push`

## 작업 체크리스트

매 작업마다 다음을 확인:

- [ ] 작업 완료 후 `work_log.txt` 업데이트
- [ ] `project-history.md`에 작업 내역 추가 (AI 모델명 포함)
- [ ] GitHub에 Push하여 웹페이지 반영
- [ ] 필요시 `task.md` 업데이트

## AI 모델 표기 규칙

- Gemini 3 Pro로 수행한 작업: `[Gemini 3 Pro]`
- Claude Sonnet 4.5로 수행한 작업: `[Claude Sonnet 4.5]`
- 기타 모델: 해당 모델명 정확히 표기

## 예외 사항

다음의 경우는 History 기록 생략 가능:
- 단순 질문 응답 (코드 수정 없음)
- 파일 조회만 수행
- 사용자가 명시적으로 기록 불필요하다고 언급한 경우
