/**
 * Simple frontend "AI" for dataset insights
 * Returns an object with summary statistics and recommendations
 */
export function generateAiInsights(data) {
  if (!data || !data.length) {
    return {
      summary: "No data available to analyze.",
      recommendations: [],
    };
  }

  const columns = Object.keys(data[0]);
  const totalCells = data.length * columns.length;

  let missing = 0;
  let duplicates = 0;
  let outliers = 0;
  let columnSummaries = [];

  columns.forEach((col) => {
    const values = data.map((r) => r[col]);
    const colMissing = values.filter((v) => v === null || v === undefined || v === "").length;
    missing += colMissing;

    // Simple duplicate detection (ignoring null/empty)
    const seen = new Set();
    let colDuplicates = 0;
    values.forEach((v) => {
      if (v !== null && v !== undefined && v !== "") {
        if (seen.has(v)) colDuplicates += 1;
        else seen.add(v);
      }
    });
    duplicates += colDuplicates;

    // Simple outlier detection for numbers (1.5*IQR rule)
    const numericValues = values.filter((v) => typeof v === "number");
    let colOutliers = 0;
    if (numericValues.length >= 4) {
      const sorted = numericValues.sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length / 4)];
      const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
      const iqr = q3 - q1;
      colOutliers = numericValues.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr).length;
    }
    outliers += colOutliers;

    columnSummaries.push({
      column: col,
      missing: colMissing,
      duplicates: colDuplicates,
      outliers: colOutliers,
    });
  });

  // Build summary text
  const summary = `Your dataset has ${data.length} rows and ${columns.length} columns, totaling ${totalCells} cells.
Missing values: ${missing} (${Math.round((missing / totalCells) * 100)}%).
Duplicates: ${duplicates} (${Math.round((duplicates / totalCells) * 100)}%).
Outliers: ${outliers} (${Math.round((outliers / totalCells) * 100)}%).
The AI recommends normalizing columns with high missing values, removing duplicates, and handling outliers.`;

  // Recommendations (can be used in cards)
  const recommendations = columnSummaries.map((c) => {
    const recs = [];
    if (c.missing > 0) recs.push(`Fill or remove ${c.missing} missing values`);
    if (c.duplicates > 0) recs.push(`Check ${c.duplicates} duplicate entries`);
    if (c.outliers > 0) recs.push(`Handle ${c.outliers} outliers`);
    return {
      column: c.column,
      recommendations: recs,
    };
  });

  return { summary, recommendations };
}
