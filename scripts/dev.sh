#!/bin/bash
# VERA Environmental Awareness - Development Server Script (Bash)
# Starts all development servers concurrently

set -e

# Default values
SKIP_FRONTEND=false
SKIP_BACKEND=false
SKIP_TAURI=false
NO_OPEN=false
PORT=3000
API_PORT=3001
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║               VERA Environmental Awareness              ║"
    echo "║                  Development Server                     ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Cleanup function
cleanup() {
    echo ""
    print_step "Stopping all servers..."
    
    # Kill all background processes
    if [[ -n "${PIDS[*]}" ]]; then
        for pid in "${PIDS[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
                print_success "Stopped process $pid"
            fi
        done
    fi
    
    # Kill processes by port if needed
    if [[ "$SKIP_BACKEND" != "true" ]]; then
        PID=$(lsof -ti:$API_PORT 2>/dev/null || true)
        if [[ -n "$PID" ]]; then
            kill "$PID" 2>/dev/null || true
        fi
    fi
    
    if [[ "$SKIP_FRONTEND" != "true" ]]; then
        PID=$(lsof -ti:$PORT 2>/dev/null || true)
        if [[ -n "$PID" ]]; then
            kill "$PID" 2>/dev/null || true
        fi
    fi
    
    echo ""
    echo -e "${YELLOW}🛑 All development servers stopped${NC}"
    echo -e "${CYAN}Thank you for using VERA Environmental Awareness!${NC}"
    echo ""
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Parse command line arguments
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-frontend         Skip frontend server"
    echo "  --skip-backend          Skip backend server"
    echo "  --skip-tauri            Skip Tauri development"
    echo "  --no-open               Don't open browser automatically"
    echo "  --port PORT             Frontend port (default: 3000)"
    echo "  --api-port PORT         Backend port (default: 3001)"
    echo "  --verbose               Enable verbose output"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Start all servers"
    echo "  $0 --skip-tauri                      # Skip Tauri development"
    echo "  $0 --port 8080 --api-port 8081      # Custom ports"
    echo "  $0 --verbose                         # Verbose output"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --skip-tauri)
            SKIP_TAURI=true
            shift
            ;;
        --no-open)
            NO_OPEN=true
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --api-port)
            API_PORT="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Display banner
print_banner

echo -e "${YELLOW}Platform: $(uname -s) (Bash)${NC}"
echo ""

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js is not installed or not in PATH"
    print_warning "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: v$NPM_VERSION"
else
    print_error "npm is not installed or not in PATH"
    exit 1
fi

# Check Rust (only if running Tauri)
if [[ "$SKIP_TAURI" != "true" ]]; then
    if command -v rustc &> /dev/null; then
        RUST_VERSION=$(rustc --version)
        print_success "Rust found: $RUST_VERSION"
    else
        print_error "Rust is not installed or not in PATH"
        print_warning "Please install Rust from https://rustup.rs/"
        print_warning "Tauri development will be skipped"
        SKIP_TAURI=true
    fi
    
    if [[ "$SKIP_TAURI" != "true" ]]; then
        # Check Tauri CLI
        if command -v cargo tauri &> /dev/null; then
            TAURI_VERSION=$(cargo tauri --version)
            print_success "Tauri CLI found: $TAURI_VERSION"
        else
            print_warning "Tauri CLI not found, installing..."
            cargo install tauri-cli
        fi
    fi
fi

# Set environment variables
print_step "Setting development environment..."

export NODE_ENV="development"
export VITE_APP_ENV="development"
export VITE_API_URL="http://localhost:$API_PORT"
export VITE_APP_VERSION="dev"
export VITE_DEV_MODE="true"
export PORT="$PORT"
export API_PORT="$API_PORT"

print_success "Environment variables set for development"

# Check if dependencies are installed
print_step "Checking dependencies..."

if [[ ! -d "node_modules" ]]; then
    print_warning "Dependencies not found, installing..."
    if [[ "$VERBOSE" == "true" ]]; then
        npm install --verbose
    else
        npm install --silent
    fi
    print_success "Dependencies installed"
fi

# Bootstrap monorepo if needed
if [[ ! -d "frontend/node_modules" || ! -d "backend/node_modules" ]]; then
    print_step "Bootstrapping monorepo..."
    if [[ "$VERBOSE" == "true" ]]; then
        npm run bootstrap -- --verbose
    else
        npm run bootstrap --silent
    fi
    print_success "Monorepo bootstrapped"
fi

# Array to store process IDs
declare -a PIDS=()
declare -a SERVICES=()

# Create log directory
mkdir -p logs

# Start Backend Server
if [[ "$SKIP_BACKEND" != "true" ]]; then
    print_step "Starting backend server on port $API_PORT..."
    
    cd backend
    export PORT="$API_PORT"
    export NODE_ENV="development"
    
    if [[ "$VERBOSE" == "true" ]]; then
        npm run dev -- --verbose > ../logs/backend.log 2>&1 &
    else
        npm run dev > ../logs/backend.log 2>&1 &
    fi
    
    BACKEND_PID=$!
    PIDS+=($BACKEND_PID)
    SERVICES+=("Backend:http://localhost:$API_PORT:$BACKEND_PID")
    
    cd ..
    print_success "Backend server starting (PID: $BACKEND_PID)..."
else
    print_warning "Skipping backend server"
fi

