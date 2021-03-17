import "../styles/styles.css"
import Markdown from 'markdown-to-jsx';
import React from 'react'
import {prepStruc, parseImp} from '../himp/himp'

const imps2 = [
  "if(^,2).say(A)", // matchParentPick(struc)=>struc.parent.pick=2
  "if(^^,2).say(B).say(C)", // matchAncestorPick(pick)=>struc.ancestors.map(x=>x.pick).contains(pick)
  "if(^,Mild).say(D)" //
]
const safeIth = (arr, i) => (arr && i < arr.length ? arr[i] : null)
const safeInt = (int) => {}
export default function App() {
  var structures = 
    {
      flavor: "CONDITION",
      id: 1,
      name: "Symptom: Difficulty sleeping",
      picker: "PickSwitch()",
      children: [
        {
          flavor: "CONDITION",
          id: 2,
          name: "Diagnosis: CPOD",
          picker: "PickEnum(None,Mild,Moderate,Severe)",
          children: [
            {
              flavor: "RISK",
              id: 3,
              name: "Sleep apena",
              impacts:[`
ifC(Mild,OR,Moderate).set(life,-3).tag(#lungy).say(
**Sleep apnea:** *periodically* **stop breathing** when asleep
).pointer( lung-R, Difficulty breathing, red )
.sumRank(40).sumUp(  
**Summary - Mild stuff**
)`,
`
ifC(Severe).say(    
Severe **stuff** *in* **markdown** that would hide if parent \`ifC\` is not Severe
)
              `,
                'if(2).say(Woo)',
                `if(Mild).say(Feel tired).say(Dry mouth).say(Mild snoring)`,
                `if(Mild).prior().say(Diabetes).say(Strokes).say(Heart attacks)`,
                `if(Severe).prior().say(Sudden death while sleeping)`
              ],
              children: [
                {
                  flavor: "ACTION",
                  name: "Use CPAP breathing assistant when sleeping",
                  picker: "PickEnum(Never,Sometimes,Nightly)",
                  id: 4,
                  impacts: [
                    `ifAct(Sometimes).strikethrough(#lungy)`,
                    "if(Never    ).doNothing()",
                    "ifRisk(Moderate).strikeSays(Moderate).say(Reduces moderate & severe impacts.)",
                    `ifAction(Nightly  ).delete(Moderate).strikeSays(Severe).say(
**Nightly** is the best choice<br/>
<span>**Removes** moderate & **severe** *impacts*</span>

<CatImg /> <span> <-- a React component with an image </span>
<Foxer txt=": this is a silly React component that adds the word Fox as a prefix"/>
                      ).delete()
                    `
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

  const jours = {
    "1": ["Symptom: Difficulty sleeping", 1, 1],
    "2": ["Diagnosis: CPOD", "Mild", 2],
    "3": ["Sleep apena", "Moderate", null],
    "4": ["Use CPAP breathing assistant when sleeping", "Nightly", 2],
  }
  const ff = [
    {txt:'\n## Fooness\n**foo** boo', tag:'#21.R.Mild'},
    {txt:null, tag:'#SpecialTag'},
  ]
  
  structures = prepStruc(structures, jours)
  console.log( structures )

  const matchAncestorPick = (struc, valToMatch, flavorToMatch) => {
    let wasFound = false
    struc.ancestors().some( (x) => { // similar to forEach, but returning true breaks the loop
      const p1 = safeIth( x.pick, 1 )
      const p2 = safeIth( x.pick, 2 )
      // console.log(`if(${valToMatch}) p1==${p1}?${(p1 === valToMatch)}, p2==${p2}?${(p2 === valToMatch)}, val=${valToMatch}, Pick=${x.pick.slice(0,-1)}`)
      wasFound ||= ((p1+'') === valToMatch)
      wasFound ||= ((p2+'') === valToMatch) // checks index as well?
      if (flavorToMatch) {
        wasFound &&= (x.flavor[0] === flavorToMatch[0])
        // console.log(x.pick[1], x.flavor[0], flavorToMatch[0], x.flavor[0] === flavorToMatch[0])
      }
      return wasFound // if false keep looping b/c of the way .some() works, if true, done, so break!
    })
    return wasFound // this returns the final result from the func
  }

  const safeParseInt = (str) => {
    const i = parseInt(str) // also handles numbers correctly
    return isNaN(i) ? null : i
  }

  const matchParentPick = (struc, valToMatch, pickIndexToCompare = 1) => {
    const p1 = safeIth(struc.parent().pick, 1)
    const p2 = safeIth(struc.parent().pick, 2)
    const hasMatch = ((p1 === valToMatch) || (p2 === valToMatch))
    // console.log( `${(hasMatch)?'Match':'Nope'} Does if(${valToMatch}) == ${p1} on parent's pick:\n ${struc.parent().pick.slice(0,3)}`)
    return hasMatch
  }

  const safeSplit = (str,char) => (str.includes(char)) ? str.split(char) : ([str])

  const if_Imp = (ifParams, struc, flavorToMatch) => {
    let oneMatched = false
    if (ifParams) {
      const ps = safeSplit(ifParams, ',').map((x) => x.trim())
      let i = 0
      while (i < ps.length) { // step through a,b pairs or just one a at a time
        const a = ps[i]           // first  of pair
        ,     b = safeIth(ps,i+1) // second of pair
        if      ((a === "^") && b) {
          oneMatched ||= matchParentPick(struc, b, flavorToMatch)
          i += 2
        }
        else if ((a === "^^") && b) {
          oneMatched ||= matchAncestorPick(struc, b, flavorToMatch)
          i += 2
        }
        else {
          oneMatched ||= matchAncestorPick(struc, a, flavorToMatch)
          // const picks = struc.ancestors().map(a=>`[${a.id}]:${a.pick.slice(1,2)}`)
          // console.log(`a=${a}, anc.picks=${picks} | match?=${matchAncestorPick(struc, a)}`)
          i += 1
        }
      }
    } else {
      // oneMatched ||= safeIth(struc.pick, 2) === ifParams.trim()
      oneMatched ||= safeIth(struc.pick, 2) === ifParams.trim()
    }
    //console.log([oneMatched, `if${flavorToMatch||''}(`, ifParams, struc])
    return oneMatched
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
  const FixImp = (props) => <SimpleImp {...{...props, stl:{fontWeight:'bold'}}} />
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
    // console.log('imp=',imp)
    let ifExpResult = false
    return imp.filter(x=>x.length>0).map((impParts) => {
      const [verb, ...rest] = impParts.map(x=>x.trim())
      // console.log( [verb, rest] )
      if (verb.slice(0,2) === "if") {
        const flav = (verb.length>2) ? verb[2] : null
        ifExpResult = if_Imp(rest[0], struc, flav)
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
      <Markdown options={mdOptions({Foxer,CatImg})}>{`
<Foxer txt="hoo"/>
> "This is not the code you are looking for."
<CatImg />

> 

\`\`\`
Sample text here...
\`\`\`

Syntax highlighting

\`\`\`js
var foo = function (bar) {
  return bar++;
};
console.log(foo(5));
\`\`\`

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links
<a href="http://example.com/" target="_blank">Hello, world!</a>
[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images
<img style="width:50px" src="https://octodex.github.com/images/minion.png"/>
<img style="width:50px" src="https://octodex.github.com/images/stormtroopocat.jpg"/>

Like links, Images also have a footnote style syntax


With a reference later in the document defining the URL location:

<img style="width:50px" src="https://octodex.github.com/images/dojocat.jpg" />


## Plugins

The killer feature of \`markdown-it\` is very effective support of
[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).


`}</Markdown> */}
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
