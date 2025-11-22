'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import UploadPage from './uploadpage/UploadPage';
import DataPreviewPage from './DataPreview/page';
import AnalysisResultsDashboard from './AnalysisResultsDashboard/page';
import DetailedInsightsPage from './DetailedInsightsPage/page';
import { profileData } from './utils/dataprofiler';

// Compute score
function computeOverallScore(columnStats, rowCount) {
  if (!Array.isArray(columnStats) || rowCount === 0) return 0;

  const columnCount = columnStats.length;
  const totalCells = rowCount * columnCount;

  const totalMissing = columnStats.reduce((a, c) => a + (c.missing ?? 0), 0);
  const totalOutliers = columnStats.reduce((a, c) => a + (c.outliers ?? 0), 0);

  const missingPenalty = (totalMissing / totalCells) * 40;
  const outlierPenalty = (totalOutliers / totalCells) * 20;

  let score = 100 - (missingPenalty + outlierPenalty);
  return Math.max(0, Math.round(score));
}

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [data, setData] = useState([]);
  const [columnStats, setColumnStats] = useState([]);
  const [error, setError] = useState('');

  // NEW STATE ITEMS
  const [overallScore, setOverallScore] = useState(0);
  const [qualityMetrics, setQualityMetrics] = useState([]);
  const [totalMissing, setTotalMissing] = useState(0);
  const [totalOutliers, setTotalOutliers] = useState(0);
  const [totalCells, setTotalCells] = useState(0);

  const handleFileUpload = async (file) => {
    setFileName(file.name);
    setError('');

    console.log("Uploading file:", file.name);

    const ext = file.name.split('.').pop().toLowerCase();
    let parsed = [];

    try {
      if (ext === "csv") {
        const text = await file.text();
        const workbook = XLSX.read(text, { type: "string" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsed = XLSX.utils.sheet_to_json(sheet);
      } else if (ext === "xlsx") {
        const buf = await file.arrayBuffer();
        const workbook = XLSX.read(buf);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsed = XLSX.utils.sheet_to_json(sheet);
      } else if (ext === "json") {
        parsed = JSON.parse(await file.text());
      }
    } catch (err) {
      console.error("Error parsing file:", err);
      setError("Failed to parse file.");
      parsed = [];
    }

    if (!parsed || parsed.length === 0) {
      setError("Your file has no usable data.");
      return;
    }

    const allEmpty = parsed.every(row =>
      Object.values(row).every(v => v === "" || v === null || v === undefined)
    );
    if (allEmpty) {
      setError("This file contains only empty rows.");
      return;
    }

    setData(parsed);

    // PROFILE THE DATA
    const stats = profileData(parsed);
    const cols = Object.entries(stats).map(([key, val]) => ({
      name: key,
      type: val.type,
      unique: val.uniqueCount,
      missing: val.missingCount,
      outliers: val.outliers.length,
    }));
    setColumnStats(cols);

    // TOTALS
    const rowCount = parsed.length;
    const colCount = cols.length;
    const cells = rowCount * colCount;

    const missing = cols.reduce((a, c) => a + c.missing, 0);
    const outliers = cols.reduce((a, c) => a + c.outliers, 0);

    setTotalMissing(missing);
    setTotalOutliers(outliers);
    setTotalCells(cells);

    // QUALITY METRICS
    setQualityMetrics([
      {
        name: "Missing Values",
        score: Math.round(100 - (missing / cells) * 100),
        issues: `${missing} missing values found.`,
      },
      {
        name: "Outliers",
        score: Math.round(100 - (outliers / cells) * 100),
        issues: `${outliers} outliers detected.`,
      }
    ]);

    // OVERALL SCORE (must come *after* stats are set)
    setOverallScore(computeOverallScore(cols, rowCount));

    console.log("Parsed rows:", parsed.length);
    console.log("Column stats:", cols);

    setCurrentScreen('preview');
  };

  return (
    <>
      {currentScreen === 'upload' && (
        <UploadPage onFileUpload={handleFileUpload} />
      )}

      {currentScreen === 'preview' && (
        <DataPreviewPage
          fileName={fileName}
          rowCount={data.length}
          columnCount={data.length > 0 ? Object.keys(data[0]).length : 0}
          data={data}
          columnStats={columnStats}
          onContinue={() => setCurrentScreen('results')}
        />
      )}

      {currentScreen === 'results' && (
        <AnalysisResultsDashboard
          data={data}
          columnStats={columnStats}
          qualityMetrics={qualityMetrics}
          overallScore={overallScore}
          totalMissing={totalMissing}
          totalOutliers={totalOutliers}
          totalCells={totalCells}
          onViewDetails={() => setCurrentScreen('details')}
        />
      )}

      {currentScreen === 'details' && (
        <DetailedInsightsPage
          data={data}
          columnStats={columnStats}
          onReset={() => setCurrentScreen('upload')}
        />
      )}
    </>
  );
};

export default App;
