@echo off
title VERA Environmental Awareness - Disinstaller v1.0
echo ===============================================
echo  VERA Environmental Awareness - Disinstaller
echo ===============================================
echo.
echo Disinstallazione di VERA Environmental Awareness...
echo.

set "INSTALL_DIR=%ProgramFiles%\VERA-Environmental"
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"
set "DESKTOP=%USERPROFILE%\Desktop"

REM Termina il processo se in esecuzione
tasklist /FI "IMAGENAME eq vera.exe" 2>NUL | find /I /N "vera.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Terminazione del processo VERA in corso...
    taskkill /F /IM vera.exe >nul 2>&1
)

REM Rimuove i file dal menu Start
if exist "%START_MENU%\VERA Environmental Awareness.bat" (
    del "%START_MENU%\VERA Environmental Awareness.bat"
    echo Collegamento Menu Start rimosso.
)

REM Rimuove il collegamento dal desktop
if exist "%DESKTOP%\VERA Environmental Awareness.bat" (
    del "%DESKTOP%\VERA Environmental Awareness.bat"
    echo Collegamento Desktop rimosso.
)

REM Rimuove la directory di installazione
if exist "%INSTALL_DIR%" (
    rmdir /s /q "%INSTALL_DIR%"
    echo Directory di installazione rimossa.
)

echo.
echo ========================================
echo  Disinstallazione completata con successo!
echo ========================================
echo.
echo VERA Environmental Awareness e' stato completamente rimosso dal sistema.
echo.
pause