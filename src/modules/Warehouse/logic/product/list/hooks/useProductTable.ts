import { ref, watch, computed, reactive } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { TechnologyApi } from "@/api/product";
import { ProductApi } from "@/api/product";
import { CategoryApi } from "@/api/product";
import { BrandApi } from "@/api/product";
import { SupplierApi } from "@/api/supplier";
import { useTable } from "@/common/composables/useTable";
import type { Product } from "@/domain/product/product.types";
import type { ProductCategory } from "@/domain/product/category.types";
import type { Brand } from "@/domain/product/brand.types";
import type { Technology } from "@/domain/product/technology.types";
import { ElMessage, ElMessageBox } from "element-plus";
import { buildTree } from "@/common/utils";

export function useProductTable() {
  const categories = ref<ProductCategory[]>([]);
  const categoryTree = computed(() => {
    return buildTree(categories.value);
  });
  const availableTechnologies = ref<Technology[]>([]);
  const selectedTechIds = ref<number[]>([]);
  const loadingCategories = ref(false);
  const loadingTechs = ref(false);
  const predefinedOptions = ref<Record<string, string>>({});
  const availablePredefinedOptions = computed(() =>
    Object.entries(predefinedOptions.value)
      .filter(
        ([key, value]) =>
          !["color", "màu sắc"].includes(key.trim().toLowerCase()) &&
          !["color", "màu sắc"].includes(value.trim().toLowerCase()),
      )
      .map(([key, label]) => ({ key, label })),
  );
  const suppliersList = ref<any[]>([]);

  const brandCache = reactive(new Map<number, Brand>());

  const cacheBrands = (items: Brand[]) => {
    items.forEach((item) => {
      if (item && item.id) {
        brandCache.set(item.id, item);
      }
    });
  };

  const ensureBrandLoaded = async (id?: number) => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;
    if (brandCache.has(numId)) return;

    try {
      const brand = await BrandApi.getById(numId);
      if (brand) {
        brandCache.set(numId, brand);
      }
    } catch (err) {
      console.error(`Failed to load brand ${numId}:`, err);
    }
  };

  const getBrandNameById = (id?: number) => {
    if (!id) return "";
    const numId = Number(id);
    return brandCache.get(numId)?.name || `Thương hiệu #${numId}`;
  };

  const brandSelectorVisible = ref(false);
  const brandSelectorLoading = ref(false);
  const brandSelectorQuery = ref("");
  const brandSelectorPage = ref(1);
  const brandSelectorPageSize = ref(12);
  const brandSelectorTotal = ref(0);
  const brandSelectorItems = ref<Brand[]>([]);
  const brandSelectorCallback = ref<((brand: Brand) => void) | null>(null);

  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const formData = ref<Partial<Product>>({
    product_technologies: [],
  });
  const submitting = ref(false);

  const technologyCategories = ref<any[]>([]);

  const fetchTechnologies = async () => {
    loadingTechs.value = true;
    try {
      const res = await TechnologyApi.getList();
      availableTechnologies.value = res || [];
    } catch (_err) {
      console.error("Failed to fetch techs:", _err);
    } finally {
      loadingTechs.value = false;
    }
  };

  const fetchTechnologyCategories = async () => {
    try {
      const res = await TechnologyApi.getCategories();
      technologyCategories.value = res || [];
    } catch (_err) {
      console.error("Failed to fetch tech categories:", _err);
    }
  };

  const fetchPredefinedOptions = async () => {
    try {
      predefinedOptions.value = await ProductApi.getPredefinedOptions();
    } catch (err) {
      console.error("Failed to fetch predefined options:", err);
      predefinedOptions.value = {};
    }
  };

  const createTechnology = async (techData: {
    name: string;
    categoryId?: number;
    brandId?: number;
    defaultTitle?: string;
    defaultDescription?: string;
    defaultImageUrl?: string;
  }) => {
    try {
      const newTech = await TechnologyApi.create(techData);
      ElMessage.success("Tạo công nghệ mới thành công");
      await fetchTechnologies();
      return newTech;
    } catch (err: any) {
      ElMessage.error(err.message || "Tạo công nghệ thất bại");
      throw err;
    }
  };

  const createTechnologyCategory = async (name: string) => {
    try {
      const newCat = await TechnologyApi.createCategory({ name });
      ElMessage.success("Tạo nhóm công nghệ thành công");
      await fetchTechnologyCategories();
      return newCat;
    } catch (err: any) {
      ElMessage.error(err.message || "Tạo nhóm công nghệ thất bại");
      throw err;
    }
  };

  const updateTechnology = async (id: number, techData: any) => {
    try {
      const updatedTech = await TechnologyApi.update(id, techData);
      ElMessage.success("Cập nhật công nghệ thành công");
      await fetchTechnologies();
      return updatedTech;
    } catch (err: any) {
      ElMessage.error(err.message || "Cập nhật công nghệ thất bại");
      throw err;
    }
  };

  const deleteTechnology = async (id: number) => {
    try {
      await TechnologyApi.delete(id);
      ElMessage.success("Xóa công nghệ thành công");
      await fetchTechnologies();
      selectedTechIds.value = selectedTechIds.value.filter((tid) => tid !== id);
      if (formData.value.highlights_list) {
        formData.value.highlights_list = formData.value.highlights_list.filter(
          (h: any) => Number(h.technology_id) !== id,
        );
      }
    } catch (err: any) {
      ElMessage.error(err.message || "Xóa công nghệ thất bại");
      throw err;
    }
  };

  const fetchCategories = async () => {
    loadingCategories.value = true;
    try {
      const res = await CategoryApi.getList({
        current: 1,
        size: 1000,
        Filters: "CategoryGroup==Product",
      });
      categories.value = res.items || [];
    } catch (_err) {
      console.error("Failed to fetch categories:", _err);
      categories.value = [];
    } finally {
      loadingCategories.value = false;
    }
  };

  const fetchSelectorBrands = async () => {
    brandSelectorLoading.value = true;
    try {
      const filters = [];
      if (brandSelectorQuery.value.trim()) {
        filters.push(`Name@=${brandSelectorQuery.value.trim()}`);
      }

      const res = await BrandApi.getList({
        current: brandSelectorPage.value,
        size: brandSelectorPageSize.value,
        Filters: filters.join(","),
      });

      brandSelectorItems.value = res.items || [];
      brandSelectorTotal.value = res.totalCount || 0;
      cacheBrands(res.items || []);
    } catch (err) {
      console.error("Failed to fetch selector brands:", err);
    } finally {
      brandSelectorLoading.value = false;
    }
  };

  const openBrandSelector = (onSelect: (brand: Brand) => void) => {
    brandSelectorQuery.value = "";
    brandSelectorPage.value = 1;
    brandSelectorCallback.value = onSelect;
    brandSelectorVisible.value = true;
    fetchSelectorBrands();
  };

  const selectBrand = (brand: Brand) => {
    brandCache.set(brand.id, brand);
    if (brandSelectorCallback.value) {
      brandSelectorCallback.value(brand);
    }
    brandSelectorVisible.value = false;
  };

  const handleSelectorSearch = useDebounceFn(async (query: string) => {
    brandSelectorQuery.value = query;
    brandSelectorPage.value = 1;
    await fetchSelectorBrands();
  }, 300);

  const {
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    getData,
    refreshData,
    replaceSearchParams,
    searchParams,
  } = useTable({
    core: {
      apiFn: async (params: any) => {
        const res = await ProductApi.getList(params);
        if (res && res.items) {
          res.items = res.items.map((product: any) => {
            const children = (product.variants || []).map(
              (variant: any, idx: number) => {
                return {
                  id: `variant-${variant.id || idx}-${product.id}`,
                  name: variant.variant_name || `Biến thể ${idx + 1}`,
                  cover_image_url: variant.cover_image_url || "",
                  brand: "",
                  category: "",
                  sku: variant.sku || "",
                  isVariant: true,
                };
              },
            );
            return {
              ...product,
              children: children.length > 0 ? children : undefined,
            };
          });
        }
        return res;
      },
      apiParams: {
        current: 1,
        size: 10,
        Filters: "",
      },
      immediate: true,
      columnsFactory: () => [
        {
          prop: "cover_image_url",
          label: "Hình ảnh",
          width: 120,
          align: "left",
          useSlot: true,
        },
        { prop: "name", label: "Sản phẩm", minWidth: 250, useSlot: true },
        { prop: "brand", label: "Thương hiệu", width: 150 },
        { prop: "category", label: "Thể loại", width: 180 },
        { prop: "origin", label: "Xuất xứ", width: 120 },
        {
          prop: "operation",
          label: "Hành động",
          width: 150,
          align: "center",
          fixed: "right",
          useSlot: true,
        },
      ],
    },
  });

  const handleAdd = () => {
    dialogTitle.value = "Thêm sản phẩm mới";
    formData.value = {
      name: "",
      category_id: undefined,
      brand_id: undefined,
      meta_title: "",
      meta_description: "",
      short_description: "",
      description: "",
      material: "",
      origin: "",
      warranty_period: "",
      unit: "Chiếc",
      std_dot: false,
      std_ece: false,
      std_snell: false,
      std_jis: false,
      other_standards: "",
      compatible_vehicle_model_ids: [],
      cover_image_url: "",
      product_technologies: [],
      engine_type: "",
      max_power: "",
      fuel_capacity: undefined,
      fuel_consumption: "",
      wheelbase: undefined,
      seat_height: undefined,
      ground_clearance: undefined,
      oil_capacity: undefined,
      transmission_type: "",
      starter_system: "",
      max_torque: "",
      displacement: undefined,
      bore_stroke: "",
      compression_ratio: "",
      fuel_system: "",
      frame_type: "",
      front_suspension: "",
      rear_suspension: "",
      front_tire_size: "",
      rear_tire_size: "",
      front_brake: "",
      rear_brake: "",
      battery_type: "",
      lighting_system: "",
      dashboard_type: "",
      highlights_list: [],
      variants: [
        {
          id: null,
          price: null,
          variant_name: "",
          cover_image_url: "",
          colors: [],
          supplier_prices: [],
          sku: "",
          photo_collection: [],
          optionValues: {},
          option_rows: [],
          url_slug: "",
          stock_quantity: 0,
          weight: null,
          dimensions: "",
          wheelbase: null,
          seat_height: null,
          ground_clearance: null,
          fuel_capacity: null,
          tire_size: "",
          showSpecs: false,
        },
      ],
    };
    selectedTechIds.value = [];
    dialogVisible.value = true;
  };

  const handleEdit = async (row: Product) => {
    dialogTitle.value = "Cập nhật sản phẩm";

    try {
      const fullProduct = await ProductApi.getById(row.id);

      fullProduct.meta_title = fullProduct.meta_title || "";
      fullProduct.meta_description = fullProduct.meta_description || "";
      fullProduct.short_description = fullProduct.short_description || "";
      fullProduct.description = fullProduct.description || "";
      fullProduct.material = fullProduct.material || "";
      fullProduct.origin = fullProduct.origin || "";
      fullProduct.warranty_period = fullProduct.warranty_period || "";
      fullProduct.unit = fullProduct.unit || "Chiếc";
      fullProduct.std_dot = !!fullProduct.std_dot;
      fullProduct.std_ece = !!fullProduct.std_ece;
      fullProduct.std_snell = !!fullProduct.std_snell;
      fullProduct.std_jis = !!fullProduct.std_jis;
      fullProduct.other_standards = fullProduct.other_standards || "";
      fullProduct.compatible_vehicle_model_ids =
        fullProduct.compatible_vehicle_model_ids || [];

      fullProduct.engine_type = fullProduct.engine_type || "";
      fullProduct.max_power = fullProduct.max_power || "";
      fullProduct.fuel_capacity = fullProduct.fuel_capacity || undefined;
      fullProduct.fuel_consumption = fullProduct.fuel_consumption || "";
      fullProduct.wheelbase = fullProduct.wheelbase || undefined;
      fullProduct.seat_height = fullProduct.seat_height || undefined;
      fullProduct.ground_clearance = fullProduct.ground_clearance || undefined;
      fullProduct.oil_capacity = fullProduct.oil_capacity || undefined;
      fullProduct.transmission_type = fullProduct.transmission_type || "";
      fullProduct.starter_system = fullProduct.starter_system || "";
      fullProduct.max_torque = fullProduct.max_torque || "";
      fullProduct.displacement = fullProduct.displacement || undefined;
      fullProduct.bore_stroke = fullProduct.bore_stroke || "";
      fullProduct.compression_ratio = fullProduct.compression_ratio || "";
      fullProduct.fuel_system = fullProduct.fuel_system || "";
      fullProduct.frame_type = fullProduct.frame_type || "";
      fullProduct.front_suspension = fullProduct.front_suspension || "";
      fullProduct.rear_suspension = fullProduct.rear_suspension || "";
      fullProduct.front_tire_size = fullProduct.front_tire_size || "";
      fullProduct.rear_tire_size = fullProduct.rear_tire_size || "";
      fullProduct.front_brake = fullProduct.front_brake || "";
      fullProduct.rear_brake = fullProduct.rear_brake || "";
      fullProduct.battery_type = fullProduct.battery_type || "";
      fullProduct.lighting_system = fullProduct.lighting_system || "";
      fullProduct.dashboard_type = fullProduct.dashboard_type || "";

      if (
        fullProduct.product_technologies &&
        Array.isArray(fullProduct.product_technologies)
      ) {
        fullProduct.highlights_list = fullProduct.product_technologies.map(
          (pt: any) => {
            const techId = Number(pt.technology_id);
            const tech = availableTechnologies.value.find(
              (t) => t.id === techId,
            );
            return {
              technology_id: techId,
              custom_title:
                pt.custom_title ??
                pt.title ??
                tech?.defaultTitle ??
                tech?.name ??
                "",
              custom_description:
                pt.custom_description ??
                pt.description ??
                tech?.defaultDescription ??
                "",
              custom_image_url:
                pt.custom_image_url ??
                pt.image_url ??
                tech?.defaultImageUrl ??
                "",
              _defaultTitle: tech?.defaultTitle ?? pt._default_title,
              _defaultDescription:
                tech?.defaultDescription ?? pt._default_description,
              _defaultImageUrl: tech?.defaultImageUrl ?? pt._default_image_url,
              _categoryName:
                (tech?.categoryName ?? pt._category_name) || "TECHNOLOGY",
            };
          },
        );
      } else {
        fullProduct.highlights_list = [];
      }

      if (fullProduct.variants) {
        fullProduct.variants.forEach((v: any) => {
          v.colors = (v.colors || []).map((color: any) => ({
            id: color.id,
            name: color.name ?? color.colorName ?? color.color_name ?? "",
            code:
              color.code ?? color.colorCode ?? color.color_code ?? "#000000",
            image:
              color.image ?? color.coverImageUrl ?? color.cover_image_url ?? "",
            showSupplierPrices: false,
            supplier_prices: (
              color.supplier_prices ||
              color.supplierPrices ||
              []
            ).map((price: any) => ({
              supplier_id: price.supplier_id ?? price.supplierId,
              product_variant_color_id:
                price.product_variant_color_id ??
                price.productVariantColorId ??
                color.id,
              quote_price: price.quote_price ?? price.quotePrice,
              note: price.note || "",
            })),
          }));
          v.optionValues = v.optionValues || {};
          v.option_rows = Object.entries(v.optionValues)
            .filter(
              ([key]) =>
                !["color", "màu sắc"].includes(
                  String(key).trim().toLowerCase(),
                ),
            )
            .map(([key, value]) => ({ key, value: String(value || "") }));
          if (!v.photo_collection) {
            v.photo_collection = [];
          }
          v.url_slug = v.url_slug || "";
          v.stock_quantity = v.stock_quantity ?? 0;

          v.weight = v.weight || null;
          v.dimensions = v.dimensions || "";
          v.wheelbase = v.wheelbase || null;
          v.seat_height = v.seat_height || null;
          v.ground_clearance = v.ground_clearance || null;
          v.fuel_capacity = v.fuel_capacity || null;
          v.tire_size = v.tire_size || "";
          v.showSpecs = !!v.showSpecs;
          v.showSupplierPrices = false;
          v.supplier_prices = (v.supplier_prices || v.supplierPrices || []).map(
            (price: any) => ({
              supplier_id: price.supplier_id ?? price.supplierId,
              product_variant_color_id:
                price.product_variant_color_id ?? price.productVariantColorId,
              quote_price: price.quote_price ?? price.quotePrice,
              note: price.note || "",
            }),
          );
        });
      } else {
        fullProduct.variants = [
          {
            id: null,
            price: null,
            variant_name: "",
            cover_image_url: "",
            colors: [],
            supplier_prices: [],
            showSupplierPrices: false,
            sku: "",
            photo_collection: [],
            optionValues: {},
            option_rows: [],
            url_slug: "",
            stock_quantity: 0,
            weight: null,
            dimensions: "",
            wheelbase: null,
            seat_height: null,
            ground_clearance: null,
            fuel_capacity: null,
            tire_size: "",
            showSpecs: false,
          } as any,
        ];
      }

      formData.value = { ...fullProduct };
      if (formData.value.brand_id) {
        if (fullProduct.brand) {
          brandCache.set(Number(formData.value.brand_id), {
            id: Number(formData.value.brand_id),
            name: fullProduct.brand,
            origin: "",
            logoUrl: "",
            description: "",
          });
        }
        ensureBrandLoaded(Number(formData.value.brand_id));
      }

      selectedTechIds.value = (fullProduct.product_technologies || []).map(
        (pt: any) => pt.technology_id,
      );

      dialogVisible.value = true;
    } catch (_err: any) {
      ElMessage.error("Không thể lấy chi tiết sản phẩm");
    }
  };

  const handleDelete = (row: Product) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa sản phẩm "${row.name}" không?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        await ProductApi.delete(row.id);
        ElMessage.success("Xóa sản phẩm thành công");
        refreshData();
      } catch (_err: any) {
        ElMessage.error(_err.message || "Xóa thất bại");
      }
    });
  };

  const getVariantDefaultCover = (variant: any) => {
    return (variant.cover_image_url || "")
      .split(",")
      .map((image: string) => image.trim())
      .find(Boolean);
  };

  const getColorName = (color: any) =>
    (color.color_name ?? color.colorName ?? color.name ?? "").trim();
  const getColorCode = (color: any) =>
    (color.color_code ?? color.colorCode ?? color.code ?? "").trim();
  const getColorImage = (color: any) =>
    (color.cover_image_url ?? color.coverImageUrl ?? color.image ?? "").trim();

  const submitForm = async () => {
    submitting.value = true;
    try {
      if (formData.value.highlights_list) {
        formData.value.product_technologies =
          formData.value.highlights_list.map((h: any, idx: number) => ({
            technology_id: Number(h.technology_id),
            custom_title: h.custom_title || "",
            custom_description: h.custom_description || "",
            custom_image_url: h.custom_image_url || "",
            display_order: idx + 1,
          }));
      } else {
        formData.value.product_technologies = [];
      }

      const payload: any = { ...formData.value };
      delete payload.highlights;
      delete payload.highlights_list;

      if (formData.value.variants) {
        formData.value.variants.forEach((variant: any) => {
          validateUniqueSupplierPrices(
            variant.supplier_prices || [],
            "Báo giá của biến thể",
          );
          (variant.colors || []).forEach((color: any) => {
            validateUniqueSupplierPrices(
              color.supplier_prices || [],
              "Báo giá của màu",
            );
          });
        });

        const serializedVariants = formData.value.variants.map((v: any) => {
          const colors = v.colors || [];
          const optionValues = (v.option_rows || []).reduce(
            (acc: Record<string, string>, row: any) => {
              const key = (row.key || "").trim();
              const value = (row.value || "").trim();
              if (key && value) {
                acc[key] = value;
              }
              return acc;
            },
            {},
          );
          const hasColors = colors.length > 0;
          if (
            hasColors &&
            colors.some(
              (color: any) =>
                !getColorName(color) ||
                !getColorCode(color) ||
                !getColorImage(color),
            )
          ) {
            throw new Error(
              "Mỗi màu sắc của biến thể phải có đủ tên màu, mã màu và hình ảnh.",
            );
          }
          const colorImages = colors.map(getColorImage).filter(Boolean);
          const photoCollection = (v.photo_collection || []).filter(
            (image: string) => !colorImages.includes((image || "").trim()),
          );
          const cover_image_url = hasColors
            ? ""
            : getVariantDefaultCover(v) || "";
          const serializedColors = colors.map((color: any) => ({
            id: color.id,
            color_name: getColorName(color),
            color_code: getColorCode(color),
            cover_image_url: getColorImage(color),
            supplier_prices: (color.supplier_prices || [])
              .filter(
                (price: any) =>
                  price.supplier_id && Number(price.supplier_id) > 0,
              )
              .map((price: any) => ({
                supplier_id: Number(price.supplier_id),
                quote_price:
                  price.quote_price === "" || price.quote_price === null
                    ? undefined
                    : Number(price.quote_price),
                note: price.note || "",
              })),
          }));

          return {
            id: v.id,
            price: v.price,
            url_slug: v.url_slug,
            cover_image_url,
            photo_collection: photoCollection,
            optionValues,
            variant_name: v.variant_name,
            colors: serializedColors,
            sku: v.sku,
            weight: v.weight,
            dimensions: v.dimensions,
            wheelbase: v.wheelbase,
            seat_height: v.seat_height,
            ground_clearance: v.ground_clearance,
            fuel_capacity: v.fuel_capacity,
            tire_size: v.tire_size,
            front_brake: v.front_brake,
            rear_brake: v.rear_brake,
            front_suspension: v.front_suspension,
            rear_suspension: v.rear_suspension,
            engine_type: v.engine_type,
            showSupplierPrices: undefined,
            supplier_prices: (v.supplier_prices || [])
              .filter(
                (price: any) =>
                  price.supplier_id && Number(price.supplier_id) > 0,
              )
              .map((price: any) => ({
                supplier_id: Number(price.supplier_id),
                quote_price:
                  price.quote_price === "" || price.quote_price === null
                    ? undefined
                    : Number(price.quote_price),
                note: price.note || "",
              })),
          };
        });

        payload.variants = serializedVariants;
        payload.cover_image_url =
          serializedVariants.map(getVariantDefaultCover).find(Boolean) ||
          formData.value.cover_image_url;
      }

      if (formData.value.id) {
        await ProductApi.update(formData.value.id, payload);
        ElMessage.success("Cập nhật sản phẩm thành công");
      } else {
        await ProductApi.create(payload);
        ElMessage.success("Thêm sản phẩm thành công");
      }
      dialogVisible.value = false;
      refreshData();
    } catch (_err: any) {
      ElMessage.error(_err.message || "Thao tác thất bại");
    } finally {
      submitting.value = false;
    }
  };

  const addVariant = () => {
    if (!formData.value.variants) {
      formData.value.variants = [];
    }
    formData.value.variants.push({
      id: null,
      price: null,
      variant_name: "",
      cover_image_url: "",
      colors: [],
      supplier_prices: [],
      showSupplierPrices: false,
      sku: "",
      photo_collection: [],
      optionValues: {},
      option_rows: [],
      url_slug: "",
      stock_quantity: 0,
      weight: null,
      dimensions: "",
      wheelbase: null,
      seat_height: null,
      ground_clearance: null,
      fuel_capacity: null,
      tire_size: "",
      showSpecs: false,
    } as any);
  };

  const removeVariant = (index: number) => {
    if (formData.value.variants) {
      formData.value.variants.splice(index, 1);
      if (formData.value.variants.length === 0) {
        addVariant();
      }
    }
  };

  const addColor = (variant: any) => {
    if (!variant.colors) {
      variant.colors = [];
    }
    variant.cover_image_url = "";
    variant.colors.push({
      name: "",
      code: "#000000",
      image: "",
      supplier_prices: [],
      showSupplierPrices: false,
    });
  };

  const loadSuppliers = async () => {
    try {
      const res = await SupplierApi.getList({ current: 1, size: 1000 });
      suppliersList.value = res.items || [];
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      suppliersList.value = [];
    }
  };

  const removeColor = (variant: any, index: number) => {
    if (variant.colors) {
      variant.colors.splice(index, 1);
    }
  };

  const addVariantOptionValue = (variant: any) => {
    if (!variant.option_rows) {
      variant.option_rows = [];
    }
    variant.option_rows.push({ key: "", value: "" });
  };

  const addVariantSupplierPrice = (variant: any) => {
    if (!variant.supplier_prices) {
      variant.supplier_prices = [];
    }
    variant.showSupplierPrices = true;
    variant.supplier_prices.push({
      supplier_id: undefined,
      quote_price: 0,
      note: "",
    });
  };

  const removeVariantSupplierPrice = (variant: any, index: number) => {
    if (variant.supplier_prices) {
      variant.supplier_prices.splice(index, 1);
    }
  };

  const addColorSupplierPrice = (color: any) => {
    if (!color.supplier_prices) {
      color.supplier_prices = [];
    }
    color.showSupplierPrices = true;
    color.supplier_prices.push({
      supplier_id: undefined,
      quote_price: 0,
      note: "",
    });
  };

  const removeColorSupplierPrice = (color: any, index: number) => {
    if (color.supplier_prices) {
      color.supplier_prices.splice(index, 1);
    }
  };

  const toggleVariantSupplierPrices = (variant: any) => {
    variant.showSupplierPrices = !variant.showSupplierPrices;
  };

  const toggleColorSupplierPrices = (color: any) => {
    color.showSupplierPrices = !color.showSupplierPrices;
  };

  const isSupplierUsedInRows = (
    rows: any[],
    supplierId: number | undefined,
    currentIndex: number,
  ) => {
    if (!supplierId) return false;
    return rows.some(
      (row, idx) =>
        idx !== currentIndex && Number(row?.supplier_id) === Number(supplierId),
    );
  };

  const validateUniqueSupplierPrices = (rows: any[], scopeLabel: string) => {
    const seen = new Set<number>();
    for (const row of rows || []) {
      const supplierId = Number(row?.supplier_id);
      if (!supplierId) continue;
      if (seen.has(supplierId)) {
        throw new Error(
          `${scopeLabel} chỉ được chọn mỗi nhà cung cấp một lần.`,
        );
      }
      seen.add(supplierId);
    }
  };

  const removeVariantOptionValue = (variant: any, index: number) => {
    if (variant.option_rows) {
      variant.option_rows.splice(index, 1);
    }
  };

  const handleSearch = (params: any) => {
    const filters = [];
    if (params.name) filters.push(`Name@=${params.name}`);
    if (params.brand) filters.push(`brand@=${params.brand}`);

    if (params.category_id) {
      if (Array.isArray(params.category_id) && params.category_id.length > 0) {
        const catFilters = params.category_id
          .map((id: number) => `category_id==${id}`)
          .join("|");
        filters.push(catFilters);
      } else if (!Array.isArray(params.category_id)) {
        filters.push(`category_id==${params.category_id}`);
      }
    }

    replaceSearchParams({
      Filters: filters.join(","),
    });
    getData();
  };

  const handleReset = () => {
    replaceSearchParams({
      Filters: "",
    });
    getData();
  };

  const allVehicles = ref<any[]>([]);
  const isVehiclesLoading = ref(false);

  const vehicleCategoryIds = computed(() => {
    return categories.value
      .filter((cat) => {
        const findCategoryRecursive = (cId: number): boolean => {
          const c = categories.value.find((x) => x.id === cId);
          if (!c) return false;
          const currentName = c.name.toLowerCase();
          const vehicleKeywords = [
            "xe máy",
            "xe",
            "vehicle",
            "motor",
            "mô tô",
            "scooter",
            "tay ga",
            "tay côn",
          ];
          if (vehicleKeywords.some((kw) => currentName.includes(kw)))
            return true;
          if (c.parentId) return findCategoryRecursive(c.parentId);
          return false;
        };
        return findCategoryRecursive(cat.id);
      })
      .map((cat) => cat.id);
  });

  const fetchVehicles = async () => {
    isVehiclesLoading.value = true;
    try {
      const res = await ProductApi.getList({
        current: 1,
        size: 1000,
      });
      const ids = vehicleCategoryIds.value;
      allVehicles.value = (res.items || []).filter((p: any) =>
        ids.includes(p.category_id),
      );
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      isVehiclesLoading.value = false;
    }
  };

  watch(categories, () => {
    if (categories.value.length > 0) {
      fetchVehicles();
    }
  });

  const vehicleSearch = ref("");
  const filteredVehicles = computed(() => {
    if (!vehicleSearch.value) return [];
    return allVehicles.value
      .filter((v) =>
        v.name.toLowerCase().includes(vehicleSearch.value.toLowerCase()),
      )
      .slice(0, 10);
  });

  const getVehicleName = (id: number) => {
    return allVehicles.value.find((v) => v.id === id)?.name || `ID: ${id}`;
  };

  const addCompatibleVehicle = (id: number) => {
    if (!formData.value.compatible_vehicle_model_ids) {
      formData.value.compatible_vehicle_model_ids = [];
    }
    if (!formData.value.compatible_vehicle_model_ids.includes(id)) {
      formData.value.compatible_vehicle_model_ids.push(id);
    }
    vehicleSearch.value = "";
  };

  const removeCompatibleVehicle = (id: number) => {
    if (formData.value.compatible_vehicle_model_ids) {
      formData.value.compatible_vehicle_model_ids =
        formData.value.compatible_vehicle_model_ids.filter(
          (vId: number) => vId !== id,
        );
    }
  };

  const toggleTechnology = (tech: any) => {
    if (!formData.value.highlights_list) {
      formData.value.highlights_list = [];
    }

    const techId = Number(tech.id);
    const existingIndex = formData.value.highlights_list.findIndex(
      (h: any) => Number(h.technology_id) === techId,
    );

    if (existingIndex >= 0) {
      formData.value.highlights_list.splice(existingIndex, 1);
      selectedTechIds.value = selectedTechIds.value.filter(
        (id) => Number(id) !== techId,
      );
    } else {
      formData.value.highlights_list.push({
        technology_id: tech.id,
        custom_title: tech.defaultTitle || tech.name,
        custom_description: tech.defaultDescription || "",
        custom_image_url: tech.defaultImageUrl || "",
        _defaultTitle: tech.defaultTitle,
        _defaultDescription: tech.defaultDescription,
        _defaultImageUrl: tech.defaultImageUrl,
        _categoryName: tech.categoryName || "TECHNOLOGY",
      });
      if (!selectedTechIds.value.includes(techId)) {
        selectedTechIds.value.push(techId);
      }
    }
  };

  const isTechnologySelected = (techId: number) => {
    if (!formData.value.highlights_list) return false;
    return formData.value.highlights_list.some(
      (h: any) => Number(h.technology_id) === Number(techId),
    );
  };

  fetchCategories();
  fetchTechnologies();
  fetchTechnologyCategories();
  fetchPredefinedOptions();
  loadSuppliers();

  const exporting = ref(false);

  const exportToExcel = async () => {
    exporting.value = true;
    try {
      const exportParams: any = {};
      const filters = (searchParams as any)?.Filters;
      if (filters) {
        exportParams.Filters = filters;
      }

      const resBlob: any = await ProductApi.exportProducts(exportParams);

      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Danh_sach_san_pham_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      ElMessage.success("Xuất file Excel thành công");
    } catch (err: any) {
      console.error(err);
      ElMessage.error(err.message || "Xuất file Excel thất bại");
    } finally {
      exporting.value = false;
    }
  };

  return {
    categories,
    categoryTree,
    brandSelectorVisible,
    brandSelectorLoading,
    brandSelectorQuery,
    brandSelectorPage,
    brandSelectorPageSize,
    brandSelectorTotal,
    brandSelectorItems,
    openBrandSelector,
    selectBrand,
    handleSelectorSearch,
    ensureBrandLoaded,
    getBrandNameById,
    fetchSelectorBrands,
    loadingCategories,
    availableTechnologies,
    availablePredefinedOptions,
    suppliersList,
    selectedTechIds,
    loadingTechs,
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData,

    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
    addVariant,
    removeVariant,
    addColor,
    removeColor,
    addVariantOptionValue,
    removeVariantOptionValue,
    addVariantSupplierPrice,
    removeVariantSupplierPrice,
    addColorSupplierPrice,
    removeColorSupplierPrice,
    toggleVariantSupplierPrices,
    toggleColorSupplierPrices,
    isSupplierUsedInRows,
    validateUniqueSupplierPrices,

    vehicleSearch,
    filteredVehicles,
    isVehiclesLoading,
    getVehicleName,
    addCompatibleVehicle,
    removeCompatibleVehicle,
    toggleTechnology,
    isTechnologySelected,

    technologyCategories,
    createTechnology,
    createTechnologyCategory,
    updateTechnology,
    deleteTechnology,
    fetchTechnologies,

    exporting,
    exportToExcel,
  };
}
