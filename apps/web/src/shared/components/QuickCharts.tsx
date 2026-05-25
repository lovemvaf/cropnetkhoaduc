'use client';

import React from 'react';
import { Card } from '@cropnet/ui';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const HARMONY_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

// 1. SalesWeeklyChart (Legacy support)
export function SalesWeeklyChart({ data }: { data: any[] }) {
  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Doanh Thu Tuần Này</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              formatter={(value: number) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']} 
            />
            <Bar dataKey="sales" fill="#385723" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// 2. SalesForecastChart (Legacy support)
export function SalesForecastChart({ data }: { data: any[] }) {
  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Dự Báo Doanh Thu Tháng Tới (Simple AI Linear Regression)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              formatter={(value: number) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']} 
            />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Doanh thu thực" stroke="#385723" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="forecast" name="AI Dự báo" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// 3. RevenueAreaChart (New Premium Area Chart)
export function RevenueAreaChart({ data, title = "Phân Tích Doanh Thu" }: { data: any[]; title?: string }) {
  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSalesArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(v)}
            />
            <Tooltip
              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh thu']}
            />
            <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// 4. GrowthLineChart (New Premium Member Growth Chart)
export function GrowthLineChart({ data }: { data: any[] }) {
  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Tăng Trưởng Thành Viên</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line type="monotone" dataKey="suppliers" name="Nhà vườn" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="customers" name="Khách hàng" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// 5. CategoryPieChart (New Premium Pie Chart)
export function CategoryPieChart({ data }: { data: any[] }) {
  const dataKey = data && data[0] && data[0].value !== undefined ? 'value' : 'sales';
  
  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Cơ Cấu Doanh Số Theo Danh Mục</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey={dataKey}
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={HARMONY_COLORS[index % HARMONY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Doanh số']}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// 6. ShipmentBarChart (New Premium Bar Chart)
export function ShipmentBarChart({ data }: { data: any[] }) {
  const dataKey = data && data[0] && data[0].count !== undefined ? 'count' : 'value';

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Trạng Thái Vận Chuyển</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey={dataKey} name="Đơn hàng vận chuyển" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// 7. QCBarChart (New Premium QC Audit Chart)
export function QCBarChart({ data }: { data: any[] }) {
  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Kiểm Duyệt Chất Lượng Định Kỳ</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Số lượng kiểm duyệt" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
