# VERA Environmental Awareness Installer Embedded
param([switch]$Install, [switch]$Uninstall, [string]$InstallPath)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$appName = "VERA Environmental Awareness"
$appVersion = "2.0.0"
$defaultInstallPath = "$env:ProgramFiles\VERA Environmental Awareness"

if ($InstallPath) {
    $installDir = $InstallPath
} else {
    $installDir = $defaultInstallPath
}

function Show-WelcomeDialog {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "VERA Environmental Awareness Installer"
    $form.Size = New-Object System.Drawing.Size(500, 350)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    
    # Logo/Icon area
    $logoLabel = New-Object System.Windows.Forms.Label
    $logoLabel.Text = "ðŸŒ± VERA"
    $logoLabel.Font = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
    $logoLabel.ForeColor = [System.Drawing.Color]::Green
    $logoLabel.Size = New-Object System.Drawing.Size(150, 50)
    $logoLabel.Location = New-Object System.Drawing.Point(175, 20)
    $logoLabel.TextAlign = "MiddleCenter"
    $form.Controls.Add($logoLabel)
    
    # Title
    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Text = "Environmental Awareness Application"
    $titleLabel.Font = New-Object System.Drawing.Font("Arial", 12)
    $titleLabel.Size = New-Object System.Drawing.Size(400, 25)
    $titleLabel.Location = New-Object System.Drawing.Point(50, 80)
    $titleLabel.TextAlign = "MiddleCenter"
    $form.Controls.Add($titleLabel)
    
    # Version
    $versionLabel = New-Object System.Windows.Forms.Label
    $versionLabel.Text = "Versione $appVersion"
    $versionLabel.Size = New-Object System.Drawing.Size(400, 20)
    $versionLabel.Location = New-Object System.Drawing.Point(50, 110)
    $versionLabel.TextAlign = "MiddleCenter"
    $form.Controls.Add($versionLabel)
    
    # Description
    $descLabel = New-Object System.Windows.Forms.Label
    $descLabel.Text = "VERA Ã¨ un'applicazione per il monitoraggio ambientale e il risparmio energetico.
Aiuta a ridurre l'impatto ambientale attraverso il monitoraggio intelligente."
    $descLabel.Size = New-Object System.Drawing.Size(400, 60)
    $descLabel.Location = New-Object System.Drawing.Point(50, 140)
    $descLabel.TextAlign = "MiddleCenter"
    $form.Controls.Add($descLabel)
    
    # Install path
    $pathLabel = New-Object System.Windows.Forms.Label
    $pathLabel.Text = "Directory di installazione:"
    $pathLabel.Size = New-Object System.Drawing.Size(150, 20)
    $pathLabel.Location = New-Object System.Drawing.Point(50, 220)
    $form.Controls.Add($pathLabel)
    
    $pathTextBox = New-Object System.Windows.Forms.TextBox
    $pathTextBox.Text = $installDir
    $pathTextBox.Size = New-Object System.Drawing.Size(300, 20)
    $pathTextBox.Location = New-Object System.Drawing.Point(50, 245)
    $form.Controls.Add($pathTextBox)
    
    $browseButton = New-Object System.Windows.Forms.Button
    $browseButton.Text = "Sfoglia..."
    $browseButton.Size = New-Object System.Drawing.Size(80, 25)
    $browseButton.Location = New-Object System.Drawing.Point(360, 243)
    $browseButton.Add_Click({
        $folderDialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $folderDialog.Description = "Seleziona directory di installazione"
        $folderDialog.SelectedPath = $pathTextBox.Text
        if ($folderDialog.ShowDialog() -eq "OK") {
            $pathTextBox.Text = $folderDialog.SelectedPath + "\VERA Environmental Awareness"
        }
    })
    $form.Controls.Add($browseButton)
    
    # Buttons
    $installButton = New-Object System.Windows.Forms.Button
    $installButton.Text = "Installa"
    $installButton.Size = New-Object System.Drawing.Size(100, 30)
    $installButton.Location = New-Object System.Drawing.Point(150, 280)
    $installButton.BackColor = [System.Drawing.Color]::LightGreen
    $installButton.Add_Click({
        $form.Tag = $pathTextBox.Text
        $form.DialogResult = "OK"
        $form.Close()
    })
    $form.Controls.Add($installButton)
    
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Annulla"
    $cancelButton.Size = New-Object System.Drawing.Size(100, 30)
    $cancelButton.Location = New-Object System.Drawing.Point(260, 280)
    $cancelButton.Add_Click({
        $form.DialogResult = "Cancel"
        $form.Close()
    })
    $form.Controls.Add($cancelButton)
    
    $form.AcceptButton = $installButton
    $form.CancelButton = $cancelButton
    
    return $form.ShowDialog()
}

