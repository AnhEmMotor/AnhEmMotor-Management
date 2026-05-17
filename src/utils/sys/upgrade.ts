import { useUserStore } from '@/store/modules/user'
import { StorageConfig } from '@/utils/storage/storage-config'

class VersionManager {
  private normalizeVersion(version: string | undefined): string {
    if (!version) return '0.0.0'
    return version.replace(/^v/, '')
  }

  private getStoredVersion(): string | null {
    return localStorage.getItem(StorageConfig.VERSION_KEY)
  }

  private setStoredVersion(version: string): void {
    localStorage.setItem(StorageConfig.VERSION_KEY, version)
  }

  private shouldSkipUpgrade(): boolean {
    return StorageConfig.CURRENT_VERSION === StorageConfig.SKIP_UPGRADE_VERSION
  }

  private isFirstVisit(storedVersion: string | null): boolean {
    return !storedVersion
  }

  private isSameVersion(storedVersion: string): boolean {
    return storedVersion === StorageConfig.CURRENT_VERSION
  }

  private findLegacyStorage(): { oldSysKey: string | null; oldVersionKeys: string[] } {
    const storageKeys = Object.keys(localStorage)
    const currentVersionPrefix = StorageConfig.generateStorageKey('').slice(0, -1)

    const oldSysKey =
      storageKeys.find(
        (key) =>
          StorageConfig.isVersionedKey(key) && key !== currentVersionPrefix && !key.includes('-')
      ) || null

    const oldVersionKeys = storageKeys.filter(
      (key) =>
        StorageConfig.isVersionedKey(key) &&
        !StorageConfig.isCurrentVersionKey(key) &&
        key.includes('-')
    )

    return { oldSysKey, oldVersionKeys }
  }

  private shouldRequireReLogin(): boolean {
    return false
  }

  private cleanupLegacyData(oldSysKey: string | null, oldVersionKeys: string[]): void {
    if (oldSysKey) {
      localStorage.removeItem(oldSysKey)
    }

    oldVersionKeys.forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  private performLogout(): void {
    try {
      useUserStore().logOut()
    } catch {
      // Ignore error during logout
    }
  }

  private async executeUpgrade(
    _storedVersion: string,
    legacyStorage: ReturnType<typeof this.findLegacyStorage>
  ): Promise<void> {
    try {
      const requireReLogin = this.shouldRequireReLogin()

      this.setStoredVersion(StorageConfig.CURRENT_VERSION)

      this.cleanupLegacyData(legacyStorage.oldSysKey, legacyStorage.oldVersionKeys)

      if (requireReLogin) {
        this.performLogout()
      }
    } catch {
      // Ignore upgrade errors
    }
  }

  async processUpgrade(): Promise<void> {
    if (this.shouldSkipUpgrade()) {
      return
    }

    const storedVersion = this.getStoredVersion()

    if (this.isFirstVisit(storedVersion)) {
      this.setStoredVersion(StorageConfig.CURRENT_VERSION)

      return
    }

    if (this.isSameVersion(storedVersion!)) {
      return
    }

    const legacyStorage = this.findLegacyStorage()
    if (!legacyStorage.oldSysKey && legacyStorage.oldVersionKeys.length === 0) {
      this.setStoredVersion(StorageConfig.CURRENT_VERSION)
      return
    }

    setTimeout(() => {
      this.executeUpgrade(storedVersion!, legacyStorage)
    }, StorageConfig.UPGRADE_DELAY)
  }
}

const versionManager = new VersionManager()

export async function systemUpgrade(): Promise<void> {
  await versionManager.processUpgrade()
}
