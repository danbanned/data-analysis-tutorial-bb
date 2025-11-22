'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';
import './DetailedInsightsPage.css';
import { generateAiInsights } from "../utils/ai-suggest";



export default function DetailedInsightsPage({
  columnStats = [],
  data = [],
  onReset
}) {
  const [expandedColumn, setExpandedColumn] = useState(null);

  const safeColumnStats = Array.isArray(columnStats) ? columnStats : [];
  const totalRows = data.length;
  const [aiInsightText, setAiInsightText] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState([]);

   const handleGenerateAi = () => {
  const { summary, recommendations } = generateAiInsights(data);
  setAiInsightText(summary);
  setAiRecommendations(recommendations);
};

// Download a CSV of the full dataset
const handleDownloadReport = () => {
  if (!data || !data.length) return;
  if (!localData.length) return;
  // ... generate CSV from localData


  const columns = Object.keys(data[0]);
  const csvRows = [
    columns.join(","), // header row
    ...data.map(row => columns.map(col => JSON.stringify(row[col] ?? "")).join(",")),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "full_report.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// Export an "auto-cleaned" version (for example: remove missing values or duplicates)
const handleExportCleaned = () => {
  if (!data || !data.length) return;

  const cleanedData = data.map(row => {
    const newRow = {};
    Object.entries(row).forEach(([key, val]) => {
      newRow[key] = val ?? ""; // simple cleaning: replace null/undefined with empty
    });
    return newRow;
  });

  const columns = Object.keys(cleanedData[0]);
  const csvRows = [
    columns.join(","), // header row
    ...cleanedData.map(row => columns.map(col => JSON.stringify(row[col])).join(",")),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "auto_cleaned_dataset.csv";
  a.click();
  URL.revokeObjectURL(url);
};



  /**
   * Build improvement-focused suggestions
   */
  const buildColumnDetails = (col) => {
    const missingPct = totalRows ? ((col.missing / totalRows) * 100).toFixed(1) : 0;

    const issues = [
      { label: "Data Type", value: col.type ?? "Unknown" },
      { label: "Missing Values", value: `${col.missing} (${missingPct}%)` },
      { label: "Unique Values", value: col.unique },
      { label: "Outliers", value: col.outliers },
    ];

    // IMPROVEMENT-FOCUSED SUGGESTIONS
    const suggestions = [];

    if (col.missing > 0) {
      suggestions.push(
        `Impute ${col.missing} missing value(s). Recommended strategies: ${
          col.type === "number"
            ? "median or mean imputation."
            : col.type === "text"
            ? "most frequent category."
            : "appropriate domain default."
        }`
      );
    }

    if (col.outliers > 0) {
      suggestions.push(
        `Investigate ${col.outliers} outlier(s). Consider: capping winsorization, z-score filtering, or manual review.`
      );
    }

    if (col.unique < totalRows * 0.1 && col.type === "text") {
      suggestions.push(
        `Low uniqueness detected. Consider encoding this field (one-hot or frequency encoding).`
      );
    }

    if (col.type === "number" && col.needsNormalization) {
      suggestions.push("Normalize this numeric feature (min-max or standard scaling).");
    }

    return {
      name: col.name,
      issues,
      suggestions,
      hasProblems: suggestions.length > 0,
      color:
        col.missing > 0 ? "amber" :
        col.outliers > 0 ? "red" :
        "emerald"
    };
  };

  const colorMap = {
    red: { bg: 'bg-red', text: 'text-red', border: 'border-red' },
    amber: { bg: 'bg-amber', text: 'text-amber', border: 'border-amber' },
    emerald: { bg: 'bg-emerald', text: 'text-emerald', border: 'border-emerald' },
  };

  return (
    <div className="detailed-page">
      <div className="detailed-container">

        <h1 className="detailed-title">SCREEN 4: Data Improvement Insights</h1>

        <div className="ai-insight-card">
          <h3 className="ai-insight-title">AI Insights</h3>
          <p className="ai-insight-text">{aiInsightText || "Click the button to generate AI insights from your dataset."}</p>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleGenerateAi}>
              Generate AI Insight
            </button>
          </div>

          {aiRecommendations.length > 0 && (
            <div className="columns-list" style={{ marginTop: "20px" }}>
              {aiRecommendations.map((r) => (
                <div key={r.column} className="column-card bg-emerald">
                  <div className="column-header">
                    <span className="header-title">{r.column}</span>
                  </div>
                  <div className="column-details">
                    <ul className="suggestions-list">
                      {r.recommendations.length
                        ? r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)
                        : "No issues detected"}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        <p className="subtitle">
          This screen highlights **where your dataset needs improvement** and explains **what you can do next**.
        </p>

        {safeColumnStats.length === 0 && (
          <p className="text-gray-500 text-center mt-10">
            No data available for analysis.
          </p>
        )}

        <div className="columns-list">
          {safeColumnStats.map((col) => {
            const details = buildColumnDetails(col);
            const isExpanded = expandedColumn === col.name;
            const classes = colorMap[details.color];

            return (
              <div key={col.name} className="column-card">

                {/* Header */}
                <button
                  onClick={() => setExpandedColumn(isExpanded ? null : col.name)}
                  className={`column-header ${classes.bg} ${classes.border}`}
                >
                  <div className="header-left">
                    {details.hasProblems ? (
                      <AlertTriangle className={`icon ${classes.text}`} />
                    ) : (
                      <CheckCircle className={`icon ${classes.text}`} />
                    )}
                    <span className="header-title">
                      {details.name} — {details.hasProblems ? "Needs Attention" : "Healthy"}
                    </span>
                  </div>
                  <ChevronDown className={`chevron ${isExpanded ? 'rotate' : ''}`} />
                </button>

                {/* Details */}
                {isExpanded && (
                  <div className="column-details">

                    <h3 className="details-title">Column Overview</h3>
                    <ul className="details-list">
                      {details.issues.map((issue, idx) => (
                        <li key={idx}>
                          • <strong>{issue.label}:</strong> {issue.value}
                        </li>
                      ))}
                    </ul>

                    {details.hasProblems && (
                      <>
                        <h3 className="details-title flex items-center gap-2">
                          <Wrench size={18} /> Recommended Fixes
                        </h3>
                        <ul className="suggestions-list">
                          {details.suggestions.map((s, idx) => (
                            <li key={idx}>
                              {idx + 1}. {s}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Actions */}
       <div className="action-buttons">
        <button className="btn-primary" onClick={handleDownloadReport}>
          Download Full Report
        </button>
        <button className="btn-secondary" onClick={handleExportCleaned}>
          Export Auto-Cleaned Dataset
        </button>
        <button onClick={onReset} className="btn-tertiary mt-4">Start Over</button>
      </div>


      </div>
    </div>
  );
}
