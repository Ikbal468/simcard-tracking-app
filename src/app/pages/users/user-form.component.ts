import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  model: any = { username: '', password: '', roleId: null };
  roles: any[] = [];
  editing = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private nav: NavController,
    private toast: ToastController,
  ) {}

  cancel() {
    this.nav.navigateBack('/users');
  }

  ngOnInit() {
    this.loadRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.editing = true;
      // Load user data if editing (currently creating only)
    }
  }

  loadRoles() {
    this.api.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res || [];
        // Set default role to operator if available
        if (!this.model.roleId && this.roles.length > 0) {
          const operatorRole = this.roles.find((r) => r.name === 'operator');
          if (operatorRole) {
            this.model.roleId = operatorRole.id;
          } else {
            this.model.roleId = this.roles[0].id;
          }
        }
      },
    });
  }

  save() {
    if (!this.model.username?.trim()) {
      this.showError('Username is required');
      return;
    }

    if (!this.model.password) {
      this.showError('Password is required');
      return;
    }

    if (!this.model.roleId) {
      this.showError('Please select a role');
      return;
    }

    const payload = {
      username: this.model.username.trim(),
      password: this.model.password,
      roleId: this.model.roleId,
    };

    this.api.createUser(payload).subscribe({
      next: () => this.finish('Created'),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  async showError(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'warning',
    });
    await t.present();
  }

  async handleSaveError(err: any) {
    const message = err?.error?.message || 'Failed to create user';
    const t = await this.toast.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
    });
    await t.present();
  }

  async finish(action: string) {
    const t = await this.toast.create({
      message: `User ${action} successfully`,
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });
    await t.present();
    this.nav.navigateBack('/users');
  }
}
