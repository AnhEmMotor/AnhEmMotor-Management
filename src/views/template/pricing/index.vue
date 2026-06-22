<template>
  <div
    class="pt-24 px-20 max-md:!pt-15 max-sm:!px-5 max-md:!px-8 bg-transparent !border-none"
  >
    <div class="mb-10 text-center">
      <h1 class="mb-2 text-4xl font-medium max-sm:text-3xl">
        {{ $t("admin.t221") }}
      </h1>
      <h2 class="mb-2.5 text-2xl font-normal text-g-600 max-sm:text-2xl">
        {{ $t("admin.t222") }}
      </h2>
      <div class="gap-2 flex-cc mt-2.5 max-sm:mt-3.5 max-sm:!block">
        <p class="text-sm italic text-g-600 max-sm:text-sm">
          {{ $t("admin.t223") }}
        </p>
        <ElTag type="success" size="large" round class="max-sm:mt-3.5">{{
          $t("admin.t224")
        }}</ElTag>
      </div>
    </div>

    <div class="mt-20 max-md:mt-0">
      <ElRow :gutter="20" justify="center">
        <ElCol
          v-for="plan in pricingPlans"
          :key="plan.type"
          :xs="24"
          :sm="12"
          :md="6"
          class="mb-5"
        >
          <ElCard class="flex flex-col h-full rounded-xl">
            <div class="mb-5">
              <h3 class="mb-2.5 text-xl font-medium">{{ plan.title }}</h3>
              <p
                class="h-10 pb-5 mb-5 overflow-hidden text-sm text-g-600 text-ellipsis border-b border-g-300/80 line-clamp-2"
              >
                {{ plan.description }}
              </p>
              <div class="mt-7.5">
                <span class="text-3xl font-medium">¥{{ plan.price }}</span>
                <span class="ml-2.5 text-sm text-g-600">{{
                  $t("admin.t225")
                }}</span>
              </div>
            </div>

            <div class="flex-grow mb-5">
              <div
                v-for="(feature, index) in plan.features"
                :key="index"
                class="flex-c mb-2.5 text-sm"
              >
                <ElIcon
                  class="mr-2.5"
                  :class="feature.available ? '!text-theme' : '!text-danger'"
                >
                  <Check v-if="feature.available" />
                  <Close v-else />
                </ElIcon>
                <span>{{ feature.text }}</span>
              </div>
            </div>

            <div class="mt-auto text-center">
              <ElButton type="primary" class="w-full h-10" v-ripple>{{
                $t("admin.t226")
              }}</ElButton>
            </div>
          </ElCard>
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Check, Close } from "@element-plus/icons-vue";

defineOptions({ name: "Pricing" });

interface Feature {
  text: string;
  available: boolean;
}

interface PricingPlan {
  type: string;
  title: string;
  description: string;
  price: number;
  features: Feature[];
}

const pricingPlans = ref<PricingPlan[]>([
  {
    type: "single",
    title: "đơnlầnkhiếndùngbản",
    description:
      "thíchdùngởđơnchiếcnhấtcuốisinhsản phẩm，nhấtcuốiNguoiDungvôcầntrảphí。",
    price: 349,
    features: [
      { text: "Đầy đủnguồnđạimã", available: true },
      { text: "kỹthuậtTaiLieu", available: true },
      { text: "SaaSỨng dụngtraoquyền", available: false },
      { text: "đơnchiếcmụcmụckhiếndùng", available: true },
      { text: "mộtnămkỹthuậtchiếctrì", available: true },
      { text: "mộtnămmiễnphíCập nhật", available: true },
    ],
  },
  {
    type: "multiple",
    title: "đalầnkhiếndùngbản",
    description:
      "thíchdùngởvôhạnchiếcnhấtcuốisinhsản phẩm，nhấtcuốiNguoiDungvôcầntrảphí。",
    price: 629,
    features: [
      { text: "Đầy đủnguồnđạimã", available: true },
      { text: "kỹthuậtTaiLieu", available: true },
      { text: "SaaSỨng dụngtraoquyền", available: false },
      { text: "vôhạnmụcmụckhiếndùng", available: true },
      { text: "mộtnămkỹthuậtchiếctrì", available: true },
      { text: "mộtnămmiễnphíCập nhật", available: true },
    ],
  },
  {
    type: "extended",
    title: "mởtriểntraoquyềnbản",
    description:
      "thíchdùngởđơnchiếcnhấtcuốisinhsản phẩm，nhấtcuốiNguoiDungcầncầntrảphí。",
    price: 2099,
    features: [
      { text: "Đầy đủnguồnđạimã", available: true },
      { text: "kỹthuậtTaiLieu", available: true },
      { text: "SaaSỨng dụngtraoquyền", available: true },
      { text: "đơnchiếcmụcmụckhiếndùng", available: true },
      { text: "mộtnămkỹthuậtchiếctrì", available: true },
      { text: "mộtnămmiễnphíCập nhật", available: true },
    ],
  },
  {
    type: "unlimited",
    title: "vôhạntraoquyềnbản",
    description:
      "thíchdùngởvôhạnchiếcnhấtcuốisinhsản phẩm，nhấtcuốiNguoiDungcầncầntrảphí。",
    price: 3499,
    features: [
      { text: "Đầy đủnguồnđạimã", available: true },
      { text: "kỹthuậtTaiLieu", available: true },
      { text: "SaaSỨng dụngtraoquyền", available: true },
      { text: "vôhạnmụcmụckhiếndùng", available: true },
      { text: "mộtnămkỹthuậtchiếctrì", available: true },
      { text: "mộtnămmiễnphíCập nhật", available: true },
    ],
  },
]);
</script>
