import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  AlertInput,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-stock-out',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './stock-out.component.html',
  styleUrls: ['./stock-out.component.scss'],
})
export class StockOutComponent implements OnInit {
  sims: any[] = [];
  customers: any[] = [];
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
  ) {}

  navigateToAssign() {
    this.router.navigate(['/stock-out/assign-multiple']);
  }

  ngOnInit() {
    // load customers first so we can map owner names on sims
    this.api.getCustomers().subscribe((res: any) => {
      this.customers = res || [];
      this.load();
    });
  }

  // Ionic lifecycle - reload when view becomes active (e.g. after navigating back)
  ionViewWillEnter() {
    // reload customers and page
    this.api.getCustomers().subscribe((res: any) => {
      this.customers = res || [];
      this.load();
    });
  }

  async add() {
    // choose a SIM from IN_STOCK
    const simsRes: any = await firstValueFrom(this.api.getSimCards());
    const inStock = (simsRes || []).filter(
      (s: any) => (s.status || '').toUpperCase() === 'IN_STOCK',
    );
    if (!inStock.length) {
      const t = await this.toast.create({
        message: 'No SIMs available in stock',
        duration: 1400,
      });
      await t.present();
      return;
    }

    const simInputs: AlertInput[] = inStock.map(
      (s: any) =>
        ({
          type: 'radio',
          label: `${s.serialNumber || s.msisdn || 'ID ' + s.id}`,
          value: String(s.id),
        }) as AlertInput,
    );
    const simAlert = await this.alert.create({
      header: 'Select SIM to Stock Out',
      inputs: simInputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Next',
          handler: async (simId) => {
            // Require a SIM to be selected before proceeding
            if (simId == null || simId === '') {
              const t = await this.toast.create({
                message: 'Please select a SIM first',
                duration: 1400,
              });
              await t.present();
              return false;
            }
            // then choose customer
            const custInputs: AlertInput[] = (this.customers || []).map(
              (c: any) =>
                ({
                  type: 'radio',
                  label: c.name,
                  value: String(c.id),
                }) as AlertInput,
            );
            const custAlert = await this.alert.create({
              header: 'Select Customer',
              inputs: custInputs,
              buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                  text: 'Assign',
                  handler: async (custId) => {
                    // Require a customer selection before assigning
                    if (custId == null || custId === '') {
                      const t = await this.toast.create({
                        message: 'Please select a customer',
                        duration: 1400,
                      });
                      await t.present();
                      return false;
                    }
                    // perform update: set sim status to OUT_STOCK and assign owner/customer
                    const sim = inStock.find(
                      (x: any) => String(x.id) === String(simId),
                    );
                    if (!sim) {
                      const t = await this.toast.create({
                        message: 'Selected SIM not found',
                        duration: 1400,
                      });
                      await t.present();
                      return false;
                    }
                    const payload: any = {
                      status: 'OUT_STOCK',
                      owner: Number(custId),
                    };
                    this.api.updateSimCard(sim.id, payload).subscribe({
                      next: async () => {
                        // create transaction record
                        const tx = {
                          simCardId: Number(sim.id),
                          customerId: Number(custId),
                          type: 'STOCK_OUT',
                        };
                        this.api.createTransaction(tx).subscribe({
                          next: async () => {
                            const t = await this.toast.create({
                              message: 'Stocked out',
                              duration: 1400,
                            });
                            await t.present();
                            this.load();
                          },
                          error: async (err) => {
                            const message =
                              err?.error?.message ||
                              err?.message ||
                              'Failed to create transaction';
                            const t = await this.toast.create({
                              message,
                              duration: 3000,
                              color: 'danger',
                            });
                            await t.present();
                          },
                        });
                      },
                      error: async (err) => {
                        const message =
                          err?.error?.message ||
                          err?.message ||
                          'Failed to update SIM';
                        const t = await this.toast.create({
                          message,
                          duration: 3000,
                          color: 'danger',
                        });
                        await t.present();
                      },
                    });
                    return true;
                  },
                },
              ],
            });
            await custAlert.present();
            return true;
          },
        },
      ],
    });
    await simAlert.present();
  }

  load() {
    this.fetchPage(1);
  }

  fetchPage(page: number = 1) {
    this.isLoading = true;
    (async () => {
      const targetStart = (page - 1) * this.limit;
      const targetEnd = page * this.limit;
      const pageSize = Math.max(1, this.limit);
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
            (s: any) => (s.status || '').toUpperCase() === 'OUT_STOCK',
          );
          matched.push(...chunk);
          if (itemsOnPage.length < pageSize) break;
          serverPage++;
        }

        const pageItems = matched.slice(targetStart, targetEnd);
        this.sims = pageItems.map((s: any) => {
          const ownerId = s.owner ?? s.customer?.id ?? s.customerId ?? null;
          const ownerName =
            s.customerName ||
            s.customer?.name ||
            (ownerId
              ? this.customers.find(
                  (c: any) => String(c.id) === String(ownerId),
                )?.name
              : undefined) ||
            null;
          return { ...s, ownerName };
        });

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
    })();
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
            this.api.deleteSimCard(id).subscribe({
              next: async () => {
                const t = await this.toast.create({
                  message: 'SIM deleted',
                  duration: 1200,
                });
                await t.present();
                this.load();
              },
              error: async (err) => {
                const message =
                  err?.error?.message || err?.message || 'Failed to delete SIM';
                const t = await this.toast.create({
                  message,
                  duration: 3000,
                  color: 'danger',
                });
                await t.present();
              },
            });
          },
        },
      ],
    });
    await a.present();
  }

  async assignToCustomer(sim: any) {
    const inputs: AlertInput[] = (this.customers || []).map(
      (c: any) =>
        ({
          type: 'radio',
          label: c.name,
          value: String(c.id),
        }) as AlertInput,
    );
    const a = await this.alert.create({
      header: 'Change Customer',
      inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Assign',
          handler: async (value) => {
            if (value == null || value === '') {
              const t = await this.toast.create({
                message: 'Please select a customer',
                duration: 1400,
              });
              await t.present();
              return false;
            }
            const customerId = Number(value);
            this.api.changeSimCustomer(sim.id, { customerId }).subscribe(
              async () => {
                // ensure sim status is set to OUT_STOCK so it appears in Stock Out list
                this.api
                  .updateSimCard(String(sim.id), {
                    status: 'OUT_STOCK',
                    owner: customerId,
                  })
                  .subscribe(
                    async () => {
                      const t = await this.toast.create({
                        message: 'Assigned',
                        duration: 1200,
                      });
                      await t.present();
                      this.load();
                    },
                    async (err) => {
                      const t = await this.toast.create({
                        message: 'Assigned but failed to update status',
                        duration: 1800,
                      });
                      await t.present();
                      this.load();
                    },
                  );
              },
              async (err) => {
                const t = await this.toast.create({
                  message: 'Failed to assign',
                  duration: 1600,
                });
                await t.present();
              },
            );
            return true;
          },
        },
      ],
    });
    await a.present();
  }
}
