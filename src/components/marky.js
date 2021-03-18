import Markdown from 'markdown-to-jsx'

const mdOptions = (h, rest={}) => {
  let o = {}
  Object.entries(h).forEach(([k,v])=>{
    o[k] = {component:v}
  })
  return { overrides: o, ...rest }
}

const Marky = (rawProps) => {
  const {compsO, children, txt, ...props} = rawProps
  props.options = compsO && mdOptions(compsO)
  const txt2 = txt || children
  return(
    <Markdown {...{...props}}>
      {txt2}
    </Markdown>
  )
}

export {mdOptions, Marky}