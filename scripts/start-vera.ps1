# VERA Environmental Awareness App
# Avvio dell'applicazione

Write-Host "========================================"
Write-Host "   VERA Environmental Awareness App"
Write-Host "========================================"
Write-Host ""
Write-Host "Avvio dell'applicazione VERA..."
Write-Host ""

$projectRoot = $PSScriptRoot

Write-Host "Avvio del server backend..."
Set-Location "$projectRoot\backend"
$backend = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WindowStyle Hidden

Write-Host "Attendo che il backend si avvii..."
Start-Sleep -Seconds 3

Write-Host "Avvio del server frontend..."
Set-Location "$projectRoot\frontend"
$frontend = Start-Process -FilePath "npx" -ArgumentList "serve", "dist", "-s", "-p", "5173" -PassThru -WindowStyle Hidden

Write-Host "Attendo che il frontend si avvii..."
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================"
Write-Host "   VERA è ora in esecuzione!"
Write-Host "========================================"
Write-Host ""
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:3001"
Write-Host ""
Write-Host "Aprendo il browser..."
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Premi CTRL+C per chiudere l'applicazione..."

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host ""
    Write-Host "Chiusura dell'applicazione..."
    
    if ($backend -and !$backend.HasExited) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }
    
    if ($frontend -and !$frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Chiudi tutti i processi node rimanenti relativi a VERA
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*vera*" -or $_.CommandLine -like "*3001*" -or $_.CommandLine -like "*5173*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "Applicazione chiusa."
}