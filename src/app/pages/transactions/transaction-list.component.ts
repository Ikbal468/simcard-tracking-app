import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
})
export class TransactionListComponent implements OnInit {
  transactions: any[] = [];
  serialNumber = '';
  simStatus: string = '';
  isLoading = false;
  private searchSubject = new Subject<string>();
  private destroyed = new Subject<void>();

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
  ) {}
  page = 1;
  limit = 5;
  total = 0;
  totalPages = 1;

  ngOnInit() {
    this.load();
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((val) => {
        this.serialNumber = val;
        this.search();
      });
  }

  // Ionic lifecycle - reload when view becomes active
  ionViewWillEnter() {
    this.load();
  }

  onFilterChange() {
    // called when simStatus select changes
    this.search();
  }

  load() {
    this.fetchPage(1);
  }

  search() {
    const payload: any = {};
    if (this.serialNumber && this.serialNumber.trim().length) {
      payload.serialNumber = this.serialNumber.trim();
    }
    if (this.simStatus && this.simStatus.trim().length) {
      payload.simStatus = this.simStatus.trim();
    }

    const isEmpty = !(payload.serialNumber || payload.simStatus);
    if (isEmpty) {
      this.load();
      return;
    }

    this.isLoading = true;
    // perform paged search starting from first page
    this.fetchPage(1);
  }

  clearFilters() {
    this.serialNumber = '';
    this.simStatus = '';
    this.fetchPage(1);
  }

  fetchPage(page: number = 1) {
    this.isLoading = true;
    const payload: any = { page, limit: this.limit };
    if (this.serialNumber && this.serialNumber.trim().length) {
      payload.serialNumber = this.serialNumber.trim();
    }
    if (this.simStatus && this.simStatus.trim().length) {
      payload.simStatus = this.simStatus.trim();
    }

    this.api.searchTransactions(payload).subscribe(
      (res: any) => {
        this.transactions = res?.data || res || [];
        this.total = res?.total ?? this.transactions.length;
        this.page = res?.page ?? page;
        this.limit = res?.limit ?? this.limit;
        this.totalPages = Math.max(1, Math.ceil(this.total / this.limit));
        this.isLoading = false;
      },
      async () => {
        this.isLoading = false;
        const t = await this.toast.create({
          message: 'Search failed',
          duration: 1600,
        });
        await t.present();
      },
    );
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

  onSearchInput(ev: Event) {
    const value = (ev as any)?.target?.value ?? '';
    this.searchSubject.next(value || '');
  }

  ngOnDestroy() {
    this.searchSubject.complete();
    this.destroyed.next();
    this.destroyed.complete();
  }

  onLimitChange(ev: any) {
    const v = ev?.detail?.value ?? ev;
    const n = Number(v) || 5;
    this.limit = n;
    this.fetchPage(1);
  }

  add() {
    this.router.navigate(['/transactions/new']);
  }

  edit(id: string) {
    this.router.navigate(['/transactions', id, 'edit']);
  }

  async remove(id: string) {
    const a = await this.alert.create({
      header: 'Delete',
      message: 'Delete this transaction?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            this.api.deleteTransaction(id).subscribe(async () => {
              const t = await this.toast.create({
                message: 'Deleted',
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
