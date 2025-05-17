var level = {
        "time": "4/4",
        "bpm": 120,
        "offset": 2.5,
        "title": null,
        "artist": null,
        "location": null,
        "creator": null,
        "difficulty": null,
        "rthm":
        [
            "score.notes('B4/1')",
            "score.notes('B4/1')",
            "score.notes('B4/1')",
            "score.notes('B4/1')",
            
            "[].concat(score.notes('B4/4'), score.notes('B4/8'), score.notes('B4/4'), score.notes('B4/8'), score.notes('B4/8'), score.notes('B4/8'), )",
            "[].concat(score.notes('B4/4'), score.notes('B4/8'), score.notes('B4/4'), score.notes('B4/8'), score.notes('B4/4'), )",
            "[].concat(score.notes('B4/8.'), score.notes('B4/16'), score.notes('B4/8'), score.notes('B4/8'), score.notes('B4/8'), score.notes('B4/8'), score.notes('B4/16'), score.notes('B4/8.'), )",
            "[].concat(score.notes('B4/4'), score.notes('B4/8'), score.notes('B4/4'), score.notes('B4/8'), score.notes('B4/4'), )",
            "score.notes('B4/1')",
            "score.notes('B4/1')",
            "score.notes('B4/8., B4/16, B4/8, B4/16').concat(tie(score.notes('B4/16, B4/16'))).concat(score.notes('B4/16, B4/8, B4/8, B4/8'))",
            "[].concat(score.notes('B4/8.'), score.notes('B4/16'), score.notes('B4/8'), score.notes('B4/8'), score.notes('B4/8'), score.notes('B4/8'), score.notes('B4/16'), score.notes('B4/8.'), )",
            "[].concat(score.notes('B4/8.'), score.notes('B4/16'), score.notes('B4/8'), score.notes('B4/4'), score.notes('B4/8'), score.notes('B4/4'), )",
            "score.notes('B4/8., B4/16, B4/8, B4/16').concat(tie(score.notes('B4/16, B4/16'))).concat(score.notes('B4/16, B4/8, B4/8, B4/8'))",
            "score.notes('B4/8, B4/8, B4/4, B4/2')"
            
        ]
};
var Settings = {
    inputOffset: 0.025,
    threshold: 0.3,
    sheetMusicMode: "scroll",
    correctionMode: "snap"
}
var Dev = {
    playerWidth: 20
}
var secsPerBeat;
var millisPerBeat;
var globalAbort = new AbortController();
var inputBool = true;


