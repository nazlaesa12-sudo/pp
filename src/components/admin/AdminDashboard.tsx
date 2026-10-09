import React, { useState } from 'react';
import {
  X,
  Package,
  ShoppingBag,
  Users,
  CheckCircle,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Search,
  Check,
  AlertTriangle,
  Eye,
  FileDown,
  Printer,
  MessageCircle,
  ExternalLink,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Product, Order, Customer, OrderStatus, ProductCategory } from '../../types';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  resetCatalogToDefault,
  updateOrderStatus,
  approvePaymentProof,
  rejectPaymentProof,
} from '../../services/storeService';
import { RibbonBow } from '../RibbonDecoration';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  adminEmail: string;
  onLogout: () => void;
}

type AdminTab = 'products' | 'orders' | 'customers' | 'approval' | 'reports';

export function AdminDashboard({
  isOpen,
  onClose,
  products,
  orders,
  customers,
  adminEmail,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Modals inside Admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [zoomProofUrl, setZoomProofUrl] = useState<string | null>(null);
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState<{ orderId: string; show: boolean }>({
    orderId: '',
    show: false,
  });
  const [rejectReasonText, setRejectReasonText] = useState('');

  // Form State for Add / Edit Product
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pembersih & Toner' as ProductCategory,
    price: 99000,
    originalPrice: 129000,
    stock: 25,
    volume: '100 ml',
    badge: 'Spesial 🎀',
    description: '',
    ingredients: '',
    howToUse: '',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
    benefits: 'Tanpa Alkohol, Mencerahkan',
  });

  if (!isOpen) return null;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // ==========================================
  // TAB 1: PRODUCT HANDLERS
  // ==========================================
  const handleOpenAddProduct = () => {
    setFormData({
      name: '',
      category: 'Pembersih & Toner',
      price: 99000,
      originalPrice: 129000,
      stock: 25,
      volume: '100 ml',
      badge: 'Baru 🎀',
      description: '',
      ingredients: '',
      howToUse: '',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
      benefits: 'Mencerahkan, Menutrisi',
    });
    setEditingProduct(null);
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice,
      stock: prod.stock,
      volume: prod.volume || '100 ml',
      badge: prod.badge || '',
      description: prod.description || '',
      ingredients: prod.ingredients || '',
      howToUse: prod.howToUse || '',
      imageUrl: prod.imageUrl || '',
      benefits: prod.benefits ? prod.benefits.join(', ') : '',
    });
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const benefitsArray = formData.benefits
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice),
          stock: Number(formData.stock),
          volume: formData.volume,
          badge: formData.badge,
          description: formData.description,
          ingredients: formData.ingredients,
          howToUse: formData.howToUse,
          imageUrl: formData.imageUrl,
          benefits: benefitsArray,
        });
      } else {
        await addProduct({
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice),
          stock: Number(formData.stock),
          rating: 5.0,
          soldCount: 0,
          volume: formData.volume,
          badge: formData.badge,
          description: formData.description,
          ingredients: formData.ingredients,
          howToUse: formData.howToUse,
          imageUrl: formData.imageUrl,
          benefits: benefitsArray,
        });
      }
      setIsAddProductOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan produk ke Firestore.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus produk "${name}" dari database?`)) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus produk.');
      }
    }
  };

  const handleResetCatalog = async () => {
    if (
      confirm(
        'Apakah Anda ingin me-reset katalog kembali ke 12 produk skincare bawaan Nazla Skinmart?'
      )
    ) {
      try {
        await resetCatalogToDefault();
        alert('Katalog 12 produk berhasil di-reset di database Firestore! 🎀');
      } catch (err) {
        console.error(err);
        alert('Gagal me-reset katalog.');
      }
    }
  };

  const handleQuickStock = async (id: string, currentStock: number, delta: number) => {
    try {
      await updateProductStock(id, Math.max(0, currentStock + delta));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCat = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  // Pending verification orders for Approval tab
  const pendingApprovals = orders.filter(
    (o) => o.status === 'Menunggu Verifikasi' || (o.paymentProofUrl && o.status === 'Menunggu Pembayaran')
  );

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Menunggu Pembayaran':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Menunggu Verifikasi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Diproses':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Dikirim':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Dibatalkan':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // ==========================================
  // TAB 4: APPROVAL HANDLERS
  // ==========================================
  const handleApproveProof = async (orderId: string) => {
    try {
      await approvePaymentProof(orderId);
      alert('Bukti pembayaran telah disetujui! Status pesanan berubah menjadi Diproses 🎀');
    } catch (err) {
      console.error(err);
      alert('Gagal menyetujui bukti pembayaran.');
    }
  };

  const handleOpenRejectPrompt = (orderId: string) => {
    setRejectReasonPrompt({ orderId, show: true });
    setRejectReasonText('Nominal transfer tidak sesuai / Bukti tidak jelas');
  };

  const handleConfirmReject = async () => {
    if (!rejectReasonPrompt.orderId) return;
    try {
      await rejectPaymentProof(rejectReasonPrompt.orderId, rejectReasonText || 'Bukti transfer tidak valid');
      setRejectReasonPrompt({ orderId: '', show: false });
      alert('Bukti transfer telah ditolak. Pelanggan dapat mengunggah kembali.');
    } catch (err) {
      console.error(err);
      alert('Gagal menolak bukti pembayaran.');
    }
  };

  // ==========================================
  // TAB 5: SALES REPORT METRICS
  // ==========================================
  const completedOrders = orders.filter((o) => o.status === 'Selesai' || o.status === 'Diproses' || o.status === 'Dikirim');
  const grossRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItemsSold = completedOrders.reduce((sum, o) => sum + o.totalItems, 0);
  const averageOrderValue = completedOrders.length > 0 ? Math.round(grossRevenue / completedOrders.length) : 0;

  // Category breakdown
  const categorySalesMap: Record<string, number> = {
    'Pembersih & Toner': 0,
    'Serum & Treatment': 0,
    'Moisturizer & Sunscreen': 0,
  };
  completedOrders.forEach((o) => {
    o.items.forEach((it) => {
      const cat = it.category || 'Serum & Treatment';
      if (categorySalesMap[cat] !== undefined) {
        categorySalesMap[cat] += it.price * it.quantity;
      }
    });
  });

  // Top products
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  completedOrders.forEach((o) => {
    o.items.forEach((it) => {
      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = { name: it.name, qty: 0, revenue: 0 };
      }
      productSalesMap[it.productId].qty += it.quantity;
      productSalesMap[it.productId].revenue += it.price * it.quantity;
    });
  });
  const topProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const handleExportCSV = () => {
    const headers = 'Order Number,Tanggal,Pelanggan,WhatsApp,Total,Status,Metode\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.orderNumber}","${new Date(o.createdAt).toLocaleDateString()}","${o.customerName}","${o.customerPhone}",${o.totalAmount},"${o.status}","${o.paymentMethod}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-penjualan-nazla-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-6xl w-full h-[92vh] overflow-hidden shadow-2xl border-2 border-pink-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Admin Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/40">
              <RibbonBow className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg sm:text-xl font-serif">
                  Panel Manajemen Nazla Skinmart
                </h3>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/30">
                  Real Firestore DB
                </span>
              </div>
              <p className="text-xs text-pink-100">
                Login sebagai: <strong className="text-white">{adminEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-pink-100 hover:text-white rounded-xl text-xs font-semibold transition-colors border border-white/20"
            >
              Keluar Admin
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-pink-50/70 border-b border-pink-200 px-6 py-2.5 flex items-center space-x-2 overflow-x-auto flex-shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-300'
                : 'text-slate-700 hover:bg-pink-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>1. Data Produk & Stok ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-300'
                : 'text-slate-700 hover:bg-pink-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>2. Data Order & Riwayat ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-300'
                : 'text-slate-700 hover:bg-pink-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Data Pelanggan ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approval')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'approval'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-300'
                : 'text-slate-700 hover:bg-pink-100'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>4. Approval Bukti Pembayaran</span>
            {pendingApprovals.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-300'
                : 'text-slate-700 hover:bg-pink-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>5. Laporan Sales & Omset</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* ========================================================= */}
          {/* TAB 1: DATA PRODUK DAN STOK */}
          {/* ========================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Cari produk / bahan..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                    />
                    <Search className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-2.5" />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-pink-200 rounded-xl bg-white font-medium"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Pembersih & Toner">Pembersih & Toner</option>
                    <option value="Serum & Treatment">Serum & Treatment</option>
                    <option value="Moisturizer & Sunscreen">Moisturizer & Sunscreen</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleResetCatalog}
                    className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-bold border border-pink-200 transition-colors flex items-center space-x-1"
                    title="Kembalikan ke 12 produk default"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-pink-600" />
                    <span>Reset 12 Produk</span>
                  </button>

                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-200 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk Baru</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-pink-100 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-pink-50/70 border-b border-pink-100 text-pink-900 font-bold">
                      <tr>
                        <th className="p-3">Foto & Nama Produk</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Harga</th>
                        <th className="p-3">Stok Aktual</th>
                        <th className="p-3">Terjual</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover bg-pink-50 border border-pink-100 flex-shrink-0"
                              />
                              <div>
                                <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                <span className="text-[10px] text-pink-600 font-medium">
                                  {p.volume} • {p.badge || 'Skincare'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 font-semibold border border-pink-100">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            {formatIDR(p.price)}
                            {p.originalPrice > p.price && (
                              <span className="block text-[10px] text-slate-400 line-through">
                                {formatIDR(p.originalPrice)}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleQuickStock(p.id, p.stock, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-pink-100 text-slate-700 font-bold"
                              >
                                -
                              </button>
                              <span
                                className={`w-8 text-center font-bold ${
                                  p.stock <= 5 ? 'text-red-500' : 'text-slate-800'
                                }`}
                              >
                                {p.stock}
                              </span>
                              <button
                                onClick={() => handleQuickStock(p.id, p.stock, 5)}
                                className="px-1.5 h-6 rounded bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-[10px]"
                                title="+5 Stok"
                              >
                                +5
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{p.soldCount} pcs</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                title="Edit Produk"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DATA ORDER DAN RIWAYAT */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Cari No Order, Nama, No HP..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                    />
                    <Search className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-2.5" />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-pink-200 rounded-xl bg-white font-medium"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Dikirim">Dikirim</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500">
                  Total {filteredOrders.length} Pesanan Tercatat
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-pink-100 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-pink-50/70 border-b border-pink-100 text-pink-900 font-bold">
                      <tr>
                        <th className="p-3">No. Order & Waktu</th>
                        <th className="p-3">Pelanggan & WhatsApp</th>
                        <th className="p-3">Total Belanja</th>
                        <th className="p-3">Status Saat Ini</th>
                        <th className="p-3">Bukti Bayar</th>
                        <th className="p-3 text-right">Ubah Status / Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            Tidak ada pesanan ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-pink-50/30 transition-colors">
                            <td className="p-3">
                              <span className="font-mono font-bold text-pink-700 block">
                                {ord.orderNumber}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(ord.createdAt).toLocaleString('id-ID')}
                              </span>
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{ord.customerName}</p>
                              <a
                                href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:underline text-[11px] font-medium inline-flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" /> {ord.customerPhone}
                              </a>
                            </td>
                            <td className="p-3 font-serif font-bold text-slate-800">
                              {formatIDR(ord.totalAmount)}
                              <span className="block text-[10px] text-slate-400 font-sans font-normal">
                                {ord.items.length} jenis item
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                                  ord.status
                                )}`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {ord.paymentProofUrl ? (
                                <button
                                  onClick={() => setZoomProofUrl(ord.paymentProofUrl!)}
                                  className="text-pink-600 hover:text-pink-800 font-bold text-[11px] flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-md border border-pink-200"
                                >
                                  <Eye className="w-3 h-3" /> Lihat Bukti
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">Belum ada</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <select
                                  value={ord.status}
                                  onChange={(e) =>
                                    updateOrderStatus(ord.id, e.target.value as OrderStatus)
                                  }
                                  className="px-2 py-1 text-xs border border-pink-200 rounded-lg bg-white font-medium focus:ring-1 focus:ring-pink-400"
                                >
                                  <option value="Menunggu Pembayaran">Menunggu Bayar</option>
                                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                                  <option value="Diproses">Diproses</option>
                                  <option value="Dikirim">Dikirim</option>
                                  <option value="Selesai">Selesai</option>
                                  <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                                <button
                                  onClick={() => setSelectedOrderForDetail(ord)}
                                  className="px-2.5 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Nota
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: DATA PELANGGAN */}
          {/* ========================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Basis Data Pelanggan Nazla Skinmart
                  </h4>
                  <p className="text-xs text-slate-500">
                    Total {customers.length} pembeli terdata dari transaksi toko
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-pink-100 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-pink-50/70 border-b border-pink-100 text-pink-900 font-bold">
                      <tr>
                        <th className="p-3">Nama Pelanggan</th>
                        <th className="p-3">WhatsApp / Telepon</th>
                        <th className="p-3">Kota / Alamat</th>
                        <th className="p-3">Frekuensi Order</th>
                        <th className="p-3">Total Belanja (LTV)</th>
                        <th className="p-3">Status Loyalitas</th>
                        <th className="p-3 text-right">Hubungi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400">
                            Belum ada data pelanggan yang tersimpan.
                          </td>
                        </tr>
                      ) : (
                        customers.map((c) => (
                          <tr key={c.id} className="hover:bg-pink-50/30 transition-colors">
                            <td className="p-3 font-bold text-slate-800">{c.name}</td>
                            <td className="p-3 text-slate-600 font-mono">{c.phone}</td>
                            <td className="p-3 text-slate-600 max-w-xs truncate">
                              {c.city || c.address}
                            </td>
                            <td className="p-3 font-semibold text-slate-800">
                              {c.totalOrders} kali
                            </td>
                            <td className="p-3 font-serif font-bold text-pink-600">
                              {formatIDR(c.totalSpent)}
                            </td>
                            <td className="p-3">
                              {c.totalSpent >= 500000 ? (
                                <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-rose-200">
                                  VIP Gold 🎀
                                </span>
                              ) : c.totalOrders > 1 ? (
                                <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-pink-200">
                                  Member Setia
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                                  Pelanggan Baru
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Halo Kak ${c.name} 🎀 Terima kasih telah berbelanja di Nazla Skinmart!`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold border border-emerald-200 inline-flex items-center gap-1.5 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: APPROVAL BUKTI PEMBAYARAN */}
          {/* ========================================================= */}
          {activeTab === 'approval' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Antrian Verifikasi Bukti Pembayaran ({pendingApprovals.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Periksa struk transfer rekening / QRIS dan tentukan persetujuan
                  </p>
                </div>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-pink-100 space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h5 className="font-bold text-slate-800">Semua Bukti Telah Diverifikasi! 🎀</h5>
                  <p className="text-xs text-slate-500">
                    Tidak ada antrian persetujuan pembayaran yang tertunda saat ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingApprovals.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl p-5 border-2 border-pink-200 shadow-sm space-y-4"
                    >
                      {/* Order info */}
                      <div className="flex items-start justify-between border-b border-pink-100 pb-3">
                        <div>
                          <span className="font-mono text-sm font-extrabold text-pink-600 block">
                            {ord.orderNumber}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5">
                            {ord.customerName} ({ord.customerPhone})
                          </p>
                          <span className="text-[11px] text-slate-500">
                            Metode: {ord.paymentMethod}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Nominal Tagihan:</span>
                          <span className="font-serif font-extrabold text-pink-600 text-base">
                            {formatIDR(ord.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Payment proof image & bank info */}
                      <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 flex items-center space-x-3">
                        {ord.paymentProofUrl ? (
                          <div
                            onClick={() => setZoomProofUrl(ord.paymentProofUrl!)}
                            className="relative w-24 h-24 rounded-lg overflow-hidden bg-black/10 cursor-pointer flex-shrink-0 group"
                          >
                            <img
                              src={ord.paymentProofUrl}
                              alt="Bukti Transfer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-[10px] font-bold">
                              Zoom
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-pink-100 flex items-center justify-center text-pink-400 text-xs text-center p-2">
                            Tanpa Foto
                          </div>
                        )}

                        <div className="text-xs space-y-1">
                          <p className="font-bold text-slate-800">
                            Bank Pengirim: <span className="text-pink-600">{ord.paymentSenderBank || '-'}</span>
                          </p>
                          <p className="text-slate-600">
                            Nama Pengirim: <strong className="text-slate-800">{ord.paymentSenderName || '-'}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Waktu Upload:{' '}
                            {ord.paymentProofUploadedAt
                              ? new Date(ord.paymentProofUploadedAt).toLocaleTimeString('id-ID')
                              : '-'}
                          </p>
                          {ord.paymentProofUrl && (
                            <button
                              type="button"
                              onClick={() => setZoomProofUrl(ord.paymentProofUrl!)}
                              className="text-pink-600 hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Pratinjau Bukti Penuh
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleOpenRejectPrompt(ord.id)}
                          className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs border border-red-200 transition-colors"
                        >
                          Tolak Bukti ❌
                        </button>
                        <button
                          onClick={() => handleApproveProof(ord.id)}
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Setujui (Approve) ✅</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: LAPORAN SALES */}
          {/* ========================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Gross Omset</span>
                    <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-xl font-extrabold text-pink-600 font-serif mt-2">
                    {formatIDR(grossRevenue)}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Total transaksi berhasil</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Pesanan Sukses</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-800 mt-2">
                    {completedOrders.length} Pesanan
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Status Diproses, Kirim & Selesai</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Produk Terjual</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-800 mt-2">
                    {totalItemsSold} Pcs
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Item skincare keluar gudang</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase">Rata-rata Order (AOV)</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-800 font-serif mt-2">
                    {formatIDR(averageOrderValue)}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Nilai keranjang rata-rata</p>
                </div>
              </div>

              {/* Category Breakdown & Top Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Visual Category Sales Progress */}
                <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Distribusi Omset per Kategori Skincare 🎀
                    </h5>
                    <Layers className="w-4 h-4 text-pink-400" />
                  </div>

                  <div className="space-y-3 text-xs">
                    {Object.entries(categorySalesMap).map(([cat, val]) => {
                      const pct = grossRevenue > 0 ? Math.round((val / grossRevenue) * 100) : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-700">{cat}</span>
                            <span className="text-pink-600">
                              {formatIDR(val)} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top 5 Products Table */}
                <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-2xs space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    5 Produk Terlaris (Top Selling)
                  </h5>

                  {topProducts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">
                      Belum ada penjualan untuk dikalkulasi.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {topProducts.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-pink-50 last:border-0"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-xs">
                              {p.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-800 block">{p.qty} pcs</span>
                            <span className="text-[10px] text-pink-600 font-serif">
                              {formatIDR(p.revenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Export Actions */}
              <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <RibbonBow className="w-5 h-5 text-pink-500" />
                  <span className="text-xs font-bold text-pink-900">
                    Ekspor Laporan Penjualan Lengkap
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-white hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-bold border border-pink-300 transition-colors flex items-center space-x-1.5 shadow-2xs"
                  >
                    <FileDown className="w-4 h-4 text-pink-600" />
                    <span>Download Spreadsheet (.CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SUB-MODAL 1: ADD / EDIT PRODUCT */}
        {/* ========================================================= */}
        {isAddProductOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 border-2 border-pink-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <h4 className="font-bold text-base text-slate-800 font-serif">
                  {editingProduct ? 'Edit Data Produk Skincare' : 'Tambah Produk Skincare Baru 🎀'}
                </h4>
                <button
                  onClick={() => setIsAddProductOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Produk:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kategori:</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as ProductCategory })
                      }
                      className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                    >
                      <option value="Pembersih & Toner">Pembersih & Toner</option>
                      <option value="Serum & Treatment">Serum & Treatment</option>
                      <option value="Moisturizer & Sunscreen">Moisturizer & Sunscreen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Volume/Netto:</label>
                    <input
                      type="text"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      placeholder="Contoh: 30 ml"
                      className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp):</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 border border-pink-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Harga Coret (Rp):</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-2 border border-pink-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Stok:</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 border border-pink-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL Gambar Produk:</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge Pita:</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Contoh: Best Seller 🎀"
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi:</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kandungan Utama:</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cara Pemakaian:</label>
                  <input
                    type="text"
                    value={formData.howToUse}
                    onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-md"
                  >
                    Simpan ke Database
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL 2: NOTA INVOICE PREVIEW */}
        {/* ========================================================= */}
        {selectedOrderForDetail && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-2 border-pink-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div className="flex items-center space-x-2">
                  <RibbonBow className="w-5 h-5 text-pink-500" />
                  <h4 className="font-bold text-base text-slate-800 font-serif">
                    Nota Resmi Nazla Skinmart
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs space-y-3 font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-center pb-2 border-b border-dashed border-slate-300">
                  <p className="font-extrabold text-sm text-pink-600">NAZLA SKINMART OFFICIAL</p>
                  <p className="text-[10px] text-slate-500">Instagram: @nazlaskinmart • WA: 081234567890</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <p>No: {selectedOrderForDetail.orderNumber}</p>
                  <p>Tgl: {new Date(selectedOrderForDetail.createdAt).toLocaleString('id-ID')}</p>
                  <p>Pelanggan: {selectedOrderForDetail.customerName}</p>
                  <p>Alamat: {selectedOrderForDetail.shippingAddress}, {selectedOrderForDetail.city}</p>
                  <p>Metode: {selectedOrderForDetail.paymentMethod}</p>
                  <p>Status: {selectedOrderForDetail.status}</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
                  {selectedOrderForDetail.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{it.quantity}x {it.name}</span>
                      <span>{formatIDR(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatIDR(selectedOrderForDetail.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkir:</span>
                    <span>{formatIDR(selectedOrderForDetail.shippingFee)}</span>
                  </div>
                  {selectedOrderForDetail.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon:</span>
                      <span>-{formatIDR(selectedOrderForDetail.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                    <span>TOTAL BAYAR:</span>
                    <span className="text-pink-600 font-extrabold">{formatIDR(selectedOrderForDetail.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Nota</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL 3: ZOOM PROOF IMAGE */}
        {/* ========================================================= */}
        {zoomProofUrl && (
          <div
            className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setZoomProofUrl(null)}
          >
            <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden p-2">
              <button
                onClick={() => setZoomProofUrl(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                ✕
              </button>
              <img
                src={zoomProofUrl}
                alt="Zoom Bukti Transfer"
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-MODAL 4: REJECT REASON PROMPT */}
        {/* ========================================================= */}
        {rejectReasonPrompt.show && (
          <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 border-2 border-red-200">
              <h5 className="font-bold text-sm text-slate-800">Alasan Penolakan Bukti Transfer</h5>
              <input
                type="text"
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="Contoh: Nominal transfer kurang / Struk buram"
                className="w-full px-3 py-2 text-xs border border-red-200 rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectReasonPrompt({ orderId: '', show: false })}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
