import { DeleteOutlined, PictureOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Empty, Image, message, Popconfirm, Segmented, Spin, Upload } from "antd";
import type { UploadProps } from "antd";
import { useEffect, useRef, useState } from "react";
import { beginApiRequest, endApiRequest } from "../apiActivity";
import type { ApiClient } from "./types";

type GalleryProps = { api: ApiClient; initialView: "gallery" | "timeline" };
type GalleryImage = { id: number; name: string; filename: string; mime_type: string; size: number; url: string; thumbnail_url: string; created_at: string };

const apiBase = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:3100" : "");
const tokenStorageKey = "record-platform-token";

export default function Gallery({ api, initialView }: GalleryProps) {
  const [view, setView] = useState(initialView);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offset = useRef(0);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImages([]);
    offset.current = 0;
    setHasMore(true);
    setError(null);
    void loadMore(true);
  }, [initialView]);

  useEffect(() => {
    const target = sentinel.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMore && !loading) void loadMore();
    }, { rootMargin: "500px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  async function loadMore(reset = false) {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);
    setError(null);
    const nextOffset = reset ? 0 : offset.current;
    try {
      const result = await api<{ items: GalleryImage[]; has_more: boolean; offset: number }>(`/api/gallery/images?limit=20&offset=${nextOffset}`);
      setImages((current) => reset ? result.items : [...current, ...result.items.filter((item) => !current.some((existing) => existing.id === item.id))]);
      offset.current = result.offset + result.items.length;
      setHasMore(result.has_more);
    } catch {
      setError("Could not load images.");
    } finally {
      setLoading(false);
    }
  }

  async function removeImage(image: GalleryImage) {
    try {
      await api(`/api/gallery/images/${image.id}`, { method: "DELETE" });
      setImages((current) => current.filter((item) => item.id !== image.id));
      message.success("Image deleted");
    } catch {
      message.error("Could not delete image");
    }
  }

  const uploadProps: UploadProps = {
    multiple: true,
    accept: "image/jpeg,image/png,image/webp,image/gif",
    showUploadList: false,
    beforeUpload: async (file) => {
      const body = new FormData();
      body.append("file", file);
      try {
        const uploaded = await api<GalleryImage>("/api/gallery/upload", { method: "POST", body });
        setImages((current) => [uploaded, ...current.filter((item) => item.id !== uploaded.id)]);
        message.success(`${file.name} uploaded`);
      } catch {
        message.error(`${file.name} could not be uploaded`);
      }
      return Upload.LIST_IGNORE;
    }
  };

  return <section className="gallery-screen">
    <div className="gallery-toolbar">
      <div><h2><PictureOutlined /> Image Gallery</h2><p>{images.length} images loaded</p></div>
      <div className="gallery-actions"><Segmented value={view} onChange={(value) => setView(value as "gallery" | "timeline")} options={[{ label: "Gallery", value: "gallery" }, { label: "Timeline", value: "timeline" }]} /><Upload.Dragger {...uploadProps} className="gallery-upload"><Button type="primary" icon={<UploadOutlined />}>Upload images</Button></Upload.Dragger></div>
    </div>
    {error ? <div className="gallery-error"><span>{error}</span><Button icon={<ReloadOutlined />} onClick={() => loadMore()}>Retry</Button></div> : null}
    {!images.length && loading ? <div className="gallery-loading"><Spin size="large" /></div> : !images.length && !error ? <Empty description="No images yet" /> : view === "timeline" ? <Timeline images={images} onDelete={removeImage} /> : <ImageGrid images={images} onDelete={removeImage} />}
    <div ref={sentinel} className="gallery-sentinel">{loading && images.length ? <Spin /> : hasMore ? null : images.length ? "You have reached the end" : null}</div>
  </section>;
}

function ImageGrid({ images, onDelete }: { images: GalleryImage[]; onDelete: (image: GalleryImage) => Promise<void> }) {
  return <Image.PreviewGroup>{<div className="gallery-grid">{images.map((image) => <GalleryCard key={image.id} image={image} onDelete={onDelete} />)}</div>}</Image.PreviewGroup>;
}

function Timeline({ images, onDelete }: { images: GalleryImage[]; onDelete: (image: GalleryImage) => Promise<void> }) {
  const groups = new Map<string, GalleryImage[]>();
  for (const image of images) {
    const day = new Date(image.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    groups.set(day, [...(groups.get(day) ?? []), image]);
  }
  return <div className="gallery-timeline">{[...groups.entries()].map(([day, dayImages]) => <section key={day}><h3>{day}</h3><ImageGrid images={dayImages} onDelete={onDelete} /></section>)}</div>;
}

function GalleryCard({ image, onDelete }: { image: GalleryImage; onDelete: (image: GalleryImage) => Promise<void> }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let objectUrl: string | null = null;
    const controller = new AbortController();
    beginApiRequest();
    fetch(`${apiBase}${image.thumbnail_url}`, { headers: { Authorization: `Bearer ${localStorage.getItem(tokenStorageKey) ?? ""}` }, signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Image unavailable");
      return response.blob();
    }).then((blob) => { objectUrl = URL.createObjectURL(blob); setSrc(objectUrl); }).catch(() => undefined).finally(endApiRequest);
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [image.id, image.thumbnail_url]);
  return <article className="gallery-card">
    <div className="gallery-image-frame">{src ? <Image src={src} alt={image.name} preview={{ mask: "Open preview" }} /> : <Spin />}</div>
    <div className="gallery-card-footer"><span title={image.filename}>{image.name}</span><Popconfirm title="Delete this image?" onConfirm={() => onDelete(image)}><Button type="text" danger icon={<DeleteOutlined />} aria-label={`Delete ${image.name}`} /></Popconfirm></div>
  </article>;
}