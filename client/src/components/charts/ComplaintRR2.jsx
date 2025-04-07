import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import moment from 'moment';

const ComplaintRR2 = ({ complaintsData }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Preprocess the data
    const labels = [];
    const startTimes = [];
    const endTimes = [];

    complaintsData.forEach(complaint => {
      labels.push(complaint._id);  // Using _id as the label
      startTimes.push(moment(complaint.startTime, "DD/MM/YYYY, HH:mm:ss").valueOf());  // Convert to Unix timestamp

      // If endTime exists, parse it; else, mark as 'Not Resolved Yet'
      if (complaint.endTime) {
        endTimes.push(moment(complaint.endTime, "DD/MM/YYYY, HH:mm:ss").valueOf());
      } else {
        endTimes.push(null);  // No end time means still open
      }
    });

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Registration Time (startTime)',
          data: startTimes,
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.2)',
          fill: false,
        },
        {
          label: 'Resolution Time (endTime)',
          data: endTimes,
          borderColor: 'green',
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          fill: false,
        }
      ],
    });
  }, [complaintsData]);

  return (
    <div>
      <p className='chartD2'>Complaint Registration and Resolution Times</p>
      {chartData && (
        <Line
          data={chartData}
          options={{
            scales: {
              x: {
                type: 'category',
                title: {
                  display: true,
                  text: 'Complaint ID',
                },
              },
              y: {
                type: 'linear',
                title: {
                  display: true,
                  text: 'Timestamp',
                },
                ticks: {
                  callback: function(value) {
                    return moment(value).format('DD/MM/YYYY, HH:mm:ss');
                  },
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    if (tooltipItem.raw === null) {
                      return 'Not Resolved Yet';
                    }
                    return moment(tooltipItem.raw).format('DD/MM/YYYY, HH:mm:ss');
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

export default ComplaintRR2;
