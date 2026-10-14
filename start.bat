@echo off
title StudyTrack - Student Daily To-Do List & Productivity Tracker
echo ========================================================
echo   StudyTrack - Student Daily To-Do List & Productivity Tracker
echo ========================================================
echo Starting StudyTrack application server...

:: Navigate to project root directory
cd /d "%~dp0"

:: Check if build exists, if not build it
if not exist "client\dist" (
    echo Building frontend for the first time...
    cd client && call npm run build && cd ..
)

echo Starting server on http://localhost:5000...
start "" http://localhost:5000
node server\index.js
