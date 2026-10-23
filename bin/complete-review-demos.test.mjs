import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiCatalog } from './complete-review-demos.mjs';
import { instrument } from './generate-review-demos.mjs';
import { completeReviewField } from './review-field-recipes.mjs';
test('treats inline imported upload chooser aliases as callbacks rather than path enums',()=>{
 const field={name:'request-choose',type:"import('./interfaces').UploadRequestChoose",kind:'enum',options:['./interfaces']};
 assert.equal(completeReviewField(field).kind,'callback');
});
const props = '| 属性 | 类型 | 默认值 |\n| --- | --- | --- |\n| disabled | boolean | false |';
test('keeps generic API tables on their actual component, including nested panel sections',()=>{
 const api=apiCatalog(`## API\n### 属性\n${props}\n## DatePicker 日期面板\n### API\n### 属性\n${props}`,'mp-date','mp');
 assert.deepEqual([...api.keys()],['mp-date','mp-date-picker']);
 assert.equal(api.get('mp-date-picker').props[0].name,'disabled');
});
test('normalizes prefixed and hyphenated subcomponent headings',()=>{
 const api=apiCatalog(`## API\n### <c-scheduler> Props\n${props}\n### Layout-Sider Props\n${props}`,'c-layout','c');
 assert.deepEqual([...api.keys()],['c-scheduler','c-layout-sider']);
});
test('keeps configuration schemas separate from component props',()=>{
 const api=apiCatalog(`## API\n### 属性\n${props}\n### TableColumnData\n${props}\n### ActionSheet Options\n#### 函数式调用时传入的选项\n${props}`,'c-table','c');
 assert.deepEqual([...api.keys()],['c-table','schema:TableColumnData','schema:ActionSheetOptions']);
});
test('merges authored spreads and preserves conditional slots without duplicate directives',()=>{
 const filename=new URL('../../cedar-design-web/packages/cedar-ui/src/table/__demos__/example.vue',import.meta.url).pathname;
 const result=instrument('<script setup>const options={};const shown=true</script><template><c-table v-bind="options"><template v-if="shown" #footer>Footer</template></c-table></template>',filename,'c-table',filename.replace('.vue','.json'),[{name:'footer'},{name:'cell'}]);
 assert.match(result.source,/\.\.\.\(options\), \.\.\.__apiReview.bindings/);
 assert.match(result.source,/:context="__reviewSlot"/);
 assert.equal((result.source.match(/#footer/g)??[]).length,1);
});

test("recognizes publicly exported child components without confusing model schemas",()=>{
 const api=apiCatalog(`## API\n## BreadcrumbItem\n### Props\n${props}\n## GridItem\n### Props\n${props}\n### CascaderOption\n${props}`,"mp-breadcrumb","mp");
 assert.ok(api.has("mp-breadcrumb-item"));assert.ok(api.has("mp-grid-item"));assert.ok(api.has("schema:CascaderOption"));
});

test('assigns shared slot tables and exposed methods to the actual child component',()=>{
 const api=apiCatalog('## API\n### Slots\n| 组件 | 插槽 | 说明 |\n| --- | --- | --- |\n| Tabs | default | panes |\n| TabPane | default / title | pane |\n| TabsNavs | prefix / suffix / add-icon | navigation |\n### Expose\n\n`TabsNavs.resize(): void` 重新测量。','mp-tabs','mp');
 assert.deepEqual(api.get('mp-tabs').slots.map(item=>item.name),['default']);
 assert.deepEqual(api.get('mp-tab-pane').slots.map(item=>item.name),['default','title']);
 assert.deepEqual(api.get('mp-tabs-navs').slots.map(item=>item.name),['prefix','suffix','add-icon']);
 assert.equal(api.get('mp-tabs-navs').methods[0].name,'resize');
});
