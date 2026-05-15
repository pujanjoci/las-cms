'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  ShieldCheck,
  CloudUpload,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const KYC_DOCUMENT_TYPES = [
  { value: 'citizenship', label: 'Citizenship Certificate' },
  { value: 'pan_certificate', label: 'PAN Certificate' },
  { value: 'registration_certificate', label: 'Registration Certificate' },
  { value: 'tax_clearance', label: 'Tax Clearance' },
  { value: 'audited_financials', label: 'Audited Financials' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'collateral_valuation', label: 'Collateral Valuation Report' },
  { value: 'insurance_policy', label: 'Insurance Policy' },
  { value: 'other', label: 'Other Document' },
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

interface KYCDoc {
  id: string;
  borrower_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  status: string;
  signed_url?: string | null;
  uploaded_at: string;
}

interface KYCUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowerId: string | null;
  userId?: string;
  onUploadComplete?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDocTypeLabel(value: string) {
  return KYC_DOCUMENT_TYPES.find(t => t.value === value)?.label || value;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
  return <ImageIcon className="h-5 w-5 text-blue-500" />;
}

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    pending:   { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   label: 'Pending' },
    verified:  { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Verified' },
    rejected:  { color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         label: 'Rejected' },
    expired:   { color: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',     label: 'Expired' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${s.bg} ${s.color}`}>
      {s.label}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function KYCUploadModal({ isOpen, onClose, borrowerId, userId, onUploadComplete }: KYCUploadModalProps) {
  const [documents, setDocuments] = useState<KYCDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState('citizenship');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch existing documents ────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    if (!borrowerId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/kyc/${borrowerId}`);
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data || []);
      } else {
        setError(json.error || 'Failed to load documents');
      }
    } catch {
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => {
    if (isOpen && borrowerId) {
      fetchDocuments();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, borrowerId, fetchDocuments]);

  // ── File Upload ─────────────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    if (!borrowerId) {
      setError('No borrower selected. Please enter a PAN number first.');
      return;
    }

    // Client-side validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${formatFileSize(file.size)}). Maximum: 10 MB`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('borrower_id', borrowerId);
      formData.append('document_type', selectedType);
      if (userId) formData.append('user_id', userId);

      const res = await fetch('/api/kyc/upload', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Upload failed');
        return;
      }

      setSuccess(`"${file.name}" uploaded successfully as ${getDocTypeLabel(selectedType)}`);
      await fetchDocuments();
      onUploadComplete?.();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (docId: string) => {
    if (!borrowerId) return;
    setDeletingId(docId);
    setError(null);
    try {
      const res = await fetch(`/api/kyc/${borrowerId}?docId=${docId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Delete failed');
        return;
      }
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setSuccess('Document deleted');
      onUploadComplete?.();
    } catch {
      setError('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Clear alerts after 4s ───────────────────────────────────────────────
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // ── Render ──────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const totalCount = documents.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-modal border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-800">KYC Documents</h2>
              <p className="text-xs text-slate-500 font-medium">
                {totalCount === 0
                  ? 'No documents uploaded yet'
                  : `${verifiedCount}/${totalCount} verified`
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Document Type Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Document Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="cms-input"
            >
              {KYC_DOCUMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-8
              flex flex-col items-center justify-center gap-3 text-center
              transition-all duration-300 group
              ${isDragging
                ? 'border-primary bg-indigo-50 scale-[1.01]'
                : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
              }
              ${isUploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-slate-700">Uploading...</p>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <CloudUpload className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, JPEG, PNG — Max 10 MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── Document List ──────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Uploaded Documents ({totalCount})
              </h3>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : totalCount === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">No documents uploaded yet</p>
                <p className="text-xs text-slate-300 mt-1">Upload KYC documents to proceed</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all group"
                  >
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.file_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {getDocTypeLabel(doc.document_type)}
                        </span>
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {doc.signed_url && (
                        <a
                          href={doc.signed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 transition-all"
                          title="View document"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                        disabled={deletingId === doc.id}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                        title="Delete document"
                      >
                        {deletingId === doc.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {totalCount > 0
              ? `${verifiedCount} of ${totalCount} documents verified`
              : 'Upload at least one document to proceed'
            }
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
