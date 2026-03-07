import axiosInstance from './axios';

const BASE_URL = '/api/v1/productcategory';

export const getCategoriesForManager = async (params = { PageSize: 1000 }) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/for-manager`, { params });
  return data;
};

export const fetchCategories = async ({ page, limit, search } = {}) => {
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

export const getAllProductCategories = async () => {
  const { data } = await axiosInstance.get(BASE_URL, { params: { PageSize: 1000 } });
  return data;
};


export const getCategoryById = async (id) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/${id}`);
  return data;
};

export const createProductCategory = async (category) => {
  const { data } = await axiosInstance.post(BASE_URL, category);
  return data;
};

export const updateProductCategory = async (id, category) => {
  const { data } = await axiosInstance.put(`${BASE_URL}/${id}`, category);
  return data;
};

export const deleteProductCategory = async (id) => {
  await axiosInstance.delete(`${BASE_URL}/${id}`);
};
