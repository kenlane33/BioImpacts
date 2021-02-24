import "./styles.css"

const imps2 = [
  "if(^,2).say(A)", // matchParentPick(struc)=>struc.parent.pick=2
  "if(^^,2).say(B).say(C)", // matchAncestorPick(pick)=>struc.ancestors.map(x=>x.pick).contains(pick)
  "if(^,Mild).say(D)" //
]
const safeIth = (arr, i) => (arr && i < arr.length ? arr[i] : null)
const safeInt = (int) => {}
export default function App() {
  var data = 
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
              impacts: [
                `if(^,Mild)
                    .say(Feel tired)
                    .say(Dry mouth)
                    .say(Mild snoring)`,

                `if(Moderate)
                    .prior()
                    .say(Diabetes)
                    .say(Strokes)
                    .say(Heart attacks)`,

                `if(Severe)
                    .prior()
                    .say(Sudden death while sleeping)`
              ],
              children: [
                {
                  flavor: "ACTION",
                  name: "Use CPAP breathing assistant when sleeping",
                  picker: "PickEnum(Never,Sometimes,Nightly)",
                  impacts: [
                    "if(^,Never    ).doNothing()",
                    "if(Sometimes).fix(Moderate,---).say(Reduces moderate & severe impacts.)",
                    "if(Nightly  ).fix(Moderate,DEL).fix(Severe,---).say(Removes moderate & severe impacts.)"
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
    "2": ["Diagnosis: CPOD", "Mild", null],
    "3": ["Sleep apena", "Moderate", null]
  }

  const parseImp = (imp) =>
    imp.split(/\s*\./g).map((x) =>
      x
        .trim()
        .split(/[()]/g)
        .filter((x) => x !== "")
    )
  const cleanImpacts = (imps) => imps.map((imp) => parseImp(imp))

  const decorateStruc = (struc, jours) => {
    const kids = struc.children
    if (!struc.ancestors) struc.ancestors = () => []
    if (kids)
      kids.forEach((k) => {
        k.parent = () => struc // a function that returns the parent (not a ref since that would make a graph loop!)
        k.parentImpacts = struc.impacts
        if (!struc.ancestors) k.ancestors = () => [struc]
        // append first
        else k.ancestors = () => [...struc.ancestors(), struc] // append the rest
      })
    console.log(struc.flavor, struc.name, struc.ancestors())
    // if(struc.impacts) struc.impacts = cleanImpacts(struc.impacts)
    const jour = jours[struc.id]
    if (jour) {
      struc.pick = jour
      jour.push(() => struc) // jour[3] is a fn that returns this struc
    }
    return [struc, ...decorateStrucs(struc.children, jours)]
  }
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

  const compactJson = (json) =>
    json
      .replace(/\[\n\s+/gm, "[")
      .replace(/\s+"/gm, '"')
      .replace(/"\n\s+\]/gm, '"]')

  // const imps = cleanImpacts(digImpacts(data)),
  //   txt = compactJson(JSON.stringify(imps, null, 2))
  // console.log(str)
  
  data = decorateStruc(data, jours)
  console.log( data )
  const str = JSON.stringify( data, null, 2)

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
  const matchAncestorPick = (struc, idx, pickIndexToCompare = 2) => (
    struc.ancestors.map( (x) =>
      safeIth(x.pick, pickIndexToCompare).contains(idx)
    )
  )

  const safeParseInt = (str) => {
    const i = parseInt(str) // also handles numbers correctly
    return isNaN(i) ? null : i
  }

  const matchParentPick = (struc, valToMatch, pickIndexToCompare = 1) => {
    const pp = safeIth(struc.parent().pick, pickIndexToCompare)
    console.log( `Does if(${valToMatch}) == ${pp} on parent's pick:\n ${struc.parent().pick.slice(0,3)}`)
    return pp === valToMatch
  }

  const if_Imp = (ifParams, struc) => {
    console.log(["if(", ifParams, struc])
    let oneMatched = false
    if (ifParams && ifParams.includes(",")) {
      const ps = ifParams.split(",").map((x) => x.trim())
      let i = 0
      while (i < ps.length - 1) {
        if      (ps[i] === "^" ) {
          oneMatched ||= matchParentPick(struc, ps[i + 1])
        }
        else if (ps[i] === "^^") {
          oneMatched ||= matchAncestorPick(struc, ps[i + 1])
        }
        i += 2
      }
    } else {
      oneMatched ||= safeIth(struc.pick, 2) === ifParams.trim()
    }
    return oneMatched
  }

  const runImps = (imps, struc) => {
    return (imps && imps.map((imp) => runImp(imp, struc))) || []
  }
  const runImp = (impRaw, struc) => {
    const imp = parseImp(impRaw)
    let ifExpResult = false
    return imp.map((i) => {
      const [verb, ...rest] = i
      // console.log( [verb, rest] )
      if (verb == "if") {
        ifExpResult = if_Imp(rest[0], struc)
        console.log(ifExpResult)
        return (ifExpResult ? " True :" : " False: ") + i.join('( ')
      } else if (verb == "say") {
        return <div key={rest[0]}>
          {(ifExpResult ? " True :" : " False: ") + i.join('( ') + rest[0]}
        </div>
      }
    })
  }

  //----//////-----------
  const Struc = ({struc}) => {
    return [
      <div key={struc.name || "?"}>
        {struc.flavor + ':' + struc.name}

        <br />

        <div style={{marginLeft: 30, color: "#066"}}>{struc.picker}</div>
        <div style={{marginLeft: 30, color: "#066"}}>{struc.pick && struc.pick[1]}</div>

        <div style={{marginLeft: 40, color: "#606"}}>
          {runImps(struc.impacts, struc)}
        </div>
        <div style={{marginLeft: 40, color: "#600"}}>
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
  // const imps = (digImpacts(x))


  return (
    <div className="App">
      <h3>Dig</h3>
      {/* <pre>{str}</pre> */}
      {/* <pre>{txt}</pre> */}
      <Strucs strucs={data} />
      {/* <Sayer imps={imps} /> */}

      <h2>Start editing to see some magic happen!</h2>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  )
}
