# Agentic Data Quality Analysis Platform

**Project Name:** agentic-data-quality-analysis-platform
**Target Competency:** CCC.1 Develop Technology Solutions (Level 10)
**Duration:** 10 days
**Skill Level:** beginner

## Overview

Business users and data analysts need an intuitive way to understand and improve their dataset quality without requiring deep technical expertise. Current solutions are either too complex for business users or lack intelligent insights about data quality issues.

This project will help you build a complete AI-powered data quality analysis platform using Next.js while demonstrating Level 10 competency in the CCC.1 framework.

## Features

1. **File Upload & Processing**: Support for CSV, JSON, and Excel files with secure client-side processing
2. **Automated Quality Analysis**: Statistical analysis identifying missing values, outliers, inconsistencies, and duplicates
3. **AI-Powered Insights**: Natural language explanations of data quality issues and improvement recommendations
4. **Interactive Dashboards**: Visual representation of quality metrics and trends
5. **Export & Sharing**: Professional reports and actionable recommendations

## Tech Stack

- **Frontend:** React 18 + Next.js 14 (JavaScript, NO TypeScript)
- **Language:** JavaScript ES6+ (.jsx, .js files)
- **Bundler:** Turbopack
- **Routing:** Next.js App Router
- **Data Processing:** Papa Parse (CSV/JSON parsing)
- **AI Integration:** OpenAI API v4+
- **Styling:** CSS3 with CSS Custom Properties (NO Tailwind - custom CSS files)
- **Charts:** Chart.js + react-chartjs-2
- **Testing:** Vitest + React Testing Library (JavaScript)
- **Storage:** Client-side only (sessionStorage for security)

**Why JavaScript + CSS?**
This project uses vanilla JavaScript and custom CSS3 to help you learn fundamental web development skills that transfer to any framework. You'll understand the cascade, specificity, CSS Grid, Flexbox, and modern JavaScript without framework-specific abstractions.

## Getting Started

1. Review [start_here.md](./start_here.md) for pre-development checklist
2. Read the [problem statement](./00-problem.md)
3. Review [project scope](./01-project-scope.md) (CCC.1 Level 10 format)
4. Follow [setup instructions](./04-SETUP_INSTRUCTIONS.md)
5. Begin with [Milestone 1](./milestone/Milestone1/m1.md)

## Project Structure

```
agentic-data-quality-analysis-platform/
├── README.md                          # This file
├── CLAUDE.md                          # AI assistant context
├── .gitignore                         # Git ignore rules
├── start_here.md                      # Student onboarding
├── JAVASCRIPT_CSS_MIGRATION_GUIDE.md  # TypeScript→JavaScript conversion guide
├── SKILLS_MAPPING.md                  # Technical skills breakdown
├── overview.md                        # High-level overview
├── 00-problem.md                      # Problem statement
├── 01-project-scope.md                # CCC.1 Level 10 scope
├── 02-wireframes-overview.md          # UI/UX design guide
├── 03-trello-project-board-guide.md   # Agile board setup
├── 04-SETUP_INSTRUCTIONS.md           # Setup & deployment
├── project-requirements-scope.md      # Fillable template
├── TODO.md                            # Project checklist
│
├── milestone/
│   ├── Milestone1/m1.md              # Sprint 1: Next.js + CSS setup
│   ├── Milestone2/m2.md              # Sprint 2: Data analysis engine
│   ├── Milestone3/m3.md              # Sprint 3: AI insights + charts
│   └── Milestone4/m4.md              # Sprint 4: Testing + deployment
│
├── img/                               # Wireframes
│   ├── Step-0.png
│   ├── Step-1.png
│   └── ...
│
├── learn-more/
│   └── resources.md                   # Learning resources
│
├── tech-skills/
│   └── [skill guides]                 # JavaScript, CSS, React tutorials
│
├── facilitation-guide/
│   ├── project-schedule.md
│   ├── example-week.md
│   ├── micro-milestones.md
│   └── term-example.md
│
└── business-case/
    ├── oral-defense-rubric.md
    ├── oral-defense-presentation-template.md
    ├── incentive-requirements.md
    └── canva-presentation-design-guide.md
```

## Project File Structure (current repository)

Below is the current layout of this repository — the working demo lives in the `my-app/` Next.js application folder.

```
data-analysis-tutorial/
├── 00-problem.md
├── 01-project-scope.md
├── 02-wireframes-overview.md
├── 03-trello-project-board-guide.md
├── 04-SETUP_INSTRUCTIONS.md
├── README.md                          # This file
├── start_here.md
├── TODO.md
├── wireframe-imgs/                    # Excalidraw and PNG wireframes
│   ├── data-quality-platform-architecture.excalidraw
│   ├── screen1.png
│   └── screen2.png
├── prisma/                            # prisma schema (if used)
│   └── schema.prisma
├── my-app/                            # Next.js demo application
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── .gitignore
│   ├── .data/                          # small JSON persistence used by demo
│   │   ├── lineage.json
│   │   └── dedupe.json
│   ├── public/
│   │   ├── datasets/
│   │   │   ├── sample-sales.csv
│   │   │   └── sample-customers.csv
│   │   └── *.svg (icons and assets)
│   ├── app/                            # Next.js App Router pages
│   │   ├── layout.js
│   │   ├── page.jsx                    # Home / upload UI (demo)
│   │   ├── DataPreview/                # Page-level components
│   │   │   └── page.jsx
│   │   ├── AnalysisResultsDashboard/
│   │   │   └── page.jsx
│   │   └── DetailedInsightsPage/
│   │       └── page.jsx
│   ├── api/                            # Server endpoints used by the UI
│   │   ├── analyze.js
│   │   └── ai-suggest.js
│   ├── lib/                            # server-side libraries & pipeline
│   │   ├── dataPipeline.js
│   │   ├── dataAnalysis.js
│   │   ├── aiIntegration.js
│   │   └── prisma.js
│   ├── components/                      # (some components may live here)
│   │   └── data/                        # component folder (may be empty or in flux)
│   ├── styles/
│   │   └── index.css
│   └── test/
│       └── setup.js
└── data-analysis-tutorial/README.md    # project-level README (this file)

```

## Learning Objectives

By completing this project, you will demonstrate:

- **CCC.1.1:** Problem identification and analysis
- **CCC.1.2:** Solution planning with technical challenges
- **CCC.1.3:** Implementation using industry best practices
- **CCC.1.4:** Testing with multiple user categories
- **CCC.1.5:** Professional documentation and communication

## Performance Targets

- Lighthouse Performance: ≥ 85
- Lighthouse Accessibility: ≥ 90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle Size: < 500KB

## Accessibility Standards

- WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ≥ 4.5:1

## License

MIT License - Educational use encouraged

---

**Generated:** 2025-11-15
**Generator Version:** 1.0.0

