@echo off
title VERA Environmental Awareness - Installer v1.0
echo ===============================================
echo    VERA Environmental Awareness - Installer
echo ===============================================
echo.
echo Installazione di VERA Environmental Awareness...
echo.

REM Crea la directory di installazione
set "INSTALL_DIR=%ProgramFiles%\VERA-Environmental"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copia l'eseguibile
copy "vera.exe" "%INSTALL_DIR%\vera.exe" >nul
if %errorlevel% neq 0 (
    echo ERRORE: Impossibile copiare il file eseguibile.
    pause
    exit /b 1
)

REM Crea il collegamento nel menu Start
set "START_MENU=%ProgramData%\Microsoft\Windows\Start Menu\Programs"
if not exist "%START_MENU%" mkdir "%START_MENU%"

REM Crea un file batch per avviare l'applicazione
echo @echo off > "%START_MENU%\VERA Environmental Awareness.bat"
echo cd /d "%INSTALL_DIR%" >> "%START_MENU%\VERA Environmental Awareness.bat"
echo start "" "vera.exe" >> "%START_MENU%\VERA Environmental Awareness.bat"

REM Crea collegamento sul desktop
set "DESKTOP=%USERPROFILE%\Desktop"
copy "%START_MENU%\VERA Environmental Awareness.bat" "%DESKTOP%\VERA Environmental Awareness.bat" >nul

echo.
echo ========================================
echo   Installazione completata con successo!
echo ========================================
echo.
echo VERA Environmental Awareness e' stato installato in:
echo %INSTALL_DIR%
echo.
echo Puoi avviare l'applicazione da:
echo - Menu Start ^> VERA Environmental Awareness
echo - Desktop ^> VERA Environmental Awareness
echo.
echo Premi un tasto per continuare...
pause >nul