<template>
  <div class="page-content mb-5">
    <!-- Đầy đủThanh công cụTrình biên tập -->
    <ElCard class="editor-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('admin.t279') }}</span>
          <div class="header-buttons">
            <ElButton size="small" @click="clearFullEditor">{{ $t('admin.t280') }}</ElButton>
            <ElButton size="small" @click="getFullEditorContent">{{ $t('admin.t281') }}</ElButton>
            <ElButton size="small" @click="setFullEditorDemo">{{ $t('admin.t282') }}</ElButton>
          </div>
        </div>
      </template>

      <ArtWangEditor
        ref="fullEditorRef"
        v-model="fullEditorHtml"
        height="400px"
        placeholder="Vui lòng nhậpNoiDung，thểnghiệmĐầy đủcủaChỉnh sửacôngnăng..."
        :exclude-keys="[]"
      />
    </ElCard>

    <!-- rúthóaThanh công cụTrình biên tập -->
    <ElCard class="editor-card">
      <template #header>
        <div class="card-header">
          <span>✨ rúthóaThanh công cụTrình biên tập</span>
          <div class="header-buttons">
            <ElButton size="small" @click="clearSimpleEditor">xóakhông</ElButton>
            <ElButton size="small" @click="getSimpleEditorContent">LấyNoiDung</ElButton>
            <ElButton size="small" @click="setSimpleEditorDemo">CaiDatVí dụ</ElButton>
          </div>
        </div>
      </template>

      <ArtWangEditor
        ref="simpleEditorRef"
        v-model="simpleEditorHtml"
        height="400px"
        placeholder="Vui lòng nhậpNoiDung，thểnghiệmrúthóacủaChỉnh sửacôngnăng..."
        :toolbar-keys="simpleToolbarKeys"
      />
    </ElCard>

    <!-- NoiDungđốiso sánhXem trước -->
    <ElCard class="preview-card">
      <template #header>
        <span>📖 NoiDungXem trướcđốiso sánh</span>
      </template>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <h3>Đầy đủTrình biên tậpNoiDung</h3>
          <ElTabs v-model="fullActiveTab">
            <ElTabPane label="RenderHiệu quả" name="preview">
              <div class="content-preview" v-html="fullEditorHtml"></div>
            </ElTabPane>
            <ElTabPane label="HTMLnguồnmã" name="html">
              <ElInput
                v-model="fullEditorHtml"
                type="textarea"
                :rows="8"
                placeholder="HTMLnguồnmã"
                readonly
              />
            </ElTabPane>
          </ElTabs>
        </ElCol>

        <ElCol :span="12">
          <h3>rúthóaTrình biên tậpNoiDung</h3>
          <ElTabs v-model="simpleActiveTab">
            <ElTabPane label="RenderHiệu quả" name="preview">
              <div class="content-preview" v-html="simpleEditorHtml"></div>
            </ElTabPane>
            <ElTabPane label="HTMLnguồnmã" name="html">
              <ElInput
                v-model="simpleEditorHtml"
                type="textarea"
                :rows="8"
                placeholder="HTMLnguồnmã"
                readonly
              />
            </ElTabPane>
          </ElTabs>
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- khiếndùngMô tả -->
    <ElCard class="usage-card">
      <template #header>
        <span>📚 khiếndùngMô tả</span>
      </template>

      <ElCollapse v-model="activeCollapse">
        <ElCollapseItem title="Cơ bảndùngpháp" name="basic">
          <pre><code class="language-vue">&lt;template&gt;
          &lt;ArtWangEditor v-model="content" /&gt;
          &lt;/template&gt;

          &lt;script setup lang="ts"&gt;
          import { ref } from 'vue'

          const content = ref('&lt;p&gt;ban đầuđầuNoiDung&lt;/p&gt;')
          &lt;/script&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="Đầy đủThanh công cụCauHinh" name="full">
          <pre><code class="language-vue">&lt;template&gt;
          &lt;!-- Hiển thịnêncóCông cụ，Khôngxếpchianhiệmnàocôngnăng --&gt;
          &lt;ArtWangEditor
          v-model="content"
          :exclude-keys="[]"
          /&gt;
          &lt;/template&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="rúthóaThanh công cụCauHinh" name="simple">
          <pre><code class="language-vue">&lt;template&gt;
          &lt;!-- chỉHiển thịCơ bảnChỉnh sửaCông cụ --&gt;
          &lt;ArtWangEditor
          v-model="content"
          :toolbar-keys="[
          'bold', 'italic', 'underline', '|',
          'bulletedList', 'numberedList', '|',
          'insertLink', 'insertImage', '|',
          'undo', 'redo'
          ]"
          /&gt;
          &lt;/template&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="Tùy chỉnhCauHinh" name="config">
          <pre><code class="language-vue">&lt;template&gt;
          &lt;ArtWangEditor
          v-model="content"
          height="600px"
          placeholder="Vui lòng nhậpbạncủaNoiDung..."
          :exclude-keys="['fontFamily', 'fontSize']"
          :upload-config="{
          maxFileSize: 5 * 1024 * 1024,
          maxNumberOfFiles: 5
          }"
          /&gt;
          &lt;/template&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="ComponentPhuongThucđiềudùng" name="methods">
          <pre><code class="language-vue">&lt;template&gt;
          &lt;ArtWangEditor ref="editorRef" v-model="content" /&gt;
          &lt;el-button @click="handleClear"&gt;xóakhông&lt;/el-button&gt;
          &lt;el-button @click="handleFocus"&gt;tụtiêu&lt;/el-button&gt;
          &lt;el-button @click="handleGetContent"&gt;LấyNoiDung&lt;/el-button&gt;
          &lt;/template&gt;

          &lt;script setup lang="ts"&gt;
          import { ref } from 'vue'

          const editorRef = ref()
          const content = ref('')

          const handleClear = () =&gt; {
          editorRef.value?.clear()
          }

          const handleFocus = () =&gt; {
          editorRef.value?.focus()
          }

          const handleGetContent = () =&gt; {
          const html = editorRef.value?.getHtml()
          console.log('Trình biên tậpNoiDung:', html)
          }
          &lt;/script&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="Thanh công cụCauHinhMô tả" name="toolbar-config">
          <div class="toolbar-explanation">
            <h4>Đầy đủThanh công cụ vs rúthóaThanh công cụ</h4>
            <ElRow :gutter="16">
              <ElCol :span="12">
                <h5>✅ Đầy đủThanh công cụBao gồm：</h5>
                <ul>
                  <li>vănquyểncáchkiểu：thêmđậm、nghiêngthể、dướigạchđường、Phông chữMàu sắc、Nềnmàu</li>
                  <li>Đoạn văncáchkiểu：TieuDe、tríchdùng、đốicănphươngkiểu、thụtvào</li>
                  <li>Danh sách：cóthứDanh sách、vôthứDanh sách、Việc cần làmviệcmục</li>
                  <li>chènvào：liêntiếp、Hình ảnh、Bảng、phầncắtđường、bảngtình</li>
                  <li>đạimã：đạimãkhối、dòngtrongđạimã</li>
                  <li>HanhDong：hoàntác、trùnglàm、Toàn màn hình、xóachiacáchkiểu</li>
                </ul>
              </ElCol>
              <ElCol :span="12">
                <h5>⚡ rúthóaThanh công cụBao gồm：</h5>
                <ul>
                  <li>Cơ bảncáchkiểu：thêmđậm、nghiêngthể、dướigạchđường</li>
                  <li>Danh sách：cóthứDanh sách、vôthứDanh sách</li>
                  <li>chènvào：liêntiếp、Hình ảnh</li>
                  <li>HanhDong：hoàntác、trùnglàm</li>
                </ul>
                <p class="note">thíchdùngởrútđơncủavănquyểnChỉnh sửatrườngcảnh，giaomặthơnxóasảng。</p>
              </ElCol>
            </ElRow>
          </div>
        </ElCollapseItem>
      </ElCollapse>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'WidgetsWangEditor' })

  const fullEditorRef = ref()
  const simpleEditorRef = ref()
  const fullActiveTab = ref('preview')
  const simpleActiveTab = ref('preview')
  const activeCollapse = ref(['basic'])

  /**
   * rúthóaThanh công cụCauHinh
   * chỉBao gồmCơ bảncủaChỉnh sửacôngnăng
   */
  const simpleToolbarKeys = [
    'bold',
    'italic',
    'underline',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'insertLink',
    'insertImage',
    '|',
    'undo',
    'redo'
  ]

  // Đầy đủTrình biên tậpNoiDung
  const fullEditorHtml = ref(`<h1>🎨 Đầy đủThanh công cụTrình biên tậpthịví dụ</h1>
<p>nàychiếcTrình biên tậpBao gồmnêncócôngnăng，bạnCó thểlấythểnghiệmphongphúcủacáchkiểuChỉnh sửacôngnăng。</p>

<h2>✨ vănquyểnKiểu dáng</h2>
<p><strong>nàylàthêmđậmcủavăntự</strong></p>
<p><em>nàylànghiêngthểvăntự</em></p>
<p><u>nàylàdướigạchđườngvăntự</u></p>
<p><span style="color: rgb(194, 79, 74);">nàylàmàumàuVanBan</span></p>

<h2>📝 Danh sáchvàViệc cần làm</h2>
<ul>
  <li>vôthứDanh sáchmục 1</li>
  <li>vôthứDanh sáchmục 2</li>
</ul>

<ol>
  <li>cóthứDanh sáchmục 1</li>
  <li>cóthứDanh sáchmục 2</li>
</ol>

<ul class="w-e-todo">
  <li class="w-e-todo-item"><input type="checkbox" checked="true" readonly="true" disabled="disabled"><span>Đã hoàn thànhcủanhiệmvụ</span></li>
  <li class="w-e-todo-item"><input type="checkbox" readonly="true" disabled="disabled"><span>đợihoànthànhcủanhiệmvụ</span></li>
</ul>

<h2>💬 tríchdùngvàBảng</h2>
<blockquote>
  nàylàmộtđoạntríchdùngVanBan，triểnthịtríchdùngcáchkiểucủaHiệu quả。
</blockquote>

<table style="border-collapse: collapse; width: 100%;" border="1">
  <thead>
    <tr><th>côngnăng</th><th>Mô tả</th></tr>
  </thead>
  <tbody>
    <tr><td>Đầy đủThanh công cụ</td><td>Bao gồmnêncóChỉnh sửacôngnăng</td></tr>
    <tr><td>Tùy chỉnhCauHinh</td><td>chiếctrìlinhsốngcủaThanh công cụCauHinh</td></tr>
  </tbody>
</table>

<h2>💻 đạimãkhối</h2>
<pre><code class="language-javascript">// Đầy đủTrình biên tậpchiếctrìđạimãcaosáng
function createEditor() {
  return new WangEditor({
    container: '#editor',
    toolbar: 'full' // Đầy đủThanh công cụ
  });
}</code></pre>

<p>🔗 <a href="https://www.wangeditor.com/" target="_blank">Truy cậpTrangChurồigiảiThêm</a></p>`)

  // rúthóaTrình biên tậpNoiDung
  const simpleEditorHtml = ref(`<h1>✨ rúthóaThanh công cụTrình biên tậpVí dụ</h1>
<p>nàychiếcTrình biên tậpchỉBao gồmCơ bảncủaChỉnh sửacôngnăng，giaomặthơnthêmrútkhiết。</p>

<h2>Cơ bảnvănquyểncáchkiểu</h2>
<p><strong>thêmđậmVanBan</strong></p>
<p><em>nghiêngthểVanBan</em></p>
<p><u>dướigạchđườngVanBan</u></p>

<h2>Danh sáchcôngnăng</h2>
<ul>
  <li>vôthứDanh sáchmục 1</li>
  <li>vôthứDanh sáchmục 2</li>
</ul>

<ol>
  <li>cóthứDanh sáchmục 1</li>
  <li>cóthứDanh sáchmục 2</li>
</ol>

<h2>liêntiếpvàHình ảnh</h2>
<p>chiếctrìchènvào <a href="https://www.wangeditor.com/" target="_blank">liêntiếp</a> vàđồphiến。</p>

<p>rúthóabảnTrình biên tậpTập trungởCơ bảncôngnăng，thíchhợprútđơncủaNoiDungChỉnh sửacầncầu。</p>`)

  /**
   * xóakhôngĐầy đủTrình biên tậpNoiDung
   */
  const clearFullEditor = () => {
    fullEditorRef.value?.clear()
    ElMessage.success('Đầy đủTrình biên tậpĐãxóakhông')
  }

  /**
   * LấyĐầy đủTrình biên tậpNoiDung
   */
  const getFullEditorContent = () => {
    const content = fullEditorRef.value?.getHtml()
    console.log('Đầy đủTrình biên tậpNoiDung:', content)
    ElMessage.success('Đầy đủTrình biên tậpNoiDungĐãnhậprađếnBangDieuKhien')
  }

  /**
   * CaiDatĐầy đủTrình biên tậpdiễnthịNoiDung
   */
  const setFullEditorDemo = () => {
    const demoContent = `<h2>🎉 Đầy đủTrình biên tậpdiễnthịNoiDung</h2>
<p>nàylàthông quaPhuongThucCaiDatcủadiễnthịNoiDung，triểnthịĐầy đủTrình biên tậpcủamạnhđạicôngnăng。</p>
<ul>
  <li>chitrìphongphúcủavănbảncáchthức</li>
  <li>baohàmBảng、thếmãkhốiđợicaocấpcôngnăng</li>
  <li>gợicungĐầy đủcủaChỉnh sửathểnghiệm</li>
</ul>
<table style="border-collapse: collapse; width: 100%;" border="1">
  <tr><th>đặctính</th><th>Trạng thái</th></tr>
  <tr><td>hoànchỉnhcôngcụthanh</td><td>✅ ĐãBật</td></tr>
  <tr><td>caocấpcôngnăng</td><td>✅ ĐãBật</td></tr>
</table>`

    fullEditorRef.value?.setHtml(demoContent)
    ElMessage.success('ĐãCaiDatĐầy đủTrình biên tậpdiễnthịNoiDung')
  }

  /**
   * xóakhôngrúthóaTrình biên tậpNoiDung
   */
  const clearSimpleEditor = () => {
    simpleEditorRef.value?.clear()
    ElMessage.success('rúthóaTrình biên tậpĐãxóakhông')
  }

  /**
   * LấyrúthóaTrình biên tậpNoiDung
   */
  const getSimpleEditorContent = () => {
    const content = simpleEditorRef.value?.getHtml()
    console.log('rúthóaTrình biên tậpNoiDung:', content)
    ElMessage.success('rúthóaTrình biên tậpNoiDungĐãnhậprađếnBangDieuKhien')
  }

  /**
   * CaiDatrúthóaTrình biên tậpdiễnthịNoiDung
   */
  const setSimpleEditorDemo = () => {
    const demoContent = `<h2>⚡ rúthóaTrình biên tậpdiễnthịNoiDung</h2>
<p>nàylàthông quaPhuongThucCaiDatcủadiễnthịNoiDung，triểnthịrúthóaTrình biên tậpcủaCốt lõicôngnăng。</p>
<ul>
  <li><strong>Cơ bảncáchthức</strong>：thêmđậm、nghiêngthể、dướigạchđường</li>
  <li><em>Danh sáchchitrì</em>：cóthứvàvôthứDanh sách</li>
  <li><u>môithểchènvào</u>：liêntiếpvàđồphiến</li>
</ul>
<ol>
  <li>giớimặtrútkhiếtxóa</li>
  <li>côngnăngchuyênchúthựcdùng</li>
  <li>thíchhợpkhoáiChỉnh sửa</li>
</ol>
<p>🔗 <a href="https://example.com" target="_blank">nàylàmộtcáiliêntiếpthịví dụ</a></p>`

    simpleEditorRef.value?.setHtml(demoContent)
    ElMessage.success('ĐãCaiDatrúthóaTrình biên tậpdiễnthịNoiDung')
  }
