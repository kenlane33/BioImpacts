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
ifC(Mild,OR,Moderate).set(life,-3).tag(#lungy).say(Strike ME!).say(
**Sleep apnea:** *periodically* **stop breathing** when asleep
).pointer( lung-R, Difficulty breathing, red ).hurt(#Sum.life,-4%)
.sumRank(40).sumSay(  
**Summary - Mild stuff**
)
ifC(Mild).andIf(1).say(    
Severe **stuff** *in* **markdown** that would hide if parent \`ifC\` is not Severe
)
          `,
          'if(Boom).say(Woo)',
          `if(Mild).say(Feel tired).say(Dry mouth).say(Mild snoring)`,
          `if(Mild,OR,Moderate).prior().say(Diabetes).say(Strokes).say(Heart attacks)`,
          `if(Severe).prior().say(Sudden death while sleeping)`,
          ],
          children: [
            {
              flavor: "ACTION",
              name: "Use CPAP breathing assistant when sleeping",
              picker: "PickEnum(Never,Sometimes,Nightly)",
              id: 4,
              impacts: [
                `ifAct(Nightly).strikeThrough(#lungy)`,
                "if(Never    ).doNothing()",
                "ifRisk(Moderate).andIfAction(Nightly  ).strikeSays(Moderate).say(Reduces moderate & severe impacts.)",
                `ifAction(Nightly  ).delete(Moderate).fix(#Sum.life,+4%).strikeSays(Severe).say(
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