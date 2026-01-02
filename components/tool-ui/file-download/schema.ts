export interface SerializableFileDownload {
  id: string;
  fileName: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  icon?: string; // Lucide icon name, defaults to "File"
}

export function parseSerializableFileDownload(data: any): SerializableFileDownload {
  return {
    id: data.id || crypto.randomUUID(),
    fileName: data.fileName || "",
    description: data.description,
    fileUrl: data.fileUrl || "",
    fileSize: data.fileSize,
    icon: data.icon || "File",
  };
}
