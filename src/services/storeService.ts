import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Order, Customer, OrderStatus, OrderItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';

// ==========================================
// PRODUCTS SERVICE
// ==========================================

// Subscribe to real-time products list and auto-seed if empty
export function subscribeProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(productsRef);

  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed initial 12 products if database is empty
        try {
          await seedInitialProducts();
        } catch (err) {
          console.error('Error auto-seeding products:', err);
        }
        return;
      }

      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        products.push({
          id: docSnap.id,
          name: data.name,
          category: data.category,
          price: Number(data.price),
          originalPrice: Number(data.originalPrice || data.price),
          stock: Number(data.stock),
          rating: Number(data.rating || 5.0),
          soldCount: Number(data.soldCount || 0),
          description: data.description || '',
          ingredients: data.ingredients || '',
          howToUse: data.howToUse || '',
          imageUrl: data.imageUrl || '',
          badge: data.badge || '',
          volume: data.volume || '',
          benefits: data.benefits || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as Product);
      });

      // Sort by category then name
      products.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
      onUpdate(products);
    },
    (error) => {
      console.error('Firestore products snapshot error:', error);
      if (onError) onError(error);
    }
  );
}

// Seed the 12 initial skincare products
export async function seedInitialProducts(): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  for (const item of INITIAL_PRODUCTS) {
    const docRef = doc(collection(db, PRODUCTS_COLLECTION));
    batch.set(docRef, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
}

// Reset products catalog back to initial 12 products
export async function resetCatalogToDefault(): Promise<void> {
  // Delete all existing products
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  // Re-seed
  await seedInitialProducts();
}

// Add new product
export async function addProduct(productData: Omit<Product, 'id'>): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

// Update existing product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(productRef, {
    ...productData,
    updatedAt: new Date().toISOString(),
  });
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(productRef);
}

// Quick stock update
export async function updateProductStock(id: string, newStock: number): Promise<void> {
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(productRef, {
    stock: Math.max(0, newStock),
    updatedAt: new Date().toISOString(),
  });
}

// ==========================================
// ORDERS SERVICE
// ==========================================

export interface CreateOrderParams {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
}

