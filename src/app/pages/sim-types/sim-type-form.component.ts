import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sim-type-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './sim-type-form.component.html',
  styleUrls: ['./sim-type-form.component.scss'],
})
export class SimTypeFormComponent implements OnInit {
  model: any = { name: '', description: '', purchaseProduct: '' };
  editing = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private nav: NavController,
    private toast: ToastController,
  ) {}

  cancel() {
    this.nav.navigateBack('/sim-types');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.editing = true;
      this.api.getSimType(id).subscribe((res: any) => (this.model = res));
    }
  }

  save() {
    if (this.editing) {
      this.api
        .updateSimType(this.model.id, this.model)
        .subscribe(() => this.finish('Updated'));
    } else {
      this.api
        .createSimType(this.model)
        .subscribe(() => this.finish('Created'));
    }
  }

  async finish(action: string) {
    const t = await this.toast.create({
      message: `SIM Type ${action}`,
      duration: 1500,
      position: 'bottom',
    });
    await t.present();
    this.nav.navigateBack('/sim-types');
  }
}
