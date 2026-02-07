import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-summary',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './import-summary.component.html',
  styleUrls: ['./import-summary.component.scss'],
})
export class ImportSummaryComponent implements OnInit {
  fileName: string = '';
  importResult: { total: number; results: any[] } | null = null;
  activeTab: string = 'created';

  get createdCount(): number {
    return (
      this.importResult?.results?.filter((r) => r.status === 'created')
        .length ?? 0
    );
  }

  get skippedCount(): number {
    return (
      this.importResult?.results?.filter((r) => r.status === 'skipped')
        .length ?? 0
    );
  }

  get errorCount(): number {
    return (
      this.importResult?.results?.filter((r) => r.status === 'error').length ??
      0
    );
  }

  get createdResults() {
    return (this.importResult?.results || []).filter(
      (r: any) => r.status === 'created',
    );
  }

  get skippedResults() {
    return (this.importResult?.results || []).filter(
      (r: any) => r.status === 'skipped',
    );
  }

  get errorResults() {
    return (this.importResult?.results || []).filter(
      (r: any) => r.status === 'error',
    );
  }

  constructor(
    private router: Router,
    private alert: AlertController,
  ) {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.fileName = navigation.extras.state['fileName'] || '';
      this.importResult = navigation.extras.state['importResult'] || null;
    }
  }

  ngOnInit() {
    // If no data, redirect back to import page
    if (!this.importResult) {
      this.router.navigate(['/stock-in/import']);
    }
  }

  async showItemDetails(item: any) {
    let message = `<b>Line:</b> ${item.line}<br/>`;
    message += `<b>Status:</b> ${item.status}<br/>`;
    if (item.serial) message += `<b>Serial:</b> ${item.serial}<br/>`;
    if (item.reason) message += `<b>Reason:</b> ${item.reason}<br/>`;

    if (item.debug) {
      message += '<br/><b>Debug Info:</b><br/>';
      Object.keys(item.debug).forEach((key) => {
        message += `<small>${key}: ${JSON.stringify(item.debug[key])}</small><br/>`;
      });
    }

    const a = await this.alert.create({
      header: 'Import Detail',
      message: message,
      buttons: ['OK'],
    });
    await a.present();
  }

  importAnother() {
    this.router.navigate(['/stock-in/import']);
  }

  goBack() {
    this.router.navigate(['/stock-in']);
  }
}
