var vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: 1000, height: 200}});
var beamArray = [];
var score = vf.EasyScore();
var x = 0;
var y = 0;

function newStave(width){
    var stave = vf.Stave({x: x, y: y, width: width})
    x += width;
    return stave;
}


function newMeasure(vexCode = "", width = 200, options = {time: "-1", key: "-1", clef: "-1", beam: []}){
  var stave = newStave(width);
  var ties = [0];
  var tiecount = 0;
  if (vexCode.indexOf("(newMeasure") != -1){
    vexCode = vexCode.slice(0, vexCode.indexOf("(newMeasure") - 7);
  }

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

  putBeam = undefined
  if (options.beam != undefined){
    putBeam = [];
    for (b = 0; 2 * b < options.beam.length; b++){
        putBeam.push(new Vex.Flow.Fraction(options.beam[2 * b], options.beam[2 * b + 1]));
    }
  }


  var beams = Vex.Flow.Beam.applyAndGetBeams(voice, -1, putBeam);//#make the level.rthm an array of objects, with one item being a string and the other being options per measure, the 1st, 2nd, and 3rd elements of the array have per-measure info
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

function render(measures = [], position = 0, number = 4){//number is number of measures to render
  document.getElementById("sheetMusic").innerHTML = "";
  vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: 1000, height: 200}});
  score = vf.EasyScore();
  score.set({ time: level.time });
  x = 0;
  for (m = 0; m < number; m++){
    var a = m + Math.max(Math.floor(((number / 2 - m) + position) / number) * number, 0)
    beamA = a
    while (measures[beamA].beam == undefined && beamA > 0){
      beamA -= 1;
    }
    if (m == 0){
      newMeasure(measures[a].notes, 250, {time: level.time, clef: "percussion", beam: measures[beamA].beam});
    }
    else{
      newMeasure(measures[a].notes, 250, {beam: measures[beamA].beam});
    }
  }
}

function renderAll(measures = []){
  document.getElementById("sheetMusic").innerHTML = "";
  vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: measures.length * eval(level.time) * 4 * pixPerBeat, height: 200}});
  score = vf.EasyScore();
  score.set({ time: level.time });
  x = 0;
  for (i in measures){
    beamI = i
    while (measures[beamI].beam == undefined && beamI > 0){
      beamI -= 1;
    }
    if (i == 0){
      newMeasure(measures[i].notes, pixPerBeat * eval(level.time) * 4, {time: level.time, clef: "percussion", beam: measures[beamI].beam});
    }
    else{
      newMeasure(measures[i].notes, pixPerBeat * eval(level.time) * 4, {beam: measures[beamI].beam});
    }
  }
  
}

function editRender(measures = [], position = 0, number = 4){
  document.getElementById("sheetMusic").innerHTML = "";
  vf = new Vex.Flow.Factory({renderer: {elementId: "sheetMusic", width: 1000, height: 200}});
  score = vf.EasyScore();
  score.set({ time: level.time });
  x = 0;

  for (m = 0; m < number; m++){
    var a = Math.max(position - 3 + m, m);
    if (measures[a] != undefined && measures[a].notes != "[].concat("){  
      beamA = a
      while (measures[beamA].beam == undefined && beamA > 0){
        beamA -= 1;
      }
      if (m == 0){
        newMeasure(measures[a].notes, 250, {time: level.time, clef: "percussion", beam: measures[beamA].beam});
      }
      else{
        newMeasure(measures[a].notes, 250, {beam: measures[beamA].beam});
      }
    }
  }
}
//https://www.vexflow.com/build/docs/tuplet.html