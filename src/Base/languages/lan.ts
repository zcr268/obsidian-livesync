import { Settings } from '../Settings'

export enum Tips {
    CANNOT_LOAD_PASSPHRASE,
    CANNOT_DECRYPT_PASSPHRASE,
    CLOUDANT_SETTINGS_ERROR,
    NOT_SURE_SAVE_SETTINGS,
    SETTINGS_NOT_SAFE,
}

const map: Map<string, LanguageInstance> = new Map<string, LanguageInstance>()


export function _(t: Tips) {
    const name: string = Settings.settings()?.language || 'chinese'
    return map.get(name).switcher[t]
}

export function registryLanguage(name: string, switcher: Switcher) {
  map.set(name, new LanguageInstance(name, switcher))
}

export type Switcher = Partial<Record<Tips, string>>
export type SwitcherALL = Record<Partial<Tips>, string>

class LanguageInstance {
  switcher: Switcher
  name: string

  constructor(name: string, switcher: Switcher) {
    this.switcher = switcher
    this.name = name
  }
}