// Create new order, update stock, and update customer profile atomically
export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const orderNumber = `NZL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const newOrderData: Omit<Order, 'id'> = {
    orderNumber,
    customerName: params.customerName.trim(),
    customerPhone: params.customerPhone.trim(),
    customerEmail: params.customerEmail.trim(),
    shippingAddress: params.shippingAddress.trim(),
    city: params.city.trim(),
    notes: params.notes?.trim() || '',
    items: params.items,
    totalItems: params.items.reduce((acc, it) => acc + it.quantity, 0),
    subtotal: params.subtotal,
    shippingFee: params.shippingFee,
    discount: params.discount,
    totalAmount: params.totalAmount,
    paymentMethod: params.paymentMethod,
    status: 'Menunggu Pembayaran',
    createdAt: now,
    updatedAt: now,
  };

  const orderDocRef = doc(collection(db, ORDERS_COLLECTION));

  await runTransaction(db, async (transaction) => {
    // 1. Check & deduct stocks for each ordered product
    for (const item of params.items) {
      const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const prodDoc = await transaction.get(prodRef);
      if (prodDoc.exists()) {
        const currentStock = Number(prodDoc.data().stock || 0);
        const currentSold = Number(prodDoc.data().soldCount || 0);
        const nextStock = Math.max(0, currentStock - item.quantity);
        const nextSold = currentSold + item.quantity;
        transaction.update(prodRef, {
          stock: nextStock,
          soldCount: nextSold,
          updatedAt: now,
        });
      }
    }

    // 2. Save the order document
    transaction.set(orderDocRef, newOrderData);

    // 3. Update or create customer record
    // Use sanitized phone as document ID for easy lookup
    const customerId = params.customerPhone.replace(/[^0-9]/g, '');
    if (customerId) {
      const custRef = doc(db, CUSTOMERS_COLLECTION, customerId);
      const custDoc = await transaction.get(custRef);
      if (custDoc.exists()) {
        const custData = custDoc.data();
        transaction.update(custRef, {
          name: params.customerName.trim(),
          email: params.customerEmail.trim() || custData.email,
          address: params.shippingAddress.trim() || custData.address,
          city: params.city.trim() || custData.city,
          totalOrders: Number(custData.totalOrders || 0) + 1,
          totalSpent: Number(custData.totalSpent || 0) + params.totalAmount,
          lastOrderDate: now,
        });
      } else {
        transaction.set(custRef, {
          id: customerId,
          name: params.customerName.trim(),
          phone: params.customerPhone.trim(),
          email: params.customerEmail.trim(),
          address: params.shippingAddress.trim(),
          city: params.city.trim(),
          totalOrders: 1,
          totalSpent: params.totalAmount,
          lastOrderDate: now,
          createdAt: now,
        });
      }
    }
  });

  return {
    id: orderDocRef.id,
    ...newOrderData,
  };
}

// Subscribe to real-time orders
export function subscribeOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
) {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        orders.push({
          id: docSnap.id,
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          shippingAddress: data.shippingAddress,
          city: data.city,
          notes: data.notes,
          items: data.items || [],
          totalItems: Number(data.totalItems || 0),
          subtotal: Number(data.subtotal || 0),
          shippingFee: Number(data.shippingFee || 0),
          discount: Number(data.discount || 0),
          totalAmount: Number(data.totalAmount || 0),
          paymentMethod: data.paymentMethod,
          status: data.status as OrderStatus,
          paymentProofUrl: data.paymentProofUrl,
          paymentSenderBank: data.paymentSenderBank,
          paymentSenderName: data.paymentSenderName,
          paymentProofUploadedAt: data.paymentProofUploadedAt,
          adminNotes: data.adminNotes,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      onUpdate(orders);
    },
    (error) => {
      console.error('Firestore orders snapshot error:', error);
      if (onError) onError(error);
    }
  );
}

// Upload customer payment proof
export async function uploadOrderPaymentProof(
  orderId: string,
  proof: {
    paymentProofUrl: string;
    paymentSenderBank: string;
    paymentSenderName: string;
  }
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const now = new Date().toISOString();
  await updateDoc(orderRef, {
    paymentProofUrl: proof.paymentProofUrl,
    paymentSenderBank: proof.paymentSenderBank,
    paymentSenderName: proof.paymentSenderName,
    paymentProofUploadedAt: now,
    status: 'Menunggu Verifikasi',
    updatedAt: now,
  });
}

// Admin approve payment proof
export async function approvePaymentProof(orderId: string, adminNotes?: string): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const now = new Date().toISOString();
  await updateDoc(orderRef, {
    status: 'Diproses',
    adminNotes: adminNotes || 'Bukti pembayaran telah diverifikasi & disetujui admin 🎀',
    updatedAt: now,
  });
}

// Admin reject payment proof
export async function rejectPaymentProof(orderId: string, reason: string): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const now = new Date().toISOString();
  await updateDoc(orderRef, {
    status: 'Menunggu Pembayaran',
    adminNotes: `Bukti transfer ditolak: ${reason}`,
    paymentProofUrl: '', // Reset proof so customer can re-upload
    updatedAt: now,
  });
}

// Update order status directly
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminNotes?: string
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const payload: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (adminNotes !== undefined) {
    payload.adminNotes = adminNotes;
  }
  await updateDoc(orderRef, payload);
}

// ==========================================
// CUSTOMERS SERVICE
// ==========================================

// Subscribe to real-time customers list
export function subscribeCustomers(
  onUpdate: (customers: Customer[]) => void,
  onError?: (error: Error) => void
) {
  const custRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    custRef,
    (snapshot) => {
      const customers: Customer[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        customers.push({
          id: docSnap.id,
          name: data.name,
          phone: data.phone,
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          totalOrders: Number(data.totalOrders || 0),
          totalSpent: Number(data.totalSpent || 0),
          lastOrderDate: data.lastOrderDate || '',
          createdAt: data.createdAt || '',
        });
      });
      customers.sort((a, b) => b.totalSpent - a.totalSpent);
      onUpdate(customers);
    },
    (error) => {
      console.error('Firestore customers snapshot error:', error);
      if (onError) onError(error);
    }
  );
}
