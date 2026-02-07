import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sim-types-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './sim-types-list.component.html',
  styleUrls: ['./sim-types-list.component.scss'],
})
export class SimTypesListComponent implements OnInit {
  simTypes: any[] = [];
  loading = false;
  // accent colors for cards
  accentColors = ['#F59E0B', '#EF4444', '#06B6D4', '#2563EB', '#8B5CF6'];

  // return asset path for known providers, otherwise null
  getIconFor(t: any): string | null {
    const name = (t?.name || '').toString().toLowerCase();
    if (!name) return null;
    if (name.includes('maxis')) return 'assets/icon/maxis.jpg';
    if (name.includes('digi')) return 'assets/icon/Digi-Logo.jpg';
    if (name.includes('flexiroam')) return 'assets/icon/unnamed.png';
    if (name.includes('singtel')) return 'assets/icon/Singtel_Logo_New.png';
    return null;
  }

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
    this.api.getSimTypes().subscribe((res: any) => (this.simTypes = res || []));
  }

  add() {
    this.router.navigate(['/sim-types/new']);
  }

  edit(id: string) {
    this.router.navigate(['/sim-types', id, 'edit']);
  }

  async remove(id: string) {
    const a = await this.alert.create({
      header: 'Delete',
      message: 'Delete this SIM type?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: () => {
            this.api.deleteSimType(id).subscribe(async () => {
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
