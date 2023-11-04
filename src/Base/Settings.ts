import type {RemoteDBSettings, ConfigPassphraseStore} from '../lib/src/types'
import type ObsidianLiveSyncPlugin from '../main'
import {Logger} from '../lib/src/logger'
import {LOG_LEVEL, type CouchDBConnection, SALT_OF_PASSPHRASE} from '../lib/src/types'
import {isCloudantURI} from '../lib/src/utils_couchdb'
import {askString} from '../utils'
import {Json} from '../Utils/Json'
import {tryDecrypt} from '../lib/src/e2ee_v2'

interface ObsidianLiveSyncSettings_PluginSetting {
  liveSync: boolean;
  syncOnSave: boolean;
  syncOnStart: boolean;
  syncOnFileOpen: boolean;
  savingDelay: number;
  lessInformationInLog: boolean;
  gcDelay: number;
  versionUpFlash: string;
  showVerboseLog: boolean;
  suspendFileWatching: boolean;
  trashInsteadDelete: boolean;
  periodicReplication: boolean;
  periodicReplicationInterval: number;
  doNotDeleteFolder: boolean;
  resolveConflictsByNewerFile: boolean;
  batchSave: boolean;
  deviceAndVaultName: string;
  usePluginSettings: boolean;
  showOwnPlugins: boolean;
  showStatusOnEditor: boolean;
  usePluginSync: boolean;
  autoSweepPlugins: boolean;
  autoSweepPluginsPeriodic: boolean;
  notifyPluginOrSettingUpdated: boolean;
  skipOlderFilesOnSync: boolean;
  syncInternalFiles: boolean;
  syncInternalFilesBeforeReplication: boolean;
  syncInternalFilesInterval: number;
  syncInternalFilesIgnorePatterns: string;
  lastReadUpdates: number;
  watchInternalFileChanges: boolean;
  disableMarkdownAutoMerge: boolean;
  writeDocumentsIfConflicted: boolean;
  syncAfterMerge: boolean;
  configPassphraseStore: ConfigPassphraseStore;
  encryptedPassphrase: string;
  encryptedCouchDBConnection: string;

  useIndexedDBAdapter: boolean;
  writeLogToTheFile: boolean;
}

export type ObsidianLiveSyncSettings = ObsidianLiveSyncSettings_PluginSetting & RemoteDBSettings;
export const DEFAULT_SETTINGS: ObsidianLiveSyncSettings = {
  couchDB_URI                              : '',
  couchDB_USER                             : '',
  couchDB_PASSWORD                         : '',
  couchDB_DBNAME                           : '',
  liveSync                                 : false,
  syncOnSave                               : false,
  syncOnStart                              : false,
  savingDelay                              : 200,
  lessInformationInLog                     : false,
  gcDelay                                  : 300,
  versionUpFlash                           : '',
  minimumChunkSize                         : 20,
  longLineThreshold                        : 250,
  showVerboseLog                           : false,
  suspendFileWatching                      : false,
  trashInsteadDelete                       : true,
  periodicReplication                      : false,
  periodicReplicationInterval              : 60,
  syncOnFileOpen                           : false,
  encrypt                                  : false,
  passphrase                               : '',
  usePathObfuscation                       : false,
  doNotDeleteFolder                        : false,
  resolveConflictsByNewerFile              : false,
  batchSave                                : false,
  deviceAndVaultName                       : '',
  usePluginSettings                        : false,
  showOwnPlugins                           : false,
  showStatusOnEditor                       : true,
  usePluginSync                            : false,
  autoSweepPlugins                         : false,
  autoSweepPluginsPeriodic                 : false,
  notifyPluginOrSettingUpdated             : false,
  checkIntegrityOnSave                     : false,
  batch_size                               : 50,
  batches_limit                            : 40,
  useHistory                               : false,
  disableRequestURI                        : false,
  skipOlderFilesOnSync                     : true,
  checkConflictOnlyOnOpen                  : false,
  syncInternalFiles                        : false,
  syncInternalFilesBeforeReplication       : false,
  syncInternalFilesIgnorePatterns          : '\\/node_modules\\/, \\/\\.git\\/, \\/obsidian-livesync\\/',
  syncInternalFilesInterval                : 60,
  additionalSuffixOfDatabaseName           : '',
  ignoreVersionCheck                       : false,
  lastReadUpdates                          : 0,
  deleteMetadataOfDeletedFiles             : false,
  syncIgnoreRegEx                          : '',
  syncOnlyRegEx                            : '',
  customChunkSize                          : 0,
  readChunksOnline                         : true,
  watchInternalFileChanges                 : true,
  automaticallyDeleteMetadataOfDeletedFiles: 0,
  disableMarkdownAutoMerge                 : false,
  writeDocumentsIfConflicted               : false,
  useDynamicIterationCount                 : false,
  syncAfterMerge                           : false,
  configPassphraseStore                    : '',
  encryptedPassphrase                      : '',
  encryptedCouchDBConnection               : '',
  permitEmptyPassphrase                    : false,
  useIndexedDBAdapter                      : true,
  useTimeouts                              : false,
  writeLogToTheFile                        : false,
  doNotPaceReplication                     : false,
  hashCacheMaxCount                        : 300,
  hashCacheMaxAmount                       : 50,
  concurrencyOfReadChunksOnline            : 100,
  minimumIntervalOfReadChunksOnline        : 333,
  hashAlg                                  : 'xxhash64',
}

