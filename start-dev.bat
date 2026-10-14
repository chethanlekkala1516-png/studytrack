@echo off
title StudyTrack - Student Daily To-Do List & Productivity Tracker (Dev Mode)
echo ========================================================
echo   StudyTrack - Student Productivity Tracker (Dev Mode)
echo ========================================================
cd /d "%~dp0"

echo 1. Starting Express backend on http://localhost:5000...
start "StudyTrack Backend" cmd /k "cd /d "%~dp0server" && node index.js"

echo 2. Starting React Vite dev server on http://localhost:5173...
start "StudyTrack Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo Both frontend and backend are launching!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo If you close this launcher, the background windows remain active.
