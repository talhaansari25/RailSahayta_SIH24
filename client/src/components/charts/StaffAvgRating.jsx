import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';  // Import Pie chart
import Chart from 'chart.js/auto';

const StaffAvgRating = ({ staffData }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Extract staff ratings
    const ratings = staffData.map(staff => staff.avgRating);

    // Calculate the distribution of ratings
    const ratingCounts = { '3.5 - 4.0': 0, '4.1 - 4.5': 0, '4.6 - 5.0': 0 };

    ratings.forEach(rating => {
      if (rating >= 3.5 && rating <= 4.0) {
        ratingCounts['3.5 - 4.0'] += 1;
      } else if (rating >= 4.1 && rating <= 4.5) {
        ratingCounts['4.1 - 4.5'] += 1;
      } else if (rating >= 4.6 && rating <= 5.0) {
        ratingCounts['4.6 - 5.0'] += 1;
      }
    });

    // Prepare data for Pie chart
    const chartData = {
      labels: Object.keys(ratingCounts),
      datasets: [{
        data: Object.values(ratingCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Colors for each segment
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      }],
    };

    setChartData(chartData);
  }, [staffData]);

  return (
    <div className='ratingBhai'>
      <p className='chartD2'>Average Rating of Staff</p>
      {chartData && (
        <Pie
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    return `${tooltipItem.label}: ${tooltipItem.raw} staff members`;
                  },
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default StaffAvgRating;
