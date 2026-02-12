import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-assign-multiple',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './assign-multiple.component.html',
  styleUrls: ['./assign-multiple.component.scss'],
})
export class AssignMultipleComponent implements OnInit {
  sims: any[] = [];
  customers: any[] = [];
  selected: Set<number> = new Set();
  selectedCustomer: number | null = null;
  isLoading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      const [simsRes, custRes] = await Promise.all([
        this.api.getSimCards().toPromise(),
        this.api.getCustomers().toPromise(),
      ] as any);
      this.customers = custRes || [];
      this.sims = (simsRes || []).filter(
        (s: any) => (s.status || '').toUpperCase() === 'IN_STOCK',
      );
    } catch (err) {
      const t = await this.toast.create({
        message: 'Failed to load',
        duration: 1600,
      });
      await t.present();
    } finally {
      this.isLoading = false;
    }
  }

  toggleSelect(id: number) {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
  }

  selectAll() {
    this.sims.forEach((s) => this.selected.add(Number(s.id)));
  }

  clearSelection() {
    this.selected.clear();
  }

  async assign() {
    if (!this.selected.size || this.selectedCustomer == null) return;
    const loader = await this.loadingCtrl.create({ message: 'Assigning...' });
    await loader.present();
    try {
      const ids = Array.from(this.selected);
      // sequentially update sim status then create transaction for each id
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await this.api
          .updateSimCard(String(id), {
            status: 'OUT_STOCK',
            owner: this.selectedCustomer,
          })
          .toPromise();
        const tx = {
          simCardId: Number(id),
          customerId: Number(this.selectedCustomer),
          type: 'STOCK_OUT',
        };
        // eslint-disable-next-line no-await-in-loop
        await this.api.createTransaction(tx).toPromise();
      }
      const t = await this.toast.create({
        message: 'Assigned',
        duration: 1400,
      });
      await t.present();
      this.router.navigate(['/stock-out']);
    } catch (err: any) {
      const message = err?.error?.message || err?.message || 'Assign failed';
      const t = await this.toast.create({
        message,
        duration: 3000,
        color: 'danger',
      });
      await t.present();
    } finally {
      await loader.dismiss();
    }
  }

  cancel() {
    this.router.navigate(['/stock-out']);
  }
}
