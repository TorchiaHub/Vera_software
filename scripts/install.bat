@echo off
echo ==========================================
echo   VERA Environmental Awareness
echo   Installazione v2.0.0
echo ==========================================
echo.

set "INSTALL_DIR=%ProgramFiles%\VERA Environmental Awareness"
echo Installazione in: %INSTALL_DIR%
echo.

echo Creazione directory di installazione...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Copia dei file...
xcopy /s /e /y "%~dp0\*" "%INSTALL_DIR%\" >nul

echo Creazione collegamenti sul desktop...
powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\VERA Environmental Awareness.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\start-vera.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\vera-icon.ico'; $Shortcut.Save()}"

echo Creazione collegamento nel menu Start...
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_MENU%\VERA Environmental Awareness.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\start-vera.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\vera-icon.ico'; $Shortcut.Save()}"

echo.
echo ==========================================
echo   Installazione completata!
echo ==========================================
echo.
echo L'applicazione VERA e' stata installata in:
echo %INSTALL_DIR%
echo.
echo Puoi avviarla da:
echo - Desktop: VERA Environmental Awareness
echo - Menu Start: VERA Environmental Awareness
echo - Directory: %INSTALL_DIR%\start-vera.bat
echo.
pause
