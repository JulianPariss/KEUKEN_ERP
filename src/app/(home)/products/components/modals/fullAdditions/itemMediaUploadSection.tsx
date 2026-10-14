'use client';

import React, { useRef, useCallback } from 'react';
import { generateUUID } from '@/lib/utils/id.helper';

export interface ICachedItemMedia {
    id: string;
    file: File;
    previewUrl: string;
    kindCode?: string;
    altText?: string;
}

interface ItemMediaUploadSectionProps {
    media: ICachedItemMedia[];
    onChange: (updatedMedia: ICachedItemMedia[]) => void;
    readOnly?: boolean;
}

export default function ItemMediaUploadSection({
    media = [],
    onChange,
    readOnly = false,
}: ItemMediaUploadSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesSelected = useCallback((files: FileList | File[]) => {
        const validFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/') ||
            /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)
        );

        if (validFiles.length === 0) return;

        const newItems: ICachedItemMedia[] = validFiles.map((file, idx) => ({
            id: generateUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            kindCode: media.length === 0 && idx === 0 ? 'main' : '',
            altText: '',
        }));

        onChange([...media, ...newItems]);
    }, [media, onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
            e.target.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesSelected(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemoveImage = (idToRemove: string) => {
        const itemToRemove = media.find(m => m.id === idToRemove);
        if (itemToRemove?.previewUrl) {
            URL.revokeObjectURL(itemToRemove.previewUrl);
        }
        onChange(media.filter(m => m.id !== idToRemove));
    };

    const handleUpdateKind = (id: string, kindCode: string) => {
        onChange(media.map(m => m.id === id ? { ...m, kindCode } : m));
    };

    const handleUpdateAlt = (id: string, altText: string) => {
        onChange(media.map(m => m.id === id ? { ...m, altText } : m));
    };

    return (
        <div className="flex flex-col gap-3 w-full py-2">
            {/* Cabecera / Dropzone */}
            {!readOnly && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg"
                        className="hidden"
                        onChange={handleInputChange}
                    />

                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-dx border border-dashed border-focus-300/40 hover:border-focus-300 hover:bg-focus-500/5 transition-all cursor-pointer bg-primary-950/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-focus-500/15 text-focus-300 border border-focus-500/30 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-main">
                                    Arrastra imágenes aquí o <span className="text-focus-300 underline underline-offset-2">selecciona archivos</span>
                                </span>
                                <span className="text-[11px] text-main/50">
                                    Formatos soportados: JPG, PNG, WEBP, GIF, SVG (múltiples archivos)
                                </span>
                            </div>
                        </div>

                        <span className="px-2.5 py-1 text-xs font-semibold text-focus-300 bg-focus-500/15 rounded-dx border border-focus-500/25 shrink-0">
                            + Añadir imágenes
                        </span>
                    </div>
                </div>
            )}

            {/* Lista / Grilla de imágenes cacheadas */}
            {media.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {media.map((item, idx) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2.5 p-2 rounded-dx bg-primary-950/40 border border-main/10 relative group"
                        >
                            <img
                                src={item.previewUrl}
                                alt={item.altText || item.file.name}
                                className="w-14 h-14 object-cover rounded-dx border border-main/10 shrink-0 bg-primary-950"
                            />

                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-semibold text-main truncate" title={item.file.name}>
                                        {item.file.name}
                                    </span>
                                    <span className="text-[10px] text-main/40 font-mono shrink-0">
                                        {(item.file.size / 1024).toFixed(0)} KB
                                    </span>
                                </div>

                                {!readOnly ? (
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="Etiqueta (ej: main)"
                                            value={item.kindCode || ''}
                                            onChange={(e) => handleUpdateKind(item.id, e.target.value)}
                                            className="text-[11px] px-2 py-0.5 rounded bg-primary-950/60 border border-main/10 text-main placeholder:text-main/30 focus:outline-none focus:border-focus-300"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Texto alt"
                                            value={item.altText || ''}
                                            onChange={(e) => handleUpdateAlt(item.id, e.target.value)}
                                            className="text-[11px] px-2 py-0.5 rounded bg-primary-950/60 border border-main/10 text-main placeholder:text-main/30 focus:outline-none focus:border-focus-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-[10px] text-main/50">
                                        {item.kindCode && (
                                            <span className="px-1.5 py-0.5 rounded bg-focus-500/15 text-focus-300 border border-focus-500/25 font-bold uppercase">
                                                {item.kindCode}
                                            </span>
                                        )}
                                        {item.altText && <span className="truncate">{item.altText}</span>}
                                    </div>
                                )}
                            </div>

                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(item.id)}
                                    title="Quitar imagen"
                                    className="p-1 rounded text-main/40 hover:text-error hover:bg-error/10 transition-colors shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-2 text-center text-xs text-main/40 italic">
                    No se han adjuntado imágenes para este ítem.
                </div>
            )}
        </div>
    );
}