# Start Frontend Server
if [[ "$SKIP_FRONTEND" != "true" ]]; then
    print_step "Starting frontend server on port $PORT..."
    
    cd frontend
    export PORT="$PORT"
    export VITE_API_URL="http://localhost:$API_PORT"
    export NODE_ENV="development"
    
    FRONTEND_ARGS=("run" "dev")
    if [[ "$NO_OPEN" != "true" ]]; then
        FRONTEND_ARGS+=("--open")
    fi
    if [[ "$VERBOSE" == "true" ]]; then
        FRONTEND_ARGS+=("--verbose")
    fi
    
    npm "${FRONTEND_ARGS[@]}" > ../logs/frontend.log 2>&1 &
    
    FRONTEND_PID=$!
    PIDS+=($FRONTEND_PID)
    SERVICES+=("Frontend:http://localhost:$PORT:$FRONTEND_PID")
    
    cd ..
    print_success "Frontend server starting (PID: $FRONTEND_PID)..."
else
    print_warning "Skipping frontend server"
fi

# Start Tauri Development
if [[ "$SKIP_TAURI" != "true" ]]; then
    print_step "Starting Tauri development..."
    
    export NODE_ENV="development"
    
    if [[ "$VERBOSE" == "true" ]]; then
        cargo tauri dev --verbose > logs/tauri.log 2>&1 &
    else
        cargo tauri dev > logs/tauri.log 2>&1 &
    fi
    
    TAURI_PID=$!
    PIDS+=($TAURI_PID)
    SERVICES+=("Tauri:Desktop App:$TAURI_PID")
    
    print_success "Tauri development starting (PID: $TAURI_PID)..."
else
    print_warning "Skipping Tauri development"
fi

# Wait for servers to start
print_step "Waiting for servers to start..."
sleep 3

# Check server health
print_step "Checking server health..."

if [[ "$SKIP_BACKEND" != "true" ]]; then
    if curl -s "http://localhost:$API_PORT/health" > /dev/null 2>&1; then
        print_success "Backend server is healthy"
    else
        print_warning "Backend server not ready yet (this is normal)"
    fi
fi

if [[ "$SKIP_FRONTEND" != "true" ]]; then
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        print_success "Frontend server is healthy"
    else
        print_warning "Frontend server not ready yet (this is normal)"
    fi
fi

# Display running services
echo ""
echo -e "${GREEN}🚀 Development servers started!${NC}"
echo ""

for service in "${SERVICES[@]}"; do
    IFS=':' read -r name url pid <<< "$service"
    if kill -0 "$pid" 2>/dev/null; then
        echo -e "${GREEN}✅ $name: $url${NC}"
    else
        echo -e "${RED}❌ $name: Failed to start${NC}"
    fi
done

echo ""
echo -e "${CYAN}📋 Available Commands:${NC}"
echo -e "${WHITE}• Press 'Ctrl+C' to stop all servers${NC}"
echo -e "${WHITE}• Press 'r' + Enter to restart all servers${NC}"
echo -e "${WHITE}• Press 'l' + Enter to view logs${NC}"
echo -e "${WHITE}• Press 'h' + Enter to view health status${NC}"
echo -e "${WHITE}• Press 'q' + Enter to quit${NC}"
echo ""

# Monitor processes and handle user input
while true; do
    # Check if any processes have died
    for i in "${!PIDS[@]}"; do
        pid="${PIDS[$i]}"
        if ! kill -0 "$pid" 2>/dev/null; then
            service_info="${SERVICES[$i]}"
            IFS=':' read -r name url _ <<< "$service_info"
            print_error "$name has stopped (PID: $pid)"
            
            # Show last few lines of log
            log_file="logs/$(echo "$name" | tr '[:upper:]' '[:lower:]').log"
            if [[ -f "$log_file" ]]; then
                echo -e "${YELLOW}Last few lines from $name:${NC}"
                tail -n 5 "$log_file"
                echo ""
            fi
        fi
    done
    
    # Check for user input (non-blocking)
    if read -t 1 -n 1 key; then
        echo "" # New line after key press
        
        case "$key" in
            'r')
                print_step "Restarting all servers..."
                cleanup
                exec "$0" "$@"
                ;;
            'l')
                echo ""
                echo -e "${CYAN}📋 Recent Logs:${NC}"
                for service in "${SERVICES[@]}"; do
                    IFS=':' read -r name url pid <<< "$service"
                    log_file="logs/$(echo "$name" | tr '[:upper:]' '[:lower:]').log"
                    if [[ -f "$log_file" ]] && kill -0 "$pid" 2>/dev/null; then
                        echo -e "${YELLOW}--- $name ---${NC}"
                        tail -n 5 "$log_file"
                        echo ""
                    fi
                done
                ;;
            'h')
                echo ""
                echo -e "${CYAN}🏥 Health Status:${NC}"
                for service in "${SERVICES[@]}"; do
                    IFS=':' read -r name url pid <<< "$service"
                    if kill -0 "$pid" 2>/dev/null; then
                        echo -e "${WHITE}$name: ✅ Running (PID: $pid)${NC}"
                    else
                        echo -e "${WHITE}$name: ❌ Stopped${NC}"
                    fi
                done
                echo ""
                ;;
            'q')
                echo ""
                cleanup
                ;;
        esac
    fi
    
    sleep 0.5
done