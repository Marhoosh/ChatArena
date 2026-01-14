import { StorageError } from '~utils/errors'

export enum StoragePath {
  AVATAR = 'images/avatars',
  PRODUCTS = 'images/products',
  BANNERS = 'images/banners',
  TEMP_IMAGES = 'images/temp',
  USER_VIDEOS = 'videos/user-uploads',
  PROCESSED_VIDEOS = 'videos/processed',
  PDFS = 'documents/pdfs',
  CONTRACTS = 'documents/contracts'
}

export interface UploadOptions {
  maxSize?: number; // 字节
  allowedTypes?: string[]; // MIME类型
  generateUniqueName?: boolean; // 是否生成唯一文件名
  metadata?: Record<string, any>; // 额外元数据
}

export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: StorageError;
}
