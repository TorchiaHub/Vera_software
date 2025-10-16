# VERA Build Script
# Automatizza il processo di build per Windows

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Tauri,
    [switch]$All,
    [switch]$Clean,
    [switch]$Release
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 VERA Build Script" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green

# Set paths
$ProjectRoot = $PSScriptRoot + "\.."
$FrontendPath = "$ProjectRoot\frontend"
$BackendPath = "$ProjectRoot\backend"
$TauriPath = "$ProjectRoot\src-tauri"

# Clean function
function Clear-BuildDirectories {
    Write-Host "🧹 Cleaning build directories..." -ForegroundColor Yellow
    
    if (Test-Path "$FrontendPath\dist") {
        Remove-Item -Recurse -Force "$FrontendPath\dist"
        Write-Host "✅ Frontend dist cleaned" -ForegroundColor Green
    }
    
    if (Test-Path "$BackendPath\dist") {
        Remove-Item -Recurse -Force "$BackendPath\dist"
        Write-Host "✅ Backend dist cleaned" -ForegroundColor Green
    }
    
    if (Test-Path "$TauriPath\target") {
        Remove-Item -Recurse -Force "$TauriPath\target"
        Write-Host "✅ Tauri target cleaned" -ForegroundColor Green
    }
}

# Frontend build
function Start-FrontendBuild {
    Write-Host "🎨 Building Frontend..." -ForegroundColor Cyan
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
function Start-BackendBuild {
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
function Start-TauriBuild {
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
        Clear-BuildDirectories
    }
    
    # Build components based on flags
    if ($All) {
        Start-FrontendBuild
        Start-BackendBuild
        Start-TauriBuild
    } elseif ($Frontend) {
        Start-FrontendBuild
    } elseif ($Backend) {
        Start-BackendBuild
    } elseif ($Tauri) {
        Start-TauriBuild
    } else {
        # Default: build frontend
        Start-FrontendBuild
    }
    
    Write-Host ""
    Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}