# Monitor Build Progress for VERA Tauri Desktop App
$outputDir = "C:\Users\Lorenzo\Downloads\VERA-Environmental Awareness\src-tauri\target"
$releaseDir = "$outputDir\release"
$bundleDir = "$outputDir\release\bundle"

Write-Host "========================================="
Write-Host "  VERA Desktop Build Monitor"
Write-Host "========================================="
Write-Host ""

Write-Host "Monitorando la build dell'applicazione desktop..."
Write-Host ""

# Function to check if build is complete
function Check-BuildStatus {
    $buildComplete = $false
    
    # Check for the main executable
    if (Test-Path "$releaseDir\vera.exe") {
        Write-Host "✅ Eseguibile principale trovato: vera.exe"
        $buildComplete = $true
        
        # Get file size
        $size = (Get-Item "$releaseDir\vera.exe").Length / 1MB
        Write-Host "   Dimensione: $([math]::Round($size, 2)) MB"
    }
    
    # Check for Windows installer
    if (Test-Path "$bundleDir\msi") {
        Write-Host "✅ Installer MSI disponibile"
        Get-ChildItem "$bundleDir\msi\*.msi" | ForEach-Object {
            $size = $_.Length / 1MB
            Write-Host "   - $($_.Name) ($([math]::Round($size, 2)) MB)"
        }
    }
    
    # Check for Windows NSIS installer
    if (Test-Path "$bundleDir\nsis") {
        Write-Host "✅ Installer NSIS disponibile"
        Get-ChildItem "$bundleDir\nsis\*.exe" | ForEach-Object {
            $size = $_.Length / 1MB
            Write-Host "   - $($_.Name) ($([math]::Round($size, 2)) MB)"
        }
    }
    
    return $buildComplete
}

# Monitor loop
$maxWait = 30 # 30 minuti max
$waitTime = 0

while ($waitTime -lt $maxWait) {
    Write-Host "⏱️  Controllo build... (tempo: $waitTime minuti)"
    
    if (Check-BuildStatus) {
        Write-Host ""
        Write-Host "🎉 BUILD COMPLETATA CON SUCCESSO!"
        Write-Host ""
        
        # List all generated files
        Write-Host "File generati:"
        if (Test-Path $releaseDir) {
            Get-ChildItem $releaseDir -File | ForEach-Object {
                $size = $_.Length / 1MB
                Write-Host "  📄 $($_.Name) ($([math]::Round($size, 2)) MB)"
            }
        }
        
        if (Test-Path $bundleDir) {
            Write-Host ""
            Write-Host "Installer generati:"
            Get-ChildItem $bundleDir -Recurse -File | ForEach-Object {
                $size = $_.Length / 1MB
                Write-Host "  📦 $($_.FullName.Replace($bundleDir, '')) ($([math]::Round($size, 2)) MB)"
            }
        }
        
        Write-Host ""
        Write-Host "========================================="
        Write-Host "  L'applicazione desktop è pronta!"
        Write-Host "========================================="
        break
    }
    
    Start-Sleep -Seconds 60  # Wait 1 minute
    $waitTime++
}

if ($waitTime -eq $maxWait) {
    Write-Host "⚠️  Timeout raggiunto. La build potrebbe essere ancora in corso."
    Write-Host "   Controlla manualmente la directory: $releaseDir"
}

Write-Host ""
Write-Host "Per testare l'applicazione desktop:"
Write-Host "  1. Vai in: $releaseDir"
Write-Host "  2. Esegui: vera.exe"
Write-Host "  3. Oppure installa usando gli installer in: $bundleDir"
Write-Host ""