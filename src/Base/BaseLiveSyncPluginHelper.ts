import ObsidianLiveSyncPlugin from '../main'
import {Settings} from './Settings'

export abstract class BaseLiveSyncPluginHelper {
  liveSyncPlugin: ObsidianLiveSyncPlugin

  get app() {
    return this.liveSyncPlugin.app
  }

  get settings() {
    return Settings.s.settings
  }

  constructor(liveSyncPlugin: ObsidianLiveSyncPlugin) {
    this.liveSyncPlugin = liveSyncPlugin
  }
}