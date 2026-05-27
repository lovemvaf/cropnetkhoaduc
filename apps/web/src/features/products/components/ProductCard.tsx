import React from 'react';
import Link from 'next/link';
import { formatVND } from '@cropnet/utils';
import { Star, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
  farmName?: string;
}

export default function ProductCard({ id, name, price, unit, imageUrl, farmName }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&auto=format'}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VietGAP</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">{farmName || 'Cái Mơn Coop'}</p>
        <Link href={`/products/${id}`} className="font-semibold text-gray-900 hover:text-primary-500 transition-colors mb-2 text-base line-clamp-1">
          {name}
        </Link>
        <div className="flex items-center gap-1 mb-4">
          <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
          <span className="text-sm font-medium text-gray-600">4.8</span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold text-primary-500 leading-tight">
              {formatVND(price)}
            </span>
            <span className="text-xs text-gray-400 truncate mt-0.5" title={unit}>
              / {unit}
            </span>
          </div>
          <Link href={`/products/${id}`} className="bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-all flex-shrink-0 whitespace-nowrap ml-2 shadow-sm hover:shadow active:scale-95 duration-150">
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
