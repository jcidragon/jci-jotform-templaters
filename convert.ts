import * as fs from 'fs';

const Docxtemplater = require('docxtemplater');
const JSZip = require('jszip');
const HTMLModule = require('docxtemplater-html-module')

const htmlModule = new HTMLModule({
  ignoreUnknownTags: true,
  ignoreCssErrors: true
});

export function convert(submissions: any, content: Buffer) {
  var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

  var zip = new JSZip(content);
  var doc = new Docxtemplater();
  doc.attachModule(htmlModule);
  doc.loadZip(zip);

  submissions.content.sort((a: any, b: any) => {
    if (a.answers && b.answers) {
      return collator.compare((Object as any).values(a.answers).find((x: any) => x.name === 'agendaNo').answer, (Object as any).values(b.answers).find((x: any) => x.name === 'agendaNo').answer)
    } else if (a.answers) {
      return 1;
    } else {
      return -1;
    }
  })

  const maps = [];
  for (const submission of submissions.content) {
    const map: { [key: string]: any } = {};

    for (const key in submission.answers) {
      if (submission.answers.hasOwnProperty(key)) {
        const mapKey = submission.answers[key].text;
        if (typeof submission.answers[key].answer == "string") {
          submission.answers[key].answer = submission.answers[key].answer.replace(/background-color: transparent;?/g, '');
        }
        map[mapKey] = submission.answers[key].prettyFormat || submission.answers[key].answer;
      }
    }

    console.log(map);
    
    maps.push(map);
  }
  
  doc.setData({
    pages: maps
  });

  try {
    doc.render()
  }
  catch (error) {
    var e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({ error: e }));
    throw error;
  }

  var buf = doc.getZip().generate({ type: 'nodebuffer' });
  return buf;
}
