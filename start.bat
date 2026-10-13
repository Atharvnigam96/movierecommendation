@echo off
title CineMatch - Starting All Services
echo ===================================================
echo           CineMatch Movie Recommender
echo ===================================================
echo.

echo [1/3] Starting Python ML Service (port 8000)...
start "CineMatch - ML Engine (:8000)" cmd /k "cd /d "%~dp0ML" && python ml_service.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Express Backend Server (port 5000)...
start "CineMatch - Backend (:5000)" cmd /k "cd /d "%~dp0backend" && node src/server.js"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Vite Frontend (:5173)...
start "CineMatch - Frontend (:5173)" cmd /k "cd /d "%~dp0" && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ===================================================
echo All services launched!
echo Opening browser at http://localhost:5173 ...
echo ===================================================
start http://localhost:5173

pause
