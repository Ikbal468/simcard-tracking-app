import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sim-card-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './sim-card-form.component.html',
  styleUrls: ['./sim-card-form.component.scss'],
})
export class SimCardFormComponent implements OnInit {
  model: any = {
    serialNumber: '',
    imsi: '',
    simTypeId: '',
    status: 'IN_STOCK',
  };
  simTypes: any[] = [];
  editing = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private nav: NavController,
    private toast: ToastController,
  ) {}

  cancel() {
    this.nav.navigateBack('/sim-cards');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.api.getSimTypes().subscribe((res: any) => (this.simTypes = res || []));
    if (id && id !== 'new') {
      this.editing = true;
      this.api.getSimCard(id).subscribe((res: any) => {
        // map API response into the local form model
        this.model = {
          id: res.id,
          serialNumber: res.serialNumber || res.msisdn || '',
          imsi: res.imsi || '',
          simTypeId: res.simType?.id ?? res.simType ?? '',
          status: res.status ?? this.model.status,
        };
      });
    }
  }

  save() {
    // validation
    if (!this.model.serialNumber || !this.model.serialNumber.trim()) {
      this.showError('Serial number is required');
      return;
    }
    if (!this.model.simTypeId) {
      this.showError('SIM Type is required');
      return;
    }

    const payload: any = {
      serialNumber: this.model.serialNumber.trim(),
      imsi: this.model.imsi ? String(this.model.imsi).trim() : undefined,
      // backend expects 'simType' as integer
      simType: Number(this.model.simTypeId),
      status: this.model.status,
    };

    if (this.editing) {
      this.api.updateSimCard(this.model.id, payload).subscribe({
        next: () => this.finish('Updated'),
        error: (err) => this.showError(err.error?.message || 'Update failed'),
      });
    } else {
      this.api.createSimCard(payload).subscribe({
        next: () => this.finish('Created'),
        error: (err) => this.showError(err.error?.message || 'Create failed'),
      });
    }
  }

  async showError(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2500,
      color: 'danger',
    });
    await t.present();
  }

  async finish(action: string) {
    const t = await this.toast.create({
      message: `SIM ${action}`,
      duration: 1500,
      position: 'bottom',
    });
    await t.present();
    this.nav.navigateBack('/sim-cards');
  }
}
