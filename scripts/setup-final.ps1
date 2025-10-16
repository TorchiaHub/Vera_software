# VERA Setup Script  
# Configura l'ambiente di sviluppo VERA

param(
    [switch]$Fresh,
    [switch]$SkipRust,
    [switch]$SkipNode
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 VERA Setup Script" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta

$ProjectRoot = $PSScriptRoot + "\.."

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm not found" -ForegroundColor Red
        return $false
    }
    
    # Check Rust (optional)
    if (-not $SkipRust) {
        try {
            $rustVersion = rustc --version
            Write-Host "✅ Rust: $rustVersion" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Rust not found. Tauri builds will not work." -ForegroundColor Yellow
            Write-Host "Install from: https://rustup.rs/" -ForegroundColor Yellow
        }
    }
    
    return $true
}

function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    Set-Location $ProjectRoot
    
    if ($Fresh) {
        Write-Host "🧹 Cleaning existing node_modules..." -ForegroundColor Yellow
        if (Test-Path "node_modules") {
            Remove-Item -Recurse -Force "node_modules"
        }
        if (Test-Path "package-lock.json") {
            Remove-Item -Force "package-lock.json"
        }
    }
    
    # Install root dependencies
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

function Test-Build {
    Write-Host "🏗️ Testing build process..." -ForegroundColor Cyan
    Set-Location $ProjectRoot
    
    # Test frontend build
    Write-Host "Testing frontend build..." -ForegroundColor Yellow
    npm run build --workspace=frontend
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Frontend build successful" -ForegroundColor Green
    return $true
}

function Show-Summary {
    Write-Host ""
    Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor White
    Write-Host "• .\scripts\dev-clean.ps1 -Frontend    # Start frontend dev server" -ForegroundColor Gray
    Write-Host "• .\scripts\dev-clean.ps1 -All         # Start all dev servers" -ForegroundColor Gray
    Write-Host "• .\scripts\build-clean.ps1 -Frontend  # Build frontend" -ForegroundColor Gray
    Write-Host "• .\scripts\build-clean.ps1 -All       # Build everything" -ForegroundColor Gray
    Write-Host "• npm run tauri -- dev                 # Start Tauri dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Project structure:" -ForegroundColor White
    Write-Host "• frontend/     - React TypeScript app" -ForegroundColor Gray
    Write-Host "• backend/      - Node.js API server" -ForegroundColor Gray
    Write-Host "• shared/       - Common utilities" -ForegroundColor Gray
    Write-Host "• src-tauri/    - Rust desktop app" -ForegroundColor Gray
    Write-Host ""
}

# Main execution
try {
    Set-Location $ProjectRoot
    
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    Install-Dependencies
    
    if (Test-Build) {
        Show-Summary
    } else {
        Write-Host "⚠️ Setup completed but build test failed" -ForegroundColor Yellow
        Write-Host "Check the error messages above for troubleshooting" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}