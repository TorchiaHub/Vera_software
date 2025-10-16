# VERA Environmental Awareness - Installer Script (PowerShell)
# Installs VERA Environmental Awareness application on Windows

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("user", "system")]
    [string]$InstallScope = "user",
    
    [Parameter(Mandatory=$false)]
    [string]$InstallPath = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateDesktopShortcut,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateStartMenuShortcut,
    
    [Parameter(Mandatory=$false)]
    [switch]$RegisterFileAssociations,
    
    [Parameter(Mandatory=$false)]
    [switch]$AddToPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Silent,
    
    [Parameter(Mandatory=$false)]
    [switch]$Uninstall,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    if (-not $Silent) {
        $colorMap = @{
            "Red" = "Red"
            "Green" = "Green"
            "Yellow" = "Yellow"
            "Blue" = "Blue"
            "Cyan" = "Cyan"
            "Magenta" = "Magenta"
            "White" = "White"
        }
        
        Write-Host $Message -ForegroundColor $colorMap[$Color]
    }
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "🔧 $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

# Check administrator privileges
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Banner
if (-not $Silent) {
    Write-ColorOutput @"
╔══════════════════════════════════════════════════════════╗
║               VERA Environmental Awareness              ║
║                    Windows Installer                    ║
╚══════════════════════════════════════════════════════════╝
"@ "Cyan"
}

# Constants
$AppName = "VERA Environmental Awareness"
$AppVersion = "1.0.0"
$AppPublisher = "VERA Team"
$AppId = "vera-environmental-awareness"

# Set default install paths
if ($InstallPath -eq "") {
    if ($InstallScope -eq "system") {
        $InstallPath = "$env:ProgramFiles\$AppName"
    } else {
        $InstallPath = "$env:LOCALAPPDATA\Programs\$AppName"
    }
}

# Registry paths
$UninstallRegPath = if ($InstallScope -eq "system") {
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\$AppId"
} else {
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\$AppId"
}

# Check for existing installation
function Test-ExistingInstallation {
    return Test-Path $UninstallRegPath
}

# Uninstall function
function Uninstall-Application {
    Write-Step "Uninstalling $AppName..."
    
    if (-not (Test-ExistingInstallation)) {
        Write-Warning "$AppName is not installed"
        return
    }
    
    # Get install location from registry
    try {
        $regKey = Get-ItemProperty -Path $UninstallRegPath -ErrorAction Stop
        $installedPath = $regKey.InstallLocation
        
        if ($installedPath -and (Test-Path $installedPath)) {
            Write-Step "Removing application files from $installedPath..."
            Remove-Item -Path $installedPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Success "Application files removed"
        }
    } catch {
        Write-Warning "Could not determine install location from registry"
    }
    
    # Remove registry entries
    Write-Step "Removing registry entries..."
    Remove-Item -Path $UninstallRegPath -Force -ErrorAction SilentlyContinue
    Write-Success "Registry entries removed"
    
    # Remove shortcuts
    $desktopShortcut = "$env:USERPROFILE\Desktop\$AppName.lnk"
    $startMenuShortcut = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\$AppName.lnk"
    
    if (Test-Path $desktopShortcut) {
        Remove-Item $desktopShortcut -Force
        Write-Success "Desktop shortcut removed"
    }
    
    if (Test-Path $startMenuShortcut) {
        Remove-Item $startMenuShortcut -Force
        Write-Success "Start Menu shortcut removed"
    }
    
    Write-Success "$AppName has been uninstalled successfully"
    return
}

# Handle uninstall request
if ($Uninstall) {
    Uninstall-Application
    exit 0
}

# Check for administrator privileges if needed
if ($InstallScope -eq "system" -and -not (Test-Administrator)) {
    Write-Error "System-wide installation requires administrator privileges"
    Write-Warning "Please run this script as Administrator or use -InstallScope user"
    exit 1
}

# Check for existing installation
if (Test-ExistingInstallation) {
    if ($Force) {
        Write-Warning "Existing installation found. Uninstalling first..."
        Uninstall-Application
    } else {
        Write-Error "An existing installation was found"
        Write-Warning "Use -Force to overwrite or -Uninstall to remove first"
        exit 1
    }
}

# Look for installer files
Write-Step "Looking for installation files..."

