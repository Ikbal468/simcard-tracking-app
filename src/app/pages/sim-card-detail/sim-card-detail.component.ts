import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-sim-card-detail',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './sim-card-detail.component.html',
})
export class SimCardDetailComponent implements OnInit {
  simCard: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  // reload detail when view becomes active (e.g. after editing)
  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.api.getSimCard(id).subscribe((res: any) => (this.simCard = res));
  }

  edit() {
    if (this.simCard?.id)
      this.router.navigate(['/sim-cards', this.simCard.id, 'edit']);
  }

  async delete() {
    if (!this.simCard?.id) return;
    const a = await this.alert.create({
      header: 'Delete',
      message: 'Delete this SIM?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            this.api.deleteSimCard(this.simCard.id).subscribe(async () => {
              const t = await this.toast.create({
                message: 'SIM deleted',
                duration: 1200,
              });
              await t.present();
              this.router.navigate(['/sim-cards']);
            });
          },
        },
      ],
    });
    await a.present();
  }
}
