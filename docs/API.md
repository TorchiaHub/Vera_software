# VERA API Documentation

## Overview

The VERA backend API provides comprehensive endpoints for environmental monitoring, energy tracking, and user management. Built with Express.js and TypeScript, it follows RESTful principles and includes robust authentication, validation, and error handling.

## Base Configuration

- **Base URL**: `http://localhost:3001/api`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`
- **API Version**: v2.0.0

## Authentication

### Overview
VERA uses JWT (JSON Web Tokens) for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-10-16T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/refresh
Refresh access token.

**Headers:**
```
Authorization: Bearer <current-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "1h"
  }
}
```

#### POST /auth/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /auth/reset-password
Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token_123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## User Management

### GET /users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "preferences": {
        "theme": "dark",
        "notifications": true,
        "language": "en"
      },
      "createdAt": "2025-10-16T10:00:00Z",
      "updatedAt": "2025-10-16T12:00:00Z"
    }
  }
}
```

### PUT /users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Smith",
      "avatar": "https://example.com/new-avatar.jpg"
    }
  }
}
```

### GET /users/preferences
Get user preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en",
      "energyGoals": {
        "daily": 50,
        "weekly": 300,
        "monthly": 1200,
        "carbonFootprint": 100,
        "efficiency": 0.85
      }
    }
  }
}
```

### PUT /users/preferences
Update user preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "theme": "light",
  "notifications": false,
  "energyGoals": {
    "daily": 45,
    "weekly": 280,
    "monthly": 1100
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Preferences updated successfully"
}
```

## Energy Monitoring

### POST /energy/data
Submit energy consumption data.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deviceId": "device_123",
  "timestamp": "2025-10-16T12:00:00Z",
  "metrics": {
    "cpu": {
      "usage": 45.2,
      "temperature": 65.0,
      "frequency": 2400,
      "cores": 8,
      "threads": 16
    },
    "memory": {
      "total": 16384,
      "used": 8192,
      "available": 8192,
      "cached": 2048
    },
    "gpu": {
      "usage": 30.5,
      "memory": 8192,
      "temperature": 70.0,
      "fanSpeed": 65
    },
    "disk": {
      "read": 100.5,
      "write": 50.2,
      "usage": 75.0,
      "temperature": 45.0
    },
    "network": {
      "download": 1024,
      "upload": 512,
      "latency": 15
    }
  },
  "powerConsumption": 125.5,
  "carbonFootprint": 0.08
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Energy data recorded successfully",
  "data": {
    "id": "energy_data_123",
    "timestamp": "2025-10-16T12:00:00Z"
  }
}
```

### POST /energy/batch
Submit multiple energy data points.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "data": [
    {
      "deviceId": "device_123",
      "timestamp": "2025-10-16T12:00:00Z",
      "metrics": { /* ... */ },
      "powerConsumption": 125.5
    },
    {
      "deviceId": "device_123",
      "timestamp": "2025-10-16T12:01:00Z",
      "metrics": { /* ... */ },
      "powerConsumption": 127.2
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Batch energy data recorded successfully",
  "data": {
    "recorded": 2,
    "ids": ["energy_data_123", "energy_data_124"]
  }
}
```

### GET /energy/history
Get energy consumption history.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `timeframe`: `1h`, `6h`, `24h`, `7d`, `30d` (default: `24h`)
- `device`: Device ID filter (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "energy_data_123",
        "deviceId": "device_123",
        "timestamp": "2025-10-16T12:00:00Z",
        "powerConsumption": 125.5,
        "carbonFootprint": 0.08,
        "metrics": { /* ... */ }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 1250,
      "pages": 13
    },
    "summary": {
      "totalConsumption": 15600.5,
      "averageConsumption": 124.8,
      "totalCarbonFootprint": 12.48,
      "efficiency": 0.82
    }
  }
}
```

### GET /energy/stats
Get energy consumption statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: `day`, `week`, `month`, `year` (default: `day`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "day",
    "consumption": {
      "total": 2988.5,
      "average": 124.5,
      "peak": 185.2,
      "minimum": 45.8
    },
    "carbonFootprint": {
      "total": 2.39,
      "average": 0.099,
      "reduction": 0.15
    },
    "efficiency": {
      "score": 0.82,
      "trend": "increasing",
      "improvement": 0.05
    },
    "goals": {
      "daily": {
        "target": 50,
        "achieved": 47.5,
        "percentage": 95.0
      }
    }
  }
}
```

### PUT /energy/goals
Update energy consumption goals.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "daily": 45,
  "weekly": 280,
  "monthly": 1100,
  "carbonFootprint": 90,
  "efficiency": 0.88
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Energy goals updated successfully"
}
```

