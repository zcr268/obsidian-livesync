import ObsidianLiveSyncPlugin from '../main'
import {BaseLiveSyncPluginHelper} from '../Base/BaseLiveSyncPluginHelper'
import {Logger} from '../Base/Logger'
import {Settings} from '../Base/Settings'


export abstract class BaseLoader extends BaseLiveSyncPluginHelper {

  async baseOnLoad() {
    const className = this.constructor.name
    Logger.debug(`加载 ${className} 开始`)
    await this.onload()
    Logger.debug(`加载 ${className} 结束`)
  }

  abstract onload(): void | Promise<void>;
}

type CreateBaseLoader = (plugin: ObsidianLiveSyncPlugin) => BaseLoader
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
  private static LoaderFactoryLoaderList: LoaderFactory[] = []
  private static loaderList = new Array<BaseLoader>()

  static registryLoader(creator: CreateBaseLoader, order = default_order) {
    const factory = new LoaderFactory(creator, order)
    LoaderManager.LoaderFactoryLoaderList.push(factory)
    LoaderManager.LoaderFactoryLoaderList.sort((a, b) => a.order - b.order)
  }

  static async onloadAll(plugin: ObsidianLiveSyncPlugin) {
    await (new Settings(plugin).loadSettings())
    await Promise.all(LoaderManager.LoaderFactoryLoaderList.map(async (e) => {
      const instance = e.creator(plugin)
      LoaderManager.loaderList.push(instance)
      return await instance.baseOnLoad()
    }))
  }
}
