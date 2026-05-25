'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, ConfirmDialog, Skeleton } from '@cropnet/ui';
import { SalesWeeklyChart, SalesForecastChart, RevenueAreaChart, CategoryPieChart } from '@/shared/components/QuickCharts';
import { 
  PlusCircle, QrCode, TrendingUp, ShoppingBag, Leaf, Trash2, Edit3, 
  LogOut, CheckCircle2, FileText, Download, Printer, RefreshCw, Eye,
  Star, AlertTriangle
} from 'lucide-react';
import RouteGuard from '@/shared/components/RouteGuard';
import { apiClient } from '@/shared/services/api';
import { useAuthStore } from '@/shared/stores/auth';
import { formatVND, formatDate } from '@cropnet/utils';
import { useRouter } from 'next/navigation';

export default function SupplierDashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'batches' | 'farm_story'>('overview');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'primary'
  });

  const triggerConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: () => {
        options.onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      variant: options.variant || 'primary'
    });
  };

  // Supplier Analytics States
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '12m'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Farm Profile & Story states
  const [farmName, setFarmName] = useState('Hợp Tác Xã Trái Cây Sạch Cái Mơn');
  const [farmAddress, setFarmAddress] = useState('Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre');
  const [farmBio, setFarmBio] = useState('Chào mừng quý khách đến với vườn rừng của chúng tôi. Chúng tôi tự hào canh tác bưởi da xanh đạt chuẩn VietGAP organic tự nhiên không thuốc trừ sâu hóa học.');
  const [farmGallery, setFarmGallery] = useState<string[]>([
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500',
    'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=500',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500'
  ]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempAddress, setTempAddress] = useState('');

  // Journey Timeline states
  const [journeyTimeline, setJourneyTimeline] = useState<any[]>([
    { id: '1', date: '2026-05-01', title: 'Bắt đầu xuống giống vụ Xuân Hè', description: 'Gieo hạt mầm giống cây ăn trái và các giống rau ăn lá tại vườn Cái Mơn.', imageUrl: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=500' },
    { id: '2', date: '2026-05-15', title: 'Tưới bón đợt 1 hữu cơ sinh học', description: 'Tưới nước ngọt tự nhiên từ sông Hàm Luông và bón phân compost hữu cơ compost vi sinh.', imageUrl: '' },
    { id: '3', date: '2026-05-23', title: 'Thu hoạch quả ngọt đầu mùa đạt VietGAP', description: 'Quả chín căng đầy vỏ mỏng múi mọng ngọt đậm đà sẵn sàng đóng gói xuất xưởng D2C.', imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500' }
  ]);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');
  const [timelineDate, setTimelineDate] = useState('2026-05-23');
  const [timelineImage, setTimelineImage] = useState('');
  const [uploadingTimelineImg, setUploadingTimelineImg] = useState(false);

  const publishFarmStoryToForum = async () => {
    const postTitle = prompt('Nhập tiêu đề nhật ký nông trại muốn chia sẻ lên Diễn đàn:', `Nhật ký vụ mùa: ${farmName} - Quy trình sản xuất sạch`);
    if (!postTitle) return;

    try {
      let markdownContent = `Chào bà con cô bác và khách hàng CropNet! Dưới đây là Nhật ký hành trình nông sản từ vườn của **${farmName}**.\n\n`;
      markdownContent += `📍 **Địa chỉ**: ${farmAddress}\n`;
      markdownContent += `🌱 **Giới thiệu**: ${farmBio}\n\n`;
      markdownContent += `### 📅 Hành trình vụ mùa của chúng tôi:\n`;
      
      journeyTimeline.forEach((t) => {
        markdownContent += `* **[${formatDate(t.date)}] ${t.title}**\n  _${t.description}_\n`;
        if (t.imageUrl) {
          markdownContent += `  ![Ảnh minh họa](${t.imageUrl})\n`;
        }
        markdownContent += `\n`;
      });

      if (farmGallery.length > 0) {
        markdownContent += `### 📸 Một số hình ảnh thực tế tại trang trại:\n`;
        farmGallery.forEach((url, index) => {
          markdownContent += `![Trang trại ${index + 1}](${url})  `;
        });
        markdownContent += `\n`;
      }

      const res = await apiClient.post('/forum', {
        title: postTitle,
        content: markdownContent,
        type: 'FARM_STORY',
        tags: ['FarmStory', 'NhatKyVuMua', 'HTXCanhTac'],
        status: 'PUBLISHED'
      });

      if (res.data.success) {
        alert('Đã xuất bản nhật ký nông trại lên Diễn đàn cộng đồng thành công!');
        router.push('/forum');
      }
    } catch (err: any) {
      console.warn(err);
      alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Không thể xuất bản bài viết lên diễn đàn.');
    }
  };

  const handleTimelineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTimelineImg(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setTimelineImage(res.data.url);
        alert('Tải ảnh mốc hành trình thành công!');
      }
    } catch (err) {
      console.warn('Failed to upload image:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingTimelineImg(false);
    }
  };

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineTitle.trim() || !timelineDesc.trim()) return;

    const newEvent = {
      id: `timeline-${Date.now()}`,
      date: timelineDate,
      title: timelineTitle,
      description: timelineDesc,
      imageUrl: timelineImage
    };

    setJourneyTimeline(prev => [...prev, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setTimelineTitle('');
    setTimelineDesc('');
    setTimelineImage('');
    setShowTimelineModal(false);
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setFarmGallery(prev => [...prev, res.data.url]);
        alert('Thêm ảnh vào bộ sưu tập nông trại thành công!');
      }
    } catch (err) {
      console.warn(err);
      alert('Không thể tải ảnh lên.');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFarmGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveBio = () => {
    setFarmBio(tempBio);
    setFarmName(tempName);
    setFarmAddress(tempAddress);
    setIsEditingBio(false);
  };

  const handleStartEditBio = () => {
    setTempBio(farmBio);
    setTempName(farmName);
    setTempAddress(farmAddress);
    setIsEditingBio(true);
  };


  // Product Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(30000);
  const [prodUnit, setProdUnit] = useState('kg');
  const [prodStock, setProdStock] = useState(100);
  const [prodCat, setProdCat] = useState('cat-fruits');
  const [prodImagesText, setProdImagesText] = useState(''); // Comma-separated urls
  const [prodTags, setProdTags] = useState(''); // Comma-separated tags
  const [prodVariantsText, setProdVariantsText] = useState(''); // Name:Price per line
  const [uploadingProd, setUploadingProd] = useState(false);

  // Batch Form states & Tabs
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchModalTab, setBatchModalTab] = useState<'basic' | 'logistics' | 'inspection'>('basic');
  const [editBatchId, setEditBatchId] = useState<string | null>(null);
  const [batchCode, setBatchCode] = useState('');
  const [batchProdId, setBatchProdId] = useState('');
  const [batchArea, setBatchArea] = useState('');
  const [batchProcess, setBatchProcess] = useState('');
  
  // Cert inputs
  const [batchCertName, setBatchCertName] = useState('Chứng nhận VietGAP');
  const [batchCertIssuer, setBatchCertIssuer] = useState('Cục Trồng trọt Bến Tre');
  const [batchCertValidUntil, setBatchCertValidUntil] = useState('2028-12-31');
  const [batchCertImageUrl, setBatchCertImageUrl] = useState('https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format');

  // Logistics & Shipment inputs
  const [batchShipStatus, setBatchShipStatus] = useState<'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'>('PICKED_UP');
  const [batchCarrier, setBatchCarrier] = useState('CropNet Express Logistics');
  const [batchVehicle, setBatchVehicle] = useState('Xe tải đông lạnh - BKS 29H-123.45');
  const [batchTemp, setBatchTemp] = useState('5.0°C');
  const [batchHumidity, setBatchHumidity] = useState('78%');

  // Inspection inputs
  const [batchInspector, setBatchInspector] = useState('Chi cục Trồng trọt & BVTV Bến Tre');
  const [batchPesticide, setBatchPesticide] = useState('0.0% (Không phát hiện)');
  const [batchInspectHumidity, setBatchInspectHumidity] = useState('85%');
  const [batchSugar, setBatchSugar] = useState('12.5 Brix');
  const [batchInspectComments, setBatchInspectComments] = useState('Lô sản phẩm hoàn toàn sạch đạt chuẩn an toàn vệ sinh thực phẩm loại A.');

  // Preview QR Modal
  const [previewBatch, setPreviewBatch] = useState<any>(null);

  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<{[orderItemId: string]: string}>({});

  const handleAssignBatch = async (orderId: string, orderItemId: string) => {
    const batchId = selectedBatches[orderItemId];
    if (!batchId) {
      alert('Vui lòng chọn mã lô hàng nông sản');
      return;
    }

    try {
      const res = await apiClient.post(`/orders/${orderId}/confirm`, {
        orderItemId,
        batchId
      });
      if (res.data.success) {
        alert('Gán lô hàng nông sản thành công!');
        fetchData();
      }
    } catch (err: any) {
      console.warn(err);
      alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Có lỗi xảy ra khi gán lô hàng');
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProd(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setProdImagesText(prev => prev ? `${prev}, ${res.data.url}` : res.data.url);
        alert('Tải ảnh sản phẩm thành công!');
      }
    } catch (err) {
      console.warn('Failed to upload image:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingProd(false);
    }
  };

  // Direct backend served file download
  const triggerQRDownload = (code: string, type: 'png' | 'svg') => {
    const apiBase = apiClient.defaults.baseURL || 'http://localhost:5000/api';
    const downloadUrl = `${apiBase}/traceability/batches/${code}/qr?type=${type}&download=true`;
    // Triggers native browser download by opening the attachment URL
    window.location.href = downloadUrl;
  };

  const handlePrintQR = (batch: any) => {
    const apiBase = apiClient.defaults.baseURL || 'http://localhost:5000/api';
    const qrImageSrc = `${apiBase}/traceability/batches/${batch.batchCode}/qr?type=png`;
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) {
      alert('Vui lòng cho phép trình duyệt mở popup để in mã QR.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>In mã QR Lô hàng - ${batch.batchCode}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              padding: 30px;
              color: #333;
              background: #fff;
            }
            .container {
              border: 3px solid #10b981;
              border-radius: 24px;
              padding: 24px;
              max-width: 320px;
              margin: 0 auto;
            }
            .logo {
              font-size: 20px;
              font-weight: 900;
              color: #10b981;
              margin-bottom: 15px;
              letter-spacing: 0.5px;
            }
            .qr-code {
              width: 220px;
              height: 220px;
              margin: 15px auto;
              display: block;
              border: 1px solid #e2e8f0;
              padding: 8px;
              border-radius: 16px;
            }
            .batch-code {
              font-family: monospace;
              font-size: 14px;
              font-weight: bold;
              background: #f1f5f9;
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-block;
              margin-bottom: 10px;
            }
            .detail {
              font-size: 13px;
              margin: 4px 0;
            }
            .farm-name {
              font-weight: bold;
              color: #0f172a;
            }
            .footer-text {
              font-size: 10px;
              color: #94a3b8;
              margin-top: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🌿 CROPNET TRACEABLE</div>
            <img class="qr-code" src="${qrImageSrc}" alt="QR Code" />
            <div class="batch-code">${batch.batchCode}</div>
            <div class="detail"><b>Sản phẩm:</b> ${batch.product?.name || 'Nông sản'}</div>
            <div class="detail farm-name">${batch.product?.supplier?.farmName || user?.fullName || 'Hợp Tác Xã Cái Mơn'}</div>
            <div class="footer-text">Xác thực nguồn gốc chuỗi cung ứng D2C</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRegenerateQR = async (batchCode: string) => {
    try {
      const res = await apiClient.post(`/traceability/batches/${batchCode}/regenerate`);
      if (res.data.success) {
        alert('Tạo lại mã QR thành công!');
        fetchData();
        if (previewBatch && previewBatch.batchCode === batchCode) {
          setPreviewBatch(res.data.data);
        }
      }
    } catch (err) {
      console.warn(err);
      alert('Tạo lại mã QR thất bại.');
    }
  };

  const fetchSupplierStats = async (range: string, catId: string) => {
    try {
      let days = 7;
      if (range === '30d') days = 30;
      else if (range === '12m') days = 365;
      const startDate = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const params: any = { startDate };
      if (catId !== 'ALL') {
        params.categoryId = catId;
      }
      const res = await apiClient.get('/analytics/dashboard', { params });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load supplier statistics:', err);
    }
  };

  const handleExportCSV = async () => {
    try {
      let days = 7;
      if (dateRange === '30d') days = 30;
      else if (dateRange === '12m') days = 365;
      const startDate = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const params: any = { startDate };
      if (selectedCategory !== 'ALL') {
        params.categoryId = selectedCategory;
      }
      const response = await apiClient.get('/analytics/export', {
        params,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cropnet-supplier-report-${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Không thể xuất báo cáo CSV');
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchSupplierStats(dateRange, selectedCategory);
    }
  }, [dateRange, selectedCategory, activeTab]);

  const fetchData = async () => {
    try {
      // 1. Fetch Stats
      await fetchSupplierStats(dateRange, selectedCategory);

      // 2. Fetch Categories
      const catRes = await apiClient.get('/categories');
      if (catRes.data.success) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0) {
          setProdCat(catRes.data.data[0].id);
        }
      }

      // 3. Fetch Products
      const prodRes = await apiClient.get('/products', {
        params: { supplierId: user?.supplierId || 'mock-supplier-id' }
      });
      if (prodRes.data.success) {
        setProducts(prodRes.data.data.products || prodRes.data.data);
      }

      // 4. Fetch Orders
      const orderRes = await apiClient.get('/orders');
      if (orderRes.data.success) {
        setOrders(orderRes.data.data);
      }

      // 5. Fetch Traceability Batches
      const batchRes = await apiClient.get('/traceability/batches', {
        params: { supplierId: user?.supplierId }
      });
      if (batchRes.data.success) {
        setBatches(batchRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // PRODUCT CRUD HANDLERS
  const openCreateProductModal = () => {
    setEditProductId(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(30000);
    setProdUnit('kg');
    setProdStock(100);
    setProdImagesText('');
    setProdTags('');
    setProdVariantsText('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product: any) => {
    setEditProductId(product.id);
    setProdName(product.name);
    setProdDesc(product.description || '');
    setProdPrice(Number(product.price));
    setProdUnit(product.unit);
    setProdStock(Number(product.stock));
    setProdCat(product.categoryId);
    
    const imageUrls = product.images?.map((img: any) => img.url) || (product.imageUrl ? [product.imageUrl] : []);
    setProdImagesText(imageUrls.join(', '));
    setProdTags(product.tags?.join(', ') || '');
    
    const variantsLines = product.variants?.map((v: any) => `${v.name}: ${v.price}`).join('\n') || '';
    setProdVariantsText(variantsLines);
    
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageUrls = prodImagesText.split(',')
        .map(url => url.trim())
        .filter(Boolean);

      const tags = prodTags.split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const variants = prodVariantsText.split('\n')
        .map(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            return { name: parts[0].trim(), price: Number(parts[1].trim()) };
          }
          return null;
        })
        .filter(Boolean);

      const payload = {
        categoryId: prodCat,
        name: prodName,
        description: prodDesc,
        price: prodPrice,
        unit: prodUnit,
        stock: prodStock,
        imageUrls: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=500&auto=format'],
        tags,
        variants
      };

      if (editProductId) {
        const res = await apiClient.put(`/products/${editProductId}`, payload);
        if (res.data.success) {
          alert('Cập nhật nông sản thành công!');
          setShowProductModal(false);
          fetchData();
        }
      } else {
        const res = await apiClient.post('/products', payload);
        if (res.data.success) {
          alert('Đăng nông sản mới lên sàn thành công!');
          setShowProductModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.warn(err);
      alert('Đã xảy ra lỗi khi lưu thông tin sản phẩm.');
    }
  };

  const handleDeleteProduct = (id: string) => {
    triggerConfirm({
      title: 'Xóa sản phẩm',
      message: 'Bạn có chắc chắn muốn xóa nông sản này vĩnh viễn khỏi sàn?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await apiClient.delete(`/products/${id}`);
          if (res.data.success) {
            alert('Đã xóa nông sản thành công!');
            fetchData();
          }
        } catch (err) {
          console.warn(err);
          alert('Xóa nông sản thất bại. Vui lòng thử lại.');
        }
      }
    });
  };

  // BATCH CRUD HANDLERS
  const openCreateBatchModal = () => {
    setEditBatchId(null);
    setBatchCode('');
    setBatchProdId(products[0]?.id || '');
    setBatchArea('');
    setBatchProcess('');
    
    // Cert defaults
    setBatchCertName('Chứng nhận VietGAP');
    setBatchCertIssuer('Cục Trồng trọt Bến Tre');
    setBatchCertValidUntil('2028-12-31');
    setBatchCertImageUrl('https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format');

    // Logistics defaults
    setBatchShipStatus('PICKED_UP');
    setBatchCarrier('CropNet Express Logistics');
    setBatchVehicle('Xe tải đông lạnh - BKS 29H-123.45');
    setBatchTemp('5.0°C');
    setBatchHumidity('78%');

    // Inspections defaults
    setBatchInspector('Chi cục Trồng trọt & BVTV Bến Tre');
    setBatchPesticide('0.0% (Không phát hiện)');
    setBatchInspectHumidity('85%');
    setBatchSugar('12.5 Brix');
    setBatchInspectComments('Lô sản phẩm hoàn toàn sạch đạt chuẩn an toàn vệ sinh thực phẩm loại A.');

    setBatchModalTab('basic');
    setShowBatchModal(true);
  };

  const openEditBatchModal = (batch: any) => {
    setEditBatchId(batch.batchCode || batch.id);
    setBatchCode(batch.batchCode);
    setBatchProdId(batch.productId);
    setBatchArea(batch.farmingArea || '');
    setBatchProcess(batch.farmingProcess || '');
    
    // Certs
    if (batch.certifications && batch.certifications.length > 0) {
      const cert = batch.certifications[0];
      setBatchCertName(cert.name || '');
      setBatchCertIssuer(cert.issuer || '');
      setBatchCertValidUntil(cert.validUntil ? new Date(cert.validUntil).toISOString().split('T')[0] : '2028-12-31');
      setBatchCertImageUrl(cert.imageUrl || '');
    } else {
      setBatchCertName('Chứng nhận VietGAP');
      setBatchCertIssuer('Cục Trồng trọt Bến Tre');
      setBatchCertValidUntil('2028-12-31');
      setBatchCertImageUrl('https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format');
    }

    // Logistics & Shipment
    const timeline = batch.logisticsTimeline || [];
    const lastStatus = timeline.length > 0 ? timeline[timeline.length - 1].status : 'PICKED_UP';
    setBatchShipStatus(lastStatus);

    const ship = batch.shipmentInfo || {};
    setBatchCarrier(ship.carrier || 'CropNet Express Logistics');
    setBatchVehicle(ship.vehicle || 'Xe tải đông lạnh - BKS 29H-123.45');
    setBatchTemp(ship.currentTemp || '5.0°C');
    setBatchHumidity(ship.humidity || '78%');

    // Inspections
    const reports = batch.inspectionReports || [];
    if (reports.length > 0) {
      const rep = reports[0];
      setBatchInspector(rep.inspector || '');
      setBatchInspectComments(rep.comments || '');
      if (rep.metrics) {
        setBatchPesticide(rep.metrics.pesticideLevel || '');
        setBatchInspectHumidity(rep.metrics.humidity || '');
        setBatchSugar(rep.metrics.sugarLevel || '');
      }
    } else {
      setBatchInspector('Chi cục Trồng trọt & BVTV Bến Tre');
      setBatchPesticide('0.0% (Không phát hiện)');
      setBatchInspectHumidity('85%');
      setBatchSugar('12.5 Brix');
      setBatchInspectComments('Lô sản phẩm hoàn toàn sạch đạt chuẩn an toàn vệ sinh thực phẩm loại A.');
    }

    setBatchModalTab('basic');
    setShowBatchModal(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Build the logistics timeline list based on selected ship status
      const timelineList = [
        {
          status: 'PICKED_UP',
          title: 'Thu hoạch & Đóng gói',
          description: `Đã đóng gói nông sản từ khu vực ${batchArea || 'khu canh tác'}`,
          timestamp: new Date().toISOString(),
          location: user?.fullName || 'Hợp Tác Xã Bến Tre'
        }
      ];

      if (batchShipStatus === 'IN_TRANSIT' || batchShipStatus === 'DELIVERED') {
        timelineList.push({
          status: 'IN_TRANSIT',
          title: 'Đang vận chuyển lạnh',
          description: `Bàn giao cho đơn vị vận tải ${batchCarrier}. Đang di chuyển bằng xe ${batchVehicle}`,
          timestamp: new Date().toISOString(),
          location: 'Trên đường vận chuyển'
        });
      }

      if (batchShipStatus === 'DELIVERED') {
        timelineList.push({
          status: 'DELIVERED',
          title: 'Đã nhập kho trung chuyển',
          description: 'Hàng đã cập kho và sẵn sàng giao hàng trực tiếp D2C tới người tiêu dùng',
          timestamp: new Date().toISOString(),
          location: 'Kho trung chuyển TP. HCM'
        });
      }

      const inspectionReportsList = [
        {
          inspector: batchInspector,
          status: 'PASSED',
          checkDate: new Date().toISOString(),
          comments: batchInspectComments,
          metrics: {
            pesticideLevel: batchPesticide,
            humidity: batchInspectHumidity,
            sugarLevel: batchSugar
          }
        }
      ];

      const shipmentObj = {
        shipmentId: `SHIP-${batchCode}`,
        carrier: batchCarrier,
        vehicle: batchVehicle,
        currentTemp: batchTemp,
        humidity: batchHumidity,
        departureDate: new Date().toISOString(),
        arrivalDate: new Date().toISOString()
      };

      const payload = {
        productId: batchProdId,
        batchCode,
        harvestDate: new Date().toISOString(),
        farmingArea: batchArea,
        farmingProcess: batchProcess,
        
        // Certificate Fields
        certName: batchCertName,
        certIssuer: batchCertIssuer,
        certValidUntil: new Date(batchCertValidUntil).toISOString(),
        certImageUrl: batchCertImageUrl,

        // Supply Chain Fields
        logisticsTimeline: timelineList,
        inspectionReports: inspectionReportsList,
        shipmentInfo: shipmentObj
      };

      if (editBatchId) {
        const res = await apiClient.put(`/traceability/batches/${editBatchId}`, payload);
        if (res.data.success) {
          alert('Cập nhật thông tin lô hàng thành công!');
          setShowBatchModal(false);
          fetchData();
        }
      } else {
        const res = await apiClient.post('/traceability/batches', payload);
        if (res.data.success) {
          alert('Khởi tạo lô hàng QR Code thành công!');
          setShowBatchModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.warn(err);
      alert('Đã xảy ra lỗi khi lưu thông tin lô hàng.');
    }
  };

  const handleDeleteBatch = (code: string) => {
    triggerConfirm({
      title: 'Xóa lô hàng',
      message: 'Bạn có chắc chắn muốn xóa lô hàng này? Mã QR tương ứng sẽ bị vô hiệu hóa.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await apiClient.delete(`/traceability/batches/${code}`);
          if (res.data.success) {
            alert('Đã xóa lô hàng thành công!');
            fetchData();
          }
        } catch (err) {
          console.warn(err);
          alert('Xóa lô hàng thất bại.');
        }
      }
    });
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const res = await apiClient.patch(`/orders/${orderId}/status`, { status: 'CONFIRMED' });
      if (res.data.success) {
        alert('Đã xác nhận đơn hàng thành công và bàn giao cho Logistics!');
        fetchData();
      }
    } catch (err) {
      console.warn(err);
      alert('Không thể xác nhận đơn hàng.');
    }
  };

  const handleLogout = () => {
    logout();
    alert('Đăng xuất thành công!');
    router.push('/login');
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={['FARMER']}>
        <Container className="py-12 space-y-8">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </Card>
          </div>
          <Card className="p-6 space-y-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="lg:col-span-2 h-72 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          </Card>
        </Container>
      </RouteGuard>
    );
  }

  const isApproved = user?.email !== 'chua_duyet@cropnet.vn'; 

  if (!isApproved) {
    return (
      <RouteGuard allowedRoles={['FARMER']}>
        <Container className="py-20 flex justify-center items-center">
          <Card className="max-w-md w-full text-center p-8 space-y-6">
            <Leaf className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-2xl font-extrabold text-gray-900">Hệ Thống Đang Kiểm Duyệt</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tài khoản hợp tác xã/nhà vườn của bạn đang chờ quản trị viên phê duyệt địa chỉ nông trại và giấy chứng nhận VietGAP. Vui lòng quay lại sau!
            </p>
          </Card>
        </Container>
      </RouteGuard>
    );
  }

  const salesData = stats?.weeklySales || [];
  const forecastData = stats?.aiSalesForecast || [];

  return (
    <RouteGuard allowedRoles={['FARMER']}>
      <Container className="py-12 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kênh Nhà Vườn / Hợp Tác Xã</h2>
            <p className="text-gray-400 text-sm">Quản lý nông trại D2C • {user?.fullName || 'Hợp Tác Xã Cái Mơn'}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={openCreateProductModal} className="flex-grow md:flex-grow-0 bg-primary-500 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Đăng sản phẩm</span>
            </button>
            <button onClick={openCreateBatchModal} className="flex-grow md:flex-grow-0 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
              <QrCode className="w-4 h-4 text-primary-500" />
              <span>Tạo lô hàng QR</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-6 text-sm font-bold text-gray-400 border-b border-gray-100">
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'products', label: 'Kho nông sản' },
            { id: 'orders', label: 'Xử lý đơn hàng' },
            { id: 'batches', label: 'Quản lý QR Lô hàng' },
            { id: 'farm_story', label: 'Nhật ký Nông trại' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 border-b-2 transition-all ${activeTab === t.id ? 'border-primary-500 text-primary-500' : 'border-transparent hover:text-gray-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Filter & Export control bar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-150">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1.5">
                  {(['7d', '30d', '12m'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        dateRange === range 
                          ? 'bg-primary-500 text-white shadow-sm border-none' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {range === '7d' ? '7 ngày qua' : range === '30d' ? '30 ngày qua' : '12 tháng qua'}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">Tất cả danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-primary-500" />
                <span>Xuất báo cáo bán hàng</span>
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Doanh số</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5">
                    {formatVND(stats?.overview?.totalSales ?? 0)}
                  </p>
                </div>
              </Card>

              <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShoppingBag className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Số đơn hàng</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.overview?.totalOrders ?? 0} Đơn</p>
                </div>
              </Card>

              <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><QrCode className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Số lần quét QR</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.overview?.qrScans ?? 0} Lượt</p>
                </div>
              </Card>

              <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Star className="w-6 h-6 fill-current" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đánh giá chung</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.overview?.rating?.toFixed(1) ?? '5.0'} / 5.0</p>
                </div>
              </Card>
            </div>

            {/* Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RevenueAreaChart data={stats?.revenueSeries || []} title="Biểu Đồ Doanh Thu Bán Hàng" />
              </div>
              <div>
                <CategoryPieChart data={stats?.categoryDemand || []} />
              </div>
            </div>

            {/* Warnings and reviews sentiment tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Warnings Low stock card list */}
              <Card className="p-6 space-y-4">
                <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cảnh Báo Tồn Kho Thấp (&lt; 15 đơn vị)</span>
                </h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {stats?.lowStockAlerts && stats.lowStockAlerts.length > 0 ? (
                    stats.lowStockAlerts.map((prod: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-red-50 text-red-700 px-3.5 py-3 rounded-xl text-xs font-bold border border-red-100">
                        <span>{prod.name}</span>
                        <Badge variant="error" className="font-mono text-xs">Còn: {prod.stock}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-xs italic">
                      Không có sản phẩm nào sắp hết hàng. Kho vẫn đầy đủ!
                    </div>
                  )}
                </div>
              </Card>

              {/* Review Sentiment tracking */}
              <Card className="p-6 space-y-4">
                <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Phân Tích Đánh Giá Phản Hồi</span>
                </h4>
                
                {stats?.reviews ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl font-black text-gray-900">{stats.reviews.average?.toFixed(1) ?? '5.0'}</span>
                      <div>
                        <div className="flex text-amber-400">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < Math.round(stats.reviews.average ?? 5) ? 'text-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Tổng số {stats.reviews.total ?? 0} đánh giá</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-2 border-t border-gray-50 text-xs font-semibold text-gray-500">
                      {([5, 4, 3, 2, 1] as const).map(stars => {
                        const count = stats.reviews.distribution?.[stars] ?? 0;
                        const percentage = stats.reviews.total > 0 ? (count / stats.reviews.total) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="w-3 text-right">{stars}</span>
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="w-6 text-right text-gray-450">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-xs italic">
                    Chưa có nhận xét hay đánh giá nào từ người tiêu dùng.
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Tab Products */}
        {activeTab === 'products' && (
          <Card className="overflow-x-auto p-0 border border-gray-100 rounded-2xl animate-in fade-in duration-150">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 text-xs uppercase tracking-wider bg-gray-50/50">
                  <th className="py-4 px-5">Sản Phẩm</th>
                  <th className="py-4 px-5">Đơn Giá</th>
                  <th className="py-4 px-5">Tồn Kho</th>
                  <th className="py-4 px-5">Đơn Vị</th>
                  <th className="py-4 px-5">Trạng Thế</th>
                  <th className="py-4 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">Bạn chưa đăng bán nông sản nào.</td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/55 transition-colors">
                      <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-3">
                        <img src={p.images?.[0]?.url || p.imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                        <span>{p.name}</span>
                      </td>
                      <td className="py-4 px-5 text-gray-700 font-bold">{formatVND(Number(p.price))}</td>
                      <td className="py-4 px-5 text-gray-700 font-medium">{p.stock}</td>
                      <td className="py-4 px-5 text-gray-500">{p.unit}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          p.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700'
                            : p.status === 'HIDDEN'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {p.status === 'ACTIVE' ? 'Đang bán' : p.status === 'HIDDEN' ? 'Đang ẩn' : p.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-2 text-primary-500 hover:bg-primary-50 rounded-xl transition-colors"
                            title="Sửa sản phẩm"
                          >
                            <Edit3 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        )}

        {/* Tab Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {orders.length === 0 ? (
              <Card className="text-center py-12 text-gray-400">
                Không có đơn hàng nào cần xử lý lúc này.
              </Card>
            ) : (
              orders.map(o => {
                const allItemsAssigned = o.orderItems?.every((item: any) => !!item.batchId);
                return (
                  <Card key={o.id} className="p-6 space-y-4 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Đơn hàng mã</span>
                        <span className="font-mono font-bold text-gray-805 text-sm">{o.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Thanh toán</span>
                        <span className="font-semibold text-gray-700 text-xs">
                          {o.payment?.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Momo Sandbox'}{' '}
                          <Badge variant={o.payment?.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}>
                            {o.payment?.paymentStatus === 'COMPLETED' ? 'Đã trả' : 'Chờ trả'}
                          </Badge>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Trạng thái</span>
                        <Badge variant={
                          o.status === 'PENDING' ? 'warning' :
                          o.status === 'CONFIRMED' ? 'primary' :
                          o.status === 'PROCESSING' ? 'purple' :
                          o.status === 'SHIPPING' ? 'info' : 'success'
                        }>
                          {o.status === 'PENDING' ? 'Chờ xác nhận' :
                           o.status === 'CONFIRMED' ? 'Đã xác nhận' :
                           o.status === 'PROCESSING' ? 'Đang chuẩn bị hàng' :
                           o.status === 'SHIPPING' ? 'Đang giao hàng' :
                           o.status === 'DELIVERED' ? 'Đã nhận hàng' : o.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl">
                      <div>
                        <p><span className="text-gray-400 font-bold">Người nhận:</span> <span className="font-bold text-gray-800">{o.receiverName}</span></p>
                        <p className="mt-1"><span className="text-gray-400 font-bold">SĐT:</span> <span className="font-mono font-semibold">{o.receiverPhone}</span></p>
                      </div>
                      <div>
                        <p><span className="text-gray-400 font-bold">Địa chỉ nhận:</span> <span className="font-medium">{o.shippingAddress}</span></p>
                        <p className="mt-1"><span className="text-gray-400 font-bold">Ngày mua:</span> <span>{formatDate(o.createdAt)}</span></p>
                      </div>
                    </div>

                    {/* Order Items & Batch Assignment */}
                    <div className="space-y-3.5 pt-2">
                      <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Sản phẩm cần gán lô truy xuất</h4>
                      <div className="space-y-3">
                        {o.orderItems?.map((item: any) => {
                          const matchingBatches = batches.filter(b => b.productId === item.productId);
                          const isAssigned = !!item.batchId;
                          
                          return (
                            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-150 rounded-xl gap-3 text-xs">
                              <div>
                                <p className="font-bold text-gray-900">{item.product?.name}</p>
                                <p className="text-gray-450 mt-0.5">Số lượng: <span className="font-bold text-gray-700">{item.quantity} {item.product?.unit}</span></p>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                                {isAssigned ? (
                                  <Badge variant="success" className="font-mono">
                                    Đã gán lô: {item.batch?.batchCode || item.batchId}
                                  </Badge>
                                ) : (
                                  <>
                                    {matchingBatches.length === 0 ? (
                                      <span className="text-[10px] text-red-500 font-bold italic">
                                        Chưa tạo lô hàng QR cho nông sản này.
                                      </span>
                                    ) : (
                                      <>
                                        <select
                                          value={selectedBatches[item.id] || ''}
                                          onChange={(e) => setSelectedBatches(prev => ({ ...prev, [item.id]: e.target.value }))}
                                          className="border border-gray-200 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                        >
                                          <option value="">-- Chọn lô nông sản --</option>
                                          {matchingBatches.map(b => (
                                            <option key={b.batchCode} value={b.id || b.batchCode}>
                                              {b.batchCode} ({formatDate(b.harvestDate)})
                                            </option>
                                          ))}
                                        </select>
                                        <Button
                                          onClick={() => handleAssignBatch(o.id, item.id)}
                                          variant="primary"
                                          className="px-3 py-1.5 text-[10px] h-fit bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-none"
                                        >
                                          Gán Lô
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Action confirmation (for COD pending) */}
                    {o.status === 'PENDING' && o.payment?.paymentMethod === 'COD' && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          onClick={() => handleConfirmOrder(o.id)}
                          variant="primary"
                          className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 border-none"
                        >
                          Xác nhận nhận đơn (COD)
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Tab Batches (QR Management) */}
        {activeTab === 'batches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
            {batches.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-gray-400 border border-dashed rounded-3xl bg-gray-50/55">
                Chưa có lô hàng QR Code nào được tạo.
              </div>
            ) : (
              batches.map(b => {
                const apiBase = apiClient.defaults.baseURL || 'http://localhost:5000/api';
                const staticQRUrl = `${apiBase}/traceability/batches/${b.batchCode}/qr?type=png`;

                return (
                  <Card key={b.batchCode || b.id} className="p-6 flex flex-col sm:flex-row gap-5 hover:shadow-lg transition-all border border-gray-100 rounded-3xl relative overflow-hidden group">
                    {/* Visual QR container */}
                    <div className="w-full sm:w-32 aspect-square border border-gray-150 rounded-2xl bg-white p-2.5 flex-shrink-0 flex items-center justify-center relative shadow-inner">
                      <img 
                        src={staticQRUrl} 
                        alt="Batch QR Code" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = b.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH';
                        }}
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    
                    {/* Details and controls */}
                    <div className="flex-grow space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-800 font-extrabold text-base">{b.batchCode}</span>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold">Nông sản: <span className="text-gray-700 font-black">{b.product?.name || 'Chưa liên kết'}</span></p>
                        <p className="text-xs text-gray-400 font-medium">Khu vực: {b.farmingArea}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">Quy trình: {b.farmingProcess || 'Không ghi nhận'}</p>
                      </div>

                      {/* Download/Print Actions Toolbar */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 text-xs font-bold text-gray-500">
                        <button
                          onClick={() => setPreviewBatch(b)}
                          className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                          title="Xem trước"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem</span>
                        </button>
                        <button
                          onClick={() => triggerQRDownload(b.batchCode, 'png')}
                          className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                          title="Tải PNG chất lượng cao"
                        >
                          <Download className="w-4 h-4" />
                          <span>PNG</span>
                        </button>
                        <button
                          onClick={() => triggerQRDownload(b.batchCode, 'svg')}
                          className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                          title="Tải vector SVG chất lượng cao"
                        >
                          <Download className="w-4 h-4" />
                          <span>SVG</span>
                        </button>
                        <button
                          onClick={() => handlePrintQR(b)}
                          className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                          title="In tem dán nhãn"
                        >
                          <Printer className="w-4 h-4" />
                          <span>In</span>
                        </button>
                        <button
                          onClick={() => handleRegenerateQR(b.batchCode)}
                          className="flex items-center gap-1 hover:text-amber-600 transition-colors text-amber-500"
                          title="Cập nhật tên miền mới"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Tải lại</span>
                        </button>
                      </div>
                    </div>

                    {/* Standard edit buttons */}
                    <div className="absolute top-4 right-4 flex gap-0.5">
                      <button
                        onClick={() => openEditBatchModal(b)}
                        className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50/50 rounded-xl transition-all"
                        title="Sửa thông tin"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(b.batchCode || b.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all"
                        title="Xóa lô hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Tab Farm Story (Farm Profile, Gallery, Timeline) */}
        {activeTab === 'farm_story' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            
            {/* Farm Profile Header */}
            <Card className="p-6 md:p-8 border border-gray-100 rounded-3xl bg-white shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Hồ sơ nhà vườn CropNet</span>
                  {isEditingBio ? (
                    <div className="space-y-3 pt-2">
                      <input 
                        type="text" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-lg font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Tên nông trại / Hợp tác xã..."
                      />
                      <input 
                        type="text" 
                        value={tempAddress} 
                        onChange={(e) => setTempAddress(e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Địa chỉ..."
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-black text-2xl text-gray-900 leading-tight">{farmName}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">📍 {farmAddress}</p>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditingBio ? (
                    <>
                      <Button onClick={() => setIsEditingBio(false)} variant="secondary" className="px-4 py-2 text-xs">
                        Hủy
                      </Button>
                      <Button onClick={handleSaveBio} variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 text-xs">
                        Lưu hồ sơ
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleStartEditBio} variant="outline" className="px-4 py-2 text-xs">
                      Sửa hồ sơ
                    </Button>
                  )}

                  <Button 
                    onClick={publishFarmStoryToForum}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Chia sẻ lên Diễn đàn</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">Giới thiệu nông trại</h4>
                {isEditingBio ? (
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Viết vài dòng giới thiệu về quy trình, đất đai, nguồn nước hoặc lịch sử nông trại của bạn..."
                  ></textarea>
                ) : (
                  <p className="text-gray-650 text-sm leading-relaxed whitespace-pre-wrap">{farmBio}</p>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Farm Gallery */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📸 Thư viện hình ảnh</span>
                    </h4>
                    <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                      <span>Thêm ảnh</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAddGalleryImage} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {farmGallery.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-150 bg-gray-50 shadow-inner">
                        <img src={url} alt={`Farm Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 rounded-full text-xs font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {farmGallery.length === 0 && (
                      <p className="col-span-2 text-center text-xs text-gray-400 italic py-6">Chưa có ảnh nào.</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column: Crop Journey Timeline */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm space-y-5">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🌱 Nhật ký hành trình nông sản (Crop Journey)</span>
                    </h4>
                    <Button 
                      onClick={() => setShowTimelineModal(true)} 
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold"
                    >
                      Thêm mốc hành trình
                    </Button>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-6">
                    {journeyTimeline.map((t, idx) => (
                      <div key={t.id || idx} className="relative group">
                        
                        {/* Timeline Bullet node indicator */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-4 ring-emerald-50"></div>
                        
                        <div className="bg-gray-50/50 group-hover:bg-gray-50 border border-gray-100 p-4 rounded-2xl transition-all relative">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-1">
                            <span>📅 {formatDate(t.date)}</span>
                            <button
                              onClick={() => setJourneyTimeline(prev => prev.filter(item => item.id !== t.id))}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Xóa mốc"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <h5 className="font-bold text-sm text-gray-900 mb-1">{t.title}</h5>
                          <p className="text-xs text-gray-650 leading-relaxed font-semibold">{t.description}</p>
                          
                          {t.imageUrl && (
                            <div className="mt-3 rounded-lg overflow-hidden max-w-sm aspect-video border border-gray-150">
                              <img src={t.imageUrl} alt={t.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {journeyTimeline.length === 0 && (
                      <p className="text-xs text-gray-450 italic py-6">Chưa ghi chép mốc hành trình nào.</p>
                    )}
                  </div>
                </Card>
              </div>

            </div>

          </div>
        )}

        {/* Modal: Create / Edit Product */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh] rounded-3xl">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-black text-lg text-gray-900 font-sans">
                  {editProductId ? 'Cập nhật nông sản' : 'Đăng nông sản mới'}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4 text-sm text-gray-700">
                <div className="space-y-1">
                  <label className="font-semibold">Tên sản phẩm</label>
                  <input type="text" required value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Ví dụ: Xoài Cát Hòa Lộc" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold">Đơn giá (VNĐ)</label>
                    <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Đơn vị bán</label>
                    <input type="text" required value={prodUnit} onChange={(e) => setProdUnit(e.target.value)} placeholder="quả 1kg, túi 500g" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold">Tồn kho ban đầu</label>
                    <input type="number" required value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Danh mục</label>
                    <select value={prodCat} onChange={(e) => setProdCat(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2 focus:outline-primary-500">
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Từ khóa / Nhãn sản phẩm (Phân tách bằng dấu phẩy)</label>
                  <input type="text" value={prodTags} onChange={(e) => setProdTags(e.target.value)} placeholder="Ví dụ: VietGAP, Hữu cơ, Đặc sản" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block">Quy cách / Biến thể sản phẩm (Tên: Giá, mỗi dòng 1 loại)</label>
                  <textarea rows={3} value={prodVariantsText} onChange={(e) => setProdVariantsText(e.target.value)} placeholder="Ví dụ:&#10;Hộp nhỏ 500g: 35000&#10;Hộp lớn 1kg: 65000" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 font-mono text-xs" />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold block text-xs text-gray-500 uppercase">Tải ảnh sản phẩm (Multiple)</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer w-full"
                    />
                    {uploadingProd && (
                      <p className="text-xs text-amber-500 font-semibold animate-pulse">Đang tải ảnh lên máy chủ...</p>
                    )}
                    
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 font-medium">Danh sách liên kết ảnh (urls ngăn cách bằng dấu phẩy):</label>
                      <input type="text" value={prodImagesText} onChange={(e) => setProdImagesText(e.target.value)} placeholder="url1, url2..." className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-primary-500 text-xs" />
                    </div>

                    {prodImagesText && (
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {prodImagesText.split(',').map((url, index) => {
                          const trimmed = url.trim();
                          if (!trimmed) return null;
                          return (
                            <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 bg-gray-55">
                              <img src={trimmed} alt="Preview" className="object-cover w-full h-full" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Mô tả sản phẩm</label>
                  <textarea rows={3} value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} placeholder="Nhập quy chuẩn canh tác, đóng gói..." className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                </div>
                
                <button type="submit" className="w-full bg-primary-500 text-white font-bold py-3 rounded-xl hover:bg-primary-600 transition-colors shadow-md">
                  {editProductId ? 'Cập nhật sản phẩm' : 'Đăng lên sàn thương mại'}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Create / Edit Batch with Supply Chain Tabs */}
        {showBatchModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh] rounded-3xl">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-black text-lg text-gray-900 font-sans">
                  {editBatchId ? 'Cập nhật lô hàng truy xuất' : 'Tạo lô hàng QR Code'}
                </h3>
                <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>

              {/* Form Navigation Tabs */}
              <div className="flex gap-4 text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
                {[
                  { id: 'basic', label: '1. Canh tác & Certs' },
                  { id: 'logistics', label: '2. Logistics & Xe lạnh' },
                  { id: 'inspection', label: '3. Kiểm định & QC' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBatchModalTab(tab.id as any)}
                    className={`pb-1 border-b-2 transition-all ${
                      batchModalTab === tab.id 
                        ? 'border-primary-500 text-primary-500' 
                        : 'border-transparent hover:text-gray-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSaveBatch} className="space-y-4 text-sm text-gray-700">
                {batchModalTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in duration-100">
                    <div className="space-y-1">
                      <label className="font-semibold">Nông sản thu hoạch</label>
                      <select value={batchProdId} onChange={(e) => setBatchProdId(e.target.value)} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2 focus:outline-primary-500">
                        <option value="">-- Chọn nông sản --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold">Mã số lô hàng (Không trùng lặp)</label>
                      <input type="text" required value={batchCode} onChange={(e) => setBatchCode(e.target.value)} placeholder="BATCH-BUOI-CAIMON-02" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold">Phân khu canh tác</label>
                      <input type="text" required value={batchArea} onChange={(e) => setBatchArea(e.target.value)} placeholder="Phân khu hữu cơ A3" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold">Quy trình bón phân/chăm sóc</label>
                      <textarea rows={2} required value={batchProcess} onChange={(e) => setBatchProcess(e.target.value)} placeholder="Bón phân trùn quế, cách ly thuốc trừ sâu sinh học 30 ngày trước khi hái..." className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                    </div>
                    
                    <div className="border-t border-gray-50 pt-3 space-y-3">
                      <span className="font-bold text-xs uppercase text-gray-400 tracking-wider block">Giấy chứng nhận an toàn nông sản</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-semibold">Tên Chứng nhận</label>
                          <input type="text" required value={batchCertName} onChange={(e) => setBatchCertName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold">Cơ quan cấp</label>
                          <input type="text" required value={batchCertIssuer} onChange={(e) => setBatchCertIssuer(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold">Ngày hết hạn hiệu lực</label>
                          <input type="date" required value={batchCertValidUntil} onChange={(e) => setBatchCertValidUntil(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold">Liên kết ảnh Scan chứng nhận</label>
                          <input type="text" required value={batchCertImageUrl} onChange={(e) => setBatchCertImageUrl(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {batchModalTab === 'logistics' && (
                  <div className="space-y-4 animate-in fade-in duration-100">
                    <div className="space-y-1">
                      <label className="font-semibold">Trạng thái vận chuyển</label>
                      <select value={batchShipStatus} onChange={(e) => setBatchShipStatus(e.target.value as any)} className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2 focus:outline-primary-500 font-bold">
                        <option value="PICKED_UP">1. Đã xếp dỡ lên xe lạnh (Picked Up)</option>
                        <option value="IN_TRANSIT">2. Đang di chuyển trên đường (In Transit)</option>
                        <option value="DELIVERED">3. Đã nhập kho trung chuyển (Delivered)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-semibold">Nhà xe vận chuyển (Carrier)</label>
                      <input type="text" value={batchCarrier} onChange={(e) => setBatchCarrier(e.target.value)} placeholder="CropNet Logistics" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-semibold">Phương tiện & Biển kiểm soát</label>
                      <input type="text" value={batchVehicle} onChange={(e) => setBatchVehicle(e.target.value)} placeholder="Xe lạnh Isuzu - BKS 51C-888.88" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold">Nhiệt độ bảo quản lạnh</label>
                        <input type="text" value={batchTemp} onChange={(e) => setBatchTemp(e.target.value)} placeholder="4.5°C" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold">Độ ẩm thùng lạnh</label>
                        <input type="text" value={batchHumidity} onChange={(e) => setBatchHumidity(e.target.value)} placeholder="75%" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                      </div>
                    </div>
                  </div>
                )}

                {batchModalTab === 'inspection' && (
                  <div className="space-y-4 animate-in fade-in duration-100">
                    <div className="space-y-1">
                      <label className="font-semibold">Cơ quan/Chuyên viên kiểm nghiệm</label>
                      <input type="text" value={batchInspector} onChange={(e) => setBatchInspector(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="font-semibold text-xs">Dư lượng thuốc BVTV</label>
                        <input type="text" value={batchPesticide} onChange={(e) => setBatchPesticide(e.target.value)} placeholder="0.0% (Đạt chuẩn)" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-xs">Độ đường (Brix)</label>
                        <input type="text" value={batchSugar} onChange={(e) => setBatchSugar(e.target.value)} placeholder="12.0 Brix" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-semibold">Độ ẩm mẫu kiểm</label>
                      <input type="text" value={batchInspectHumidity} onChange={(e) => setBatchInspectHumidity(e.target.value)} placeholder="84.5%" className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold">Ghi chú kiểm nghiệm</label>
                      <textarea rows={2} value={batchInspectComments} onChange={(e) => setBatchInspectComments(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500" />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-between pt-4 border-t border-gray-100">
                  {batchModalTab !== 'basic' && (
                    <button 
                      type="button" 
                      onClick={() => setBatchModalTab(batchModalTab === 'inspection' ? 'logistics' : 'basic')}
                      className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
                    >
                      Quay lại
                    </button>
                  )}
                  
                  {batchModalTab !== 'inspection' ? (
                    <button 
                      type="button" 
                      onClick={() => setBatchModalTab(batchModalTab === 'basic' ? 'logistics' : 'inspection')}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ml-auto"
                    >
                      Tiếp tục
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ml-auto"
                    >
                      {editBatchId ? 'Lưu cập nhật' : 'Khởi tạo lô & In QR'}
                    </button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal: Live QR Scan & Preview */}
        {previewBatch && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="max-w-sm w-full p-6 text-center space-y-5 rounded-3xl">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="font-extrabold text-sm text-gray-800">Preview QR Lô Hàng</span>
                <button onClick={() => setPreviewBatch(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>

              <div className="w-52 h-52 mx-auto p-4 border border-gray-150 rounded-2xl bg-white shadow-md flex items-center justify-center">
                <img 
                  src={`${apiClient.defaults.baseURL || 'http://localhost:5000/api'}/traceability/batches/${previewBatch.batchCode}/qr?type=png`} 
                  alt="Full QR Preview"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = previewBatch.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BATCH';
                  }}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-gray-900 text-lg leading-tight">{previewBatch.batchCode}</h4>
                <p className="text-xs text-gray-400 font-medium">{previewBatch.product?.name || 'Nông sản'}</p>
                <p className="text-xs text-gray-500 px-4 leading-normal mt-2">Quét mã bằng camera điện thoại của bạn hoặc nhấn nút bên dưới để mở trực tiếp trang truy xuất nguồn gốc.</p>
              </div>

              <div className="flex gap-2">
                <a 
                  href={`/traceability/${previewBatch.batchCode}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-grow bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  <span>Mở trang truy xuất</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </Card>
          </div>
        )}
      </Container>

      {/* Modal: Add Timeline Event */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-55 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full p-6 space-y-5 rounded-3xl">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="font-extrabold text-sm text-gray-800">Thêm mốc hành trình vụ mùa</span>
              <button onClick={() => setShowTimelineModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddTimelineEvent} className="space-y-4 text-xs text-gray-700 font-semibold">
              <div className="space-y-1">
                <label className="text-gray-400">Tên mốc hành trình</label>
                <input
                  type="text"
                  required
                  value={timelineTitle}
                  onChange={(e) => setTimelineTitle(e.target.value)}
                  placeholder="Ví dụ: Xuống giống hạt mầm hữu cơ..."
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Ngày ghi nhận</label>
                <input
                  type="date"
                  required
                  value={timelineDate}
                  onChange={(e) => setTimelineDate(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Mô tả quy trình chi tiết</label>
                <textarea
                  required
                  value={timelineDesc}
                  onChange={(e) => setTimelineDesc(e.target.value)}
                  placeholder="Nêu rõ lượng phân compost bón lót, tưới tiêu nước ngọt..."
                  rows={3}
                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2 text-xs text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400">Ảnh thực địa (Không bắt buộc)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold transition-all">
                    <span>{uploadingTimelineImg ? 'Đang tải ảnh...' : 'Chọn ảnh thực địa'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleTimelineImageUpload} 
                      className="hidden" 
                      disabled={uploadingTimelineImg}
                    />
                  </label>
                  {timelineImage && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <img src={timelineImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTimelineModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Thêm mốc
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ConfirmDialog Component */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </RouteGuard>
  );
}

function ExternalLink({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}

