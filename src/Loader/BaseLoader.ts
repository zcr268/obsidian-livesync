import ObsidianLiveSyncPlugin from '../main'
import { BaseLiveSyncPluginHelper } from '../Base/BaseLiveSyncPluginHelper'
import { Logger } from '../Base/Logger'
import { Settings } from '../Base/Settings'

export abstract class BaseLoader extends BaseLiveSyncPluginHelper {
    async baseOnLoad() {
        const className = this.constructor.name
        Logger.debug(`加载 ${className} 开始`)
        await this.onload()
        Logger.debug(`加载 ${className} 结束`)
    }

    abstract onload(): void | Promise<void>
}

type CreateBaseLoader = new (plugin: ObsidianLiveSyncPlugin) => BaseLoader
const default_order = 100

class LoaderFactory {
  creator: CreateBaseLoader
  order: number

  constructor(creator: CreateBaseLoader, order = default_order) {
    this.creator = creator
    this.order = order
  }
}

export class LoaderManager {
    private LoaderFactoryLoaderList: LoaderFactory[] = []
    private loaderList = new Array<BaseLoader>()

    registryLoader(creator: CreateBaseLoader, order = default_order) {
        const factory = new LoaderFactory(creator, order)
        this.LoaderFactoryLoaderList.push(factory)
        this.LoaderFactoryLoaderList.sort((a, b) => a.order - b.order)
    }

    async onloadAll(plugin: ObsidianLiveSyncPlugin) {
        await new Settings(plugin).loadSettings()
        for (const e of this.LoaderFactoryLoaderList) {
            const instance = new e.creator(plugin)
            this.loaderList.push(instance)
            await instance.baseOnLoad()
        }
    }
}

export const GlobalLoaderManager = new LoaderManager()
