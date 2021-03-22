import {safeIth, trimAll,noBlanks,splitTrim, makeDoFnOnEachFn} from '../helpers/array'

//----/////////------------------------------------
const parseImp = (imp) => (
  imp.replace(/\)[\s\n]*if/gm,').\nif').split(/\s*\./g).map((x) => {
    const ret = noBlanks(x.trim().split(/[()]/))
    // console.log(' parseImp=',ret)
    return ret
  })
)
//----//////////------------------------------------
const parentArr = (struc) => {
  let arr = [struc]
  while(struc.parent){ arr.push(struc = struc.parent()) }
  return arr
}
//----/////////////----------------------
const prepStruc = (struc, jours, comps, store) => {
  // console.log('prepStruc( ).store=',store)
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
  struc.impCompOs = runImps(struc.impacts, struc, comps, store)
  // console.log('ancFlavPicks=',JSON.stringify(struc.ancFlavPicks))
  // now recurse
  return [struc, ...prepStrucs(struc.children, jours, comps, store)]
}
//----///////////----------------------
const prepStrucs = (strucs, jours, comps, store) =>(
  (strucs && strucs.map((s) => prepStruc(s, jours, comps, store) )) || []
)
//----//////////////////------------------------------------
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
//----///////------------------------------------
const runImp = (impRaw, struc, comps, store) => {
  const imp = parseImp(impRaw) 
  let ifResult = false
  let collectedSays = []
  // console.log('store=',store)
  const impCompOs = noBlanks(imp).map((impParts,i) => {
    const [verb, params] = trimAll(impParts)
    let CompForVerb = comps[verb] || comps.Raw
    //console.log( '[verb, params]', [verb, params] )
    let bind = {comp: CompForVerb, key:`imp_${i}_${struc.id}`, tf:ifResult, parts: impParts}
    //-------------------------///--------------------------
    if (      verb.startsWith("if") ) {
      ifResult = calcIf(params, struc, verb)
      collectedSays = []
      bind = {...bind, comp: comps.if, tf: ifResult}
      return bind
      // return <Comps.Raw {...bind} />
    }
    //-------------------------//////--------------------------
    else if ( verb.startsWith("andIf") ) {
      ifResult = ifResult && calcIf(params, struc, verb.slice(3)) // slice to chop off the 'and' from 'andIf()
      bind = {...bind, comp: comps.if, tf: ifResult}
      return bind
      // return <Comps.Raw {...bind} />
    } 
    //----------//////--------------------------
    else if (verb === "say") {
      collectedSays.push(bind) //; console.log(`tag="${params}"`)
      return bind
      // return <bind.comp {...bind} />
    } 
    //----------//////--------------------------
    else if (verb === "strikeThrough") {
      const taggedImps = store[params.trim()]
      // console.log(params.trim(), 'store[params.trim()]=', taggedImps )
      taggedImps.map(x => x.comp = comps.greeny )
      console.log('strikeThrough().store=',store)
      if (ifResult) {}//TODO: do the thing!!!
      return bind
      // return <Comps.Raw {...bind} />
    } 
    //----------//////--------------------------
    else if (verb === "tag") {
      store[params.trim()] = collectedSays //; console.log(`tag="${params}"`)
      console.log('tag().store=',store)
      return bind
      // return <Comps.Raw {...bind} />
    } 
    //----------//////--------------------------
    else if (CompForVerb) {
      return bind
      // return <bind.comp {...bind} />
    } 
    else {
      return bind
      // return <Comps.Raw {...bind} />
    }
  })
  return impCompOs//[impRet, store]
}
//----////////------------------------------------
const runImps = makeDoFnOnEachFn(runImp)


export {prepStruc, parseImp, runImp, runImps}