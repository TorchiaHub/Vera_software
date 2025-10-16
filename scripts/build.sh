#!/bin/bash
# VERA Environmental Awareness - Build Script (Bash)
# Builds all components of the application for Unix-like systems (Linux/macOS)

set -e

# Default values
ENVIRONMENT="development"
SKIP_FRONTEND=false
SKIP_BACKEND=false
SKIP_TAURI=false
CLEAN=false
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
    echo "║                     Build Script                        ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Parse command line arguments
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Set environment (development|staging|production)"
    echo "  --skip-frontend         Skip frontend build"
    echo "  --skip-backend          Skip backend build"
    echo "  --skip-tauri            Skip Tauri build"
    echo "  --clean                 Clean previous builds"
    echo "  --verbose               Enable verbose output"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Build for development"
    echo "  $0 -e production                     # Build for production"
    echo "  $0 --clean --verbose                 # Clean build with verbose output"
    echo "  $0 --skip-tauri -e staging          # Build without Tauri for staging"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
                print_error "Invalid environment: $ENVIRONMENT"
                echo "Valid environments: development, staging, production"
                exit 1
            fi
            shift 2
            ;;
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
        --clean)
            CLEAN=true
            shift
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

# Record start time
START_TIME=$(date +%s)

# Display banner
print_banner

echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
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

# Check Rust (only if building Tauri)
if [[ "$SKIP_TAURI" != "true" ]]; then
    if command -v rustc &> /dev/null; then
        RUST_VERSION=$(rustc --version)
        print_success "Rust found: $RUST_VERSION"
    else
        print_error "Rust is not installed or not in PATH"
        print_warning "Please install Rust from https://rustup.rs/"
        exit 1
    fi
    
    # Check Tauri CLI
    if command -v cargo tauri &> /dev/null; then
        TAURI_VERSION=$(cargo tauri --version)
        print_success "Tauri CLI found: $TAURI_VERSION"
    else
        print_warning "Tauri CLI not found, installing..."
        cargo install tauri-cli
    fi
fi

# Set environment variables
print_step "Setting environment variables..."

export NODE_ENV="$ENVIRONMENT"
export VITE_APP_ENV="$ENVIRONMENT"

case "$ENVIRONMENT" in
    "development")
        export VITE_API_URL="http://localhost:3001"
        export VITE_APP_VERSION="dev"
        ;;
    "staging")
        export VITE_API_URL="https://api-staging.vera-env.com"
        export VITE_APP_VERSION="staging"
        ;;
    "production")
        export VITE_API_URL="https://api.vera-env.com"
        
        # Get version from package.json
        if [[ -f "package.json" ]]; then
            export VITE_APP_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
        else
            export VITE_APP_VERSION="1.0.0"
        fi
        ;;
esac

print_success "Environment variables set for $ENVIRONMENT"

# Clean previous builds
if [[ "$CLEAN" == "true" ]]; then
    print_step "Cleaning previous builds..."
    
    CLEAN_DIRS=("frontend/dist" "backend/dist" "src-tauri/target")
    
    for dir in "${CLEAN_DIRS[@]}"; do
        if [[ -d "$dir" ]]; then
            rm -rf "$dir"
            print_success "Cleaned $dir"
        fi
    done
fi

# Install dependencies
print_step "Installing dependencies..."

if [[ "$VERBOSE" == "true" ]]; then
    npm ci --verbose
else
    npm ci --silent
fi
print_success "Root dependencies installed"

# Bootstrap monorepo
print_step "Bootstrapping monorepo..."

if [[ "$VERBOSE" == "true" ]]; then
    npm run bootstrap -- --verbose
else
    npm run bootstrap --silent
fi
print_success "Monorepo bootstrapped"

# Build Frontend
if [[ "$SKIP_FRONTEND" != "true" ]]; then
    print_step "Building frontend..."
    
    cd frontend
    if [[ "$VERBOSE" == "true" ]]; then
        npm run build -- --mode "$ENVIRONMENT"
    else
        npm run build --silent -- --mode "$ENVIRONMENT"
    fi
    print_success "Frontend build completed"
    
    # Check if build output exists
    if [[ -d "dist" ]]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        print_success "Frontend build size: $BUILD_SIZE"
    fi
    cd ..
