
import {Marky} from '../components/marky'
import  React, {useEffect}  from 'react'
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
  const SimpleImp =({tf,parts,stl={},elType='d',style}) => {
    if (!parts || (typeof parts === 'string') ) {
      parts = [parts]
    }
    // const txt = `${tfStr(tf)}: ${parts.join('(')})`
    const isIf = parts && ((parts[0].startsWith('if')) || (parts[0].startsWith('andIf')|| (parts[0].startsWith('orIf'))) )
    const cmd0 = parts.join('(')
    const cmd = cmd0.includes('(') ? cmd0+')' : cmd0 + '()'
    // console.log('0',JSON.stringify(parts))
    // console.log('1',parts[0])
    // console.log('2',parts.join('('))
    let txt = (isIf) ? 
      `${parts.join('(')})` : 
      `└${tfStr(tf)}:${cmd}`.replace(/:"/,':').replace(/"$/,'')
    stl = {fontFamily:'monospace',margin:0, ...stl}
    stl = {...stl, ...((tf)?({color:'green'}):({color:'red'}))}
    if (elType==='s') stl = {display:'inline',...stl}
    if (!isIf) {
      stl = {borderLeft:'1px solid grey',...stl, marginLeft:10, paddingLeft:10 }
    } else {stl = {...stl, borderTop:'1px solid grey', borderLeft:'1px solid grey'}}
    return <pre style={{...stl, ...style}}>{txt}</pre> 
  }
  const FixImp = (p) => {
    // useEffect(()=>{p.parts.push('FIX')},[p.parts])
    return <SimpleImp {...{...p, stl:{fontWeight:'bold'}}} />
  }
  const interpolateStrings = (txt, vars) => {
    const arr = txt.split(/\{\$/).map((x,i)=>(i<0)?x:x.split('}'))
    if (arr.length==1) return txt
    else {
      // console.log(JSON.stringify(arr))
      // console.log(vars)
      const arr2 = arr.map( (x)=> (x.length>1)? (vars['$'+x[0]]+x[1]) : x[0])
      // console.log(JSON.stringify(arr2.join('')))
      return arr2.join('')
    }
  }
  const SayImp = ({tf, parts, style, store}) => {
    let [__,txt] = parts
    txt = interpolateStrings(txt, store.vars)
    txt = txt.replace(/^[ \t]+/,'') // trimLeft except for \n
    if (txt.match(/^\n/)) return (
      <div style={{marginLeft:10, padding:'2px 0 15px 10px', border:'solid 1px grey', ...style}}>
        <pre style={{margin:'0 0 8px 0',paddingBottom:0,borderBottom:'3px solid #ddd'}}>
          └{tfStr(tf)}: &lt;Markdown&gt;
        </pre>
        <Marky compsO={{Foxer,CatImg}} txt={txt} />
        <div style={{marginTop:8, borderBottom:'3px solid #ddd'}}></div>
      </div>
    )
    return(<SimpleImp tf={tf} parts={parts} elType='s' style={style}/>)
  }

    //    //////////////
  const RendImpCompOs = ({impCompOs,id}) => (<span key={ks('imps_'+id)} 
    style={{marginLeft: 5, color: "#606"}}>
      {impCompOs.map(x=>x.map(ico=>(
        ico.comp && <ico.comp {...ico} store={store}/>
      )))}
  </span>)
  //----//////-----------
  const doPick = (picker,pick,pickTags) => {
    
  }
  //    ///////
  const Picker = ({picker,pick,doPick,id}) => {
    if (!picker) return null
    let [verb,pms] = (picker && picker.split(/[()]+/)) || ['?','']
    const isEnum = (verb==='PickEnum')
    pms = (isEnum) ? pms : 'Yes,No'
    const btns = pms.split(',')
    const pick2 = safeIth(pick, 1)+''
    pick = (isEnum) ? pick2 : ((pick2==='1'||safeIth(pick,1)===true||pick2==='on'||pick2==='On')?'On':'Off')
    return (
      <div key={ks("picker_"+id)} 
        style={{marginLeft: 30, color: "#066"}}>
          {picker}:{pick}
          {btns.map(b=> {
            const stl= (b===pick) ? {border:'3px black solid'} :{}
          return (
            <button style={{background:'#ccc', margin:4, padding:2, ...stl}}>
              {b}
            </button>)
          })}
      </div>
    )
  }
  //----//////-----------
  const Struc = ({struc, Comps, store}) => {
    if(!struc.id) return null
    const {id} = struc
    if (struc.impCompOs.length>0) console.log('struc.impCompOs=', struc.impCompOs)
    // if (struc.style) console.log('struc.style',struc.style)
    //    ////
    const Top = ({children}) => (<div key={ks('top_'+(id || "?"))} 
      style={{marginTop:20, paddingTop:4,borderTop:'1px solid grey', ...(struc.style||{})}}>
        {children}
    </div>)

    //    //////////
    const StrucShow = ({struc:{flavor,name,id}}) => <div key={ks('struc_'+id)}
      style={{background:'#ddd', padding:5}}>
        <span style={{background:'white',padding:2,lineHeight:2,fontSize:10}}>{`${flavor} :`}</span>
        {` ${name} [${id}]`}
    </div>
    //    ///////
    const PadGrey = ({children}) => (<span key={ks("pick_"+id)} 
      style={{marginLeft: 30, color:'#ccc'}}>
        {children}
    </span>)
    //    /////////
    const PickShow = ({struc:{pick, id}}) => (<span key={ks("pick_"+id)} 
      style={{color: "#050", fontWeight:600}}>
      {safeIth( pick, 1)}
    </span>)

    //---------------------------------------------
    return [
      <Top>
        <StrucShow struc={struc} />          
        <Picker {...{...struc}} />
        <PadGrey>Pick = </PadGrey>
        <PickShow struc={struc} />
        <RendImpCompOs impCompOs={struc.impCompOs} id={struc.id}/>
      </Top>,
      Strucs({strucs: struc.children, Comps, store}) // recurse
    ]
  }
  //----///////-----------
  const Strucs = ({strucs, Comps, store}) => {
    return (
      strucs && strucs.map((s,i) => (
        <Struc store={store} struc={s} Comps={Comps} key={s.name || `?${i}`} />
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
  console.log( 'store=', store )
  const summary = store.sumImps.sort(x=>x.rank).map(x=>[x])
  useEffect(()=>{
    console.log(new Date().toTimeString().slice(0,8),'=========================================================')
  },[])
  //-------------------------------------------
  return (
    <div className="App">
      <h3>Health Impact Code (Himp)</h3>
      <div style={{border:'solid 1px blue', padding:8}}>
        Summary .say()scollected from .sumSay() statements<br/> <br/> 
        <RendImpCompOs impCompOs={summary} id='summary'/>
      </div>
      {/* <pre>{JSON.stringify(summary, null, 2)
        .replace(/,[\n\s]+"/mg,', "').replace(/{[\n\s]+/mg,'{')
      }</pre> */}
      <div style={{border:'solid 1px green', padding:8}}>
      vars:
      <pre>{JSON.stringify(store.vars, null, 2)}</pre>
      </div>
      <pre>{JSON.stringify(store.err, null, 2)}</pre>
      <Strucs store={store} strucs={structures} Comps={comps}/>
      <h1>☯</h1>
    </div>
  )
}
if (!ks.went) ksGo()
