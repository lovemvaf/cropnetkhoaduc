'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Skeleton } from '@cropnet/ui';
import RouteGuard from '@/shared/components/RouteGuard';
import { apiClient } from '@/shared/services/api';
import { formatDate } from '@cropnet/utils';
import { 
  ShieldCheck, Search, FileText, CheckCircle2, User, MapPin, 
  Upload, Sparkles, Award, ShieldAlert, Thermometer, Droplets,
  RefreshCw, Check, X, Clock, BarChart
} from 'lucide-react';
import { useAuthStore } from '@/shared/stores/auth';
import { useRouter } from 'next/navigation';
import { QCBarChart } from '@/shared/components/QuickCharts';

export default function InspectorDashboardPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  
  const [batchCode, setBatchCode] = useState('BATCH-BUOI-CAIMON-01');
  const [batch, setBatch] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'certify' | 'inspect'>('certify');

  // Issue Certificate Form states
  const [certType, setCertType] = useState('VietGAP');
  const [certName, setCertName] = useState('Chứng nhận Thực hành Nông nghiệp Tốt VietGAP');
  const [certIssuer, setCertIssuer] = useState('Cục Trồng trọt - Bộ Nông nghiệp & PTNT');
  const [certValidUntil, setCertValidUntil] = useState('2028-12-31');
  const [certImg, setCertImg] = useState('https://images.unsplash.com/photo-1589330694653-ded6df53f7ec?w=500&auto=format');
  const [uploading, setUploading] = useState(false);
  const [submittingCert, setSubmittingCert] = useState(false);

  // Quality Inspection Report Form states
  const [pesticideLevel, setPesticideLevel] = useState('0.0% (Không phát hiện)');
  const [humidity, setHumidity] = useState('85.2%');
  const [sugarLevel, setSugarLevel] = useState('12.5 Brix');
  const [inspectComments, setInspectComments] = useState('Lô sản phẩm hoàn toàn sạch, kích thước quả đồng đều, đạt chuẩn chất lượng xuất khẩu loại 1.');
  const [inspectDate, setInspectDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchInspectorStats = async () => {
    try {
      const res = await apiClient.get('/analytics/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load inspector stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectorStats();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setCertImg(res.data.url);
        alert('Tải ảnh chụp/scan chứng nhận thành công!');
      }
    } catch (err) {
      console.warn('Failed to upload image:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleSearchBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim()) return;

    setLoading(true);
    try {
      const res = await apiClient.get(`/traceability/batches/${batchCode.trim()}`);
      if (res.data.success) {
        setBatch(res.data.data);
        
        // Pre-populate inspection reports if exist
        const reports = res.data.data.inspectionReports || [];
        if (reports.length > 0) {
          const r = reports[0];
          setInspectComments(r.comments || '');
          if (r.checkDate) setInspectDate(new Date(r.checkDate).toISOString().split('T')[0]);
          if (r.metrics) {
            setPesticideLevel(r.metrics.pesticideLevel || '0.0%');
            setHumidity(r.metrics.humidity || '85.2%');
            setSugarLevel(r.metrics.sugarLevel || '12.5 Brix');
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load batch info:', err);
      alert('Không tìm thấy lô hàng tương ứng.');
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;

    setSubmittingCert(true);
    try {
      // Map display name based on cert type selected
      let finalCertName = certName;
      if (certType === 'VietGAP') finalCertName = 'Chứng nhận Tiêu chuẩn VietGAP';
      else if (certType === 'GlobalGAP') finalCertName = 'GLOBALG.A.P. Certification';
      else if (certType === 'Organic') finalCertName = 'Chứng nhận Nông nghiệp Hữu cơ (Organic USDA)';
      else if (certType === 'HACCP') finalCertName = 'Hệ thống Phân tích Mối nguy và Điểm kiểm soát tới hạn HACCP';
      else if (certType === 'ISO 22000') finalCertName = 'Hệ thống Quản lý An toàn thực phẩm ISO 22000';

      const payload = {
        name: finalCertName,
        issuer: certIssuer,
        validUntil: new Date(certValidUntil).toISOString(),
        imageUrl: certImg
      };

      const res = await apiClient.post(`/traceability/batches/${batch.batchCode}/certifications`, payload);
      if (res.data.success) {
        alert('Cấp giấy chứng nhận thẩm định thành công! Đang chờ Quản trị viên duyệt kích hoạt.');
        
        // Reload batch
        const reload = await apiClient.get(`/traceability/batches/${batch.batchCode}`);
        if (reload.data.success) {
          setBatch(reload.data.data);
        }
        fetchInspectorStats(); // Refresh audit stats
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : null) || 'Không thể cấp chứng nhận.');
    } finally {
      setSubmittingCert(false);
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;

    setSubmittingReport(true);
    try {
      const report = {
        inspector: 'Trạm Kiểm Định Quốc Gia CropNet QC',
        status: 'PASSED',
        checkDate: new Date(inspectDate).toISOString(),
        comments: inspectComments,
        metrics: {
          pesticideLevel,
          humidity,
          sugarLevel
        }
      };

      // Updates batch inspectionReports JSON column
      const res = await apiClient.put(`/traceability/batches/${batch.batchCode}`, {
        inspectionReports: [report]
      });

      if (res.data.success) {
        alert('Cập nhật báo cáo kết quả kiểm nghiệm lô nông sản thành công!');
        
        // Reload batch
        const reload = await apiClient.get(`/traceability/batches/${batch.batchCode}`);
        if (reload.data.success) {
          setBatch(reload.data.data);
        }
        fetchInspectorStats(); // Refresh audit stats
      }
    } catch (err: any) {
      console.warn(err);
      alert('Cập nhật báo cáo kiểm nghiệm thất bại.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleLogout = () => {
    logout();
    alert('Đăng xuất thành công!');
    router.push('/login');
  };

  if (statsLoading) {
    return (
      <RouteGuard allowedRoles={['INSPECTOR']}>
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
            <Skeleton className="h-72 w-full rounded-2xl" />
          </Card>
        </Container>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['INSPECTOR']}>
      <Container className="py-12 space-y-8 max-w-5xl animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kênh Kiểm Định Chất Lượng</h2>
            <p className="text-gray-400 text-sm">Hệ thống thẩm định & cấp chứng thư số nông sản • Inspector Center</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 font-bold text-xs uppercase">
              Authorized Inspector
            </Badge>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Award className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng chứng thư cấp</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.totalCertifications ?? 0} Bản</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Check className="w-6 h-6 text-emerald-600 font-bold" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Đã duyệt (Active)</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.statusCounts?.approved ?? 0} Bản</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Chờ xét duyệt</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.statusCounts?.pending ?? 0} Bản</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><X className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bị từ chối</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{stats?.statusCounts?.rejected ?? 0} Bản</p>
            </div>
          </Card>
        </div>

        {/* Charts & QC Metrics averages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <QCBarChart data={stats?.monthlyAudits || []} />
          </div>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-emerald-500" />
                <span>Chỉ số QC trung bình</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-primary-500" /> Dư lượng thuốc BVTV
                  </span>
                  <Badge variant="success" className="font-mono">{stats?.metricsAverages?.pesticide ?? '0.0%'}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-500" /> Độ ẩm mẫu kiểm
                  </span>
                  <Badge variant="info" className="font-mono">{stats?.metricsAverages?.humidity ?? '85%'}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" /> Độ ngọt trung bình
                  </span>
                  <Badge variant="warning" className="font-mono">{stats?.metricsAverages?.sugar ?? '12.5 Brix'}</Badge>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400 font-bold uppercase">
              Chuỗi cung ứng minh bạch chuẩn VietGAP
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-5 shadow-sm border border-gray-100">
          <form onSubmit={handleSearchBatch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="Nhập mã lô nông sản để tra cứu... (Ví dụ: BATCH-BUOI-CAIMON-01)"
                className="w-full border border-gray-200 bg-white rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-primary-500 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-sm flex-shrink-0 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Đang truy vấn...' : 'Thẩm định lô'}
            </button>
          </form>
        </Card>

        {batch ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            {/* Left: Batch Info Summary */}
            <div className="md:col-span-2 space-y-6">
              <Card className="p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary-500" />
                  Thông tin lô nông sản
                </h3>
                <div className="space-y-3.5 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mã Lô:</span>
                    <span className="font-mono font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{batch.batchCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sản phẩm:</span>
                    <span className="font-bold text-gray-800">{batch.product?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ngày hái:</span>
                    <span className="font-bold text-gray-800">{formatDate(batch.harvestDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vườn canh tác:</span>
                    <span className="font-bold text-gray-800">{batch.farmingArea}</span>
                  </div>
                  {batch.farmingProcess && (
                    <div className="pt-2 border-t border-gray-50 space-y-1">
                      <span className="text-gray-400 block">Nhật ký bón phân/chăm sóc:</span>
                      <p className="text-gray-650 bg-gray-50/50 p-3 rounded-xl border border-gray-100 leading-relaxed text-[11px] font-semibold">{batch.farmingProcess}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Farm Details */}
              <Card className="p-5 space-y-3">
                <h3 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary-500" />
                  Nhà cung cấp / Nhà vườn
                </h3>
                <div className="text-xs space-y-2">
                  <p className="font-bold text-gray-900 text-sm">{batch.product?.supplier?.farmName}</p>
                  <p className="text-gray-550 flex items-start gap-1 leading-normal">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{batch.product?.supplier?.address}</span>
                  </p>
                </div>
              </Card>

              {/* Existing Certifications */}
              {batch.certifications?.length > 0 && (
                <Card className="p-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary-500" />
                    Chứng nhận đã cấp ({batch.certifications.length})
                  </h3>
                  <div className="space-y-3">
                    {batch.certifications.map((c: any) => (
                      <div key={c.id} className="text-xs p-3 bg-gray-50/70 border border-gray-150 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800">{c.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Cấp bởi: {c.issuer}</p>
                          <p className="text-[10px] text-gray-400">Hiệu lực: {formatDate(c.validUntil)}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          c.status === 'APPROVED' 
                            ? 'bg-green-50 text-green-700' 
                            : c.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {c.status === 'APPROVED' ? 'Đã duyệt' : c.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right: Auditing Form Wizard */}
            <div className="md:col-span-3 space-y-6">
              {/* Form Navigation Tabs */}
              <div className="flex gap-4 text-sm font-bold text-gray-400 border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('certify')}
                  className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'certify' ? 'border-primary-500 text-primary-500 font-extrabold' : 'border-transparent hover:text-gray-600'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>1. Cấp Chứng Nhận Thẩm Định</span>
                </button>
                <button
                  onClick={() => setActiveTab('inspect')}
                  className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'inspect' ? 'border-primary-500 text-primary-500 font-extrabold' : 'border-transparent hover:text-gray-600'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>2. Ghi Báo Cáo Kiểm Nghiệm QC</span>
                </button>
              </div>

              {/* Tab 1: Issue Cert */}
              {activeTab === 'certify' && (
                <Card className="p-6 space-y-6 animate-in fade-in duration-100">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Cấp chứng thư nông sản chuẩn D2C
                    </h3>
                    <p className="text-xs text-gray-400">Tạo chứng nhận VietGAP, GlobalGAP, Organic hay tiêu chuẩn cơ sở cho lô hàng</p>
                  </div>

                  <form onSubmit={handleIssueCert} className="space-y-4 text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-xs">Loại Chứng nhận</label>
                        <select
                          value={certType}
                          onChange={(e) => {
                            setCertType(e.target.value);
                            // Pre-populate issuer and names
                            if (e.target.value === 'VietGAP') {
                              setCertName('Chứng nhận Thực hành Nông nghiệp Tốt VietGAP');
                              setCertIssuer('Cục Trồng trọt - Bộ Nông nghiệp & PTNT');
                            } else if (e.target.value === 'GlobalGAP') {
                              setCertName('GLOBALG.A.P. Certification');
                              setCertIssuer('SGS Vietnam Co., Ltd');
                            } else if (e.target.value === 'Organic') {
                              setCertName('Chứng nhận Nông nghiệp Hữu cơ (Organic USDA)');
                              setCertIssuer('Control Union Certifications');
                            } else if (e.target.value === 'HACCP') {
                              setCertName('Hệ thống Phân tích Mối nguy và Điểm kiểm soát tới hạn HACCP');
                              setCertIssuer('Eurofins Sắc Ký Hải Đăng');
                            } else if (e.target.value === 'ISO 22000') {
                              setCertName('Hệ thống Quản lý An toàn thực phẩm ISO 22000');
                              setCertIssuer('TUV SUD Vietnam');
                            }
                          }}
                          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2 focus:outline-primary-500 font-bold"
                        >
                          <option value="VietGAP">VietGAP</option>
                          <option value="GlobalGAP">GlobalGAP</option>
                          <option value="Organic">Organic USDA/EU</option>
                          <option value="HACCP">HACCP Certificate</option>
                          <option value="ISO 22000">ISO 22000</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-xs">Đơn vị cấp thẩm định</label>
                        <input
                          type="text"
                          required
                          value={certIssuer}
                          onChange={(e) => setCertIssuer(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-xs">Tên chứng nhận hiển thị</label>
                      <input
                        type="text"
                        required
                        value={certName}
                        onChange={(e) => setCertName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-xs">Hạn hết hiệu lực</label>
                      <input
                        type="date"
                        required
                        value={certValidUntil}
                        onChange={(e) => setCertValidUntil(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500"
                      />
                    </div>

                    {/* Image upload section */}
                    <div className="space-y-1.5 border-t border-gray-50 pt-3">
                      <label className="font-semibold block text-xs text-gray-500 uppercase tracking-wider">Tải ảnh chụp/scan chứng nhận</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer w-full"
                        />
                        {uploading && (
                          <p className="text-xs text-amber-500 font-bold animate-pulse">Đang xử lý tải ảnh lên máy chủ...</p>
                        )}
                        
                        {certImg && (
                          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-150 mt-2 shadow-inner">
                            <img src={certImg} alt="Certificate Scan" className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={() => setCertImg('')}
                              className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors text-xs font-bold w-6 h-6 flex items-center justify-center shadow-md"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingCert || uploading}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md mt-4 flex items-center justify-center gap-1.5"
                    >
                      {submittingCert ? 'Đang gửi...' : 'Đệ trình & Chờ phê duyệt'}
                    </button>
                  </form>
                </Card>
              )}

              {/* Tab 2: Inspection Quality Report */}
              {activeTab === 'inspect' && (
                <Card className="p-6 space-y-6 animate-in fade-in duration-100">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      Ghi nhận kết quả kiểm định chất lượng (QC)
                    </h3>
                    <p className="text-xs text-gray-400">Ghi nhận thông tin dư lượng thuốc bảo vệ thực vật, độ ẩm và các chỉ số sinh hóa</p>
                  </div>

                  <form onSubmit={handleUpdateReport} className="space-y-4 text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-xs flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-primary-500" />
                          Dư lượng thuốc BVTV
                        </label>
                        <input
                          type="text"
                          required
                          value={pesticideLevel}
                          onChange={(e) => setPesticideLevel(e.target.value)}
                          placeholder="0.0% (Không phát hiện)"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-xs flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-primary-500" />
                          Độ ẩm mẫu kiểm
                        </label>
                        <input
                          type="text"
                          required
                          value={humidity}
                          onChange={(e) => setHumidity(e.target.value)}
                          placeholder="85%"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-xs">Độ ngọt / Độ Brix</label>
                        <input
                          type="text"
                          required
                          value={sugarLevel}
                          onChange={(e) => setSugarLevel(e.target.value)}
                          placeholder="12.0 Brix"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-xs">Ngày thực hiện kiểm nghiệm</label>
                        <input
                          type="date"
                          required
                          value={inspectDate}
                          onChange={(e) => setInspectDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-primary-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-xs">Nhận xét chi tiết của Kiểm định viên</label>
                      <textarea
                        rows={3}
                        required
                        value={inspectComments}
                        onChange={(e) => setInspectComments(e.target.value)}
                        placeholder="Quả mọng nước, vỏ mỏng đạt tiêu chuẩn hữu cơ, độ già sinh lý tốt..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-primary-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReport}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md mt-4 flex items-center justify-center gap-1.5"
                    >
                      {submittingReport ? 'Đang lưu báo cáo...' : 'Ký số & Lưu báo cáo kết nghiệm'}
                    </button>
                  </form>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 border border-dashed rounded-3xl bg-gray-50/50 space-y-2">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="font-bold text-gray-700">Tra cứu lô hàng để bắt đầu</h4>
            <p className="text-xs text-gray-500">Nhập mã số lô thu hoạch của hợp tác xã ở ô tra cứu phía trên để tiến hành cấp chứng thư.</p>
          </div>
        )}
      </Container>
    </RouteGuard>
  );
}
