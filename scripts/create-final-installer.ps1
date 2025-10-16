# VERA Environmental Awareness - Final Installer Creator
# Crea un installer eseguibile completo

$appName = "VERA Environmental Awareness"
$appVersion = "2.0.0"
$sourceDir = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness"
$buildDir = "$sourceDir\installer-build"
$outputDir = "$sourceDir\dist-installer"

Write-Host "========================================="
Write-Host "  VERA Installer Finale - v$appVersion"
Write-Host "========================================="

# Crea uno script PowerShell embedde come installer eseguibile
$finalInstaller = @"
# VERA Environmental Awareness Installer Embedded
param([switch]`$Install, [switch]`$Uninstall, [string]`$InstallPath)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

`$appName = "VERA Environmental Awareness"
`$appVersion = "2.0.0"
`$defaultInstallPath = "`$env:ProgramFiles\VERA Environmental Awareness"

if (`$InstallPath) {
    `$installDir = `$InstallPath
} else {
    `$installDir = `$defaultInstallPath
}

function Show-WelcomeDialog {
    `$form = New-Object System.Windows.Forms.Form
    `$form.Text = "VERA Environmental Awareness Installer"
    `$form.Size = New-Object System.Drawing.Size(500, 350)
    `$form.StartPosition = "CenterScreen"
    `$form.FormBorderStyle = "FixedDialog"
    `$form.MaximizeBox = `$false
    `$form.MinimizeBox = `$false
    
    # Logo/Icon area
    `$logoLabel = New-Object System.Windows.Forms.Label
    `$logoLabel.Text = "🌱 VERA"
    `$logoLabel.Font = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
    `$logoLabel.ForeColor = [System.Drawing.Color]::Green
    `$logoLabel.Size = New-Object System.Drawing.Size(150, 50)
    `$logoLabel.Location = New-Object System.Drawing.Point(175, 20)
    `$logoLabel.TextAlign = "MiddleCenter"
    `$form.Controls.Add(`$logoLabel)
    
    # Title
    `$titleLabel = New-Object System.Windows.Forms.Label
    `$titleLabel.Text = "Environmental Awareness Application"
    `$titleLabel.Font = New-Object System.Drawing.Font("Arial", 12)
    `$titleLabel.Size = New-Object System.Drawing.Size(400, 25)
    `$titleLabel.Location = New-Object System.Drawing.Point(50, 80)
    `$titleLabel.TextAlign = "MiddleCenter"
    `$form.Controls.Add(`$titleLabel)
    
    # Version
    `$versionLabel = New-Object System.Windows.Forms.Label
    `$versionLabel.Text = "Versione `$appVersion"
    `$versionLabel.Size = New-Object System.Drawing.Size(400, 20)
    `$versionLabel.Location = New-Object System.Drawing.Point(50, 110)
    `$versionLabel.TextAlign = "MiddleCenter"
    `$form.Controls.Add(`$versionLabel)
    
    # Description
    `$descLabel = New-Object System.Windows.Forms.Label
    `$descLabel.Text = "VERA è un'applicazione per il monitoraggio ambientale e il risparmio energetico.`nAiuta a ridurre l'impatto ambientale attraverso il monitoraggio intelligente."
    `$descLabel.Size = New-Object System.Drawing.Size(400, 60)
    `$descLabel.Location = New-Object System.Drawing.Point(50, 140)
    `$descLabel.TextAlign = "MiddleCenter"
    `$form.Controls.Add(`$descLabel)
    
    # Install path
    `$pathLabel = New-Object System.Windows.Forms.Label
    `$pathLabel.Text = "Directory di installazione:"
    `$pathLabel.Size = New-Object System.Drawing.Size(150, 20)
    `$pathLabel.Location = New-Object System.Drawing.Point(50, 220)
    `$form.Controls.Add(`$pathLabel)
    
    `$pathTextBox = New-Object System.Windows.Forms.TextBox
    `$pathTextBox.Text = `$installDir
    `$pathTextBox.Size = New-Object System.Drawing.Size(300, 20)
    `$pathTextBox.Location = New-Object System.Drawing.Point(50, 245)
    `$form.Controls.Add(`$pathTextBox)
    
    `$browseButton = New-Object System.Windows.Forms.Button
    `$browseButton.Text = "Sfoglia..."
    `$browseButton.Size = New-Object System.Drawing.Size(80, 25)
    `$browseButton.Location = New-Object System.Drawing.Point(360, 243)
    `$browseButton.Add_Click({
        `$folderDialog = New-Object System.Windows.Forms.FolderBrowserDialog
        `$folderDialog.Description = "Seleziona directory di installazione"
        `$folderDialog.SelectedPath = `$pathTextBox.Text
        if (`$folderDialog.ShowDialog() -eq "OK") {
            `$pathTextBox.Text = `$folderDialog.SelectedPath + "\VERA Environmental Awareness"
        }
    })
    `$form.Controls.Add(`$browseButton)
    
    # Buttons
    `$installButton = New-Object System.Windows.Forms.Button
    `$installButton.Text = "Installa"
    `$installButton.Size = New-Object System.Drawing.Size(100, 30)
    `$installButton.Location = New-Object System.Drawing.Point(150, 280)
    `$installButton.BackColor = [System.Drawing.Color]::LightGreen
    `$installButton.Add_Click({
        `$form.Tag = `$pathTextBox.Text
        `$form.DialogResult = "OK"
        `$form.Close()
    })
    `$form.Controls.Add(`$installButton)
    
    `$cancelButton = New-Object System.Windows.Forms.Button
    `$cancelButton.Text = "Annulla"
    `$cancelButton.Size = New-Object System.Drawing.Size(100, 30)
    `$cancelButton.Location = New-Object System.Drawing.Point(260, 280)
    `$cancelButton.Add_Click({
        `$form.DialogResult = "Cancel"
        `$form.Close()
    })
    `$form.Controls.Add(`$cancelButton)
    
    `$form.AcceptButton = `$installButton
    `$form.CancelButton = `$cancelButton
    
    return `$form.ShowDialog()
}

function Install-VERA {
    param([string]`$targetPath)
    
    try {
        # Progress form
        `$progressForm = New-Object System.Windows.Forms.Form
        `$progressForm.Text = "Installazione in corso..."
        `$progressForm.Size = New-Object System.Drawing.Size(400, 120)
        `$progressForm.StartPosition = "CenterScreen"
        `$progressForm.FormBorderStyle = "FixedDialog"
        `$progressForm.ControlBox = `$false
        
        `$progressLabel = New-Object System.Windows.Forms.Label
        `$progressLabel.Text = "Installazione di VERA Environmental Awareness..."
        `$progressLabel.Size = New-Object System.Drawing.Size(350, 20)
        `$progressLabel.Location = New-Object System.Drawing.Point(25, 20)
        `$progressForm.Controls.Add(`$progressLabel)
        
        `$progressBar = New-Object System.Windows.Forms.ProgressBar
        `$progressBar.Size = New-Object System.Drawing.Size(350, 20)
        `$progressBar.Location = New-Object System.Drawing.Point(25, 50)
        `$progressBar.Minimum = 0
        `$progressBar.Maximum = 100
        `$progressForm.Controls.Add(`$progressBar)
        
        `$progressForm.Show()
        `$progressForm.Refresh()
        
        # Step 1: Create directory
        `$progressLabel.Text = "Creazione directory di installazione..."
        `$progressBar.Value = 20
        `$progressForm.Refresh()
        
        if (!(Test-Path `$targetPath)) {
            New-Item -ItemType Directory -Path `$targetPath -Force | Out-Null
        }
        Start-Sleep -Milliseconds 500
        
        # Step 2: Extract and copy files
        `$progressLabel.Text = "Copia dei file dell'applicazione..."
        `$progressBar.Value = 40
        `$progressForm.Refresh()
        
        # Here we would extract the embedded files
        # For this demo, we copy from the source directory
        `$sourceFiles = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness\installer-build"
        if (Test-Path `$sourceFiles) {
            Copy-Item "`$sourceFiles\*" -Destination `$targetPath -Recurse -Force
        }
        Start-Sleep -Milliseconds 1000
        
        # Step 3: Create shortcuts
        `$progressLabel.Text = "Creazione collegamenti..."
        `$progressBar.Value = 70
        `$progressForm.Refresh()
        
        `$WshShell = New-Object -comObject WScript.Shell
        
        # Desktop shortcut
        `$desktopShortcut = `$WshShell.CreateShortcut("`$env:USERPROFILE\Desktop\VERA Environmental Awareness.lnk")
        `$desktopShortcut.TargetPath = "`$targetPath\start-vera.bat"
        `$desktopShortcut.WorkingDirectory = `$targetPath
        `$desktopShortcut.Description = "VERA Environmental Awareness"
        `$desktopShortcut.Save()
        
        # Start menu shortcut
        `$startMenuShortcut = `$WshShell.CreateShortcut("`$env:APPDATA\Microsoft\Windows\Start Menu\Programs\VERA Environmental Awareness.lnk")
        `$startMenuShortcut.TargetPath = "`$targetPath\start-vera.bat"
        `$startMenuShortcut.WorkingDirectory = `$targetPath
        `$startMenuShortcut.Description = "VERA Environmental Awareness"
        `$startMenuShortcut.Save()
        
        Start-Sleep -Milliseconds 500
        
        # Step 4: Finalize
        `$progressLabel.Text = "Finalizzazione installazione..."
        `$progressBar.Value = 100
        `$progressForm.Refresh()
        Start-Sleep -Milliseconds 500
        
        `$progressForm.Close()
        
        # Success message
        `$result = [System.Windows.Forms.MessageBox]::Show(
            "VERA Environmental Awareness è stato installato con successo!`n`nDirectory: `$targetPath`n`nVuoi avviare l'applicazione ora?",
            "Installazione completata",
            "YesNo",
            "Information"
        )
        
        if (`$result -eq "Yes") {
            Start-Process "`$targetPath\start-vera.bat"
        }
        
        return `$true
        
    } catch {
        [System.Windows.Forms.MessageBox]::Show(
            "Errore durante l'installazione:`n`n`$(`$_.Exception.Message)",
            "Errore",
            "OK",
            "Error"
        )
        return `$false
    }
}

# Main execution
if (`$Uninstall) {
    # Uninstall logic here
    Write-Host "Funzione di disinstallazione non ancora implementata"
} else {
    # Install
    if (`$Install -or (-not `$Install -and -not `$Uninstall)) {
        `$result = Show-WelcomeDialog
        if (`$result -eq "OK" -and `$form.Tag) {
            Install-VERA `$form.Tag
        } else {
            Write-Host "Installazione annullata dall'utente."
        }
    }
}
"@

