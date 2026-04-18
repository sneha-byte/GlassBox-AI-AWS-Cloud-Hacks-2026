# CloudHacks AI Agents - Stadium AI System

> A complete AWS-native system for real-time AI decision logging, evaluation, and visualization.

## What This Is

A full-stack application that:
- **Generates** stadium conditions every 3 seconds (temperature, occupancy, energy prices)
- **Makes decisions** using Bedrock AI (Amazon Nova Lite)
- **Evaluates decisions** with judge scoring (1-10)
- **Stores everything** in DynamoDB with REST APIs
- **Displays real-time** logs in a React dashboard (polling every 3 seconds)

## Quick Start (5 Minutes)

```bash
# 1. Deploy AWS backend
cd backend
sam build && sam deploy --guided

# 2. Copy the API endpoint URL from deployment output

# 3. Update environment files with the API URL
cp .env.example .env
# Edit and paste API_GATEWAY_URL

cd ../frontend
cp .env.example .env.local
# Edit and paste VITE_API_URL (same as backend)

# 4. Start simulator (Terminal 1)
cd ../backend
pip install -r requirements.txt
python simulator.py

# 5. Start dashboard (Terminal 2)
cd ../frontend
npm install && npm run dev

# 6. Open http://localhost:5173 → Click "View Stadium Logs"
```

See **[QUICK_START.md](QUICK_START.md)** for detailed steps.

## What You Have

### Backend
- **Python Simulator** - Generates conditions and calls Bedrock AI
- **AWS Infrastructure** - SAM template with Lambda, API Gateway, DynamoDB
- **Lambda Functions** - Write and read operations
- **DynamoDB Table** - AgentLogs with 7-day auto-retention

### Frontend  
- **Real-Time Dashboard** - React component with 3-second polling
- **Stadium Logs Page** - Displays decisions, reasoning, judge scores
- **TypeScript Types** - Fully typed API responses

### Documentation
- **QUICK_START.md** - Get running in 5 minutes ⭐ **START HERE**
- **DEPLOYMENT_GUIDE.md** - Complete setup with AWS details
- **SYSTEM_OVERVIEW.md** - Architecture and design
- **MONITORING_DEBUG.md** - Troubleshooting and monitoring
- **BUILD_MANIFEST.md** - What was created

## Architecture

```
Simulator (Python)
    ↓ (stadium conditions)
Bedrock AI (Decision making)
    ↓ (decision + reasoning + score)
API Gateway (POST /log)
    ↓
Lambda Write Function
    ↓
DynamoDB Table (AgentLogs)
    ↓ (polling every 3 sec)
Lambda Read Function (GET /get-logs)
    ↓
React Dashboard
    ↓ (displays decision + reasoning + judge_score)
User sees real-time logs
```

## Dashboard Display

Each log card shows:
- **Temperature** (70-120°F) 
- **Occupancy** (1k-60k people)
- **Energy Price** ($0.1-0.5/kWh)
- **Decision** - What the AI decided
- **Reasoning** - Why it made that decision  
- **Judge Score** - 1-10 evaluation (color-coded)

## Data Schema

