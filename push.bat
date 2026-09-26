@echo off
title Aura Blog Auto Publisher
echo ======================================================
echo  Aura Blog Auto Sync and Publish Tool
echo ======================================================
echo.

echo [1/3] Setting Git safe directory...
git config --global --add safe.directory "%CD%"
git config --global --add safe.directory "C:/Users/77/Documents/Codex/2026-09-26/gou/outputs/minimal-blog"

echo [2/3] Staging and committing local changes...
git add .
git commit -m "update blog: %date% %time%" >nul 2>&1

echo [3/3] Pushing to GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo First-time sync detected. Aligning remote with local...
    git push origin main --force
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================
    echo  SUCCESS: Blog published successfully!
    echo  Cloudflare will automatically deploy your site in ~20s.
    echo  Your site: https://wlog-6cj.pages.dev
    echo ======================================================
) else (
    echo.
    echo ======================================================
    echo  FAILED: Push encountered an error.
    echo  Please check your network connection.
    echo ======================================================
)
echo.
pause
