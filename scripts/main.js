var level = {};
var Settings = {
    inputOffset: 0,
    threshold: 0.3,
    sheetMusicMode: "scroll"
}
var Dev = {
    playerWidth: 20
}
var secsPerBeat;
var millisPerBeat;

fetch("test level.json")//#
    .then((response) => response.json())
    .then((info) => {
        level = info;
        secsPerBeat = (1 / level.bpm) * 60;
        millisPerBeat = secsPerBeat * 1000;
        pixPerBeat = document.getElementById("game").height / (eval(level.time) * 4);
        pixPerSec = pixPerBeat / secsPerBeat;
        
        //editor();
        play();
        document.getElementById("audio").hidden = false;
});

function play(){
    var failTimeID;
    var audio = document.getElementById("audio");
    var error;
    var i = 0;
    var j = 0;
    var performance = 0;
    document.getElementById("audio").addEventListener("playing", () => {playEvents();});
    document.getElementById("audio").addEventListener("seeking", () => {pauseEvents();});
    document.getElementById("audio").addEventListener("seeked", () => {if(!audio.paused){playEvents();}});
    document.getElementById("audio").addEventListener("waiting", () => {pauseEvents();});
    document.getElementById("audio").addEventListener("pause", () => {pauseEvents();});
    document.addEventListener("click", userPerformance);
    addEventListener("keypress", userPerformance);

    audio.play();

    function userPerformance(){
        if (performance == 0){
            performance = 1;
        }
        else {
            performance *= -1;
        }
        if(Settings.sheetMusicMode == "line"){render(level.rthm, j);};
        error = (audio.currentTime - Settings.inputOffset - ((j * (eval(level.time) * 4) * secsPerBeat) + secsPerBeat * vexCodetoRhythmArray(level.rthm[j]).slice(0, i).reduce((prev, current) => prev + current, 0) + level.offset)) / (secsPerBeat);
        if (Math.abs(error) > Settings.threshold){
            fail();
        }
        else{
            clearTimeout(failTimeID);
            if (vexCodetoRhythmArray(level.rthm[j])[i + 1] == undefined){
                j++;
                i = 0;
            }
            else{
                i++;
            }
        }
        if (vexCodetoRhythmArray(level.rthm[j])[i + 1] == undefined){
            time = 1000 * (((j + 1) * (eval(level.time) * 4) * secsPerBeat) + secsPerBeat * vexCodetoRhythmArray(level.rthm[j + 1]).slice(0, 0).reduce((prev, current) => prev + current, 0) - (document.getElementById("audio").currentTime - level.offset));
        }
        else{
            time = 1000 * ((j * (eval(level.time) * 4) * secsPerBeat) + secsPerBeat * vexCodetoRhythmArray(level.rthm[j]).slice(0, i + 1).reduce((prev, current) => prev + current, 0) - (document.getElementById("audio").currentTime - level.offset));
        }
        failTimeID = setTimeout(() => {error = Settings.threshold; fail();}, Math.max(time, millisPerBeat * Settings.threshold));
    }

    function fail(){
        clearTimeout(failTimeID);
        audio.pause();
        document.getElementById("failMenu").hidden = false;
        console.log("Incorrect! Error " + String(Math.round(100 * error)) + "%");
        if (vexCodetoRhythmArray(level.rthm[j])[i + 1] == undefined){
            j++;
            i = 0;
        }
        else{
            i++;
        }
        playEvents();
    }
    
    function playEvents(){
        j = Math.floor((Math.max(audio.currentTime - level.offset, 0)  / secsPerBeat) / (eval(level.time) * 4));
        i = 0;
        while (vexCodetoRhythmArray(level.rthm[j]).slice(0, i).reduce((prev, current) => prev + current, 0) < ((document.getElementById("audio").currentTime - level.offset) / secsPerBeat) - (j * eval(level.time) * 4)){
            if (vexCodetoRhythmArray(level.rthm[j])[i + 1] == undefined){
                j++;
                i = 0;
            }
            else{
                i++;
            }
        }
        if (vexCodetoRhythmArray(level.rthm[j])[i + 1] == undefined){
            time = 1000 * (((j + 1) * (eval(level.time) * 4) * secsPerBeat) + secsPerBeat * vexCodetoRhythmArray(level.rthm[j + 1]).slice(0, 0).reduce((prev, current) => prev + current, 0) - (document.getElementById("audio").currentTime - level.offset));
        }
        else{
            time = 1000 * ((j * (eval(level.time) * 4) * secsPerBeat) + secsPerBeat * vexCodetoRhythmArray(level.rthm[j]).slice(0, i + 1).reduce((prev, current) => prev + current, 0) - (document.getElementById("audio").currentTime - level.offset));
        }
        failTimeID = setTimeout(() => {error = Settings.threshold; fail();}, Math.max(time, millisPerBeat * Settings.threshold));
        if(Settings.sheetMusicMode == "line"){render(level.rthm, j);}
    }
    function pauseEvents(){
        clearTimeout(failTimeID);
    }

    var path = new Path2D;
    const canvas = document.getElementById("game");
    var svg;
    var multiplier = 0;
    var playerPathArray = [new Array()];
    initAnimation();

    function initAnimation(){
        var x = 0;
        var y = -canvas.height;
        path.moveTo(x, Math.abs(y));
        var k = 0;
        var l = 0;
        while (k < level.rthm.length){
            if (Math.abs(y) + Math.sign(y) * pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l] > canvas.height){
                var x1 = (-(y - canvas.height) / (1)) + x;
                var y1 = canvas.height;
                path.lineTo(x1 + 30, y1 + 30);
                path.moveTo(x1 - 30, 0 - 30);
                x += pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l];
                y = ((Math.abs(y) + Math.sign(y) * pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l]) - canvas.height);

            }
            else if (Math.abs(y) + Math.sign(y) * pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l] < 0){
                var x2 = (-(y - 0) / (1)) + x;
                var y2 = 0
                path.lineTo(x2 + 30, y2 - 30);
                path.moveTo(x2 - 30, canvas.height + 30);
                x += pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l];
                y = -1 * ((Math.abs(y) + Math.sign(y) * pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l]) + canvas.height);
            }
            else if (Math.abs(y) + Math.sign(y) * pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l] == 0){
                x += pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l];
                y = -0.000000000000001;
            }
            else{
                x += pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l];
                y = Math.sign(y) * (Math.abs(y) + Math.sign(y) * pixPerBeat * vexCodetoRhythmArray(level.rthm[k])[l]);
            }
            playerPathArray[k][l] = -Math.sign(y) * (document.getElementById("game").height - Math.abs(y) + 0.000000001);

            if ((k == level.rthm.length - 1) && (vexCodetoRhythmArray(level.rthm[k])[l + 1] == undefined)){
                if (Math.sign(y) > 0){
                    path.lineTo(x + 30, y + 30);
                }
                else{
                    path.lineTo(x + 30, -y - 30); 
                }
            }
            else{
                path.lineTo(x, Math.abs(y));
            }
            if (vexCodetoRhythmArray(level.rthm[k])[l + 1] == undefined){
                k++;
                playerPathArray[k] = new Array();
                y *= -1;
                l = 0;
            }
            else{
                l++;
                y *= -1;
            }
        }
        if (Settings.sheetMusicMode == "scroll"){
            renderAll(level.rthm);
            svg = document.getElementById("sheetMusic").children.item(0);
        }
        window.requestAnimationFrame(animate);
    }
    var playerHeight = 0;
    var prevTime = 0;
    var changed = false;

    function animate(){
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.lineWidth = pixPerBeat * Settings.threshold + Dev.playerWidth;
        var position = pixPerSec * (audio.currentTime - level.offset - Settings.inputOffset) - canvas.width / 2;

        if (Math.sign(performance) != Math.sign(multiplier)){
            //changed = true;

            if (playerHeight - Settings.threshold * pixPerBeat <= 0 && performance == -1){
                multiplier = performance;
            }
            else if (playerHeight + Settings.threshold * pixPerBeat >= canvas.height && performance == 1){
                multiplier = performance;
            }
            else if (playerPathArray[j][i - 1] != undefined){
                multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[j][i - 1]) - playerHeight) / Math.abs((j * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[j]).slice(0, i).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
            }
            else{
                multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[j - 1][playerPathArray[j - 1].length - 1]) - playerHeight) / Math.abs(((j) * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[j]).slice(0, i).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
            }
            if (Math.abs(multiplier) < 0.3){
                multiplier = performance;
            }
        }

        if (Settings.sheetMusicMode == "scroll"){
            svg.setAttribute("style", "left: " + String(-Math.round(position)) + "px;" + " position: relative;");
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, -position, canvas.height);
        if (((position + canvas.width) / pixPerBeat) / (eval(level.time) * 4) > level.rthm.length){
            ctx.clearRect((level.rthm.length * (eval(level.time) * 4)) * pixPerBeat - position, 0, pixPerBeat * 4, canvas.height);
        }

        ctx.setTransform(1, 0, 0, 1, -position, 0)
        ctx.stroke(path);

        playerHeight += multiplier * pixPerSec * (audio.currentTime - prevTime);
        if (playerHeight > canvas.height){

            var a = Math.floor((Math.max(audio.currentTime - level.offset, 0)  / secsPerBeat) / (eval(level.time) * 4));
            var b = 0;
            while (vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) < ((document.getElementById("audio").currentTime - level.offset) / secsPerBeat) - (a * eval(level.time) * 4)){
                if (vexCodetoRhythmArray(level.rthm[a])[b + 1] == undefined){
                    a++;
                    b = 0;
                }
                else{
                    b++;
                }
            }

            playerHeight = 0;
            if (playerPathArray[a][b - 1] != undefined){
                multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a][b - 1]) - playerHeight) / Math.abs((a * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
            }
            else{
                multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a - 1][playerPathArray[a - 1].length - 1]) - playerHeight) / Math.abs(((a) * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
            }
        }
        if (playerHeight < 0){

            var a = Math.floor((Math.max(audio.currentTime - level.offset, 0)  / secsPerBeat) / (eval(level.time) * 4));
            var b = 0;
            while (vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) < ((document.getElementById("audio").currentTime - level.offset) / secsPerBeat) - (a * eval(level.time) * 4)){
                if (vexCodetoRhythmArray(level.rthm[a])[b + 1] == undefined){
                    a++;
                    b = 0;
                }
                else{
                    b++;
                }
            }

            playerHeight = canvas.height;
            if (playerPathArray[a][b - 1] != undefined){
                multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a][b - 1]) - playerHeight) / Math.abs((a * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
            }
            else{
                multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a - 1][playerPathArray[a - 1].length - 1]) - playerHeight) / Math.abs(((a) * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
            }
        }
        prevTime = audio.currentTime;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(canvas.width / 2 - Dev.playerWidth / 2, canvas.height - playerHeight - Dev.playerWidth / 2, Dev.playerWidth, Dev.playerWidth);

        window.requestAnimationFrame(animate);
        //#sheet music scroll mode
    }

}

