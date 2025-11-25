
'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AiInsightChart({ data }) {
  if (!data || data.length === 0) return <p>No AI insights yet.</p>;

  return (
    <div style={{ width: '100%', height: 300, marginTop: '15px' }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value, name) => [`${value}`, name]} />
          <Line type="monotone" dataKey="value" stroke="#4a6cf7" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
