import contract from '../contracts/theme-contract.json' with { type: 'json' }

export const themeContract = Object.freeze(contract)
export const parityComponents = Object.freeze([...contract.components])
export const contractRules = Object.freeze({ ...contract.rules })
export const systemTokens = Object.freeze([...contract.tokens.system])
export const componentTokens = Object.freeze(
  Object.fromEntries(Object.entries(contract.tokens.components).map(([name, tokens]) => [name, Object.freeze([...tokens])])),
)
export const platformExtensions = Object.freeze(contract.platformExtensions)
