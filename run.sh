#!/bin/bash

# Run script for Research Paper Assistant

echo "🚀 Starting Research Paper Assistant..."
echo ""

# Start backend
echo "Starting backend on http://localhost:5000"
cd backend
source venv/bin/activate
python run.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend on http://localhost:3000"
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Applications started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait

# Cleanup
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
