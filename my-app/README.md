This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

npm install lucide-react
npm install xlsx
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install recharts
npm install framer-motion
npm install @radix-ui/react-icons
npm install @shadcn/ui


# Dataset Cleaning & AI Insights Tool

This project provides a browser-based tool for inspecting, cleaning, and improving datasets. It automatically identifies issues such as missing values, duplicates, and outliers, offers AI-generated recommendations, and allows users to preview cleaned data with full transparency.

---

## **Problem Statement**

Manual data cleaning is slow, error-prone, and inconsistent. Analysts and data scientists spend significant time cleaning datasets instead of analyzing them, and teams lack transparency on what changes were made.

---

## **Primary Users / Stakeholders**

- **Data Analysts**: Need clean, trustworthy datasets for reporting and dashboards.  
- **Data Scientists**: Require high-quality data for modeling.  
- **Business Intelligence (BI) Teams**: Want standardized datasets for executive dashboards.  
- **Operations Managers / Executives**: Need accurate data to make business decisions.

---

## **Pain Points Solved**

- **Time-consuming manual cleaning**: Missing values, duplicates, and formatting issues are automatically detected.  
- **Lack of transparency**: Shows before/after comparison of every row and column.  
- **No auditability**: Full diff viewer for changed or removed rows.  
- **Hidden data quality issues**: Ensures accurate datasets for analytics and modeling.

---

## **Solution Features**

- **AI-Generated Insights**: Recommendations for missing values, duplicates, and outliers.  
- **Exact Cleaned Data Preview**: Users can see the cleaned dataset in the browser.  
- **Diff Viewer**: Highlights changes and removed rows for full transparency.  
- **Charts & Metrics**: Visualizes before/after row counts and missing values.  
- **Export Options**: Download the cleaned dataset as CSV for further analysis.  

---

## **Success Criteria**

- **Faster data cleaning**: Hours of manual work reduced to minutes.  
- **Consistent, repeatable results**: Standardized cleaning rules for every dataset.  
- **Full audit transparency**: Easy verification of what changed or was removed.  
- **Higher trust in data**: Analysts and managers can rely on dataset accuracy.  
- **Increased productivity**: Focus shifts from cleaning to actual analysis.  

---

## **Potential Risks / Constraints**

- **Incorrect cleaning rules**: May remove or modify important data.  
- **Performance limits**: Large files may exceed browser memory limits.  
- **User trust**: Automated cleaning may need validation before adoption.  
- **Privacy & security**: Sensitive datasets must be handled safely.  
- **Varied data formats**: Need to handle CSV, XLSX, JSON, and inconsistent structures.

---

## **Getting Started**

