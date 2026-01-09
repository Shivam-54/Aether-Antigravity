'use client';

import { useState } from 'react';
import { PropertyDocument } from '@/types/realestate';
import { FileText, Download, Eye, Calendar, CheckCircle, Archive } from 'lucide-react';
import { useRealEstate } from '@/context/RealEstateContext';

export default function DocumentsSection() {
    const { documents } = useRealEstate();
    const [selectedType, setSelectedType] = useState<string>('All');
    const getDocumentIcon = (type: string) => {
        return FileText;
    };

    const handleView = (doc: PropertyDocument) => {
        // Mock view action
        alert(`Viewing ${doc.type} for ${doc.propertyName}`);
    };

    const handleDownload = (doc: PropertyDocument) => {
        // Mock download action
        alert(`Downloading ${doc.type} for ${doc.propertyName}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                    Valuations & Documents
                </h2>
                <p className="text-sm font-light tracking-wide text-white/50">
                    Property documentation and records
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => {
                    const Icon = getDocumentIcon(doc.type);
                    const isActive = doc.status === 'active';

                    return (
                        <div
                            key={doc.id}
                            className="relative p-6 rounded-2xl overflow-hidden group transition-all duration-300"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            {/* Hover Texture */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                    opacity: 0.06
                                }}
                            />

                            <div className="relative z-10 space-y-4">
                                {/* Icon & Status */}
                                <div className="flex items-start justify-between">
                                    <div className="p-3 rounded-xl bg-white/5">
                                        <Icon size={24} strokeWidth={1.5} className="text-white/60" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {isActive ? (
                                            <CheckCircle size={14} strokeWidth={1.5} className="text-green-400/80" />
                                        ) : (
                                            <Archive size={14} strokeWidth={1.5} className="text-white/40" />
                                        )}
                                        <span className={`text-xs font-light tracking-wider ${isActive ? 'text-green-400/80' : 'text-white/40'}`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Document Info */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-light tracking-wide text-white/90">
                                        {doc.type}
                                    </h3>
                                    <p className="text-xs font-light text-white/50">
                                        {doc.propertyName}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Calendar size={12} strokeWidth={1.5} />
                                        <span className="text-xs font-light">
                                            Issued {new Date(doc.issuedDate).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => handleView(doc)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-light tracking-wider text-white/70 hover:text-white/90 hover:bg-white/5 transition-all duration-200"
                                    >
                                        <Eye size={14} strokeWidth={1.5} />
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-light tracking-wider text-white/70 hover:text-white/90 hover:bg-white/5 transition-all duration-200"
                                    >
                                        <Download size={14} strokeWidth={1.5} />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