function Install-VERA {
    param([string]$targetPath)
    
    try {
        # Progress form
        $progressForm = New-Object System.Windows.Forms.Form
        $progressForm.Text = "Installazione in corso..."
        $progressForm.Size = New-Object System.Drawing.Size(400, 120)
        $progressForm.StartPosition = "CenterScreen"
        $progressForm.FormBorderStyle = "FixedDialog"
        $progressForm.ControlBox = $false
        
        $progressLabel = New-Object System.Windows.Forms.Label
        $progressLabel.Text = "Installazione di VERA Environmental Awareness..."
        $progressLabel.Size = New-Object System.Drawing.Size(350, 20)
        $progressLabel.Location = New-Object System.Drawing.Point(25, 20)
        $progressForm.Controls.Add($progressLabel)
        
        $progressBar = New-Object System.Windows.Forms.ProgressBar
        $progressBar.Size = New-Object System.Drawing.Size(350, 20)
        $progressBar.Location = New-Object System.Drawing.Point(25, 50)
        $progressBar.Minimum = 0
        $progressBar.Maximum = 100
        $progressForm.Controls.Add($progressBar)
        
        $progressForm.Show()
        $progressForm.Refresh()
        
        # Step 1: Create directory
        $progressLabel.Text = "Creazione directory di installazione..."
        $progressBar.Value = 20
        $progressForm.Refresh()
        
        if (!(Test-Path $targetPath)) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        }
        Start-Sleep -Milliseconds 500
        
        # Step 2: Extract and copy files
        $progressLabel.Text = "Copia dei file dell'applicazione..."
        $progressBar.Value = 40
        $progressForm.Refresh()
        
        # Here we would extract the embedded files
        # For this demo, we copy from the source directory
        $sourceFiles = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness\installer-build"
        if (Test-Path $sourceFiles) {
            Copy-Item "$sourceFiles\*" -Destination $targetPath -Recurse -Force
        }
        Start-Sleep -Milliseconds 1000
        
        # Step 3: Create shortcuts
        $progressLabel.Text = "Creazione collegamenti..."
        $progressBar.Value = 70
        $progressForm.Refresh()
        
        $WshShell = New-Object -comObject WScript.Shell
        
        # Desktop shortcut
        $desktopShortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\VERA Environmental Awareness.lnk")
        $desktopShortcut.TargetPath = "$targetPath\start-vera.bat"
        $desktopShortcut.WorkingDirectory = $targetPath
        $desktopShortcut.Description = "VERA Environmental Awareness"
        $desktopShortcut.Save()
        
        # Start menu shortcut
        $startMenuShortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\VERA Environmental Awareness.lnk")
        $startMenuShortcut.TargetPath = "$targetPath\start-vera.bat"
        $startMenuShortcut.WorkingDirectory = $targetPath
        $startMenuShortcut.Description = "VERA Environmental Awareness"
        $startMenuShortcut.Save()
        
        Start-Sleep -Milliseconds 500
        
        # Step 4: Finalize
        $progressLabel.Text = "Finalizzazione installazione..."
        $progressBar.Value = 100
        $progressForm.Refresh()
        Start-Sleep -Milliseconds 500
        
        $progressForm.Close()
        
        # Success message
        $result = [System.Windows.Forms.MessageBox]::Show(
            "VERA Environmental Awareness Ã¨ stato installato con successo!

Directory: $targetPath

Vuoi avviare l'applicazione ora?",
            "Installazione completata",
            "YesNo",
            "Information"
        )
        
        if ($result -eq "Yes") {
            Start-Process "$targetPath\start-vera.bat"
        }
        
        return $true
        
    } catch {
        [System.Windows.Forms.MessageBox]::Show(
            "Errore durante l'installazione:

$($_.Exception.Message)",
            "Errore",
            "OK",
            "Error"
        )
        return $false
    }
}

# Main execution
if ($Uninstall) {
    # Uninstall logic here
    Write-Host "Funzione di disinstallazione non ancora implementata"
} else {
    # Install
    if ($Install -or (-not $Install -and -not $Uninstall)) {
        $result = Show-WelcomeDialog
        if ($result -eq "OK" -and $form.Tag) {
            Install-VERA $form.Tag
        } else {
            Write-Host "Installazione annullata dall'utente."
        }
    }
}
