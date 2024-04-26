import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration, ChartOptions} from 'chart.js';
import {StreamStatus} from "../../utils/stream-status.interface";

@Component({
  selector: 'app-stream-bitrate-chart',
  templateUrl: './stream-bitrate-chart.component.html',
  styleUrls: ['./stream-bitrate-chart.component.scss']
})
export class StreamBitrateChartComponent implements OnInit {
  lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      {
        data: [ 0 ],
        label: 'bitrate',
        fill: true,
        borderColor: 'black',
        backgroundColor: 'rgba(0,102,255,0.3)',
        pointRadius: 0,
        segment: {
          borderWidth: 1
        }
      },
      {
        data: [ 0 ],
        label: 'rtt',
        fill: true,
        backgroundColor: 'rgba(0,0,255,0.3)',
        pointStyle: "line",
        pointRadius: 0,
        segment: {
          borderWidth: 1
        },
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales:
    {
      x: {
        display: false
      },
      y: {
        type: 'linear',
        beginAtZero: true,
        display: false
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  @Input()
  streamName: string = '';

  @Input()
  streamStatusHistory: Map<string, StreamStatus[]> = new Map<string, StreamStatus[]>();

  constructor() {
  }

  ngOnInit() {
    this.lineChartData.labels = [];
    this.lineChartData.datasets[0].data = [];

    this.streamStatusHistory.get(this.streamName)?.forEach((streamStatus, index) => {
      this.lineChartData.labels?.push(index);
      this.lineChartData.datasets[0].data.push(streamStatus.bitrate);
      if (streamStatus.rtt != undefined) {
        if (streamStatus.rtt == -1) {
          this.lineChartData.datasets[1].data.push(0);
        } else {
          this.lineChartData.datasets[1].data.push(streamStatus.rtt);
        }
      }
    });
  }
}
