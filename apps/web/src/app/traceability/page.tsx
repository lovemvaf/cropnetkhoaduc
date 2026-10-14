'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Card, Badge, Button } from '@cropnet/ui';
import { 
  QrCode, Search, ShieldCheck, Camera, Upload, ArrowRight, 
  CheckCircle2, AlertTriangle, Leaf, Award, MapPin, RefreshCw, XCircle
} from 'lucide-react';
import Link from 'next/link';
import jsQR from 'jsqr';
import TraceabilityDetailPageClient from './[batchCode]/TraceabilityDetailClient';

function TraceabilityPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBatch = searchParams.get('batch') || searchParams.get('code');

  if (queryBatch) {
    return <TraceabilityDetailPageClient batchCodeOverride={queryBatch} />;
  }

  const [manualCode, setManualCode] = useState('');
  const [scanMode, setScanMode] = useState<'manual' | 'camera' | 'upload'>('manual');
  
  // Real Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraSuccess, setCameraSuccess] = useState<string | null>(null);

  // Real Upload States
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleBatches = [
    {
      code: 'BATCH-BUOI-TANTRIEU-2026-01',
      name: 'Bưởi Đường Lá Cam Tân Triều (OCOP)',
      farm: 'HTX Nông Nghiệp Dịch Vụ Tân Triều (Phường Tân Triều, TP Đồng Nai)',
      certs: ['OCOP', 'VietGAP Trồng trọt'],
      status: 'Hồ sơ kiểm định thực tế',
      date: '10/10/2026'
    },
    {
      code: 'BATCH-SAURIENG-LONGKHANH-2026-01',
      name: 'Sầu Riêng Ri6 Long Khánh Chín Cây',
      farm: 'HTX Nông Nghiệp Sinh Thái Long Khánh (Phường Xuân Lập, TP Đồng Nai)',
      certs: ['Chuẩn sinh thái Bazan'],
      status: 'Thu hoạch già chín tự nhiên',
      date: '12/10/2026'
    },
    {
      code: 'BATCH-HATDIEU-DONGNAI-2026-01',
      name: 'Hạt Điều Rang Muối Vỏ Lụa (Hộp 500g)',
      farm: 'Cơ sở chế biến Nông sản Đồng Nai (Xuân Lộc & Xuân Lập, TP Đồng Nai)',
      certs: ['HACCP'],
      status: 'Đã kiểm tra an toàn thực phẩm',
      date: '05/10/2026'
    },
    {
      code: 'BATCH-CHOMCHOM-LONGKHANH-2026-01',
      name: 'Chôm Chôm Nhãn Long Khánh Tươi',
      farm: 'Vùng chuyên canh Xuân Lập (Phường Xuân Lập, TP Đồng Nai)',
      certs: ['VietGAP Trái Cây'],
      status: 'Hái sớm trong ngày',
      date: '11/10/2026'
    },
    {
      code: 'BATCH-RUOUBUOI-TANTRIEU-2026-01',
      name: 'Rượu Bưởi Tân Triều Truyền Thống (Có điều kiện)',
      farm: 'Cơ sở ủ men truyền thống cù lao Tân Triều (Phường Tân Triều)',
      certs: ['OCOP', 'ATTP Rượu Thủ Công'],
      status: 'Hạ thổ 6 tháng vò sành',
      date: '20/09/2026'
    }
  ];

  const handleSearch = useCallback((codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) return;
    router.push(`/traceability/?batch=${encodeURIComponent(trimmed)}`);
  }, [router]);

  // Parse decoded QR content (supports URLs, batch codes, or plain text)
  const parseAndNavigateQr = useCallback((decodedText: string) => {
    const trimmed = decodedText.trim();
    if (!trimmed) return;

    // Check if QR contains parameter ?batch= or ?code=
    const paramMatch = trimmed.match(/[?&](?:batch|code)=([^&#]+)/i);
    if (paramMatch) {
      const code = decodeURIComponent(paramMatch[1]);
      handleSearch(code);
      return;
    }

    // Check if QR contains /traceability/BATCH-...
    const pathMatch = trimmed.match(/\/traceability\/([A-Za-z0-9\-]+)/i);
    if (pathMatch) {
      const code = decodeURIComponent(pathMatch[1]);
      handleSearch(code);
      return;
    }

    // Check if QR matches BATCH- format
    const batchPattern = trimmed.match(/BATCH-[A-Za-z0-9\-]+/i);
    if (batchPattern) {
      handleSearch(batchPattern[0]);
      return;
    }

    // Otherwise pass the whole decoded text
    handleSearch(trimmed);
  }, [handleSearch]);

  // Clean stop camera stream
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Frame scanner loop
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const qrCode = jsQR(imageData.data, width, height, {
            inversionAttempts: 'dontInvert'
          });

          if (qrCode && qrCode.data) {
            setCameraSuccess(`Đã nhận diện mã QR: ${qrCode.data}`);
            stopCamera();
            parseAndNavigateQr(qrCode.data);
            return;
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [parseAndNavigateQr, stopCamera]);

  // Start real camera stream
  const startCamera = useCallback(async (facing = cameraFacing) => {
    setCameraError(null);
    setCameraSuccess(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ truy cập camera hoặc đang chạy ở ngữ cảnh không an toàn (yêu cầu kết nối HTTPS). Bạn có thể dùng tính năng Tải ảnh tem QR hoặc nhập mã thủ công.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      let errMsg = 'Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt hoặc sử dụng tính năng Tải ảnh tem QR bên dưới.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Quyền truy cập camera đã bị từ chối. Vui lòng nhấn vào biểu tượng ổ khóa trên thanh địa chỉ để cấp quyền camera và thử lại.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'Không tìm thấy thiết bị camera trên máy của bạn. Vui lòng sử dụng tính năng tải ảnh tem QR.';
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
    }
  }, [cameraFacing, scanVideoFrame, stopCamera]);

  // Flip camera between front and back
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Real Image Upload QR Decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadPreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setUploadError('Không thể tạo bộ giải mã đồ họa trên trình duyệt.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);

        if (code && code.data) {
          setUploadSuccess(`Đã nhận diện thành công mã QR: ${code.data}`);
          parseAndNavigateQr(code.data);
        } else {
          setUploadError('Không phát hiện mã QR hợp lệ trong ảnh tải lên. Vui lòng sử dụng ảnh chụp rõ nét tem truy xuất hoặc nhập mã định danh bằng tay.');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Clean up camera on tab change or unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Container className="py-12 max-w-5xl space-y-12">
      {/* Hidden offscreen canvas for camera frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge className="bg-emerald-100 text-emerald-800 border-0 font-bold px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Nền Tảng Minh Bạch Nông Sản Thành Phố Đồng Nai 2026
        </Badge>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Cổng Truy Xuất Nguồn Gốc <br />
          <span className="text-primary-600">Minh Bạch Từ Vườn Đến Bàn Ăn</span>
        </h1>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Quét mã QR dán trên từng quả bưởi Tân Triều, trái sầu riêng Long Khánh hoặc hộp hạt điều Đồng Nai bằng camera trực tiếp hoặc ảnh chụp để kiểm chứng nhật ký canh tác sinh thái và chứng thư số.
        </p>
      </div>

      {/* Main Interactive Scan Card */}
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 bg-white rounded-3xl max-w-3xl mx-auto">
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-gray-100 pb-4 mb-6 gap-2">
          <button
            onClick={() => {
              stopCamera();
              setScanMode('manual');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              scanMode === 'manual' 
                ? 'bg-primary-50 text-primary-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4" />
            Nhập Mã Tem
          </button>
          <button
            onClick={() => {
              setScanMode('camera');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              scanMode === 'camera' 
                ? 'bg-primary-50 text-primary-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            Quét Camera Thực Tế
          </button>
          <button
            onClick={() => {
              stopCamera();
              setScanMode('upload');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              scanMode === 'upload' 
                ? 'bg-primary-50 text-primary-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Tải Ảnh Tem QR
          </button>
        </div>

        {/* Tab 1: Manual Input */}
        {scanMode === 'manual' && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(manualCode);
            }}
            className="space-y-4"
          >
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Nhập mã định danh lô hàng (Batch Code)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <QrCode className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ví dụ: BATCH-BUOI-TANTRIEU-2026-01"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all flex-shrink-0"
              >
                <span>Tra cứu ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              * Hệ thống tuân thủ nguyên tắc fail-closed: mã không tồn tại trên hệ thống sẽ hiển thị cảnh báo không tìm thấy, tuyệt đối không tự ý gán sang lô hàng khác.
            </p>
          </form>
        )}

        {/* Tab 2: Real Camera Scanner */}
        {scanMode === 'camera' && (
          <div className="text-center py-6 space-y-4">
            <div className="relative w-full max-w-sm h-80 mx-auto rounded-3xl border-4 border-dashed border-emerald-500 flex flex-col items-center justify-center bg-gray-900 overflow-hidden shadow-inner">
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                autoPlay 
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="space-y-3 p-6 text-white text-center">
                  <Camera className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="text-xs text-gray-300 font-medium leading-relaxed">
                    Nhấn nút bên dưới để cấp quyền camera và quét trực tiếp mã QR trên nhãn trái cây hoặc bao bì nông sản
                  </p>
                </div>
              )}

              {/* Scanning visual reticle */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative shadow-lg">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></div>
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-pulse top-1/2"></div>
                  </div>
                  <p className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-full mt-3">
                    Đang quét khung hình thực tế...
                  </p>
                </div>
              )}
            </div>

            {/* Camera error / success feedback */}
            {cameraError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2 max-w-md mx-auto text-left">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {cameraSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-center gap-2 max-w-md mx-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{cameraSuccess}</span>
              </div>
            )}

            {/* Camera Control Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isCameraActive ? (
                <Button
                  onClick={() => startCamera()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-2xl shadow-md flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Bật Camera & Quét Mã Thực</span>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={stopCamera}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md flex items-center gap-2"
                  >
                    <span>Dừng Camera</span>
                  </Button>
                  <Button
                    onClick={toggleCameraFacing}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-5 rounded-2xl flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Đổi Camera ({cameraFacing === 'environment' ? 'Sau' : 'Trước'})</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Real Image Upload QR Decoding */}
        {scanMode === 'upload' && (
          <div className="text-center py-6 space-y-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md mx-auto p-8 rounded-3xl border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 hover:bg-emerald-50/20 cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
            >
              {uploadPreview ? (
                <div className="space-y-2">
                  <img src={uploadPreview} alt="Preview" className="w-36 h-36 object-contain mx-auto rounded-xl border border-gray-200 shadow-sm" />
                  <p className="text-xs text-gray-600 font-semibold">Nhấn để chọn ảnh tem khác</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-700">Chọn ảnh chụp tem QR hoặc nhãn thùng hàng</p>
                    <p className="text-xs text-gray-400 mt-1">Giải mã trực tiếp bằng thư viện jsQR chuẩn Apache-2.0</p>
                  </div>
                </>
              )}
            </div>

            {uploadError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl flex items-start gap-2 max-w-md mx-auto text-left">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-center gap-2 max-w-md mx-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Verified Demo Batches Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">
              Danh Sách Lô Hàng Khảo Sát Tại Thành Phố Đồng Nai
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Bấm chọn trực tiếp từng mã lô để kiểm chứng hồ sơ nhật ký và chứng thư số trên hệ thống
            </p>
          </div>
          <Badge className="bg-primary-100 text-primary-800 border-0 font-bold text-xs self-start sm:self-auto">
            {sampleBatches.length} Lô Khảo Sát Sẵn Sàng
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBatches.map((batch) => (
            <Card 
              key={batch.code} 
              className="p-5 hover:shadow-lg transition-all border border-gray-150 hover:border-emerald-300 rounded-3xl flex flex-col justify-between group bg-white"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                    {batch.code}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">{batch.date}</span>
                </div>
                
                <h3 className="font-black text-base text-gray-900 group-hover:text-primary-600 transition-colors">
                  {batch.name}
                </h3>

                <p className="text-xs text-gray-500 flex items-start gap-1 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{batch.farm}</span>
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {batch.certs.map((c) => (
                    <span key={c} className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {batch.status}
                </span>
                <Link
                  href={`/traceability/?batch=${encodeURIComponent(batch.code)}`}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-primary-600 hover:text-primary-700 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trust & Transparency Guarantee Callout */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-8 md:p-10 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Cam Kết Minh Bạch Dữ Liệu Nông Nghiệp
            </h3>
            <p className="text-emerald-100 text-sm leading-relaxed">
              CropNet Đồng Nai AI áp dụng kiến trúc kiểm chứng trung thực: Quét mã QR bằng thuật toán thị giác máy tính thực tế, không dùng độ trễ giả lập và không tự động gán mã cố định. Mọi kết quả tra cứu đều phản ánh đúng bản chất dữ liệu đối chiếu từ cơ sở dữ liệu nông nghiệp Thành phố Đồng Nai.
            </p>
          </div>
          <Link
            href="/products"
            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black px-6 py-3 rounded-2xl text-sm transition-colors shadow-lg flex-shrink-0"
          >
            Khám phá Nông Sản Đồng Nai
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default function TraceabilityPortalPage() {
  return (
    <Suspense fallback={
      <Container className="py-16 max-w-5xl text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-gray-600">Đang tải thông tin truy xuất nguồn gốc nông sản...</p>
      </Container>
    }>
      <TraceabilityPortalContent />
    </Suspense>
  );
}
