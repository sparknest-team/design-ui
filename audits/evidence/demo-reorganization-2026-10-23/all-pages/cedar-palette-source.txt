<template>
  <div class="palette-demo">
    <div class="section-title">功能色阶</div>
    <div class="hue-grid">
      <div v-for="hue in functionalHues" :key="hue.name" class="hue-block">
        <div class="hue-label">{{ hue.label }}</div>
        <div class="swatch-row">
          <div
            v-for="step in steps"
            :key="`${hue.name}-${step}`"
            class="swatch"
            :style="{
              background: `rgb(var(--c-${hue.name}-${step}))`,
              color: step > 5 ? '#fff' : '#000',
            }"
            :title="`--c-${hue.name}-${step}`"
          >
            <span class="swatch-name">{{ step }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title">色相色阶</div>
    <div class="hue-grid">
      <div v-for="hue in chromaticHues" :key="hue.name" class="hue-block">
        <div class="hue-label">{{ hue.label }}</div>
        <div class="swatch-row">
          <div
            v-for="step in steps"
            :key="`${hue.name}-${step}`"
            class="swatch"
            :style="{
              background: `rgb(var(--c-${hue.name}-${step}))`,
              color: step > 5 ? '#fff' : '#000',
            }"
            :title="`--c-${hue.name}-${step}`"
          >
            <span class="swatch-name">{{ step }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const functionalHues = [
  { name: "primary", label: "Primary（主色）" },
  { name: "success", label: "Success" },
  { name: "warning", label: "Warning" },
  { name: "danger", label: "Danger" },
  { name: "link", label: "Link" },
  { name: "gray", label: "Gray" },
];

const chromaticHues = [
  { name: "brand", label: "Brand" },
  { name: "red", label: "Red" },
  { name: "orangered", label: "Orangered" },
  { name: "orange", label: "Orange" },
  { name: "gold", label: "Gold" },
  { name: "yellow", label: "Yellow" },
  { name: "lime", label: "Lime" },
  { name: "green", label: "Green" },
  { name: "cyan", label: "Cyan" },
  { name: "blue", label: "Blue" },
  { name: "purple", label: "Purple" },
  { name: "pinkpurple", label: "Pinkpurple" },
  { name: "magenta", label: "Magenta" },
];
</script>

<style lang="less" scoped>
.palette-demo {
  color: var(--c-color-text-1);
}

.section-title {
  margin: 16px 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.hue-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
  margin-bottom: 8px;
}

.hue-block {
  min-width: 0;
}

.hue-label {
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--c-color-text-3);
}

.swatch-row {
  display: flex;
  gap: 2px;
  overflow: hidden;
  border-radius: var(--c-border-radius-md, 4px);
}

.swatch {
  flex: 1;
  min-width: 0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.swatch-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 2px;
}

@media (max-width: 991px) {
  .hue-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .hue-grid {
    grid-template-columns: 1fr;
  }
}
</style>
