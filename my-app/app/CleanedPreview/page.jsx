// components/CleanedPreviewPage.jsx
'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line } from 'recharts';
import './CleanedDataPage.css'; // drop styles below

export default function CleanedPreviewPage({ originalData = [], cleanedData = [], onBack = () => {} }) {
  const columns = originalData[0] ? Object.keys(originalData[0]) : (cleanedData[0] ? Object.keys(cleanedData[0]) : []);

  // Build per-column before/after metrics for charts (missing only for brevity)
  const summaryPerColumn = useMemo(() => {
  const beforeRowCount = originalData.length;
  const afterRowCount = cleanedData.length;

  return columns.map((col) => {
    const beforeVals = (originalData || []).map(r => r[col]);
    const afterVals = (cleanedData || []).map(r => r[col]);

    const isMissing = v => v === null || v === undefined || v === "";
    const beforeMissing = beforeVals.filter(isMissing).length;
    const afterMissing = afterVals.filter(isMissing).length;

    return {
      column: col,
      beforeMissing,
      afterMissing,

      // FIXED: dataset-level row counts
      beforeTotal: beforeRowCount,
      afterTotal: afterRowCount,

      beforeMissingPct: beforeRowCount ? Math.round((beforeMissing / beforeRowCount) * 100) : 0,
      afterMissingPct: afterRowCount ? Math.round((afterMissing / afterRowCount) * 100) : 0,
    };
  });
}, [columns, originalData, cleanedData]);


  console.log("summaryPerColumn →", summaryPerColumn);


  // Build diff rows: only rows that changed or removed
  const diffs = useMemo(() => {
    const origKeys = (originalData || []).map(r => JSON.stringify(r));
    const cleanedKeys = (cleanedData || []).map(r => JSON.stringify(r));
    const removed = [];
    const changed = [];

    originalData.forEach((r, idx) => {
      const key = JSON.stringify(r);
      if (!cleanedKeys.includes(key)) {
        // either removed or modified — find best match by index in cleaned
        const cleanedRow = cleanedData[idx];
        if (!cleanedRow) {
          removed.push({ index: idx, original: r });
        } else {
          // check cellwise diffs
          const cellDiffs = {};
          let anyChange = false;
          columns.forEach((c) => {
            const a = r[c];
            const b = cleanedRow[c];
            if (String(a ?? '') !== String(b ?? '')) {
              cellDiffs[c] = { before: a, after: b };
              anyChange = true;
            }
          });
          if (anyChange) changed.push({ index: idx, diffs: cellDiffs, original: r, cleaned: cleanedRow });
          else removed.push({ index: idx, original: r });
        }
      }
    });

    return { removed, changed };
  }, [originalData, cleanedData, columns]);

  // CSV download helper for cleanedData
  const downloadCSV = () => {
    if (!cleanedData || !cleanedData.length) return;
    const cols = Object.keys(cleanedData[0]);
    const csvRows = [
      cols.join(","),
      ...cleanedData.map(r => cols.map(c => JSON.stringify(r[c] ?? "")).join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned_preview.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cleaned-page">
      <div className="cleaned-header">
        <h2>Cleaned Data Preview</h2>
        <div className="header-actions">
          <button className="btn" onClick={onBack}>Back</button>
          <button className="btn primary" onClick={downloadCSV}>Download Cleaned CSV</button>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h4>Missing Values — Before vs After (%)</h4>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={summaryPerColumn}
            margin={{ top: 20, right: 20, left: 8, bottom: 40 }}   // <-- add bottom space for long x labels
            >
              <XAxis dataKey="column" interval={0} angle={-30} textAnchor="end" height={60} /> // rotate long labels
              <YAxis />
              <Tooltip />
              <Bar dataKey="beforeMissingPct" name="Before %" />
              <Bar dataKey="afterMissingPct" name="After %" >
                {summaryPerColumn.map((entry, i) => (
                  <Cell key={i} fill={entry.afterMissingPct < entry.beforeMissingPct ? "#34D399" : "#F59E0B"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Rows Count — Before vs After</h4>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={summaryPerColumn}>
              <XAxis dataKey="column" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="beforeTotal" name="Before" stroke="#60A5FA" />
              <Line type="monotone" dataKey="afterTotal" name="After" stroke="#34D399" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="preview-section">
        <h3>Exact Cleaned Data (first 200 rows)</h3>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(c => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {cleanedData.slice(0, 200).map((row, ri) => (
                <tr key={ri}>
                  {columns.map(col => <td key={col}>{String(row[col] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="diff-section">
        <h3>Diff Viewer — Changes & Removed Rows</h3>

        <div>
          <h4>Changed rows</h4>
          {diffs.changed.length === 0 && <div className="muted">No changed rows detected.</div>}
          {diffs.changed.slice(0,50).map((c, i) => (
            <div key={i} className="diff-card">
              <div className="diff-meta">Row #{c.index}</div>
              <table className="diff-table">
                <thead><tr><th>Column</th><th>Before</th><th>After</th></tr></thead>
                <tbody>
                  {Object.entries(c.diffs).map(([col, vals]) => (
                    <tr key={col}>
                      <td>{col}</td>
                      <td className="diff-before">{String(vals.before ?? '')}</td>
                      <td className="diff-after">{String(vals.after ?? '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div>
          <h4>Removed rows</h4>
          {diffs.removed.length === 0 && <div className="muted">No removed rows.</div>}
          {diffs.removed.slice(0,50).map((r, i) => (
            <div key={i} className="removed-row">
              <div>Row #{r.index} removed (too many missing / duplicate)</div>
              <pre className="removed-pre">{JSON.stringify(r.original, null, 2)}</pre>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
