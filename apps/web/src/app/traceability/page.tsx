'use client';

import React, { useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@cropnet/ui';
import { 
  QrCode, Search, Camera, Upload, ArrowRight, 
  MapPin, RefreshCw, XCircle, AlertTriangle, Check
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
      name: 'Bưởi Đường Lá Cam Tân Triều (OCOP 4 Sao)',
      farm: 'HTX Nông Nghiệp Dịch Vụ Tân Triều (Phường Tân Triều, TP Đồng Nai)',
      certs: ['OCOP 4 Sao', 'VietGAP Trồng trọt'],
      status: 'Hồ sơ kiểm định mẫu đạt chuẩn',
      date: '10/10/2026'
    },
    {
      code: 'BATCH-SAURIENG-LONGKHANH-2026-01',
      name: 'Sầu Riêng Ri6 Long Khánh (Chín Cây Tự Nhiên)',
      farm: 'HTX Nông Nghiệp Sinh Thái Long Khánh (Phường Xuân Lập, TP Đồng Nai)',
      certs: ['Canh tác sinh thái'],
      status: 'Cắt già tự nhiên, không ngâm thuốc',
      date: '12/10/2026'
    },
    {
      code: 'BATCH-HATDIEU-DONGNAI-2026-01',
      name: 'Hạt Điều Rang Củi Vỏ Lụa Đồng Nai (Hộp 500g)',
      farm: 'HTX Nông Nghiệp Long Khánh (TP Long Khánh, TP Đồng Nai)',
      certs: ['OCOP Đồng Nai', 'ATTP'],
      status: 'Kiểm soát nhiệt độ rang thủ công',
      date: '05/10/2026'
    }
  ];

  const handleSearch = useCallback((codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) return;
    router.push(`/traceability/?batch=${encodeURIComponent(trimmed)}`);
  }, [router]);

  const parseAndNavigateQr = useCallback((decodedText: string) => {
    const trimmed = decodedText.trim();
    if (!trimmed) return;

    const paramMatch = trimmed.match(/[?&](?:batch|code)=([^&#]+)/i);
    if (paramMatch) {
      const code = decodeURIComponent(paramMatch[1]);
      handleSearch(code);
      return;
    }

    const pathMatch = trimmed.match(/\/traceability\/([A-Za-z0-9\-]+)/i);
    if (pathMatch) {
      const code = decodeURIComponent(pathMatch[1]);
      handleSearch(code);
      return;
    }

    const batchPattern = trimmed.match(/BATCH-[A-Za-z0-9\-]+/i);
    if (batchPattern) {
      handleSearch(batchPattern[0]);
      return;
    }

    handleSearch(trimmed);
  }, [handleSearch]);

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
            setCameraSuccess(`Đã nhận diện: ${qrCode.data}`);
            stopCamera();
            parseAndNavigateQr(qrCode.data);
            return;
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [parseAndNavigateQr, stopCamera]);

  const startCamera = useCallback(async (facing = cameraFacing) => {
    setCameraError(null);
    setCameraSuccess(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ camera hoặc đang chạy ngoài kết nối bảo mật HTTPS. Quý khách vui lòng dùng tính năng Tải ảnh tem QR hoặc nhập mã thủ công.');
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
      let errMsg = 'Không thể khởi động camera. Quý khách vui lòng cấp quyền truy cập camera trên thanh địa chỉ trình duyệt hoặc tải ảnh tem QR.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Quyền truy cập camera đã bị từ chối. Vui lòng cho phép truy cập camera trong cài đặt trình duyệt để tiếp tục.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'Không tìm thấy thiết bị camera trên máy. Quý khách có thể sử dụng tính năng tải ảnh tem QR.';
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
    }
  }, [cameraFacing, scanVideoFrame, stopCamera]);

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

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
          setUploadSuccess(`Đã nhận diện tem: ${code.data}`);
          setTimeout(() => {
            parseAndNavigateQr(code.data);
          }, 400);
        } else {
          setUploadError('Không tìm thấy mã QR hợp lệ trong ảnh vừa tải lên. Quý khách vui lòng chụp ảnh rõ nét, vuông góc và đủ ánh sáng.');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-8 sm:py-12">
      <Container className="space-y-10 max-w-4xl">
        {/* Editorial Page Header */}
        <div className="border-b border-[#E2E5DC] pb-6 space-y-2">
          <span className="text-xs font-semibold text-[#7B876C] uppercase tracking-wider">
            Minh Bạch Canh Tác
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#253129] tracking-tight">
            Cổng Truy Xuất Nguồn Gốc Tem QR Lô Hàng
          </h1>
          <p className="text-xs sm:text-sm text-[#647067] leading-relaxed">
            Kiểm tra nguồn gốc xuất xứ, nhật ký bón phân sinh học và hồ sơ kiểm định chất lượng đối với từng lô nông sản thu hoạch tại Thành phố Đồng Nai.
          </p>
        </div>

        {/* Scanner Card */}
        <div className="bg-white rounded-xl border border-[#E2E5DC] p-6 shadow-subtle space-y-6">
          {/* Mode Tabs */}
          <div className="flex flex-wrap p-1 bg-[#F1EFE8] rounded-lg border border-[#E2E5DC] gap-1">
            <button
              onClick={() => {
                stopCamera();
                setScanMode('manual');
              }}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                scanMode === 'manual'
                  ? 'bg-white text-[#2C4939] shadow-subtle'
                  : 'text-[#647067] hover:text-[#253129]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Nhập mã tem</span>
            </button>
            <button
              onClick={() => {
                setScanMode('camera');
              }}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                scanMode === 'camera'
                  ? 'bg-white text-[#2C4939] shadow-subtle'
                  : 'text-[#647067] hover:text-[#253129]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Quét camera trực tiếp</span>
            </button>
            <button
              onClick={() => {
                stopCamera();
                setScanMode('upload');
              }}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                scanMode === 'upload'
                  ? 'bg-white text-[#2C4939] shadow-subtle'
                  : 'text-[#647067] hover:text-[#253129]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải ảnh tem QR</span>
            </button>
          </div>

          {/* Mode 1: Manual Input */}
          {scanMode === 'manual' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(manualCode);
              }}
              className="space-y-4"
            >
              <label className="block text-xs font-semibold text-[#647067]">
                Mã định danh lô hàng (Batch Code)
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <QrCode className="w-4 h-4 absolute left-3 top-3 text-[#8C978F]" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ví dụ: BATCH-BUOI-TANTRIEU-2026-01"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E2E5DC] rounded-lg text-xs font-mono font-medium text-[#253129] focus:outline-none focus:border-[#2C4939]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#2C4939] hover:bg-[#233C2F] text-white text-xs font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Tra cứu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-[#8C978F]">
                * Hệ thống áp dụng nguyên tắc an toàn: Mã lô không tồn tại sẽ cảnh báo không tìm thấy, không tự ý gán sang lô sản phẩm khác.
              </p>
            </form>
          )}

          {/* Mode 2: Camera Scanner */}
          {scanMode === 'camera' && (
            <div className="text-center py-4 space-y-4">
              <div className="relative w-full max-w-sm h-72 mx-auto rounded-lg border border-[#E2E5DC] flex flex-col items-center justify-center bg-[#253129] overflow-hidden">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive && (
                  <div className="space-y-2 p-6 text-white text-center">
                    <Camera className="w-8 h-8 text-[#A46C49] mx-auto opacity-80" />
                    <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
                      Nhấn nút bên dưới để khởi động camera và đưa mã QR vào khung hình.
                    </p>
                  </div>
                )}

                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-44 h-44 border border-white/60 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white -mt-0.5 -ml-0.5"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white -mt-0.5 -mr-0.5"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white -mb-0.5 -ml-0.5"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white -mb-0.5 -mr-0.5"></div>
                    </div>
                    <span className="text-[11px] text-white/90 bg-[#253129]/80 px-2.5 py-0.5 rounded mt-3">
                      Đang phân tích khung hình thực tế...
                    </span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-[#FDF0ED] border border-[#F6CBC2] text-[#A63826] text-xs rounded-lg flex items-start gap-2 max-w-md mx-auto text-left">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {cameraSuccess && (
                <div className="p-3 bg-[#E8F1EC] border border-[#B8D7C4] text-[#245436] text-xs rounded-lg flex items-center justify-center gap-1.5 max-w-md mx-auto">
                  <Check className="w-4 h-4" />
                  <span>{cameraSuccess}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2">
                {!isCameraActive ? (
                  <button
                    onClick={() => startCamera()}
                    className="bg-[#2C4939] hover:bg-[#233C2F] text-white text-xs font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Mở camera</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopCamera}
                      className="bg-[#B33A3A] hover:bg-[#962F2F] text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Dừng camera
                    </button>
                    <button
                      onClick={toggleCameraFacing}
                      className="bg-[#F1EFE8] hover:bg-[#E7E4DC] text-[#253129] text-xs font-medium py-2 px-4 rounded-lg border border-[#E2E5DC] flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đổi camera ({cameraFacing === 'environment' ? 'Sau' : 'Trước'})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mode 3: Upload Image */}
          {scanMode === 'upload' && (
            <div className="text-center py-4 space-y-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md mx-auto p-8 rounded-lg border-2 border-dashed border-[#E2E5DC] hover:border-[#CBD0C4] bg-[#FAF9F5] cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
              >
                {uploadPreview ? (
                  <div className="space-y-2">
                    <img src={uploadPreview} alt="Preview" className="w-32 h-32 object-contain mx-auto rounded border border-[#E2E5DC]" />
                    <p className="text-xs text-[#647067] font-medium">Bấm để chọn tệp hình ảnh khác</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#8C978F]" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#253129]">Tải ảnh tem QR hoặc nhãn bao bì</p>
                      <p className="text-[11px] text-[#8C978F] mt-0.5">Hệ thống giải mã trực tiếp bằng thư viện jsQR chuẩn Apache-2.0</p>
                    </div>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-[#FAF0E6] border border-[#EAD5C3] text-[#8C5B3D] text-xs rounded-lg flex items-start gap-2 max-w-md mx-auto text-left">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-[#E8F1EC] border border-[#B8D7C4] text-[#245436] text-xs rounded-lg flex items-center justify-center gap-1.5 max-w-md mx-auto">
                  <Check className="w-4 h-4" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sample Batches */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-[#E2E5DC] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#253129]">
                Mã Lô Thu Hoạch Khảo Sát Tại Vườn
              </h2>
              <p className="text-xs text-[#647067]">
                Quý khách có thể chọn nhanh từng lô để xem chi tiết nhật ký bón phân và phiếu kiểm định
              </p>
            </div>
            <span className="text-xs text-[#647067] font-medium">
              3 lô khảo sát
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleBatches.map((batch) => (
              <div
                key={batch.code}
                className="bg-white rounded-xl border border-[#E2E5DC] p-5 flex flex-col justify-between space-y-3 hover:border-[#CBD0C4] transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-[#2C4939] bg-[#E6EAE4] px-2 py-0.5 rounded text-[11px]">
                      {batch.code}
                    </span>
                    <span className="text-[#8C978F] text-[11px]">{batch.date}</span>
                  </div>

                  <h3 className="font-semibold text-sm text-[#253129] leading-snug">
                    {batch.name}
                  </h3>

                  <p className="text-xs text-[#647067] flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-[#7B876C] flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{batch.farm}</span>
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {batch.certs.map((c) => (
                      <span key={c} className="text-[10px] bg-[#FAF5F1] text-[#A46C49] border border-[#F3E8DF] px-2 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E5DC] flex items-center justify-between">
                  <span className="text-[11px] text-[#7B876C]">
                    {batch.status}
                  </span>
                  <Link
                    href={`/traceability/?batch=${encodeURIComponent(batch.code)}`}
                    className="text-xs font-medium text-[#2C4939] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Xem lô</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Banner */}
        <div className="p-6 rounded-xl bg-white border border-[#E2E5DC] space-y-2 text-xs text-[#647067]">
          <h4 className="font-semibold text-sm text-[#253129]">
            Cam Kết Tính Xác Thực Dữ Liệu
          </h4>
          <p className="leading-relaxed">
            Hệ thống nhận diện mã QR bằng công nghệ giải mã quang học thực tế, không sử dụng bộ định giờ giả lập `setTimeout`. Kết quả tra cứu đối chiếu trực tiếp với kho dữ liệu vùng trồng Đồng Nai phục vụ cuộc thi AI Digital Business Challenge 2026.
          </p>
        </div>
      </Container>
    </div>
  );
}

export default function TraceabilityPortalPage() {
  return (
    <Suspense fallback={
      <Container className="py-16 text-center text-xs text-[#647067]">
        Đang tải thông tin truy xuất nguồn gốc...
      </Container>
    }>
      <TraceabilityPortalContent />
    </Suspense>
  );
}
