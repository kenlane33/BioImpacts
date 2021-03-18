
import Markdown from 'markdown-to-jsx';
import React from 'react'
import {mdOptions, Marky} from '../components/marky'


const Foxer = ({txt}) => <div>Fox: {txt}</div>
const CatImg = ()=><img alt="" style={{width:50, display:'inline', verticalAlign: 'middle'}} src="https://octodex.github.com/images/stormtroopocat.jpg"/>

var x = <Marky options={mdOptions({Foxer,CatImg})}>{`
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


`}</Marky>