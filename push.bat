@echo off
chcp 65001 >nul
title Aura 博客一键发布工具
echo ======================================================
echo  Aura 博客一键自动同步与发布工具
echo ======================================================
echo.

echo [1/3] 正在检查 Git 目录信任...
git config --global --add safe.directory "%CD%"
git config --global --add safe.directory "C:/Users/77/Documents/Codex/2026-09-26/gou/outputs/minimal-blog"

echo [2/3] 正在自动打包所有新文章与修改...
git add .
git commit -m "update blog: %date% %time%" >nul 2>&1

echo [3/3] 正在推送到 GitHub 并触发 Cloudflare 自动上线...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 正在对齐 GitHub 与本地的历史版本 (首次同步)...
    git push origin main --force
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================
    echo  发布成功！
    echo Cloudflare 已收到更新，约 20 秒后线上即可看到最新内容！
    echo 你的网站: https://wlog-6cj.pages.dev
    echo ======================================================
) else (
    echo.
    echo ======================================================
    echo  推送遇到问题，请检查网络连接。
    echo ======================================================
)
echo.
pause
