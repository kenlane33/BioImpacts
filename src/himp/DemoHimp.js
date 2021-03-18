
import {Marky} from '../components/marky'
import  React  from 'react'
import {prepStruc, parseImp} from '../himp/himp'
import {exampleStrucs} from '../himp/exampleStrucs'
import {safeIth, trimAll,noBlanks,splitTrim} from '../helpers/array'

//======================/////============================
export default function DemoHimp() {

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
  
  console.log( 'structures=', structures )

  const matchAncestorPick = (struc, val, flavor) => {
    return (flavor) ? 
      struc.ancFlavPicks.includes(`${flavor||''}_${val}`) :
      struc.ancPicks.includes(val)
    // let wasFound = false
    // struc.ancestors().some( (x) => { // similar to forEach, but returning true breaks the loop
    //   wasFound ||= ((safeIth( x.pick, 1 )+'') === val) // console.log(`if(${valToMatch}) p1==${p1}?${(p1 === valToMatch)}, p2==${p2}?${(p2 === valToMatch)}, val=${valToMatch}, Pick=${x.pick.slice(0,-1)}`)
    //   wasFound ||= ((safeIth( x.pick, 2 )+'') === val) // checks index as well?
    //   if (flavor) {
    //     wasFound &&= (x.flavor[0] === flavor[0]) // console.log(x.pick[1], x.flavor[0], flavorToMatch[0], x.flavor[0] === flavorToMatch[0])
    //   }
    //   return wasFound // if false keep looping b/c of the way .some() works, if true, done, so break!
    // })
    // return wasFound // this returns the final result from the func
  }

  const calcIf = (ifParams, struc, verb) => {
    // If any of the params match the picks of self or ancestors with the right flavor
    const flavorToMatch = safeIth(verb,2) // grabs the X in ifX()
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
    const isIf = parts && (parts[0].slice(0,2) === 'if')
    let txt = (isIf) ? `${parts.join('(')})`: `└${tfStr(tf)}:${JSON.stringify(parts)}`.replace(/:"/,':').replace(/"$/,'')
    stl = {fontFamily:'monospace',margin:0, ...stl}
    stl = {...stl, ...((tf)?({color:'green'}):({color:'red'}))}
    if (elType==='s') stl = {display:'inline',...stl}
    if (!isIf) {
      stl = {borderLeft:'1px solid grey',...stl, marginLeft:10, paddingLeft:10 }
    } else {stl = {...stl, borderTop:'1px solid grey', borderLeft:'1px solid grey'}}
    return <pre style={stl}>{txt}</pre> 
  }
  const FixImp = (p) => {
    // useEffect(()=>{p.parts.push('FIX')},[p.parts])
    return <SimpleImp {...{...p, stl:{fontWeight:'bold'}}} />
  }
  const SayImp = ({tf,parts}) => {
    let [__,txt] = parts
    txt = txt.replace(/^[ \t]+/,'') // trimLeft except for \n
    if (txt.match(/^\n/)) return (
      <div style={{marginLeft:10, padding:'2px 0 15px 10px', border:'solid 1px grey'}}>
        <pre style={{margin:'0 0 8px 0',paddingBottom:0,borderBottom:'3px solid #ddd'}}>
          └{tfStr(tf)}: &lt;Markdown&gt;
        </pre>
        <Marky compsO={{Foxer,CatImg}} txt={txt} />
        <div style={{marginTop:8, borderBottom:'3px solid #ddd'}}></div>
      </div>
    )
    return(<SimpleImp tf={tf} parts={`say('${txt}')`} elType='s' />)
  }
  const runImps = (imps, struc, Comps) => {
    // console.log('Comps=',Comps)
    return (imps && imps.map((imp) => runImp(imp, struc, Comps))) || []
  }
  const runImp = (impRaw, struc, Comps) => {
    const imp = parseImp(impRaw) 
    let ifExpResult = false
    return noBlanks(imp).map((impParts) => {
      const [verb, params] = trimAll(impParts)
      //console.log( '[verb, params]', [verb, params] )
      if (      verb.startsWith("if") ) {
        ifExpResult = calcIf(params, struc, verb)
        return <SimpleImp tf={ifExpResult} parts={impParts} />
      }
      else if ( verb.startsWith("andIf") ) {
        ifExpResult = ifExpResult && calcIf(params, struc, verb.slice(3)) // slice to chop off the 'and' from 'andIf()
        return <SimpleImp tf={ifExpResult} parts={['AND',...impParts]} />
      } 
      else if (verb === "say") {
        return <Comps.Say tf={ifExpResult} parts={impParts} />
      } 
      else if (verb === "sumSay") {
        return <Comps.SumSay tf={ifExpResult} parts={impParts} />
      } 
      else if (verb === "fix") {
        return <FixImp tf={ifExpResult} parts={impParts} />
      } 
      else {
        return <SimpleImp tf={ifExpResult} parts={impParts} />
      }
    })
  }
var keySafe = {}
const ks = (k) => {
  if(keySafe[k]) {
    keySafe[k] += 1
    console.log(`duplicate key "${k}" has ${keySafe[k]}`)
  }
  else keySafe[k] = 1
  return k
}
setTimeout(()=>{console.log(keySafe)},2000)
  //----//////-----------
  const Struc = ({struc, Comps}) => {
    if(!struc.id) return null
    return [
      <div key={ks('top_'+(struc.id || "?"))} style={{marginTop:20, paddingTop:4,borderTop:'1px solid grey'}}>
        {`${struc.flavor} : ${struc.name} [${struc.id}]`}

        <br />

        <div key={ks("picker_"+struc.id)} style={{marginLeft: 30, color: "#066"}}>
          {struc.picker}
        </div>
        <span style={{marginLeft: 30, color:'#ccc'}}>Pick = </span>
        <span key={ks("pick_"+struc.id)} style={{color: "#050", fontWeight:600}}>
          {safeIth( struc.pick, 1)}
        </span>
        {/* {struc.markdown && <MarkdownIf key={'md_if'} md={struc.markdown} struc={struc}/>} */}
        <div key={ks('imps_'+struc.id)} style={{marginLeft: 5, color: "#606"}}>
          {runImps(struc.impacts, struc, Comps)}
        </div>
        {/* <div  key={'json'+struc.id} style={{marginLeft: 40, color: "#600"}}>
          <pre>{JSON.stringify(struc.impacts, null, 2)}</pre>
          <pre>{JSON.stringify(struc.parentImpacts, null, 2)}</pre>
        </div> */}
        {/* <pre style={{fontSize: 10}}>
          {JSON.stringify({...struc, children: undefined}, null, 2)}
        </pre> */}
      </div>,
      Strucs({strucs: struc.children, Comps}) // recurse
    ]
  }
  //----///////-----------
  const Strucs = ({strucs, Comps}) => (
    strucs && strucs.map((s) => (
      <Struc struc={s} Comps={Comps} key={s.name || "?"} />
    ))
  )
  const Foxer = ({txt}) => <div>Fox: {txt}</div>
  const CatImg = ()=><img alt="" style={{width:50, display:'inline', verticalAlign: 'middle'}} src="https://octodex.github.com/images/stormtroopocat.jpg"/>

  //-------------------------------------------
  return (
    <div className="App">
      <h3>Health Impact Code (Himp)</h3>
      <Strucs strucs={structures} Comps={{Say:SayImp, SumSay:SayImp, Fix:FixImp, Raw:SimpleImp}}/>
      <h1>☯</h1>
    </div>
  )
}