$installerFiles = @()
$bundleDir = "src-tauri\target\release\bundle"

if (Test-Path $bundleDir) {
    $msiFiles = Get-ChildItem -Path $bundleDir -Filter "*.msi" -Recurse
    $installerFiles += $msiFiles
    
    $exeFiles = Get-ChildItem -Path $bundleDir -Filter "*.exe" -Recurse
    $installerFiles += $exeFiles
}

# Also check for direct executable
$releaseDir = "src-tauri\target\release"
if (Test-Path $releaseDir) {
    $directExe = Get-ChildItem -Path $releaseDir -Filter "$AppId.exe" -ErrorAction SilentlyContinue
    if ($directExe) {
        $installerFiles += $directExe
    }
}

if ($installerFiles.Count -eq 0) {
    Write-Error "No installation files found"
    Write-Warning "Please build the application first with: ./scripts/build.ps1"
    exit 1
}

# Select the best installer
$selectedInstaller = $installerFiles | Sort-Object Extension, Name | Select-Object -First 1
Write-Success "Found installer: $($selectedInstaller.Name)"

# Create installation directory
Write-Step "Creating installation directory: $InstallPath"
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Success "Installation directory created"
}

# Install the application
Write-Step "Installing application files..."

if ($selectedInstaller.Extension -eq ".msi") {
    # MSI installer
    Write-Step "Running MSI installer..."
    $msiArgs = @(
        "/i", $selectedInstaller.FullName
        "/quiet"
        "INSTALLDIR=`"$InstallPath`""
    )
    
    if ($InstallScope -eq "system") {
        $msiArgs += "ALLUSERS=1"
    } else {
        $msiArgs += "ALLUSERS=2"
    }
    
    $process = Start-Process "msiexec.exe" -ArgumentList $msiArgs -Wait -PassThru
    if ($process.ExitCode -eq 0) {
        Write-Success "MSI installation completed"
    } else {
        Write-Error "MSI installation failed with exit code: $($process.ExitCode)"
        exit 1
    }
} else {
    # Portable executable - copy files
    Write-Step "Copying application files..."
    
    Copy-Item -Path $selectedInstaller.FullName -Destination "$InstallPath\$AppId.exe" -Force
    Write-Success "Application files copied"
    
    # Create uninstaller script
    $uninstallScript = @"
# VERA Environmental Awareness Uninstaller
Remove-Item -Path '$InstallPath' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path '$UninstallRegPath' -Force -ErrorAction SilentlyContinue
Remove-Item -Path '$env:USERPROFILE\Desktop\$AppName.lnk' -Force -ErrorAction SilentlyContinue
Remove-Item -Path '$env:APPDATA\Microsoft\Windows\Start Menu\Programs\$AppName.lnk' -Force -ErrorAction SilentlyContinue
Write-Host '$AppName has been uninstalled'
"@
    
    $uninstallScript | Out-File -FilePath "$InstallPath\Uninstall.ps1" -Encoding UTF8
    Write-Success "Uninstaller created"
}

# Create registry entries
Write-Step "Creating registry entries..."

try {
    $regKey = New-Item -Path $UninstallRegPath -Force
    $regKey | New-ItemProperty -Name "DisplayName" -Value $AppName -PropertyType String -Force | Out-Null
    $regKey | New-ItemProperty -Name "DisplayVersion" -Value $AppVersion -PropertyType String -Force | Out-Null
    $regKey | New-ItemProperty -Name "Publisher" -Value $AppPublisher -PropertyType String -Force | Out-Null
    $regKey | New-ItemProperty -Name "InstallLocation" -Value $InstallPath -PropertyType String -Force | Out-Null
    $regKey | New-ItemProperty -Name "InstallDate" -Value (Get-Date -Format "yyyyMMdd") -PropertyType String -Force | Out-Null
    $regKey | New-ItemProperty -Name "UninstallString" -Value "powershell.exe -File `"$InstallPath\Uninstall.ps1`"" -PropertyType String -Force | Out-Null
    $regKey | New-ItemProperty -Name "NoModify" -Value 1 -PropertyType DWord -Force | Out-Null
    $regKey | New-ItemProperty -Name "NoRepair" -Value 1 -PropertyType DWord -Force | Out-Null
    
    Write-Success "Registry entries created"
} catch {
    Write-Warning "Failed to create registry entries: $($_.Exception.Message)"
}

# Create shortcuts
if ($CreateDesktopShortcut) {
    Write-Step "Creating desktop shortcut..."
    
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\$AppName.lnk")
    $Shortcut.TargetPath = "$InstallPath\$AppId.exe"
    $Shortcut.WorkingDirectory = $InstallPath
    $Shortcut.Description = $AppName
    $Shortcut.Save()
    
    Write-Success "Desktop shortcut created"
}

if ($CreateStartMenuShortcut) {
    Write-Step "Creating Start Menu shortcut..."
    
    $startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
    if (-not (Test-Path $startMenuPath)) {
        New-Item -ItemType Directory -Path $startMenuPath -Force | Out-Null
    }
    
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$startMenuPath\$AppName.lnk")
    $Shortcut.TargetPath = "$InstallPath\$AppId.exe"
    $Shortcut.WorkingDirectory = $InstallPath
    $Shortcut.Description = $AppName
    $Shortcut.Save()
    
    Write-Success "Start Menu shortcut created"
}

# Add to PATH
if ($AddToPath) {
    Write-Step "Adding to PATH..."
    
    $currentPath = if ($InstallScope -eq "system") {
        [Environment]::GetEnvironmentVariable("PATH", "Machine")
    } else {
        [Environment]::GetEnvironmentVariable("PATH", "User")
    }
    
    if ($currentPath -notlike "*$InstallPath*") {
        $newPath = "$currentPath;$InstallPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, $(if ($InstallScope -eq "system") { "Machine" } else { "User" }))
        Write-Success "Added to PATH"
    } else {
        Write-Warning "Already in PATH"
    }
}

# Register file associations
if ($RegisterFileAssociations) {
    Write-Step "Registering file associations..."
    
    try {
        # Example: Register .vera files
        $fileExt = ".vera"
        $progId = "VERA.Document"
        
        $extKey = New-Item -Path "HKCU:\SOFTWARE\Classes\$fileExt" -Force
        $extKey | New-ItemProperty -Name "(Default)" -Value $progId -PropertyType String -Force | Out-Null
        
        $progKey = New-Item -Path "HKCU:\SOFTWARE\Classes\$progId" -Force
        $progKey | New-ItemProperty -Name "(Default)" -Value "$AppName Document" -PropertyType String -Force | Out-Null
        
        $commandKey = New-Item -Path "HKCU:\SOFTWARE\Classes\$progId\shell\open\command" -Force
        $commandKey | New-ItemProperty -Name "(Default)" -Value "`"$InstallPath\$AppId.exe`" `"%1`"" -PropertyType String -Force | Out-Null
        
        Write-Success "File associations registered"
    } catch {
        Write-Warning "Failed to register file associations: $($_.Exception.Message)"
    }
}

# Installation summary
Write-ColorOutput ""
Write-ColorOutput "╔══════════════════════════════════════════════════════════╗" "Green"
Write-ColorOutput "║              🎉 INSTALLATION COMPLETED! 🎉              ║" "Green"
Write-ColorOutput "╚══════════════════════════════════════════════════════════╝" "Green"
Write-ColorOutput ""

Write-ColorOutput "Installation Summary:" "Cyan"
Write-ColorOutput "• Application: $AppName v$AppVersion" "White"
Write-ColorOutput "• Location: $InstallPath" "White"
Write-ColorOutput "• Scope: $InstallScope" "White"

if ($CreateDesktopShortcut) {
    Write-ColorOutput "• Desktop shortcut: Created" "White"
}
if ($CreateStartMenuShortcut) {
    Write-ColorOutput "• Start Menu shortcut: Created" "White"
}
if ($AddToPath) {
    Write-ColorOutput "• Added to PATH: Yes" "White"
}
if ($RegisterFileAssociations) {
    Write-ColorOutput "• File associations: Registered" "White"
}

Write-ColorOutput ""
Write-ColorOutput "Next steps:" "Yellow"
Write-ColorOutput "• Run '$AppName' from Start Menu or Desktop" "White"
Write-ColorOutput "• To uninstall: Use Add/Remove Programs or run:" "White"
Write-ColorOutput "  powershell -File `"$InstallPath\Uninstall.ps1`"" "White"
Write-ColorOutput ""

exit 0