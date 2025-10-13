use serde::{Deserialize, Serialize};
use sysinfo::{System, Disk, Process, Pid, CpuRefreshKind, RefreshKind};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu: CpuMetrics,
    pub gpu: GpuMetrics,
    pub ram: RamMetrics,
    pub disk: DiskMetrics,
    pub power: PowerMetrics,
    pub system: SystemInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuMetrics {
    pub usage: f32,
    pub temperature: f32,
    pub cores: usize,
    pub frequency: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuMetrics {
    pub usage: f32,
    pub temperature: f32,
    pub memory: u64,
    pub memory_total: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RamMetrics {
    pub used: u64,
    pub total: u64,
    pub percentage: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskMetrics {
    pub read_speed: f32,
    pub write_speed: f32,
    pub usage: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PowerMetrics {
    pub source: String,
    pub battery_percentage: f32,
    pub power_draw: f32,
    pub estimated_time: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub uptime: u64,
    pub processes: usize,
    pub temperature: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveApplication {
    pub name: String,
    pub category: String,
    pub duration: u64,
    pub cpu_usage: f32,
    pub memory_usage: u64,
}

pub struct SystemMonitor {
    system: System,
    last_disk_read: u64,
    last_disk_write: u64,
    app_start_times: HashMap<Pid, u64>,
}

impl SystemMonitor {
    pub fn new() -> Self {
        let mut system = System::new_all();
        system.refresh_all();
        
        Self {
            system,
            last_disk_read: 0,
            last_disk_write: 0,
            app_start_times: HashMap::new(),
        }
    }

    pub fn get_metrics(&mut self) -> SystemMetrics {
        // Refresh system information
        self.system.refresh_all();

        let cpu_metrics = self.get_cpu_metrics();
        let gpu_metrics = self.get_gpu_metrics();
        let ram_metrics = self.get_ram_metrics();
        let disk_metrics = self.get_disk_metrics();
        let power_metrics = self.get_power_metrics();
        let system_info = self.get_system_info();

        SystemMetrics {
            cpu: cpu_metrics,
            gpu: gpu_metrics,
            ram: ram_metrics,
            disk: disk_metrics,
            power: power_metrics,
            system: system_info,
        }
    }

    fn get_cpu_metrics(&self) -> CpuMetrics {
        let global_cpu = self.system.global_cpu_info();
        let cpu_usage = global_cpu.cpu_usage();
        let cores = self.system.cpus().len();
        
        // Get CPU frequency (in MHz)
        let frequency = global_cpu.frequency();
        
        // CPU temperature (may not be available on all systems)
        let temperature = self.get_cpu_temperature();

        CpuMetrics {
            usage: cpu_usage,
            temperature,
            cores,
            frequency,
        }
    }

    fn get_cpu_temperature(&self) -> f32 {
        // Try to get CPU temperature using sysinfo components
        // This may not work on all platforms
        #[cfg(target_os = "linux")]
        {
            use sysinfo::Components;
            let components = Components::new_with_refreshed_list();
            for component in &components {
                if component.label().contains("CPU") || component.label().contains("Core") {
                    return component.temperature();
                }
            }
        }
        
        #[cfg(target_os = "windows")]
        {
            // Windows temperature monitoring requires WMI or other methods
            // For now, return estimated temperature based on CPU usage
            let cpu_usage = self.system.global_cpu_info().cpu_usage();
            return 40.0 + (cpu_usage * 0.5); // Estimate: 40°C base + usage factor
        }
        
        #[cfg(target_os = "macos")]
        {
            // macOS temperature monitoring is complex
            // Return estimated temperature for now
            let cpu_usage = self.system.global_cpu_info().cpu_usage();
            return 45.0 + (cpu_usage * 0.4);
        }
        
        50.0 // Default fallback
    }

    fn get_gpu_metrics(&self) -> GpuMetrics {
        // GPU monitoring is platform-specific and complex
        // For now, we'll return estimated values
        // In production, you'd use NVML for NVIDIA, AMD libraries, etc.
        
        let cpu_usage = self.system.global_cpu_info().cpu_usage();
        let estimated_gpu_usage = (cpu_usage * 0.7).min(100.0);
        
        GpuMetrics {
            usage: estimated_gpu_usage,
            temperature: 50.0 + (estimated_gpu_usage * 0.4),
            memory: 2048 * 1024 * 1024, // 2 GB in bytes
            memory_total: 8192 * 1024 * 1024, // 8 GB in bytes
        }
    }

    fn get_ram_metrics(&self) -> RamMetrics {
        let total = self.system.total_memory();
        let used = self.system.used_memory();
        let percentage = (used as f32 / total as f32) * 100.0;

        RamMetrics {
            used,
            total,
            percentage,
        }
    }

    fn get_disk_metrics(&mut self) -> DiskMetrics {
        let disks = sysinfo::Disks::new_with_refreshed_list();
        
        let mut total_space = 0u64;
        let mut available_space = 0u64;
        
        for disk in &disks {
            total_space += disk.total_space();
            available_space += disk.available_space();
        }
        
        let usage = if total_space > 0 {
            ((total_space - available_space) as f32 / total_space as f32) * 100.0
        } else {
            0.0
        };

        // Disk speed monitoring would require tracking I/O over time
        // For now, return simulated values based on system activity
        let read_speed = (self.system.global_cpu_info().cpu_usage() * 5.0).min(500.0);
        let write_speed = (self.system.global_cpu_info().cpu_usage() * 3.0).min(300.0);

        DiskMetrics {
            read_speed,
            write_speed,
            usage,
        }
    }

    fn get_power_metrics(&self) -> PowerMetrics {
        // Power monitoring is platform-specific
        // This is a simplified implementation
        
        #[cfg(target_os = "windows")]
        {
            // On Windows, you'd use Windows API to get battery info
            // For now, return AC power as default
            return PowerMetrics {
                source: "ac".to_string(),
                battery_percentage: 100.0,
                power_draw: self.estimate_power_draw(),
                estimated_time: 0,
            };
        }
        
        #[cfg(target_os = "linux")]
        {
            // On Linux, check /sys/class/power_supply/
            // For now, return estimated values
            return PowerMetrics {
                source: "ac".to_string(),
                battery_percentage: 100.0,
                power_draw: self.estimate_power_draw(),
                estimated_time: 0,
            };
        }
        
        #[cfg(target_os = "macos")]
        {
            // On macOS, you'd use IOKit
            return PowerMetrics {
                source: "ac".to_string(),
                battery_percentage: 100.0,
                power_draw: self.estimate_power_draw(),
                estimated_time: 0,
            };
        }
    }

    fn estimate_power_draw(&self) -> f32 {
        let cpu_usage = self.system.global_cpu_info().cpu_usage();
        // Estimate: Base 30W + CPU usage factor
        30.0 + (cpu_usage * 1.5)
    }

    fn get_system_info(&self) -> SystemInfo {
        let uptime = System::uptime();
        let processes = self.system.processes().len();
        
        // Average temperature estimate
        let cpu_temp = self.get_cpu_temperature();
        let temperature = cpu_temp * 0.9; // System temp slightly lower than CPU

        SystemInfo {
            uptime,
            processes,
            temperature,
        }
    }

    pub fn get_active_applications(&mut self) -> Vec<ActiveApplication> {
        self.system.refresh_processes();
        
        let mut apps: Vec<ActiveApplication> = Vec::new();
        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Get top processes by CPU and memory usage
        let mut processes: Vec<_> = self.system.processes().iter().collect();
        processes.sort_by(|a, b| {
            let a_score = a.1.cpu_usage() + (a.1.memory() as f32 / 1024.0 / 1024.0);
            let b_score = b.1.cpu_usage() + (b.1.memory() as f32 / 1024.0 / 1024.0);
            b_score.partial_cmp(&a_score).unwrap()
        });

        for (pid, process) in processes.iter().take(10) {
            let name = process.name().to_string_lossy().to_string();
            
            // Skip system processes
            if name.is_empty() || name.starts_with('[') {
                continue;
            }

            // Track app start time
            if !self.app_start_times.contains_key(pid) {
                self.app_start_times.insert(**pid, current_time);
            }

            let start_time = self.app_start_times.get(pid).unwrap_or(&current_time);
            let duration = current_time.saturating_sub(*start_time);

            let category = categorize_application(&name);
            
            apps.push(ActiveApplication {
                name: name.clone(),
                category,
                duration,
                cpu_usage: process.cpu_usage(),
                memory_usage: process.memory() / (1024 * 1024), // Convert to MB
            });
        }

        apps
    }
}

fn categorize_application(name: &str) -> String {
    let name_lower = name.to_lowercase();
    
    if name_lower.contains("code") || name_lower.contains("visual studio") || 
       name_lower.contains("intellij") || name_lower.contains("sublime") {
        "Development".to_string()
    } else if name_lower.contains("chrome") || name_lower.contains("firefox") || 
              name_lower.contains("safari") || name_lower.contains("edge") || 
              name_lower.contains("browser") {
        "Browser".to_string()
    } else if name_lower.contains("spotify") || name_lower.contains("vlc") || 
              name_lower.contains("media") || name_lower.contains("music") {
        "Media".to_string()
    } else if name_lower.contains("discord") || name_lower.contains("slack") || 
              name_lower.contains("teams") || name_lower.contains("zoom") {
        "Communication".to_string()
    } else if name_lower.contains("figma") || name_lower.contains("photoshop") || 
              name_lower.contains("illustrator") || name_lower.contains("blender") {
        "Design".to_string()
    } else {
        "Other".to_string()
    }
}

impl Default for SystemMonitor {
    fn default() -> Self {
        Self::new()
    }
}
