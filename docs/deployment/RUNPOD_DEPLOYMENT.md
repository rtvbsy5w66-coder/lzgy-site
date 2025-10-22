# 🚀 RunPod Production Deployment Guide

## Prerequisites

1. **RunPod Account**: Sign up at [runpod.io](https://runpod.io)
2. **Credit Balance**: Minimum $10 for testing
3. **Production Token**: Generate secure token for AI server

## Step 1: Create RunPod Pod

### Option A: Quick Deploy (Recommended)
```bash
# 1. Go to runpod.io/console/pods
# 2. Click "Deploy" 
# 3. Select GPU: RTX 4090 ($0.34/hour)
# 4. Use template: nvidia/cuda:12.1-runtime-ubuntu22.04
# 5. Container Disk: 30GB
# 6. Exposed Ports: 8080, 11434, 3001
```

### Option B: Custom Template
```bash
# Upload runpod-template.json to RunPod Templates
# Then deploy from your custom template
```

## Step 2: Pod Setup

### Upload Setup Script
```bash
# 1. SSH into your pod
ssh root@your-pod-ssh-address

# 2. Download setup script
curl -o setup-runpod.sh https://raw.githubusercontent.com/your-repo/main/setup-runpod.sh

# 3. Make executable and run
chmod +x setup-runpod.sh
./setup-runpod.sh
```

### Manual Setup (if script fails)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama and pull models
ollama serve &
sleep 15
ollama pull mistral:7b
ollama pull llama2:7b

# The setup script handles the rest automatically
```

## Step 3: Environment Configuration

### Set Production Token
```bash
# On the pod, set your production token:
export AI_SERVER_TOKEN="prod-token-$(openssl rand -hex 16)"
echo "Your production token: $AI_SERVER_TOKEN"

# Save it to your local .env.production
```

### Start Services
```bash
# Start the AI server
/app/start-ai-server.sh

# Or start via supervisor
supervisorctl start all
supervisorctl status
```

## Step 4: Test Deployment

### Health Check
```bash
# Test from your local machine
curl https://your-pod-id-8080.proxy.runpod.net/health

# Expected response:
{
  "models": [
    {"name": "mistral:7b", "size": 4366000000},
    {"name": "llama2:7b", "size": 3826000000}
  ]
}
```

### Authentication Test
```bash
# Test with valid token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-pod-id-8080.proxy.runpod.net/api/generate \
  -d '{"model":"mistral:7b","prompt":"Hello AI server!"}' \
  -H "Content-Type: application/json"

# Test without token (should fail)
curl https://your-pod-id-8080.proxy.runpod.net/api/generate \
  -d '{"model":"mistral:7b","prompt":"Hello"}' \
  -H "Content-Type: application/json"
```

### Performance Test
```bash
# Time a simple request
time curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-pod-id-8080.proxy.runpod.net/api/generate \
  -d '{"model":"mistral:7b","prompt":"Categorizze: traffic issue"}' \
  -H "Content-Type: application/json"
```

## Step 5: Update Local Environment

### Update .env.local or .env.production
```bash
# Update your application's environment variables
AI_SERVER_URL=https://your-pod-id-8080.proxy.runpod.net
AI_SERVER_TOKEN=your-production-token-here
AI_ENABLED=true
```

### Test Local Integration
```bash
# Test your local app against production AI server
npm run dev

# Visit http://localhost:3000/ai-demo
# Try the categorization feature
```

## Step 6: Production Checklist

### Security ✅
- [ ] Production token set and secure (32+ characters)
- [ ] Rate limiting enabled (20 req/min)
- [ ] HTTPS only (RunPod proxy handles this)
- [ ] No model switching endpoint exposed
- [ ] Auth service logs access attempts

### Performance ✅
- [ ] GPU utilization < 80%
- [ ] Response time < 30 seconds
- [ ] Memory usage stable
- [ ] No memory leaks over 24 hours

### Monitoring ✅
- [ ] Health endpoint responding
- [ ] Auth service responding  
- [ ] Nginx logs clean
- [ ] Supervisor services all running

### Backup ✅
- [ ] Pod snapshot created
- [ ] Environment variables documented
- [ ] Setup script tested and working

## Step 7: Cost Optimization

### On-Demand Usage
```bash
# Start pod only when needed
runpod start pod-id

# Stop pod when not in use  
runpod stop pod-id

# Savings: 60-80% reduction
```

### Auto-scaling (Advanced)
```bash
# Set up auto-scaling based on:
# - Request volume
# - Response time 
# - Cost per hour vs demand
```

## Monitoring & Maintenance

### Daily Checks
```bash
# SSH into pod and run:
/app/monitor.sh

# Check key metrics:
# - GPU temperature
# - Memory usage  
# - Disk space
# - Service status
```

### Log Monitoring
```bash
# Check service logs:
tail -f /var/log/ollama.log
tail -f /var/log/auth.log  
tail -f /var/log/nginx/access.log

# Check for errors:
grep ERROR /var/log/*.log
```

### Weekly Maintenance
```bash
# Update models if needed:
ollama pull mistral:7b

# Clean up logs:
truncate -s 0 /var/log/*.log

# Restart services:
supervisorctl restart all
```

## Troubleshooting

### Pod Won't Start
```bash
# Check supervisor status:
supervisorctl status

# Restart individual services:
supervisorctl restart ollama
supervisorctl restart auth  
supervisorctl restart nginx
```

### AI Requests Timing Out
```bash
# Check GPU memory:
nvidia-smi

# Check system resources:
htop

# Restart Ollama if needed:
supervisorctl restart ollama
```

### Authentication Failing
```bash
# Check auth service:
curl http://localhost:3001/health

# Verify token:
echo $AI_SERVER_TOKEN

# Check nginx config:
nginx -t
```

## Success Metrics

### Performance Targets 🎯
- **Response Time**: < 30 seconds (mistral:7b)
- **Uptime**: > 99.5%
- **GPU Utilization**: 60-80%
- **Cost per Request**: < $0.01

### Usage Patterns 📊
- **Peak Hours**: Monitor and scale accordingly
- **Request Types**: Track categorization vs general chat
- **Cache Hit Rate**: Aim for > 40%
- **Error Rate**: < 1%

## Next Steps

1. **Load Testing**: Run concurrent requests
2. **Caching**: Implement Redis for production  
3. **Monitoring**: Add Prometheus/Grafana
4. **Scaling**: Multiple pods + load balancer
5. **CI/CD**: Automated deployments

---

**🎉 Your AI server is now production ready!**

**Pod URL**: `https://your-pod-id-8080.proxy.runpod.net`  
**Cost**: ~$0.34/hour (RTX 4090)  
**Capacity**: ~100 requests/hour  
**Models**: mistral:7b, llama2:7b