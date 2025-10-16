Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Funzione per mostrare dialog di progresso
function Show-Progress {
    param([string]$title, [string]$message, [int]$percent)
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = $title
    $form.Size = New-Object System.Drawing.Size(400, 150)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.MinimizeBox = $false
    
    $label = New-Object System.Windows.Forms.Label
    $label.Text = $message
    $label.Size = New-Object System.Drawing.Size(350, 30)
    $label.Location = New-Object System.Drawing.Point(25, 20)
    $form.Controls.Add($label)
    
    $progressBar = New-Object System.Windows.Forms.ProgressBar
    $progressBar.Size = New-Object System.Drawing.Size(350, 20)
    $progressBar.Location = New-Object System.Drawing.Point(25, 60)
    $progressBar.Value = $percent
    $form.Controls.Add($progressBar)
    
    $form.Show()
    $form.Refresh()
    Start-Sleep -Milliseconds 500
    $form.Close()
}

# Installer principale
$appDir = "$env:ProgramFiles\VERA Environmental Awareness"
$sourceDir = "$PSScriptRoot"

[System.Windows.Forms.MessageBox]::Show("Benvenuto nell'installer di VERA Environmental Awareness v2.0.0", "VERA Installer", "OK", "Information")

if ([System.Windows.Forms.MessageBox]::Show("Installare VERA Environmental Awareness in:
$appDir", "VERA Installer", "YesNo", "Question") -eq "No") {
    exit
}

try {
    Show-Progress "VERA Installer" "Creazione directory di installazione..." 20
    
    if (!(Test-Path $appDir)) {
        New-Item -ItemType Directory -Path $appDir -Force | Out-Null
    }
    
    Show-Progress "VERA Installer" "Copia dei file dell'applicazione..." 40
    
    Copy-Item "$sourceDir\*" -Destination $appDir -Recurse -Force
    
    Show-Progress "VERA Installer" "Creazione collegamenti..." 60
    
    # Collegamento Desktop
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\VERA Environmental Awareness.lnk")
    $Shortcut.TargetPath = "$appDir\start-vera.bat"
    $Shortcut.WorkingDirectory = $appDir
    $Shortcut.Save()
    
    # Collegamento Menu Start
    $Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\VERA Environmental Awareness.lnk")
    $Shortcut.TargetPath = "$appDir\start-vera.bat"
    $Shortcut.WorkingDirectory = $appDir
    $Shortcut.Save()
    
    Show-Progress "VERA Installer" "Finalizzazione installazione..." 100
    
    if ([System.Windows.Forms.MessageBox]::Show("Installazione completata con successo!

Vuoi avviare VERA Environmental Awareness ora?", "VERA Installer", "YesNo", "Information") -eq "Yes") {
        Start-Process "$appDir\start-vera.bat"
    }
    
} catch {
    [System.Windows.Forms.MessageBox]::Show("Errore durante l'installazione: $($_.Exception.Message)", "VERA Installer", "OK", "Error")
}
