// Hàm format tiền tệ Việt Nam Đồng (VND)
export const formatVND = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

// Hàm format ngày tháng năm
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Rút gọn địa chỉ ví hoặc token
export const truncateString = (str: string, num: number = 10): string => {
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
};
