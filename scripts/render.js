var vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: 1000, height: 200}});
var score = vf.EasyScore();
var x = 0;
var y = 0;

function newStave(width){
    var stave = vf.Stave({x: x, y: y, width: width})
    x += width;
    return stave;
}


function newMeasure(vexCode = "", width = 200, options = {time: "-1", key: "-1", clef: "-1"}){
  var stave = newStave(width);
  var ties = [0];
  var tiecount = 0;
  if (vexCode.indexOf("(newMeasure") != -1){
    vexCode = vexCode.slice(0, vexCode.indexOf("(newMeasure") - 7);
  }
  var remain = eval(testCode(level.time)) * 4 - vexCodetoRhythmArray(vexCode).reduce((prev, current) => prev + current, 0);//this isn't doing anything#
  if (remain == 0){
    vexCode = "(" + vexCode
  }
  if (Math.floor(remain / 4) > 0){
      vexCode += "score.notes('B4/1/r'),";
      remain += -4;
  }
  if (Math.floor(remain / 2) > 0){
      vexCode += "score.notes('B4/2/r'),";
      remain += -2;
  }
  if (Math.floor(remain / 1) > 0){
      vexCode += "score.notes('B4/4/r'),";
      remain += -1;
  }
  if (Math.floor(remain / 0.5) > 0){
      vexCode += "score.notes('B4/8/r'),";
      remain += -0.5;
  }
  if (Math.floor(remain / 0.25) > 0){
      vexCode += "score.notes('B4/16/r'),";
      remain += -0.25;
  }
  vexCode += ")";//I know this isn't doing anything
  vexCode = eval(testCode(vexCode));
  var voice = score.voice(vexCode);
  if (options.time != undefined && options.time != "-1"){
    stave.addTimeSignature(options.time);
  }
  if (options.clef != undefined && options.clef != "-1"){
    stave.addClef(options.clef);
  }
  if (options.key != undefined && options.key != "-1"){
    stave.addKeySignature(options.key);
  }

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);
  vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  vf.draw();
  beams.forEach((beam) => beam.setContext(vf.getContext()).draw());
  if (ties != 0){
    ties.forEach((t) => {t.setContext(vf.getContext()).draw();});
  }
  return vexCode;

  function tie(these){
    ties[tiecount] = new Vex.Flow.StaveTie({
      first_note: these[0],
      last_note: these[1],
      first_indices: [0],
      last_indices: [0],
    })
    tiecount++;
    return these;
  }
}

function render(measures = [], position = 0){
  document.getElementById("sheetMusic").innerHTML = "";
  vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: 1000, height: 200}});
  score = vf.EasyScore();
  score.set({ time: level.time });
  x = 0;
  var a = Math.min(Math.floor((2 + position) / 4) * 4, measures.length - 1);
  var b = Math.min(1 + Math.floor((1 + position) / 4) * 4, measures.length - 1);
  var c = Math.min(2 + Math.floor((position) / 4) * 4, measures.length - 1);
  var d = Math.min(3 + Math.max(Math.floor((-1 + position) / 4) * 4, 0), measures.length - 1);
  newMeasure(measures[a], 250, {time: level.time, clef: "percussion"});
  if (measures[b] != undefined){
    newMeasure(measures[b], 250);
  }
  if (measures[c] != undefined){
    newMeasure(measures[c], 250);
  }
  if (measures[d] != undefined){
    newMeasure(measures[d], 250);
  }
}

function renderAll(measures = []){
  document.getElementById("sheetMusic").innerHTML = "";
  vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: measures.length * eval(level.time) * 4 * pixPerBeat, height: 200}});
  score = vf.EasyScore();
  score.set({ time: level.time });
  x = 0;
  for (i in measures){
    if (i == 0){
      newMeasure(measures[i], pixPerBeat * eval(level.time) * 4, {time: level.time, clef: "percussion"});
    }
    else{
      newMeasure(measures[i], pixPerBeat * eval(level.time) * 4);
    }
  }
  
}

function editRender(measures = [], position = 0){
  document.getElementById("sheetMusic").innerHTML = "";
  vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: 1000, height: 200}});
  score = vf.EasyScore();
  score.set({ time: level.time });
  x = 0;
  
  newMeasure(measures[Math.max(position - 3, 0)], 250, {time: level.time, clef: "percussion"});
  if (measures[Math.max(position - 2, 1)] != undefined){
    newMeasure(measures[Math.max(position - 2, 1)], 250);
  }
  if (measures[Math.max(position - 1, 2)] != undefined){
    newMeasure(measures[Math.max(position - 1, 2)], 250);
  }
  if (measures[Math.max(position, 3)] != undefined){
    newMeasure(measures[Math.max(position, 3)], 250);
  }
}
//https://www.vexflow.com/build/docs/tuplet.html