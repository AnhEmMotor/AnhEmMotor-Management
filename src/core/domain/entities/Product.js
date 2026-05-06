export class Product {
  constructor({
    id,
    name,
    slug,
    description,
    price,
    statusId,
    images = [],
    variants = [],
    category = null,
    brand = null
  }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.price = price;
    this.statusId = statusId;
    this.images = images;
    this.variants = variants;
    this.category = category;
    this.brand = brand;
  }

  get formattedPrice() {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(this.price);
  }

  get mainImage() {
    return this.images.length > 0 ? this.images[0].url : '/placeholder.png';
  }
}

