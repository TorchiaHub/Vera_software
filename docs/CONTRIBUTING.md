# Contributing to VERA Environmental Awareness

Thank you for your interest in contributing to VERA! This guide will help you get started with contributing to our environmental monitoring application.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers are responsible for clarifying standards and may take corrective action in response to unacceptable behavior.

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js** 18+ installed
- **Rust** 1.70+ installed
- **Git** for version control
- **Windows** (for Windows-specific features)
- Basic knowledge of React, TypeScript, and Rust

### Find Something to Work On

1. **Browse Issues**: Check [GitHub Issues](https://github.com/TorchiaHub/Vera_software/issues)
2. **Good First Issues**: Look for issues labeled `good first issue`
3. **Feature Requests**: Consider implementing requested features
4. **Documentation**: Help improve docs and guides
5. **Bug Reports**: Fix reported bugs

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request  
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `documentation`: Improvements to docs
- `frontend`: React/UI related
- `backend`: Rust/Tauri related
- `database`: Database schema or queries

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/Vera_software.git
cd Vera_software

# Add upstream remote
git remote add upstream https://github.com/TorchiaHub/Vera_software.git
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies (in src-tauri)
cd src-tauri
cargo build
cd ..
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Development Server

```bash
# Start development server
npm run tauri dev

# Or run frontend only
npm run dev
```

### 5. Build and Test

```bash
# Build the application
npm run tauri build

# Run tests
npm run test
cargo test
```

## Contributing Guidelines

### Before You Start

1. **Check Existing Issues**: Avoid duplicate work
2. **Discuss Major Changes**: Open an issue for significant changes
3. **Follow Conventions**: Adhere to existing code style
4. **Test Your Changes**: Ensure everything works
5. **Update Documentation**: Keep docs current

### Types of Contributions

#### Bug Fixes
- Fix reported issues
- Improve error handling
- Resolve performance problems
- Enhance compatibility

#### Features
- Implement new monitoring capabilities
- Add UI/UX improvements
- Extend platform support
- Integrate new services

#### Documentation
- Improve user guides
- Add technical documentation
- Create tutorials and examples
- Fix typos and formatting

#### Testing
- Add unit tests
- Create integration tests
- Improve test coverage
- Test on different platforms

## Pull Request Process

### 1. Create a Branch

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing conventions
- Add tests for new functionality
- Update documentation as needed

### 3. Commit Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add energy efficiency scoring algorithm"

# Follow conventional commit format:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
# chore: maintenance
```

### 4. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# - Use descriptive title
# - Fill out PR template
# - Link related issues
# - Request review
```

### 5. PR Review Process

1. **Automated Checks**: CI/CD will run tests
2. **Code Review**: Maintainers will review code
3. **Feedback**: Address any requested changes
4. **Approval**: PR approved and merged

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
Include screenshots for UI changes

## Related Issues
Closes #123
```

## Issue Guidelines

### Before Creating an Issue

1. **Search Existing Issues**: Check for duplicates
2. **Try Latest Version**: Ensure issue exists in current version
3. **Gather Information**: Collect relevant details

### Bug Reports

Include:
- **OS and Version**: Windows 10/11, etc.
- **App Version**: VERA version number
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: Visual evidence if relevant
- **Logs**: Error messages or console output

### Feature Requests

Include:
- **Problem Description**: What problem does this solve?
- **Proposed Solution**: How would you implement it?
- **Alternatives**: Other approaches considered
- **Use Cases**: Who would benefit and how?
- **Mockups**: Visual designs if applicable

### Issue Templates

Use the provided GitHub issue templates for:
- Bug reports
- Feature requests
- Documentation improvements
- Questions and support

## Coding Standards

### TypeScript/React Guidelines

```typescript
// Use descriptive variable names
const energyConsumptionData = await fetchEnergyData()

// Prefer interfaces over types for objects
interface EnergyMetrics {
  cpuUsage: number
  memoryUsage: number
  powerConsumption: number
}

// Use React hooks properly
const useEnergyMonitor = () => {
  const [data, setData] = useState<EnergyMetrics[]>([])
  
  useEffect(() => {
    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [])
  
  return { data }
}
```

### Rust Guidelines

```rust
// Use descriptive function names
pub fn calculate_energy_efficiency_score(
    cpu_usage: f64,
    power_consumption: f64,
) -> f64 {
    // Implementation
}

// Handle errors properly
pub fn collect_system_metrics() -> Result<SystemMetrics, SystemError> {
    let cpu = get_cpu_usage()?;
    let memory = get_memory_usage()?;
    
    Ok(SystemMetrics { cpu, memory })
}

// Use proper documentation
/// Calculates the environmental impact score based on power consumption
/// and regional carbon intensity factors.
/// 
/// # Arguments
/// * `power_watts` - Power consumption in watts
/// * `carbon_intensity` - Regional carbon intensity (g CO2/kWh)
/// 
/// # Returns
/// CO2 emissions in grams per hour
pub fn calculate_carbon_footprint(
    power_watts: f64, 
    carbon_intensity: f64
) -> f64 {
    (power_watts / 1000.0) * carbon_intensity
}
```

### General Guidelines

- **Naming**: Use clear, descriptive names
- **Functions**: Keep functions small and focused
- **Comments**: Explain why, not what
- **Error Handling**: Always handle errors gracefully
- **Performance**: Consider performance implications
- **Security**: Follow security best practices

## Testing

### Frontend Testing

```typescript
// Component tests with React Testing Library
import { render, screen } from '@testing-library/react'
import { EnergyChart } from './EnergyChart'

describe('EnergyChart', () => {
  it('renders energy data correctly', () => {
    const mockData = [
      { timestamp: Date.now(), value: 100 }
    ]
    
    render(<EnergyChart data={mockData} />)
    
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
```

### Backend Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_energy_efficiency_calculation() {
        let score = calculate_energy_efficiency_score(50.0, 100.0);
        assert!(score >= 0.0 && score <= 100.0);
    }

    #[tokio::test]
    async fn test_system_metrics_collection() {
        let metrics = collect_system_metrics().await;
        assert!(metrics.is_ok());
    }
}
```

### Test Coverage

- **Unit Tests**: Test individual functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test system performance
- **Security Tests**: Test for vulnerabilities

## Documentation

### Code Documentation

- **Functions**: Document all public functions
- **Complex Logic**: Explain non-obvious code
- **APIs**: Document all public APIs
- **Configuration**: Document all config options

### User Documentation

- **User Guide**: Step-by-step instructions
- **Installation**: Setup and installation guides
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions

### Technical Documentation

- **Architecture**: System design and architecture
- **Database**: Schema and relationships
- **API**: Endpoint documentation
- **Development**: Setup and contribution guides

## Recognition

Contributors are recognized in:
- **CHANGELOG.md**: Major contributions listed
- **README.md**: Contributors section
- **GitHub**: Contributor graph and statistics
- **Releases**: Special thanks in release notes

## Questions and Support

### Getting Help

- **GitHub Discussions**: Ask questions and discuss ideas
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check existing guides first
- **Community**: Join our community discussions

### Response Times

- **Bugs**: We aim to respond within 48 hours
- **Features**: Response within 1 week
- **PRs**: Review within 1 week
- **Questions**: Response within 3 days

### Contact Maintainers

For sensitive issues or questions:
- **Security Issues**: Use security advisories
- **Code of Conduct**: Contact maintainers directly
- **Private Matters**: Email project maintainers

---

Thank you for contributing to VERA! Your efforts help make environmental monitoring more accessible and effective for everyone. 🌱