1. Clone the repository  
   ```bash
   git clone https://github.com/yourusername/dataset-cleaning-tool.git


npm install
npm run dev



I can also **add screenshots of the charts, cleaned preview, and diff viewer** to make it more visually appealing for GitHub.  
Do you want me to do that next?


# Business Context

## Problem Statement
Organizations often spend a significant amount of time manually cleaning and validating datasets before they can be used for analysis. Missing values, duplicate entries, and outliers lead to inaccurate insights, wasted time, and inconsistent decision-making.

## Target Audience
- **Primary users:** Data analysts, data scientists, and business intelligence teams who work with raw datasets.  
- **Secondary stakeholders:** Operations managers, executives, and decision-makers relying on clean and accurate data.

## Pain Points
1. Manual data cleaning is time-consuming and error-prone.  
2. Lack of visibility into what changes were made to the dataset, reducing trust and auditability.  

## Success Criteria
- Automated detection and cleaning of missing values, duplicates, and outliers.  
- Clear before-and-after comparison of dataset changes with visualizations and diff viewer.  
- Users can export cleaned datasets easily for downstream use.  

## Constraints
- **Budget:** Limited to browser-based frontend solution; no paid backend services required.  
- **Timeline:** Must support rapid prototyping and iterative development.  
- **Technical:** Large datasets may be constrained by browser memory limits; must handle CSV/JSON/XLSX formats.


# Application Architecture

## Application Description
For this application: A browser-based AI-powered data cleaning and insights tool that allows users to upload datasets, automatically detect missing values, duplicates, and outliers, visualize changes, and download cleaned data.

## Main Components / Services

| Component | Responsibilities | Communication |
|-----------|-----------------|---------------|
| **Frontend (React/Next.js)** | - Upload and preview datasets<br>- Display charts and diff viewers<br>- Trigger AI insights and cleaning actions<br>- Handle CSV/XLSX downloads | Communicates with AI processing module (local or backend), reads uploaded data, sends cleaned data to export module |
| **AI Processing Module (JS Utility)** | - Analyze dataset for missing values, duplicates, and outliers<br>- Generate summary and improvement recommendations<br>- Optionally provide normalized/cleaned dataset | Invoked by frontend functions; no external calls needed if fully client-side |
| **Data Storage (optional)** | - Store uploaded datasets temporarily in memory or local storage<br>- Maintain state between screens | Frontend only (localStorage or React state) |
| **Diff & Visualization Engine (Recharts + Custom Components)** | - Compare before/after dataset rows<br>- Generate bar/line charts and diff tables<br>- Highlight changes and removed rows | Receives processed data from AI module and frontend state |
| **Export Module** | - Convert cleaned dataset to CSV/XLSX<br>- Provide download functionality | Reads cleaned data from frontend state |

## External Services / Integrations
- **File API / Browser Storage:** For temporary storage of uploaded datasets.  
- **Optional Backend (if scaling):** Could support large dataset processing or AI inference.  
- **No Auth / Email required** for the MVP; optional for enterprise deployments.  


# System Components

## Component 1: Frontend UI
**Type:** Frontend  
**Technology:** React + Next.js  
**Responsibilities:**
- Allow users to upload datasets and navigate between screens.
- Display AI insights, charts, diff tables, and cleaned dataset previews.
- Trigger CSV/XLSX downloads and handle local state management.

**Interfaces:**
- Receives from: AI Processing Module, Data Storage (local)
- Sends to: AI Processing Module, Export Module

## Component 2: AI Processing Module
**Type:** Service / Utility  
**Technology:** JavaScript (client-side)  
**Responsibilities:**
- Analyze datasets for missing values, duplicates, outliers, and normalization needs.
- Generate summary statistics and actionable recommendations.
- Optionally return cleaned/normalized dataset.

**Interfaces:**
- Receives from: Frontend UI
- Sends to: Frontend UI

## Component 3: Data Storage
**Type:** Frontend State / Local Storage  
**Technology:** React State / localStorage  
**Responsibilities:**
- Temporarily store uploaded dataset and cleaned dataset.
- Maintain state across screens.

**Interfaces:**
- Receives from: Frontend UI
- Sends to: Frontend UI, Export Module

## Component 4: Export Module
**Type:** Frontend Utility  
**Technology:** JavaScript (Blob / File API)  
**Responsibilities:**
- Generate CSV/XLSX files for cleaned datasets.
- Trigger browser downloads.

**Interfaces:**
- Receives from: Data Storage, Frontend UI
- Sends to: Browser / User

## Component 5: Diff & Visualization Engine
**Type:** Frontend Component  
**Technology:** Recharts + Custom React Components  
**Responsibilities:**
- Render before/after charts for missing values and row counts.
- Display changed and removed rows with diffs.
- Highlight improvements in cleaned dataset.

**Interfaces:**
- Receives from: Frontend UI, AI Processing Module
- Sends to: Frontend UI

## External Services
- None required for MVP; optional backend for heavy computation or storage.
- Optional integrations: Auth (Firebase/Auth0), Cloud Storage (S3/GCS), Email notifications.


# Data Analysis & AI Insights Application

## Business Context

### Problem Statement
Many businesses struggle to analyze large datasets for quality issues such as missing values, duplicates, and outliers. Manual review is time-consuming and error-prone, leading to inaccurate insights and poor data-driven decisions.

### Target Audience
- **Primary users:** Data analysts, business intelligence teams, data engineers
- **Secondary stakeholders:** Managers, decision-makers, IT teams

### Pain Points
1. Difficulty identifying and correcting data quality issues quickly.
2. Lack of visualization tools to understand dataset changes and improvements.

### Success Criteria
- Accurate detection and reporting of missing values, duplicates, and outliers.
- Easy visualization of before/after data cleaning and AI-generated insights.
- Ability to download cleaned datasets for downstream use.

### Constraints
- **Budget:** Limited to current development resources
- **Timeline:** Must be deployable within 4–6 weeks
- **Technical:** Must support CSV datasets, handle moderate data sizes efficiently, and integrate AI suggestions without external cloud dependencies.

---

## Application Overview
This web application provides automated data analysis, cleaning, and AI-generated improvement recommendations. Users can upload datasets, preview quality metrics, view AI insights, clean their data, and download the improved version.

### Main Components / Services
1. **Frontend (React / Next.js)**
   - **Responsibilities:** UI rendering, interactive charts, data previews, user input.
   - **Interfaces:** Sends API requests to Backend; receives processed data and AI insights.

2. **Backend API (Node.js / Express)**
   - **Responsibilities:** Processes data, runs AI analysis, handles cleaning operations, serves endpoints.
   - **Interfaces:** Receives requests from Frontend; queries Database and Cache.

3. **Database (PostgreSQL)**
   - **Responsibilities:** Stores raw datasets, cleaned datasets, and historical results.
   - **Interfaces:** Queried by Backend; optionally cached in Redis.

4. **Cache (Redis)**
   - **Responsibilities:** Temporary storage for repeated queries, faster access to large datasets.
   - **Interfaces:** Used by Backend API to reduce database load.

### External Services
- None required initially, but could include:
  - Cloud storage for large datasets
  - Authentication services (OAuth, SSO)
  - Email notifications for reports

---

## System Components

### Component 1: Frontend
**Type:** Frontend  
**Technology:** React / Next.js  
**Responsibilities:**
- Render interactive charts for data quality metrics.
- Display AI insights and recommendations.
- Provide a preview of cleaned datasets and diff viewer.
- Allow users to download cleaned CSV files.

**Interfaces:**
- Receives from: Backend API
- Sends to: Backend API

### Component 2: Backend API
**Type:** Backend  
**Technology:** Node.js / Express  
**Responsibilities:**
- Analyze uploaded datasets for quality issues.
- Run AI-driven recommendations.
- Clean and transform datasets.
- Serve data to frontend endpoints.

**Interfaces:**
- Receives from: Frontend
- Sends to: Frontend, Database, Cache

### Component 3: Database
**Type:** Database  
**Technology:** PostgreSQL  
**Responsibilities:**
- Persist original and cleaned datasets.
- Store historical reports for auditing.

**Interfaces:**
- Receives queries from Backend API
- Optionally provides cached results to Redis

### Component 4: Cache
**Type:** Service  
**Technology:** Redis  
**Responsibilities:**
- Cache frequent queries and computed summaries.
- Improve performance for large datasets.

**Interfaces:**
- Receives from: Backend API
- Sends to: Backend API

---

## System Architecture Flow

```text
User Browser
    ↓
