'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Edit3, Repeat, AlertTriangle, CheckCircle } from 'lucide-react';
import './DataPreviewPage.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,} from 'recharts';

/* ============================
   Helpers (robust & defensive)
   ============================ */

function sumObject(obj, key) {
  if (!obj || typeof obj !== 'object') return 0;
  return Object.values(obj).reduce((sum, c) => sum + (c?.[key] || 0), 0);
}

function detectDateFormat(value) {
  if (value == null || value === '') return null;
  if (!isNaN(Number(value))) {
    const num = Number(value);
    if (num > 1_000_000_000 && num < 2_000_000_000) return { type: "unix-seconds", date: new Date(num * 1000) };
    if (num > 1_000_000_000_000 && num < 2_000_000_000_0000) return { type: "unix-ms", date: new Date(num) };
    if (num > 59 && num < 60000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      return { type: "excel", date: new Date(excelEpoch.getTime() + num * 86400000) };
    }
  }
  if (!isNaN(Date.parse(value))) return { type: "iso", date: new Date(value) };

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

function detectColumnType(values) {
  const arr = Array.isArray(values) ? values : [];
  const cleaned = arr.filter(v => v != null && v !== "");
  if (cleaned.length === 0) return "unknown";
  const allDates = cleaned.every(v => detectDateFormat(v));
  if (allDates) return "date";
  const allInt = cleaned.every(v => Number.isInteger(Number(v)));
  if (allInt) return "integer";
  const allNumeric = cleaned.every(v => !isNaN(Number(v)));
  if (allNumeric) return "number";
  return "string";
}

function detectOutliersArray(values, type, columnName) {
  const arr = Array.isArray(values) ? values : [];
  if (arr.length === 0) return [];
  const nums = arr.map((v) => (v === null || v === undefined || v === '') ? null : Number(v)).filter((v) => v !== null && !isNaN(v));
  if (nums.length === 0) return [];
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  const sd = Math.sqrt(variance);
  const outliers = [];
  arr.forEach((v, idx) => {
    if (v === null || v === undefined || v === '') return;
    const n = Number(v);
    if (isNaN(n)) return;
    if (Math.abs(n - mean) > 3 * sd) outliers.push(idx);
    if (columnName.toLowerCase().includes('age')) {
      if (n < 0 || n > 120) outliers.push(idx);
    }
  });
  return Array.from(new Set(outliers));
}

function findDuplicateValues(values) {
  const arr = Array.isArray(values) ? values : [];
  const counts = new Map();
  arr.forEach((v) => {
    const key = v === null || v === undefined ? '__NULL__' : String(v).trim();
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const duplicates = new Set();
  for (const [k, c] of counts.entries()) {
    if (k !== '__NULL__' && c > 1) duplicates.add(k);
  }
  return duplicates;
}

function columnContextCheck(values, columnName) {
  const arr = Array.isArray(values) ? values : [];
  const cleaned = arr.map((v) => (v === undefined || v === null) ? '' : String(v).trim());
  let valid = 0;
  let total = 0;
  if (columnName.toLowerCase().includes('email')) {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i;
    cleaned.forEach((c) => { if (c !== '') { total++; if (re.test(c)) valid++; }});
    return { valid, total, label: 'email' };
  }
  if (columnName.toLowerCase().includes('name')) {
    const re = /^[A-Za-zÀ-ÿ ,.'-]{2,}\s+[A-Za-zÀ-ÿ ,.'-]{2,}$/;
    cleaned.forEach((c) => { if (c !== '') { total++; if (re.test(c)) valid++; }});
    return { valid, total, label: 'name' };
  }
  if (columnName.toLowerCase().includes('age')) {
    cleaned.forEach((c) => { if (c !== '') { total++; const n = Number(c); if (!isNaN(n) && n >= 0 && n <= 120) valid++; }});
    return { valid, total, label: 'age' };
  }
  if (columnName.toLowerCase().includes('phone')) {
    const re = /^\+?\d[\d\s.-]{6,}\d$/;
    cleaned.forEach((c) => { if (c !== '') { total++; if (re.test(c)) valid++; }});
    return { valid, total, label: 'phone' };
  }
  cleaned.forEach((c) => { if (c !== '') { total++; valid++; }});
  return { valid, total, label: 'string' };
}

function computeQualityScoreFromColumnStats(columnStatsObj, rowCount, columnCount) {
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
  return {
    partial: Math.max(34, Math.min(90, Math.round(missingScore + duplicateScore + outlierScore))),
    totals,
    totalCells,
  };
}

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
  if (recs.length === 0) recs.push('No immediate issues detected — dataset looks clean.');
  return recs;
}

/* ======================================================
   Component
   ====================================================== */

export default function DataPreviewPage({
  fileName = 'uploaded.csv',
  rowCount = 0,
  columnCount = 0,
  onContinue = () => {},
  columnStats = [],
  data = [],
}) {
  const [progress, setProgress] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorColumn, setEditorColumn] = useState(null);
  const [stringStore, setStringStore] = useState({});

  // --- computed (stable) ---
  const computed = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const columns = (rows[0] && Object.keys(rows[0])) || Array(columnCount).fill().map((_,i)=>`col${i+1}`);

    const stats = {};

    columns.forEach((col) => {
      const values = rows.map((r) => (r && r[col] != null) ? r[col] : null);
      const type = detectColumnType(values);
      const missing = values.filter((v) => v == null || v === '').length;

      const duplicatesSet = findDuplicateValues(values.filter((v) => v != null && v !== '')) || new Set();
      let duplicatesCount = 0;
      if (duplicatesSet.size > 0) {
        values.forEach((v) => {
          const k = v == null ? '__NULL__' : String(v).trim();
          if (k !== '__NULL__' && duplicatesSet.has(k)) duplicatesCount += 1;
        });
      }

      const outlierIndices = detectOutliersArray(values, type, col) || [];
      const outliersCount = outlierIndices.length;

      const unique = new Set(values.filter((v) => v != null)).size;

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

    const cellFlags = rows.map((_r, rowIndex) => {
      const flagsRow = {};
      columns.forEach((col) => {
        const value = rows[rowIndex][col];
        const isMissing = (value == null || value === '');
        const colValues = rows.map(r => (r && r[col] != null ? String(r[col]).trim() : null));
        const duplicatesSet = findDuplicateValues(colValues) || new Set();
        const isDuplicate = (!isMissing && duplicatesSet.has(String(value).trim()));
        const isOutlier = (stats[col].outlierIndices || []).includes(rowIndex);
        flagsRow[col] = { missing: isMissing, duplicate: isDuplicate, outlier: isOutlier };
      });
      return flagsRow;
    });

    const store = {};
    columns.forEach((col) => {
      if (stats[col].type === 'string') {
        store[col] = Array.from(new Set(rows.map(r => (r && r[col] != null) ? String(r[col]) : '').filter(v => v !== '')));
      }
    });

    const context = {};
    columns.forEach((col) => {
      const values = rows.map(r => (r && r[col] != null) ? String(r[col]) : '');
      context[col] = columnContextCheck(values, col);
    });

    const partialData = computeQualityScoreFromColumnStats(Object.values(stats), rows.length, columns.length);
    const perColPercentages = Object.values(context).map(c => (c.total === 0 ? 1 : (c.valid / c.total)));
    const contextAvg = perColPercentages.length === 0 ? 1 : perColPercentages.reduce((a,b)=>a+b,0)/perColPercentages.length;
    const contextScore = Math.round(contextAvg * 10);
    const finalScore = Math.max(0, Math.min(100, partialData.partial + contextScore));

    const recommendations = generateRecommendationsFromStats(Object.values(stats));

    const normalizationCount = Object.values(stats).reduce((sum, col) => {
      return sum + (col.missing || 0) + (col.duplicates || 0) + (col.outliers || 0);
    }, 0);
    const normalizationPercent = Math.round((partialData.totalCells ? (normalizationCount / partialData.totalCells) * 100 : 0));

    const recommendationsChartData = [
      {
        name: "Missing Values",
        count: partialData.totals.missing || 0,
        percent: Math.round(((partialData.totals.missing || 0) / (partialData.totalCells || 1)) * 100)
      },
      {
        name: "Duplicate Values",
        count: partialData.totals.duplicates || 0,
        percent: Math.round(((partialData.totals.duplicates || 0) / (partialData.totalCells || 1)) * 100)
      },
      {
        name: "Outliers",
        count: partialData.totals.outliers || 0,
        percent: Math.round(((partialData.totals.outliers || 0) / (partialData.totalCells || 1)) * 100)
      },
      {
        name: "Normalization Needed",
        count: normalizationCount,
        percent: normalizationPercent,
      },
    ];

    const dateColumns = {};
    columns.forEach((col) => {
      if (stats[col].type === "date") {
        const originalValues = rows.map(r => r[col]);
        const parsed = originalValues.map(v => detectDateFormat(v)).filter(x => x && x.date instanceof Date && !isNaN(x.date));
        dateColumns[col] = parsed.map(p => p.date);
      } else {
        dateColumns[col] = [];
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
      recommendationsChartData,
      dateColumns,
    };
  }, [data, columnCount]);

  // Ensure stringStore is seeded (guarded and depends on the computed store object)
  // Ensure stringStore is seeded
useEffect(() => {
  if (!computed?.store) return;

  // Only run if there was nothing stored before
  setStringStore((prev) => {
    if (prev && Object.keys(prev).length > 0) return prev; // STOP LOOPING

    const merged = {};
    Object.entries(computed.store).forEach(([col, arr]) => {
      merged[col] = Array.from(arr);
    });
    return merged;
  });
}, [computed?.store]); // runs only once since prev stops further updates


  // Animate progress to finalScore
useEffect(() => {
  const score = computed?.finalScore;

  // Guard: no number → skip
  if (typeof score !== "number") return;

  const target = Math.max(0, score);

  // Always snap progress downward if current > target
  setProgress((prev) => Math.min(prev, target));

  let frameId;

  const animate = () => {
    setProgress((prev) => {
      if (prev >= target) {
        cancelAnimationFrame(frameId);
        return target;
      }

      const step = Math.ceil((target - prev) / 10);
      return prev + step;
    });

    frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(frameId);
}, [computed?.finalScore]);


  // Editor handlers
  function openEditorForColumn(col) {
    setEditorColumn(col);
    setEditorOpen(true);
  }
  function saveStringEdits(col, newList) {
    setStringStore((s) => ({ ...s, [col]: Array.from(newList) }));
    setEditorOpen(false);
  }
  function handleInlineEdit(col, oldValue, newValue) {
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
    const lower = String(text || '').toLowerCase();
    if (lower.includes("missing")) return "red";
    if (lower.includes("duplicate")) return "blue";
    if (lower.includes("outlier")) return "goldenrod";
    if (lower.includes("normalization") || lower.includes("editable")) return "green";
    return "#888";
  };

  // Memoized chartData to avoid re-creating arrays on every render (prevents render loops)
const chartData = useMemo(() => {
  const recs = Array.isArray(computed?.recommendations)
    ? computed.recommendations
    : [];

  return recs.map((r, i) => {
    const text = Array.isArray(r) ? r.join(' ') : String(r || '');
    return {
      name: `Rec ${i + 1}`,
      value: Array.isArray(r)
        ? r.length
        : (typeof r === 'string' ? r.length : 0),
      color: colorForRec(text),
    };
  });
}, [computed?.recommendations]);


  // Render
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
                <span>Missing: {computed.totals?.missing ?? 0}</span>
                <span>Duplicates: {computed.totals?.duplicates ?? 0}</span>
                <span>Outliers: {computed.totals?.outliers ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="progress-horizontal">
            <div className="progress-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}>{progress}%</div>
            </div>
            <div className="context-meter">
              Context: {Math.round((Object.values(computed.context || {}).reduce((a,c)=>a + (c.total===0?1:(c.valid/c.total)),0) / Math.max(1, Object.keys(computed.context || {}).length)) * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrapper upgraded">
        <div className="main-grid">
          {/* Left: table */}
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
                        <small>{computed.stats[h]?.unique ?? 0} unique</small>
                        <small className="muted">{computed.stats[h]?.missing ?? 0} miss</small>

                        {computed.stats[h]?.type === "date" &&
                          computed.dateColumns[h]?.length > 0 && (() => {
                            const dates = [...computed.dateColumns[h]].sort((a, b) => a - b);
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
                      const flags = computed.cellFlags[ri]?.[col] || {};
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

          {/* Right: Insights */}
          <aside className="insights-panel">
            <div className="panel-header"><h2>AI Insights</h2></div>

            <div className="insights-block">
              <h3>Recommendations</h3>
              <ul>
                <li><span style={{ color: "red", marginRight: "6px" }}>🟥</span><strong>Missing values</strong></li>
                <li><span style={{ color: "blue", marginRight: "6px" }}>🟦</span><strong>Duplicate values</strong></li>
                <li><span style={{ color: "goldenrod", marginRight: "6px" }}>🟨</span><strong>Outliers</strong></li>
                <li><span style={{ color: "green", marginRight: "6px" }}>🟩</span><strong>Normalization</strong></li>
              </ul>

             {chartData.length > 0 && (
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
            )}


              <ul className="muted-list improved-rec-list">
                {computed.recommendations.map((rec, i) => {
                  const text = String(rec || '');
                  let colorClass = "";
                  if (text.includes("missing in column")) colorClass = "rec-red";
                  else if (text.includes("duplicate")) colorClass = "rec-blue";
                  else if (text.includes("outliers")) colorClass = "rec-yellow";
                  else if (text.includes("normalization") || text.includes("editable")) colorClass = "rec-green";
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
                      data={Object.entries(computed.context || {}).map(([col, info]) => ({
                        name: col,
                        value: info.total === 0 ? 100 : Math.round((info.valid / info.total) * 100),
                      }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      label
                    >
                      {Object.entries(computed.context || {}).map(([col], idx) => (
                        <Cell key={idx} fill={`hsl(${idx * 50}, 70%, 55%)`} />
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
                <BarChart data={computed.recommendationsChartData || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => {
                      const chartItem = (computed.recommendationsChartData || [])[props?.index] || {};
                      const percent = chartItem.percent ?? 0;
                      return [`${value} (${percent}%)`, name];
                    }}
                  />
                  <Bar dataKey="count">
                    {(computed.recommendationsChartData || []).map((entry, index) => {
                      let color = "#888";
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
      </div>

      {/* Editor Drawer */}
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

/* Small StringEditor */
function StringEditor({ initialValues = [], onSave }) {
  const [items, setItems] = useState(Array.from(new Set(initialValues || [])));
  function addItem() { setItems((s) => [...s, '']); }
  function updateItem(i, v) { setItems((s) => { const copy = [...s]; copy[i] = v; return copy; }); }
  function removeItem(i) { setItems((s) => s.filter((_, idx) => idx !== i)); }
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
