@echo off
echo ==========================================
echo   VERA Environmental Awareness
echo   Disinstallazione v2.0.0
echo ==========================================
echo.

set "INSTALL_DIR=%ProgramFiles%\VERA Environmental Awareness"

echo Rimozione collegamenti...
del "%USERPROFILE%\Desktop\VERA Environmental Awareness.lnk" 2>nul
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\VERA Environmental Awareness.lnk" 2>nul

echo Arresto di eventuali processi in esecuzione...
taskkill /f /im node.exe 2>nul

echo Rimozione directory di installazione...
if exist "%INSTALL_DIR%" (
    rmdir /s /q "%INSTALL_DIR%"
    echo Directory rimossa: %INSTALL_DIR%
) else (
    echo Directory non trovata: %INSTALL_DIR%
)

echo.
echo ==========================================
echo   Disinstallazione completata!
echo ==========================================
echo.
pause
