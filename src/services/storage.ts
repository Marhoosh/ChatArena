import { supabase } from '~db'
import { ErrorCode, StorageError } from '~utils/errors'
import { StoragePath, UploadOptions, StorageResult } from './storage/types'

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成唯一文件名
function generateFileName(file: File, prefix?: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = file.name.split('.').pop() || ''
  const baseName = prefix ? `${prefix}_` : ''
  return `${baseName}${timestamp}_${randomStr}.${extension}`
}

// 验证文件
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

// 处理Supabase错误
function handleSupabaseError(error: any, context: string): StorageError {
  return new StorageError(
    `${context}失败: ${error.message || '未知错误'}`,
    ErrorCode.UPLOAD_FAILED,
    error
  )
}

// 上传文件到指定路径
export async function uploadFile(
  file: File, 
  path: StoragePath, 
  options?: UploadOptions
): Promise<string> {
  // 验证文件
  validateFile(file, options)
  
  // 生成文件名
  const fileName = options?.generateUniqueName !== false 
    ? generateFileName(file) 
    : file.name
  
  const filePath = `${path}/${fileName}`
  
  try {
    const { error: uploadError } = await supabase.storage
      .from('test') // 使用您的存储桶名称
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: options?.metadata
      })
      
    if (uploadError) {
      throw handleSupabaseError(uploadError, '文件上传')
    }
    
    return filePath
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }
    throw handleSupabaseError(error, '文件上传')
  }
}

// 下载文件
export async function downloadFile(path: string): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from('test')
      .download(path)
      
    if (error) {
      throw handleSupabaseError(error, '文件下载')
    }
    
    return data
  } catch (error) {
    if (error instanceof StorageError) {
      throw error
    }
    throw handleSupabaseError(error, '文件下载')
  }
}

// 删除文件
export async function deleteFile(path: string): Promise<StorageResult<void>> {
  try {
    const { error } = await supabase.storage
      .from('test')
      .remove([path])
      
    if (error) {
      return {
        success: false,
        error: handleSupabaseError(error, '文件删除')
      }
    }
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error, '文件删除')
    }
  }
}

// 获取公共URL
export async function getSignedUrl(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('test')
      .createSignedUrl(path, 60)

    if (error) {
      throw handleSupabaseError(error, '创建签名URL')
    }
    return data?.signedUrl || null
  } catch (error) {
    console.error('获取公共URL失败:', error)
    return null
  }
}

// 导出工具函数供外部使用
export { generateFileName, validateFile, formatFileSize }