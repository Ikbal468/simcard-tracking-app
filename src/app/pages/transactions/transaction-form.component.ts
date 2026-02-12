import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
})
export class TransactionFormComponent implements OnInit {
  model: any = { simCardId: null, customerId: null, type: 'STOCK_IN' };
  sims: any[] = [];
  customers: any[] = [];
  editing = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastController,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.getSimCards().subscribe((res: any) => (this.sims = res || []));
    this.api
      .getCustomers()
      .subscribe((res: any) => (this.customers = res || []));
    if (id && id !== 'new') {
      this.editing = true;
      this.api.getTransaction(id).subscribe((res: any) => {
        this.model = {
          simCardId: res.simCard?.id,
          customerId: res.customer?.id,
          type: res.type,
          id: res.id,
        };
      });
    }
  }

  save() {
    const payload = {
      simCardId: Number(this.model.simCardId),
      customerId: this.model.customerId
        ? Number(this.model.customerId)
        : undefined,
      type: this.model.type,
    };
    if (this.editing) {
      this.api.updateTransaction(this.model.id, payload).subscribe({
        next: () => this.finish('Updated'),
        error: (err) => this.showError(err),
      });
    } else {
      this.api.createTransaction(payload).subscribe({
        next: () => this.finish('Created'),
        error: (err) => this.showError(err),
      });
    }
  }

  async showError(err: any) {
    const message =
      err?.error?.message ||
      err?.message ||
      'Operation failed. Please try again.';
    const t = await this.toast.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    await t.present();
  }

  async finish(action: string) {
    const t = await this.toast.create({
      message: `Transaction ${action}`,
      duration: 1400,
    });
    await t.present();
    this.router.navigate(['/transactions']);
  }

  goList() {
    this.router.navigate(['/transactions']);
  }
}
