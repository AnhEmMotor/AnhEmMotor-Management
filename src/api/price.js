import axiosInstance from './axios';

export const fetchProductsForPricing = async (params) => {
  const { data } = await axiosInstance.get('/api/v1/product/for-manager', { params });
  return data;
};

export const updateProductPrice = async (id, price) => {
  const { data } = await axiosInstance.patch(`/api/v1/product/${id}/price`, { price });
  return data;
};

export const updateVariantPrice = async (variantId, price) => {
  const { data } = await axiosInstance.patch(`/api/v1/product/variant/${variantId}/price`, { price });
  return data;
};
