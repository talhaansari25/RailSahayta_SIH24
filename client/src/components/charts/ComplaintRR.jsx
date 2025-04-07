import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';  // Import Bar instead of Line
import Chart from 'chart.js/auto';
import moment from 'moment';

const ComplaintRR = ({ complaintsData }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Preprocess the data
    const labels = [];
    const resolutionTimes = [];

    complaintsData.forEach(complaint => {
      labels.push(complaint._id);  // Using _id as the label

      // Parse startTime
      const startTime = moment(complaint.startTime, "DD/MM/YYYY, HH:mm:ss");
      
      // If endTime exists, calculate time taken to resolve; else, mark as 'Not Resolved Yet'
      if (complaint.endTime) {
        const endTime = moment(complaint.endTime, "DD/MM/YYYY, HH:mm:ss");
        const duration = moment.duration(endTime.diff(startTime));  // Calculate time difference
        const durationInHours = duration.hours() + duration.days() * 24 + duration.minutes() / 60;  // Convert duration to hours
        resolutionTimes.push(durationInHours);  // Store time taken to resolve
      } else {
        resolutionTimes.push(null);  // No end time means still open
      }
    });

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Time Taken to Resolve (in hours)',
          data: resolutionTimes,
          backgroundColor: 'rgba(0, 255, 0, 0.6)',  // Bar color for Resolution Time
          borderColor: 'green',
          borderWidth: 1,
        }
      ],
    });
  }, [complaintsData]);

  return (
    <div>
      <p className='chartD21'>Time Taken to Resolve Complaints</p>
      {chartData && (
        <Bar
          data={chartData}
          options={{
            responsive: true,
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
                  text: 'Time Taken (in hours)',
                },
                ticks: {
                  callback: function(value) {
                    if (value === null) {
                      return 'Not Resolved Yet';  // Display this message if no resolution time
                    }
                    return `${value.toFixed(2)} hours`;  // Show time in hours with 2 decimal points
                  },
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    if (tooltipItem.raw === null) {
                      return 'Not Resolved Yet';  // Show custom message if no resolution time
                    }
                    return `${tooltipItem.raw.toFixed(2)} hours`;  // Show time in tooltip in hours
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

export default ComplaintRR;
