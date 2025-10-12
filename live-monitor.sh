#!/bin/bash

echo "📊 Live Monitoring - Next.js App on Port 3000"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

while true; do
    clear
    echo -e "${BLUE}📊 Live Monitoring - Next.js App${NC}"
    echo "=============================================="
    date '+%Y-%m-%d %H:%M:%S'
    echo ""
    
    # Find Next.js processes
    NEXT_PIDS=$(ps aux | grep -E "next-server|next dev" | grep -v grep | awk '{print $2}')
    
    if [ -z "$NEXT_PIDS" ]; then
        echo -e "${RED}❌ No Next.js process found${NC}"
    else
        echo -e "${GREEN}🟢 Next.js Processes Running${NC}"
        echo ""
        
        # Header
        printf "%-10s %-8s %-8s %-12s %-12s %s\n" "PID" "CPU%" "MEM%" "RSS (MB)" "VSZ (MB)" "COMMAND"
        echo "--------------------------------------------------------------------------------"
        
        for PID in $NEXT_PIDS; do
            ps aux | awk -v pid="$PID" '$2 == pid {
                printf "%-10s %-8s %-8s %-12.2f %-12.2f %s\n", 
                $2, $3"%", $4"%", $6/1024, $5/1024, substr($0, index($0,$11))
            }'
        done
        
        echo ""
        echo -e "${YELLOW}📈 Total Memory Usage:${NC}"
        
        TOTAL_RSS=0
        for PID in $NEXT_PIDS; do
            RSS=$(ps -p $PID -o rss= 2>/dev/null | awk '{print $1}')
            if [ ! -z "$RSS" ]; then
                TOTAL_RSS=$((TOTAL_RSS + RSS))
            fi
        done
        
        TOTAL_MB=$(echo "scale=2; $TOTAL_RSS / 1024" | bc)
        echo -e "   ${GREEN}💾 Total: ${TOTAL_MB} MB${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔗 App URL: ${GREEN}http://localhost:3000${NC}"
    echo ""
    echo "Press Ctrl+C to stop monitoring..."
    
    sleep 3
done
