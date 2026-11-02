/** Locate an example setting independently of whether its options need a list. */
export function demoControl(scope, name) {
  return scope.getByRole('radiogroup', { name, exact: true }).or(scope.getByRole('combobox', { name, exact: true })).first();
}

/** Use the same visible label activation as a mouse/touch user. */
export async function chooseDemoOption(page, name, option, scope = page) {
  const control = demoControl(scope, name);
  await control.waitFor({ state: 'visible' });
  if ((await control.getAttribute('role')) === 'radiogroup') {
    await control.getByText(option, { exact: true }).click();
  } else {
    await control.click();
    await page.getByRole('option', { name: option, exact: true }).filter({ visible: true }).last().click();
  }
}
