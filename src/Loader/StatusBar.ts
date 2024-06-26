import {BaseLoader, GlobalLoaderManager} from './BaseLoader'
import {TimerTask} from '../Utils/TimerTask'

export class StatusBar extends BaseLoader {
  statusBar: HTMLElement
  status: string
  msg: string

  onload(): void | Promise<void> {
    this.statusBar = this.plugin.addStatusBarItem()
    this.statusBar.addClass('syncstatusbar')
  }

  setStatusBarText(status: string = null, msg: string = null) {
    if (!this.statusBar) return
    const newStatus = typeof status == 'string' ? status : this.status
    const newMsg = typeof msg == 'string' ? msg : this.msg
    if (`${this.status}-${this.msg}` != `${newStatus}-${newMsg}`) {
      TimerTask.scheduleTask('update-display', 50, () => {
        this.statusBar.setText(newStatus.split('\n')[0])
        if (this.settings.showStatusOnEditor) {
          const root = activeDocument.documentElement
          const q = root.querySelectorAll(`.view-content:has(.empty-state),.view-content:has(.cm-s-obsidian>.cm-editor)`)
          q.forEach(e => e.setAttr('data-log', '' + (newStatus + '\n' + newMsg) + ''))
        } else {
          const root = activeDocument.documentElement
          const q = root.querySelectorAll(`.view-content:has(.empty-state).view-content:has(.cm-s-obsidian>.cm-editor)`)
          q.forEach(e => e.setAttr('data-log', ''))
        }
      }, false)
      TimerTask.scheduleTask('log-hide', 3000, () => this.setStatusBarText(null, ''))
      this.status = newStatus
      this.msg = newMsg
    }
  }
}

GlobalLoaderManager.registryLoader(StatusBar)