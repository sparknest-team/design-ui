import '/cedar-design-web/packages/cedar-ui/src/drawer/style/index.ts'
import '/maple-design-mobile/packages/maple-ui/src/popup/style/index.ts'
import CedarThemes from '/cedar-design-web/packages/cedar-ui/src/themes/index.ts'
import MapleThemes from '/maple-design-mobile/packages/maple-ui/src/themes/index.ts'
import CedarStyleProvider from '/cedar-design-web/packages/cedar-ui/src/style-provider/index.ts'
import MapleStyleProvider from '/maple-design-mobile/packages/maple-ui/src/style-provider/index.ts'

// Run in the actual frame realm: no copied parent style nodes or synthetic DOM.
CedarStyleProvider.setStyleVars(CedarThemes.maple.dark)
MapleStyleProvider.setStyleVars(MapleThemes.maple.dark)
document.body.dataset.frameReady = 'true'
