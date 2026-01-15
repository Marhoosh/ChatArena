import { supabase } from '~db'
import { ErrorCode, StorageError } from '~utils/errors'
import { Sentry } from '~services/sentry'
import { StoragePath, UploadOptions } from '~types/storage'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function generateFileName(file: File, prefix?: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = file.name.split('.').pop() || ''
  const baseName = prefix ? `${prefix}_` : ''
  return `${baseName}${timestamp}_${randomStr}.${extension}`
}

function validateFile(file: File, options?: UploadOptions): void {
  if (options?.maxSize && file.size > options.maxSize) {
    throw new StorageError(
      `文件大小超过限制。最大允许: ${formatFileSize(options.maxSize)}, 实际大小: ${formatFileSize(file.size)}`,
      ErrorCode.FILE_SIZE_EXCEEDED
    )
  }
  
  if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
    throw new StorageError(
      `不支持的文件类型: ${file.type}。支持的类型: ${options.allowedTypes.join(', ')}`,
      ErrorCode.UNSUPPORTED_FILE_TYPE
    )
  }
}

export async function uploadFile(
  file: File, 
  path: StoragePath, 
  options?: UploadOptions
): Promise<string> {
  validateFile(file, options)
  
  const fileName = options?.generateUniqueName !== false 
    ? generateFileName(file) 
    : file.name
  
  const filePath = `${path}/${fileName}`
  
  try {
    const { error: uploadError } = await supabase.storage
      .from('test')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: options?.metadata
      })
      
    if (uploadError) {
      throw new StorageError(
        `文件上传失败: ${uploadError.message || '未知错误'}`,
        ErrorCode.UPLOAD_FAILED,
        uploadError
      )
    }
    
    return filePath
  } catch (error) {
    if (error instanceof StorageError) {
      Sentry.captureException(error)
      throw error
    }
    const storageError = new StorageError(
      `文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`,
      ErrorCode.UPLOAD_FAILED,
      error
    )
    Sentry.captureException(storageError)
    throw storageError
  }
}

export async function downloadFile(path: string): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from('test')
      .download(path)
      
    if (error) {
      throw new StorageError(
        `文件下载失败: ${error.message || '未知错误'}`,
        ErrorCode.DOWNLOAD_FAILED,
        error
      )
    }
    
    return data
  } catch (error) {
    if (error instanceof StorageError) {
      Sentry.captureException(error)
      throw error
    }
    const storageError = new StorageError(
      `文件下载失败: ${error instanceof Error ? error.message : '未知错误'}`,
      ErrorCode.DOWNLOAD_FAILED,
      error
    )
    Sentry.captureException(storageError)
    throw storageError
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('test')
      .remove([path])
      
    if (error) {
      throw new StorageError(
        `文件删除失败: ${error.message || '未知错误'}`,
        ErrorCode.DELETE_FAILED,
        error
      )
    }
  } catch (error) {
    if (error instanceof StorageError) {
      Sentry.captureException(error)
      throw error
    }
    const storageError = new StorageError(
      `文件删除失败: ${error instanceof Error ? error.message : '未知错误'}`,
      ErrorCode.DELETE_FAILED,
      error
    )
    Sentry.captureException(storageError)
    throw storageError
  }
}

export async function getSignedUrl(path: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('test')
      .createSignedUrl(path, 60)

    if (error) {
      throw new StorageError(
        `创建签名URL失败: ${error.message || '未知错误'}`,
        ErrorCode.INVALID_STORAGE_PATH,
        error
      )
    }
    
    if (!data?.signedUrl) {
      throw new StorageError(
        '创建签名URL失败: 未返回有效的URL',
        ErrorCode.INVALID_STORAGE_PATH
      )
    }
    
    return data.signedUrl
  } catch (error) {
    if (error instanceof StorageError) {
      Sentry.captureException(error)
      throw error
    }
    const storageError = new StorageError(
      `创建签名URL失败: ${error instanceof Error ? error.message : '未知错误'}`,
      ErrorCode.INVALID_STORAGE_PATH,
      error
    )
    Sentry.captureException(storageError)
    throw storageError
  }
}

export { generateFileName, validateFile, formatFileSize }
