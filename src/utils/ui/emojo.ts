/**
 * bảngtình
 * dùngởtạiTinNhanGợi ýcủagiờđợiHiển thịđốiứngcủabảngtình
 *
 * dùngpháp
 * ElMessage.success(`${EmojiText[200]} Hình ảnhTải lênThanhCong`)
 * ElMessage.error(`${EmojiText[400]} Hình ảnhTải lênThatBai`)
 * ElMessage.error(`${EmojiText[500]} Hình ảnhTải lênThatBai`)
 *
 * @module utils/ui/emojo
 * @author Art Design Pro Team
 */

// macos NguoiDung  shift + 6 Có thểlấygọiraThêmbảngtình……
const EmojiText: { [key: string]: string } = {
  '0': 'O_O', // không
  '200': '^_^', // ThanhCong
  '400': 'T_T', // LỗiVui lòngcầu
  '500': 'X_X' // phụcvụthiết bịtrongbộLỗi，vôpháphoànthànhVui lòngcầu
}

// const EmojiIcon = ['🟢', '🔴', '🟡 ', '🚀', '✨', '💡', '🛠️', '🔥', '🎉', '🌟', '🌈']

export default EmojiText
