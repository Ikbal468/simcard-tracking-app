import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, IonicModule, IonInput } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginComponent implements OnInit, AfterViewInit {
  username = '';
  password = '';
  loading = false;
  remember = false;

  @ViewChildren(IonInput) inputs!: QueryList<IonInput>;

  ngOnInit(): void {
    // ensure fields start blank (avoid autofill/populated values)
    this.username = '';
    this.password = '';
  }

  ngAfterViewInit(): void {
    // Force clear inputs after view renders (browsers autofill after ngOnInit)
    setTimeout(() => {
      this.username = '';
      this.password = '';
      // Clear native input elements to override browser autofill
      this.inputs.forEach((input) => {
        input.getInputElement().then((nativeInput) => {
          nativeInput.value = '';
        });
      });
    }, 100);
  }

  constructor(
    private api: ApiService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {}

  async login() {
    if (!this.username || !this.password) {
      this.showToast('Please enter username and password');
      return;
    }
    this.loading = true;
    this.api
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res && res.access_token) {
            window.localStorage.setItem('access_token', res.access_token);
            window.localStorage.setItem(
              'username',
              res.user?.username || this.username,
            );
            window.localStorage.setItem(
              'user_role',
              res.user?.role || 'operator',
            );
            window.localStorage.setItem(
              'user_permissions',
              JSON.stringify(res.user?.permissions || []),
            );
            this.router.navigate(['/home']);
          } else {
            this.showToast('Login failed');
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.showToast(err?.error?.message || 'Login failed');
        },
      });
  }

  async showToast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 2000 });
    await t.present();
  }
}
