import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DutyShift = ({ morningCount, nightCount }) => {
  // Prepare the data for the pie chart
  const data = {
    labels: ["Morning", "Night"],
    datasets: [
      {
        data: [morningCount, nightCount],
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
          label: function (tooltipItem) {
            return tooltipItem.label + ": " + tooltipItem.raw + " Staff";
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "400px", margin: "0 auto" }}>
      <p className="chartD1">Staff Duty Shifts</p>
      <Pie data={data} options={options} />
    </div>
  );
};

export default DutyShift;
