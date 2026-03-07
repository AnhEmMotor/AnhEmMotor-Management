import axiosInstance from './axios';

const BASE_URL = '/api/v1/predefinedoption';

export const getPredefinedOptions = async () => {
  const { data } = await axiosInstance.get(BASE_URL);
  return data;
};
