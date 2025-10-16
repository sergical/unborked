import { Product, User, Purchase } from '../types';

// Use environment variable for base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'; // Fallback if not set

// Authentication Services
export const authService = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  register: async (username: string, password: string): Promise<{ message: string; userId: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },
};

// Product Services
export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const productsEndpoint = `${API_BASE_URL}/api/products`;

    console.log(`Fetching products using endpoint: ${productsEndpoint}`);

    const response = await fetch(productsEndpoint);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to get error details
      throw new Error(`Failed to fetch products from ${productsEndpoint}: ${errorData.error || response.statusText}`);
    }

    return response.json();
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return response.json();
  },
};

// Purchase Services
export const purchaseService = {
  createPurchase: async (items: { productId: number; name: string; price: string; quantity: number }[], total: string, token: string): Promise<{ message: string; purchase: Purchase }> => {
    const response = await fetch(`${API_BASE_URL}/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ items, total }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Purchase failed');
    }

    return response.json();
  },

  getPurchaseHistory: async (token: string): Promise<Purchase[]> => {
    const response = await fetch(`${API_BASE_URL}/api/purchases`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase history');
    }

    return response.json();
  },
};