import React from 'react';

// 1. Container Component
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

// 2. Card Component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E2E5DC] shadow-subtle p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

// 3. Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-[#2C4939] hover:bg-[#233C2F] text-white focus:ring-[#2C4939]',
    secondary: 'bg-[#F1EFE8] hover:bg-[#E7E4DC] text-[#253129] border border-[#E2E5DC] focus:ring-[#7B876C]',
    danger: 'bg-[#B33A3A] hover:bg-[#962F2F] text-white focus:ring-[#B33A3A]',
    outline: 'border border-[#E2E5DC] hover:bg-[#F7F6F2] text-[#253129] focus:ring-[#2C4939]',
    ghost: 'hover:bg-[#F1EFE8] text-[#647067] hover:text-[#253129] focus:ring-[#E2E5DC]'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

// 4. Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#647067]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm text-[#253129] placeholder-[#8C978F] focus:outline-none focus:ring-1 transition-colors ${
          error 
            ? 'border-[#B33A3A] focus:ring-[#B33A3A] focus:border-[#B33A3A]' 
            : 'border-[#E2E5DC] focus:ring-[#2C4939] focus:border-[#2C4939]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-[#B33A3A]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#8C978F]">{helperText}</p>
      ) : null}
    </div>
  );
};

// 5. Badge Component
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'secondary',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border';
  
  const variantStyles = {
    primary: 'bg-[#E6EAE4] text-[#2C4939] border-[#C7D1C3]',
    success: 'bg-[#E8F1EC] text-[#245436] border-[#B8D7C4]',
    warning: 'bg-[#FAF0E6] text-[#8C5B3D] border-[#EAD5C3]',
    error: 'bg-[#FDF0ED] text-[#A63826] border-[#F6CBC2]',
    info: 'bg-[#EFF5F8] text-[#34627A] border-[#C9DFEA]',
    secondary: 'bg-[#F1EFE8] text-[#647067] border-[#E2E5DC]',
    purple: 'bg-[#F3EEF5] text-[#5C3D6A] border-[#DFD1E3]'
  };

  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// 6. Modal Component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#253129]/50 transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Dialog */}
      <div className="relative bg-white rounded-xl max-w-xl w-full p-6 shadow-modal border border-[#E2E5DC] z-10">
        {title && (
          <div className="flex items-center justify-between border-b border-[#E2E5DC] pb-3 mb-4">
            <h3 className="font-semibold text-lg text-[#253129]">{title}</h3>
            <button 
              onClick={onClose} 
              className="text-[#647067] hover:text-[#253129] p-1 rounded-md hover:bg-[#F1EFE8] transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// 7. Table Component
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto w-full border border-[#E2E5DC] rounded-xl bg-white">
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        <thead>
          <tr className="border-b border-[#E2E5DC] text-xs font-semibold text-[#647067] bg-[#F7F6F2]">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E5DC] text-sm text-[#253129]">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// 8. Skeleton Component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-3/4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`bg-[#EAECE6] animate-pulse ${variantStyles[variant]} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

// 9. Drawer Component
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#253129]/50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Sheet */}
      <div className={`relative w-full ${sizeClasses[size]} bg-white shadow-modal border-l border-[#E2E5DC] flex flex-col h-full z-10`}>
        <div className="flex items-center justify-between border-b border-[#E2E5DC] px-6 py-4">
          <h3 className="font-semibold text-lg text-[#253129]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#647067] hover:text-[#253129] p-1.5 rounded-md hover:bg-[#F1EFE8] transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// 10. ConfirmDialog Component
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'primary',
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#253129]/50 transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog Box */}
      <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-modal border border-[#E2E5DC] z-10">
        <div className="flex gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-[#253129] mb-1">{title}</h3>
            <p className="text-sm text-[#647067] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'primary' ? 'primary' : variant === 'danger' ? 'danger' : 'secondary'}
            loading={loading}
            onClick={onConfirm}
            className="px-4 py-2"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
