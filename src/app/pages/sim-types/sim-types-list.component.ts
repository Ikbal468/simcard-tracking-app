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

    const domainMap: any = {
      maxis: 'maxis.com.my', // Maxis / Hotlink (the image icon not show correctly)
      hotlink: 'hotlink.com',
      digi: 'digi.com.my', // Digi
      celcom: 'celcom.com.my', // Celcom / Xpax
      celcomdigi: 'celcomdigi.com', // Celcom + Digi merged brand
      umobile: 'u.com.my', // U Mobile
      tunetalk: 'tunetalk.com', // Tune Talk
      xox: 'xox.com.my', // XOX Mobile / ONEXOX
      yes: 'yes.my', // Yes 4G
      unifi: 'unifi.com.my', // Unifi Mobile (the image icon not show correctly)
      redone: 'redone.com.my', // redONE MVNO
      yoodo: 'yoodo.com.my', // yoodo MVNO

      singtel: 'singtel.com', // optional if you still want
      flexiroam: 'flexiroam.com', // optional
      airalo: 'airalo.com', // optional
      ubigi: 'ubigi.com', // optional
      holafly: 'holafly.com', // optional
      simcorner: 'simcorner.com', // optional
    };

    for (const key in domainMap) {
      if (name.includes(key)) {
        return `https://logos.hunter.io/${domainMap[key]}`;
      }
    }

    return null; // unknown SIM type
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
            this.api.deleteSimType(id).subscribe({
              next: async () => {
                const t = await this.toast.create({
                  message: 'Deleted',
                  duration: 1200,
                });
                await t.present();
                this.load();
              },
              error: async (err) => {
                const message =
                  err?.error?.message ||
                  err?.message ||
                  'Failed to delete SIM type';
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