</script>

<style lang="scss" scoped>
  .page-content {
    padding: 20px;
  }

  .editor-card {
    margin-bottom: 24px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-buttons {
    display: flex;
    gap: 8px;
  }

  .preview-card {
    margin-bottom: 24px;
  }

  .preview-card h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  .content-preview {
    min-height: 200px;
    max-height: 300px;
    padding: 16px;
    overflow-y: auto;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
  }

  .content-preview :deep(h1),
  .content-preview :deep(h2),
  .content-preview :deep(h3) {
    margin: 16px 0 8px;
  }

  .content-preview :deep(p) {
    margin: 8px 0;
    line-height: 1.6;
  }

  .content-preview :deep(table) {
    margin: 16px 0;
  }

  .content-preview :deep(table th),
  .content-preview :deep(table td) {
    padding: 8px 12px;
  }

  .content-preview :deep(pre) {
    padding: 12px;
    margin: 16px 0;
    overflow-x: auto;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .content-preview :deep(blockquote) {
    padding-left: 16px;
    margin: 16px 0;
    color: var(--el-text-color-regular);
    border-left: 4px solid var(--el-color-primary);
  }

  .usage-card :deep(.el-collapse-item__content) {
    padding-bottom: 16px;
  }

  .usage-card pre {
    padding: 16px;
    margin: 0;
    overflow-x: auto;
    background-color: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .usage-card pre code {
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  .toolbar-explanation h4 {
    margin: 0 0 16px;
    color: var(--el-text-color-primary);
  }

  .toolbar-explanation h5 {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  .toolbar-explanation ul {
    padding-left: 20px;
    margin: 8px 0 16px;
  }

  .toolbar-explanation ul li {
    margin: 4px 0;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .toolbar-explanation .note {
    margin: 8px 0 0;
    font-size: 12px;
    font-style: italic;
    color: var(--el-text-color-placeholder);
  }

  @media (width <= 768px) {
    .page-content {
      padding: 12px;
    }

    .card-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch !important;
    }

    .header-buttons {
      justify-content: center;
    }

    .preview-card :deep(.el-col) {
      margin-bottom: 16px;
    }
  }
</style>
