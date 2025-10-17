export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string; 
  blocked?: boolean;
}

export interface AdminProduct {
  id: string;
  title: string;
  price: number;
  image?: string;
  description?: string;
  stock?: number;
  category?: string;
}

export interface AdminOrderItem {
  productId: string;
  quantity: number;
  price: number;
  title?: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt?: string;
  items?: AdminOrderItem[];
}

export interface ApiListResponse<T> extends Array<T> {}


