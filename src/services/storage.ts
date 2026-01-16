import { supabase } from '~db'
import { ErrorCode, StorageError } from '~utils/errors'
import { StoragePath } from '~types/storage'
import { UPLOAD_CONFIG } from '~app/config'

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

function validateFile(file: File): void {
  if (file.size > UPLOAD_CONFIG.maxSize) {
    throw new StorageError(
      `文件大小超过限制。最大允许: ${formatFileSize(UPLOAD_CONFIG.maxSize)}, 实际大小: ${formatFileSize(file.size)}`,
      ErrorCode.FILE_SIZE_EXCEEDED
    )
  }
  
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    throw new StorageError(
      `不支持的文件类型: ${file.type}。支持的类型: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`,
      ErrorCode.UNSUPPORTED_FILE_TYPE
    )
  }
}

export async function uploadFile(
  file: File, 
  path: StoragePath
): Promise<string> {
  validateFile(file)
  
  const fileName = generateFileName(file)
  const filePath = `${path}/${fileName}`
  
  await supabase.storage
    .from('test')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  return filePath

}

export async function downloadFile(path: string): Promise<Blob | null> {
  const { data } = await supabase.storage
    .from('test')
    .download(path)
  
  return data || null

}

export async function deleteFile(path: string): Promise<void> {
  
  await supabase.storage
    .from('test')
    .remove([path])

}

export async function getSignedUrl(path: string): Promise<string | null> {
  
  const { data } = await supabase.storage
    .from('test')
    .createSignedUrl(path, 60)
  
  return data?.signedUrl || null

}

export { generateFileName, validateFile, formatFileSize }