else
    print_warning "Skipping frontend build"
fi

# Build Backend
if [[ "$SKIP_BACKEND" != "true" ]]; then
    print_step "Building backend..."
    
    cd backend
    if [[ "$VERBOSE" == "true" ]]; then
        npm run build -- --verbose
    else
        npm run build --silent
    fi
    print_success "Backend build completed"
    
    # Check if build output exists
    if [[ -d "dist" ]]; then
        print_success "Backend compiled to dist/"
    fi
    cd ..
else
    print_warning "Skipping backend build"
fi

# Build Tauri App
if [[ "$SKIP_TAURI" != "true" ]]; then
    print_step "Building Tauri application..."
    
    if [[ "$VERBOSE" == "true" ]]; then
        cargo tauri build --verbose
    else
        cargo tauri build
    fi
    print_success "Tauri build completed"
    
    # Check if Tauri build output exists
    TAURI_OUTPUT="src-tauri/target/release"
    if [[ -d "$TAURI_OUTPUT" ]]; then
        # Find executables (platform-dependent)
        if [[ "$(uname)" == "Darwin" ]]; then
            # macOS
            APPS=$(find "$TAURI_OUTPUT" -name "*.app" -type d)
            if [[ -n "$APPS" ]]; then
                print_success "Tauri application(s) built:"
                while IFS= read -r app; do
                    SIZE=$(du -sh "$app" | cut -f1)
                    echo -e "${GREEN}  📦 $(basename "$app") ($SIZE)${NC}"
                done <<< "$APPS"
            fi
        else
            # Linux
            BINARIES=$(find "$TAURI_OUTPUT" -maxdepth 1 -type f -executable)
            if [[ -n "$BINARIES" ]]; then
                print_success "Tauri executable(s) built:"
                while IFS= read -r binary; do
                    SIZE=$(du -sh "$binary" | cut -f1)
                    echo -e "${GREEN}  📦 $(basename "$binary") ($SIZE)${NC}"
                done <<< "$BINARIES"
            fi
        fi
        
        # Check for installers/packages
        BUNDLE_DIR="src-tauri/target/release/bundle"
        if [[ -d "$BUNDLE_DIR" ]]; then
            if [[ "$(uname)" == "Darwin" ]]; then
                DMGS=$(find "$BUNDLE_DIR" -name "*.dmg")
                if [[ -n "$DMGS" ]]; then
                    print_success "macOS installer(s) built:"
                    while IFS= read -r dmg; do
                        SIZE=$(du -sh "$dmg" | cut -f1)
                        echo -e "${GREEN}  📦 $(basename "$dmg") ($SIZE)${NC}"
                    done <<< "$DMGS"
                fi
            else
                DEBS=$(find "$BUNDLE_DIR" -name "*.deb")
                RPMS=$(find "$BUNDLE_DIR" -name "*.rpm")
                APPIMAGES=$(find "$BUNDLE_DIR" -name "*.AppImage")
                
                if [[ -n "$DEBS" ]]; then
                    print_success "Debian package(s) built:"
                    while IFS= read -r deb; do
                        SIZE=$(du -sh "$deb" | cut -f1)
                        echo -e "${GREEN}  📦 $(basename "$deb") ($SIZE)${NC}"
                    done <<< "$DEBS"
                fi
                
                if [[ -n "$RPMS" ]]; then
                    print_success "RPM package(s) built:"
                    while IFS= read -r rpm; do
                        SIZE=$(du -sh "$rpm" | cut -f1)
                        echo -e "${GREEN}  📦 $(basename "$rpm") ($SIZE)${NC}"
                    done <<< "$RPMS"
                fi
                
                if [[ -n "$APPIMAGES" ]]; then
                    print_success "AppImage(s) built:"
                    while IFS= read -r appimage; do
                        SIZE=$(du -sh "$appimage" | cut -f1)
                        echo -e "${GREEN}  📦 $(basename "$appimage") ($SIZE)${NC}"
                    done <<< "$APPIMAGES"
                fi
            fi
        fi
    fi
