import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SimCardDetailComponent } from './pages/sim-card-detail/sim-card-detail.component';
import { CustomersListComponent } from './pages/customers-list/customers-list.component';
import { TransactionCreateComponent } from './pages/transaction-create/transaction-create.component';
import { SimTypesListComponent } from './pages/sim-types/sim-types-list.component';
import { SimTypeFormComponent } from './pages/sim-types/sim-type-form.component';
import { SimCardFormComponent } from './pages/sim-card-form/sim-card-form.component';
import { CustomerFormComponent } from './pages/customer-form/customer-form.component';
import { StockInComponent } from './pages/stock-in/stock-in.component';
import { StockOutComponent } from './pages/stock-out/stock-out.component';
import { ImportFileComponent } from './pages/stock-in/import-file.component';
import { ImportSummaryComponent } from './pages/stock-in/import-summary.component';
import { AssignMultipleComponent } from './pages/stock-out/assign-multiple.component';
import { TransactionListComponent } from './pages/transactions/transaction-list.component';
import { TransactionFormComponent } from './pages/transactions/transaction-form.component';
import { LoginComponent } from '../app/login/login.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  { path: 'sim-cards', redirectTo: 'stock-in', pathMatch: 'full' },
  { path: 'sim-cards/new', component: SimCardFormComponent },
  { path: 'sim-cards/:id/edit', component: SimCardFormComponent },
  { path: 'sim-cards/:id', component: SimCardDetailComponent },
  { path: 'customers', component: CustomersListComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'customers/:id/edit', component: CustomerFormComponent },
  { path: 'sim-types', component: SimTypesListComponent },
  { path: 'sim-types/new', component: SimTypeFormComponent },
  { path: 'sim-types/:id/edit', component: SimTypeFormComponent },
  { path: 'stock-in', component: StockInComponent },
  { path: 'stock-in/import', component: ImportFileComponent },
  { path: 'stock-in/import-summary', component: ImportSummaryComponent },
  { path: 'stock-out', component: StockOutComponent },
  { path: 'stock-out/assign-multiple', component: AssignMultipleComponent },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'transactions/new', component: TransactionFormComponent },
  { path: 'transactions/:id/edit', component: TransactionFormComponent },
  { path: 'transactions/create', component: TransactionCreateComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
