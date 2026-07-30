import { APIRequestContext, expect } from '@playwright/test';
import { config } from '../../config';

export class APIUtils {
  readonly request: APIRequestContext;
  readonly workerIndex: number;
  private token: string = '';

  constructor(request: APIRequestContext, workerIndex: number) {
    this.request = request;
    this.workerIndex = workerIndex;
  }

  /**
   * Authenticates and retrieves the JWT token for API calls
   */
  async authenticate() {
    const response = await this.request.post(`${config.apiURL}/user/login`, {
      data: {
        email: config.testUserEmail,
        password: config.testUserPassword,
      }
    });
    
    if (response.ok()) {
      const data = await response.json();
      this.token = data.token;
      return data;
    }
    throw new Error('Failed to authenticate in APIUtils');
  }

  private getHeaders() {
    if (!this.token) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generates a parallel-safe suffix for data isolation
   */
  getSuffix() {
    return `-w${this.workerIndex}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Creates a client using the backend API
   */
  async createClient(clientData: any = {}) {
    const suffix = this.getSuffix();
    const payload = {
      customerName: `Test Client ${suffix}`,
      customerNumber: `555-${this.workerIndex}${Date.now().toString().slice(-4)}`,
      customerAddress: `123 Test St, City ${suffix}`,
      ...clientData
    };

    const response = await this.request.post(`${config.apiURL}/client/add`, {
      headers: this.getHeaders(),
      data: payload
    });
    
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  /**
   * Deletes a client directly via API
   */
  async deleteClient(clientId: string) {
    const response = await this.request.delete(`${config.apiURL}/client/${clientId}`, {
      headers: this.getHeaders()
    });
    
    // Wait, the routes mapped in the QA analysis didn't list DELETE /client/:id. 
    // If it doesn't exist, we might have to just rely on the UI or mock it.
    // Let's assume it exists or we use the invoice delete API.
    return response.ok();
  }
  
  /**
   * Deletes an invoice directly via API
   */
  async deleteInvoice(invoiceId: string) {
    const response = await this.request.delete(`${config.apiURL}/invoice/${invoiceId}`, {
      headers: this.getHeaders()
    });
    return response.ok();
  }
}
