import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  Ribbon,
} from 'lucide-react';
import { Product, CartItem, Order, Customer, ProductCategory } from './types';
import {
  subscribeProducts,
  subscribeOrders,
  subscribeCustomers,
} from './services/storeService';
import { testConnection } from './firebase';
import { Navbar, CATEGORIES } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { RibbonBow, RibbonDivider } from './components/RibbonDecoration';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';

export default function App() {
  // Database State (Single Source of Truth)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nazla_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nazla_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // UI Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels State
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
  const [recentOrderSuccess, setRecentOrderSuccess] = useState<Order | null>(null);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [trackerInitialOrderNum, setTrackerInitialOrderNum] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('nazla_admin_email') || '';
  });

  // 1. Subscribe to Firestore Real-Time Data
  useEffect(() => {
    testConnection();

    // Subscribe to products
    const unsubscribeProducts = subscribeProducts(
      (items) => {
        setProducts(items);
        setIsLoadingDB(false);
      },
      (err) => {
        console.error('Products subscription failed:', err);
        setDbError('Menghubungkan ke database...');
      }
    );

    // Subscribe to orders
    const unsubscribeOrders = subscribeOrders(
      (ordList) => {
        setOrders(ordList);
      },
      (err) => {
        console.error('Orders subscription failed:', err);
      }
    );

    // Subscribe to customers
    const unsubscribeCustomers = subscribeCustomers(
      (custList) => {
        setCustomers(custList);
      },
      (err) => {
        console.error('Customers subscription failed:', err);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeCustomers();
    };
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.product.id === product.id
            ? { ...it, quantity: Math.min(product.stock, it.quantity + quantity) }
            : it
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.product.id === productId) {
            const nextQ = it.quantity + delta;
            return { ...it, quantity: Math.min(it.product.stock, Math.max(0, nextQ)) };
          }
          return it;
        })
        .filter((it) => it.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleProceedCheckout = (discountAmount: number, code: string) => {
    setCheckoutDiscount(discountAmount);
    setAppliedVoucherCode(code);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCreated = (order: Order) => {
    setCartItems([]);
    setRecentOrderSuccess(order);
  };

  // Admin login handling
  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    localStorage.setItem('nazla_admin_email', email);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    setAdminEmail('');
    localStorage.removeItem('nazla_admin_email');
    setIsAdminDashboardOpen(false);
  };

  const handleOpenAdmin = () => {
    if (adminEmail) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Filtered Products for Display
  const filteredProducts = products.filter((prod) => {
    const matchesCat =
      selectedCategory === 'ALL' || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.benefits &&
        prod.benefits.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const cartTotalCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, it) => acc + it.product.price * it.quantity,
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50/50 via-white to-pink-50/40 text-slate-800">
      {/* Navigation Bar */}
      <Navbar
        cartCount={cartTotalCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenOrderTracker={() => {
          setTrackerInitialOrderNum('');
          setIsOrderTrackerOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isAdminLoggedIn={!!adminEmail}
      />

      {/* Main Showcase Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Hero Promotion Banner */}
        <HeroBanner
          onExploreClick={() => {
            const el = document.getElementById('product-catalog');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Database Loading Indicator */}
        {isLoadingDB && products.length === 0 && (
          <div className="my-16 text-center py-12 bg-white rounded-3xl border border-pink-100 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-100 mx-auto flex items-center justify-center text-pink-600 animate-spin">
              <RibbonBow className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 font-serif text-lg">
                Memuat Katalog Skincare dari Real Database 🎀
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Menyinkronkan 12 produk skincare terpercaya di Firestore...
              </p>
            </div>
          </div>
        )}

        {/* Product Catalog Section */}
        <section id="product-catalog" className="mt-8 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-pink-200">
            <div>
              <div className="flex items-center space-x-2 text-pink-600 text-xs font-bold uppercase tracking-wider mb-1">
                <RibbonBow className="w-4 h-4 text-pink-500" />
                <span>Koleksi Pilihan Nazla</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                {selectedCategory === 'ALL'
                  ? 'Semua Produk Skincare (12 Formula)'
                  : selectedCategory}
              </h2>
            </div>

            {/* Quick Category Tabs count */}
            <div className="flex items-center space-x-2 text-xs text-pink-700 bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>
                Menampilkan <strong>{filteredProducts.length}</strong> produk siap kirim
              </span>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 && !isLoadingDB ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-pink-200 space-y-3">
              <div className="w-14 h-14 rounded-full bg-pink-50 mx-auto flex items-center justify-center">
                <RibbonBow className="w-8 h-8 text-pink-400" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Tidak Ada Produk yang Cocok</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian lain atau pilih kategori &quot;Semua Produk&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Reset Pencarian 🎀
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onViewDetail={(p) => setSelectedProductDetail(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Decorative Divider */}
        <RibbonDivider text="NAZLA SKINMART OFFICIAL 🎀" />

        {/* Coquette Benefits Ribbon Strip */}
        <section className="bg-gradient-to-r from-pink-100/70 via-rose-50/80 to-pink-100/70 rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center border border-pink-200">
                <RibbonBow className="w-7 h-7 text-pink-500" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm font-serif">100% Aman & Terdaftar</h4>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Semua bahan diformulasikan aman untuk kulit sensitif, bebas merkuri, dan bebas alkohol berbahaya.
              </p>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center border border-pink-200">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm font-serif">Packaging Cantik & Aman</h4>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Setiap paket dikemas dengan kardus tebal, bubble wrap gratis, dan hiasan pita pink yang memanjakan mata.
              </p>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center border border-pink-200">
                <CheckCircle className="w-6 h-6 text-pink-500" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm font-serif">Approval Pembayaran Cepat</h4>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Kirim foto bukti transfer bank / QRIS dan pesananmu langsung diproses oleh admin kami.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={handleOpenAdmin}
        onOpenOrderTracker={() => {
          setTrackerInitialOrderNum('');
          setIsOrderTrackerOpen(true);
        }}
      />

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedCheckout={handleProceedCheckout}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        discountAmount={checkoutDiscount}
        appliedVoucherCode={appliedVoucherCode}
        onOrderCreated={handleOrderCreated}
      />

      {/* 4. Order Success Modal with Instant Proof Upload */}
      <OrderSuccessModal
        order={recentOrderSuccess}
        onClose={() => setRecentOrderSuccess(null)}
        onViewOrderTracker={(orderNum) => {
          setTrackerInitialOrderNum(orderNum);
          setIsOrderTrackerOpen(true);
        }}
      />

      {/* 5. Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        orders={orders}
        initialOrderNumber={trackerInitialOrderNum}
      />

      {/* 6. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 7. Full Admin Management Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={products}
        orders={orders}
        customers={customers}
        adminEmail={adminEmail}
        onLogout={handleAdminLogout}
      />
    </div>
  );
}
