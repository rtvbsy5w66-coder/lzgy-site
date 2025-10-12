# 🤖 AI Server Setup Guide

## 1. Nginx Auth Proxy konfiguráció

```nginx
# /etc/nginx/sites-available/ollama
server {
    listen 80;
    server_name your-ai-server.com;

    # API Token auth
    location /api/ {
        auth_request /auth;
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Auth endpoint
    location = /auth {
        internal;
        proxy_pass http://localhost:3001/auth;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Authorization $http_authorization;
    }
}
```

## 2. Environment Variables

```bash
# .env.ai-server
AI_SERVER_TOKEN=your-super-secret-token-here
OLLAMA_MODELS_PATH=/data/ollama/models
NGINX_AUTH_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
```

## 3. Docker Compose

```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    volumes:
      - ./data/ollama:/root/.ollama
    ports:
      - "11434:11434"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - ollama
    restart: unless-stopped

  auth-service:
    build: ./auth-service
    environment:
      - AI_SERVER_TOKEN=${AI_SERVER_TOKEN}
    ports:
      - "3001:3001"
    restart: unless-stopped
```

## 4. Deployment Options Comparison

### 🚀 RunPod (Ajánlott)
- **Költség:** $0.34/óra (RTX 4090)
- **Setup:** ~10 perc Docker deploy
- **Skálázás:** Auto-scale
- **Előny:** Nincs hardware befektetés

### 💻 Saját Szerver
- **Költség:** $1500-3000 egyszer
- **Setup:** ~2 óra konfiguráció  
- **Skálázás:** Manuális
- **Előny:** Teljes kontroll

### ☁️ Lambda Labs
- **Költség:** $1.10/óra (A100)
- **Setup:** ~5 perc
- **Skálázás:** Jupyter-style
- **Előny:** Prémium GPU-k

## 5. Security Checklist

- ✅ Bearer token auth
- ✅ Rate limiting (10/min/IP)
- ✅ HTTPS only
- ✅ Nginx proxy
- ✅ No model switching endpoint
- ✅ Request size limits
- ✅ Timeout protection

## 6. Monitoring

```bash
# Health check endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://your-ai-server.com/api/tags

# Performance monitoring  
docker stats ollama nginx
```