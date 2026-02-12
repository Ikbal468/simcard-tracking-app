import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../services/api.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('simChart') simChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('customerChart') customerChartRef!: ElementRef<HTMLCanvasElement>;

  loading = true;
  data: any = null;
  simTypes: Array<any> = [];
  topCustomers: Array<any> = [];

  selectedPeriod = '7';

  lineChart: Chart | null = null;
  simChart: Chart | null = null;
  customerChart: Chart | null = null;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadDashboard();
  }

  // reload dashboard when view becomes active (e.g. after navigating back)
  ionViewWillEnter() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.http.get(`${API_BASE}/dashboard`).subscribe({
      next: (res: any) => {
        this.data = res;
        // prepare sim types with colors
        const palette = ['#2563eb', '#14b8a6', '#f59e0b', '#94a3b8', '#6366f1'];
        this.simTypes = (res.byType || []).map((t: any, i: number) => ({
          name: t.name,
          count: t.count,
          color: palette[i % palette.length],
        }));
        this.topCustomers = (res.byCustomer || [])
          .slice(0, 6)
          .map((c: any, i: number) => ({ name: c.name, count: c.count }));

        // allow template to render canvases by disabling loading first,
        // then initialize charts on next macrotask so ViewChild elements exist
        this.loading = false;
        setTimeout(() => {
          this.initializeLineChart();
          this.initializeSimChart();
          this.initializeCustomerChart();
        }, 50);
      },
      error: (err) => {
        console.error('Failed to load dashboard', err);
        this.loading = false;
      },
    });
  }

  onPeriodChange() {
    // For now the API returns full history; we filter labels by selectedPeriod
    if (this.lineChart) {
      this.updateLineChart();
    }
  }

  getTransactionArrays() {
    const history = this.data?.transactionHistory || [];
    // use last N days as per selectedPeriod
    const period = parseInt(this.selectedPeriod, 10) || history.length;
    const slice = history.slice(-period);
    const labels = slice.map((s: any) => s.date);
    const stockIn = slice.map((s: any) => s.stockIn);
    const stockOut = slice.map((s: any) => s.stockOut);
    return { labels, stockIn, stockOut };
  }

  initializeLineChart() {
    const ctx = this.lineChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    const { labels, stockIn, stockOut } = this.getTransactionArrays();

    const g1 = ctx.createLinearGradient(0, 0, 0, 300);
    g1.addColorStop(0, 'rgba(37,99,235,0.2)');
    g1.addColorStop(1, 'rgba(37,99,235,0)');
    const g2 = ctx.createLinearGradient(0, 0, 0, 300);
    g2.addColorStop(0, 'rgba(245,158,11,0.2)');
    g2.addColorStop(1, 'rgba(245,158,11,0)');

    const config: any = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Stock In',
            data: stockIn,
            borderColor: '#2563eb',
            backgroundColor: g1,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
          },
          {
            label: 'Stock Out',
            data: stockOut,
            borderColor: '#f59e0b',
            backgroundColor: g2,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.9)',
            callbacks: {
              label: (context: any) => {
                const parsed = context.parsed;
                const value =
                  parsed && typeof parsed === 'object' ? parsed.y : parsed;
                return `${context.dataset?.label || ''}: ${value}`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.08)' } },
          x: { grid: { display: false } },
        },
        interaction: { mode: 'index', intersect: false },
      },
    };

    if (this.lineChart) this.lineChart.destroy();
    this.lineChart = new Chart(ctx, config as any);
  }

  updateLineChart() {
    if (!this.lineChart) return this.initializeLineChart();
    const { labels, stockIn, stockOut } = this.getTransactionArrays();
    this.lineChart.data.labels = labels;
    if (
      this.lineChart.data.datasets &&
      this.lineChart.data.datasets.length >= 2
    ) {
      this.lineChart.data.datasets[0].data = stockIn;
      this.lineChart.data.datasets[1].data = stockOut;
    }
    this.lineChart.update();
  }

  initializeSimChart() {
    const ctx = this.simChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    const labels = (this.simTypes || []).map((s) => s.name);
    const dataArr = (this.simTypes || []).map((s) => s.count);
    const colors = (this.simTypes || []).map((s) => s.color);

    const config: any = {
      type: 'doughnut',
      data: { labels, datasets: [{ data: dataArr, backgroundColor: colors }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => `${context.label}: ${context.parsed}`,
            },
          },
        },
      },
    };

    if (this.simChart) this.simChart.destroy();
    this.simChart = new Chart(ctx, config as any);
  }

  initializeCustomerChart() {
    const ctx = this.customerChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    const labels = (this.data?.byCustomer || []).map((c: any) => c.name);
    const dataArr = (this.data?.byCustomer || []).map((c: any) => c.count);

    const config: any = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: dataArr,
            backgroundColor: labels.map(
              (l: any, i: number) =>
                ['#2563eb', '#60a5fa', '#14b8a6', '#6366f1', '#94a3b8'][i % 5],
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
      },
    };

    if (this.customerChart) this.customerChart.destroy();
    this.customerChart = new Chart(ctx, config as any);
  }

  ngOnDestroy() {
    if (this.lineChart) this.lineChart.destroy();
    if (this.simChart) this.simChart.destroy();
    if (this.customerChart) this.customerChart.destroy();
  }
}