function menus(){
    const abort = new AbortController();
    inputBool = false;
    document.addEventListener("click", (event) => {inputs(event);}, {signal: abort.signal});
    use = false;
    ignore = false;
    function inputs(event){
        var name = event.target.name;

        if (name == "settings"){
            document.getElementById("settingsMenu").hidden = false;
        }
        if (name == "play"){

            selector();
            abort.abort();
            event.target.parentElement.hidden = true;
        }
        if (name == "editor"){
            globalAbort.abort();
            globalAbort = new AbortController();
            inputBool = false;
            editor();
            event.target.parentElement.hidden = true;
            document.getElementById("editorMenu").hidden = false;
        }
        if (name == "retry"){
            globalAbort.abort();
            globalAbort = new AbortController();
            abort.abort();
            play();
            event.target.parentElement.hidden = true;
        }
        if (name == "home"){
            abort.abort();
            globalAbort.abort();
            globalAbort = new AbortController();
            event.target.parentElement.hidden = true;
            document.getElementById("player").hidden = true;
            document.getElementById("sheetMusic").hidden = true;
            document.getElementById("editor").hidden = true;
            document.getElementById("mainMenu").hidden = false;
            menus();
        }
        if (name == "inputCal"){
            guide = document.getElementById("calAudio");
            if (use == false){
                use = true;
                count = 0;
                avgOff = 0;
                off = 0;
                event.target.innerHTML = "Click along to the beat in... 5";
                guide.play();
                guide.addEventListener("playing", () => {
                    setTimeout(() => {
                        event.target.innerHTML = "Click along to the beat in... 4";
                    }, 2000);
                    setTimeout(() => {
                        event.target.innerHTML = "Click along to the beat in... 3";
                    }, 2500);
                    setTimeout(() => {
                        event.target.innerHTML = "Click along to the beat in... 2";
                    }, 3000);
                    setTimeout(() => {
                        event.target.innerHTML = "Click along to the beat in... 1";
                    }, 3500);
                    setTimeout(() => {
                        event.target.innerHTML = "Click along to the beat in. Go!";
                    }, 4000);
                }, {signal: globalAbort.signal});
                calSig = new AbortController();
                document.addEventListener("click", calibrate, {signal: calSig.signal});
                document.addEventListener("keydown", calibrate, {signal: calSig.signal});
            }
            function calibrate(board){//#hitting space counts as both clicking and a button, so it doesn't calibrate correctly. Maybe add a check if the hits are too close together, only do the first?
                if (board.key == "Escape"){
                    event.target.innerHTML = "Calibrate";
                    use = false;
                    guide.pause();
                    calSig.abort();
                    guide.currentTime = 0;
                }
                else if (guide.currentTime < 3.8){
                
                }
                else if (count >= 8){
                    document.getElementById("inputOffset").value = avgOff;
                    event.target.innerHTML = "Calibrate";
                    use = false;
                    calSig.abort();
                }
                else{
                    off = guide.currentTime - 4 - 0.5 * count;
                    avgOff = (avgOff * count + off) / (count + 1);
                    count += 1;
                }
            }
        }
        if (name == "offsetCal" && !ignore){
            if (document.getElementById("location").value == ""){
                event.target.innerHTML = "Select an audio file first!";
            }
            else{
                ignore = true;
                level.location = window.URL.createObjectURL(document.getElementById("location").files[0]);
                document.getElementById("audio").src = level.location;
                event.target.innerHTML = "Click when the level should start";
                document.getElementById("audio").play();
                ofcalsig = new AbortController();
                document.addEventListener("click", offCal, {signal: ofcalsig.signal});
                document.addEventListener("keydown", offCal, {signal: ofcalsig.signal});
            }
            function offCal(letter){
                if (letter.key == "Escape"){

                }
                else{
                    document.getElementById("offset").value = document.getElementById("audio").currentTime - Settings.inputOffset;
                }
                event.target.innerHTML = "Calibrate";
                document.getElementById("audio").pause();
                ofcalsig.abort();
                document.getElementById("audio").currentTime = 0;
                ignore = false;
            }
            
        }
        if (name == "close"){
            event.target.parentElement.hidden = true;
            inputBool = true;
            document.getElementById("audio").play();
            abort.abort();
        }
        if (name == "edSettingsClose"){
            event.target.parentElement.hidden = true;
            for (i in level){
                if (String(i) != 'rthm'){
                    level[i] = document.getElementById(String(i)).value;
                }
            }
            if(document.getElementById("levelFile").value == ""){
                level.rthm = ["[].concat("];
            }
            level.location = window.URL.createObjectURL(document.getElementById("location").files[0]);
            document.getElementById("audio").src = level.location;
            abort.abort();
            setTimeout(()=>{inputBool = true;}, 0.1);
        }
        if (name == "settingsClose"){
            event.target.parentElement.hidden = true;
            Settings.threshold = Number(document.getElementById("threshold").value);
            Settings.inputOffset = Number(document.getElementById("inputOffset").value);
        }
        if (name == "save"){
            downloadBlob(new Blob([JSON.stringify(level, null, 4)]), "level.json")
        }
        if (name == "load"){
            event.target.addEventListener("change", ()=>{
                event.target.files[0].text()
                .then((text) =>{
                    level = JSON.parse(text);
                });
            }, {signal: abort.signal});
        }
    }
}

menus();

