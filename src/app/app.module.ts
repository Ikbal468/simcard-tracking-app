import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { SimCardDetailComponent } from './pages/sim-card-detail/sim-card-detail.component';
import { CustomersListComponent } from './pages/customers-list/customers-list.component';
import { TransactionCreateComponent } from './pages/transaction-create/transaction-create.component';
import { SimCardFormComponent } from './pages/sim-card-form/sim-card-form.component';
import { CustomerFormComponent } from './pages/customer-form/customer-form.component';
import { SimTypesListComponent } from './pages/sim-types/sim-types-list.component';
import { SimTypeFormComponent } from './pages/sim-types/sim-type-form.component';
import { UsersListComponent } from './pages/users/users-list.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SimCardDetailComponent,
    CustomersListComponent,
    TransactionCreateComponent,
    SimCardFormComponent,
    CustomerFormComponent,
    SimTypesListComponent,
    SimTypeFormComponent,
    UsersListComponent,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
