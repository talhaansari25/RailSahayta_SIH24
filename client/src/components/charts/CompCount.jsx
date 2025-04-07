import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const CompCount = ({ staffData }) => {
  if (!staffData || staffData.length === 0) return <p>No staff data available.</p>;

  // Aggregate data for the chart
  const totalAssigned = staffData.reduce(
    (acc, staff) => acc + staff.compAssigned.length,
    0
  );
  const totalSolved = staffData.reduce(
    (acc, staff) => acc + staff.compSolved.length,
    0
  );

  const data = {
    labels: ["Assigned Complaints", "Solved Complaints"],
    datasets: [
      {

        data: [totalAssigned, totalSolved],
        backgroundColor: ["#ff6384", "#36a2eb"],
        hoverBackgroundColor: ["#ff4a6c", "#2c91dd"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw} complaints`,
        },
      },
    },
  };

  return (
    <div style={{ width: "400px", margin: "0 auto" }}>
        <p className="chartD1">Complaints Count</p>
      <Pie data={data} options={options} />
    </div>
  );
};

export default CompCount;
