/**
 * v-highlight đạimãcaosánglệnh
 *
 * vìđạimãkhốigợicungngônphápcaosáng、dòngsốHiển thịvàmộtphímphụcchếcôngnăng。
 * ở highlight.js thựchiện，chiếctrìđaloạibiêntrìnhNgôn ngữcủangônphápcaosáng。
 *
 * ## chủcầncôngnăng
 *
 * - ngônphápcaosáng - khiếndùng highlight.js từđộngtínhđồng thờicaosángđạimã
 * - dòngsốHiển thị - từđộngvìmỗidòngđạimãThêm mớidòngsố
 * - mộtphímphụcchế - gợicungphụcchếNút，NhấnlàCó thểphụcchếđạimã（từđộngqualọcdòngsố）
 * - tínhnăngTốihóa - lôlượngXuLyđạimãkhối，tránhmiễntrởnghẽnRender
 * - Hoạt độngLắng nghe - khiếndùng MutationObserver Lắng ngheThêm mớiđạimãkhối
 * - PhòngtrùngphụcXuLy - từđộngtiêughiĐãXuLycủađạimãkhối，tránhmiễntrùngphụcXuLy
 *
 * ## Ví dụ sử dụng
 *
 * ```vue
 * <template>
 *   <!-- Cơ bảndùngpháp -->
 *   <div v-highlight v-html="codeContent"></div>
 *
 *   <!-- Phânhợp Markdown Render -->
 *   <div v-highlight>
 *     <pre><code class="language-javascript">
 *       const hello = 'world';
 *       console.log(hello);
 *     </code></pre>
 *   </div>
 * </template>
 * ```
 *
 * ## tínhnăngTốihóa
 *
 * - lôlượngXuLy：mỗilầnXuLy 10 chiếcđạimãkhối，tránhmiễntrườngThoiGiantrởnghẽn
 * - XuLy：khiếndùng requestAnimationFrame phầnlôXuLy
 * - trùngthửmáychế：từđộngtrùngthửXuLyThatBaicủađạimãkhối
 * - trínăngLắng nghe：chỉtạicómớiđạimãkhốigiờmớiKích hoạtXuLy
 *
 * @module directives/highlight
 * @author Art Design Pro Team
 */

import { App, Directive } from 'vue'
import hljs from 'highlight.js'

export type HighlightDirective = Directive<HTMLElement>

// caosángđạimã
function highlightCode(block: HTMLElement) {
  hljs.highlightElement(block)
}

// chènvàodòngsố
function insertLineNumbers(block: HTMLElement) {
  const lines = block.innerHTML.split('\n')
  const numberedLines = lines
    .map((line, index) => {
      return `<span class="line-number">${index + 1}</span> ${line}`
    })
    .join('\n')
  block.innerHTML = numberedLines
}

// Thêm mớiphụcchếNút：điềuchỉnh DOM Kếtcấu，tươngđạimãbộphầnbaogóitại .code-wrapper trong
function addCopyButton(block: HTMLElement) {
  const copyButton = document.createElement('i')
  copyButton.className = 'copy-button'
  copyButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1 1 0 0 1 3 21l.003-14c0-.552.45-1 1.006-1zM5.002 8L5 20h10V8zM9 6h8v10h2V4H9z"/></svg>'
  copyButton.onclick = () => {
    // qualọcdòngsố，chỉphụcchếđạimãNoiDung
    const codeContent = block.innerText.replace(/^\d+\s+/gm, '')
    navigator.clipboard.writeText(codeContent).then(() => {
      ElMessage.success('phụcchếThanhCong')
    })
  }

  const preElement = block.parentElement
  if (preElement) {
    let codeWrapper: HTMLElement
    // nếuquảđạimãkhốicònkhôngcóbịbaogói，xâybaogóiContainer
    if (!block.parentElement.classList.contains('code-wrapper')) {
      codeWrapper = document.createElement('div')
      codeWrapper.className = 'code-wrapper'
      preElement.replaceChild(codeWrapper, block)
      codeWrapper.appendChild(block)
    } else {
      codeWrapper = block.parentElement
    }
    // tươngphụcchếNútThêm mớiđến pre nguyêntố（màphi codeWrapper trong），nàykiểunóKhôngsẽCuộnđiềuCuộn
    preElement.appendChild(copyButton)
  }
}

// TìmđạimãkhốilàphủĐãquabịXuLyqua
function isBlockProcessed(block: HTMLElement): boolean {
  return (
    block.hasAttribute('data-highlighted') ||
    !!block.querySelector('.line-number') ||
    !!block.parentElement?.querySelector('.copy-button')
  )
}

