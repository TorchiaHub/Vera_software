# VERA Environmental Awareness - Installer Builder
# Questo script crea un installer per l'applicazione VERA

$appName = "VERA Environmental Awareness"
$appVersion = "2.0.0"
$sourceDir = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness"
$buildDir = "$sourceDir\installer-build"
$outputDir = "$sourceDir\dist-installer"

Write-Host "========================================="
Write-Host "  VERA Environmental Awareness Installer"
Write-Host "  Versione: $appVersion"
Write-Host "========================================="
Write-Host ""

# Crea le directory di build
Write-Host "Creazione directory di build..."
if (Test-Path $buildDir) { Remove-Item $buildDir -Recurse -Force }
if (Test-Path $outputDir) { Remove-Item $outputDir -Recurse -Force }
New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

# Copia i file dell'applicazione
Write-Host "Copia dei file dell'applicazione..."
Copy-Item "$sourceDir\frontend\dist" -Destination "$buildDir\frontend" -Recurse
Copy-Item "$sourceDir\backend\dist" -Destination "$buildDir\backend" -Recurse
Copy-Item "$sourceDir\backend\package.json" -Destination "$buildDir\backend\"
Copy-Item "$sourceDir\package.json" -Destination "$buildDir\"

# Copia gli script di avvio
Copy-Item "$sourceDir\start-vera.bat" -Destination "$buildDir\"
Copy-Item "$sourceDir\start-vera.ps1" -Destination "$buildDir\"
Copy-Item "$sourceDir\README-EXECUTION.md" -Destination "$buildDir\"

# Crea script di installazione
$installScript = @"
@echo off
echo ==========================================
echo   VERA Environmental Awareness
echo   Installazione v$appVersion
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
powershell -Command "& {`$WshShell = New-Object -comObject WScript.Shell; `$Shortcut = `$WshShell.CreateShortcut('%USERPROFILE%\Desktop\VERA Environmental Awareness.lnk'); `$Shortcut.TargetPath = '%INSTALL_DIR%\start-vera.bat'; `$Shortcut.WorkingDirectory = '%INSTALL_DIR%'; `$Shortcut.IconLocation = '%INSTALL_DIR%\vera-icon.ico'; `$Shortcut.Save()}"

echo Creazione collegamento nel menu Start...
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
powershell -Command "& {`$WshShell = New-Object -comObject WScript.Shell; `$Shortcut = `$WshShell.CreateShortcut('%START_MENU%\VERA Environmental Awareness.lnk'); `$Shortcut.TargetPath = '%INSTALL_DIR%\start-vera.bat'; `$Shortcut.WorkingDirectory = '%INSTALL_DIR%'; `$Shortcut.IconLocation = '%INSTALL_DIR%\vera-icon.ico'; `$Shortcut.Save()}"

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
"@

$installScript | Out-File -FilePath "$buildDir\install.bat" -Encoding ASCII

# Crea script di disinstallazione
$uninstallScript = @"
@echo off
echo ==========================================
echo   VERA Environmental Awareness
echo   Disinstallazione v$appVersion
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
"@

$uninstallScript | Out-File -FilePath "$buildDir\uninstall.bat" -Encoding ASCII

# Crea un'icona semplice per l'installer
$iconScript = @"
Add-Type -AssemblyName System.Drawing
`$bitmap = New-Object System.Drawing.Bitmap(32, 32)
`$graphics = [System.Drawing.Graphics]::FromImage(`$bitmap)
`$greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 139, 34))
`$graphics.FillEllipse(`$greenBrush, 2, 2, 28, 28)
`$font = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
`$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
`$graphics.DrawString("V", `$font, `$whiteBrush, 8, 6)
`$bitmap.Save("$buildDir\vera-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
`$graphics.Dispose()
`$bitmap.Dispose()
`$greenBrush.Dispose()
`$whiteBrush.Dispose()
`$font.Dispose()
"@

Invoke-Expression $iconScript

# Crea README per l'installer
$readmeContent = @"
# VERA Environmental Awareness v$appVersion
## Installer Package

### Contenuto del Package:
- frontend/: Applicazione web front-end (build di produzione)
- backend/: Server API back-end (build di produzione)
- start-vera.bat: Script di avvio per Windows Command Prompt
- start-vera.ps1: Script di avvio per PowerShell
- install.bat: Script di installazione automatica
- uninstall.bat: Script di disinstallazione
- README-EXECUTION.md: Guida all'utilizzo

### Installazione:
1. Esegui 'install.bat' come Amministratore
2. L'applicazione verrà installata in Program Files
3. Verranno creati collegamenti sul Desktop e nel Menu Start

### Avvio Manuale:
1. Esegui 'start-vera.bat' o 'start-vera.ps1'
2. L'applicazione si aprirà automaticamente nel browser
3. Frontend: http://localhost:5173
4. Backend: http://localhost:3001

### Requisiti:
- Windows 10/11
- Node.js 18+ installato
- Porte 3001 e 5173 libere

### Disinstallazione:
Esegui 'uninstall.bat' dalla directory di installazione
oppure usa lo script nella directory di installazione.

---
VERA Environmental Awareness Team
Build: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$readmeContent | Out-File -FilePath "$buildDir\README.txt" -Encoding UTF8

# Crea archivio ZIP dell'installer
Write-Host "Creazione archivio installer..."
$zipPath = "$outputDir\VERA-Environmental-Awareness-v$appVersion-Installer.zip"
Compress-Archive -Path "$buildDir\*" -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "========================================="
Write-Host "  Installer creato con successo!"
Write-Host "========================================="
Write-Host ""
Write-Host "Installer Package: $zipPath"
Write-Host "Dimensione: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB"
Write-Host ""
Write-Host "Per installare:"
Write-Host "1. Estrai il file ZIP"
Write-Host "2. Esegui 'install.bat' come Amministratore"
Write-Host ""
Write-Host "Per test rapido:"
Write-Host "1. Estrai il file ZIP"
Write-Host "2. Esegui 'start-vera.bat'"
Write-Host ""