// BarChartComponent.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar   dataKey="totalProjects" fill="#3182CE" />
        <Bar dataKey="completedProjects" fill="#A6C697" />
        <Bar dataKey="pendingProjects" fill="#A09CBC" />
        <Bar dataKey="inprogressProjects" fill="#9CBEC9" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
