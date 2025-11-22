'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Edit3, Repeat, AlertTriangle, CheckCircle } from 'lucide-react';
import './DataPreviewPage.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,} from 'recharts';

import { number } from 'framer-motion';


/* ======================================================
   HELPERS — Detection, Scoring, Recommendations, Flags
   ====================================================== */

// Safe sum helper
function sumObject(obj, key) {
  if (!obj || typeof obj !== 'object') return 0;
  return Object.values(obj).reduce((sum, c) => sum + (c[key] || 0), 0);
}

//=====================Dates section======================//


function detectDateFormat(value) {
  if (!value) return null;

  // Number input → check for timestamps
  if (!isNaN(Number(value))) {
    const num = Number(value);

    // Unix seconds (10 digits)
    if (num > 1_000_000_000 && num < 2_000_000_000) {
      return { type: "unix-seconds", date: new Date(num * 1000) };
    }

    // Unix milliseconds (13 digits)
    if (num > 1_000_000_000_000 && num < 2_000_000_000_0000) {
      return { type: "unix-ms", date: new Date(num) };
    }

    // Excel serial date
    if (num > 59 && num < 60000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const excelDate = new Date(excelEpoch.getTime() + num * 86400000);
      return { type: "excel", date: excelDate };
    }
  }

  // ISO (2024-05-01, 2023-01-10T12:30Z, etc.)
  if (!isNaN(Date.parse(value))) {
    return { type: "iso", date: new Date(value) };
  }

  // Common date formats
  const patterns = [
    { regex: /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, type: "slash" },
    { regex: /^\d{4}\/\d{1,2}\/\d{1,2}$/, type: "yyyy-slash" },
    { regex: /^\d{1,2}-\d{1,2}-\d{2,4}$/, type: "dash" },
  ];

  for (const p of patterns) {
    if (p.regex.test(value)) {
      const date = new Date(value);
      if (!isNaN(date)) return { type: p.type, date };
    }
  }

  return null;
}

// Basic type detection for a column (string/integer/date/float)
function detectColumnType(values) {
  const cleaned = values.filter(v => v != null && v !== "");
  if (cleaned.length === 0) return "unknown";

  // DATE CHECK FIRST
  const allDates = cleaned.every(v => detectDateFormat(v));
  if (allDates) return "date";

  const allInt = cleaned.every(v => Number.isInteger(Number(v)));
  if (allInt) return "integer";

  const allNumeric = cleaned.every(v => !isNaN(Number(v)));
  if (allNumeric) return "number";

  return "string";
}

function normalizeValueForType(value, type) {
  if (type === "date") {
    const parsed = detectDateFormat(value);
    return parsed?.date || null;
  }
  if (type === "number" || type === "integer") {
    return Number(value);
  }
  return value;
}




function detectDateOutliers(dates) {
  const valid = dates.filter(d => d instanceof Date && !isNaN(d));
  if (valid.length === 0) return [];

  const outliers = [];

  const now = new Date();
  const year2100 = new Date("2100-01-01");
  const year1900 = new Date("1900-01-01");

  for (let d of valid) {
    // too far in the future
    if (d > year2100) outliers.push({ date: d, reason: "Unrealistic future date" });
      
    // future after today
    else if (d > now) outliers.push({ date: d, reason: "Future date" });

    // too old
    else if (d < year1900) outliers.push({ date: d, reason: "Unrealistically old date" });
  }

  return outliers;
}

//=====================Dates section======================//

// Outlier detection for numeric arrays (3-sigma + domain checks)
function detectOutliersArray(values, type, columnName) {
  if (!Array.isArray(values) || values.length === 0) return [];

  const nums = values.map((v) => (v === null || v === undefined || v === '') ? null : Number(v))
    .filter((v) => v !== null && !isNaN(v));

  if (nums.length === 0) return [];

  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  const sd = Math.sqrt(variance);

  // Mark outlier if beyond 3 std dev OR domain-specific for "age"
  const outliers = [];
  values.forEach((v, idx) => {
    if (v === null || v === undefined || v === '') return;
    const n = Number(v);
    if (isNaN(n)) return;
    if (Math.abs(n - mean) > 3 * sd) outliers.push(idx);
    if (columnName.toLowerCase().includes('age')) {
      if (n < 0 || n > 120) outliers.push(idx);
    }
  });

  // unique indices
  return Array.from(new Set(outliers));
}

