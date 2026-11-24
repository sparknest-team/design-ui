import '/cedar-design-web/packages/ui/src/drawer/style/index.ts'
import '/maple-design-mobile/packages/ui/src/popup/style/index.ts'
import CedarStyleProvider from '/cedar-design-web/packages/ui/src/style-provider/index.ts'
import CedarThemes from '/cedar-design-web/packages/ui/src/themes/index.ts'
import MapleStyleProvider from '/maple-design-mobile/packages/ui/src/style-provider/index.ts'
import MapleThemes from '/maple-design-mobile/packages/ui/src/themes/index.ts'

// Run in the actual frame realm: no copied parent style nodes or synthetic DOM.
CedarStyleProvider.setStyleVars(CedarThemes.maple.dark)
MapleStyleProvider.setStyleVars(MapleThemes.maple.dark)
document.body.dataset.frameReady = 'true'
