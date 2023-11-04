import {BaseLoader, LoaderManager} from './BaseLoader'
import {scheduleTask} from '../utils'

export class StatusBar extends BaseLoader {
  static bar: StatusBar
  statusBar: HTMLElement
  status: string
  msg: string

  onload(): void | Promise<void> {
    StatusBar.bar = this
    this.statusBar = this.liveSyncPlugin.addStatusBarItem()
    this.statusBar.addClass('syncstatusbar')
  }

  setStatusBarText(status: string = null, msg: string = null) {
    if (!this.statusBar) return
    const newStatus = typeof status == 'string' ? status : this.status
    const newMsg = typeof msg == 'string' ? msg : this.msg
    if (`${this.status}-${this.msg}` != `${newStatus}-${newMsg}`) {
      scheduleTask('update-display', 50, () => {
        this.statusBar.setText(newStatus.split('\n')[0])

        if (this.settings.showStatusOnEditor) {
          const root = activeDocument.documentElement
          const q = root.querySelectorAll(`.view-content:has(.cm-s-obsidian>.cm-editor)`)
          q.forEach(e => e.setAttr('data-log', '' + (newStatus + '\n' + newMsg) + ''))
        } else {
          const root = activeDocument.documentElement
          const q = root.querySelectorAll(`.view-content:has(.cm-s-obsidian>.cm-editor)`)
          q.forEach(e => e.setAttr('data-log', ''))
        }
      }, true)
      scheduleTask('log-hide', 3000, () => this.setStatusBarText(null, ''))
      this.status = newStatus
      this.msg = newMsg
    }
  }
}

LoaderManager.registryLoader(e => new StatusBar(e))