# VERA Development Script
# Script per avviare server di sviluppo

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Tauri,
    [switch]$All
)

$ErrorActionPreference = "Stop"

Write-Host "💻 VERA Development Server" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

$ProjectRoot = $PSScriptRoot + "\.."

function Start-FrontendDev {
    Write-Host "🎨 Starting Frontend Dev Server..." -ForegroundColor Green
    Set-Location $ProjectRoot
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=frontend"
}

function Start-BackendDev {
    Write-Host "⚙️ Starting Backend Dev Server..." -ForegroundColor Green
    Set-Location $ProjectRoot
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=backend"
}

function Start-TauriDev {
    Write-Host "🦀 Starting Tauri Dev..." -ForegroundColor Green
    Set-Location $ProjectRoot
    npm run tauri -- dev
}

# Main execution
try {
    Set-Location $ProjectRoot
    
    if ($All) {
        Start-FrontendDev
        Start-Sleep -Seconds 2
        Start-BackendDev
        Start-Sleep -Seconds 2
        Start-TauriDev
    } elseif ($Frontend) {
        Start-FrontendDev
    } elseif ($Backend) {
        Start-BackendDev
    } elseif ($Tauri) {
        Start-TauriDev
    } else {
        # Default: frontend dev
        Start-FrontendDev
    }
    
} catch {
    Write-Host "❌ Failed to start dev server: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}