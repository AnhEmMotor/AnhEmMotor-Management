import { createStore } from 'vuex'
import brandsModule from './modules/brands.js'
import productCategoriesModule from './modules/productCategories.js'
import productsModule from './modules/products.js'
import suppliersModule from './modules/suppliers.js'
import inputsModule from './modules/inputs.js'
import outputsModule from './modules/outputs.js'
import optionsModule from './modules/options.js'
import optionValuesModule from './modules/optionValues.js'
import priceModule from './modules/price.js'
import ordersModule from './modules/orders.js'

const store = createStore({
  modules: {
    brands: brandsModule,
    inputs: inputsModule,
    options: optionsModule,
    option_values: optionValuesModule,
    outputs: outputsModule,
    productCategories: productCategoriesModule,
    products: productsModule,
    suppliers: suppliersModule,
    price: priceModule,
    orders: ordersModule,
  },
})

export default store