## System Monitoring

### GET /system/devices
Get list of monitored devices.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "device_123",
        "name": "Gaming Desktop",
        "type": "desktop",
        "status": "active",
        "lastSeen": "2025-10-16T12:00:00Z",
        "hardware": {
          "cpu": {
            "model": "Intel Core i7-12700K",
            "cores": 8,
            "threads": 16,
            "maxFrequency": 3600
          },
          "memory": {
            "total": 32768,
            "type": "DDR4",
            "speed": 3200
          },
          "gpu": {
            "model": "NVIDIA RTX 4080",
            "memory": 16384,
            "driver": "545.84"
          }
        }
      }
    ]
  }
}
```

### POST /system/devices
Add a new device for monitoring.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Work Laptop",
  "type": "laptop",
  "hardware": {
    "cpu": {
      "model": "Intel Core i5-1240P",
      "cores": 12,
      "threads": 16,
      "maxFrequency": 4400
    },
    "memory": {
      "total": 16384,
      "type": "DDR4",
      "speed": 3200
    },
    "storage": [
      {
        "type": "NVMe",
        "capacity": 512,
        "model": "Samsung 980 PRO"
      }
    ],
    "os": "Windows 11 Pro"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Device added successfully",
  "data": {
    "device": {
      "id": "device_124",
      "name": "Work Laptop",
      "type": "laptop",
      "status": "pending"
    }
  }
}
```

### GET /system/metrics
Get current system metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `device`: Device ID (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "timestamp": "2025-10-16T12:00:00Z",
      "cpu": {
        "usage": 45.2,
        "temperature": 65.0,
        "frequency": 2400
      },
      "memory": {
        "usage": 50.0,
        "available": 8192,
        "cached": 2048
      },
      "gpu": {
        "usage": 30.5,
        "temperature": 70.0,
        "memory": 4096
      },
      "disk": {
        "usage": 75.0,
        "read": 100.5,
        "write": 50.2
      },
      "network": {
        "download": 1024,
        "upload": 512,
        "latency": 15
      }
    }
  }
}
```

### POST /system/notifications
Send system notification.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "warning",
  "title": "High CPU Temperature",
  "message": "CPU temperature has exceeded 80°C",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "notificationId": "notif_123"
  }
}
```

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2025-10-16T12:00:00Z",
  "path": "/api/auth/register"
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_RESOURCE`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Data submission**: 100 requests per minute per user
- **Data retrieval**: 200 requests per minute per user

## Data Formats

### Timestamps
All timestamps use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Numbers
- Energy consumption: Watts (W)
- Temperature: Celsius (°C)
- Memory: Megabytes (MB)
- Storage: Gigabytes (GB)
- Network: Bytes per second (B/s)

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vera_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  localStorage.setItem('vera_token', response.data.data.token);
  return response.data;
};

// Submit energy data
const submitEnergyData = async (data: EnergyData) => {
  const response = await apiClient.post('/energy/data', data);
  return response.data;
};
```

### Python

```python
import requests
import json
from datetime import datetime

class VeraAPI:
    def __init__(self, base_url="http://localhost:3001/api"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f"{self.base_url}/auth/login", 
            json={"email": email, "password": password})
        if response.status_code == 200:
            self.token = response.json()["data"]["token"]
        return response.json()
    
    def submit_energy_data(self, device_id, metrics, power_consumption):
        headers = {"Authorization": f"Bearer {self.token}"}
        data = {
            "deviceId": device_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metrics": metrics,
            "powerConsumption": power_consumption
        }
        response = requests.post(f"{self.base_url}/energy/data", 
            json=data, headers=headers)
        return response.json()

# Usage
api = VeraAPI()
api.login("user@example.com", "password")
api.submit_energy_data("device_123", {...}, 125.5)
```

## Changelog

### v2.0.0 (2025-10-16)
- Initial API documentation
- Complete authentication system
- Energy monitoring endpoints
- System metrics collection
- User management features
- Comprehensive error handling
- Rate limiting implementation

---

For additional support or questions, please refer to the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) documentation or contact the development team.