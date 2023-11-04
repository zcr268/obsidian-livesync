import {Settings} from '../../Loader/Settings'

export enum Tips {
}

const map: Map<string, LanguageInstance> = new Map<string, LanguageInstance>()


export function _(t: Tips) {
  const name: string = Settings.s?.language || 'chinese'
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