function play(){
    Settings.correctionMode = document.querySelector('input[name="correction"]:checked').value;
    Settings.sheetMusicMode = document.querySelector('input[name="museMode"]:checked').value;
    document.getElementById("player").hidden = false;
    document.getElementById("sheetMusic").hidden = false;
    var failTimeID;
    var time;
    var audio = document.getElementById("audio");
    audio.setAttribute("src", level.location)
    inputBool = true;
    audio.currentTime = 0;
    var error;
    var i = 0;
    var j = 0;
    var performance = 0;
    document.getElementById("audio").addEventListener("playing", () => {playEvents();}, {signal: globalAbort.signal});
    document.getElementById("audio").addEventListener("seeking", () => {pauseEvents();}, {signal: globalAbort.signal});
    document.getElementById("audio").addEventListener("seeked", () => {if(!audio.paused){playEvents();}}, {signal: globalAbort.signal});
    document.getElementById("audio").addEventListener("waiting", () => {pauseEvents();}, {signal: globalAbort.signal});
    document.getElementById("audio").addEventListener("pause", () => {pauseEvents();}, {signal: globalAbort.signal});
    document.addEventListener("click", () => {if (inputBool){userPerformance()}}, {signal: globalAbort.signal});
    addEventListener("keydown", (e) => {
        if (inputBool){
            if (e.key == "Escape"){
                inputBool == false;
                audio.pause();
                document.getElementById("pauseMenu").hidden = false;
                clearTimeout(failTimeID);
                menus();
            }
            else{
                userPerformance();
            }
        }
    }, {signal: globalAbort.signal});

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
        clearTimeout(failTimeID);
        failTimeID = setTimeout(() => {error = Settings.threshold; fail();}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));
    }

    function fail(){
        clearTimeout(failTimeID);
        audio.pause();
        //console.log("Incorrect! Error " + String(Math.round(100 * error)) + "%");
        document.getElementById("failMenu").hidden = false;
        menus();
        //playEvents();
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
        clearTimeout(failTimeID);
        failTimeID = setTimeout(() => {error = Settings.threshold; fail();}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));
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
    var playerTrailPath = new Path2D();
    playerTrailPath.moveTo(0, canvas.height);

    function animate(){
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(0, 0, 0)";
        var position = pixPerSec * (audio.currentTime - level.offset - Settings.inputOffset) - canvas.width / 2;

        if (Math.sign(performance) != Math.sign(multiplier)){

            if (Settings.correctionMode == "slope"){
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
                if (Math.abs(multiplier) <= (Settings.threshold * pixPerBeat) / (canvas.height - Settings.threshold * pixPerBeat)){
                    multiplier = performance;
                }
                
                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
            }

            if (Settings.correctionMode == "snap"){
                if (Math.abs(error) <= Settings.threshold){
                    if (multiplier != 0){
                        multiplier = performance;
                        if (error < 0){
                            playerTrailPath.lineTo(position - error * pixPerBeat + canvas.width / 2, canvas.height - (playerHeight + performance * error * pixPerBeat));
                        }
                        if (error > 0){
                            playerTrailPath.lineTo(position - error * pixPerBeat + canvas.width / 2, canvas.height - (playerHeight + performance * error * pixPerBeat));
                        }
                        playerHeight = playerHeight + performance * 2 * error * pixPerBeat;
                        
                        
                    }
                    else{
                        multiplier = performance;
                        playerHeight = playerHeight + performance * error * pixPerBeat;
                    }
                }
                else{
                    multiplier = performance;
                }
                
            }
        }

        if (Settings.sheetMusicMode == "scroll"){
            svg.setAttribute("style", "left: " + String(-Math.round(position)) + "px;" + " position: relative;");        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, -position, canvas.height);
        if (((position + canvas.width) / pixPerBeat) / (eval(level.time) * 4) > level.rthm.length){
            ctx.clearRect((level.rthm.length * (eval(level.time) * 4)) * pixPerBeat - position, 0, pixPerBeat * 4, canvas.height);
        }
        var rendered = new Path2D(playerTrailPath);
        if (position + canvas.width / 2 >= 0){rendered.lineTo(position + canvas.width / 2, canvas.height - playerHeight);}
        ctx.setTransform(1, 0, 0, 1, -position, 0);
        ctx.lineWidth = pixPerBeat * Settings.threshold + Dev.playerWidth;
        ctx.strokeStyle = "rgb(255, 255, 255)";
        ctx.stroke(path);
        ctx.strokeStyle = "rgb(255, 0, 0)";
        ctx.lineWidth = Dev.playerWidth / 2;
        ctx.stroke(rendered);

        playerHeight += multiplier * pixPerSec * (audio.currentTime - prevTime);
        if (playerHeight > canvas.height){
            if (Settings.correctionMode == "slope"){
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

                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = 0;
                playerTrailPath.moveTo(position + canvas.width / 2, canvas.height - playerHeight);
                if (playerPathArray[a][b - 1] != undefined){
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a][b - 1]) - playerHeight) / Math.abs((a * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                }
                else{
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a - 1][playerPathArray[a - 1].length - 1]) - playerHeight) / Math.abs(((a) * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                }
            }
            if (Settings.correctionMode == "snap"){
                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = playerHeight - canvas.height;
                playerTrailPath.moveTo(position + canvas.width / 2, canvas.height - playerHeight);
            }
        }
        if (playerHeight < 0){
            if (Settings.correctionMode == "slope"){
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

                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = canvas.height;
                playerTrailPath.moveTo(position + canvas.width / 2, canvas.height - playerHeight);
                if (playerPathArray[a][b - 1] != undefined){
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a][b - 1]) - playerHeight) / Math.abs((a * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                }
                else{
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a - 1][playerPathArray[a - 1].length - 1]) - playerHeight) / Math.abs(((a) * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * vexCodetoRhythmArray(level.rthm[a]).slice(0, b).reduce((prev, current) => prev + current, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                }
            }
            if (Settings.correctionMode == "snap"){
                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = canvas.height + playerHeight;
                playerTrailPath.moveTo(position + canvas.width / 2, canvas.height - playerHeight);
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
    var measure = 0;
    var endParen = ")";

    document.getElementById("editor").hidden = false;
    document.getElementById("sheetMusic").hidden = false;
    document.addEventListener("click", (event) => {if (inputBool && event.target.id != "measure"){inputs(event)};}, {signal: globalAbort.signal});
    document.addEventListener("keydown", (event) => {if (inputBool){inputs(event)};}, {signal: globalAbort.signal});
    document.getElementById("measure").addEventListener("change", (event) => {editRender(level.rthm, Number(event.target.value));}, {signal: globalAbort.signal});
    
//#newly loaded score only shows when updating measure location. Appending scores has some bugs

    function inputs(event){
        var id = event.srcElement.id;

        if (measure != Number(document.getElementById("measure").value)){

            if (measure >= 0 ){
                var remain = eval(testCode(level.time)) * 4 - vexCodetoRhythmArray(level.rthm[measure] + endParen).reduce((prev, current) => prev + current, 0);
                if (Math.floor(remain / 4) > 0){
                    level.rthm[measure] += "score.notes('B4/1/r'),";
                    remain += -4;//#this fills end of measures with rests. Maybe do this on render to avoid errors?
                }
                if (Math.floor(remain / 2) > 0){
                    level.rthm[measure] += "score.notes('B4/2/r'),";
                    remain += -2;
                }
                if (Math.floor(remain / 1) > 0){
                    level.rthm[measure] += "score.notes('B4/4/r'),";
                    remain += -1;
                }
                if (Math.floor(remain / 0.5) > 0){
                    level.rthm[measure] += "score.notes('B4/8/r'),";
                    remain += -0.5;
                }
                if (Math.floor(remain / 0.25) > 0){
                    level.rthm[measure] += "score.notes('B4/16/r'),";
                    remain += -0.25;
                }
                level.rthm[measure] += endParen;
            }
            
            measure = Number(document.getElementById("measure").value);

            if (id != "delete"){
                level.rthm.splice(measure, 0, "[].concat(");
                endParen = ")";
            }
        }

        if (id == "1"){
            if (document.getElementById("rest").checked){
                level.rthm[measure] =level.rthm[measure].concat("score.notes('D5/1/r'), ")
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/1'), ")
            }
        }
        if (id == "2"){
            if (document.getElementById("rest").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/2/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/2'), ");
            }
        }
        if (id == "4"){
            if (document.getElementById("rest").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/4/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/4'), ");
            }
        }
        if (id == "8"){
            if (document.getElementById("rest").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/8/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/8'), ");
            }
        }
        if (id == "16"){
            if (document.getElementById("rest").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/16/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/16'), ");
            }
        }
        if (id == "tie"){
            var tieHere =level.rthm[measure].lastIndexOf("score.notes");
            if (level.rthm[measure] == "[].concat("){
                alert("Tieing notes across barlines not currently supported!");
            }
            else{
               level.rthm[measure] =level.rthm[measure].slice(0, tieHere) + "tie([].concat(" +level.rthm[measure].slice(tieHere);
                endParen = endParen + "))"
            }
        }
        if (id == "."){
            var here =level.rthm[measure].match(/(?<=\d+)\D+$/).index;
            if (vexCodetoRhythmArray(level.rthm[measure].slice(0, here) + "." +level.rthm[measure].slice(here) + endParen).reduce((prev, current) => prev + current, 0) <= eval(testCode(level.time)) * 4){
               level.rthm[measure] =level.rthm[measure].slice(0, here) + "." +level.rthm[measure].slice(here);
            }
            else{
                            alert("Dotting this note exceeds the measure's length!");
            }
        }
        if (id == "tuplet"){
            if (document.getElementById("tuplet").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.tuplet([].concat(");
                endParen = endParen + "))";
            }
            else {
                var numNotes = document.getElementById("notes").value;
                var notesOccupied = document.getElementById("length").value;
                if (numNotes == ""){
                    numNotes = [...rthm[measure].slice(level.rthm[measure].lastIndexOf("tuplet(")).matchAll("notes")].length;
                }
               level.rthm[measure] =level.rthm[measure].concat("), {num_notes: " + String(numNotes) +", notes_occupied: " + String(notesOccupied) + "})).concat(");
                endParen = endParen.replace("))", "");
            } 
        }
        if (id == "go"){
            console.log(level.rthm);
        }
        if (event.key == "Escape"){
            inputBool = false;
            menus();
            document.getElementById("editorMenu").hidden = false;
        }
        if ((!(document.getElementById("tuplet").checked) && id != "delete")){
            if (vexCodetoRhythmArray(level.rthm[measure] + endParen).reduce((prev, current) => prev + current, 0) > eval(testCode(level.time)) * 4){
                var end =level.rthm[measure].lastIndexOf("score.notes")
               level.rthm[measure] =level.rthm[measure].slice(0, end);
                document.getElementById((4 / (eval(testCode(level.time)) * 4 - vexCodetoRhythmArray(level.rthm[measure] + endParen).reduce((prev, current) => prev + current, 0))).toString()).click();//#dotted notes do not auto fill at end of measure

            }
            if (id != "delete"){
                if (Number(vexCodetoRhythmArray(level.rthm[measure] + endParen).reduce((prev, current) => prev + current, 0).toFixed(10)) == eval(testCode(level.time)) * 4){
               level.rthm[measure] = level.rthm[measure] + endParen;
                editRender(level.rthm, measure);
                //measure += 1;
                document.getElementById("measure").value = String(measure + 1);
                //level.rthm.splice(measure, 0, "[].concat(");
                endParen = "";
                }
            }
        }
        if (id == "delete"){
            level.rthm.splice(measure, 1);
            editRender(level.rthm, measure);
            measure = -5; //Set measure to invalid so when the next botton is hit, html element will be different and update
            
        }
    }
}

function selector(){
    
    main = document.getElementById("selector");
    main.hidden = false;
    main.replaceChildren();

    fetch("resources/list.json")//#
            .then((response) => response.json())
            .then((items) => {
                for (i in items){
                    l = main.appendChild(document.createElement("button"));
                    l.innerHTML = String(i)
                    l.setAttribute("id", String(items[String(i)]));
                    l.setAttribute("class", "menuButton")
                }
            });
    document.addEventListener("click", (event) => {

        if (event.target.tagName == "BUTTON"){
            fetch(event.target.id)//#
            .then((response) => response.json())
            .then((info) => {
                level = info;
                secsPerBeat = (1 / level.bpm) * 60;
                millisPerBeat = secsPerBeat * 1000;
                pixPerBeat = document.getElementById("game").height / (eval(level.time) * 4);
                pixPerSec = pixPerBeat / secsPerBeat;
                main.hidden = true;
                globalAbort.abort();
                globalAbort = new AbortController();
                play();
            });
        }

    }, {signal: globalAbort.signal});
    document.addEventListener("keydown", (key) => {if (key.key = "Escape"){
        main.hidden = true;
        main.replaceChildren();
        globalAbort.abort();
        globalAbort = new AbortController();
        document.getElementById("mainMenu").hidden = false;
        menus();
    }}, {signal: globalAbort.signal})

    
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


async function downloadBlob(inputblob, name) {
    const downloadelem = document.createElement("a");
    const url = URL.createObjectURL(inputblob);
    document.body.appendChild(downloadelem);
    downloadelem.href = url;
    downloadelem.download = name;
    downloadelem.click();
    downloadelem.remove();
    window.URL.revokeObjectURL(url);
  }
