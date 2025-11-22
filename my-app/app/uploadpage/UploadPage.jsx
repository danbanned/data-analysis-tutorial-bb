'use client';

import React from 'react';
import { Upload, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import './uploadpage.css';

// SCREEN 1: Upload Page Component
const UploadPage = ({ onFileUpload }) => {
  
  const recentAnalyses = [
    { id: 1, name: 'sales_data.csv', score: 85, quality: 'Good', date: '2 hours ago' },
    { id: 2, name: 'users.json', score: 72, quality: 'Good', date: '1 day ago' }
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileUpload) onFileUpload(files[0]);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0 && onFileUpload) onFileUpload(files[0]);
  };

  return (
    <div className="app-container bg-gradient-emerald">
      <div className="max-w-4xl">
        <div className="header-card">
          <div className="flex items-center gap-3">
            <BarChart3 className="icon-small text-emerald-600" />
            <h1 className="text-xl font-semibold text-gray-800">Data Quality Analysis</h1>
          </div>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/AnalysisResultsDashboard">About</Link>
            <Link href="/DataPreview">Docs</Link>
            <Link href="/DetailedInsightsPage">a</Link>
          </div>
        </div>

        <div className="section-card text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upload Your Dataset</h2>
          <p className="text-gray-600">Instant AI-Powered Quality Analysis</p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="upload-card"
        >
          <div className="text-center">
            <Upload className="icon-large text-emerald-500 mb-4" />
            <p className="text-xl text-emerald-600 mb-2 font-medium">Drag & Drop File Here</p>
            <p className="text-gray-500 mb-4">or</p>
            <label className="button-primary">
              Choose File
              <input type="file" onChange={handleFileInput} accept=".csv,.json,.xlsx" className="hidden" />
            </label>
            <p className="text-sm text-gray-400 mt-4">Supports: CSV, JSON, XLSX (≤50MB)</p>
          </div>
        </div>

        <div className="section-card bg-amber-50 border-amber-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Analyses:</h3>
          <div className="list-space">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center gap-3">
                <FileText className="icon-small text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{analysis.name} - Score: {analysis.score} ({analysis.quality})</div>
                  <div className="text-sm text-gray-500">Analyzed: {analysis.date}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-top mt-4 pt-4">
            <p className="text-sm text-gray-600 font-medium">Quick Tips:</p>
            <p className="text-sm text-gray-500">• Ensure column headers are in first row</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
