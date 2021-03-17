import "./styles.css"
import Markdown from 'markdown-to-jsx';
import React from 'react'

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
## Sleep apnea
**Periodically stop breathing when asleep**
).pointer( lung-R, Difficulty breathing, red )
.sumRank(40).sumUp(  
**Summary - Mild stuff**
)`,
`
ifC(Severe).say(    
## Severe stuff
Severe **stuff**
)
              `],
              impaxxcts: [
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
                  markdXXXown:`
ifAct(Sometimes).strikethrough(#lungy)
                  `,
                  impacts: [
                    "if(Never    ).doNothing()",
                    "ifRisk(Moderate).strikeSays(Moderate).say(Reduces moderate & severe impacts.)",
                    `ifAction(Nightly  ).delete(Moderate).strikeSays(Severe).say(
#### Nightly is the best choice
<CatImg /> 
<span>**Removes** moderate & *severe* impacts</span>
<Foxer txt="says Ting ting da wadoop a wow"/>
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
    "1": ["Symptom: Difficulty sleeping", 1, null],
    "2": ["Diagnosis: CPOD", "Mild", 2],
    "3": ["Sleep apena", "Moderate", null],
    "4": ["Use CPAP breathing assistant when sleeping", "Nightly", 2],
  }

  const parseImp = (imp) => imp.split(/\s*\./g).map((i) => (
    i.trim()
    .split(/[()]/g)
    .filter((x) => x !== "")
  ))
  const cleanImpacts = (imps) => imps.map((imp) => parseImp(imp))

  const parentArr = (struc) => {
    let arr = [struc]
    while(struc.parent){ arr.push(struc = struc.parent()) }
    return arr
  }
  //----/////////////----------------------
  const decorateStruc = (struc, jours, parent) => {
    struc.ancestors = () => parentArr(struc)//[struc, ...((parent) ? parent.ancestors() : [])]
    const kids = struc.children
    if (kids){
      kids.forEach((k) => {
        k.parent = () => struc // a function that returns the parent (not a ref since that would make a graph loop!)
        k.parentImpacts = struc.impacts
        // if (!struc.ancestors) k.ancestors = () => [struc]
        // // append first
        // else k.ancestors = () => [struc, ...struc.ancestors()] // append the rest
      })
    }
    //console.log('decorateStruc()', struc.flavor, struc.name, struc.ancestors())
    // if(struc.impacts) struc.impacts = cleanImpacts(struc.impacts)
    const pickOfJour = jours[struc.id]
    if (pickOfJour) {
      struc.pick = pickOfJour
      pickOfJour.push(() => struc) // jour[3] is a fn that returns this struc
    }
    struc.picks = struc.ancestors().map(x=>[x.flavor,x.pick[1]])
    // console.log('picks=',struc.picks)
    return [struc, ...decorateStrucs(struc.children, jours, struc)]
  }
  //----/////////////----------------------
  const decorateStrucs = (strucs, jours) =>(
    (strucs && strucs.map((x) => decorateStruc(x, jours) )) || []
  )

  const digImpact = (struc) => [struc.impacts, digImpacts(struc.children)],
    digImpacts = (strucs) =>
      strucs &&
      strucs
        .map((x) => digImpact(x))
        .flat(1000)
        .filter((x) => !!x)

  const compactJson = (json) => json.replace(/\[\n\s+/gm, "[").replace(/\s+"/gm, '"').replace(/"\n\s+\]/gm, '"]')

  structures = decorateStruc(structures, jours)
  console.log( structures )
  const str = JSON.stringify( structures, null, 2)

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
      <div key={struc.name || "?"}>
        {`${struc.flavor} : ${struc.name} [${struc.id}]`}

        <br />

        <div key={"picker_"+struc.picker} style={{marginLeft: 30, color: "#066"}}>
          {struc.picker}
        </div>
        <div key={"pick_"+struc.name} style={{marginLeft: 30, color: "#066"}}>
          {struc.pick && struc.pick[1]}
        </div>
        {struc.markdown && <MarkdownIf key={'md_if'} md={struc.markdown} struc={struc}/>}
        <div style={{marginLeft: 40, color: "#606"}}>
          {runImps(struc.impacts, struc)}
        </div>
        <div  key={'json'} style={{marginLeft: 40, color: "#600"}}>
          {/* <pre>{JSON.stringify(struc.impacts, null, 2)}</pre>
          <pre>{JSON.stringify(struc.parentImpacts, null, 2)}</pre> */}
        </div>
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
