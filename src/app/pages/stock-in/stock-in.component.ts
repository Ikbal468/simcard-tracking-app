import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-stock-in',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './stock-in.component.html',
  styleUrls: ['./stock-in.component.scss'],
})
export class StockInComponent implements OnInit {
  sims: any[] = [];
  page = 1;
  limit = 5;
  total = 0;
  totalPages = 1;
  isLoading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
    private loading: LoadingController,
  ) {}

  ngOnInit() {
    this.load();
  }

  // Ionic lifecycle - reload when view becomes active (e.g. after navigating back)
  ionViewWillEnter() {
    this.load();
  }

  navigateToImport() {
    this.router.navigate(['/stock-in/import']);
  }

  load() {
    this.fetchPage(1);
  }

  async fetchPage(page: number = 1) {
    this.isLoading = true;
    const targetStart = (page - 1) * this.limit;
    const targetEnd = page * this.limit;
    const pageSize = Math.max(1, this.limit); // use UI limit for server page size
    let serverPage = 1;
    const matched: any[] = [];
    let lastRes: any = null;

    try {
      while (true) {
        const payload: any = { page: serverPage, limit: pageSize };
        lastRes = await firstValueFrom(this.api.paginateSimCards(payload));
        const itemsOnPage = lastRes?.items || [];
        if (!itemsOnPage.length) break;
        const chunk = itemsOnPage.filter(
          (s: any) => (s.status || '').toUpperCase() === 'IN_STOCK',
        );
        matched.push(...chunk);
        if (itemsOnPage.length < pageSize) break;
        serverPage++;
      }

      this.sims = matched.slice(targetStart, targetEnd);
      this.total = matched.length;
      this.page = page;
      this.totalPages = Math.max(1, Math.ceil(this.total / this.limit));
    } catch (err) {
      const t = await this.toast.create({
        message: 'Failed to load data',
        duration: 1600,
      });
      await t.present();
    } finally {
      this.isLoading = false;
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, this.page - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.fetchPage(p);
  }

  prevPage() {
    if (this.page > 1) this.fetchPage(this.page - 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.fetchPage(this.page + 1);
  }

  onLimitChange(ev: any) {
    const v = ev?.detail?.value ?? ev;
    const n = Number(v) || 5;
    this.limit = n;
    this.fetchPage(1);
  }

  add() {
    this.router.navigate(['/sim-cards/new']);
  }

  edit(id: string) {
    this.router.navigate(['/sim-cards', id, 'edit']);
  }

  async remove(id: string) {
    const a = await this.alert.create({
      header: 'Delete',
      message: 'Delete this SIM?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            this.api.deleteSimCard(id).subscribe(async () => {
              const t = await this.toast.create({
                message: 'SIM deleted',
                duration: 1200,
              });
              await t.present();
              this.load();
            });
          },
        },
      ],
    });
    await a.present();
  }
}
