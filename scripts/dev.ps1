# VERA Development Script# VERA Environmental Awareness - Development Script

# Script per avviare server di sviluppo# =================================================



param(Write-Host "=== VERA DEVELOPMENT MODE ===" -ForegroundColor Magenta

    [switch]$Frontend,Write-Host ""

    [switch]$Backend,

    [switch]$Tauri,# Set error handling

    [switch]$All$ErrorActionPreference = "Stop"

)

# Project root

$ErrorActionPreference = "Stop"$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $ProjectRoot

Write-Host "💻 VERA Development Server" -ForegroundColor Cyan

Write-Host "===========================" -ForegroundColor Cyantry {

    Write-Host "Starting VERA in development mode..." -ForegroundColor Cyan

$ProjectRoot = $PSScriptRoot + "\.."    Write-Host "This will start:" -ForegroundColor White

    Write-Host "  • Frontend dev server (Vite)" -ForegroundColor Gray

function Start-FrontendDev {    Write-Host "  • Tauri dev environment" -ForegroundColor Gray

    Write-Host "🎨 Starting Frontend Dev Server..." -ForegroundColor Green    Write-Host "  • Hot reload enabled" -ForegroundColor Gray

    Set-Location $ProjectRoot    Write-Host ""

    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=frontend"    

}    # Check if node_modules exist

    if (-not (Test-Path "node_modules")) {

function Start-BackendDev {        Write-Host "Installing dependencies..." -ForegroundColor Yellow

    Write-Host "⚙️ Starting Backend Dev Server..." -ForegroundColor Green        npm install

    Set-Location $ProjectRoot    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=backend"    

}    # Start development

    Write-Host "Starting development environment..." -ForegroundColor Cyan

function Start-TauriDev {    npm run tauri:dev

    Write-Host "🦀 Starting Tauri Dev..." -ForegroundColor Green    

    Set-Location $ProjectRoot} catch {

    npm run tauri -- dev    Write-Host ""

}    Write-Host "=== DEVELOPMENT START FAILED ===" -ForegroundColor Red

    Write-Host "Error: $_" -ForegroundColor Red

# Main execution    Write-Host ""

try {    Write-Host "Try running:" -ForegroundColor Yellow

    Set-Location $ProjectRoot    Write-Host "  npm install" -ForegroundColor White

        Write-Host "  npm run dev:frontend" -ForegroundColor White

    if ($All) {    exit 1

        Start-FrontendDev}
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