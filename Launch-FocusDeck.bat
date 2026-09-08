@echo off
title FocusDeck Launcher
cd /d "%~dp0"
echo Starting FocusDeck...
start /b cmd /c "npm run dev -- --host --port 5173"
timeout /t 2 /nobreak >nul
start msedge --app=http://localhost:5173/ || start chrome --app=http://localhost:5173/ || start http://localhost:5173/
exit
