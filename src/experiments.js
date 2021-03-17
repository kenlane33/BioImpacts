import React from 'react'
import Markdown from 'markdown-to-jsx'
import {parseImp} from './himp/himp'

const compactJson = (json) => json.replace(/\[\n\s+/gm, "[").replace(/\s+"/gm, '"').replace(/"\n\s+\]/gm, '"]')
// const str = JSON.stringify( structures, null, 2)

const Sayer = ({imps: impsArr}) => {
  const hasSay = (x) => x[0] === "say"
  return impsArr.map((imps) =>
    imps.filter(hasSay).map((imp) => (
      <p key={imp[1]}>
        {imps[0][1]}: {imp[1]}
      </p>
    ))
  )
}


const cleanImpacts = (imps) => imps.map((imp) => parseImp(imp))

// Iffy
const digImpact = (struc) => [
  struc.impacts, digImpacts(struc.children)],
digImpacts = (strucs) =>
  strucs &&
  strucs
    .map((x) => digImpact(x))
    .flat(1000)
    .filter((x) => !!x)


  const MarkdownIf =({md,struc}) => {
    if (md && md.includes(').')){
    md = md || ''
    const mds = md.trim().split(').').map(x=>x.trim()).filter(x=>(x!==''))
    return (
      <React.Fragment key={'MarkdownIf'+struc}>
        {mds.map( (m,i) =>{
          let [iffer, ...mm] = m.split('\n')
          iffer = iffer.trim()
          mm = mm.join('\n')
          const ifIsTrue = if_Imp(iffer, struc, iffer[2])
          console.log(`iffer="${iffer}"== ${ifIsTrue}  | mm=`,mm, 'ifIsTrue=' )
          return (
            <div style={{border:'solid 1px grey', padding:18}}>
              {''+ifIsTrue}
              <Markdown key={i} options={mdOptions({Foxer,CatImg})}>
                {mm}
              </Markdown>
              <br/>
            </div>
          )
        })}
      </React.Fragment>
    )} 
    else return null
  }