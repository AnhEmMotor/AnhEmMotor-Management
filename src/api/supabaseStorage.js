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

export const deleteFile = async (path, bucketName) => {
  const { data, error } = await supabase.storage.from(bucketName).remove([path])

  if (error) {
    throw error
  }

  return data
}
