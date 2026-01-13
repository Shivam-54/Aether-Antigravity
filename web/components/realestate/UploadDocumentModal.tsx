'use client';

import { useState } from 'react';
import { Property } from '@/types/realestate';
import { Upload, X, FileText, Image as ImageIcon, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, propertyId: string, documentType: string) => Promise<void>;
    properties: Property[];
}

const DOCUMENT_TYPES = [
    'Ownership Certificate',
    'Sale Deed',
    'Property Tax Receipt',
    'NOC',
    'Building Plan',
    'Encumbrance Certificate',
    'Valuation Report',
    'Other'
];

const ACCEPTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'text/plain': ['.txt'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadDocumentModal({ isOpen, onClose, onUpload, properties }: UploadDocumentModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<string>('');
    const [selectedDocType, setSelectedDocType] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        setError('');

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size exceeds 10MB limit');
            return;
        }

        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const acceptedExtensions = Object.values(ACCEPTED_FILE_TYPES).flat();
        if (!acceptedExtensions.includes(fileExtension)) {
            setError('Invalid file type. Accepted: PDF, PNG, JPG, TXT, DOC, DOCX');
            return;
        }

        setSelectedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile || !selectedProperty || !selectedDocType) {
            setError('Please select a file, property, and document type');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            await onUpload(selectedFile, selectedProperty, selectedDocType);
            // Reset form
            setSelectedFile(null);
            setSelectedProperty('');
            setSelectedDocType('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const getFileIcon = () => {
        if (!selectedFile) return FileText;
        const fileType = selectedFile.type;
        if (fileType.startsWith('image/')) return ImageIcon;
        if (fileType === 'application/pdf') return FileText;
        return FileCheck;
    };

    const FileIcon = getFileIcon();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-lg rounded-3xl p-8 z-10"
                        style={{
                            background: 'rgba(10, 10, 10, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-light tracking-wider text-white/90">
                                Upload Document
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X size={20} strokeWidth={1.5} className="text-white/60" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Property Selection */}
                            <div>
                                <label className="block text-sm font-light tracking-wide text-white/70 mb-2">
                                    Property
                                </label>
                                <select
                                    value={selectedProperty}
                                    onChange={(e) => setSelectedProperty(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 font-light tracking-wide focus:outline-none focus:border-white/30 transition-colors"
                                >
                                    <option value="">Select a property...</option>
                                    {properties.map((prop) => (
                                        <option key={prop.id} value={prop.id} className="bg-black">
                                            {prop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Document Type Selection */}
                            <div>
                                <label className="block text-sm font-light tracking-wide text-white/70 mb-2">
                                    Document Type
                                </label>
                                <select
                                    value={selectedDocType}
                                    onChange={(e) => setSelectedDocType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 font-light tracking-wide focus:outline-none focus:border-white/30 transition-colors"
                                >
                                    <option value="">Select document type...</option>
                                    {DOCUMENT_TYPES.map((type) => (
                                        <option key={type} value={type} className="bg-black">
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* File Upload Area */}
                            <div>
                                <label className="block text-sm font-light tracking-wide text-white/70 mb-2">
                                    File
                                </label>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${dragActive
                                            ? 'border-white/40 bg-white/10'
                                            : 'border-white/20 bg-white/5 hover:border-white/30'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileInputChange}
                                        accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />

                                    <div className="text-center">
                                        {selectedFile ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-center">
                                                    <FileIcon size={32} strokeWidth={1.5} className="text-white/70" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-light text-white/90">{selectedFile.name}</p>
                                                    <p className="text-xs font-light text-white/50 mt-1">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                    }}
                                                    className="text-xs text-white/60 hover:text-white/90 transition-colors"
                                                >
                                                    Remove file
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-center">
                                                    <Upload size={32} strokeWidth={1.5} className="text-white/40" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-light text-white/70">
                                                        Drag & drop or click to browse
                                                    </p>
                                                    <p className="text-xs font-light text-white/40 mt-1">
                                                        PDF, PNG, JPG, TXT, DOC, DOCX (max 10MB)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm font-light text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    disabled={isUploading}
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90 transition-all duration-200 font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedFile || !selectedProperty || !selectedDocType || isUploading}
                                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 hover:scale-105 transition-all duration-200 font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
