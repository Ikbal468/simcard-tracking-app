import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent implements OnInit {
  model: any = { name: '', email: '' };
  editing = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private nav: NavController,
    private toast: ToastController,
  ) {}

  cancel() {
    this.nav.navigateBack('/customers');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.editing = true;
      this.api.getCustomer(id).subscribe((res: any) => (this.model = res));
    }
  }

  save() {
    // Validate fields
    if (!this.model.name || !this.model.name.trim()) {
      this.showError('Name is required');
      return;
    }
    if (!this.model.email || !this.model.email.trim()) {
      this.showError('Email is required');
      return;
    }

    const payload = {
      name: this.model.name.trim(),
      email: this.model.email.trim(),
    };
    if (this.editing) {
      this.api.updateCustomer(this.model.id, payload).subscribe({
        next: () => this.finish('Updated'),
        error: (err) => this.showError(err.error?.message || 'Update failed'),
      });
    } else {
      this.api.createCustomer(payload).subscribe({
        next: () => this.finish('Created'),
        error: (err) => this.showError(err.error?.message || 'Create failed'),
      });
    }
  }

  async showError(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'danger',
    });
    await t.present();
  }

  async finish(action: string) {
    const t = await this.toast.create({
      message: `Customer ${action}`,
      duration: 1500,
      position: 'bottom',
    });
    await t.present();
    this.nav.navigateBack('/customers');
  }
}
