@echo off
title VERA Environmental Awareness Installer v2.0.0

echo.
echo ==========================================
echo   VERA Environmental Awareness v2.0.0
echo   Installer Finale
echo ==========================================
echo.

echo Avvio installer...
powershell -ExecutionPolicy Bypass -File "%~dp0VERA-Installer-Final.ps1" -Install

if errorlevel 1 (
    echo.
    echo Errore nell'installer. Premere un tasto per uscire.
    pause >nul
)
