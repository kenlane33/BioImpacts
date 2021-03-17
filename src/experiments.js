import React from 'react'
import Markdown from 'markdown-to-jsx'
import {parseImp} from './himp/himp'
import {safeIth} from './helpers/array'

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


  const imps2 = [
    "if(^,2).say(A)", // matchParentPick(struc)=>struc.parent.pick=2
    "if(^^,2).say(B).say(C)", // matchAncestorPick(pick)=>struc.ancestors.map(x=>x.pick).contains(pick)
    "if(^,Mild).say(D)" //
  ]

  const matchParentPick = (struc, valToMatch, pickIndexToCompare = 1) => {
    const p1 = safeIth(struc.parent().pick, 1)
    const p2 = safeIth(struc.parent().pick, 2)
    const hasMatch = ((p1 === valToMatch) || (p2 === valToMatch))
    // console.log( `${(hasMatch)?'Match':'Nope'} Does if(${valToMatch}) == ${p1} on parent's pick:\n ${struc.parent().pick.slice(0,3)}`)
    return hasMatch
  }


  const safeParseInt = (str) => {
    const i = parseInt(str) // also handles numbers correctly
    return isNaN(i) ? null : i
  }

