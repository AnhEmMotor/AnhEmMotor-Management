import { h } from "vue";

export class ComponentLoader {
  private modules: Record<string, () => Promise<any>>;

  constructor() {
    this.modules = import.meta.glob("../../views/**/*.vue");
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
      .replace(/^@\/views\//, "/")
      .replace(/\.vue$/, "");
    const fullPath = `../../views${pathStr}.vue`;
    const fullPathWithIndex = `../../views${pathStr}/index.vue`;

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
    return () => import("@/views/index/index.vue");
  }

  loadIframe(): () => Promise<any> {
    return () => import("@/views/outside/Iframe.vue");
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
