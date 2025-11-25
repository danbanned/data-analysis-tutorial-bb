/**
 * Enhanced AI Insight Generator
 * - Keeps your original structure 100% untouched
 * - Adds cleanedData + detailed columnSummaries
 */
export function generateAiInsights(data) {
  if (!data || !data.length) {
    return {
      summary: "No data available to analyze.",
      recommendations: [],
      cleanedData: [],
      columnSummaries: [],
    };
  }

  const rows = data;
  const columns = Object.keys(data[0]);
  const totalCells = data.length * columns.length;

  let missing = 0;
  let duplicates = 0;
  let outliers = 0;
  let columnSummaries = [];

  // ---------------------------------
  // NEW: cleaned data structure
  // ---------------------------------
  const cleanedData = JSON.parse(JSON.stringify(data)); // deep copy

  columns.forEach((col) => {
    const values = data.map((r) => r[col]);

    // --------------------------
    // Missing values
    // --------------------------
    const colMissing = values.filter(
      (v) => v === null || v === undefined || v === ""
    ).length;
    missing += colMissing;

    // Impute missing numeric → median
    let median = null;
    if (values.some((v) => typeof v === "number")) {
      const nums = values.filter((v) => typeof v === "number").sort((a, b) => a - b);
      median = nums[Math.floor(nums.length / 2)];
    }

    cleanedData.forEach((row) => {
      if (row[col] === null || row[col] === undefined || row[col] === "") {
        row[col] = typeof median === "number" ? median : ""; // simple imputation
      }
    });

    // --------------------------
    // Duplicate detection
    // --------------------------
    const seen = new Set();
    let colDuplicates = 0;
    values.forEach((v) => {
      if (v !== null && v !== undefined && v !== "") {
        if (seen.has(v)) colDuplicates += 1;
        else seen.add(v);
      }
    });
    duplicates += colDuplicates;

    // --------------------------
    // Outlier detection (1.5*IQR)
    // --------------------------
    const numericValues = values.filter((v) => typeof v === "number");
    let colOutliers = 0;
    if (numericValues.length >= 4) {
      const sorted = numericValues.sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length / 4)];
      const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
      const iqr = q3 - q1;
      colOutliers = numericValues.filter(
        (v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr
      ).length;
    }
    outliers += colOutliers;

    // Collect column-level metadata
    columnSummaries.push({
      column: col,
      missing: colMissing,
      duplicates: colDuplicates,
      outliers: colOutliers,
      medianUsed: median,
    });
  });

  // Summary text (unchanged)
  const summary = `Your dataset has ${data.length} rows and ${columns.length} columns, totaling ${totalCells} cells.
Missing values: ${missing} (${Math.round((missing / totalCells) * 100)}%).
Duplicates: ${duplicates} (${Math.round((duplicates / totalCells) * 100)}%).
Outliers: ${outliers} (${Math.round((outliers / totalCells) * 100)}%).
The AI recommends normalizing columns with high missing values, removing duplicates, and handling outliers.`;

  // Recommendation cards (unchanged)
  const recommendations = columnSummaries.map((c) => {
    const recs = [];
    if (c.missing > 0) recs.push(`Fill or remove ${c.missing} missing values`);
    if (c.duplicates > 0) recs.push(`Check ${c.duplicates} duplicate entries`);
    if (c.outliers > 0) recs.push(`Handle ${c.outliers} outliers`);
    return { column: c.column, recommendations: recs };
  });

  // ---------------------------------
  // NEW VALUES RETURNED
  // ---------------------------------
  return {
    summary,
    recommendations,
    cleanedData,
    columnSummaries,
  };
}
