<template>
  <div class="resp-page banner-container">
    <div class="banner-image">
      <img src="@/assets/images/banner/warehouse_banner.webp" alt="Warehouse Banner" />
    </div>

    <div class="info-cards-container">
      <div class="info-card">
        <div class="card-badge bg-green">
          <ArtSvgIcon icon="ri:customer-service-2-line" /> HỖ TRỢ KỸ THUẬT
        </div>
        <h2 class="card-title">CÔNG TY TNHH <span class="text-amber">ANH EM MOTOR</span></h2>
        <p class="card-text">
          Cảm ơn Quý khách đã tin tưởng sử dụng hệ thống. AnhEm Motor luôn ghi nhận, đồng hành và hỗ
          trợ liên tục 24/7 trong quá trình vận hành, khai thác hệ thống.
        </p>

        <div class="address-line">
          <ArtSvgIcon icon="ri:map-pin-line" class="icon-amber" />
          <div class="address-content">
            <strong>Địa chỉ</strong>
            <span>Khu phố 6, P. Linh Trung, Thủ Đức, TP. Hồ Chí Minh, Việt Nam</span>
          </div>
        </div>

        <div class="contact-grid">
          <div class="contact-box">
            <div class="box-icon">
              <ArtSvgIcon icon="ri:mail-line" class="icon-amber" />
            </div>
            <div class="box-content">
              <div class="contact-label">Email</div>
              <div class="contact-value">info@anhemmotor.com</div>
            </div>
          </div>
          <div class="contact-box">
            <div class="box-icon">
              <ArtSvgIcon icon="ri:phone-line" class="icon-amber" />
            </div>
            <div class="box-content">
              <div class="contact-label">Hotline</div>
              <div class="contact-value">0976 888 438</div>
            </div>
          </div>
          <div class="contact-box">
            <div class="box-icon">
              <ArtSvgIcon icon="ri:chat-3-line" class="icon-amber" />
            </div>
            <div class="box-content">
              <div class="contact-label">Zalo OA</div>
              <div class="contact-value">0976 888 438</div>
            </div>
          </div>
          <div class="contact-box">
            <div class="box-icon">
              <ArtSvgIcon icon="ri:facebook-circle-line" class="icon-amber" />
            </div>
            <div class="box-content">
              <div class="contact-label">FanPage</div>
              <div class="contact-value">AnhEmMotor</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <div class="card-badge bg-amber">QUẢN LÝ KHO & HẬU CẦN</div>
          <div class="website-link"><ArtSvgIcon icon="ri:global-line" /> anhemmotor.com</div>
        </div>

        <h2 class="card-title-dark">Hệ sinh thái quản lý xuất nhập tồn & vận tải</h2>
        <p class="card-text">
          Tối ưu hóa quy trình kiểm kê, quản lý nhà cung cấp, theo dõi nhập xuất kho và vận chuyển
          hàng hóa, đảm bảo nguồn cung xuyên suốt.
        </p>

        <div class="action-buttons">
          <div class="action-btn btn-dark">
            <div class="btn-icon">
              <ArtSvgIcon icon="ri:inbox-unarchive-line" />
            </div>
            <div class="btn-text">
              <span class="btn-title">QUẢN LÝ TỒN KHO</span>
              <span class="btn-subtitle">anhemmotor.com</span>
            </div>
            <ArtSvgIcon icon="ri:share-box-line" class="external-icon" />
          </div>
          <div class="action-btn btn-light">
            <div class="btn-icon text-amber">
              <ArtSvgIcon icon="ri:truck-line" />
            </div>
            <div class="btn-text">
              <span class="btn-title text-amber">VẬN CHUYỂN & HẬU CẦN</span>
              <span class="btn-subtitle">anhemmotor.com</span>
            </div>
            <ArtSvgIcon icon="ri:share-box-line" class="external-icon text-amber" />
          </div>
        </div>

        <div class="divider"></div>

        <div class="tags-section">
          <div class="tags-title">Nền tảng & phân hệ nổi bật</div>
          <div class="tags-list">
            <span class="tag">XUẤT NHẬP TỒN</span>
            <span class="tag">NHÀ CUNG CẤP</span>
            <span class="tag">KIỂM KÊ KHO</span>
            <span class="tag">THEO DÕI VẬN ĐƠN</span>
            <span class="tag">QUẢN LÝ TÀI SẢN</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue';
</script>

<style scoped lang="scss">
.banner-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color-page);
  overflow-y: auto;
  padding: 0 16px 16px;
}

.banner-image {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 24px;
}

.banner-image img {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.info-cards-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
}

@media (width <= 1024px) {
  .info-cards-container {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background-color: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
  border: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  color: var(--el-bg-color-overlay);
  width: fit-content;
  margin-bottom: 16px;
}

.bg-green {
  background-color: #219653;
}

.bg-amber {
  background-color: #d97706;
}

.text-amber {
  color: #d97706;
}

.icon-amber {
  color: #d97706;
  font-size: 18px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}

.card-title-dark {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}

.card-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  margin: 0 0 20px;
}

.address-line {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;

  .address-content {
    display: flex;
    flex-direction: column;

    strong {
      font-size: 14px;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    span {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.contact-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  background-color: var(--el-bg-color-overlay);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgb(217 119 6 / 15%);
  }

  .box-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .box-content {
    display: flex;
    flex-direction: column;
  }

  .contact-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 2px;
  }

  .contact-value {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.website-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;

  :deep(svg) {
    color: #d97706;
  }
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  .btn-icon {
    font-size: 20px;
    margin-right: 12px;
  }

  .btn-text {
    display: flex;
    flex-direction: column;

    .btn-title {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .btn-subtitle {
      font-size: 12px;
      opacity: 0.8;
    }
  }

  .external-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.7;
  }
}

.btn-dark {
  background-color: var(--el-text-color-primary);
  color: var(--el-bg-color-overlay);

  &:hover {
    opacity: 0.9;
  }
}

.btn-light {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid #fcd34d;
  color: var(--el-text-color-primary);

  &:hover {
    box-shadow: 0 2px 8px rgb(217 119 6 / 15%);
  }
}

.divider {
  height: 1px;
  background-color: #eaeaea;
  margin-bottom: 20px;
}

.tags-section {
  .tags-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background-color: var(--el-fill-color-dark);
    color: var(--el-text-color-regular);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
  }
}
</style>
