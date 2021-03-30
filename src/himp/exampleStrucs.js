const exampleStrucs =
{
  flavor: "CONDITION",
  id: 1,
  name: "Symptom: Difficulty sleeping",
  picker: "Pick(Yes,No)",
  children: [
    {
      flavor: "CONDITION", id: 11,
      name: "AAA",
      picker: "Pick(Yes,No)>>smoking",
    },
    {
      flavor: "CONDITION", id: 12,
      name: "BBB",
      picker: ">>smoking",
    },
    {
      flavor: "CONDITION", id: 13,
      name: "CCC",
      picker: ">>smoking",
    },
    {
      flavor: "CONDITION",
      id: 2,
      name: "Diagnosis: CPOD",
      picker: "Pick(None,Mild,Moderate,Severe)",
      children: [
        {
          flavor: "RISK",
          id: 3,
          name: "Sleep apnea",
          impacts:[`
.hide()
ifC(Mild).orIf(Moderate)
  .show()
  .set($boo,100)
  .setRR($boo,1.25)
  .tag(#lungy)
  .say(Strike out this text via an action since it is tagged as #lungy!)
  .say(
**Sleep apnea:** *periodically* **stop breathing** when asleep
  )
  .tag(#hideMe).say(
Hide **Me**)
  .tag(#showMe).say(
Show Me)
  .ifC(Mild)
  .hide(#hideMe)
  .show(#showMe)
  .strike(#lungy)
  .sumRank(50).sumSay(Sleep apnea trouble)
  .pointer( lung-R, Difficulty breathing, red )
  .sumRank(40)
  .set($life,  80 )    // $life is 80
  .set($life, +10 )   // $life is 90
  .set($life,  80%)   // $life is 72
  .set($life,  +5%)   // $life is 75.6
  .sumSay(  
**Summary** text: Untreated Sleep Apnea may reduce your lifespan by 5% to {$life} years.
  )
  .tag(#strokeness)
  .sumSay(Increased risk for heart attack or stroke)
  .say(  
React interpolation test
<Foxer txt="abc {$life} << should say 'Fox: abc 75.6'"/>
  )
ifC(Mild).andIfC(1)
.say(  
Severe **stuff** *in* **markdown** that would hide if parent \`ifC\` is not Severe
  )
          `,
          `if(Boom)
             .say(Woo)`,
          `if(Mild)
          .strik(#strokeness)
             .say(Feel tired).say(Dry mouth).say(Mild snoring)
             `,
          `if(Mild,OR,Moderate)
             .say(Diabetes).say(Strokes).say(Heart attacks)`,
          `if(Severe).say(Sudden death while sleeping)`,
          ],
          children: [
            {
              flavor: "ACTION",
              name: "Use CPAP breathing assistant when sleeping",
              picker: "Pick(Never,Sometimes,Nightly)",
              id: 4,
              impacts: [
                `ifAct(Nightly).strike(#lungy)`,
                "if(Never    ).doNothing()",
                `ifRisk(Moderate)
                .andIfAction(Nightly  )
                   .say(Reduces moderate & severe impacts.)`,
                `ifAction(Nightly  )
                  .delete(Moderate)
                  .fix(#Sum.life,+4%)
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