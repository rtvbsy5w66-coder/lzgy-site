#!/bin/bash

echo "🚀 Starting app with memory monitoring..."
echo "=========================================="

# Start the app in background
npm run dev &
APP_PID=$!

echo "📦 App started with PID: $APP_PID"
echo ""

# Wait a bit for the app to start
sleep 3

# Monitor loop
while kill -0 $APP_PID 2>/dev/null; do
    # Get memory usage in MB
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        MEM=$(ps -p $APP_PID -o rss= 2>/dev/null | awk '{print $1/1024}')
    else
        # Linux
        MEM=$(ps -p $APP_PID -o rss= 2>/dev/null | awk '{print $1/1024}')
    fi

    if [ ! -z "$MEM" ]; then
        TIMESTAMP=$(date '+%H:%M:%S')
        printf "\r[%s] 💾 Memory: %.2f MB" "$TIMESTAMP" "$MEM"
    fi

    sleep 2
done

echo ""
echo "❌ App stopped"
