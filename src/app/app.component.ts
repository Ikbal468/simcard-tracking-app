import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  welcomeText = 'Good Morning';
  username = '';
  version = '';
  activePath = '';
  private routerSub: Subscription | null = null;

  get isLoginPage(): boolean {
    return this.activePath === '/login' || this.activePath === '/';
  }

  constructor(
    private menu: MenuController,
    private router: Router,
    private alertCtrl: AlertController,
  ) {
    // subscribe to router events to keep track of active route
    this.routerSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.activePath = e.urlAfterRedirects || e.url;
        // refresh username on navigation end
        this.username = window.localStorage.getItem('username') || 'root';
      }
    });
  }

  async openPage(path: string) {
    // close the menu then navigate
    await this.menu.close();
    this.router.navigate([path]);
  }

  async onProfileClick() {
    const token = window.localStorage.getItem('access_token');
    if (!token) {
      // not logged in -> go to login
      await this.menu.close();
      this.router.navigate(['/login']);
      return;
    }

    const alert = await this.alertCtrl.create({
      header: this.username || 'Profile',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => this.logout(),
        },
      ],
    });
    await alert.present();
  }

  logout() {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('username');
    this.username = 'root';
    this.menu.close();
    this.router.navigate(['/login']);
  }

  isActive(path: string) {
    // guard against empty state and compare against tracked activePath
    if (!path) return false;
    const current = this.activePath || this.router.url || '';
    // treat '/home' as active for root '/'
    if (path === '/home' && (current === '/' || current === '/home'))
      return true;
    return current.startsWith(path);
  }

  ngOnInit(): void {
    const today = new Date();
    const curHr = today.getHours();
    if (curHr < 12) this.welcomeText = 'Good Morning';
    else if (curHr < 18) this.welcomeText = 'Good Afternoon';
    else this.welcomeText = 'Good Evening';

    // pick username from localStorage if present
    this.username = window.localStorage.getItem('username') || 'root';
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
      this.routerSub = null;
    }
  }
}
