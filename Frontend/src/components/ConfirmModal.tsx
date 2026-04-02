import React from 'react';
import { X, ShieldAlert, Info as InfoIcon, Zap } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEscapeKey(onCancel, open);

  if (!open) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      confirmBtn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
      ring: 'ring-rose-100',
      icon: ShieldAlert
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
      ring: 'ring-amber-100',
      icon: Zap
    },
    info: {
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
      ring: 'ring-indigo-100',
      icon: InfoIcon
    },
  };

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[40px] shadow-premium border border-slate-100 w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-6 duration-500 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-[60px] rounded-full"></div>
        
        {/* Header */}
        <div className="p-10 pb-0 flex items-start justify-between relative z-10">
          <div className={`w-16 h-16 ${styles.iconBg} ${styles.ring} ring-8 rounded-[24px] flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className={`w-8 h-8 ${styles.iconColor}`} />
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-600 hover:text-slate-600 hover:bg-slate-100 transition-all border border-slate-100 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-10 py-8 relative z-10">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h3>
          <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">{message}</p>
        </div>

        {/* Action Surface */}
        <div className="px-10 pb-10 flex items-center gap-4 relative z-10">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] border border-slate-100 shadow-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); }}
            className={`flex-1 px-6 py-4 ${styles.confirmBtn} text-slate-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
