
import {Marky} from '../components/marky'
import  React  from 'react'
import {prepStruc} from '../himp/himp'
import {exampleStrucs} from '../himp/exampleStrucs'
import {safeIth} from '../helpers/array'
import {runImps} from './himp'
import {ks, ksGo} from '../helpers/keySafe'

//======================/////////============================
export default function DemoHimp() {


  const ff = [
    {txt:'\n## Fooness\n**foo** boo', tag:'#21.R.Mild'},
    {txt:null, tag:'#SpecialTag'},
  ]

  const tfStr = (tf) => (tf) ? "T" : "F"
  const GreenImp =(p) => {
    return <SimpleImp {...{...p, stl:{fontWeight:'bold',color:'white',background:'#dfd',textDecoration:'line-through'}}} />
  }
  const SimpleImp =({tf,parts,stl={},elType='d'}) => {
    // const txt = `${tfStr(tf)}: ${parts.join('(')})`
    const isIf = parts && ((parts[0].startsWith('if')) || (parts[0].startsWith('andIf')) )
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

  //----//////-----------
  const Struc = ({struc, Comps, store}) => {
    if(!struc.id) return null
    const {id} = struc
    console.log('struc.impCompOs=', struc.impCompOs)
    return [
      <div key={ks('top_'+(id || "?"))} style={{marginTop:20, paddingTop:4,borderTop:'1px solid grey'}}>
        <div key={ks('struc_'+id)}>
          {`${struc.flavor} : ${struc.name} [${struc.id}]`}
        </div>
        <div key={ks("picker_"+id)} style={{marginLeft: 30, color: "#066"}}>
          {struc.picker}
        </div>
        <span style={{marginLeft: 30, color:'#ccc'}}>Pick = </span>
        <span key={ks("pick_"+id)} style={{color: "#050", fontWeight:600}}>
          {safeIth( struc.pick, 1)}
        </span>
        {/* {struc.markdown && <MarkdownIf key={'md_if'} md={struc.markdown} struc={struc}/>} */}
        <span key={ks('imps_'+id)} style={{marginLeft: 5, color: "#606"}}>
          {struc.impCompOs.map(x=>x.map(ico=>(
            ico.comp && <ico.comp {...ico} />
          )))}
        </span>
      </div>,
      Strucs({strucs: struc.children, Comps, store}) // recurse
    ]
  }
  //----///////-----------
  const Strucs = ({strucs, Comps, store}) => {
    return (
      strucs && strucs.map((s) => (
        <Struc store={store} struc={s} Comps={Comps} key={s.name || "?"} />
    ))
  )}
  const Foxer = ({txt}) => <div>Fox: {txt}</div>
  const CatImg = ()=><img alt="" style={{width:50, display:'inline', verticalAlign: 'middle'}} src="https://octodex.github.com/images/stormtroopocat.jpg"/>
  const StrikeImp = ({tf,parts}) =>(
    <pre>{`${tfStr(tf)}: ${parts.join('(')})`}</pre>
  )
  //-------------------------------------------
  const jours = {
    "1": ["Symptom: Difficulty sleeping", 1, 1],
    "2": ["Diagnosis: CPOD", "Mild", 2],
    "3": ["Sleep apena", "Moderate", null],
    "4": ["Use CPAP breathing assistant when sleeping", "Nightly", 2],
  }

  //-------------------------------------------
  const comps = {
    if:SimpleImp,
    andIf:SimpleImp,
    say:SayImp, 
    sumSay:SayImp, 
    fix:FixImp,
    strikethrough: StrikeImp,
    Raw:SimpleImp,
    greeny:GreenImp,
  }
  let store = {}
  const structures = prepStruc(exampleStrucs, jours, comps, store)
  console.log( 'structures=', structures )
  //-------------------------------------------
  return (
    <div className="App">
      <h3>Health Impact Code (Himp)</h3>
      <Strucs store={store} strucs={structures} Comps={comps}/>
      <h1>☯</h1>
    </div>
  )
}
if (!ks.went) ksGo()
