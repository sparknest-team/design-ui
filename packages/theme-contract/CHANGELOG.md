# @sparknest/theme-contract-vue

## 1.4.1

### Patch Changes

- chore(release): 全仓版本号统一（fixed 组），未变更包同步升版


## 1.2.0

- Use the same 23 Section theme variables in Cedar and Maple. In Maple, replace the `--mp-form-section-*` prefix with `--mp-section-*`.

- Align the shared field hover border and unchecked checkbox and radio colors with Cedar and Maple.

### Minor Changes

- [#1](https://github.com/sparknest-team/design-ui/pull/1) [`1a343a8`](https://github.com/sparknest-team/design-ui/commit/1a343a867512a4be3c31983080a2c56596f5813f) Thanks [@sparknest-team](https://github.com/sparknest-team)! - Move Cedar section tokens from form to section. Register Maple's existing form section defaults separately.

- [`074b6f7`](https://github.com/sparknest-team/design-ui/commit/074b6f7f4147d478da334a9e185e81a7f24f4092) - Register the shared FormSection styling contract and defaults already implemented and documented by Cedar and Maple. Validate token consumers, semantic color roles, and the specified section spacing on both platforms.