Frontend (React / Next.js)
    ↓ (API calls)
Backend API (Node.js / Express)
    ↓ (queries)
Database (PostgreSQL)
    ↑ (cached data)
Cache (Redis)






your-project/
├── package.json
├── next.config.js
├── .env.local          # API keys, secrets (never commit)
├── .gitignore
│
├── public/
│   └── assets/         # static images/icons if needed
│
├── src/
│   ├── app/
│   │   ├── layout.js   # root layout
│   │   ├── page.jsx    # home page / screen 1
│   │   ├── upload/
│   │   │   └── page.jsx  # UploadPage
│   │   ├── DataPreview/
│   │   │   └── page.jsx  # DataPreviewPage
│   │   ├── AnalysisResultsDashboard/
│   │   │   └── page.jsx
│   │   ├── DetailedInsightsPage/
│   │   │   └── page.jsx
│   │   ├── CleanedPreviewPage/
│   │   │   └── page.jsx
│   │
│   ├── components/
│   │   ├── UploadPage.jsx
│   │   ├── DataPreviewPage.jsx
│   │   ├── AnalysisResultsDashboard.jsx
│   │   ├── DetailedInsightsPage.jsx
│   │   ├── CleanedPreviewPage.jsx
│   │
│   ├── utils/
│   │   ├── ai-suggest.js
│   │   ├── dataprofiler.js
│   │   ├── csv.js
│   │   └── helpers.js
│   │
│   ├── styles/
│   │   ├── UploadPage.css
│   │   ├── DataPreviewPage.css
│   │   ├── AnalysisResultsDashboard.css
│   │   ├── DetailedInsightsPage.css
│   │   └── CleanedPreviewPage.css
│
├── vitest.config.js    # if using tests
└── README.md
