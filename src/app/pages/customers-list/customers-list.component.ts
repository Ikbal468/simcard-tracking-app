import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss'],
})
export class CustomersListComponent implements OnInit {
  customers: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
  ) {}

  ngOnInit() {
    this.load();
  }

  // Ionic lifecycle - reload when view becomes active
  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.api
      .getCustomers()
      .subscribe((res: any) => (this.customers = res || []));
  }

  addCustomer() {
    this.router.navigate(['/customers/new']);
  }

  editCustomer(id: string) {
    this.router.navigate(['/customers', id, 'edit']);
  }

  async deleteCustomer(id: string) {
    const a = await this.alert.create({
      header: 'Delete',
      message: 'Delete this customer?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            this.api.deleteCustomer(id).subscribe({
              next: async () => {
                const t = await this.toast.create({
                  message: 'Customer deleted',
                  duration: 1200,
                });
                await t.present();
                this.load();
              },
              error: async (err) => {
                const message =
                  err?.error?.message ||
                  err?.message ||
                  'Failed to delete customer';
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
}
