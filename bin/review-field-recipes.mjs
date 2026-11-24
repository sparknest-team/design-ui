/** Typed, editable examples for public aliases that do not reduce to scalars. */
export function completeReviewField(field) {
  if (field.name === 'request-choose' && /UploadRequestChoose/.test(field.type)) return { ...field, kind: 'callback' }
  if (field.kind !== 'scenario') return field
  const name = field.name.split('.').at(-1)
  const json = (initial) => ({ ...field, kind: 'json', initial })
  if (/^(?:Actions|ActionItem\[\])$/.test(field.type))
    return json('[{"name":"Review action","icon":"check","disabled":false}]')
  if (field.type === 'TableSortable') return json('{"sortDirections":["ascend","descend"]}')
  if (field.type === 'TableFilterable') return json('{"filters":[{"text":"Review","value":"Review"}],"multiple":true}')
  if (name === 'tip' && /VNodeChild/.test(field.type))
    return { ...field, kind: 'node', initial: '审查提示 / Review tip' }
  const callbackNames =
    /^(?:before-.+|disabled-(?:hours|minutes|seconds)|filter(?:-tree-node)?|selectable|allow-drop|load-options|remote-search|custom-request|create-thumbnail-url|is-success-response|separator|headers)$/
  if (
    callbackNames.test(name) ||
    (name === 'name' && /=>/.test(field.type)) ||
    /(?:body|summary)-cell-(?:class|style)/.test(name)
  )
    return { ...field, kind: 'callback' }
  if (/^(?:DateValue|Date|TimeValue)(?:\b|\[)/.test(field.type))
    return json(JSON.stringify(/^Time/.test(field.type) ? '10:30:00' : '2026-10-21'))
  if (/ImgHTMLAttributes/.test(field.type)) return json('{"alt":"审查图片 / Review image","draggable":false}')
  if (/^(?:\[Boolean, Object\]|TableComponents)$/.test(field.type))
    return field.type === 'TableComponents'
      ? { ...field, kind: 'operations', options: ['default', 'reverse', 'selection-first'], initial: 'default' }
      : json('{}')
  if (field.type === 'CedarLang') return { ...field, kind: 'locale', options: ['zh-CN', 'en-US'], initial: 'zh-CN' }
  if (field.type === 'TriggerPlacement')
    return {
      ...field,
      kind: 'enum',
      options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
      initial: 'bottom',
    }
  if (/TriggerPopupTranslate/.test(field.type)) return json('[8,8]')
  if (/Reference|TriggerElement/.test(field.type) || /^(?:string\s*\|\s*)?(?:HTMLElement|SVGElement)/.test(field.type))
    return { ...field, kind: 'string', initial: 'body' }
  if (field.type === 'CanvasTextAlign')
    return { ...field, kind: 'enum', options: ['left', 'right', 'center', 'start', 'end'], initial: 'center' }
  if (field.type === 'DateWeekStart')
    return {
      ...field,
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
      kind: 'enum',
      options: ['0', '1', '2', '3', '4', '5', '6'],
      initial: '1',
    }
  if (/^Array<\s*(?:string\s*\|\s*number|number\s*\|\s*string)\s*>$/.test(field.type)) return json('[]')
  if (/^\[number,\s*number\]$/.test(field.type)) return json('[16,16]')
  if (name === 'scroll-position') return { ...field, kind: 'scalar', initial: 'center' }
  if (name === 'scroll-buttons') return json('"auto"')
  if (name === 'capture') return { ...field, kind: 'enum', options: ['user', 'environment', ''], initial: 'user' }
  if (name === 'format' && /string/.test(field.type)) return { ...field, kind: 'string', initial: 'YYYY-MM-DD' }
  if (/^(?:string|number|boolean)(?:\s*\|\s*(?:string|number|boolean)){2}$/.test(field.type)) return json('false')
  return field
}
