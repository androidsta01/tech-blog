# 세이브 포인트 (Git Tags)

이 파일은 프로젝트의 주요 세이브 포인트를 기록합니다. 각 세이브 포인트는 Git 태그로 저장되어 있어, 언제든지 해당 시점으로 되돌릴 수 있습니다.

## 📌 세이브 포인트 목록

### v1.0-stable-toc (2026-01-20)
**설명:** 다크 모드 및 Notion 스타일 목차(TOC) 완성 버전
**주요 기능:**
- ✅ 다크 모드 (토글 버튼, 로컬 스토리지 저장)
- ✅ Notion 스타일 목차 (수직 트랙, 스크롤 스파이, 계층 구조)
- ✅ 목차 표시 로직 (포스트 읽기 시에만 표시)
- ✅ 해시태그 시스템
- ✅ 계층형 카테고리 구조
- ✅ GitHub Actions 자동 배포

**되돌리는 방법:**
```bash
# 1. 현재 작업 내용 저장 (선택사항)
git stash

# 2. 세이브 포인트로 되돌리기
git checkout v1.0-stable-toc

# 3. 새 브랜치로 작업하고 싶다면
git checkout -b restore-from-v1.0

# 4. 또는 main 브랜치를 강제로 되돌리기 (주의!)
git reset --hard v1.0-stable-toc
git push origin main --force
```

---

## 🔧 세이브 포인트 사용 가이드

### 새 세이브 포인트 만들기
```bash
# 1. 현재 상태를 커밋
git add .
git commit -m "작업 내용 설명"

# 2. 태그 생성 (버전명과 설명 입력)
git tag -a "v1.1-feature-name" -m "설명"

# 3. GitHub에 푸시
git push origin v1.1-feature-name
```

### 세이브 포인트 목록 보기
```bash
git tag -l
```

### 특정 세이브 포인트 상세 정보 보기
```bash
git show v1.0-stable-toc
```

### 세이브 포인트로 되돌리기
```bash
# 임시로 확인만 하기 (detached HEAD 상태)
git checkout v1.0-stable-toc

# 새 브랜치로 복원하기
git checkout -b restore-branch v1.0-stable-toc

# main 브랜치를 강제로 되돌리기 (주의: 이후 커밋 삭제됨!)
git reset --hard v1.0-stable-toc
git push origin main --force
```

---

## ⚠️ 주의사항

1. **강제 푸시 주의:** `git push --force`는 GitHub Pages 배포 히스토리도 삭제할 수 있으니 신중하게 사용하세요.
2. **백업 권장:** 중요한 작업 전에는 항상 새 세이브 포인트를 만드세요.
3. **태그 삭제:** 잘못 만든 태그는 `git tag -d 태그명` 및 `git push origin :refs/tags/태그명`으로 삭제할 수 있습니다.
