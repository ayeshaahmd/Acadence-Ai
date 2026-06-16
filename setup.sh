#!/bin/bash

# AI Research Paper Assistant - Setup Script

echo "🎓 Research Paper Assistant - Setup"
echo "===================================="
echo ""

# Check Python
echo "✓ Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "  Found Python $PYTHON_VERSION"

# Check Node
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "  Found $NODE_VERSION"

# Create virtual environment
echo ""
echo "✓ Setting up Python virtual environment..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
fi
source backend/venv/bin/activate

# Install Python dependencies
echo "✓ Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r backend/requirements.txt

# Create .env file if it doesn't exist
echo ""
echo "✓ Setting up environment variables..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "  Created .env file. Please edit it with your API keys:"
    echo "  - OPENAI_API_KEY or ANTHROPIC_API_KEY"
    echo "  - Other optional API keys"
fi

# Install Node dependencies
echo ""
echo "✓ Installing Node.js dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your API keys"
echo "2. Run: bash run.sh"
echo ""
echo "🚀 Or manually start:"
echo "   Terminal 1: cd backend && source venv/bin/activate && python run.py"
echo "   Terminal 2: cd frontend && npm start"
