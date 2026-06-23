<template>
  <div class="editor-wrapper">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :mode="mode"
      :defaultConfig="toolbarConfig"
    />
    <Editor
      :style="{ height: height, overflowY: 'hidden' }"
      v-model="modelValue"
      :mode="mode"
      :defaultConfig="editorConfig"
      @onCreated="onCreateEditor"
    />
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import { onBeforeUnmount, onMounted, shallowRef, computed } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { useUserStore } from "@/application/store/user";
import EmojiText from "@/common/utils/ui/emojo";
import {
  i18nChangeLanguage,
  IDomEditor,
  IToolbarConfig,
  IEditorConfig,
} from "@wangeditor/editor";
import request from "@/common/utils/http";

i18nChangeLanguage("en");

defineOptions({ name: "ArtWangEditor" });

type InsertFnType = (url: string, alt: string, href: string) => void;

const { VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT } = import.meta.env;

interface Props {
  height?: string;
  toolbarKeys?: string[];
  insertKeys?: { index: number; keys: string[] };
  excludeKeys?: string[];
  mode?: "default" | "simple";
  placeholder?: string;
  uploadConfig?: {
    maxFileSize?: number;
    maxNumberOfFiles?: number;
    server?: string;
    isCustomUpload?: boolean;
  };
}

const props = withDefaults(defineProps<Props>(), {
  height: "500px",
  mode: "default",
  placeholder: "Bắt đầu viết nội dung bài viết tại đây...",
  excludeKeys: () => ["fontFamily"],
  isCustomUpload: false,
});

const modelValue = defineModel<string | undefined>();

const editorRef = shallowRef<IDomEditor>();
const userStore = useUserStore();

const DEFAULT_UPLOAD_CONFIG = {
  maxFileSize: 3 * 1024 * 1024,
  maxNumberOfFiles: 10,
  fieldName: "file",
  allowedFileTypes: ["image/*"],
} as const;

const uploadServer = computed(
  () =>
    props.uploadConfig?.server ||
    `${VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT}/api/v1/news/images/content`,
);

const mergedUploadConfig = computed(() => ({
  ...DEFAULT_UPLOAD_CONFIG,
  ...props.uploadConfig,
}));

const toolbarConfig = computed((): Partial<IToolbarConfig> => {
  const config: Partial<IToolbarConfig> = {};

  if (props.toolbarKeys && props.toolbarKeys.length > 0) {
    config.toolbarKeys = props.toolbarKeys;
  }

  if (props.insertKeys) {
    config.insertKeys = props.insertKeys;
  }

  if (props.excludeKeys && props.excludeKeys.length > 0) {
    config.excludeKeys = props.excludeKeys;
  }

  return config;
});

const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      fieldName: mergedUploadConfig.value.fieldName,
      maxFileSize: mergedUploadConfig.value.maxFileSize,
      maxNumberOfFiles: mergedUploadConfig.value.maxNumberOfFiles,
      allowedFileTypes: mergedUploadConfig.value.allowedFileTypes,
      server: uploadServer.value,
      headers: {
        Authorization: userStore.accessToken,
      },
      onSuccess() {
        ElMessage.success(`Hình ảnhTải lênThanhCong ${EmojiText[200]}`);
      },
      onError(file: File, err: any, res: any) {
        console.error("Hình ảnhTải lênThatBai:", err, res);
        ElMessage.error(`Hình ảnhTải lênThatBai ${EmojiText[500]}`);
      },
    },
  },
};

if (
  props.uploadConfig?.isCustomUpload &&
  props.uploadConfig?.server &&
  editorConfig.MENU_CONF
) {
  editorConfig.MENU_CONF.uploadImage.customUpload = async (
    file: File,
    insertFn: InsertFnType,
  ) => {
    try {
      const formData = new FormData();
      formData.append(mergedUploadConfig.value.fieldName, file);

      const response = await request.post<{
        url: string;
        alt: string;
        href: string;
      }>({
        url: props.uploadConfig?.server,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: userStore.accessToken,
        },
      });

      const resData = (response as any).data || response;
      const { url, alt, href } = resData;

      if (!url) {
        throw new Error("Tải lênThatBai，Vui lòngTìmphụcvụđầuCauHinh");
      }

      insertFn(url, alt, href);
      ElMessage.success(`đồphiếnTải lênThanhCong ${EmojiText[200]}`);
    } catch (error) {
      console.error("Hình ảnhTải lênThatBai:", error);
      ElMessage.error(`Hình ảnhTải lênThatBai ${EmojiText[500]}`);
    }
  };
}

const onCreateEditor = (editor: IDomEditor) => {
  editorRef.value = editor;

  editor.on("fullScreen", () => {
    console.log("Trình biên tậpvàovàoToàn màn hìnhmôkiểu");
  });

  const editable = editor.getEditableContainer();
  if (editable) {
    editable.setAttribute("spellcheck", "false");
    editable.setAttribute("data-gramm", "false");
    editable.setAttribute("data-gramm_editor", "false");
    editable.setAttribute("data-enable-grammarly", "false");
    editable.setAttribute("translate", "no");
    editable.classList.add("notranslate");
  }

  applyCustomIcons();
};

const applyCustomIcons = () => {
  let retryCount = 0;
  const maxRetries = 10;
  const retryDelay = 100;

  const tryApplyIcons = () => {
    const editor = editorRef.value;
    if (!editor) {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryApplyIcons, retryDelay);
      }
      return;
    }

    const editorContainer = editor
      .getEditableContainer()
      .closest(".editor-wrapper");
    if (!editorContainer) {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryApplyIcons, retryDelay);
      }
      return;
    }

    const toolbar = editorContainer.querySelector(".w-e-toolbar");
    const toolbarButtons = editorContainer.querySelectorAll(
      ".w-e-bar-item button[data-menu-key]",
    );

    if (toolbar && toolbarButtons.length > 0) {
      return;
    }

    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(tryApplyIcons, retryDelay);
    } else {
      console.warn(
        "Thanh công cụRendersiêugiờ，vôphápỨng dụngTùy chỉnhIcon - Trình biên tậpthựcví dụ:",
        editor.id,
      );
    }
  };

  requestAnimationFrame(tryApplyIcons);
};

defineExpose({
  getEditor: () => editorRef.value,
  setHtml: (html: string) => editorRef.value?.setHtml(html),
  getHtml: () => editorRef.value?.getHtml(),
  clear: () => editorRef.value?.clear(),
  focus: () => editorRef.value?.focus(),
});

onMounted(() => {});

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor) {
    editor.destroy();
  }
});
</script>

<style lang="scss">
@use "./style";
</style>