export class Settings {
  static s: Settings
  settings: ObsidianLiveSyncSettings = {...DEFAULT_SETTINGS}
  plugin: ObsidianLiveSyncPlugin
  usedPassphrase: string
  deviceAndVaultName: string

  constructor(plugin: ObsidianLiveSyncPlugin) {
    this.plugin = plugin
    Settings.s = this
  }

  getPassphrase(settings: ObsidianLiveSyncSettings) {
    const methods: Record<ConfigPassphraseStore, (() => Promise<string | false>)> = {
      ''             : () => Promise.resolve('*'),
      'LOCALSTORAGE' : () => Promise.resolve(localStorage.getItem('ls-setting-passphrase') ?? false),
      'ASK_AT_LAUNCH': () => askString(this.plugin.app, 'Passphrase', 'passphrase', ''),
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
    const passphrase = await this.getPassphrase(settings)
    if (passphrase === false) {
      Logger('Could not determine passphrase for reading data.json! DO NOT synchronize with the remote before making sure your configuration is!', LOG_LEVEL.URGENT)
    } else {
      if (settings.encryptedCouchDBConnection) {
        const keys = ['couchDB_URI', 'couchDB_USER', 'couchDB_PASSWORD', 'couchDB_DBNAME'] as (keyof CouchDBConnection)[]
        const decrypted = Json.tryDecodeJson(await this.decryptConfigurationItem(settings.encryptedCouchDBConnection, passphrase)) as CouchDBConnection
        if (decrypted) {
          for (const key of keys) {
            if (key in decrypted) {
              settings[key] = decrypted[key]
            }
          }
        } else {
          Logger('Could not decrypt passphrase for reading data.json! DO NOT synchronize with the remote before making sure your configuration is!', LOG_LEVEL.URGENT)
          for (const key of keys) {
            settings[key] = ''
          }
        }
      }
      if (settings.encrypt && settings.encryptedPassphrase) {
        const encrypted = settings.encryptedPassphrase
        const decrypted = await this.decryptConfigurationItem(encrypted, passphrase)
        if (decrypted) {
          settings.passphrase = decrypted
        } else {
          Logger('Could not decrypt passphrase for reading data.json! DO NOT synchronize with the remote before making sure your configuration is!', LOG_LEVEL.URGENT)
          settings.passphrase = ''
        }
      }

    }
    this.settings = settings

    if ('workingEncrypt' in this.settings) delete this.settings.workingEncrypt
    if ('workingPassphrase' in this.settings) delete this.settings.workingPassphrase

    // Delete this feature to avoid problems on mobile.
    this.settings.disableRequestURI = true

    // GC is disabled.
    this.settings.gcDelay = 0
    // So, use history is always enabled.
    this.settings.useHistory = true

    const lsKey = 'obsidian-live-sync-vaultanddevicename-' + this.plugin.getVaultName()
    if (this.settings.deviceAndVaultName != '') {
      if (!localStorage.getItem(lsKey)) {
        this.deviceAndVaultName = this.settings.deviceAndVaultName
        localStorage.setItem(lsKey, this.deviceAndVaultName)
        this.settings.deviceAndVaultName = ''
      }
    }
    if (isCloudantURI(this.settings.couchDB_URI) && this.settings.customChunkSize != 0) {
      Logger('Configuration verification founds problems with your configuration. This has been fixed automatically. But you may already have data that cannot be synchronised. If this is the case, please rebuild everything.', LOG_LEVEL.NOTICE)
      this.settings.customChunkSize = 0
    }
    this.deviceAndVaultName = localStorage.getItem(lsKey) || ''
  }
}