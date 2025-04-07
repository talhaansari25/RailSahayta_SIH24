import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RecurringIssue = ({ chartData, department }) => {
  if (!chartData) return <p>Loading data...</p>;

  // Define label replacements
  const labelReplacements = {
    damage_window: "Window",
    damage_seat: "Seat",
    unhygenic_compartment: "Compartment",
    unhygenic_toilet: "Toilet",
  };

  const prepareChartData = (categoryData) => {
    // Combine plot_data and forecast
    const plotLabels = Object.keys(categoryData.plot_data);
    const plotValues = Object.values(categoryData.plot_data);

    // Generate forecast labels
    const forecastLabels = Array.from(
      { length: categoryData.forecast.length },
      (_, i) => `Forecast ${i + 1}`
    );

    // Combine labels and data
    const allLabels = [...plotLabels, ...forecastLabels];
    const allValues = [...plotValues, ...categoryData.forecast];

    return { labels: allLabels, data: allValues, plotLength: plotLabels.length };
  };

  // Build datasets dynamically for each category
  const datasets = Object.keys(chartData).map((category, index) => {
    const { data: categoryData, plotLength } = prepareChartData(
      chartData[category]
    );

    // Replace category name in the label if a replacement exists
    const displayCategory = labelReplacements[category] || category;

    return {
      label: `${displayCategory} (Historical & Forecast)`,
      data: categoryData,
      fill: false,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
      tension: 0.2,
      pointStyle: (ctx) =>
        ctx.dataIndex < plotLength ? "circle" : "triangle", // Different points for forecast
    };
  });

  // Assuming labels are consistent across categories, using the first one
  const firstCategory = Object.keys(chartData)[0];
  const chartLabels = [
    ...Object.keys(chartData[firstCategory].plot_data),
    ...Array.from(
      { length: chartData[firstCategory].forecast.length },
      (_, i) => `Forecast ${i + 1}`
    ),
  ];

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <p className="chartD3">Recurring Issue Prediction</p>
      <Line
        data={{
          labels: chartLabels,
          datasets: datasets,
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) =>
                  `${tooltipItem.raw.toFixed(2)} cases`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Time",
              },
            },
            y: {
              title: {
                display: true,
                text: "Number of Complaints",
              },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default RecurringIssue;
