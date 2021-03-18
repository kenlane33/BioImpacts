import {safeIth, trimAll,noBlanks,splitTrim, makeDoFnOnEachFn} from '../helpers/array'

const parseImp = (imp) => (
  imp.replace(/\)[\s\n]*if/gm,').\nif').split(/\s*\./g).map((x) => {
    const ret = noBlanks(x.trim().split(/[()]/))
    // console.log(' parseImp=',ret)
    return ret
  })
)
const parentArr = (struc) => {
  let arr = [struc]
  while(struc.parent){ arr.push(struc = struc.parent()) }
  return arr
}
//----/////////////----------------------
const prepStruc = (struc, jours, parent) => {
  const kids = struc.children
  if (kids){
    kids.forEach((k) => {
      k.parent = () => struc // a function that returns the parent (not a ref since that would make a graph loop!)
      // k.parentImpacts = struc.impacts
    })
  }
  const pickOfJour = jours[struc.id]
  if (pickOfJour) {
    struc.pick = pickOfJour
    pickOfJour.push(() => struc) // struc.pick[3] is a fn that returns this struc
  }
  const ancestors = parentArr(struc)
  struc.ancFlavPicks = ancestors.map(x=>`${x.flavor[0]}_${x.pick[1]}`)
  struc.ancPicks     = ancestors.map(x=>`${x.pick[1]}`)
  // console.log('ancFlavPicks=',JSON.stringify(struc.ancFlavPicks))
  // now recurse
  return [struc, ...prepStrucs(struc.children, jours, struc)]
}
//----/////////////----------------------
const prepStrucs = (strucs, jours) =>(
  (strucs && strucs.map((x) => prepStruc(x, jours) )) || []
)

const matchAncestorPick = (struc, val, flavor) => {
  return (flavor) ? 
    struc.ancFlavPicks.includes(`${flavor||''}_${val}`) :
    struc.ancPicks.includes(val)
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

const runImp = (impRaw, struc, Comps) => {
  const imp = parseImp(impRaw) 
  let ifResult = false
  return noBlanks(imp).map((impParts) => {
    const [verb, params] = trimAll(impParts)
    let CompForVerb = Comps[verb]
    //console.log( '[verb, params]', [verb, params] )
    //-------------------------///--------------------------
    if (      verb.startsWith("if") ) {
      ifResult = calcIf(params, struc, verb)
      const Comp = Comps.if
      return <Comp tf={ifResult} parts={impParts} />
    }
    //-------------------------//////--------------------------
    else if ( verb.startsWith("andIf") ) {
      ifResult = ifResult && calcIf(params, struc, verb.slice(3)) // slice to chop off the 'and' from 'andIf()
      const Comp = Comps.if
      return <Comp tf={ifResult} parts={impParts} />
    } 
    //----------//////--------------------------
    else if (CompForVerb) {
      return <CompForVerb tf={ifResult} parts={impParts} />
    } 
    else {
      return <Comps.Raw tf={ifResult} parts={impParts} />
    }
  })
}

const runImps = makeDoFnOnEachFn(runImp)


export {prepStruc, parseImp, runImp, runImps}