function vexCodetoRhythmArray(vexCode = ""){
    //Vexcode notes must use numbers, not letters for duration and declare length for each note
    vexCode = testCode(vexCode).replaceAll("score.notes", "vNotes");
    vexCode = vexCode.replaceAll("tie", "vTie");
    vexCode = vexCode.replaceAll("score.tuplet", "vTuplet");
    vexCode = vexCode.replaceAll(" ", "");
    return eval(vexCode);

    function vNotes(str = ""){
        var strArray = str.split(",")
        var noteArray = [];
        for (i in strArray){
            strArray[i] = strArray[i].slice(strArray[i].indexOf("/") + 1)
            noteArray[i] = (1 / (Number(strArray[i].replaceAll(/\D/g, "")))) * 4;
            for (j = 0, orig = noteArray[i]; j < strArray[i].split(".").length - 1; j++){
                noteArray[i] = noteArray[i] + orig * (2 ** (-1 *(j + 1)));
            }
        }
        return noteArray;
    }

    function vTie(nArray = []){
        var sum = [0];
        for (i = 0; i <= 1; i++){
            sum[0] += nArray[i];
        }
        for (i = 2; i < nArray.length; i++){
            sum[i - 1] = nArray[i];
        }
        return sum;
    }

    function vTuplet(nArray = [], options = {num_notes: 0, notes_occupied: 2}){
        var numNotes = options.num_notes;
        var notesOccupied = options.notes_occupied;
        if (numNotes == 0){
            numNotes = nArray.length
        }
        for (i in nArray){
            nArray[i] = nArray[i] * notesOccupied / numNotes;
        }
        return nArray;
    }
}

