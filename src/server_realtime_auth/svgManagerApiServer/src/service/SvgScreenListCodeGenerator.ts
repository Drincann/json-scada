export function generateSvgScreenListCode(svgList: { filename: string }[]) {
  return `
  optionhtml = \`
  <option selected disabled='disabled'>Choose a screen ...</option>
  <optgroup label = 'view list' >
  ${svgList.map(({ filename }) => `<option value='../svg/${filename}'> ${filename} </option>`).join('\n')}
  </optgroup >
  \`
  `
}