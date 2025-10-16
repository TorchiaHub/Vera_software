# VERA Build Script# VERA Environmental Awareness - Build Script for Windows

# Automatizza il processo di build per Windows# ========================================================



param(Write-Host "=== VERA BUILD SCRIPT ===" -ForegroundColor Magenta

    [switch]$Frontend,Write-Host ""

    [switch]$Backend,

    [switch]$Tauri,# Set error handling

    [switch]$All,$ErrorActionPreference = "Stop"

    [switch]$Clean,

    [switch]$Release# Project root

)$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $ProjectRoot

$ErrorActionPreference = "Stop"

try {

Write-Host "🚀 VERA Build Script" -ForegroundColor Green    Write-Host "1. Building shared module..." -ForegroundColor Cyan

Write-Host "===================" -ForegroundColor Green    Set-Location "shared"

    npm run build

# Set paths    Set-Location ".."

$ProjectRoot = $PSScriptRoot + "\.."    Write-Host "✓ Shared module built successfully" -ForegroundColor Green

$FrontendPath = "$ProjectRoot\frontend"    

$BackendPath = "$ProjectRoot\backend"    Write-Host "2. Building frontend..." -ForegroundColor Cyan

$TauriPath = "$ProjectRoot\src-tauri"    Set-Location "frontend"

    npm run build

# Clean function    Set-Location ".."

function Clean-Build {    Write-Host "✓ Frontend built successfully" -ForegroundColor Green

    Write-Host "🧹 Cleaning build directories..." -ForegroundColor Yellow    

        Write-Host "3. Building backend..." -ForegroundColor Cyan

    if (Test-Path "$FrontendPath\dist") {    Set-Location "backend"

        Remove-Item -Recurse -Force "$FrontendPath\dist"    npm run build

        Write-Host "✅ Frontend dist cleaned" -ForegroundColor Green    Set-Location ".."

    }    Write-Host "✓ Backend built successfully" -ForegroundColor Green

        

    if (Test-Path "$BackendPath\dist") {    Write-Host "4. Building Tauri application..." -ForegroundColor Cyan

        Remove-Item -Recurse -Force "$BackendPath\dist"    npm run tauri:build

        Write-Host "✅ Backend dist cleaned" -ForegroundColor Green    Write-Host "✓ Tauri application built successfully" -ForegroundColor Green

    }    

        Write-Host ""

    if (Test-Path "$TauriPath\target") {    Write-Host "=== BUILD COMPLETED SUCCESSFULLY ===" -ForegroundColor Green

        Remove-Item -Recurse -Force "$TauriPath\target"    Write-Host "Installer location: src-tauri/target/release/bundle/nsis/" -ForegroundColor White

        Write-Host "✅ Tauri target cleaned" -ForegroundColor Green    

    }} catch {

}    Write-Host ""

    Write-Host "=== BUILD FAILED ===" -ForegroundColor Red

# Frontend build    Write-Host "Error: $_" -ForegroundColor Red

function Build-Frontend {    exit 1

    Write-Host "🎨 Building Frontend..." -ForegroundColor Cyan}
    Set-Location $ProjectRoot
    
    if ($Release) {
        npm run build:frontend
    } else {
        npm run build --workspace=frontend
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build completed" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        exit 1
    }
}

# Backend build
function Build-Backend {
    Write-Host "⚙️ Building Backend..." -ForegroundColor Cyan
    Set-Location $ProjectRoot
    
    npm run build:backend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend build completed" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        exit 1
    }
}

# Tauri build
function Build-Tauri {
    Write-Host "🦀 Building Tauri Application..." -ForegroundColor Cyan
    Set-Location $ProjectRoot
    
    if ($Release) {
        npm run tauri -- build --bundles msi
    } else {
        npm run tauri -- build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tauri build completed" -ForegroundColor Green
        
        $bundlePath = "$TauriPath\target\release\bundle"
        if (Test-Path $bundlePath) {
            Write-Host "📦 Build artifacts:" -ForegroundColor Yellow
            Get-ChildItem -Recurse $bundlePath -Include "*.msi", "*.exe" | ForEach-Object {
                Write-Host "   - $($_.Name)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "❌ Tauri build failed" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    Set-Location $ProjectRoot
    
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Dependencies installation failed" -ForegroundColor Red
        exit 1
    }
}

# Main execution
try {
    Set-Location $ProjectRoot
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Install-Dependencies
    }
    
    # Clean if requested
    if ($Clean -or $All) {
        Clean-Build
    }
    
    # Build components based on flags
    if ($All) {
        Build-Frontend
        Build-Backend
        Build-Tauri
    } elseif ($Frontend) {
        Build-Frontend
    } elseif ($Backend) {
        Build-Backend
    } elseif ($Tauri) {
        Build-Tauri
    } else {
        # Default: build frontend
        Build-Frontend
    }
    
    Write-Host "" -ForegroundColor Green
    Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    
} catch {
    Write-Host "" -ForegroundColor Red
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}