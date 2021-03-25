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
          name: "Sleep apnea",
          impacts:[`
          .hide().if(*).show()
ifC(Mild,OR,Moderate).tag(#lungy)
  .set(life,-3)
  .say(Strike out this text via an action since it is tagged as #lungy!)
  .say(
**Sleep apnea:** *periodically* **stop breathing** when asleep
  )
  .sumRank(50).sumSay(Sleep apnea trouble)
  .pointer( lung-R, Difficulty breathing, red )
  .sumRank(40)
  .set($lifeYears,-5%)
  .set($life, 8)    // $life is 5
  .set($life, +7)   // $life is 12
  .set($life, 25%)  // $life is 3.0
  .set($life, 50%) // $life is 1.5
  .sumSay(  
**Summary** text: Untreated Sleep Apnea may reduce your lifespan by 5% to {$life} years
  )

ifC(Mild).andIfC(1)
.say(  
Severe **stuff** *in* **markdown** that would hide if parent \`ifC\` is not Severe
  )
          `,
          `if(Boom)
             .say(Woo)`,
          `if(Mild)
             .say(Feel tired).say(Dry mouth).say(Mild snoring)`,
          `if(Mild,OR,Moderate)
             .say(Diabetes).say(Strokes).say(Heart attacks)`,
          `if(Severe).say(Sudden death while sleeping)`,
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
                `ifRisk(Moderate).andIfAction(Nightly  )
                   .strikeSays(Moderate)
                   .say(Reduces moderate & severe impacts.)`,
                `ifAction(Nightly  )
                   .delete(Moderate)
                   .fix(#Sum.life,+4%)
                   .strikeSays(Severe)
                   .say(
**Nightly** is the best choice<br/>
<span>**Removes** moderate & **severe** *impacts*</span>

<CatImg /> <span> <-- a React component with an image </span>
<Foxer txt=": this is a silly React component that adds the word Fox as a prefix"/>
                  )
                  .delete()
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