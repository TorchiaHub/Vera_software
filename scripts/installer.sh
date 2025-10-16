#!/bin/bash
# VERA Environmental Awareness - Installer Script (Bash)
# Installs VERA Environmental Awareness application on Unix-like systems

set -e

# Default values
INSTALL_SCOPE="user"
INSTALL_PREFIX=""
CREATE_DESKTOP_SHORTCUT=false
CREATE_MENU_SHORTCUT=false
ADD_TO_PATH=false
SILENT=false
UNINSTALL=false
FORCE=false

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
    [[ "$SILENT" != "true" ]] && echo -e "${CYAN}🔧 $1${NC}"
}

print_success() {
    [[ "$SILENT" != "true" ]] && echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

print_warning() {
    [[ "$SILENT" != "true" ]] && echo -e "${YELLOW}⚠️  $1${NC}"
}

print_banner() {
    if [[ "$SILENT" != "true" ]]; then
        echo -e "${CYAN}"
        echo "╔══════════════════════════════════════════════════════════╗"
        echo "║               VERA Environmental Awareness              ║"
        echo "║                    Unix Installer                       ║"
        echo "╚══════════════════════════════════════════════════════════╝"
        echo -e "${NC}"
    fi
}

# Check if running as root
is_root() {
    [[ $EUID -eq 0 ]]
}

# Parse command line arguments
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --install-scope SCOPE       Installation scope (user|system) [default: user]"
    echo "  --prefix PATH               Installation prefix (overrides default)"
    echo "  --desktop-shortcut          Create desktop shortcut"
    echo "  --menu-shortcut             Create application menu shortcut"
    echo "  --add-to-path               Add to PATH environment variable"
    echo "  --silent                    Silent installation"
    echo "  --uninstall                 Uninstall the application"
    echo "  --force                     Force overwrite existing installation"
    echo "  -h, --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                          # User installation"
    echo "  sudo $0 --install-scope system             # System-wide installation"
    echo "  $0 --desktop-shortcut --menu-shortcut      # With shortcuts"
    echo "  $0 --uninstall                             # Uninstall"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --install-scope)
            INSTALL_SCOPE="$2"
            if [[ ! "$INSTALL_SCOPE" =~ ^(user|system)$ ]]; then
                print_error "Invalid install scope: $INSTALL_SCOPE"
                echo "Valid scopes: user, system"
                exit 1
            fi
            shift 2
            ;;
        --prefix)
            INSTALL_PREFIX="$2"
            shift 2
            ;;
        --desktop-shortcut)
            CREATE_DESKTOP_SHORTCUT=true
            shift
            ;;
        --menu-shortcut)
            CREATE_MENU_SHORTCUT=true
            shift
            ;;
        --add-to-path)
            ADD_TO_PATH=true
            shift
            ;;
        --silent)
            SILENT=true
            shift
            ;;
        --uninstall)
            UNINSTALL=true
            shift
            ;;
        --force)
            FORCE=true
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

# Constants
APP_NAME="VERA Environmental Awareness"
APP_ID="vera-environmental-awareness"
APP_VERSION="1.0.0"
APP_PUBLISHER="VERA Team"
APP_DESCRIPTION="Environmental awareness and energy monitoring application"

# Set default install paths
if [[ -z "$INSTALL_PREFIX" ]]; then
    if [[ "$INSTALL_SCOPE" == "system" ]]; then
        INSTALL_PREFIX="/opt"
        BIN_DIR="/usr/local/bin"
        DESKTOP_DIR="/usr/share/applications"
    else
        INSTALL_PREFIX="$HOME/.local/share"
        BIN_DIR="$HOME/.local/bin"
        DESKTOP_DIR="$HOME/.local/share/applications"
    fi
fi

INSTALL_DIR="$INSTALL_PREFIX/$APP_ID"
UNINSTALL_SCRIPT="$INSTALL_DIR/uninstall.sh"

# Check for existing installation
check_existing_installation() {
    if [[ -d "$INSTALL_DIR" ]] || [[ -f "$BIN_DIR/$APP_ID" ]]; then
        return 0
    else
        return 1
    fi
}

