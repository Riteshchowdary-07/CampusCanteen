@echo off
echo ===================================================
echo   Starting CampusCafe Smart Canteen Management
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Backend Server on http://127.0.0.1:8000...
start "CampusCafe Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend Server on http://localhost:3000...
start "CampusCafe Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo Both servers are running!
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:8000
echo.