function rhythmArraytoVexflow(array = []){
    var vexString = ""
    for (i in array){
        var length = array[i] / 4//Convert /beat to /measure
        var n = [0];
        var vex = [];
        vexString = vexString + "B4/";
        for (j = 0; (length > 0); j++){
            n[j] = 0;
            while ((2 ** n[j]) > length){
                
                n[j] += -1;
            }
            length = length - (2 ** n[j]);
            n[j] = 2 ** n[j];
            if ((n[j - 1] / 2) == (n[j])){
                vex[j] = ".";
            }
            else if (1 == (n[j])){
                vex[j] = "w";
            }
            else if (0.5 == (n[j])){
                vex[j] = "h";
            }
            else if (0.25 == (n[j])){
                vex[j] = "q";
            }
            else{
                vex[j] = 1 / n[j];
            }

            if ((j != 0) && (vex[j] != ".")){
                vexString = vexString + "tie";//#tie code
            }
            else{
                vexString = vexString + String(vex[j]);
            }
        }
        if (array.length > Number(i) + 1){
            
            vexString = vexString + ", ";
        }
    }
    return vexString;
}

function editor(){
    document.getElementById("editor").hidden = false;
    document.addEventListener("click", (event) => inputs(event));

    var rthm = ["[].concat("];//
    var measure = 0;
    var endParen = ")";

    function inputs(event){
        var id = event.srcElement.id;
        if (id == "1"){
            if (document.getElementById("rest").checked){
                rthm[measure] = rthm[measure].concat("score.notes('D5/1/r'), ")
            }
            else{
                rthm[measure] = rthm[measure].concat("score.notes('B4/1'), ")
            }
        }
        if (id == "2"){
            if (document.getElementById("rest").checked){
                rthm[measure] = rthm[measure].concat("score.notes('B4/2/r'), ");
            }
            else{
                rthm[measure] = rthm[measure].concat("score.notes('B4/2'), ");
            }
        }
        if (id == "4"){
            if (document.getElementById("rest").checked){
                rthm[measure] = rthm[measure].concat("score.notes('B4/4/r'), ");
            }
            else{
                rthm[measure] = rthm[measure].concat("score.notes('B4/4'), ");
            }
        }
        if (id == "8"){
            if (document.getElementById("rest").checked){
                rthm[measure] = rthm[measure].concat("score.notes('B4/8/r'), ");
            }
            else{
                rthm[measure] = rthm[measure].concat("score.notes('B4/8'), ");
            }
        }
        if (id == "16"){
            if (document.getElementById("rest").checked){
                rthm[measure] = rthm[measure].concat("score.notes('B4/16/r'), ");
            }
            else{
                rthm[measure] = rthm[measure].concat("score.notes('B4/16'), ");
            }
        }
        if (id == "tie"){
            var tieHere = rthm[measure].lastIndexOf("score.notes");
            if (rthm[measure] == "[].concat("){
                alert("Tieing notes across barlines not currently supported!");
            }
            else{
                rthm[measure] = rthm[measure].slice(0, tieHere) + "tie([].concat(" + rthm[measure].slice(tieHere);
                endParen = endParen + "))"
            }
        }
        if (id == "."){
            var here = rthm[measure].match(/(?<=\d+)\D+$/).index;
            if (vexCodetoRhythmArray(rthm[measure].slice(0, here) + "." + rthm[measure].slice(here) + endParen).reduce((prev, current) => prev + current, 0) <= eval(testCode(level.time)) * 4){
                rthm[measure] = rthm[measure].slice(0, here) + "." + rthm[measure].slice(here);
            }
            else{
                            alert("Dotting this note exceeds the measure's length!");
            }
        }
        if (id == "tuplet"){
            if (document.getElementById("tuplet").checked){
                rthm[measure] = rthm[measure].concat("score.tuplet([].concat(");
                endParen = endParen + "))";
            }
            else {
                var numNotes = document.getElementById("notes").value;
                var notesOccupied = document.getElementById("length").value;
                if (numNotes == ""){
                    numNotes = [...rthm[measure].slice(rthm[measure].lastIndexOf("tuplet(")).matchAll("notes")].length;
                }
                rthm[measure] = rthm[measure].concat("), {num_notes: " + String(numNotes) +", notes_occupied: " + String(notesOccupied) + "})).concat(");
                endParen = endParen.replace("))", "");
            } 
        }
        if (id == "go"){
            console.log(rthm);
        }
        if (!(document.getElementById("tuplet").checked)){
            if (vexCodetoRhythmArray(rthm[measure] + endParen).reduce((prev, current) => prev + current, 0) > eval(testCode(level.time)) * 4){
                var end = rthm[measure].lastIndexOf("score.notes")
                rthm[measure] = rthm[measure].slice(0, end);
                document.getElementById((4 / (eval(testCode(level.time)) * 4 - vexCodetoRhythmArray(rthm[measure] + endParen).reduce((prev, current) => prev + current, 0))).toString()).click();

            }
            if (Number(vexCodetoRhythmArray(rthm[measure] + endParen).reduce((prev, current) => prev + current, 0).toFixed(10)) == eval(testCode(level.time)) * 4){
                rthm[measure] = rthm[measure] + endParen;
                editRender(rthm, measure);
                measure += 1;
                rthm[measure] = "[].concat("
                endParen = ")";
            }
        }
    }
}

function testCode(code){
    if (code == code.matchAll(/score|notes|tuplet|{num_|:|_occupied|}|\[]\.concat|concat|tie|r|\.|\(|\)|"|'|[A-G]|\/|\d| |,/g).reduce((prev, current) => prev + current, 0).slice(1)){
        return code;
    }
    else{
        alert("Level file invalid! Remove \"" + code.replaceAll(/score|notes|tuplet|{num_|:|_occupied|}|\[]\.concat|concat|tie|r|\.|\(|\)|"|'|[A-G]|\/|\d| |,/g, "") + "\" from level file!");
        console.log(code);
        console.log(code.matchAll(/score|notes|tuplet|{num_|:|_occupied|}|\[]\.concat|concat|tie|r|\.|\(|\)|"|'|[A-G]|\/|\d| |,/g).reduce((prev, current) => prev + current, 0).slice(1));
    }
}