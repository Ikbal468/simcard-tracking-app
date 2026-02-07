import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-import-file',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './import-file.component.html',
  styleUrls: ['./import-file.component.scss'],
})
export class ImportFileComponent implements OnInit {
  selectedFile: File | null = null;
  fileName: string = '';
  isImporting = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
    private loading: LoadingController,
    private modalController: ModalController,
  ) {}

  ngOnInit() {}

  onFileSelected(ev: any) {
    const file: File = ev?.target?.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.fileName = file.name;
  }

  onChooseClick(ev: any, input: HTMLInputElement) {
    ev.stopPropagation();
    if (input) input.click();
  }

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.fileName = file.name;
  }

  async importFile() {
    if (!this.selectedFile) {
      const t = await this.toast.create({
        message: 'Please select a file first',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
      return;
    }

    const l = await this.loading.create({ message: 'Importing file...' });
    await l.present();
    this.isImporting = true;

    this.api.importSimCards(this.selectedFile).subscribe(
      async (res: any) => {
        await l.dismiss();
        this.isImporting = false;

        const total = res?.total ?? 0;
        const results: any[] = res?.results ?? [];
        const importResult = { total, results };

        const t = await this.toast.create({
          message: 'Import completed successfully',
          duration: 2000,
          color: 'success',
        });
        await t.present();

        // Navigate to summary page with import results
        this.router.navigate(['/stock-in/import-summary'], {
          state: {
            fileName: this.fileName,
            importResult: importResult,
          },
        });
      },
      async (err: any) => {
        await l.dismiss();
        this.isImporting = false;

        const a = await this.alert.create({
          header: 'Import Error',
          message: err?.error?.message || err?.message || 'Upload failed',
          buttons: ['OK'],
        });
        await a.present();
      },
    );
  }

  goBack() {
    this.router.navigate(['/stock-in']);
  }

  async closeModal() {
    await this.modalController.dismiss({
      refresh: false,
    });
  }
}
