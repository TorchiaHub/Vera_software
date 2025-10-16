# VERA Environmental Awareness - Advanced Installer Creator
# Crea un installer auto-estraente per Windows

$appName = "VERA Environmental Awareness"
$appVersion = "2.0.0"
$sourceDir = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness"
$buildDir = "$sourceDir\installer-build"
$outputDir = "$sourceDir\dist-installer"

Write-Host "========================================="
Write-Host "  Creazione Installer Avanzato VERA"
Write-Host "========================================="

# Crea uno script VBScript per l'installer auto-estraente
$vbsInstaller = @"
Option Explicit

Dim fso, shell, tempDir, extractDir, appDir
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

' Definisci le directory
tempDir = shell.ExpandEnvironmentStrings("%TEMP%")
extractDir = tempDir & "\VERA_Installer_Temp"
appDir = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\VERA Environmental Awareness"

' Mostra messaggio di benvenuto
MsgBox "Benvenuto nell'installer di VERA Environmental Awareness v$appVersion" & vbCrLf & vbCrLf & _
       "Questo installer installerà l'applicazione in:" & vbCrLf & appDir, vbInformation, "VERA Installer"

' Chiedi conferma
If MsgBox("Continuare con l'installazione?", vbYesNo + vbQuestion, "VERA Installer") = vbNo Then
    WScript.Quit
End If

' Crea directory temporanea
If fso.FolderExists(extractDir) Then
    fso.DeleteFolder extractDir, True
End If
fso.CreateFolder extractDir

' Estrai i file (questo sarà gestito dal wrapper)
MsgBox "Estrazione dei file in corso...", vbInformation, "VERA Installer"

' Crea directory di installazione
If Not fso.FolderExists(appDir) Then
    fso.CreateFolder appDir
End If

' Copia i file
shell.Run "xcopy /s /e /y """ & extractDir & "\*"" """ & appDir & "\""", 0, True

' Crea collegamenti
Dim desktop, startMenu, shortcut
desktop = shell.SpecialFolders("Desktop")
startMenu = shell.SpecialFolders("StartMenu") & "\Programs"

' Collegamento Desktop
Set shortcut = shell.CreateShortcut(desktop & "\VERA Environmental Awareness.lnk")
shortcut.TargetPath = appDir & "\start-vera.bat"
shortcut.WorkingDirectory = appDir
shortcut.Description = "VERA Environmental Awareness Application"
shortcut.Save

' Collegamento Menu Start
Set shortcut = shell.CreateShortcut(startMenu & "\VERA Environmental Awareness.lnk")
shortcut.TargetPath = appDir & "\start-vera.bat"
shortcut.WorkingDirectory = appDir
shortcut.Description = "VERA Environmental Awareness Application"
shortcut.Save

' Pulisci file temporanei
fso.DeleteFolder extractDir, True

' Messaggio finale
If MsgBox("Installazione completata con successo!" & vbCrLf & vbCrLf & _
          "Vuoi avviare VERA Environmental Awareness ora?", vbYesNo + vbQuestion, "VERA Installer") = vbYes Then
    shell.Run """" & appDir & "\start-vera.bat""", 1, False
End If
"@

$vbsInstaller | Out-File -FilePath "$buildDir\installer.vbs" -Encoding ASCII