# Salva l'installer finale
$finalInstaller | Out-File -FilePath "$outputDir\VERA-Installer-Final.ps1" -Encoding UTF8

# Crea uno script batch per eseguire l'installer PowerShell
$finalBatch = @"
@echo off
title VERA Environmental Awareness Installer v$appVersion

echo.
echo ==========================================
echo   VERA Environmental Awareness v$appVersion
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
"@

$finalBatch | Out-File -FilePath "$outputDir\VERA-Setup-Final.bat" -Encoding ASCII

Write-Host ""
Write-Host "========================================="
Write-Host "  BUILD E INSTALLER COMPLETATO!"
Write-Host "========================================="
Write-Host ""
Write-Host "Directory output: $outputDir"
Write-Host ""
Write-Host "Installer creati:"
Get-ChildItem $outputDir | ForEach-Object {
    $size = if ($_.Length -gt 0) { [math]::Round($_.Length / 1KB, 1) } else { "0" }
    $icon = switch ($_.Extension) {
        ".zip" { "[ZIP]" }
        ".exe" { "[EXE]" }
        ".bat" { "[BAT]" }
        ".ps1" { "[PS1]" }
        ".md" { "[MD]" }
        default { "[FILE]" }
    }
    Write-Host "   $icon $($_.Name) ($size KB)"
}

Write-Host ""
Write-Host "Per installare VERA:"
Write-Host "   1. Esegui: VERA-Setup-Final.bat"
Write-Host "   2. Oppure: powershell -File VERA-Installer-Final.ps1 -Install"
Write-Host ""
Write-Host "Per test rapido:"
Write-Host "   1. Estrai: VERA-Environmental-Awareness-v$appVersion-Setup.zip"
Write-Host "   2. Esegui: start-vera.bat"
Write-Host ""
Write-Host "Build e Installer completati con successo!"
Write-Host ""