else
    print_warning "Skipping Tauri build"
fi

# Generate build summary
print_step "Generating build summary..."

cat > build-summary.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "environment": "$ENVIRONMENT",
  "platform": "$(uname -s)",
  "node_version": "$NODE_VERSION",
  "components": {
EOF

FIRST_COMPONENT=true

if [[ "$SKIP_FRONTEND" != "true" && -d "frontend/dist" ]]; then
    FRONTEND_SIZE=$(du -sb frontend/dist | cut -f1)
    FRONTEND_SIZE_MB=$(echo "scale=2; $FRONTEND_SIZE / 1024 / 1024" | bc)
    
    if [[ "$FIRST_COMPONENT" == "false" ]]; then
        echo "," >> build-summary.json
    fi
    
    cat >> build-summary.json << EOF
    "frontend": {
      "built": true,
      "size_bytes": $FRONTEND_SIZE,
      "size_mb": $FRONTEND_SIZE_MB
    }
EOF
    FIRST_COMPONENT=false
fi

if [[ "$SKIP_BACKEND" != "true" && -d "backend/dist" ]]; then
    BACKEND_SIZE=$(du -sb backend/dist | cut -f1)
    BACKEND_SIZE_MB=$(echo "scale=2; $BACKEND_SIZE / 1024 / 1024" | bc)
    
    if [[ "$FIRST_COMPONENT" == "false" ]]; then
        echo "," >> build-summary.json
    fi
    
    cat >> build-summary.json << EOF
    "backend": {
      "built": true,
      "size_bytes": $BACKEND_SIZE,
      "size_mb": $BACKEND_SIZE_MB
    }
EOF
    FIRST_COMPONENT=false
fi

if [[ "$SKIP_TAURI" != "true" && -d "src-tauri/target/release" ]]; then
    TAURI_SIZE=$(du -sb src-tauri/target/release | cut -f1)
    TAURI_SIZE_MB=$(echo "scale=2; $TAURI_SIZE / 1024 / 1024" | bc)
    
    if [[ "$FIRST_COMPONENT" == "false" ]]; then
        echo "," >> build-summary.json
    fi
    
    cat >> build-summary.json << EOF
    "tauri": {
      "built": true,
      "size_bytes": $TAURI_SIZE,
      "size_mb": $TAURI_SIZE_MB
    }
EOF
fi

cat >> build-summary.json << EOF
  }
}
EOF

print_success "Build summary saved to build-summary.json"

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
DURATION_MIN=$((DURATION / 60))
DURATION_SEC=$((DURATION % 60))

# Final success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 🎉 BUILD COMPLETED! 🎉                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}Build Summary:${NC}"
echo -e "${WHITE}Environment: $ENVIRONMENT${NC}"
echo -e "${WHITE}Duration: ${DURATION_MIN}m ${DURATION_SEC}s${NC}"

if [[ "$SKIP_FRONTEND" != "true" ]]; then
    echo -e "${GREEN}✅ Frontend: Built successfully${NC}"
fi
if [[ "$SKIP_BACKEND" != "true" ]]; then
    echo -e "${GREEN}✅ Backend: Built successfully${NC}"
fi
if [[ "$SKIP_TAURI" != "true" ]]; then
    echo -e "${GREEN}✅ Tauri: Built successfully${NC}"
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
if [[ "$ENVIRONMENT" == "development" ]]; then
    echo -e "${WHITE}• Run './scripts/dev.sh' to start development server${NC}"
    echo -e "${WHITE}• Run 'npm test' to run tests${NC}"
else
    echo -e "${WHITE}• Deploy the built artifacts to your server${NC}"
    echo -e "${WHITE}• Check build-summary.json for details${NC}"
fi
echo ""

exit 0