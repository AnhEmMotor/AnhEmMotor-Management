// SUPABASE STORAGE HAS BEEN REMOVED.
// TODO: Implement new file upload logic using the real API.

export const uploadFile = async (file, bucketName) => {
  console.warn('uploadFile not implemented', file, bucketName)
  return ''
}

export const getPublicUrl = (path, bucketName) => {
  console.warn('getPublicUrl not implemented', path, bucketName)
  return ''
}

export const deleteFile = async (url, bucketName) => {
  console.warn('deleteFile not implemented', url, bucketName)
  return
}

/*
ORIGINAL SUPABASE IMPLEMENTATION:
import { supabase } from '@/lib/supabaseClient'

const getFileExtension = (filename) => {
  return filename.split('.').pop()
}

const generateUniqueFilename = (filename) => {
  const extension = getFileExtension(filename)
  return `${crypto.randomUUID()}.${extension}`
}

export const uploadFile = async (file, bucketName) => {
  const filename = generateUniqueFilename(file.name)
  const { data, error } = await supabase.storage.from(bucketName).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw error
  }

  return data.path
}

export const getPublicUrl = (path, bucketName) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
}

const getFilePath = (url, bucketName) => {
  const path = url.split(`${bucketName}/`)[1]
  return path
}

export const deleteFile = async (url, bucketName) => {
  if (!url || url.includes('placehold.co')) {
    return
  }
  const filePath = getFilePath(url, bucketName)
  if (!filePath) {
    return
  }
  const { data, error } = await supabase.storage.from(bucketName).remove([filePath])
  if (error) {
    if (error.message.includes('The resource was not found')) {
      console.warn(`File already deleted or not found in storage: ${filePath}`)
      return
    }
    throw new Error(`Delete failed: ${error.message}`)
  }
  return data
}
*/