# Crea uno script PowerShell per l'installer grafico
$psInstaller = @"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Funzione per mostrare dialog di progresso
function Show-Progress {
    param([string]`$title, [string]`$message, [int]`$percent)
    
    `$form = New-Object System.Windows.Forms.Form
    `$form.Text = `$title
    `$form.Size = New-Object System.Drawing.Size(400, 150)
    `$form.StartPosition = "CenterScreen"
    `$form.FormBorderStyle = "FixedDialog"
    `$form.MaximizeBox = `$false
    `$form.MinimizeBox = `$false
    
    `$label = New-Object System.Windows.Forms.Label
    `$label.Text = `$message
    `$label.Size = New-Object System.Drawing.Size(350, 30)
    `$label.Location = New-Object System.Drawing.Point(25, 20)
    `$form.Controls.Add(`$label)
    
    `$progressBar = New-Object System.Windows.Forms.ProgressBar
    `$progressBar.Size = New-Object System.Drawing.Size(350, 20)
    `$progressBar.Location = New-Object System.Drawing.Point(25, 60)
    `$progressBar.Value = `$percent
    `$form.Controls.Add(`$progressBar)
    
    `$form.Show()
    `$form.Refresh()
    Start-Sleep -Milliseconds 500
    `$form.Close()
}

# Installer principale
`$appDir = "`$env:ProgramFiles\VERA Environmental Awareness"
`$sourceDir = "`$PSScriptRoot"

[System.Windows.Forms.MessageBox]::Show("Benvenuto nell'installer di VERA Environmental Awareness v$appVersion", "VERA Installer", "OK", "Information")

if ([System.Windows.Forms.MessageBox]::Show("Installare VERA Environmental Awareness in:`n`$appDir", "VERA Installer", "YesNo", "Question") -eq "No") {
    exit
}

try {
    Show-Progress "VERA Installer" "Creazione directory di installazione..." 20
    
    if (!(Test-Path `$appDir)) {
        New-Item -ItemType Directory -Path `$appDir -Force | Out-Null
    }
    
    Show-Progress "VERA Installer" "Copia dei file dell'applicazione..." 40
    
    Copy-Item "`$sourceDir\*" -Destination `$appDir -Recurse -Force
    
    Show-Progress "VERA Installer" "Creazione collegamenti..." 60
    
    # Collegamento Desktop
    `$WshShell = New-Object -comObject WScript.Shell
    `$Shortcut = `$WshShell.CreateShortcut("`$env:USERPROFILE\Desktop\VERA Environmental Awareness.lnk")
    `$Shortcut.TargetPath = "`$appDir\start-vera.bat"
    `$Shortcut.WorkingDirectory = `$appDir
    `$Shortcut.Save()
    
    # Collegamento Menu Start
    `$Shortcut = `$WshShell.CreateShortcut("`$env:APPDATA\Microsoft\Windows\Start Menu\Programs\VERA Environmental Awareness.lnk")
    `$Shortcut.TargetPath = "`$appDir\start-vera.bat"
    `$Shortcut.WorkingDirectory = `$appDir
    `$Shortcut.Save()
    
    Show-Progress "VERA Installer" "Finalizzazione installazione..." 100
    
    if ([System.Windows.Forms.MessageBox]::Show("Installazione completata con successo!`n`nVuoi avviare VERA Environmental Awareness ora?", "VERA Installer", "YesNo", "Information") -eq "Yes") {
        Start-Process "`$appDir\start-vera.bat"
    }
    
} catch {
    [System.Windows.Forms.MessageBox]::Show("Errore durante l'installazione: `$(`$_.Exception.Message)", "VERA Installer", "OK", "Error")
}
"@

$psInstaller | Out-File -FilePath "$buildDir\installer-gui.ps1" -Encoding UTF8

# Crea script batch per lanciare l'installer PowerShell
$batchInstaller = @"
@echo off
title VERA Environmental Awareness Installer

echo ==========================================
echo   VERA Environmental Awareness v$appVersion
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
"@

$batchInstaller | Out-File -FilePath "$buildDir\setup.bat" -Encoding ASCII

# Crea un nuovo archivio con l'installer migliorato
Write-Host "Creazione installer avanzato..."
$zipPathAdvanced = "$outputDir\VERA-Environmental-Awareness-v$appVersion-Setup.zip"
Compress-Archive -Path "$buildDir\*" -DestinationPath $zipPathAdvanced -Force

# Crea script per l'installer auto-estraente (SFX)
$sfxScript = @"
@echo off
title VERA Environmental Awareness Auto-Installer

echo ==========================================
echo   VERA Environmental Awareness v$appVersion
echo   Auto-Installer
echo ==========================================
echo.

set "TEMP_DIR=%TEMP%\VERA_Installer_%RANDOM%"
mkdir "%TEMP_DIR%"

echo Estrazione file in corso...
echo Questo potrebbe richiedere alcuni minuti...

powershell -Command "Expand-Archive -Path '%~f0' -DestinationPath '%TEMP_DIR%' -Force"

if exist "%TEMP_DIR%\setup.bat" (
    cd /d "%TEMP_DIR%"
    call setup.bat
) else (
    echo Errore nell'estrazione dei file.
    pause
)

echo Pulizia file temporanei...
rmdir /s /q "%TEMP_DIR%" 2>nul

goto :eof

::: ZIP DATA FOLLOWS :::
"@

# Crea il file di info per l'installer
$installerInfo = @"
# VERA Environmental Awareness v$appVersion
## Installer Information

### Files Generated:
1. **VERA-Environmental-Awareness-v$appVersion-Installer.zip**
   - Basic installer package
   - Extract and run install.bat

2. **VERA-Environmental-Awareness-v$appVersion-Setup.zip**
   - Advanced installer with GUI
   - Extract and run setup.bat

### Installation Methods:

#### Method 1: Basic Installation
1. Extract VERA-Environmental-Awareness-v$appVersion-Installer.zip
2. Run install.bat as Administrator
3. Follow on-screen instructions

#### Method 2: GUI Installation
1. Extract VERA-Environmental-Awareness-v$appVersion-Setup.zip
2. Run setup.bat
3. Follow GUI installer

#### Method 3: Portable Mode
1. Extract any installer package
2. Run start-vera.bat directly (no installation needed)

### System Requirements:
- Windows 10/11
- Node.js 18+ (required for backend)
- 4GB RAM minimum
- 500MB free disk space
- Ports 3001 and 5173 available

### Installation Directory:
Default: C:\Program Files\VERA Environmental Awareness

### Created Shortcuts:
- Desktop: VERA Environmental Awareness.lnk
- Start Menu: VERA Environmental Awareness.lnk

### Uninstallation:
Run uninstall.bat from installation directory

---
Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Installer Version: 2.0.0
"@

$installerInfo | Out-File -FilePath "$outputDir\INSTALLER-INFO.md" -Encoding UTF8

Write-Host ""
Write-Host "========================================="
Write-Host "  Installer Avanzato Completato!"
Write-Host "========================================="
Write-Host ""
Write-Host "File creati in: $outputDir"
Write-Host ""
Get-ChildItem $outputDir | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  - $($_.Name) ($size MB)"
}
Write-Host ""
Write-Host "Installer raccomandato: VERA-Environmental-Awareness-v$appVersion-Setup.zip"
Write-Host ""