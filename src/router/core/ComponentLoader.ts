import { h } from "vue";

export class ComponentLoader {
  private modules: Record<string, () => Promise<any>>;

  constructor() {
    this.modules = import.meta.glob("../../modules/**/*.vue");
  }

  load(componentPath: any): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent();
    }

    // Nếu componentPath đã là một hàm import động, trả về nó luôn
    if (typeof componentPath === "function") {
      return componentPath as () => Promise<any>;
    }

    const pathStr = String(componentPath)
      .replace(/^@\/modules\//, "/")
      .replace(/\.vue$/, "");
    const fullPath = `../../modules${pathStr}.vue`;
    const fullPathWithIndex = `../../modules${pathStr}/index.vue`;

    const module = this.modules[fullPath] || this.modules[fullPathWithIndex];

    if (!module) {
      console.error(
        `[ComponentLoader] ChưatìmđếnComponent: ${pathStr}，thửthửquacủađường: ${fullPath} và ${fullPathWithIndex}`,
      );
      return this.createErrorComponent(pathStr);
    }

    return module;
  }

  loadLayout(): () => Promise<any> {
    return () => import("@/modules/index/index.vue");
  }

  loadIframe(): () => Promise<any> {
    return () => import("@/modules/outside/Iframe.vue");
  }

  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h("div", {});
        },
      });
  }

  private createErrorComponent(componentPath: string): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h(
            "div",
            { class: "route-error" },
            `ComponentChưatìmđến: ${componentPath}`,
          );
        },
      });
  }
}
