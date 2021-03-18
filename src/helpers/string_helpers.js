//-----------//////////----------------------------o
export const titleCase = ([firstLetter, ...rest]) => (
  firstLetter.toUpperCase() + rest.join('')
)