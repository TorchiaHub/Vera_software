@echo off
title VERA Environmental Awareness Installer

echo ==========================================
echo   VERA Environmental Awareness v2.0.0
echo   Installer
echo ==========================================
echo.

echo Avvio installer grafico...
powershell -ExecutionPolicy Bypass -File "%~dp0installer-gui.ps1"

if errorlevel 1 (
    echo.
    echo Errore nell'installer grafico. Avvio installer alternativo...
    echo.
    pause
    call "%~dp0install.bat"
)
