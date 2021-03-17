const parseImp = (imp) => imp.split(/\s*\./g).map((i) => (
  i.trim()
  .split(/[()]/g)
  .filter((x) => x !== "")
))
const parentArr = (struc) => {
  let arr = [struc]
  while(struc.parent){ arr.push(struc = struc.parent()) }
  return arr
}
//----/////////////----------------------
const prepStruc = (struc, jours, parent) => {
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
  //console.log('prepStruc()', struc.flavor, struc.name, struc.ancestors())
  // if(struc.impacts) struc.impacts = cleanImpacts(struc.impacts)
  const pickOfJour = jours[struc.id]
  if (pickOfJour) {
    struc.pick = pickOfJour
    pickOfJour.push(() => struc) // struc.pick[3] is a fn that returns this struc
  }
  struc.picks = struc.ancestors().map(x=>[x.flavor,x.pick[1]])
  // console.log('picks=',struc.picks)
  return [struc, ...prepStrucs(struc.children, jours, struc)]
}
//----/////////////----------------------
const prepStrucs = (strucs, jours) =>(
  (strucs && strucs.map((x) => prepStruc(x, jours) )) || []
)

export {prepStruc, parseImp}