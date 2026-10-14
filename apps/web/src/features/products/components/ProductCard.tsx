import React from 'react';
import Link from 'next/link';
import { formatVND } from '@cropnet/utils';
import { MapPin } from 'lucide-react';
import { getAssetPath } from '@/shared/utils/path';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
  farmName?: string;
  tags?: string[];
  seasonStatus?: string;
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  unit, 
  imageUrl, 
  farmName = 'HTX Nông Nghiệp Tân Triều, TP Đồng Nai',
  tags = [],
  seasonStatus
}: ProductCardProps) {
  const isOcop = tags.some(t => t.toLowerCase().includes('ocop'));
  const isVietGap = tags.some(t => t.toLowerCase().includes('vietgap'));

  return (
    <div className="bg-white rounded-xl border border-[#E2E5DC] overflow-hidden flex flex-col h-full hover:border-[#CBD0C4] transition-colors">
      {/* Product Image */}
      <div className="relative aspect-square bg-[#F1EFE8] overflow-hidden">
        <img
          src={getAssetPath(imageUrl) || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format'}
          alt={name}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        
        {/* Genuine Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-start">
          {isOcop && (
            <span className="bg-white/95 text-[#2C4939] text-[11px] font-medium px-2 py-0.5 rounded border border-[#E2E5DC]">
              OCOP 4 Sao
            </span>
          )}
          {isVietGap && (
            <span className="bg-white/95 text-[#2C4939] text-[11px] font-medium px-2 py-0.5 rounded border border-[#E2E5DC]">
              VietGAP
            </span>
          )}
        </div>

        {seasonStatus && (
          <div className="absolute bottom-2 left-2 bg-[#253129]/80 text-white text-[10px] font-medium px-2 py-0.5 rounded">
            {seasonStatus}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <div className="flex items-center gap-1 text-xs text-[#8C978F] mb-1">
            <MapPin className="w-3 h-3 text-[#7B876C] flex-shrink-0" />
            <span className="truncate">{farmName}</span>
          </div>

          <Link 
            href={`/products/${id}`} 
            className="font-semibold text-sm sm:text-base text-[#253129] hover:text-[#2C4939] transition-colors line-clamp-2 leading-snug"
            title={name}
          >
            {name}
          </Link>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-[#E2E5DC]">
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-[#253129] leading-tight">
              {formatVND(price)}
            </span>
            <span className="text-xs text-[#8C978F] truncate mt-0.5">
              / {unit}
            </span>
          </div>
          <Link 
            href={`/products/${id}`} 
            className="bg-[#F1EFE8] hover:bg-[#E7E4DC] text-[#253129] text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
