import { createI18n } from 'vue-i18n'
import messages from '@/i18n/package'
import { langList } from '@/utils/langList'
import { getSystemStorage } from '@/utils/storage'

const langListArr: string[] = langList.map((lang) => lang.category)

const getDefaultLanguage = (): string => {
  try {
    const sys = getSystemStorage()
    if (sys) {
      const data = JSON.parse(sys)

      if (data.user?.language && langListArr.includes(data.user.language)) {
        return data.user.language
      }
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.language && langListArr.includes(user.language)) {
        return user.language
      }
    }
  } catch (error) {
    console.warn('[i18n] Lỗi lấy ngôn ngữ từ storage:', error)
  }
  return 'vi'
}

const i18n = createI18n({
  locale: getDefaultLanguage(),
  fallbackLocale: 'vi',
  legacy: false,
  globalInjection: true,
  allowComposition: true,
  messages,
})

export const languageOptions = langList.map((item) => ({
  value: item.category,
  label: item.lang,
}))

export const $t = i18n.global.t

export default i18n
