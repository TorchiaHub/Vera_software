// Permission management for VERA Tauri application

use tauri::{Manager, AppHandle};

/// Check if the application has required system permissions
pub fn check_system_permissions() -> Result<bool, String> {
    // Check for required permissions based on platform
    #[cfg(target_os = "windows")]
    {
        check_windows_permissions()
    }
    
    #[cfg(target_os = "macos")]
    {
        check_macos_permissions()
    }
    
    #[cfg(target_os = "linux")]
    {
        check_linux_permissions()
    }
}

#[cfg(target_os = "windows")]
fn check_windows_permissions() -> Result<bool, String> {
    // Check for Windows performance counter access
    use std::process::Command;
    
    let output = Command::new("powershell")
        .args(&[
            "-Command",
            "Get-Counter -ListSet 'Processor' -ErrorAction SilentlyContinue"
        ])
        .output();
    
    match output {
        Ok(result) => {
            if result.status.success() {
                Ok(true)
            } else {
                Err("Performance counter access denied".to_string())
            }
        }
        Err(e) => Err(format!("Failed to check permissions: {}", e))
    }
}

#[cfg(target_os = "macos")]
fn check_macos_permissions() -> Result<bool, String> {
    // Check for macOS system monitoring permissions
    use std::process::Command;
    
    let output = Command::new("system_profiler")
        .args(&["SPHardwareDataType"])
        .output();
    
    match output {
        Ok(result) => {
            if result.status.success() {
                Ok(true)
            } else {
                Err("System profiler access denied".to_string())
            }
        }
        Err(e) => Err(format!("Failed to check permissions: {}", e))
    }
}

#[cfg(target_os = "linux")]
fn check_linux_permissions() -> Result<bool, String> {
    // Check for Linux /proc filesystem access
    use std::fs;
    
    match fs::read_to_string("/proc/cpuinfo") {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Failed to access /proc filesystem: {}", e))
    }
}

/// Request elevated permissions if needed
pub async fn request_permissions(app_handle: AppHandle) -> Result<(), String> {
    let has_permissions = check_system_permissions()?;
    
    if !has_permissions {
        // Show permission request dialog
        let message = "VERA requires system monitoring permissions to function properly. Please grant the necessary permissions.";
        
        match app_handle.dialog().message(message).show().await {
            true => {
                // User accepted, attempt to request permissions
                request_system_permissions().await
            }
            false => {
                Err("User denied permission request".to_string())
            }
        }
    } else {
        Ok(())
    }
}

async fn request_system_permissions() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // On Windows, we might need to run as administrator
        // This is typically handled at startup or installation
        Ok(())
    }
    
    #[cfg(target_os = "macos")]
    {
        // On macOS, request accessibility permissions
        request_macos_accessibility_permissions().await
    }
    
    #[cfg(target_os = "linux")]
    {
        // On Linux, check if user is in appropriate groups
        check_linux_user_groups()
    }
}

#[cfg(target_os = "macos")]
async fn request_macos_accessibility_permissions() -> Result<(), String> {
    use std::process::Command;
    
    // Open System Preferences to accessibility settings
    let output = Command::new("open")
        .args(&["x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"])
        .output();
    
    match output {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to open accessibility settings: {}", e))
    }
}

#[cfg(target_os = "linux")]
fn check_linux_user_groups() -> Result<(), String> {
    use std::process::Command;
    
    let output = Command::new("groups")
        .output();
    
    match output {
        Ok(result) => {
            let groups = String::from_utf8_lossy(&result.stdout);
            if groups.contains("adm") || groups.contains("sudo") {
                Ok(())
            } else {
                Err("User needs to be in 'adm' or 'sudo' group for system monitoring".to_string())
            }
        }
        Err(e) => Err(format!("Failed to check user groups: {}", e))
    }
}

/// Check if running with elevated privileges
pub fn is_elevated() -> bool {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        let output = Command::new("net")
            .args(&["session"])
            .output();
        
        match output {
            Ok(result) => result.status.success(),
            Err(_) => false
        }
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        use std::process::Command;
        
        let output = Command::new("id")
            .args(&["-u"])
            .output();
        
        match output {
            Ok(result) => {
                let uid = String::from_utf8_lossy(&result.stdout).trim();
                uid == "0"
            }
            Err(_) => false
        }
    }
}