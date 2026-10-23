import contract from '../contracts/theme-contract.json' with { type: 'json' }

export const themeContract = Object.freeze(contract)
export const parityComponents = Object.freeze([...contract.components])
export const contractRules = Object.freeze({ ...contract.rules })
export const systemTokens = Object.freeze([...contract.tokens.system])
export const systemTokenValues = Object.freeze({ ...contract.systemTokenValues })
export const platformSystemTokenValues = Object.freeze(
  Object.fromEntries(Object.entries(contract.platformSystemTokenValues ?? {}).map(([name, values]) => [name, Object.freeze({ ...values })])),
)
export const componentTokenValues = Object.freeze(
  Object.fromEntries(
    Object.entries(contract.componentTokenValues).map(([name, values]) => [name, Object.freeze({ ...values })]),
  ),
)
export const componentTokens = Object.freeze(
  Object.fromEntries(Object.entries(contract.tokens.components).map(([name, tokens]) => [name, Object.freeze([...tokens])])),
)
export const platformExtensions = Object.freeze(contract.platformExtensions)
export const platformComponentTokenValues = Object.freeze(
  Object.fromEntries(Object.entries(contract.platformComponentTokenValues ?? {}).map(([platform, components]) => [
    platform,
    Object.freeze(Object.fromEntries(Object.entries(components).map(([name, values]) => [name, Object.freeze({ ...values })]))),
  ])),
)
