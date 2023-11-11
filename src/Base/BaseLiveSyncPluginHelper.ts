import ObsidianLiveSyncPlugin from '../main'
import { Settings, type ObsidianLiveSyncSettings } from './Settings'

export abstract class BaseLiveSyncPluginHelper {
    plugin: ObsidianLiveSyncPlugin

    get app() {
        return this.plugin.app
    }

    get settings(): ObsidianLiveSyncSettings {
        return this.plugin.get(Settings).settings
    }

    constructor(liveSyncPlugin: ObsidianLiveSyncPlugin) {
        this.plugin = liveSyncPlugin
        const prototype = Object.getPrototypeOf(this)
        this.plugin.registerContext(prototype.constructor, this)
    }
}