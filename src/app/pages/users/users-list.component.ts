import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
import {
  IonicModule,
  ToastController,
  AlertController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { RESOURCE_LABELS, ACTION_LABELS } from './permission-labels';

interface UserWithGrouped {
  id: number;
  username: string;
  role?: any;
  effectivePermissions?: any[];
  permissions?: any[];
  groupedPermissions: Record<string, string[]>;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  users: UserWithGrouped[] = [];
  roles: any[] = [];

  // Expose labels for template
  RESOURCE_LABELS = RESOURCE_LABELS;
  ACTION_LABELS = ACTION_LABELS;

  // full permission list (matches backend table)
  permissionList = [
    { id: 1, resource: 'customers', action: 'view' },
    { id: 2, resource: 'customers', action: 'create' },
    { id: 3, resource: 'customers', action: 'edit' },
    { id: 4, resource: 'customers', action: 'delete' },
    { id: 5, resource: 'simcards', action: 'view' },
    { id: 6, resource: 'simcards', action: 'create' },
    { id: 7, resource: 'simcards', action: 'edit' },
    { id: 8, resource: 'simcards', action: 'delete' },
    { id: 9, resource: 'simtypes', action: 'view' },
    { id: 10, resource: 'simtypes', action: 'create' },
    { id: 11, resource: 'simtypes', action: 'edit' },
    { id: 12, resource: 'simtypes', action: 'delete' },
    { id: 13, resource: 'transactions', action: 'view' },
    // { id: 14, resource: 'transactions', action: 'create' },
    { id: 15, resource: 'transactions', action: 'edit' },
    { id: 16, resource: 'transactions', action: 'delete' },
    { id: 17, resource: 'dashboard', action: 'view' },
    // { id: 18, resource: 'dashboard', action: 'create' },
    // { id: 19, resource: 'dashboard', action: 'edit' },
    // { id: 20, resource: 'dashboard', action: 'delete' },
    // { id: 21, resource: 'users', action: 'view' },
    // { id: 22, resource: 'users', action: 'create' },
    // { id: 23, resource: 'users', action: 'edit' },
    // { id: 24, resource: 'users', action: 'delete' },
  ];

  get isAdmin(): boolean {
    return window.localStorage.getItem('user_role') === 'admin';
  }

  constructor(
    private api: ApiService,
    private toast: ToastController,
    private alert: AlertController,
    private modal: ModalController,
    private nav: NavController,
  ) {}

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }

  ionViewWillEnter() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.getUsers().subscribe({
      next: (res: any) => {
        // Preprocess users to include grouped permissions (performance optimization)
        this.users = (res || []).map((user: any) => ({
          ...user,
          groupedPermissions: this.groupPermissions(user),
        }));
      },
      error: async (err) => {
        const t = await this.toast.create({
          message: err?.error?.message || 'Failed to load users',
          duration: 2000,
          color: 'danger',
        });
        await t.present();
      },
    });
  }

  // Helper to group permissions by resource (called once per user when loading)
  private groupPermissions(user: any): Record<string, string[]> {
    const permissions =
      user.effectivePermissions || user.role?.permissions || [];

    const grouped: Record<string, string[]> = {};

    permissions.forEach((p: any) => {
      if (!grouped[p.resource]) {
        grouped[p.resource] = [];
      }
      grouped[p.resource].push(p.action);
    });

    return grouped;
  }

  loadRoles() {
    this.api.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res || [];
      },
    });
  }

  createUser() {
    this.nav.navigateForward('/users/new');
  }

  async changeRole(user: any) {
    const inputs = this.roles.map((r) => ({
      type: 'radio' as const,
      label: r.name,
      value: r.id,
      checked: user.role?.id === r.id,
    }));

    const a = await this.alert.create({
      header: `Change Role for ${user.username}`,
      inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (roleId) => {
            this.api.changeUserRole(user.id, { roleId }).subscribe({
              next: async () => {
                const t = await this.toast.create({
                  message: 'Role updated',
                  duration: 2000,
                  color: 'success',
                });
                await t.present();
                this.loadUsers();
              },
              error: async (err) => {
                const t = await this.toast.create({
                  message: err?.error?.message || 'Failed to update role',
                  duration: 2000,
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

  async openPermissions(user: any) {
    if (!user || !user.role) return;

    // Group permissions by resource for better organization
    const groupedInputs: any[] = [];
    const resourceGroups: Record<string, any[]> = {};

    // Group permissions
    this.permissionList.forEach((p) => {
      if (!resourceGroups[p.resource]) {
        resourceGroups[p.resource] = [];
      }
      resourceGroups[p.resource].push(p);
    });

    // Build inputs with resource headers
    Object.keys(resourceGroups).forEach((resource) => {
      // Add resource header
      groupedInputs.push({
        type: 'checkbox' as const,
        label: `── ${RESOURCE_LABELS[resource] || resource} ──`,
        value: `header_${resource}`,
        checked: false,
        disabled: true,
        cssClass: 'permission-header',
      });

      // Add permission checkboxes for this resource
      resourceGroups[resource].forEach((p) => {
        const checked =
          (user.effectivePermissions || []).some((ep: any) => ep.id === p.id) ||
          (user.permissions || []).some((up: any) => up.id === p.id) ||
          (user.role?.permissions || []).some((rp: any) => rp.id === p.id);

        groupedInputs.push({
          type: 'checkbox' as const,
          label: `   ${ACTION_LABELS[p.action] || p.action}`,
          value: p.id,
          checked,
        });
      });
    });

    const a = await this.alert.create({
      header: `Edit Permissions`,
      subHeader: `User: ${user.username}`,
      inputs: groupedInputs,
      cssClass: 'permissions-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save Changes',
          handler: (selected: any) => {
            // Filter out header values and ensure array of numbers
            const ids = Array.isArray(selected)
              ? selected
                  .filter((v: any) => !String(v).startsWith('header_'))
                  .map((v: any) => Number(v))
              : [];
            this.api
              .setUserPermissions(user.id, user.role.id, { permissionIds: ids })
              .subscribe({
                next: async (res: any) => {
                  // update local user's effectivePermissions from response if provided
                  if (res && res.effectivePermissions) {
                    user.effectivePermissions = res.effectivePermissions;
                  } else {
                    // fallback: compute from permissionList
                    user.effectivePermissions = this.permissionList.filter(
                      (p) => ids.includes(p.id),
                    );
                  }

                  const t = await this.toast.create({
                    message: 'Permissions updated successfully',
                    duration: 2000,
                    color: 'success',
                  });
                  await t.present();
                  this.loadUsers();
                },
                error: async (err) => {
                  const t = await this.toast.create({
                    message:
                      err?.error?.message || 'Failed to update permissions',
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

  async deleteUser(id: number) {
    const a = await this.alert.create({
      header: 'Delete User',
      message: 'Delete this user?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            this.api.deleteUser(id).subscribe({
              next: async () => {
                const t = await this.toast.create({
                  message: 'User deleted',
                  duration: 1200,
                });
                await t.present();
                this.loadUsers();
              },
              error: async (err) => {
                const message =
                  err?.error?.message ||
                  err?.message ||
                  'Failed to delete user';
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

  hasFullAccess(actions: string[]) {
    const full = ['view', 'create', 'edit', 'delete'];
    return full.every((a) => actions.includes(a));
  }

  // Helper for proper typing in template with keyvalue pipe
  asStringArray(value: unknown): string[] {
    return value as string[];
  }

  asString(value: unknown): string {
    return value as string;
  }
}
