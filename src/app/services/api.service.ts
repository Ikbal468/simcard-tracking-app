import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SimType {
  id?: number;
  name?: string;
  // add other fields if present on the backend
}

const API_BASE = 'http://localhost:3000/api'; // <-- backend uses /api prefix

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getSimCards(): Observable<any> {
    return this.http.get(`${API_BASE}/simCards`);
  }

  getSimCard(id: string): Observable<any> {
    return this.http.get(`${API_BASE}/simCards/${id}`);
  }

  createSimCard(payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/simCards`, payload);
  }

  updateSimCard(id: string, payload: any): Observable<any> {
    return this.http.patch(`${API_BASE}/simCards/${id}`, payload);
  }

  deleteSimCard(id: string): Observable<any> {
    return this.http.delete(`${API_BASE}/simCards/${id}`);
  }

  changeSimCustomer(
    id: number | string,
    payload: { customerId: number | null },
  ): Observable<any> {
    return this.http.patch(
      `${API_BASE}/simCards/${id}/change-customer`,
      payload,
    );
  }

  // bulk import via file upload
  importSimCards(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${API_BASE}/simCards/import`, fd);
  }

  paginateSimCards(payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/simCards/paginate`, payload);
  }

  getSimCardsSummary(): Observable<any> {
    return this.http.get(`${API_BASE}/simCards/summary`);
  }

  getCustomers(): Observable<any> {
    return this.http.get(`${API_BASE}/customers`);
  }

  getCustomer(id: string): Observable<any> {
    return this.http.get(`${API_BASE}/customers/${id}`);
  }

  createCustomer(payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/customers`, payload);
  }

  updateCustomer(id: string, payload: any): Observable<any> {
    return this.http.patch(`${API_BASE}/customers/${id}`, payload);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${API_BASE}/customers/${id}`);
  }

  createTransaction(payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/transactions`, payload);
  }

  getTransactions(): Observable<any> {
    return this.http.get(`${API_BASE}/transactions`);
  }

  getTransaction(id: string): Observable<any> {
    return this.http.get(`${API_BASE}/transactions/${id}`);
  }

  updateTransaction(id: string, payload: any): Observable<any> {
    return this.http.patch(`${API_BASE}/transactions/${id}`, payload);
  }

  searchTransactions(payload: any): Observable<any> {
    return this.http.post(`${API_BASE}/transactions/search`, payload);
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete(`${API_BASE}/transactions/${id}`);
  }

  getTransactionsReportByCustomer(customerId: string): Observable<any> {
    return this.http.get(
      `${API_BASE}/transactions/customer/${customerId}/report`,
    );
  }

  /* sim types */
  getSimTypes(): Observable<any> {
    return this.http.get<SimType[]>(`${API_BASE}/simTypes`);
  }

  getSimType(id: string): Observable<any> {
    return this.http.get<SimType>(`${API_BASE}/simTypes/${id}`);
  }

  createSimType(payload: any): Observable<any> {
    return this.http.post<SimType>(`${API_BASE}/simTypes`, payload);
  }

  updateSimType(id: string, payload: any): Observable<any> {
    return this.http.patch<SimType>(`${API_BASE}/simTypes/${id}`, payload);
  }

  deleteSimType(id: string): Observable<any> {
    return this.http.delete<{ deleted?: boolean }>(
      `${API_BASE}/simTypes/${id}`,
    );
  }

  // auth
  login(payload: { username: string; password: string }): Observable<any> {
    return this.http.post(`${API_BASE}/auth/login`, payload);
  }
}
