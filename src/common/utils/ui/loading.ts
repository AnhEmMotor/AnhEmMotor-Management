import { createVNode, render } from "vue";
import LoadingOverlay from "@/view/common/loading-overlay/index.vue";

interface LoadingInstance {
  close: () => void;
}

let loadingInstance: LoadingInstance | null = null;
let loadingContainer: HTMLElement | null = null;

export const loadingService = {
  showLoading(text = "Đang tải dữ liệu"): () => void {
    if (!loadingInstance) {
      if (!loadingContainer) {
        loadingContainer = document.createElement("div");
        document.body.appendChild(loadingContainer);
      }

      const vnode = createVNode(LoadingOverlay, { visible: true, text });
      render(vnode, loadingContainer);

      loadingInstance = {
        close: () => {
          if (loadingContainer) {
            const closeVnode = createVNode(LoadingOverlay, {
              visible: false,
              text,
            });
            render(closeVnode, loadingContainer);

            // Wait for transition to complete before removing
            setTimeout(() => {
              if (loadingContainer) {
                render(null, loadingContainer);
                loadingContainer.remove();
                loadingContainer = null;
              }
            }, 400);
          }
          loadingInstance = null;
        },
      };
    }
    return () => this.hideLoading();
  },

  hideLoading(): void {
    if (loadingInstance) {
      loadingInstance.close();
    }
  },
};
