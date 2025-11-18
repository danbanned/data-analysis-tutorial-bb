# Agentic Data Quality Analysis Platform - Setup Instructions

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- **npm** package manager
- **OpenAI API Key** for AI-powered insights ([Get API Key](https://platform.openai.com/api-keys))
- **Code Editor** (VS Code recommended)

## Installation Steps

### 1. Clone or Create Repository

```bash
# If starting fresh
mkdir agentic-data-quality-analysis-platform
cd agentic-data-quality-analysis-platform
git init

# If cloning existing repo
git clone <your-repo-url>
cd agentic-data-quality-analysis-platform
```

### 2. Install Dependencies

```bash
# Install pnpm if needed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Configure Environment Variables

Create `.env.local` file in project root:

```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_MAX_FILE_SIZE_MB=50
NEXT_PUBLIC_SUPPORTED_FORMATS=csv,json,xlsx
```

### 4. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Generate a new API key
4. Add billing information (required for API usage)
5. Copy the API key to your `.env.local` file

**Important:** Keep your API key secure and never commit it to version control.
### 5. Install Required Dependencies

The platform uses several key libraries:

```bash
# Install core dependencies
pnpm add next react react-dom typescript
pnpm add papaparse chart.js react-chartjs-2
pnpm add @types/papaparse
pnpm add tailwindcss @tailwindcss/typography
pnpm add openai

# Install development dependencies
pnpm add -D @types/react @types/react-dom
pnpm add -D eslint eslint-config-next
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### 6. Start Development Server

```bash
pnpm run dev
```

Visit http://localhost:3000 in your browser.

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Home page with file upload
│   ├── analysis/          # Data analysis results pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── FileUpload.tsx     # File upload component
│   ├── DataPreview.tsx    # Dataset preview table
│   ├── QualityScore.tsx   # Data quality scoring
│   ├── AIInsights.tsx     # AI-generated explanations
│   └── DataVisualizations.tsx
├── lib/
│   ├── dataAnalysis.ts    # Core analysis functions
│   ├── aiIntegration.ts   # OpenAI API integration
│   ├── fileProcessing.ts  # CSV/JSON parsing
│   └── qualityMetrics.ts  # Quality scoring algorithms
└── types/
    └── DataTypes.ts       # TypeScript interfaces
```

## Deployment

### Deploy to Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_MAX_FILE_SIZE_MB`
   - `NEXT_PUBLIC_SUPPORTED_FORMATS`
3. Deploy automatically on commits

```bash
# Or deploy via CLI
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build project
pnpm run build

# Deploy
netlify deploy --prod --dir=.next
```

## Testing the Platform

### Sample Dataset Testing

1. Create test CSV files with common data quality issues:
   - Missing values
   - Inconsistent data types
   - Outliers
   - Duplicate records

2. Test file upload and analysis:
   - Upload test files
   - Verify quality score calculation
   - Check AI explanation generation
   - Test mobile responsiveness

### Performance Testing

```bash
# Run performance tests
pnpm run test:performance

# Check bundle size
pnpm run analyze
```

## Troubleshooting

**OpenAI API errors:**
```bash
# Check API key validity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**File processing errors:**
- Verify file format is supported (CSV, JSON, XLSX)
- Check file size is under 50MB limit
- Ensure proper character encoding (UTF-8)

**Module not found errors:**
```bash
rm -rf node_modules package-lock.json .next
pnpm install
```

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or change port
pnpm run dev -- -p 3001
```

**Build errors:**
```bash
# Clear build cache
rm -rf .next

# Rebuild
pnpm run build
```

## Security Considerations

- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement rate limiting for API calls
- Validate file uploads to prevent malicious files
- Use HTTPS in production
- Implement proper error handling to avoid information leakage

## Next Steps

1. Review [start_here.md](./start_here.md)
2. Begin with [Milestone 1](./milestone/Milestone1/m1.md)
3. Create Trello board following [03-trello-project-board-guide.md](./03-trello-project-board-guide.md)
