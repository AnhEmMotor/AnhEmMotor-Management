import axiosInstance from './axios';

const BASE_URL = '/api/v1/mediafile';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosInstance.post(`${BASE_URL}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const uploadImages = async (files) => {
  return Promise.all(files.map((file) => uploadImage(file)));
};

export const getViewUrl = (storagePath, width) => {
  const base = `${BASE_URL}/view-image/${encodeURIComponent(storagePath)}`;
  return width ? `${base}?width=${width}` : base;
};

export const deleteImage = async (storagePath) => {
  await axiosInstance.delete(`${BASE_URL}/${encodeURIComponent(storagePath)}`);
};
