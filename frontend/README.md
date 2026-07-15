# Busan LocalHub Frontend

Vue 3 + Vite 프론트엔드입니다.

## 실행

백엔드를 먼저 실행합니다.

```bash
cd ../backend
uvicorn app.main:app --port 8000
```

프론트엔드를 실행합니다.

```bash
cd ../frontend
npm install
npm run dev
```

Git Bash에서 바로 실행:

```bash
cd /c/Users/SSAFY/Desktop/busanproject/frontend
npm.cmd run dev
```

접속 주소:

```text
http://127.0.0.1:5173/
```

## 재시작

실행 중인 터미널에서 `Ctrl + C`로 종료한 뒤 다시 실행합니다.

```bash
npm.cmd run dev
```

## 포트 충돌 해결

5173번 포트가 이미 사용 중이면 PID를 확인합니다.

```powershell
netstat -ano | findstr :5173
```

`LISTENING` 줄 맨 오른쪽 PID를 종료합니다.

```powershell
taskkill /PID PID번호 /F
```

또는 다른 포트로 실행합니다.

```bash
npm.cmd run dev -- --port 5174
```

이 경우 접속 주소:

```text
http://127.0.0.1:5174/
```

## 빌드

```bash
npm run build
```

## 환경변수

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```
