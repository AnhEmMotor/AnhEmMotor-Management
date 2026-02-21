import axiosInstance from './axios';

const BASE_URL = '/api/v1/product';

const mapToCreatePayload = (product) => ({
  name: product.name,
  categoryId: product.category_id,
  brandId: product.brand_id,
  statusId: product.status_id,
  description: product.description,
  weight: product.weight,
  dimensions: product.dimensions,
  wheelbase: product.wheelbase,
  seatHeight: product.seat_height,
  groundClearance: product.ground_clearance,
  fuelCapacity: product.fuel_capacity,
  tireSize: product.tire_size,
  frontSuspension: product.front_suspension,
  rearSuspension: product.rear_suspension,
  engineType: product.engine_type,
  maxPower: product.max_power,
  oilCapacity: product.oil_capacity,
  fuelConsumption: product.fuel_consumption,
  transmissionType: product.transmission_type,
  starterSystem: product.starter_system,
  maxTorque: product.max_torque,
  displacement: product.displacement,
  boreStroke: product.bore_stroke,
  compressionRatio: product.compression_ratio,
  variants: (product.variants || []).map((v) => ({
    price: v.price,
    urlSlug: v.url,
    coverImageUrl: v.cover_image_url,
    photoCollection: v.photo_collection || [],
    optionValues: v.optionValues || {},
  })),
});

export const getProductsForManager = async (params = {}) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/for-manager`, { params });
  return data;
};

export const getDeletedProducts = async (params = {}) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/deleted`, { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/${id}/for-manager`);
  return data;
};

export const createProduct = async (product) => {
  const { data } = await axiosInstance.post(BASE_URL, mapToCreatePayload(product));
  return data;
};

export const updateProduct = async (id, product) => {
  const payload = {
    id: product.id,
    name: product.name,
    category_id: product.category_id,
    brand_id: product.brand_id,
    description: product.description,
    weight: product.weight,
    dimensions: product.dimensions,
    wheelbase: product.wheelbase,
    seat_height: product.seat_height,
    ground_clearance: product.ground_clearance,
    fuel_capacity: product.fuel_capacity,
    tire_size: product.tire_size,
    front_suspension: product.front_suspension,
    rear_suspension: product.rear_suspension,
    engine_type: product.engine_type,
    max_power: product.max_power,
    oil_capacity: product.oil_capacity,
    fuel_consumption: product.fuel_consumption,
    transmission_type: product.transmission_type,
    starter_system: product.starter_system,
    max_torque: product.max_torque,
    displacement: product.displacement,
    bore_stroke: product.bore_stroke,
    compression_ratio: product.compression_ratio,
    variants: (product.variants || []).map((v) => ({
      id: v.id || null,
      price: v.price,
      url: v.url,
      cover_image_url: v.cover_image_url,
      photo_collection: v.photo_collection || [],
      optionValues: v.optionValues || {},
    })),
  };
  const { data } = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  await axiosInstance.delete(`${BASE_URL}/${id}`);
};

export const deleteManyProducts = async (ids) => {
  await axiosInstance.delete(`${BASE_URL}/delete-many`, { data: { ids } });
};

export const restoreProduct = async (id) => {
  const { data } = await axiosInstance.post(`${BASE_URL}/restore/${id}`);
  return data;
};

export const checkSlug = async (slug) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/check-slug`, { params: { slug } });
  return data;
};

export const updateProductStatus = async (id, statusId) => {
  const { data } = await axiosInstance.patch(`${BASE_URL}/${id}/status`, { id, statusId });
  return data;
};

export const updateProductPrice = async (id, price) => {
  const { data } = await axiosInstance.patch(`${BASE_URL}/${id}/price`, { id, price });
  return data;
};

export const getVariantsLiteForManager = async (params = {}) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/variants-lite/for-manager`, { params });
  return data;
};

export const getVariantsLiteForInput = async (params = {}) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/variants-lite/for-input`, { params });
  return data;
};

export const getVariantsByProductId = async (id) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/${id}/variants-lite`);
  return data;
};
