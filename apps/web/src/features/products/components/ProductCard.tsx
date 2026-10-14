import React from 'react';
import Link from 'next/link';
import { formatVND } from '@cropnet/utils';
import { Star, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
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
  const isOrganic = tags.some(t => t.toLowerCase().includes('hữu cơ') || t.toLowerCase().includes('organic'));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col h-full hover:-translate-y-1 duration-200">
      <div className="relative aspect-square bg-gray-50 border-b border-gray-100/50 overflow-hidden">
        <img
          src={getAssetPath(imageUrl) || 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format'}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Dynamic badges based on genuine tag claims */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {isOcop && (
            <div className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>OCOP Đồng Nai</span>
            </div>
          )}
          {isVietGap && (
            <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3" />
              <span>VietGAP</span>
            </div>
          )}
          {isOrganic && (
            <div className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <span>Hữu Cơ Sinh Thái</span>
            </div>
          )}
        </div>

        {seasonStatus && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {seasonStatus}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
          <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
          <span className="truncate font-medium">{farmName}</span>
        </div>

        <Link 
          href={`/products/${id}`} 
          className="font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2 text-base line-clamp-1 group-hover:text-emerald-700"
        >
          {name}
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
          <span className="text-xs font-semibold text-gray-600">4.9</span>
          <span className="text-[11px] text-gray-400 ml-1">• TP Đồng Nai</span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg font-black text-emerald-700 leading-tight">
              {formatVND(price)}
            </span>
            <span className="text-xs text-gray-400 truncate mt-0.5" title={unit}>
              / {unit}
            </span>
          </div>
          <Link 
            href={`/products/${id}`} 
            className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition-all flex-shrink-0 whitespace-nowrap ml-2 shadow-xs active:scale-95 duration-150"
          >
            Xem & Đặt
          </Link>
        </div>
      </div>
    </div>
  );
}
