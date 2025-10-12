# 🚀 RunPod AI Server Deployment Guide

## 1. RunPod Template Creation

### Base Image & Setup
```bash
# RunPod Custom Template
FROM nvidia/cuda:12.1-runtime-ubuntu22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    nginx \
    nodejs \
    npm \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Install models
RUN ollama serve & sleep 10 && \
    ollama pull mistral:7b && \
    ollama pull llama2:7b && \
    pkill ollama

# Setup nginx config
COPY nginx-runpod.conf /etc/nginx/sites-available/default

# Setup auth service
COPY auth-service/ /app/auth/
WORKDIR /app/auth
RUN npm install --production

# Supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080 11434

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

## 2. RunPod Configuration Files

### nginx-runpod.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream ollama {
        server 127.0.0.1:11434;
    }

    upstream auth {
        server 127.0.0.1:3001;
    }

    limit_req_zone $binary_remote_addr zone=api:10m rate=20r/m;
    
    server {
        listen 8080;
        server_name _;

        # API with auth
        location /api/ {
            limit_req zone=api burst=5 nodelay;
            auth_request /auth;
            
            proxy_pass http://ollama;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            proxy_connect_timeout 30s;
            proxy_send_timeout 60s;
            proxy_read_timeout 120s;
        }

        location = /auth {
            internal;
            proxy_pass http://auth/validate;
            proxy_pass_request_body off;
            proxy_set_header Content-Length "";
            proxy_set_header Authorization $http_authorization;
        }

        # Health check (no auth)
        location /health {
            proxy_pass http://ollama/api/tags;
        }
    }
}
```

### supervisord.conf
```ini
[supervisord]
nodaemon=true
user=root

[program:ollama]
command=ollama serve
environment=OLLAMA_HOST=0.0.0.0:11434
autorestart=true
stdout_logfile=/var/log/ollama.log
stderr_logfile=/var/log/ollama.err

[program:auth]
command=node /app/auth/server.js
environment=AI_SERVER_TOKEN=%(ENV_AI_SERVER_TOKEN)s,PORT=3001
autorestart=true
stdout_logfile=/var/log/auth.log
stderr_logfile=/var/log/auth.err

[program:nginx]
command=nginx -g "daemon off;"
autorestart=true
stdout_logfile=/var/log/nginx.log
stderr_logfile=/var/log/nginx.err
```

## 3. RunPod Deployment Steps

### Step 1: Create Template
1. Go to [RunPod Templates](https://runpod.io/console/user/templates)
2. Create new template:
   - **Name:** `ollama-mistral-ai-server`
   - **Image:** `nvidia/cuda:12.1-runtime-ubuntu22.04`
   - **Container Disk:** 25GB
   - **Exposed Ports:** `8080`, `11434`

### Step 2: Deploy Pod  
```bash
# Environment Variables
AI_SERVER_TOKEN=your-production-token-here-xyz123
OLLAMA_MODEL=mistral:7b
OLLAMA_HOST=0.0.0.0:11434
```

### Step 3: Setup Script (run once)
```bash
#!/bin/bash
# setup-runpod.sh

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama in background
ollama serve &
sleep 15

# Pull models
ollama pull mistral:7b
ollama pull llama2:7b

# Install Node.js auth service
mkdir -p /app/auth
cd /app/auth

cat > package.json << 'EOF'
{
  "name": "auth-service",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

npm install

cat > server.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.json());

app.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.AI_SERVER_TOKEN || 'production-token';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.substring(7);
  if (token !== expectedToken) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  res.status(200).json({ valid: true });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Auth service on port \${PORT}\`);
});
EOF

# Start auth service
node server.js &

# Setup nginx
cat > /etc/nginx/sites-available/default << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream ollama {
        server 127.0.0.1:11434;
    }

    upstream auth {
        server 127.0.0.1:3001;
    }

    limit_req_zone $binary_remote_addr zone=api:10m rate=20r/m;
    
    server {
        listen 8080;
        server_name _;

        location /api/ {
            limit_req zone=api burst=5 nodelay;
            auth_request /auth;
            
            proxy_pass http://ollama;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            
            proxy_connect_timeout 30s;
            proxy_read_timeout 120s;
        }

        location = /auth {
            internal;
            proxy_pass http://auth/validate;
            proxy_pass_request_body off;
            proxy_set_header Content-Length "";
            proxy_set_header Authorization $http_authorization;
        }

        location /health {
            proxy_pass http://ollama/api/tags;
        }
    }
}
EOF

# Start nginx
nginx -g "daemon off;" &

echo "✅ RunPod AI Server Setup Complete!"
echo "🔗 Access: https://your-pod-id-8080.proxy.runpod.net"
echo "🔑 Token: $AI_SERVER_TOKEN"
```

## 4. Production Environment Variables

```bash
# Update your .env.local
AI_SERVER_URL=https://your-pod-id-8080.proxy.runpod.net
AI_SERVER_TOKEN=your-production-token-here-xyz123
AI_ENABLED=true
OLLAMA_MODEL=mistral:7b
```

## 5. Cost Estimation

### RTX 4090 Pod
- **Cost:** $0.34/hour
- **Monthly:** ~$245 (24/7)
- **Per request:** ~$0.001-0.01

### A100 Pod (Premium)
- **Cost:** $1.10/hour  
- **Monthly:** ~$792 (24/7)
- **Performance:** 3x faster

### Recommended: On-Demand
- **Start:** When traffic increases
- **Stop:** During low usage
- **Savings:** 60-80% cost reduction

## 6. Testing Commands

```bash
# Health check
curl https://your-pod-id-8080.proxy.runpod.net/health

# Auth test
curl -H "Authorization: Bearer your-token" \
  https://your-pod-id-8080.proxy.runpod.net/api/generate \
  -d '{"model":"mistral:7b","prompt":"Hello"}' \
  -H "Content-Type: application/json"
```