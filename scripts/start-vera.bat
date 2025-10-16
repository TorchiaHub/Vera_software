@echo off
echo ========================================
echo    VERA Environmental Awareness App
echo ========================================
echo.
echo Avvio dell'applicazione VERA...
echo.

echo Avvio del server backend...
cd /d "%~dp0backend"
start /b cmd /c "npm start"

echo Attendo che il backend si avvii...
timeout /t 3 /nobreak >nul

echo Avvio del server frontend...
cd /d "%~dp0frontend"
start /b cmd /c "npx serve dist -s -p 5173"

echo Attendo che il frontend si avvii...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    VERA è ora in esecuzione!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Aprendo il browser...
start http://localhost:5173

echo.
echo Premi un tasto per chiudere l'applicazione...
pause >nul

echo.
echo Chiusura dell'applicazione...
taskkill /f /im node.exe >nul 2>&1
echo Applicazione chiusa.
pause