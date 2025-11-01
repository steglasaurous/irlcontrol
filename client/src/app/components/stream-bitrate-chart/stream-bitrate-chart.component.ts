import { Component, Input, OnInit } from '@angular/core';
import { StreamStatus } from '../../utils/stream-status.interface';

@Component({
  selector: 'app-stream-bitrate-chart',
  templateUrl: './stream-bitrate-chart.component.html',
})
export class StreamBitrateChartComponent implements OnInit {
  chart: any;

  bitrateData: any[] = [];
  rttData: any[] = [];

  chartOptions = {
    backgroundColor: 'black',
    axisX: {
      gridThickness: 0,
      tickLength: 0,
      lineThickness: 0,
      labelFormatter: function () {
        return ' ';
      },
      margin: -10,
    },
    axisY: {
      gridThickness: 0,
      tickLength: 0,
      lineThickness: 0,
      labelFormatter: function () {
        return ' ';
      },
      margin: -10,
    },
    axisX2: {
      margin: -10,
    },
    axisY2: {
      margin: -10,
    },

    data: [
      {
        type: 'area',
        markerType: 'none',
        color: 'rgba(0,102,255,0.8)',
        dataPoints: this.bitrateData,
      },
      {
        type: 'area',
        markerType: 'none',
        color: 'rgba(255,0,0,0.8)',
        dataPoints: this.rttData,
      },
    ],
  };

  @Input()
  streamName: string = '';

  @Input()
  streamStatusHistory: Map<string, StreamStatus[]> = new Map<
    string,
    StreamStatus[]
  >();

  constructor() {}

  getChartInstance(chart: object) {
    this.chart = chart;
  }

  ngOnInit() {
    let x = 0;
    this.streamStatusHistory
      .get(this.streamName)
      ?.forEach((streamStatus, index) => {
        // this.lineChartData.labels?.push(index);
        this.bitrateData.push({ x: x, y: streamStatus.bitrate });
        // this.bitrateData.push({ x: x, y: Math.floor(Math.random() * 500) });
        let rtt = streamStatus.rtt;
        if (rtt && rtt < 0) {
          rtt = 0;
        }

        this.rttData.push({ x: x, y: rtt });
        // this.rttData.push({ x: x, y: Math.floor(Math.random() * 500) });
        x++;
      });
  }
}
