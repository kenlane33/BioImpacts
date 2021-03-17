
import "../styles/styles.css"
import Markdown from 'markdown-to-jsx';
import React from 'react'
import {prepStruc, parseImp} from '../himp/himp'
import {exampleStrucs} from '../himp/exampleStrucs'
import {safeIth, trimAll,noBlanks,splitTrim} from '../helpers/array'

//======================/////============================
export default function App() {

  const jours = {
    "1": ["Symptom: Difficulty sleeping", 1, 1],
    "2": ["Diagnosis: CPOD", "Mild", 2],
    "3": ["Sleep apena", "Moderate", null],
    "4": ["Use CPAP breathing assistant when sleeping", "Nightly", 2],
  }

  const structures = prepStruc(exampleStrucs, jours)

  const ff = [
    {txt:'\n## Fooness\n**foo** boo', tag:'#21.R.Mild'},
    {txt:null, tag:'#SpecialTag'},
  ]
  
  console.log( structures )

  const matchAncestorPick = (struc, val, flavor) => {
    let wasFound = false
    struc.ancestors().some( (x) => { // similar to forEach, but returning true breaks the loop
      wasFound ||= ((safeIth( x.pick, 1 )+'') === val) // console.log(`if(${valToMatch}) p1==${p1}?${(p1 === valToMatch)}, p2==${p2}?${(p2 === valToMatch)}, val=${valToMatch}, Pick=${x.pick.slice(0,-1)}`)
      wasFound ||= ((safeIth( x.pick, 2 )+'') === val) // checks index as well?
      if (flavor) {
        wasFound &&= (x.flavor[0] === flavor[0]) // console.log(x.pick[1], x.flavor[0], flavorToMatch[0], x.flavor[0] === flavorToMatch[0])
      }
      return wasFound // if false keep looping b/c of the way .some() works, if true, done, so break!
    })
    return wasFound // this returns the final result from the func
  }

  const if_Imp = (ifParams, struc, flavorToMatch) => {
    // If any of the params match the picks of self or ancestors with the right flavor
    let gotMatch = false
    if (ifParams) {
      const ps = splitTrim(ifParams, ',')
      ps.some( (p) => { // some() is akin to forEach(), but returning true breaks the loop
        gotMatch ||= matchAncestorPick(struc, p, flavorToMatch) 
        return gotMatch // this will break the loop as soon as a match is found since we called some()
      })
    } 
    return gotMatch
  }

  const tfStr = (tf) => (tf) ? "T" : "F"
  const SimpleImp =({tf,parts,stl={},elType='d'}) => {
    // const txt = `${tfStr(tf)}: ${parts.join('(')})`
    const txt = ` ${tfStr(tf)}:${JSON.stringify(parts)}`
    stl = {fontFamily:'monospace',margin:0, ...stl}
    stl = {...stl, ...((tf)?({color:'green'}):({color:'red'}))}
    if (elType==='s') stl = {display:'inline',...stl}
    return <pre style={stl}>{txt}</pre> 
  }
  const FixImp = (p) => {
    p.parts.push('FIX'); 
    return <SimpleImp {...{...p, stl:{fontWeight:'bold'}}} />
  }
  const SayImp = ({tf,parts}) => {
    let [__,txt] = parts
    txt = txt.replace(/^[ \t]+/,'')
    if (txt.match(/^\n/)) return <Markdown options={mdOptions({Foxer,CatImg})}>{txt}</Markdown>
    return(<SimpleImp tf={tf} parts={[txt]} elType='s' />)
  }

  const runImps = (imps, struc) => {
    return (imps && imps.map((imp) => runImp(imp, struc))) || []
  }
  const runImp = (impRaw, struc) => {
    const imp = parseImp(impRaw) 
    console.log('imp=',imp)
    let ifExpResult = false
    return noBlanks(imp).map((impParts) => {
      const [verb, params] = trimAll(impParts)
      console.log( [verb, params] )
      if ( verb.startsWith("if") ) {
        const flav = safeIth(verb,2)// grabs X of ifX()
        ifExpResult = if_Imp(params, struc, flav)
        return <SimpleImp tf={ifExpResult} parts={impParts} />
      } else if (verb === "say") {
        return <SayImp tf={ifExpResult} parts={impParts} />
      } else if (verb === "fix") {
        return <FixImp tf={ifExpResult} parts={impParts} />
      } else {
        return <SimpleImp tf={ifExpResult} parts={impParts} />
      }
    })
  }

  //----//////-----------
  const Struc = ({struc}) => {
    return [
      <div key={'top'+(struc.id || "?")}>
        {`${struc.flavor} : ${struc.name} [${struc.id}]`}

        <br />

        <div key={"picker_"+struc.id} style={{marginLeft: 30, color: "#066"}}>
          {struc.picker}
        </div>
        <div key={"pick_"+struc.id} style={{marginLeft: 30, color: "#066"}}>
          {struc.pick && struc.pick[1]}
        </div>
        {/* {struc.markdown && <MarkdownIf key={'md_if'} md={struc.markdown} struc={struc}/>} */}
        <div key={'imps_'+struc.id} style={{marginLeft: 40, color: "#606"}}>
          {runImps(struc.impacts, struc)}
        </div>
        {/* <div  key={'json'+struc.id} style={{marginLeft: 40, color: "#600"}}>
          <pre>{JSON.stringify(struc.impacts, null, 2)}</pre>
          <pre>{JSON.stringify(struc.parentImpacts, null, 2)}</pre>
        </div> */}
        {/* <pre style={{fontSize: 10}}>
          {JSON.stringify({...struc, children: undefined}, null, 2)}
        </pre> */}
      </div>,
      Strucs({strucs: struc.children}) // recurse
    ]
  }
  //----///////-----------
  const Strucs = ({strucs}) => (
    strucs && strucs.map((s) => (
      <Struc struc={s} key={s.name || "?"} />
    ))
  )
  const Foxer = ({txt}) => <div>Fox: {txt}</div>
  const CatImg = ()=><img alt="" style={{width:50, display:'inline', verticalAlign: 'middle'}} src="https://octodex.github.com/images/stormtroopocat.jpg"/>

  const mdOptions = (h, rest={}) => {
    let o = {}
    Object.entries(h).forEach(([k,v])=>{
      o[k] = {component:v}
    })
    return { overrides: o, ...rest }
  }
  //-------------------------------------------
  return (
    <div className="App">
      {/* <MarkdownIf md='#ppdspfd\nboo' />
       */}
      <h3>Dig</h3>
      {/* <pre>{str}</pre> */}
      {/* <pre>{txt}</pre> */}
      <Strucs strucs={structures} />
      {/* <Sayer imps={imps} /> */}

      <h2>Start editing to see some magic happen!</h2>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  )
}
