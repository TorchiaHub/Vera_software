# VERA Environmental Awareness - Development Server Script (PowerShell)
# Starts all development servers concurrently

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipFrontend,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBackend,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTauri,
    
    [Parameter(Mandatory=$false)]
    [switch]$NoOpen,
    
    [Parameter(Mandatory=$false)]
    [string]$Port = "3000",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiPort = "3001",
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
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

# Banner
Write-ColorOutput @"
╔══════════════════════════════════════════════════════════╗
║               VERA Environmental Awareness              ║
║                  Development Server                     ║
╚══════════════════════════════════════════════════════════╝
"@ "Cyan"

Write-ColorOutput "Platform: Windows (PowerShell)" "Yellow"
Write-ColorOutput ""

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Success "Node.js found: $nodeVersion"
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Error "Node.js is not installed or not in PATH"
    Write-ColorOutput "Please install Node.js 18+ from https://nodejs.org/" "Yellow"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Success "npm found: v$npmVersion"
    } else {
        throw "npm not found"
    }
} catch {
    Write-Error "npm is not installed or not in PATH"
    exit 1
}

# Check Rust (only if running Tauri)
if (-not $SkipTauri) {
    try {
        $rustVersion = rustc --version 2>$null
        if ($rustVersion) {
            Write-Success "Rust found: $rustVersion"
        } else {
            throw "Rust not found"
        }
    } catch {
        Write-Error "Rust is not installed or not in PATH"
        Write-ColorOutput "Please install Rust from https://rustup.rs/" "Yellow"
        Write-Warning "Tauri development will be skipped"
        $SkipTauri = $true
    }
    
    if (-not $SkipTauri) {
        # Check Tauri CLI
        try {
            $tauriVersion = cargo tauri --version 2>$null
            if ($tauriVersion) {
                Write-Success "Tauri CLI found: $tauriVersion"
            } else {
                Write-Warning "Tauri CLI not found, installing..."
                cargo install tauri-cli
            }
        } catch {
            Write-Warning "Installing Tauri CLI..."
            cargo install tauri-cli
        }
    }
}

# Set environment variables
Write-Step "Setting development environment..."

$env:NODE_ENV = "development"
$env:VITE_APP_ENV = "development" 
$env:VITE_API_URL = "http://localhost:$ApiPort"
$env:VITE_APP_VERSION = "dev"
$env:VITE_DEV_MODE = "true"
$env:PORT = $Port
$env:API_PORT = $ApiPort

Write-Success "Environment variables set for development"

# Check if dependencies are installed
Write-Step "Checking dependencies..."

if (-not (Test-Path "node_modules")) {
    Write-Warning "Dependencies not found, installing..."
    if ($Verbose) {
        npm install --verbose
    } else {
        npm install --silent
    }
    Write-Success "Dependencies installed"
}

# Bootstrap monorepo if needed
if (-not (Test-Path "frontend/node_modules") -or -not (Test-Path "backend/node_modules")) {
    Write-Step "Bootstrapping monorepo..."
    if ($Verbose) {
        npm run bootstrap -- --verbose
    } else {
        npm run bootstrap --silent
    }
    Write-Success "Monorepo bootstrapped"
}

# Create array to store background jobs
$jobs = @()

# Start Backend Server
if (-not $SkipBackend) {
    Write-Step "Starting backend server on port $ApiPort..."
    
    $backendJob = Start-Job -ScriptBlock {
        param($ApiPort, $Verbose)
        
        Set-Location "backend"
        $env:PORT = $ApiPort
        $env:NODE_ENV = "development"
        
        if ($Verbose) {
            npm run dev -- --verbose
        } else {
            npm run dev
        }
    } -ArgumentList $ApiPort, $Verbose
    
    $jobs += @{
        Name = "Backend"
        Job = $backendJob
        Port = $ApiPort
        URL = "http://localhost:$ApiPort"
    }
    
    Write-Success "Backend server starting..."
} else {
    Write-Warning "Skipping backend server"
}

# Start Frontend Server
if (-not $SkipFrontend) {
    Write-Step "Starting frontend server on port $Port..."
    
    $frontendJob = Start-Job -ScriptBlock {
        param($Port, $ApiPort, $Verbose, $NoOpen)
        
        Set-Location "frontend"
        $env:PORT = $Port
        $env:VITE_API_URL = "http://localhost:$ApiPort"
        $env:NODE_ENV = "development"
        
        $frontendArgs = @("run", "dev")
        if (-not $NoOpen) {
            $frontendArgs += "--open"
        }
        if ($Verbose) {
            $frontendArgs += "--verbose"
        }
        
        & npm $frontendArgs
    } -ArgumentList $Port, $ApiPort, $Verbose, $NoOpen
    
    $jobs += @{
        Name = "Frontend"
        Job = $frontendJob
        Port = $Port
        URL = "http://localhost:$Port"
    }
    
    Write-Success "Frontend server starting..."
} else {
    Write-Warning "Skipping frontend server"
}

# Start Tauri Development
if (-not $SkipTauri) {
    Write-Step "Starting Tauri development..."
    
    $tauriJob = Start-Job -ScriptBlock {
        param($Verbose)
        
        $env:NODE_ENV = "development"
        
        if ($Verbose) {
            cargo tauri dev --verbose
        } else {
            cargo tauri dev
        }
    } -ArgumentList $Verbose
    
    $jobs += @{
        Name = "Tauri"
        Job = $tauriJob
        Port = "N/A"
        URL = "Desktop App"
    }
    
    Write-Success "Tauri development starting..."
} else {
    Write-Warning "Skipping Tauri development"
}

