'use client';

import * as XLSX from "xlsx";

export const parseFile = async (file) => {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "csv") {
    const text = await file.text();
    const workbook = XLSX.read(text, { type: "string" });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }

  if (ext === "xlsx") {
    const buf = await file.arrayBuffer();
    const workbook = XLSX.read(buf);
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }

  if (ext === "json") {
    return JSON.parse(await file.text());
  }

  return [];
};
