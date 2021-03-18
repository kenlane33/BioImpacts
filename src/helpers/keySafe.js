var keySafe = {}
export const ks = (k) => {
  if(keySafe[k]) {
    keySafe[k] += 1
    console.log(`duplicate key "${k}" has ${keySafe[k]}`)
  }
  else keySafe[k] = 1
  return k
}
export const ksGo = () => setTimeout(()=>{
  if (!ks.went) console.log(keySafe)
  ks.went=true
},2000)