```json
{
  "logId": "uuid",
  "timestamp": 1713451200000,
  "temp": 75,
  "people": 45000,
  "energy_price": 0.25,
  "decision": "Increase cooling",
  "reasoning": "High occupancy requires temperature control",
  "judge_score": 8
}
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, Boto3, AWS |
| **AI** | AWS Bedrock (Amazon Nova Lite) |
| **APIs** | Lambda, API Gateway, REST |
| **Database** | DynamoDB (NoSQL) |
| **Frontend** | React, TypeScript, Vite |
| **Infrastructure** | AWS SAM (CloudFormation) |

## Estimated Cost

Running 1 log every 3 seconds:

| Component | Daily | Monthly |
|-----------|-------|---------|
| Bedrock | $0.10-0.30 | $3-9 |
| AWS Services | $0.02 | $0.60 |
| **Total** | **$0.12-0.32** | **$4-10** |

## Prerequisites

- AWS account (with Bedrock enabled)
- AWS CLI configured
- SAM CLI installed
- Python 3.11+
- Node.js 18+

## Documentation Guide

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[QUICK_START.md](QUICK_START.md)** | Get running fast | 5 min |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Complete setup guide | 15 min |
| **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** | Architecture & design | 10 min |
| **[backend/AWS_BACKEND.md](backend/AWS_BACKEND.md)** | Backend architecture | 10 min |
| **[MONITORING_DEBUG.md](MONITORING_DEBUG.md)** | Troubleshooting | 10 min |
| **[BUILD_MANIFEST.md](BUILD_MANIFEST.md)** | What was built | 5 min |

## Next Steps

1. **Read** [QUICK_START.md](QUICK_START.md) (5 min)
2. **Deploy** AWS backend with SAM (5 min)
3. **Configure** environment files (2 min)
4. **Run** simulator and dashboard (2 min)
5. **View** real-time logs in browser

## Issues?

1. Check **[QUICK_START.md](QUICK_START.md)** troubleshooting section
2. See **[MONITORING_DEBUG.md](MONITORING_DEBUG.md)** for detailed debugging
3. Run health check: `bash health-check.sh` (after creating from MONITORING_DEBUG.md)

## Features

- Real-time AI decision logging  
- Judge evaluation scoring (1-10)  
- Stadium condition tracking  
- DynamoDB persistence (7-day retention)  
- REST API with POST/GET endpoints  
- React dashboard with 3-second polling  
- Responsive design  
- Color-coded score visualization  
- Full TypeScript support  
- Complete documentation  
- Production-ready code  

## What The System Does

```
Every 3 seconds:
1. Simulator generates random stadium conditions
2. Sends to Bedrock AI with prompt
3. AI returns: decision + reasoning + judge_score (1-10)
4. Posts to API Gateway → Lambda → DynamoDB
5. Frontend polls every 3 seconds for new logs
6. Dashboard displays cards in real-time
```

## Architecture Files

**Infrastructure:**
- `backend/template.yaml` - AWS SAM CloudFormation template
- `backend/lambdas/write/index.py` - Write handler
- `backend/lambdas/read/index.py` - Read handler

**Simulator:**
- `backend/simulator.py` - Generates conditions and calls Bedrock

**Frontend:**
- `frontend/src/pages/StadiumLogs.tsx` - Dashboard component
- `frontend/src/api.ts` - API integration
- `frontend/src/types.ts` - TypeScript types

## Configuration

### Backend (.env)
```
API_GATEWAY_URL=https://YOUR_API_GATEWAY_URL/prod
BEDROCK_MODEL=amazon.nova-lite-v1:0
BEDROCK_REGION=us-east-1
```

### Frontend (.env.local)
```
VITE_API_URL=https://YOUR_API_GATEWAY_URL/prod
VITE_POLLING_INTERVAL=3000
VITE_LOGS_LIMIT=50
```

## API Reference

### POST /log
Write a new log entry

```bash
curl -X POST https://YOUR_API/prod/log \
  -H "Content-Type: application/json" \
  -d '{
    "temp": 75,
    "people": 45000,
    "energy_price": 0.25,
    "decision": "Increase cooling",
    "reasoning": "High occupancy",
    "judge_score": 8
  }'
```

### GET /get-logs
Get recent logs

```bash
curl https://YOUR_API/prod/get-logs?limit=50
```

## Support

- **Quick Setup**: See [QUICK_START.md](QUICK_START.md)
- **Full Guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Troubleshooting**: See [MONITORING_DEBUG.md](MONITORING_DEBUG.md)
- **Architecture**: See [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)

## Project Structure

```
backend/
├── simulator.py          # Main simulator with Bedrock
├── template.yaml         # AWS SAM infrastructure
├── requirements.txt      # Python dependencies
├── AWS_BACKEND.md        # Backend docs
└── lambdas/
    ├── write/index.py   # Write handler
    └── read/index.py    # Read handler

frontend/
├── src/
│   ├── pages/StadiumLogs.tsx
│   ├── api.ts
│   ├── types.ts
│   └── App.tsx
└── package.json

QUICK_START.md           # START HERE
DEPLOYMENT_GUIDE.md
SYSTEM_OVERVIEW.md
MONITORING_DEBUG.md
BUILD_MANIFEST.md
```

## Key Features

- **Real-time Updates** - Dashboard polls every 3 seconds
- **AI Integration** - Uses AWS Bedrock (Amazon Nova Lite)
- **Persistent Storage** - DynamoDB with 7-day TTL
- **REST APIs** - POST /log and GET /get-logs
- **Responsive UI** - Mobile-friendly dashboard
- **TypeScript** - Full type safety
- **Production Ready** - Error handling, logging, monitoring
- **Well Documented** - 5 comprehensive guides

---

**Status**: Complete and Ready to Deploy  
**Cost**: ~$5-15/month  
**Setup Time**: ~15 minutes  
**Questions?**: Read [QUICK_START.md](QUICK_START.md) first!