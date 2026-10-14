'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Gallery } from 'devextreme-react/gallery';
import { FileUploader } from 'devextreme-react/file-uploader';
import { Button } from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { useAuth } from '@/contexts/AuthContext';
import { itemMediaService } from '@/app/services/product_services/itemMedia.service';
import { IFItemMedia } from '@repo/api-contracts/erp';
import {
    SyncIcon,
    CrossIcon,
    PlusIcon,
    UploadCloudIcon,
    ExternalLinkIcon,
    TrashIcon
} from '@repo/icons';

export interface ItemMediaGalleryProps {
    itemId: string;
    itemSku: string;
    itemName: string;
    initialMedia?: IFItemMedia[];
    onMediaChange?: (updatedMedia: IFItemMedia[]) => void;
}

export default function ItemMediaGallery({
    itemId,
    itemSku,
    itemName,
    initialMedia = [],
    onMediaChange,
}: ItemMediaGalleryProps) {
    const { token, currentCompany } = useAuth();

    const [mediaList, setMediaList] = useState<IFItemMedia[]>(initialMedia);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [showUploader, setShowUploader] = useState<boolean>(initialMedia.length === 0);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [kindCode, setKindCode] = useState<string>('');
    const [altText, setAltText] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const uploaderRef = useRef<any>(null);
    const isResettingRef = useRef<boolean>(false);

    // Sincronizar si cambia initialMedia desde el componente padre
    useEffect(() => {
        setMediaList(initialMedia);
        setSelectedIndex(prev => (initialMedia.length > 0 ? Math.min(prev, initialMedia.length - 1) : 0));
        if (initialMedia.length === 0) {
            setShowUploader(true);
        }
    }, [initialMedia]);

    // Limpieza de ObjectURL para evitar memory leaks
    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    const handleClearFile = useCallback(() => {
        setSelectedFile(null);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
        setKindCode('');
        setAltText('');
        if (uploaderRef.current?.instance) {
            isResettingRef.current = true;
            try {
                uploaderRef.current.instance().reset();
            } finally {
                setTimeout(() => {
                    isResettingRef.current = false;
                }, 50);
            }
        }
    }, [filePreviewUrl]);

    const handleFileChange = useCallback((e: any) => {
        if (isResettingRef.current) return;
        const file = e.value?.[0] as File | undefined;
        if (file) {
            setSelectedFile(file);
            setFilePreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
                setFilePreviewUrl(null);
            }
        }
    }, [filePreviewUrl]);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            notify("Por favor, selecciona un archivo de imagen primero", "warning", 2500);
            return;
        }
        if (!token) {
            notify("No hay sesión activa para realizar la carga", "error", 2500);
            return;
        }

        setIsUploading(true);
        try {
            const uploaded = await itemMediaService.uploadItemMedia(
                itemId,
                {
                    file: selectedFile,
                    kindCode: kindCode.trim() || undefined,
                    altText: altText.trim() || undefined,
                },
                token,
                currentCompany?.id
            );

            notify("Imagen subida con éxito", "success", 2500);
            const updated = [...mediaList, uploaded];
            setMediaList(updated);
            onMediaChange?.(updated);
            setSelectedIndex(updated.length - 1);
            handleClearFile();
            setShowUploader(false);
        } catch (error: any) {
            console.error("Error al subir archivo multimedia:", error);
            const msg = error instanceof Error && error.message ? error.message : "Error al subir la imagen";
            notify(msg, "error", 3500);
        } finally {
            setIsUploading(false);
        }
    }, [altText, currentCompany?.id, handleClearFile, itemId, kindCode, mediaList, onMediaChange, selectedFile, token]);

    const handleDelete = useCallback(async (mediaId: string) => {
        if (!token) return;

        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta imagen?");
        if (!confirmDelete) return;

        setIsDeletingId(mediaId);
        try {
            await itemMediaService.deleteItemMedia(itemId, mediaId, token, currentCompany?.id);
            notify("Imagen eliminada correctamente", "info", 2000);
            const updated = mediaList.filter(m => m.id !== mediaId);
            setMediaList(updated);
            if (selectedIndex >= updated.length) {
                setSelectedIndex(Math.max(0, updated.length - 1));
            }
            if (updated.length === 0) {
                setShowUploader(true);
            }
            onMediaChange?.(updated);
        } catch (error: any) {
            console.error("Error al eliminar archivo multimedia:", error);
            const msg = error instanceof Error && error.message ? error.message : "Error al eliminar la imagen";
            notify(msg, "error", 3500);
        } finally {
            setIsDeletingId(null);
        }
    }, [currentCompany?.id, itemId, mediaList, onMediaChange, selectedIndex, token]);

    const handleRefresh = useCallback(async () => {
        if (!token) return;
        setIsRefreshing(true);
        try {
            const fresh = await itemMediaService.listItemMedia(itemId, null, token, currentCompany?.id);
            setMediaList(fresh);
            setSelectedIndex(prev => (fresh.length > 0 ? Math.min(prev, fresh.length - 1) : 0));
            if (fresh.length === 0) {
                setShowUploader(true);
            }
            onMediaChange?.(fresh);
            notify("Imágenes sincronizadas", "info", 1500);
        } catch (error: any) {
            console.error("Error al refrescar imágenes:", error);
            notify("No se pudieron recargar las imágenes", "error", 2500);
        } finally {
            setIsRefreshing(false);
        }
    }, [currentCompany?.id, itemId, onMediaChange, token]);

    const galleryItems = useMemo(() => {
        return mediaList.map((m, index) => {
            const displayVariant = m.variants?.find(v => v.sizeCode === 'md' || v.sizeCode === 'lg') || m.variants?.[0];
            const displayUrl = displayVariant?.url || m.url;
            return {
                id: m.id,
                imageSrc: displayUrl,
                imageAlt: m.altText || m.originalFilename || `Imagen ${index + 1}`,
                media: m,
            };
        });
    }, [mediaList]);

    // Elemento activo actual
    const activeMedia = mediaList[selectedIndex] || mediaList[0];

    // Renderizado simple del slide: solo la imagen limpia, sin botones superpuestos que choquen con las flechas
    const renderGalleryItem = useCallback((item: any) => {
        return (
            <div className="w-full h-full flex items-center justify-center p-3 select-none">
                <img
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    className="max-h-[220px] max-w-full object-contain rounded-dx shadow-md transition-transform duration-200"
                    loading="lazy"
                />
            </div>
        );
    }, []);

    return (
        <div className="mt-2 flex flex-col gap-2.5 w-full min-w-0">
            {/* Cabecera de la sección */}
            <div className="flex items-center justify-between border-b border-main/10 pb-1.5">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-main flex items-center gap-1.5">
                        <span>Galería Multimedia</span>
                        <span className="text-xs font-normal text-main/50">({mediaList.length})</span>
                    </h4>
                    {isRefreshing && <span className="text-[11px] text-focus-300 animate-pulse">Sincronizando...</span>}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isRefreshing || Boolean(isDeletingId)}
                        className="px-2 py-1 text-xs text-main/70 hover:text-main bg-primary-0/20 hover:bg-primary-0/40 rounded-dx border border-main/10 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Recargar multimedia"
                    >
                        <SyncIcon size={14} className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Sincronizar</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowUploader(prev => !prev)}
                        disabled={Boolean(isDeletingId)}
                        className="px-2.5 py-1 text-xs font-semibold text-focus-300 hover:text-focus-100 bg-focus-500/15 hover:bg-focus-500/25 rounded-dx border border-focus-500/25 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {showUploader ? (
                            <>
                                <CrossIcon size={14} className="w-3.5 h-3.5" />
                                <span>Cerrar cargador</span>
                            </>
                        ) : (
                            <>
                                <PlusIcon size={14} className="w-3.5 h-3.5" />
                                <span>Subir imagen</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Panel de Carga / Upload */}
            {showUploader && (
                <div className="flex flex-col gap-3 p-3.5 bg-primary-900/50 rounded-dx border border-main/10">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-main flex items-center gap-1.5">
                            <UploadCloudIcon size={16} className="w-4 h-4 text-focus-300 shrink-0" />
                            <span>Cargar imagen para SKU: <strong className="text-focus-300 font-mono">{itemSku}</strong></span>
                        </span>
                        {mediaList.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUploader(false);
                                    handleClearFile();
                                }}
                                className="text-[11px] text-main/50 hover:text-main transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    <FileUploader
                        ref={uploaderRef}
                        multiple={false}
                        accept="image/*"
                        uploadMode="useForm"
                        selectButtonText="Seleccionar Archivo"
                        labelText="o arrastra la imagen aquí"
                        allowedFileExtensions={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']}
                        onValueChanged={handleFileChange}
                        className="custom-file-uploader"
                    />

                    {/* Previsualización y metadatos opcionales antes de subir */}
                    {selectedFile && (
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-2.5 bg-primary-0/20 rounded-dx border border-main/10">
                            {filePreviewUrl && (
                                <img
                                    src={filePreviewUrl}
                                    alt="Vista previa"
                                    className="w-16 h-16 object-cover rounded-dx border border-main/10 shrink-0"
                                />
                            )}
                            <div className="flex-1 min-w-0 flex flex-col gap-2 w-full">
                                <div className="text-xs text-main">
                                    <span className="font-semibold truncate block">{selectedFile.name}</span>
                                    <span className="text-[11px] text-main/50">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Etiqueta (ej: main, pack, detail)"
                                        value={kindCode}
                                        onChange={(e) => setKindCode(e.target.value)}
                                        className="text-xs px-2.5 py-1.5 rounded-dx bg-primary-950/60 border border-main/10 text-main placeholder:text-main/30 focus:outline-none focus:border-focus-300"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Texto alternativo (alt text)"
                                        value={altText}
                                        onChange={(e) => setAltText(e.target.value)}
                                        className="text-xs px-2.5 py-1.5 rounded-dx bg-primary-950/60 border border-main/10 text-main placeholder:text-main/30 focus:outline-none focus:border-focus-300"
                                    />
                                </div>
                            </div>
                            <div className="flex sm:flex-col gap-1.5 shrink-0 w-full sm:w-auto">
                                <Button
                                    text={isUploading ? "Subiendo..." : "Subir Imagen"}
                                    type="default"
                                    stylingMode="contained"
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="!bg-focus-300 hover:!bg-focus-200 !text-white text-xs flex-1 sm:flex-none"
                                />
                                <Button
                                    text="Descartar"
                                    stylingMode="text"
                                    onClick={handleClearFile}
                                    disabled={isUploading}
                                    className="text-xs !text-main/60 flex-1 sm:flex-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Contenedor del Carrusel y Barra de Acciones */}
            {mediaList.length > 0 ? (
                <div className="flex flex-col gap-2 rounded-dx bg-primary-950/40 border border-main/10 p-2.5 w-full min-w-0">
                    {/* Barra de control superior para la imagen activa (FUERA del carrusel para evitar solapamiento) */}
                    {activeMedia && (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2 border-b border-main/10 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[11px] font-mono text-main/50 shrink-0">
                                    {selectedIndex + 1} / {mediaList.length}
                                </span>
                                <span className="font-medium text-main/90 truncate max-w-[200px] sm:max-w-[320px]" title={activeMedia.originalFilename || ''}>
                                    {activeMedia.originalFilename || "Imagen sin nombre"}
                                </span>
                                {activeMedia.kindCode && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-focus-500/20 text-focus-300 border border-focus-500/30 shrink-0">
                                        {activeMedia.kindCode}
                                    </span>
                                )}
                                {activeMedia.width && activeMedia.height && (
                                    <span className="text-[10px] text-main/40 hidden sm:inline shrink-0">
                                        {activeMedia.width}×{activeMedia.height}px
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                    href={activeMedia.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-2.5 py-1 text-xs text-main/80 hover:text-focus-300 bg-primary-0/20 hover:bg-primary-0/40 rounded-dx border border-main/10 transition-colors flex items-center gap-1.5 ${isDeletingId ? 'pointer-events-none opacity-40' : ''
                                        }`}
                                    title="Abrir imagen original en nueva pestaña"
                                >
                                    <ExternalLinkIcon size={14} className="w-3.5 h-3.5" />
                                    <span>Ver original</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(activeMedia.id)}
                                    disabled={Boolean(isDeletingId)}
                                    className="px-2.5 py-1 text-xs text-error hover:text-error/80 bg-error/10 hover:bg-error/20 rounded-dx border border-error/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Eliminar imagen actual"
                                >
                                    {isDeletingId === activeMedia.id ? (
                                        <span className="text-[11px] animate-pulse">Eliminando...</span>
                                    ) : (
                                        <>
                                            <TrashIcon size={14} className="w-3.5 h-3.5" />
                                            <span>Eliminar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Carrusel Gallery (DevExtreme) con bloqueo durante la eliminación */}
                    <div className="relative w-full overflow-hidden rounded-dx">
                        {Boolean(isDeletingId) && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-primary-950/80 backdrop-blur-sm select-none">
                                <div className="w-7 h-7 border-2 border-error border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-xs font-semibold text-error">Eliminando imagen...</span>
                            </div>
                        )}

                        <Gallery
                            dataSource={galleryItems}
                            height={240}
                            loop={!isDeletingId}
                            showNavButtons={!isDeletingId}
                            showIndicator={!isDeletingId}
                            swipeEnabled={!isDeletingId}
                            disabled={Boolean(isDeletingId)}
                            selectedIndex={selectedIndex}
                            onSelectedIndexChange={(idx: number) => {
                                if (!isDeletingId) {
                                    setSelectedIndex(idx);
                                }
                            }}
                            itemRender={renderGalleryItem}
                            className={`rounded-dx overflow-hidden bg-primary-950/60 transition-opacity duration-200 ${isDeletingId ? 'opacity-30 pointer-events-none' : ''
                                }`}
                        />
                    </div>

                    {/* Tira de Miniaturas con Wrap */}
                    {mediaList.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1.5 pb-0.5 w-full min-w-0 max-h-48 overflow-y-auto pr-1 border-t border-main/5">
                            {mediaList.map((m, idx) => {
                                const thumbUrl = m.variants?.find(v => v.sizeCode === 'thumb' || v.sizeCode === 'sm')?.url || m.url;
                                const isSelected = selectedIndex === idx;

                                return (
                                    <button
                                        key={m.id || idx}
                                        type="button"
                                        disabled={Boolean(isDeletingId)}
                                        onClick={() => setSelectedIndex(idx)}
                                        className={`relative w-12 h-12 rounded-dx overflow-hidden border shrink-0 transition-all duration-150 ${isDeletingId ? 'cursor-not-allowed opacity-30 pointer-events-none' : ''
                                            } ${isSelected
                                                ? 'border-focus-300 ring-2 ring-focus-300/40 shadow-sm scale-105'
                                                : 'border-main/10 opacity-70 hover:opacity-100 hover:border-main/30'
                                            }`}
                                    >
                                        <img
                                            src={thumbUrl}
                                            alt={m.altText || ''}
                                            className="w-full h-full object-cover"
                                        />
                                        {m.kindCode && (
                                            <span className="absolute bottom-0 inset-x-0 bg-primary-950/85 text-[7px] text-center font-bold text-focus-300 truncate px-0.5">
                                                {m.kindCode}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                !showUploader && (
                    <div className="p-3 bg-main/5 rounded text-xs text-main/60 flex items-center justify-between">
                        <span>Este ítem no posee imágenes asociadas.</span>
                        <button
                            type="button"
                            onClick={() => setShowUploader(true)}
                            className="text-focus-300 hover:underline font-semibold"
                        >
                            Cargar una ahora
                        </button>
                    </div>
                )
            )}
        </div>
    );
}