# Uninstall function
uninstall_application() {
    print_step "Uninstalling $APP_NAME..."
    
    if ! check_existing_installation; then
        print_warning "$APP_NAME is not installed"
        return
    fi
    
    # Remove application directory
    if [[ -d "$INSTALL_DIR" ]]; then
        print_step "Removing application files from $INSTALL_DIR..."
        rm -rf "$INSTALL_DIR"
        print_success "Application files removed"
    fi
    
    # Remove binary symlink
    if [[ -f "$BIN_DIR/$APP_ID" ]]; then
        rm -f "$BIN_DIR/$APP_ID"
        print_success "Binary symlink removed"
    fi
    
    # Remove desktop shortcut
    local desktop_file=""
    if [[ "$INSTALL_SCOPE" == "system" ]]; then
        desktop_file="/usr/share/applications/$APP_ID.desktop"
    else
        desktop_file="$HOME/.local/share/applications/$APP_ID.desktop"
    fi
    
    if [[ -f "$desktop_file" ]]; then
        rm -f "$desktop_file"
        print_success "Desktop shortcut removed"
    fi
    
    # Remove from PATH (user scope only)
    if [[ "$INSTALL_SCOPE" == "user" && "$ADD_TO_PATH" == "true" ]]; then
        local shell_rc=""
        if [[ -f "$HOME/.bashrc" ]]; then
            shell_rc="$HOME/.bashrc"
        elif [[ -f "$HOME/.zshrc" ]]; then
            shell_rc="$HOME/.zshrc"
        fi
        
        if [[ -n "$shell_rc" ]]; then
            sed -i.bak "/# VERA Environmental Awareness PATH/d" "$shell_rc"
            sed -i.bak "\|export PATH.*$BIN_DIR|d" "$shell_rc"
            print_success "Removed from PATH in $shell_rc"
        fi
    fi
    
    print_success "$APP_NAME has been uninstalled successfully"
}

# Handle uninstall request
if [[ "$UNINSTALL" == "true" ]]; then
    uninstall_application
    exit 0
fi

# Display banner
print_banner

# Check for system installation privileges
if [[ "$INSTALL_SCOPE" == "system" ]] && ! is_root; then
    print_error "System-wide installation requires root privileges"
    print_warning "Please run with sudo or use --install-scope user"
    exit 1
fi

# Check for existing installation
if check_existing_installation; then
    if [[ "$FORCE" == "true" ]]; then
        print_warning "Existing installation found. Uninstalling first..."
        uninstall_application
    else
        print_error "An existing installation was found"
        print_warning "Use --force to overwrite or --uninstall to remove first"
        exit 1
    fi
fi

# Look for installation files
print_step "Looking for installation files..."

declare -a installer_files=()
bundle_dir="src-tauri/target/release/bundle"

if [[ -d "$bundle_dir" ]]; then
    # Look for platform-specific packages
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        mapfile -t dmg_files < <(find "$bundle_dir" -name "*.dmg" 2>/dev/null || true)
        mapfile -t app_files < <(find "$bundle_dir" -name "*.app" -type d 2>/dev/null || true)
        installer_files+=("${dmg_files[@]}" "${app_files[@]}")
    else
        # Linux
        mapfile -t deb_files < <(find "$bundle_dir" -name "*.deb" 2>/dev/null || true)
        mapfile -t rpm_files < <(find "$bundle_dir" -name "*.rpm" 2>/dev/null || true)
        mapfile -t appimage_files < <(find "$bundle_dir" -name "*.AppImage" 2>/dev/null || true)
        installer_files+=("${deb_files[@]}" "${rpm_files[@]}" "${appimage_files[@]}")
    fi
fi

# Also check for direct executable
release_dir="src-tauri/target/release"
if [[ -d "$release_dir" ]]; then
    direct_exe=$(find "$release_dir" -maxdepth 1 -name "$APP_ID" -type f -executable 2>/dev/null | head -n1)
    if [[ -n "$direct_exe" ]]; then
        installer_files+=("$direct_exe")
    fi
fi