// tiêughiđạimãkhốivìĐãXuLy
function markBlockAsProcessed(block: HTMLElement) {
  block.setAttribute('data-highlighted', 'true')
}

// XuLyđơnchiếcđạimãkhối
function processBlock(block: HTMLElement) {
  if (isBlockProcessed(block)) {
    return
  }

  try {
    highlightCode(block)
    insertLineNumbers(block)
    addCopyButton(block)
    markBlockAsProcessed(block)
  } catch (error) {
    console.warn('XuLyđạimãkhốigiờraLỗi:', error)
  }
}

// TimKiemđồng thờiXuLynêncóđạimãkhối
function processAllCodeBlocks(el: HTMLElement) {
  const blocks = Array.from(el.querySelectorAll<HTMLElement>('pre code'))
  const unprocessedBlocks = blocks.filter((block) => !isBlockProcessed(block))

  if (unprocessedBlocks.length === 0) {
    return
  }

  if (unprocessedBlocks.length <= 10) {
    // nếuquảđạimãkhốiSố lượngthiểuởbằngở10，thẳngtiếpXuLynêncóđạimãkhối
    unprocessedBlocks.forEach((block) => processBlock(block))
  } else {
    // Định nghĩamỗilầnXuLycủađạimãkhốisố
    const batchSize = 10
    let currentIndex = 0

    const processBatch = () => {
      const batch = unprocessedBlocks.slice(currentIndex, currentIndex + batchSize)

      batch.forEach((block) => {
        processBlock(block)
      })

      // Cập nhậtChỉ mụcđồng thờitiếptiếpXuLydướimộtlô
      currentIndex += batchSize
      if (currentIndex < unprocessedBlocks.length) {
        // khiếndùng requestAnimationFrame Đảm bảodướimộtlạiXuLy
        requestAnimationFrame(processBatch)
      }
    }

    // Bắt đầuXuLythứmộtlôđạimãkhối
    processBatch()
  }
}

// trùngthửXuLyHàm
function retryProcessing(el: HTMLElement, maxRetries: number = 3, delay: number = 200) {
  let retryCount = 0

  const tryProcess = () => {
    processAllCodeBlocks(el)

    // TìmlàphủcòncóChưaXuLycủađạimãkhối
    const remainingBlocks = Array.from(el.querySelectorAll<HTMLElement>('pre code')).filter(
      (block) => !isBlockProcessed(block)
    )

    if (remainingBlocks.length > 0 && retryCount < maxRetries) {
      retryCount++
      setTimeout(tryProcess, delay * retryCount) // chuyểnThêm
    }
  }

  tryProcess()
}

// đạimãcaosáng、chènvàodòngsố、phụcchếNút
const highlightDirective: HighlightDirective = {
  mounted(el: HTMLElement) {
    // lậplàthửthửXuLymộtlần
    processAllCodeBlocks(el)

    // XuLy，Đảm bảo v-html NoiDungĐãquaRender
    setTimeout(() => {
      retryProcessing(el)
    }, 100)

    // khiếndùng MutationObserver Lắng nghe DOM biếnhóa
    const observer = new MutationObserver((mutations) => {
      let hasNewCodeBlocks = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement
              // TìmmớiThêm mớicủatiếtđiểmlàphủBao gồmđạimãkhối
              if (element.tagName === 'PRE' || element.querySelector('pre code')) {
                hasNewCodeBlocks = true
              }
            }
          })
        }
      })

      if (hasNewCodeBlocks) {
        // XuLymớiThêm mớicủađạimãkhối
        setTimeout(() => {
          processAllCodeBlocks(el)
        }, 50)
      }
    })

    // Bắt đầuquansát
    observer.observe(el, {
      childList: true,
      subtree: true
    })

    // tương observer tồntrữđếnnguyêntốtrên，lấytiệntại unmounted giờxóalý
    ;(el as any)._highlightObserver = observer
  },

  updated(el: HTMLElement) {
    // khiComponentCập nhậtgiờ，trùngmớiXuLyđạimãkhối
    setTimeout(() => {
      processAllCodeBlocks(el)
    }, 50)
  },

  unmounted(el: HTMLElement) {
    // xóalý MutationObserver
    const observer = (el as any)._highlightObserver
    if (observer) {
      observer.disconnect()
      delete (el as any)._highlightObserver
    }
  }
}

export function setupHighlightDirective(app: App) {
  app.directive('highlight', highlightDirective)
}
