'use client';
// -------------------- DATA PROFILER --------------------
export const profileData = (data) => {
  const columnStats = {};
  const columns = Object.keys(data[0] || {});

  columns.forEach(col => {
    const values = data.map(row => row[col]);
    const nonNull = values.filter(v => v != null);

    const type = detectType(nonNull);
    const uniqueCount = new Set(nonNull).size;
    const missingCount = values.length - nonNull.length;
    const outliers = detectOutliers(nonNull, type);

    columnStats[col] = {
      type,
      uniqueCount,
      missingCount,
      outliers,
      isName: type === 'string' && nonNull.some(nameFinder),
      isEmail: type === 'string' && nonNull.some(emailFinder),
      isPhone: type === 'string' && nonNull.some(phoneFinder),
      isBirthday: type === 'date' && nonNull.every(dateIsBirthday),
    };
  });

  return columnStats;
};

// Utility functions
const detectType = (values) => {
  if (values.every(v => Number.isInteger(v))) return 'integer';
  if (values.every(v => !isNaN(Date.parse(v)))) return 'date';
  return 'string';
};

const detectOutliers = (values, type) => {
  if (type !== 'integer') return [];
  return values.filter(v => v < 0 || v > 150);
};

const nameFinder = (val) => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(val);
const emailFinder = (val) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
const phoneFinder = (val) => /\+?\d[\d\s.-]{7,}\d/.test(val);
const dateIsBirthday = (val) => {
  const d = new Date(val);
  const year = d.getFullYear();
  return year > 1900 && year < new Date().getFullYear();
};
