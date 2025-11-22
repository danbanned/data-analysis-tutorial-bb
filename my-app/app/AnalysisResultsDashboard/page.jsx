'use client';

import { AlertCircle } from 'lucide-react';
import "./pastel.css";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function AnalysisResultsDashboard({
  data = [],
  qualityMetrics = [],
  columnStats = [],
  overallScore = 0,
  totalMissing = 0,
  totalOutliers = 0,
  totalCells = 1,
  onViewDetails,
}) {

  const safeQualityMetrics = Array.isArray(qualityMetrics) ? qualityMetrics : [];
  const safeColumnStats = Array.isArray(columnStats) ? columnStats : [];

  // Only show metrics that need improvement
  const improvementMetrics = safeQualityMetrics.filter(m => m.score < 100);

  // Rank columns by severity
  const rankedColumns = [...safeColumnStats].sort((a, b) => {
    const aScore = (a.missing * 3) + (a.outliers * 2);
    const bScore = (b.missing * 3) + (b.outliers * 2);
    return bScore - aScore; // highest first
  });

  // Priority color + label
  const getPriority = (col) => {
    if (col.missing > 40 || col.outliers > 20) return { level: "Critical", color: "red" };
    if (col.missing > 10 || col.outliers > 5) return { level: "High", color: "orange" };
    if (col.missing > 0 || col.outliers > 0) return { level: "Medium", color: "goldenrod" };
    return { level: "Low", color: "green" };
  };

  const getMetricColor = (issues = "") => {
    const txt = issues.toLowerCase();
    if (txt.includes("missing")) return "red";
    if (txt.includes("outlier")) return "goldenrod";
    if (txt.includes("duplicate")) return "blue";
    if (txt.includes("normal")) return "green";
    return "#8884d8";
  };

  return (
    <div className="pastel-page-bg min-h-screen p-10">
      <h1 className="pastel-title">Quality Improvements Needed</h1>

      {/* SCORE CARD */}
      <div className="pastel-card pastel-highlight">
        <div className="score-circle">{overallScore}</div>
        <p className="score-label">Overall Quality Score</p>
        <p className="text-sm mt-2 opacity-70">
          Lower score = more improvements needed
        </p>
      </div>

      {/* ONLY METRICS THAT NEED FIXING */}
      <div className="pastel-card">
        <h2 className="pastel-subtitle">Metrics Requiring Improvement</h2>

        {improvementMetrics.length === 0 && (
          <p className="italic text-gray-500">All quality metrics look good.</p>
        )}

        {improvementMetrics.length > 0 && (
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <ComposedChart data={improvementMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />

                <Bar dataKey="score" barSize={40}>
                  {improvementMetrics.map((m, i) => (
                    <Cell key={i} fill={getMetricColor(m.issues)} />
                  ))}
                </Bar>

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#444"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                >
                  {improvementMetrics.map((m, i) => (
                    <Cell key={i} fill={getMetricColor(m.issues)} />
                  ))}
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4">
          {improvementMetrics.map((m, i) => (
            <div key={i} className="metric-row">
              <div className="flex justify-between">
                <span>{m.name}</span>
                <span className="metric-score">{m.score}%</span>
              </div>
              <p className="metric-issues">• {m.issues}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RANKED COLUMN PROBLEMS */}
      <div className="pastel-card">
        <h2 className="pastel-subtitle">Columns Needing Attention</h2>

        {rankedColumns.filter(c => c.missing || c.outliers).length === 0 && (
          <p className="italic text-gray-500">No problematic columns found.</p>
        )}

        {rankedColumns.map((col, i) => {
          const p = getPriority(col);
          return (
            <div key={i} className="issue-row flex justify-between items-center">
              <div>
                <strong>{col.name}</strong>
                <div className="text-sm opacity-70">
                  {col.missing} missing, {col.outliers} outliers
                </div>
              </div>

              <span
                className="px-2 py-1 rounded-lg text-white text-xs"
                style={{ backgroundColor: p.color }}
              >
                {p.level}
              </span>
            </div>
          );
        })}
      </div>

      {/* AI RECOMMENDATIONS */}
      <div className="pastel-card pastel-warning">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="warn-icon" />
          <h2 className="pastel-subtitle">AI Recommendations</h2>
        </div>

        <ul className="pastel-list">
          {rankedColumns
            .filter(c => c.missing || c.outliers)
            .map((col, i) => (
              <li key={i}>
                <strong>{col.name}:</strong>{" "}
                {col.missing > 0 && `${col.missing} missing → use imputation. `}
                {col.outliers > 0 && `${col.outliers} outliers → consider clipping or scaling.`}
              </li>
            ))}

          {rankedColumns.every(c => c.missing === 0 && c.outliers === 0) && (
            <li className="italic text-gray-500">
              No issues detected — dataset is clean.
            </li>
          )}
        </ul>

        <button onClick={onViewDetails} className="mt-6 w-full btn-primary">
          View Detailed Insights
        </button>
      </div>
    </div>
  );
}
