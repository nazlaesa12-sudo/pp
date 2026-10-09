import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
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

  return onSnapshot(
    productsRef,
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
          name: data.name || '',
          category: data.category || 'Pembersih & Toner',
          price: Number(data.price) || 0,
          originalPrice: Number(data.originalPrice || data.price) || 0,
          stock: Number(data.stock) || 0,
          rating: Number(data.rating || 5.0),
          soldCount: Number(data.soldCount || 0),
          description: data.description || '',
          ingredients: data.ingredients || '',
          howToUse: data.howToUse || '',
          imageUrl: data.imageUrl || '',
          badge: data.badge || '',
          volume: data.volume || '',
          benefits: Array.isArray(data.benefits) ? data.benefits : [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
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
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

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

/**
 * Create new order, update stock, and update customer profile.
 * IMPORTANT: To strictly satisfy Firestore rules, all transaction reads execute BEFORE any write.
 */
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
  const customerId = params.customerPhone.replace(/[^0-9]/g, '');

  try {
    // Attempt atomic transaction with strictly ordered READS followed by WRITES
    await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST: Read all target products
      const productSnapshots: {
        ref: ReturnType<typeof doc>;
        data: any;
        quantity: number;
      }[] = [];

      for (const item of params.items) {
        if (item.productId) {
          const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
          const snap = await transaction.get(prodRef);
          if (snap.exists()) {
            productSnapshots.push({
              ref: prodRef,
              data: snap.data(),
              quantity: item.quantity,
            });
          }
        }
      }

      // 2. READ customer if present
      let custRef = null;
      let custSnap = null;
      if (customerId) {
        custRef = doc(db, CUSTOMERS_COLLECTION, customerId);
        custSnap = await transaction.get(custRef);
      }

      // 3. NOW ALL WRITES:
      // Deduct stock
      for (const { ref, data, quantity } of productSnapshots) {
        const currentStock = Number(data.stock || 0);
        const currentSold = Number(data.soldCount || 0);
        transaction.update(ref, {
          stock: Math.max(0, currentStock - quantity),
          soldCount: currentSold + quantity,
          updatedAt: now,
        });
      }

      // Write Order
      transaction.set(orderDocRef, newOrderData);

      // Write or Update Customer
      if (custRef && custSnap) {
        if (custSnap.exists()) {
          const cData = custSnap.data();
          transaction.update(custRef, {
            name: params.customerName.trim(),
            email: params.customerEmail.trim() || cData.email,
            address: params.shippingAddress.trim() || cData.address,
            city: params.city.trim() || cData.city,
            totalOrders: Number(cData.totalOrders || 0) + 1,
            totalSpent: Number(cData.totalSpent || 0) + params.totalAmount,
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
  } catch (txErr) {
    console.warn('Transaction failed, falling back to direct write:', txErr);
    // Direct write fallback
    await setDoc(orderDocRef, newOrderData);

    // Update stocks individually
    for (const item of params.items) {
      if (item.productId) {
        try {
          const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
          const snap = await getDoc(prodRef);
          if (snap.exists()) {
            const data = snap.data();
            await updateDoc(prodRef, {
              stock: Math.max(0, Number(data.stock || 0) - item.quantity),
              soldCount: Number(data.soldCount || 0) + item.quantity,
              updatedAt: now,
            });
          }
        } catch (e) {
          console.error('Error updating stock fallback:', e);
        }
      }
    }

    // Update customer individually
    if (customerId) {
      try {
        const custRef = doc(db, CUSTOMERS_COLLECTION, customerId);
        const snap = await getDoc(custRef);
        if (snap.exists()) {
          const cData = snap.data();
          await updateDoc(custRef, {
            name: params.customerName.trim(),
            email: params.customerEmail.trim() || cData.email,
            address: params.shippingAddress.trim() || cData.address,
            city: params.city.trim() || cData.city,
            totalOrders: Number(cData.totalOrders || 0) + 1,
            totalSpent: Number(cData.totalSpent || 0) + params.totalAmount,
            lastOrderDate: now,
          });
        } else {
          await setDoc(custRef, {
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
      } catch (e) {
        console.error('Error updating customer fallback:', e);
      }
    }
  }

  return {
    id: orderDocRef.id,
    ...newOrderData,
  };
}

// Subscribe to real-time orders with client-side sorting (immune to index issues)
export function subscribeOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
) {
  const ordersRef = collection(db, ORDERS_COLLECTION);

  return onSnapshot(
    ordersRef,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        orders.push({
          id: docSnap.id,
          orderNumber: data.orderNumber || docSnap.id,
          customerName: data.customerName || 'Pelanggan',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail || '',
          shippingAddress: data.shippingAddress || '',
          city: data.city || '',
          notes: data.notes || '',
          items: Array.isArray(data.items) ? data.items : [],
          totalItems: Number(data.totalItems || 0),
          subtotal: Number(data.subtotal || 0),
          shippingFee: Number(data.shippingFee || 0),
          discount: Number(data.discount || 0),
          totalAmount: Number(data.totalAmount || 0),
          paymentMethod: data.paymentMethod || 'Transfer Bank',
          status: (data.status as OrderStatus) || 'Menunggu Pembayaran',
          paymentProofUrl: data.paymentProofUrl || '',
          paymentSenderBank: data.paymentSenderBank || '',
          paymentSenderName: data.paymentSenderName || '',
          paymentProofUploadedAt: data.paymentProofUploadedAt || '',
          adminNotes: data.adminNotes || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      // Sort by newest createdAt first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    paymentProofUrl: '',
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
          name: data.name || '',
          phone: data.phone || docSnap.id,
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