// Duplicate detection in a column -> returns set of values that are duplicates
function findDuplicateValues(values) {
  const counts = new Map();
  values.forEach((v) => {
    const key = v === null || v === undefined ? '__NULL__' : String(v).trim();
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const duplicates = new Set();
  for (const [k, c] of counts.entries()) {
    if (k !== '__NULL__' && c > 1) duplicates.add(k);
  }
  return duplicates;
}

// Context checks: name/email/phone/age validators -> return {validCount, total}
function columnContextCheck(values, columnName) {
  const cleaned = values.map((v) => (v === undefined || v === null) ? '' : String(v).trim());
  let valid = 0;
  let total = 0;

  // email check
  if (columnName.toLowerCase().includes('email')) {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i;
    cleaned.forEach((c) => { if (c !== '') { total++; if (re.test(c)) valid++; }});
    return { valid, total, label: 'email' };
  }

  // name check (First Last)
  if (columnName.toLowerCase().includes('name')) {
    const re = /^[A-Za-zÀ-ÿ ,.'-]{2,}\s+[A-Za-zÀ-ÿ ,.'-]{2,}$/;
    cleaned.forEach((c) => { if (c !== '') { total++; if (re.test(c)) valid++; }});
    return { valid, total, label: 'name' };
  }

  // age / numeric checks
  if (columnName.toLowerCase().includes('age')) {
    cleaned.forEach((c) => { if (c !== '') { total++; const n = Number(c); if (!isNaN(n) && n >= 0 && n <= 120) valid++; }});
    return { valid, total, label: 'age' };
  }

  // phone
  if (columnName.toLowerCase().includes('phone')) {
    const re = /^\+?\d[\d\s.-]{6,}\d$/;
    cleaned.forEach((c) => { if (c !== '') { total++; if (re.test(c)) valid++; }});
    return { valid, total, label: 'phone' };
  }

  // generic string: treat non-empty as valid for editability detection
  cleaned.forEach((c) => { if (c !== '') { total++; valid++; }});
  return { valid, total, label: 'string' };
}

// Compute the full 0-100 score using weights:
// Missing 40%, Duplicates 30%, Outliers 20%, Context 10%
function computeQualityScoreFromColumnStats(columnStatsObj, rowCount, columnCount) {
  // columnStatsObj can be object keyed by name or array; normalize to array
  const statsArr = Array.isArray(columnStatsObj) ? columnStatsObj : Object.values(columnStatsObj || {});
  const totalCells = Math.max(1, rowCount * Math.max(1, columnCount));
  const totals = {
    missing: statsArr.reduce((s, c) => s + (c.missing || 0), 0),
    duplicates: statsArr.reduce((s, c) => s + (c.duplicates || 0), 0),
    outliers: statsArr.reduce((s, c) => s + (c.outliers || 0), 0),
  };

  const missingRatio = Math.min(1, totals.missing / totalCells);
  const duplicateRatio = Math.min(1, totals.duplicates / totalCells);
  const outlierRatio = Math.min(1, totals.outliers / totalCells);

  const missingScore = 40 * (1 - missingRatio);
  const duplicateScore = 30 * (1 - duplicateRatio);
  const outlierScore = 20 * (1 - outlierRatio);

  // contextScore will be computed separately and provided by caller in this code path
  // but if not, assume neutral 10
  const contextScore = 0; // we compute below by column validity

  // We'll compute context validity percent across columns later (0-10)
  // Return partial components and totals for caller to finalize
  return {
    partial: Math.max(34, Math.min(90, Math.round(missingScore + duplicateScore + outlierScore))),
    totals,
    totalCells,
  };
}

// Generate basic recommendations
function generateRecommendationsFromStats(columnStatsObj) {
  const statsArr = Array.isArray(columnStatsObj) ? columnStatsObj : Object.values(columnStatsObj || {});
  const recs = [];

  statsArr.forEach((col) => {
    if (!col) return;
    if (col.missing && col.missing > 0) recs.push(`${col.missing} missing in column "${col.name}" — consider imputation or dropping rows.`);
    if (col.duplicates && col.duplicates > 0) recs.push(`${col.duplicates} duplicate values found in "${col.name}" — consider deduplication.`);
    if (col.outliers && col.outliers > 0) recs.push(`${col.outliers} outliers detected in "${col.name}" — inspect and correct.`);
    if (col.type === 'string') recs.push(`String column "${col.name}" is editable — consider normalization (trim/case).`);
  });

  // If none
  if (recs.length === 0) recs.push('No immediate issues detected — dataset looks clean.');
  return recs;
}

 function DateTimeline({ data }) {
  const formatted = data.map(d => ({
    x: new Date(d).toISOString().split("T")[0],
    y: 1
  }));

  return (
    <ResponsiveContainer width="320%" height={100}>
      <LineChart data={formatted}>
        <XAxis dataKey="x" />
        <YAxis hide />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#10b981" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ======================================================
   React Component — Full UI Upgrade
   ====================================================== */

export default function DataPreviewPage({
  fileName = 'uploaded.csv',
  rowCount = 0,
  columnCount = 0,
  onContinue = () => {},
  columnStats = [], // expected array of { name, type, unique, duplicates, missing, outliers }
  data = [],
}) {
  // Progress (animated to final computed score)
  const [progress, setProgress] = useState(0);

  // Panel state: editing unique strings for a column
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorColumn, setEditorColumn] = useState(null);
  const [stringStore, setStringStore] = useState({}); // { colName: {value: Set([...])} }
  

  // Memoize heavy computations
  const computed = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const columns = (rows[0] && Object.keys(rows[0])) || Array(columnCount).fill().map((_,i)=>`col${i+1}`);

    // Build normalized column stats (if caller provided array, use that; else profile from data)
    const stats = {};
    

    columns.forEach((col) => {
      const values = rows.map((r) => (r ? r[col] : undefined));
      const type = detectColumnType(values);

      // missing count
      const missing = values.filter((v) => v === null || v === undefined || v === '').length;

      

      // duplicates: find values repeated (ignoring null/empty)
      const duplicatesSet = findDuplicateValues(values.filter((v) => v !== null && v !== undefined && String(v).trim() !== ''));
      let duplicatesCount = 0;
      if (duplicatesSet.size > 0) {
        values.forEach((v) => {
          const k = v === null || v === undefined ? '__NULL__' : String(v).trim();
          if (k !== '__NULL__' && duplicatesSet.has(k)) duplicatesCount += 1;
        });
      }

      // outliers
      const outlierIndices = detectOutliersArray(values, type, col);
      const outliersCount = outlierIndices.length;

      // unique count (non-null)
      const unique = new Set(values.filter((v) => v !== null && v !== undefined)).size;

      stats[col] = {
        name: col,
        type,
        unique,
        duplicates: duplicatesCount,
        missing,
        outliers: outliersCount,
        outlierIndices,
      };
    });



    // Generate per-cell flags: for each row index and column => object { missing, duplicate, outlier }
    const cellFlags = rows.map((_r, rowIndex) => {
      const flagsRow = {};
      columns.forEach((col) => {
        const value = rows[rowIndex][col];
        const isMissing = (value === null || value === undefined || value === '');
        const isDuplicate = (() => {
          if (isMissing) return false;
          const key = String(value).trim();
          const duplicatesSet = findDuplicateValues(rows.map(r => (r && r[col]) !== undefined && r[col] !== null ? String(r[col]).trim() : null));
          return duplicatesSet.has(key);
        })();
        const isOutlier = stats[col].outlierIndices.includes(rowIndex);
        flagsRow[col] = { missing: isMissing, duplicate: isDuplicate, outlier: isOutlier };
      });
      return flagsRow;
    });

    // Build stringStore: unique strings per string column
    const store = {};
    columns.forEach((col) => {
      if (stats[col].type === 'string') {
        const uniqueVals = Array.from(new Set(rows.map(r => (r && r[col]) != null ? String(r[col]) : '').filter(v => v !== '')));
        store[col] = uniqueVals;
      }
    });

    // Context analysis per column (validity proportion)
    const context = {};
    columns.forEach((col) => {
      const values = rows.map(r => (r && r[col]) != null ? String(r[col]) : '');
      const ctx = columnContextCheck(values, col);
      context[col] = ctx; // { valid, total, label }
    });

    // Compute base partial score (missing/duplicates/outliers)
    const partialData = computeQualityScoreFromColumnStats(Object.values(stats), rows.length, columns.length);
    // compute context score 0-10
    const perColPercentages = Object.values(context).map(c => (c.total === 0 ? 1 : (c.valid / c.total)));
    const contextAvg = perColPercentages.length === 0 ? 1 : perColPercentages.reduce((a,b)=>a+b,0)/perColPercentages.length;
    const contextScore = Math.round(contextAvg * 10); // 0 to 10

    const finalScore = Math.max(0, Math.min(100, partialData.partial + contextScore));

    // Recommendations
    const recommendations = generateRecommendationsFromStats(Object.values(stats));
       // ✅ Compute Normalization count inside useMemo
    const normalizationCount = Object.values(stats).reduce((sum, col) => {
      return sum + (col.missing || 0) + (col.duplicates || 0) + (col.outliers || 0);
    }, 0);

    const normalizationPercent = Math.round((normalizationCount / partialData.totalCells) * 100);
    // Build human-readable chart data for Recommendations Bar Chart
const recommendationsChartData = [
  {
    name: "Missing Values",
    count: partialData.totals.missing,
    percent: Math.round((partialData.totals.missing / partialData.totalCells) * 100)
  },
  {
    name: "Duplicate Values",
    count: partialData.totals.duplicates,
    percent: Math.round((partialData.totals.duplicates / partialData.totalCells) * 100)
  },
  {
    name: "Outliers",
    count: partialData.totals.outliers,
    percent: Math.round((partialData.totals.outliers / partialData.totalCells) * 100)
  },
  {
    name: "Normalization Needed",
    count: normalizationCount,
    percent: normalizationPercent,
  },
];


       // Collect date columns + normalized dates
      const dateColumns = {};
      columns.forEach((col) => {
        if (stats[col].type === "date") {
          const originalValues = rows.map(r => r[col]);
          const parsed = originalValues
            .map(v => detectDateFormat(v))
            .filter(x => x && x.date instanceof Date && !isNaN(x.date));

          dateColumns[col] = parsed.map(p => p.date);
        }

      });

      

    return {
      rows,
      columns,
      stats,
      cellFlags,
      store,
      context,
      totals: partialData.totals,
      totalCells: partialData.totalCells,
      finalScore,
      recommendations,
      recommendationsChartData, // ✅ NEW
      dateColumns,   // ✅ NEW
    };
  }, [data, columnCount]);

  // Ensure stringStore is seeded
  useEffect(() => {
    setStringStore((prev) => {
      // merge new columns generated
      const merged = { ...(prev || {}) };
      Object.entries(computed.store || {}).forEach(([col, arr]) => {
        if (!merged[col]) merged[col] = Array.from(arr);
      });
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed.store]);

  // Animate progress up to computed.finalScore
  useEffect(() => {
    const target = computed.finalScore || 0;
    setProgress((p) => Math.min(p, target)); // avoid jumping up-down
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) { clearInterval(id); return target; }
        return Math.min(target, prev + Math.max(1, Math.ceil((target - prev) / 10)));
      });
    }, 40);
    return () => clearInterval(id);
  }, [computed.finalScore]);

  // Open editor for a string column
  function openEditorForColumn(col) {
    setEditorColumn(col);
    setEditorOpen(true);
  }

  // Save edited strings locally (updates stringStore only)
  function saveStringEdits(col, newList) {
    setStringStore((s) => ({ ...s, [col]: Array.from(newList) }));
    setEditorOpen(false);
  }

  // Simple inline edit handler (not persisted to data rows)
  function handleInlineEdit(col, oldValue, newValue) {
    // Update local stringStore: replace oldValue -> newValue for that column
    setStringStore((s) => {
      const arr = Array.from(s[col] || []);
      const idx = arr.indexOf(oldValue);
      if (idx >= 0) arr[idx] = newValue;
      else arr.push(newValue);
      return { ...s, [col]: Array.from(new Set(arr)) };
    });
  }

  // UI helpers
  const totalMissing = sumObject(computed.stats || {}, 'missing');
  const totalOutliers = sumObject(computed.stats || {}, 'outliers');


  const colorForRec = (text) => {
        const lower = text.toLowerCase();

        if (lower.includes("missing in column")) return "red";
        if (lower.includes("duplicate values")) return "blue";
        if (lower.includes("outliers detected")) return "goldenrod";
        if (lower.includes("normalization") || lower.includes("editable")) return "green";

        return "#888"; // fallback gray
      };

      const chartData = computed.recommendations.map((r, i) => ({
        name: `Rec ${i + 1}`,
        value: r.length,
        color: colorForRec(r),
      }));

  return (
    <div className="data-preview-page upgraded">
      <div className="data-preview-header">
        <div>
          <h1 className="data-preview-title">Data Preview & Quick Analysis</h1>
          <p className="muted">File: <strong>{fileName}</strong> — {computed.rows.length} rows × {computed.columns.length} columns</p>
        </div>

        <div className="score-card">
          <div className="score-top">
            <div className="score-circle">{computed.finalScore}</div>
            <div className="score-meta">
              <div className="score-label">Quality Score</div>
              <div className="score-breakdown">
                <span>Missing: {computed.totals.missing}</span>
                <span>Duplicates: {computed.totals.duplicates}</span>
                <span>Outliers: {computed.totals.outliers}</span>
              </div>
            </div>
          </div>

          <div className="progress-horizontal">
            <div className="progress-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}>{progress}%</div>
            </div>
            <div className="context-meter">Context: {Math.round((Object.values(computed.context).reduce((a,c)=>a + (c.total===0?1:(c.valid/c.total)),0) / Math.max(1, Object.keys(computed.context).length)) * 100)}%</div>
          </div>
        </div>
      </div>

      

          <div className="table-wrapper upgraded">
            <div className="main-grid">

        {/* Left: Data table */}
        <div className="panel table-panel">
          <div className="panel-header">
            <h2>Preview (first 100 rows)</h2>
            
            <div className="panel-actions">
              <button className="btn small" onClick={() => setProgress(computed.finalScore)}>Sync Score</button>
              <button className="btn primary" onClick={onContinue}>Continue to Full Analysis <ChevronRight className="icon" /></button>
            </div>
            
          </div>
            <table className="data-table upgraded">
              <thead>
                <tr>
                  {computed.columns.map((h) => (
                    <th key={h}>
                      <div className="th-top">
                        <span>{h}</span>
                        {computed.stats[h]?.type === 'string' && (
                          <button className="icon-btn" title="Edit unique strings" onClick={() => openEditorForColumn(h)}>
                            <Edit3 />
                          </button>
                        )}
                      </div>

                      <div className="th-meta">
                        <small>{computed.stats[h]?.unique} unique</small>
                        <small className="muted">{computed.stats[h]?.missing} miss</small>

                        {computed.stats[h]?.type === "date" &&
                          computed.dateColumns[h]?.length > 0 && (() => {
                            const dates = computed.dateColumns[h].sort((a, b) => a - b);
                            const minDate = dates[0].toISOString().split("T")[0];
                            const maxDate = dates[dates.length - 1].toISOString().split("T")[0];
                            return <small className="date-range">📅 {minDate} → {maxDate}</small>;
                          })()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {computed.rows.slice(0, 100).map((row, ri) => (
                  <tr key={ri}>
                    {computed.columns.map((col) => {
                      const v = row[col];
                      const flags = computed.cellFlags[ri][col] || {};

                      return (
                        <td key={col} className={
                          flags.missing ? 'cell-missing' :
                          flags.outlier ? 'cell-outlier' :
                          flags.duplicate ? 'cell-duplicate' : ''
                        }>
                          <div className="cell-contents">
                            <span className="cell-value">{v ?? '—'}</span>
                            <div className="cell-icons">
                              {flags.duplicate && <span title="Duplicate" className="flag dup"><Repeat /></span>}
                              {flags.outlier && <span title="Outlier" className="flag out"><AlertTriangle /></span>}
                              {flags.missing && <span title="Missing" className="flag miss">M</span>}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr>
                  <td colSpan={computed.columns.length} className="table-footer muted">
                    Showing first {Math.min(100, computed.rows.length)} rows — full analysis available on next screen
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        {/* Right: Insights */}
        <aside className="insights-panel">
          <div className="panel-header">
            <h2>AI Insights</h2>
          </div>

         <div className="insights-block">
            <h3>Recommendations</h3>

            <ul>
              <li><span style={{ color: "red", marginRight: "6px" }}>🟥</span><strong>Missing values</strong></li>
              <li><span style={{ color: "blue", marginRight: "6px" }}>🟦</span><strong>Duplicate values</strong></li>
              <li><span style={{ color: "goldenrod", marginRight: "6px" }}>🟨</span><strong>Outliers</strong></li>
              <li><span style={{ color: "green", marginRight: "6px" }}>🟩</span><strong>Normalization</strong></li>
            </ul>
        
              <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <ul className="muted-list improved-rec-list">
              {computed.recommendations.map((rec, i) => {
                let colorClass = "";

                if (rec.includes("missing in column")) colorClass = "rec-red";
                else if (rec.includes("duplicate values")) colorClass = "rec-blue";
                else if (rec.includes("outliers detected")) colorClass = "rec-yellow";
                else if (rec.includes("normalization") || rec.includes("editable")) 
                  colorClass = "rec-green";

                return (
                  <li key={i} className={`rec-line-item ${colorClass}`}>
                    <span className="rec-bullet"></span>
                    <span>{rec}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="insights-block">
            <h3>Context Summary</h3>

            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <div className='displaylabels'>
                <Pie
                  data={Object.entries(computed.context).map(([col, info]) => ({
                    name: col,
                    value: info.total === 0 ? 100 : Math.round((info.valid / info.total) * 100),
                  }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {Object.entries(computed.context).map(([col], idx) => (
                    <Cell key={idx} fill={`hsl(${idx * 50}, 70%, 55%)`}>  </Cell>
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
                </div>
              </PieChart>
            </ResponsiveContainer>

             
          </div>

          <div className="insights-block">
            <h3>Totals</h3>

            <ResponsiveContainer width="100%" height={420}>
             <BarChart data={computed.recommendationsChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name, props) => {
                    const chartItem = computed.recommendationsChartData?.[props?.index] || {};
                    const percent = chartItem.percent ?? 0;
                    return [`${value} (${percent}%)`, name];
                  }}
                />
                <Bar dataKey="count">
                  {computed.recommendationsChartData.map((entry, index) => {
                    let color = "#888"; // fallback
                    if (entry.name.includes("Missing")) color = "red";
                    else if (entry.name.includes("Duplicate")) color = "blue";
                    else if (entry.name.includes("Outlier")) color = "goldenrod";
                    else if (entry.name.includes("Normalization")) color = "green";

                    return <Cell key={index} fill={color} />;
                  })}
                </Bar>
              </BarChart>

            </ResponsiveContainer>
          </div>

          <div className="insights-block actions">
            <button className="btn" onClick={() => { navigator.clipboard?.writeText(JSON.stringify({ stats: computed.stats, recommendations: computed.recommendations }, null, 2)); }}>Copy Report</button>
            <button className="btn" onClick={() => { alert('Export stub — integrate server export logic.'); }}>Export CSV</button>
          </div>
        </aside>
      </div>

      {/* Editor Drawer (simple) */}
      {editorOpen && editorColumn && (
        <div className="drawer">
          <div className="drawer-panel">
            <div className="drawer-header">
              <h3>Edit unique strings — {editorColumn}</h3>
              <div>
                <button className="btn small" onClick={() => setEditorOpen(false)}>Close</button>
              </div>
            </div>

            <div className="drawer-body">
              <p className="muted">Edit unique values for this column. Changes are saved locally to the string store.</p>
              <StringEditor
                initialValues={stringStore[editorColumn] || []}
                onSave={(newList) => saveStringEdits(editorColumn, newList)}
              />
            </div>
          </div>
        </div>
      )}

      
    </div>

    
  );
}

/* ======================================================
   Small StringEditor component (in-file)
   ====================================================== */

function StringEditor({ initialValues = [], onSave }) {
  const [items, setItems] = useState(Array.from(new Set(initialValues)));

  function addItem() {
    setItems((s) => [...s, '']);
  }
  function updateItem(i, v) {
    setItems((s) => { const copy = [...s]; copy[i] = v; return copy; });
  }
  function removeItem(i) {
    setItems((s) => s.filter((_, idx) => idx !== i));
  }
  return (
    <div className="string-editor">
      <div className="editor-list">
        {items.map((it, i) => (
          <div className="editor-row" key={i}>
            <input value={it} onChange={(e) => updateItem(i, e.target.value)} />
            <div className="editor-row-actions">
              <button className="btn small" onClick={() => removeItem(i)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="editor-actions">
        <button className="btn" onClick={addItem}>Add value</button>
        <button className="btn primary" onClick={() => onSave(items)}>Save</button>
      </div>
    </div>
  );
}
