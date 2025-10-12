#!/bin/bash
# 🚀 RunPod AI Server Setup Script
# Run this script on your RunPod GPU instance

set -e

echo "🚀 Starting RunPod AI Server Setup..."

# Update system
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# Install dependencies
echo "🔧 Installing dependencies..."
apt-get install -y \
    curl \
    wget \
    nginx \
    supervisor \
    nodejs \
    npm \
    htop \
    git

# Install Ollama
echo "🦙 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
echo "⚡ Starting Ollama service..."
ollama serve &
sleep 15

# Download models
echo "📥 Downloading AI models..."
echo "  - Downloading mistral:7b (4.4GB)..."
ollama pull mistral:7b

echo "  - Downloading llama2:7b (3.8GB) as backup..."
ollama pull llama2:7b

# Verify models
echo "✅ Installed models:"
ollama list

# Create auth service directory
echo "🔐 Setting up authentication service..."
mkdir -p /app/auth
cd /app/auth

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ai-auth-service",
  "version": "1.0.0",
  "description": "Authentication service for AI server",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
}
EOF

# Install auth service dependencies
npm install

# Create auth server
cat > server.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.json());

// Environment variables
const AI_SERVER_TOKEN = process.env.AI_SERVER_TOKEN || 'production-token-change-me';
const PORT = process.env.PORT || 3001;

// Token validation endpoint
app.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Missing authorization header');
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== AI_SERVER_TOKEN) {
    console.log('❌ Invalid token:', token.substring(0, 10) + '...');
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  console.log('✅ Valid token authentication');
  res.status(200).json({ valid: true, timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ai-auth',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 Auth service running on port ${PORT}`);
  console.log(`🔑 Token: ${AI_SERVER_TOKEN.substring(0, 10)}...`);
});
EOF

# Configure nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/default << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Upstream servers
    upstream ollama {
        server 127.0.0.1:11434;
    }

    upstream auth {
        server 127.0.0.1:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=20r/m;
    limit_req_zone $binary_remote_addr zone=health:10m rate=60r/m;

    # Main server
    server {
        listen 8080;
        server_name _;

        # Enable gzip
        gzip on;
        gzip_types text/plain application/json;

        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";

        # API endpoints with authentication
        location /api/ {
            limit_req zone=api burst=5 nodelay;
            
            # Authentication check
            auth_request /auth;
            
            # Forward to Ollama
            proxy_pass http://ollama;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 120s;
            proxy_read_timeout 180s;
            
            # Buffer settings
            proxy_buffering off;
            proxy_request_buffering off;
        }

        # Internal auth endpoint
        location = /auth {
            internal;
            proxy_pass http://auth/validate;
            proxy_pass_request_body off;
            proxy_set_header Content-Length "";
            proxy_set_header X-Original-URI $request_uri;
            proxy_set_header Authorization $http_authorization;
        }

        # Health check (no auth required)
        location /health {
            limit_req zone=health burst=10 nodelay;
            proxy_pass http://ollama/api/tags;
            proxy_set_header Host $host;
        }

        # Auth service health
        location /auth/health {
            proxy_pass http://auth/health;
        }

        # Server status page
        location /status {
            default_type text/plain;
            return 200 "🚀 AI Server Status: ONLINE\n⏰ Time: $time_iso8601\n🔧 Server: $server_name\n";
        }
    }
}
EOF

# Test nginx config
nginx -t

# Configure supervisor
echo "⚙️ Configuring Supervisor..."
cat > /etc/supervisor/conf.d/ai-services.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisord.log
pidfile=/var/run/supervisord.pid

[program:ollama]
command=ollama serve
environment=OLLAMA_HOST=0.0.0.0:11434,OLLAMA_ORIGINS=*
user=root
autorestart=true
stdout_logfile=/var/log/ollama.log
stderr_logfile=/var/log/ollama.err
stdout_logfile_maxbytes=10MB
stderr_logfile_maxbytes=10MB

[program:auth]
command=node /app/auth/server.js
environment=AI_SERVER_TOKEN=%(ENV_AI_SERVER_TOKEN)s,PORT=3001
directory=/app/auth
user=root
autorestart=true
stdout_logfile=/var/log/auth.log
stderr_logfile=/var/log/auth.err
stdout_logfile_maxbytes=5MB
stderr_logfile_maxbytes=5MB

[program:nginx]
command=nginx -g "daemon off;"
user=root
autorestart=true
stdout_logfile=/var/log/nginx-supervisor.log
stderr_logfile=/var/log/nginx-supervisor.err
stdout_logfile_maxbytes=5MB
stderr_logfile_maxbytes=5MB
EOF

# Create startup script
echo "📝 Creating startup script..."
cat > /app/start-ai-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AI Server Services..."

# Set default token if not provided
export AI_SERVER_TOKEN=${AI_SERVER_TOKEN:-"production-token-change-me-$(date +%s)"}

echo "🔑 Using AI Server Token: ${AI_SERVER_TOKEN:0:10}..."

# Start all services via supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/ai-services.conf
EOF

chmod +x /app/start-ai-server.sh

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > /app/monitor.sh << 'EOF'
#!/bin/bash
echo "🔍 AI Server Monitoring Dashboard"
echo "=================================="
echo
echo "🕒 Current Time: $(date)"
echo "⚡ Uptime: $(uptime)"
echo
echo "🦙 Ollama Status:"
curl -s http://localhost:11434/api/tags | jq . || echo "❌ Ollama not responding"
echo
echo "🔐 Auth Service Status:"
curl -s http://localhost:3001/health | jq . || echo "❌ Auth service not responding"
echo
echo "🌐 Nginx Status:"
nginx -t && echo "✅ Nginx config OK" || echo "❌ Nginx config error"
echo
echo "💾 Disk Usage:"
df -h | grep -E '^/dev'
echo
echo "🧠 Memory Usage:"
free -h
echo
echo "📊 GPU Status:"
nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits || echo "❌ No GPU found"
EOF

chmod +x /app/monitor.sh

# Final setup
echo "🎯 Final setup steps..."

# Set environment variable for current session
export AI_SERVER_TOKEN=${AI_SERVER_TOKEN:-"production-token-change-me-$(date +%s)"}

echo "✅ RunPod AI Server Setup Complete!"
echo
echo "📋 Setup Summary:"
echo "=================="
echo "🦙 Ollama: Installed with mistral:7b and llama2:7b"
echo "🔐 Auth Service: Running on port 3001"
echo "🌐 Nginx Proxy: Running on port 8080"
echo "⚙️ Supervisor: Managing all services"
echo
echo "🔑 AI Server Token: ${AI_SERVER_TOKEN:0:15}..."
echo "🔗 Health Check: http://your-pod:8080/health"
echo "📊 Status Page: http://your-pod:8080/status"
echo
echo "🚀 To start the server:"
echo "   /app/start-ai-server.sh"
echo
echo "📊 To monitor the server:"
echo "   /app/monitor.sh"
echo
echo "💡 Pro tip: Set AI_SERVER_TOKEN environment variable for security!"
EOF