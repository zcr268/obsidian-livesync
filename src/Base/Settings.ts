import type { RemoteDBSettings, ConfigPassphraseStore } from '../lib/src/types'
import { SALT_OF_PASSPHRASE } from '../lib/src/types'
import type ObsidianLiveSyncPlugin from '../main'
import { askString } from '../utils'
import { tryDecrypt } from '../lib/src/e2ee_v2'
interface ObsidianLiveSyncSettings_PluginSetting {
    liveSync: boolean
    syncOnSave: boolean
    syncOnStart: boolean
    syncOnFileOpen: boolean
    savingDelay: number
    lessInformationInLog: boolean
    gcDelay: number
    versionUpFlash: string
    showVerboseLog: boolean
    suspendFileWatching: boolean
    trashInsteadDelete: boolean
    periodicReplication: boolean
    periodicReplicationInterval: number
    doNotDeleteFolder: boolean
    resolveConflictsByNewerFile: boolean
    batchSave: boolean
    deviceAndVaultName: string
    usePluginSettings: boolean
    showOwnPlugins: boolean
    showStatusOnEditor: boolean
    usePluginSync: boolean
    autoSweepPlugins: boolean
    autoSweepPluginsPeriodic: boolean
    notifyPluginOrSettingUpdated: boolean
    skipOlderFilesOnSync: boolean
    syncInternalFiles: boolean
    syncInternalFilesBeforeReplication: boolean
    syncInternalFilesInterval: number
    syncInternalFilesIgnorePatterns: string
    lastReadUpdates: number
    watchInternalFileChanges: boolean
    disableMarkdownAutoMerge: boolean
    writeDocumentsIfConflicted: boolean
    syncAfterMerge: boolean
    configPassphraseStore: ConfigPassphraseStore
    encryptedPassphrase: string
    encryptedCouchDBConnection: string

    useIndexedDBAdapter: boolean
    writeLogToTheFile: boolean
    language: string
}

export type ObsidianLiveSyncSettings = ObsidianLiveSyncSettings_PluginSetting & RemoteDBSettings;
export const DEFAULT_SETTINGS: ObsidianLiveSyncSettings = {
    language: 'chinese',
    couchDB_URI: '',
    couchDB_USER: '',
    couchDB_PASSWORD: '',
    couchDB_DBNAME: '',
    liveSync: false,
    syncOnSave: false,
    syncOnStart: false,
    savingDelay: 200,
    lessInformationInLog: false,
    gcDelay: 300,
    versionUpFlash: '',
    minimumChunkSize: 20,
    longLineThreshold: 250,
    showVerboseLog: false,
    suspendFileWatching: false,
    trashInsteadDelete: true,
    periodicReplication: false,
    periodicReplicationInterval: 60,
    syncOnFileOpen: false,
    encrypt: false,
    passphrase: '',
    usePathObfuscation: false,
    doNotDeleteFolder: false,
    resolveConflictsByNewerFile: false,
    batchSave: false,
    deviceAndVaultName: '',
    usePluginSettings: false,
    showOwnPlugins: false,
    showStatusOnEditor: true,
    usePluginSync: false,
    autoSweepPlugins: false,
    autoSweepPluginsPeriodic: false,
    notifyPluginOrSettingUpdated: false,
    checkIntegrityOnSave: false,
    batch_size: 50,
    batches_limit: 40,
    useHistory: false,
    disableRequestURI: false,
    skipOlderFilesOnSync: true,
    checkConflictOnlyOnOpen: false,
    syncInternalFiles: false,
    syncInternalFilesBeforeReplication: false,
    syncInternalFilesIgnorePatterns: '\\/node_modules\\/, \\/\\.git\\/, \\/obsidian-livesync\\/',
    syncInternalFilesInterval: 60,
    additionalSuffixOfDatabaseName: '',
    ignoreVersionCheck: false,
    lastReadUpdates: 0,
    deleteMetadataOfDeletedFiles: false,
    syncIgnoreRegEx: '',
    syncOnlyRegEx: '',
    customChunkSize: 0,
    readChunksOnline: true,
    watchInternalFileChanges: true,
    automaticallyDeleteMetadataOfDeletedFiles: 0,
    disableMarkdownAutoMerge: false,
    writeDocumentsIfConflicted: false,
    useDynamicIterationCount: false,
    syncAfterMerge: false,
    configPassphraseStore: '',
    encryptedPassphrase: '',
    encryptedCouchDBConnection: '',
    permitEmptyPassphrase: false,
    useIndexedDBAdapter: true,
    useTimeouts: false,
    writeLogToTheFile: false,
    doNotPaceReplication: false,
    hashCacheMaxCount: 300,
    hashCacheMaxAmount: 50,
    concurrencyOfReadChunksOnline: 100,
    minimumIntervalOfReadChunksOnline: 333,
    hashAlg: 'xxhash64',
    useV1: false,
}

export class Settings {
    settings: ObsidianLiveSyncSettings = { ...DEFAULT_SETTINGS }
    plugin: ObsidianLiveSyncPlugin
    usedPassphrase: string

    constructor(plugin: ObsidianLiveSyncPlugin) {
        this.plugin = plugin
        this.plugin.registerContext(Settings, this)
    }

    getPassphrase(settings: ObsidianLiveSyncSettings) {
        const methods: Record<ConfigPassphraseStore, () => Promise<string | false>> = {
            '': () => Promise.resolve('*'),
            LOCALSTORAGE: () => Promise.resolve(localStorage.getItem('ls-setting-passphrase') ?? false),
            ASK_AT_LAUNCH: () => askString(this.plugin.app, 'Passphrase', 'passphrase', ''),
        }
        const method = settings.configPassphraseStore
        const methodFunc = method in methods ? methods[method] : methods['']
        return methodFunc()
    }

    async decryptConfigurationItem(encrypted: string, passphrase: string) {
        const dec = await tryDecrypt(encrypted, passphrase + SALT_OF_PASSPHRASE, false)
        if (dec) {
            this.usedPassphrase = passphrase
            return dec
        }
        return false
    }

    async loadSettings() {
        const settings = Object.assign({}, DEFAULT_SETTINGS, await this.plugin.loadData()) as ObsidianLiveSyncSettings

        this.settings = settings

        // delete this feature to avoid problems on mobile.
        this.settings.disableRequestURI = true
        // GC is disabled.
        this.settings.gcDelay = 0
        // So, use history is always enabled.
        this.settings.useHistory = true
    }

    async saveSettings() {
        const settings = { ...this.settings }
        await this.plugin.saveData(settings)
    }
}

