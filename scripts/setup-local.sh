
#!/bin/bash

echo ""
echo "Setting up SAAS ChatBot AI for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or later."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.local.example .env
    echo "⚠️  Please edit .env file with your actual API keys and database URL"
else
    echo ""
    echo "✅ .env file already exists"
fi

# Function to kill processes on port 5000
kill_server() {
    echo "🔍 Checking for existing server on port 5000..."
    
    # Find processes using port 5000
    PIDS=$(lsof -ti:5000 2>/dev/null)
    
    if [ ! -z "$PIDS" ]; then
        echo "🛑 Found existing server processes. Killing them..."
        echo "$PIDS" | xargs kill -9 2>/dev/null
        sleep 2
        echo "✅ Server processes terminated"
    else
        echo "✅ No existing server found on port 5000"
    fi
}

# Function to start the development server
start_server() {
    echo "🚀 Starting development server..."
    echo ""

    # Kill any existing server first
    kill_server

    echo ""
    # Rebuild client before starting server to ensure latest changes
    echo "🔄 Rebuilding client with latest changes..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Client rebuild failed. Please check for errors above."
        exit 1
    fi
    echo "✅ Client rebuilt successfully"
    
    # Start the server in the background
    NODE_ENV=development HOST=localhost npm run dev &
    SERVER_PID=$!
    
    echo "🎯 Server starting with PID: $SERVER_PID"
    echo "📡 Server will be available at: http://localhost:5000"
    echo ""
    echo "To stop the server, run: kill $SERVER_PID"
    echo "Or use Ctrl+C if running in foreground"
    
    # Wait a moment to check if server started successfully
    sleep 3
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo ""
        echo "✅ Server started successfully!"
        echo ""
        echo "🌐 URL to Open in your browser : http://localhost:5000 "
        echo ""
        echo "💡 Note: Client is automatically rebuilt on each startup to ensure latest changes are served"
    else
        echo "❌ Server failed to start. Check the logs above for errors."
        exit 1
    fi
}

echo ""
echo "🚀 Setup complete! Starting development server..."
start_server
echo ""
