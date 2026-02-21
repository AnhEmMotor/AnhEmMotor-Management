import axiosInstance from './axios';

const BASE_URL = '/api/v1/brand';

export const fetchBrands = async ({ page, limit, search } = {}) => {
  const params = { Page: page, PageSize: limit };
  if (search) params.Filters = `name@=*${search}`;
  const { data } = await axiosInstance.get(BASE_URL, { params });
  return {
    data: data.items || [],
    pagination: {
      totalPages: data.totalPages || 1,
      totalCount: data.totalCount || 0,
    },
  };
};

export const getAllBrands = async () => {
  const { data } = await axiosInstance.get(BASE_URL, { params: { PageSize: 1000 } });
  return data;
};

export const getBrandById = async (id) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/${id}`);
  return data;
};

export const createBrand = async (brand) => {
  const { data } = await axiosInstance.post(BASE_URL, brand);
  return data;
};

export const updateBrand = async (id, brand) => {
  const { data } = await axiosInstance.put(`${BASE_URL}/${id}`, brand);
  return data;
};

export const deleteBrand = async (id) => {
  await axiosInstance.delete(`${BASE_URL}/${id}`);
};
