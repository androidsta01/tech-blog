# 배포 관리 가이드

이 문서는 블로그의 배포 버전 관리 및 롤백 절차를 설명합니다.

## 📦 배포 버전 관리 시스템

### 구조
- **Git 태그**: 각 배포 버전을 Git 태그로 표시
- **릴리즈 노트**: `posts/Deploy/` 폴더에 각 버전의 릴리즈 노트 작성
- **블로그 통합**: Deploy 카테고리에서 모든 배포 이력 확인 가능

### 버전 명명 규칙
- **Major 버전** (v1.0, v2.0): 대규모 기능 추가 또는 구조 변경
- **Minor 버전** (v1.1, v1.2): 새로운 기능 추가
- **Patch 버전** (v1.0.1, v1.0.2): 버그 수정 및 소규모 개선

---

## 🚀 새 버전 배포하기

### 1. 작업 완료 및 커밋
```bash
git add .
git commit -m "작업 내용 설명"
git push
```

### 2. Git 태그 생성
```bash
# 태그 생성 (버전명과 설명 입력)
git tag -a "v1.1-feature-name" -m "간단한 설명"

# GitHub에 태그 푸시
git push origin v1.1-feature-name
```

### 3. 릴리즈 노트 작성
`posts/Deploy/v1.1-release.md` 파일을 생성하고 다음 내용을 포함:
- 릴리즈 날짜
- Git 태그명
- 주요 기능 목록
- 기술 세부사항
- 알려진 이슈
- 배포/롤백 방법

### 4. 블로그에 반영
```bash
git add posts/Deploy/v1.1-release.md
git commit -m "Add release note for v1.1"
git push
```

GitHub Actions가 자동으로 빌드 및 배포를 진행합니다.

---

## ⏮️ 이전 버전으로 롤백하기

### 방법 1: 임시 확인 (Detached HEAD)
```bash
# 특정 버전으로 이동 (읽기 전용)
git checkout v1.0-stable-toc

# 확인 후 다시 main으로 돌아오기
git checkout main
```

### 방법 2: 새 브랜치로 복원
```bash
# 특정 버전에서 새 브랜치 생성
git checkout -b restore-from-v1.0 v1.0-stable-toc

# 작업 후 main에 병합
git checkout main
git merge restore-from-v1.0
git push
```

### 방법 3: 강제 롤백 (주의!)
```bash
# 현재 작업 백업 (선택사항)
git stash

# main 브랜치를 특정 버전으로 되돌리기
git checkout main
git reset --hard v1.0-stable-toc

# 강제 푸시 (경고: 이후 커밋이 모두 삭제됩니다!)
git push origin main --force
```

> ⚠️ **경고**: `--force` 푸시는 협업 시 문제를 일으킬 수 있으니 신중하게 사용하세요.

---

## 📋 배포 이력 확인

### Git 태그 목록 보기
```bash
git tag -l
```

### 특정 버전 상세 정보
```bash
git show v1.0-stable-toc
```

### 두 버전 간 차이 확인
```bash
git diff v1.0-stable-toc v1.1-feature-name
```

---

## 🔍 배포 상태 확인

### 현재 배포된 버전 확인
```bash
git describe --tags
```

### GitHub Pages 배포 상태
- GitHub 저장소 > Actions 탭에서 배포 진행 상황 확인
- 배포 완료 후 약 1-2분 내에 반영됨

---

## 📝 체크리스트

### 배포 전 확인사항
- [ ] 모든 변경사항이 커밋되었는가?
- [ ] 로컬에서 테스트가 완료되었는가?
- [ ] 릴리즈 노트가 작성되었는가?
- [ ] 버전 번호가 올바른가?

### 배포 후 확인사항
- [ ] GitHub Actions 배포가 성공했는가?
- [ ] 라이브 사이트에서 변경사항이 반영되었는가?
- [ ] 주요 기능이 정상 작동하는가?
- [ ] 모바일/데스크탑 모두 확인했는가?
