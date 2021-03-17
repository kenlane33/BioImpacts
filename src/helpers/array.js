


const safeIth = (arr, i) => (arr && i < arr.length ? arr[i] : null)

const trimAll  = (arr) => arr.map(x=>x.trim())
const noBlanks = (arr) => arr.filter(x=>(x && (x.length>0)))

const safeSplit = (str,char) => (char instanceof RegExp) ? 
  ( (str.match(char))    ? str.split(char) : ([str]) ) :
  ( (str.includes(char)) ? str.split(char) : ([str]) )
const splitTrim  = (str,ch=',') => trimAll(safeSplit(str,ch))

export {safeIth,trimAll,noBlanks,splitTrim}