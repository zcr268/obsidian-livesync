import {Tips, registryLanguage, type SwitcherALL} from './lan'

const chinese: SwitcherALL = {
    [Tips.CANNOT_LOAD_PASSPHRASE]: '无法确定读取 data.json 的密码！在确保您的配置之前，请勿与远程进行同步！',
    [Tips.CANNOT_DECRYPT_PASSPHRASE]: '无法解密用于读取 data.json 的密码！在确保您的配置之前，请勿与远程进行同步！',
    [Tips.CLOUDANT_SETTINGS_ERROR]:
        '配置验证发现您的配置存在问题。此问题已自动修复。但您可能已经有无法同步的数据。如果是这种情况，请重建一切。',
    [Tips.NOT_SURE_SAVE_SETTINGS]: '无法确定保存 data.json 的密码！您可能会再次确保配置！',
    [Tips.SETTINGS_NOT_SAFE]: '无法确定保存 data.json 的密码！您可能会再次确保配置！',
}

registryLanguage('chinese', chinese)