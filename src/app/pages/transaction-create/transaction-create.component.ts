import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-transaction-create',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './transaction-create.component.html',
})
export class TransactionCreateComponent {
  payload: any = { simCardId: '', customerId: '', amount: 0 };
  result: any = null;

  constructor(private api: ApiService) {}

  submit() {
    this.api.createTransaction(this.payload).subscribe(
      (res) => (this.result = { success: true, data: res }),
      (err) => (this.result = { success: false, error: err }),
    );
  }
}
