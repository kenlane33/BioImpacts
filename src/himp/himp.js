import {noBlanks} from '../helpers/array'

const parseImp = (imp) => (
  imp.split(/\s*\./g).map((x) => {
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
  console.log('ancFlavPicks=',JSON.stringify(struc.ancFlavPicks))
  // now recurse
  return [struc, ...prepStrucs(struc.children, jours, struc)]
}
//----/////////////----------------------
const prepStrucs = (strucs, jours) =>(
  (strucs && strucs.map((x) => prepStruc(x, jours) )) || []
)

export {prepStruc, parseImp}