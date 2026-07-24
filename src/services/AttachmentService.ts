import * as FileSystem from "expo-file-system/legacy";

import type { Environment } from "../core/Environment";
import type { ModelValues } from "../core/types";

export interface LocalFileAsset {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
}

export class AttachmentService {
  constructor(private readonly env: Environment) {}

  async importFile(asset: LocalFileAsset, options: {
    resModel?: string;
    resId?: string;
    maxSize?: number;
  } = {}): Promise<ModelValues> {
    if (options.maxSize && asset.size && asset.size > options.maxSize) {
      throw new Error(`Tệp vượt quá giới hạn ${this.formatSize(options.maxSize)}`);
    }
    if (!FileSystem.documentDirectory) throw new Error("Thiết bị không cung cấp thư mục lưu trữ ứng dụng");

    const directory = `${FileSystem.documentDirectory}attachments/`;
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    const safeName = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const destination = `${directory}${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;
    await FileSystem.copyAsync({ from: asset.uri, to: destination });

    const info = await FileSystem.getInfoAsync(destination);
    const size = info.exists ? info.size : asset.size ?? 0;
    if (options.maxSize && size > options.maxSize) {
      await FileSystem.deleteAsync(destination, { idempotent: true });
      throw new Error(`Tệp vượt quá giới hạn ${this.formatSize(options.maxSize)}`);
    }

    try {
      return await this.env.model("ir.attachment").create({
        name: asset.name,
        mimetype: asset.mimeType ?? "application/octet-stream",
        file_size: size,
        local_uri: destination,
        original_uri: asset.uri,
        res_model: options.resModel ?? "",
        res_id: options.resId ?? "",
        active: true,
      });
    } catch (error) {
      await FileSystem.deleteAsync(destination, { idempotent: true });
      throw error;
    }
  }

  async get(id: string): Promise<ModelValues | null> {
    return this.env.model("ir.attachment").read(id);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