# Wait for servers to start
Write-Step "Waiting for servers to start..."
Start-Sleep -Seconds 3

# Check server health
Write-Step "Checking server health..."

if (-not $SkipBackend) {
    try {
        $backendHealth = Invoke-WebRequest -Uri "http://localhost:$ApiPort/health" -TimeoutSec 5 -UseBasicParsing
        if ($backendHealth.StatusCode -eq 200) {
            Write-Success "Backend server is healthy"
        }
    } catch {
        Write-Warning "Backend server not ready yet (this is normal)"
    }
}

if (-not $SkipFrontend) {
    try {
        $frontendHealth = Invoke-WebRequest -Uri "http://localhost:$Port" -TimeoutSec 5 -UseBasicParsing
        if ($frontendHealth.StatusCode -eq 200) {
            Write-Success "Frontend server is healthy"
        }
    } catch {
        Write-Warning "Frontend server not ready yet (this is normal)"
    }
}

# Display running services
Write-ColorOutput ""
Write-ColorOutput "🚀 Development servers started!" "Green"
Write-ColorOutput ""

foreach ($job in $jobs) {
    if ($job.Job.State -eq "Running") {
        Write-ColorOutput "✅ $($job.Name): $($job.URL)" "Green"
    } else {
        Write-ColorOutput "❌ $($job.Name): Failed to start" "Red"
    }
}

Write-ColorOutput ""
Write-ColorOutput "📋 Available Commands:" "Cyan"
Write-ColorOutput "• Press 'Ctrl+C' to stop all servers" "White"
Write-ColorOutput "• Press 'r' + Enter to restart all servers" "White"
Write-ColorOutput "• Press 'l' + Enter to view logs" "White"
Write-ColorOutput "• Press 'h' + Enter to view health status" "White"
Write-ColorOutput "• Press 'q' + Enter to quit" "White"
Write-ColorOutput ""

# Monitor jobs and handle user input
try {
    while ($true) {
        # Check if any jobs have failed
        $failedJobs = $jobs | Where-Object { $_.Job.State -eq "Failed" -or $_.Job.State -eq "Stopped" }
        
        if ($failedJobs.Count -gt 0) {
            Write-Warning "Some services have stopped:"
            foreach ($failedJob in $failedJobs) {
                Write-Error "$($failedJob.Name) has stopped"
                
                # Get job output for debugging
                $output = Receive-Job -Job $failedJob.Job -ErrorAction SilentlyContinue
                if ($output) {
                    Write-ColorOutput "Output from $($failedJob.Name):" "Yellow"
                    Write-ColorOutput $output "White"
                }
            }
        }
        
        # Check for user input
        if ([Console]::KeyAvailable) {
            $key = [Console]::ReadKey($true)
            
            switch ($key.KeyChar) {
                'r' {
                    Write-Step "Restarting all servers..."
                    # Stop all jobs
                    foreach ($job in $jobs) {
                        Stop-Job -Job $job.Job -ErrorAction SilentlyContinue
                        Remove-Job -Job $job.Job -ErrorAction SilentlyContinue
                    }
                    
                    # Restart script
                    & $MyInvocation.MyCommand.Path @PSBoundParameters
                    return
                }
                'l' {
                    Write-ColorOutput ""
                    Write-ColorOutput "📋 Recent Logs:" "Cyan"
                    foreach ($job in $jobs) {
                        if ($job.Job.State -eq "Running") {
                            $output = Receive-Job -Job $job.Job -Keep -ErrorAction SilentlyContinue
                            if ($output) {
                                Write-ColorOutput "--- $($job.Name) ---" "Yellow"
                                Write-ColorOutput ($output | Select-Object -Last 5) "White"
                            }
                        }
                    }
                    Write-ColorOutput ""
                }
                'h' {
                    Write-ColorOutput ""
                    Write-ColorOutput "🏥 Health Status:" "Cyan"
                    foreach ($job in $jobs) {
                        $status = if ($job.Job.State -eq "Running") { "✅ Running" } else { "❌ Stopped" }
                        Write-ColorOutput "$($job.Name): $status" "White"
                    }
                    Write-ColorOutput ""
                }
                'q' {
                    Write-ColorOutput ""
                    Write-Step "Stopping all servers..."
                    break
                }
            }
        }
        
        Start-Sleep -Milliseconds 500
    }
} catch {
    Write-Warning "Interrupted by user"
} finally {
    # Cleanup: Stop all background jobs
    Write-Step "Cleaning up..."
    
    foreach ($job in $jobs) {
        try {
            Stop-Job -Job $job.Job -ErrorAction SilentlyContinue
            Remove-Job -Job $job.Job -Force -ErrorAction SilentlyContinue
            Write-Success "Stopped $($job.Name)"
        } catch {
            Write-Warning "Failed to stop $($job.Name)"
        }
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "🛑 All development servers stopped" "Yellow"
    Write-ColorOutput "Thank you for using VERA Environmental Awareness!" "Cyan"
    Write-ColorOutput ""
}

exit 0