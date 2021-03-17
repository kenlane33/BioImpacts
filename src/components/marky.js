import Markdown from 'markdown-to-jsx'

const mdOptions = (h, rest={}) => {
  let o = {}
  Object.entries(h).forEach(([k,v])=>{
    o[k] = {component:v}
  })
  return { overrides: o, ...rest }
}

const Marky = (p) => (
  <Markdown {...{...p}}>
    {p.children}
  </Markdown>
)

export {mdOptions, Marky}