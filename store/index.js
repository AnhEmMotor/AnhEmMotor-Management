import { createStore } from 'vuex';
import coachesModule from './modules/coaches';
import requestsModule from './modules/requests';
import authModule from './modules/auth.js';
import brandsModule from './modules/brands.js';
import productCategoriesModule from './modules/productCategories.js';
import productsModule from './modules/products.js';
import suppliersModule from './modules/suppliers.js';
import inputsModule from './modules/inputs.js';
import outputsModule from './modules/outputs.js';

const store = createStore({
  modules: {
    coaches: coachesModule,
    requests: requestsModule,
    auth: authModule,
    brands: brandsModule,
    productCategories: productCategoriesModule,
    products: productsModule,
    suppliers: suppliersModule,
    inputs: inputsModule,
    outputs: outputsModule,
  },
});

export default store;
