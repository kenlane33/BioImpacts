const exampleStrucs =
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


export {exampleStrucs}