if [[ ${#installer_files[@]} -eq 0 ]]; then
    print_error "No installation files found"
    print_warning "Please build the application first with: ./scripts/build.sh"
    exit 1
fi

# Select the best installer
selected_installer="${installer_files[0]}"
for file in "${installer_files[@]}"; do
    # Prefer .deb on Debian/Ubuntu, .rpm on RedHat/SUSE, etc.
    if [[ "$(uname)" == "Linux" ]]; then
        if command -v apt &> /dev/null && [[ "$file" == *.deb ]]; then
            selected_installer="$file"
            break
        elif command -v yum &> /dev/null && [[ "$file" == *.rpm ]]; then
            selected_installer="$file"
            break
        elif [[ "$file" == *.AppImage ]]; then
            selected_installer="$file"
        fi
    elif [[ "$(uname)" == "Darwin" && "$file" == *.app ]]; then
        selected_installer="$file"
        break
    fi
done

print_success "Found installer: $(basename "$selected_installer")"

# Create installation directory
print_step "Creating installation directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
if [[ "$CREATE_MENU_SHORTCUT" == "true" ]]; then
    mkdir -p "$DESKTOP_DIR"
fi

# Install the application
print_step "Installing application files..."

case "$selected_installer" in
    *.deb)
        # Debian package
        print_step "Installing Debian package..."
        if [[ "$INSTALL_SCOPE" == "system" ]]; then
            dpkg -i "$selected_installer"
        else
            print_warning "Debian packages typically require system installation"
            print_step "Extracting package contents..."
            ar x "$selected_installer"
            tar -xf data.tar.*
            cp -r usr/* "$INSTALL_PREFIX/"
            rm -f debian-binary control.tar.* data.tar.*
        fi
        print_success "Debian package installed"
        ;;
    *.rpm)
        # RPM package
        print_step "Installing RPM package..."
        if [[ "$INSTALL_SCOPE" == "system" ]]; then
            rpm -i "$selected_installer"
        else
            print_warning "RPM packages typically require system installation"
            print_step "Extracting package contents..."
            rpm2cpio "$selected_installer" | cpio -idmv
            cp -r usr/* "$INSTALL_PREFIX/"
        fi
        print_success "RPM package installed"
        ;;
    *.AppImage)
        # AppImage
        print_step "Installing AppImage..."
        cp "$selected_installer" "$INSTALL_DIR/$APP_ID.AppImage"
        chmod +x "$INSTALL_DIR/$APP_ID.AppImage"
        
        # Create wrapper script
        cat > "$INSTALL_DIR/$APP_ID" << EOF
#!/bin/bash
exec "$INSTALL_DIR/$APP_ID.AppImage" "\$@"
EOF
        chmod +x "$INSTALL_DIR/$APP_ID"
        print_success "AppImage installed"
        ;;
    *.app)
        # macOS app bundle
        print_step "Installing macOS application..."
        if [[ "$INSTALL_SCOPE" == "system" ]]; then
            cp -r "$selected_installer" "/Applications/"
        else
            cp -r "$selected_installer" "$HOME/Applications/"
        fi
        
        # Create command-line wrapper
        app_name=$(basename "$selected_installer")
        executable_path="$selected_installer/Contents/MacOS/$APP_ID"
        if [[ -f "$executable_path" ]]; then
            cat > "$INSTALL_DIR/$APP_ID" << EOF
#!/bin/bash
exec "$executable_path" "\$@"
EOF
            chmod +x "$INSTALL_DIR/$APP_ID"
        fi
        print_success "macOS application installed"
        ;;
    *)
        # Direct executable
        print_step "Installing executable..."
        cp "$selected_installer" "$INSTALL_DIR/$APP_ID"
        chmod +x "$INSTALL_DIR/$APP_ID"
        print_success "Executable installed"
        ;;
esac

# Create binary symlink
if [[ -f "$INSTALL_DIR/$APP_ID" ]]; then
    ln -sf "$INSTALL_DIR/$APP_ID" "$BIN_DIR/$APP_ID"
    print_success "Binary symlink created: $BIN_DIR/$APP_ID"
fi

# Create uninstaller script
print_step "Creating uninstaller..."
cat > "$UNINSTALL_SCRIPT" << EOF
#!/bin/bash
# VERA Environmental Awareness Uninstaller

echo "Uninstalling $APP_NAME..."

# Remove installation directory
if [[ -d "$INSTALL_DIR" ]]; then
    rm -rf "$INSTALL_DIR"
    echo "✅ Application files removed"
fi

# Remove binary symlink
if [[ -f "$BIN_DIR/$APP_ID" ]]; then
    rm -f "$BIN_DIR/$APP_ID"
    echo "✅ Binary symlink removed"
fi

# Remove desktop file
desktop_file="$DESKTOP_DIR/$APP_ID.desktop"
if [[ -f "\$desktop_file" ]]; then
    rm -f "\$desktop_file"
    echo "✅ Desktop shortcut removed"
fi

echo "✅ $APP_NAME has been uninstalled"
EOF

chmod +x "$UNINSTALL_SCRIPT"
print_success "Uninstaller created"

# Create desktop shortcut
if [[ "$CREATE_DESKTOP_SHORTCUT" == "true" ]]; then
    print_step "Creating desktop shortcut..."
    
    desktop_file="$HOME/Desktop/$APP_ID.desktop"
    cat > "$desktop_file" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=$APP_DESCRIPTION
Exec=$INSTALL_DIR/$APP_ID
Icon=$INSTALL_DIR/icon.png
Terminal=false
Categories=Utility;Science;
EOF
    
    chmod +x "$desktop_file"
    print_success "Desktop shortcut created"
fi

# Create application menu shortcut
if [[ "$CREATE_MENU_SHORTCUT" == "true" ]]; then
    print_step "Creating application menu shortcut..."
    
    desktop_file="$DESKTOP_DIR/$APP_ID.desktop"
    cat > "$desktop_file" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=$APP_DESCRIPTION
Exec=$INSTALL_DIR/$APP_ID
Icon=$INSTALL_DIR/icon.png
Terminal=false
Categories=Utility;Science;
EOF
    
    print_success "Application menu shortcut created"
fi

# Add to PATH
if [[ "$ADD_TO_PATH" == "true" && "$INSTALL_SCOPE" == "user" ]]; then
    print_step "Adding to PATH..."
    
    # Determine shell RC file
    shell_rc=""
    if [[ -n "$BASH_VERSION" && -f "$HOME/.bashrc" ]]; then
        shell_rc="$HOME/.bashrc"
    elif [[ -n "$ZSH_VERSION" && -f "$HOME/.zshrc" ]]; then
        shell_rc="$HOME/.zshrc"
    elif [[ -f "$HOME/.profile" ]]; then
        shell_rc="$HOME/.profile"
    fi
    
    if [[ -n "$shell_rc" ]]; then
        if ! grep -q "$BIN_DIR" "$shell_rc"; then
            echo "" >> "$shell_rc"
            echo "# VERA Environmental Awareness PATH" >> "$shell_rc"
            echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$shell_rc"
            print_success "Added to PATH in $shell_rc"
            print_warning "Please restart your shell or run: source $shell_rc"
        else
            print_warning "Already in PATH"
        fi
    else
        print_warning "Could not determine shell RC file for PATH modification"
    fi
fi

# Installation summary
if [[ "$SILENT" != "true" ]]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              🎉 INSTALLATION COMPLETED! 🎉              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}Installation Summary:${NC}"
    echo -e "${WHITE}• Application: $APP_NAME v$APP_VERSION${NC}"
    echo -e "${WHITE}• Location: $INSTALL_DIR${NC}"
    echo -e "${WHITE}• Scope: $INSTALL_SCOPE${NC}"
    echo -e "${WHITE}• Binary: $BIN_DIR/$APP_ID${NC}"
    
    if [[ "$CREATE_DESKTOP_SHORTCUT" == "true" ]]; then
        echo -e "${WHITE}• Desktop shortcut: Created${NC}"
    fi
    if [[ "$CREATE_MENU_SHORTCUT" == "true" ]]; then
        echo -e "${WHITE}• Menu shortcut: Created${NC}"
    fi
    if [[ "$ADD_TO_PATH" == "true" ]]; then
        echo -e "${WHITE}• Added to PATH: Yes${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "${WHITE}• Run '$APP_ID' from terminal${NC}"
    echo -e "${WHITE}• Or launch from application menu/desktop${NC}"
    echo -e "${WHITE}• To uninstall: $UNINSTALL_SCRIPT${NC}"
    echo ""
fi

exit 0