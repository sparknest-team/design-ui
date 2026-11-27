import { JSDOM } from 'jsdom'
import { expect, test } from 'vitest'
import { highlight } from '../src/node/utils/highlight'

test('Vue sources retain exact text, embedded TypeScript/CSS highlighting and safe HTML', () => {
  const source = '<script setup lang="ts">\nconst value: string = "中文 & 😀"\n</script>\n<template><span>{{ value }}</span></template>\n<style>.box { color: red }</style>'
  const doc = new JSDOM(highlight(source, 'vue')).window.document
  expect(doc.querySelector('pre code')?.textContent).toBe(source)
  expect(doc.querySelector('.token.keyword')?.textContent).toBe('const')
  expect(doc.querySelector('.token.property')?.textContent).toBe('color')
  expect(doc.querySelector('script, style')).toBeNull()
  expect(doc.querySelectorAll('.token').length).toBeGreaterThan(10)
})

test('edits invalidate cached code and unsupported source languages remain safe and copyable', () => {
  const before = highlight('const value = 1', 'ts')
  const after = highlight('const value = 2', 'ts')
  expect(before).not.toBe(after)
  expect(new JSDOM(after).window.document.querySelector('code')?.textContent).toBe('const value = 2')
  const source = '<img src=x onerror="alert(1)"> & <script>alert(1)</script>'
  const doc = new JSDOM(highlight(source, 'unsupported')).window.document
  expect(doc.querySelector('img, script')).toBeNull()
  expect(doc.querySelector('code')?.textContent).toBe(source)
})
