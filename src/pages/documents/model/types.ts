export interface IFileEntity {
  id?: number;
  name: string;
  type: string;
  size: number;
  content: File | Blob;
  createdAt: number;
}
