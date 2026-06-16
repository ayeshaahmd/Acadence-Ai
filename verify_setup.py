#!/usr/bin/env python3
"""
Installation and Verification Script
Checks system requirements and sets up the project
"""

import os
import sys
import subprocess
import platform

# Reconfigure stdout/stderr to UTF-8 on Windows to prevent UnicodeEncodeError
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass


def check_python():
    """Check Python version"""
    print("Checking Python...")
    try:
        version = sys.version_info
        if version.major >= 3 and version.minor >= 9:
            print(f"  ✓ Python {version.major}.{version.minor}.{version.micro}")
            return True
        else:
            print(f"  ✗ Python 3.9+ required (found {version.major}.{version.minor})")
            return False
    except Exception as e:
        print(f"  ✗ Error checking Python: {e}")
        return False

def check_node():
    """Check Node.js version"""
    print("Checking Node.js...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"  ✓ {version}")
            return True
        else:
            print(f"  ✗ Node.js not found")
            return False
    except Exception as e:
        print(f"  ✗ Error checking Node.js: {e}")
        return False

def check_pip():
    """Check pip"""
    print("Checking pip...")
    try:
        result = subprocess.run([sys.executable, '-m', 'pip', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✓ pip ready")
            return True
        else:
            print(f"  ✗ pip not available")
            return False
    except Exception as e:
        print(f"  ✗ Error checking pip: {e}")
        return False

def check_npm():
    """Check npm"""
    print("Checking npm...")
    try:
        is_windows = platform.system() == 'Windows'
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True, shell=is_windows)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"  ✓ npm {version}")
            return True
        else:
            print(f"  ✗ npm not found")
            return False
    except Exception as e:
        print(f"  ✗ Error checking npm: {e}")
        return False

def create_venv():
    """Create Python virtual environment"""
    print("\nSetting up Python virtual environment...")
    try:
        venv_path = os.path.join('backend', 'venv')
        if not os.path.exists(venv_path):
            subprocess.run([sys.executable, '-m', 'venv', venv_path], check=True)
            print(f"  ✓ Virtual environment created at {venv_path}")
        else:
            print(f"  ✓ Virtual environment already exists")
        return True
    except Exception as e:
        print(f"  ✗ Failed to create virtual environment: {e}")
        return False

def install_backend_deps():
    """Install backend dependencies"""
    print("\nInstalling backend dependencies...")
    try:
        if platform.system() == 'Windows':
            venv_python = os.path.join('backend', 'venv', 'Scripts', 'python.exe')
            venv_pip = os.path.join('backend', 'venv', 'Scripts', 'pip.exe')
        else:
            venv_python = os.path.join('backend', 'venv', 'bin', 'python')
            venv_pip = os.path.join('backend', 'venv', 'bin', 'pip')
        
        requirements_file = os.path.join('backend', 'requirements.txt')
        
        subprocess.run([venv_pip, 'install', '--upgrade', 'pip'], check=True)
        subprocess.run([venv_pip, 'install', '-r', requirements_file], check=True)
        print("  ✓ Backend dependencies installed")
        return True
    except Exception as e:
        print(f"  ✗ Failed to install backend dependencies: {e}")
        return False

def install_frontend_deps():
    """Install frontend dependencies"""
    print("\nInstalling frontend dependencies...")
    try:
        os.chdir('frontend')
        is_windows = platform.system() == 'Windows'
        subprocess.run(['npm', 'install'], check=True, shell=is_windows)
        os.chdir('..')
        print("  ✓ Frontend dependencies installed")
        return True
    except Exception as e:
        print(f"  ✗ Failed to install frontend dependencies: {e}")
        return False

def create_env_file():
    """Create .env file from example"""
    print("\nSetting up environment variables...")
    try:
        env_path = os.path.join('backend', '.env')
        env_example = os.path.join('backend', '.env.example')
        
        if not os.path.exists(env_path):
            if os.path.exists(env_example):
                with open(env_example, 'r') as f:
                    content = f.read()
                with open(env_path, 'w') as f:
                    f.write(content)
                print(f"  ✓ .env file created")
                print(f"  ⚠  IMPORTANT: Edit backend/.env with your API keys!")
                return True
            else:
                print("  ⚠  .env.example not found, skipping .env creation")
                return False
        else:
            print(f"  ✓ .env file already exists")
            return True
    except Exception as e:
        print(f"  ✗ Failed to create .env: {e}")
        return False

def main():
    print("=" * 60)
    print("AI Research Paper Assistant - Installation Verification")
    print("=" * 60)
    print()
    
    # Check requirements
    checks = {
        'Python 3.9+': check_python(),
        'Node.js 16+': check_node(),
        'pip': check_pip(),
        'npm': check_npm(),
    }
    
    print("\n" + "=" * 60)
    all_ok = all(checks.values())
    
    if not all_ok:
        print("❌ Some requirements are missing. Please install:")
        if not checks['Python 3.9+']:
            print("  - Python 3.9 or higher")
        if not checks['Node.js 16+']:
            print("  - Node.js 16 or higher")
        print("\nAfter installing, run this script again.")
        return False
    
    print("✅ All requirements met!\n")
    
    # Setup
    print("=" * 60)
    print("Setting up project...")
    print("=" * 60)
    print()
    
    if not create_venv():
        return False
    
    if not install_backend_deps():
        return False
    
    if not install_frontend_deps():
        return False
    
    if not create_env_file():
        pass  # Non-critical
    
    # Success
    print("\n" + "=" * 60)
    print("✅ Installation Complete!")
    print("=" * 60)
    print()
    print("📝 Next Steps:")
    print("  1. Edit backend/.env with your API keys (OPENAI_API_KEY or ANTHROPIC_API_KEY)")
    print("  2. Terminal 1: cd backend && source venv/bin/activate && python run.py")
    print("  3. Terminal 2: cd frontend && npm start")
    print("  4. Open http://localhost:3000 in your browser")
    print()
    print("📚 Documentation:")
    print("  - README.md - Overview")
    print("  - QUICK_START.md - Quick reference")
    print("  - USER_GUIDE.md - How to use")
    print("  - SETUP.md - Detailed setup")
    print("  - ADVANCED_CONFIG.md - Advanced features")
    print()
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
