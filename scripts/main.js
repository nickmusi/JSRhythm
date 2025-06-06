var level = {//wurtz 162.16 immediate
        "time": "4/4",//134.83 3 measures before
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
var colorSet = {
    walls: '#000000',
    path: '#ffffff',
    trail: '#45fc48',
    player:'#000000',
    rest: '#60ddf3'
}
var secsPerBeat;
var millisPerBeat;
var globalAbort = new AbortController();
var inputBool = true;

var raNote = {
    duration: 0,
    measure: 0,
    rest: false,
    colors: {
            walls: 'rgb(90, 59, 245)',
            path: 'rgb(175, 175, 175)',
            trail: 'rgb(78, 201, 90)',
            player:'rgb(178, 243, 15)',
            rest: 'rgb(255, 255, 255)'
        },
    x: 0,
    y: 0
}

var colorNext = true;

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
            document.getElementById("failMenu").hidden = true;
            //#do same for win menu
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
        if (name == "offsetCal" && !ignore){//#need to add tap tempo feature
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
            level.bpm = Number(level.bpm);
            level.offset = Number(level.offset);
            if(document.getElementById("levelFile").value == ""){
                level.rthm = ["[].concat("];
            }
            if (document.getElementById("location").value != ""){
                level.location = window.URL.createObjectURL(document.getElementById("location").files[0]);
                document.getElementById("audio").src = level.location;
            }
            abort.abort();
            setTimeout(()=>{inputBool = true;}, 0.1);
        }
        if (name == "settingsClose"){
            event.target.parentElement.hidden = true;
            Settings.threshold = Number(document.getElementById("threshold").value);
            Settings.inputOffset = Number(document.getElementById("inputOffset").value);
        }
        if (name == "save"){
            for (i in level){
                if (String(i) != 'rthm'){
                    level[i] = document.getElementById(String(i)).value;
                }
            }
            level.bpm = Number(level.bpm);
            level.offset = Number(level.offset);
            downloadBlob(new Blob([JSON.stringify(level, null, 4)]), "level.json")
        }
        if (name == "load"){
            colorNext = false;
            event.target.addEventListener("change", ()=>{
                event.target.files[0].text()
                .then((text) =>{
                    level = JSON.parse(text);
                    for (i in level){
                        if (String(i) != 'rthm'){
                            document.getElementById(String(i)).value = level[i];
                        }
                    }
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
    //var j = 0;
    var performance = 0;

    var rhythmArray = vexCodetoRhythmArray(level.rthm);

    colorSet = rhythmArray[0].colors;

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

        if (rhythmArray[i].colors != undefined){
            colorSet = rhythmArray[i].colors;//#add time signature change, tempo change code here; add option to not have flashes and option to set personal colors (for vision/making only the sheet music visible)
        }

        if(Settings.sheetMusicMode == "line"){render(level.rthm, j);};

        error = (audio.currentTime - Settings.inputOffset - level.offset) / secsPerBeat - (rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0));
        
        if (Math.abs(error) > Settings.threshold){
            fail();
        }
        else if (rhythmArray[i + 1] != undefined){
            i++;
        }
        else{
            console.log("win");
            win();
        }

        clearTimeout(failTimeID);
        if (rhythmArray[i] != undefined){
            if (rhythmArray[i].rest){
                setTimeout(() => {userPerformance();}, 1000 * (secsPerBeat * rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)));   

                r = i;
                while (rhythmArray[r] != undefined && rhythmArray[r].rest){
                    r++;
                }
                time = 1000 * (secsPerBeat * rhythmArray.slice(0, r).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + millisPerBeat * Settings.threshold;
            }
            else{
                time = 1000 * (secsPerBeat * rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + millisPerBeat * Settings.threshold;
            }
            failTimeID = setTimeout(() => {error = Settings.threshold; fail();}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));
        }
    }

    function win(){
        //#win state
        clearTimeout(failTimeID);
    }

    function fail(){
        clearTimeout(failTimeID);
        audio.pause();
        document.getElementById("error").innerHTML = error;
        //console.log("Incorrect! Error " + String(Math.round(100 * error)) + "%");
        document.getElementById("failMenu").hidden = false;
        menus();
        //playEvents();
    }

    function calculatePosition(){
        var it = 0;
        while (rhythmArray.slice(0, it).reduce((prev, current,) => prev + current.duration, 0) < ((document.getElementById("audio").currentTime - level.offset) / secsPerBeat)){
            it++;
        }
        q = it;
        while (rhythmArray[q].colors == undefined){
            q -= 1;
        }
        colorSet = rhythmArray[q].colors;
        return it;

    }
    
    function playEvents(){
        
        if (rhythmArray[0].rest && i == 0){
        setTimeout(() => {userPerformance();}, 1000 * (level.offset + Settings.inputOffset));
        }

        time = 1000 * (secsPerBeat * rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + millisPerBeat * Settings.threshold;

        failTimeID = setTimeout(() => {error = Settings.threshold; fail();}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));      

        time = 1000 * (secsPerBeat * rhythmArray.slice(0, i + 1).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + Settings.threshold * millisPerBeat;
        clearTimeout(failTimeID);
        failTimeID = setTimeout(() => {error = Settings.threshold; fail();}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));
        if(Settings.sheetMusicMode == "line"){render(level.rthm, rhythmArray[i].measure);}
    }
    function pauseEvents(){
        clearTimeout(failTimeID);
    }

    var path = new Path2D;
    var restA = new Path2D;
    const canvas = document.getElementById("game");
    var svg;
    var multiplier = 0;
    var playerPathArray = [];
    initAnimation();

    function initAnimation(){
        var x = 0;
        var y = -canvas.height;
        path.moveTo(x, Math.abs(y));
        //var k = 0;
        var l = 0;
        while (l < rhythmArray.length){
            if (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration > canvas.height){
                var x1 = (-(y - canvas.height) / (1)) + x;
                var y1 = canvas.height;
                path.lineTo(x1 + 30, y1 + 30);
                path.moveTo(x1 - 30, 0 - 30);
                x += pixPerBeat * rhythmArray[l].duration;
                y = ((Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration) - canvas.height);

            }
            else if (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration < 0){
                var x2 = (-(y - 0) / (1)) + x;
                var y2 = 0
                path.lineTo(x2 + 30, y2 - 30);
                path.moveTo(x2 - 30, canvas.height + 30);
                x += pixPerBeat * rhythmArray[l].duration;
                y = -1 * ((Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration) + canvas.height);
            }
            else if (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration == 0){
                x += pixPerBeat * rhythmArray[l].duration;
                y = -0.000000000000001;
            }
            else{
                x += pixPerBeat * rhythmArray[l].duration;
                y = Math.sign(y) * (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration);
            }
            //playerPathArray[l] = -Math.sign(y) * (document.getElementById("game").height - Math.abs(y) + 0.000000001);
            //rhythmArray[l].y = -Math.sign(y) * (document.getElementById("game").height - Math.abs(y) + 0.000000001);

            if (l >= rhythmArray.length - 1){//this makes line go all the way to ending space
                if (Math.sign(y) > 0){
                    path.lineTo(x + 30, y + 30);
                }
                else{
                    path.lineTo(x + 30, -y - 30); 
                }
            }
            else{
                path.lineTo(x, Math.abs(y));
                rhythmArray[l].y = Math.abs(y);
                rhythmArray[l].x = x;
            }
            l++;
            if (rhythmArray[l] != undefined){
                y *= -1;
                if (rhythmArray[l].rest){
                    restA.moveTo(x - 6, Math.abs(y));
                    restA.lineTo(x + 6, Math.abs(y));
                }
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
        ctx.fillStyle = colorSet.walls;
        var position = pixPerSec * (audio.currentTime - level.offset - Settings.inputOffset) - canvas.width / 2;
        playerHeight += multiplier * pixPerSec * (audio.currentTime - prevTime);

        if (Math.sign(performance) != Math.sign(multiplier)){

            if (Settings.correctionMode == "slope"){
                if (playerHeight - Settings.threshold * pixPerBeat <= 0 && performance == -1){
                    multiplier = performance;
                }
                else if (playerHeight + Settings.threshold * pixPerBeat >= canvas.height && performance == 1){
                    multiplier = performance;
                }
                else if (playerPathArray[j][i - 1] != undefined){
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[j][i - 1]) - playerHeight) / Math.abs((j * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * rhythmArray.slice(0, i).reduce((prev, current) => prev + current.duration, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                }
                else{
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[j - 1][playerPathArray[j - 1].length - 1]) - playerHeight) / Math.abs(((j) * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * rhythmArray.slice(0, i).reduce((prev, current) => prev + current.duration, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
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
                
                        //if (Math.abs(canvas.height - playerHeight - rhythmArray[i - 2].y) > pixPerBeat * Settings.threshold){
                            
                        //}
                        //else{
                            playerTrailPath.lineTo(rhythmArray[i-2].x, rhythmArray[i - 2].y);
                        //}
                        
                        playerHeight = playerHeight + performance * 2 * ((position + canvas.width / 2) - rhythmArray[i - 2].x);//#not done with fix                        
                    }
                    else{
                        multiplier = performance;
                        playerHeight = playerHeight + performance * error * pixPerBeat;//must be this because cannot acces i-2 on first pass
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
        ctx.strokeStyle = colorSet.path;
        ctx.stroke(path);//#need to add rest animation, probably need to add a separate path
        ctx.strokeStyle = colorSet.rest;
        ctx.lineWidth = Math.sqrt((Math.pow(pixPerBeat * Settings.threshold + Dev.playerWidth, 2)) + (Math.pow(pixPerBeat * Settings.threshold + Dev.playerWidth, 2)));
        ctx.stroke(restA);
        ctx.strokeStyle = colorSet.trail;
        ctx.lineWidth = Dev.playerWidth / 2;
        ctx.stroke(rendered);

        
        if (playerHeight > canvas.height){
            if (Settings.correctionMode == "slope"){//#slope mode not working, player patharray needs replaced
                var b = 0;
                b = calculatePosition();

                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = 0;
                playerTrailPath.moveTo(position + canvas.width / 2, canvas.height - playerHeight);
                if (playerPathArray[a][b - 1] != undefined){
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a][b - 1]) - playerHeight) / Math.abs((a * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * rhythmArray.slice(0, b).reduce((prev, current) => prev + current.duration, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                }
                else{
                    multiplier = Math.sign(performance) * Math.abs(Math.abs(playerPathArray[a - 1][playerPathArray[a - 1].length - 1]) - playerHeight) / Math.abs(((a) * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * rhythmArray.slice(0, b).reduce((prev, current) => prev + current.duration, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                }
            }
            if ((Settings.correctionMode == "snap") && ((Math.abs(canvas.height - playerHeight - rhythmArray[i - 1].y) > 2 * Settings.threshold * pixPerBeat) || rhythmArray[i - 2].x - (position + canvas.width / 2) > 2 * pixPerBeat * (Settings.threshold))){
                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = playerHeight - canvas.height;
                playerTrailPath.moveTo(position + canvas.width / 2 - 30, canvas.height - playerHeight + 30);
            }
        }
        if (playerHeight < 0){
            if (Settings.correctionMode == "slope"){
                var b = 0;
                b = calculatePosition();

                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = canvas.height;
                playerTrailPath.moveTo(position + canvas.width / 2, canvas.height - playerHeight);
                
                multiplier = Math.sign(performance) * Math.abs(Math.abs(rhythmArray[b - 1]).height - playerHeight) / Math.abs((rhythmArray[b-1].measure * (eval(level.time) * 4) * pixPerBeat) + pixPerBeat * rhythmArray.slice(0, b).reduce((prev, current) => prev + current.duration, 0) - (position + pixPerSec * (level.offset + Settings.inputOffset)));
                
            }
            if ((Settings.correctionMode == "snap") && ((Math.abs(canvas.height - playerHeight - rhythmArray[i - 1].y) > 2 * Settings.threshold * pixPerBeat) || rhythmArray[i - 2].x - (position + canvas.width / 2) > 2 * pixPerBeat * (Settings.threshold))){
                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = canvas.height + playerHeight;
                playerTrailPath.moveTo(position + canvas.width / 2 - 30, canvas.height - playerHeight - 30);
            }
        }
        prevTime = audio.currentTime;
        ctx.fillStyle = colorSet.player;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(canvas.width / 2 - Dev.playerWidth / 2, canvas.height - playerHeight - Dev.playerWidth / 2, Dev.playerWidth, Dev.playerWidth);

        window.requestAnimationFrame(animate);
        //#sheet music scroll mode
    }
}

function vexCodetoRhythmArray(vexCodeArray = []){//#make beaming automatic on tuplets (not here)
    all = "[]";
    //Vexcode notes must use numbers, not letters for duration and declare length for each note
    for (i in vexCodeArray){
        vexCode = testCode(vexCodeArray[i]).replaceAll("score.notes", "vNotes");
        vexCode = vexCode.replaceAll("tie", "vTie");
        vexCode = vexCode.replaceAll("score.tuplet", "vTuplet");
        vexCode = vexCode.replaceAll("score.beam", "");
        vexCode = vexCode.replaceAll(" ", "");
        all = all + ".concat(measure([]" +vexCode.slice(2) + ", " + String(i) + "))";//vexcode must start with [](it slices this)
    }
    return eval(all);

    function vNotes(str = "", style){
        var strArray = str.split(",")
        var noteArray = [];
        for (i in strArray){
            strArray[i] = strArray[i].slice(strArray[i].indexOf("/") + 1)
            noteArray[i] = Object.create(raNote);
            noteArray[i].duration = (1 / (Number(strArray[i].replaceAll(/\D/g, "")))) * 4;
            if (strArray[i].includes("r")){
                noteArray[i].rest = true;
            }
            for (j = 0, orig = noteArray[i].duration; j < strArray[i].split(".").length - 1; j++){
                noteArray[i].duration = noteArray[i].duration + orig * (2 ** (-1 *(j + 1)));
            }
            noteArray[i].colors = style;
        }
        return noteArray;
    }

    function vTie(nArray = 0){
        var sum = [nArray[0]];
        sum[0].duration += nArray[1].duration;

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
            nArray[i].duration = nArray[i].duration * notesOccupied / numNotes;
        }
        return nArray;
    }

    function measure(nArray = [], number){
        for (i in nArray){
            nArray[i].measure = number;
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

function editor(){//#need to add beam support
    var measure = -2;
    var endParen = ")";//#editor needs to load colors from level file on editor load and changing measures
    colorNext = true;//#going back and adding something in the middle of level file then adds concat( to the next measure, which breaks things (it is an empty measure with just concat(  )

    document.getElementById("editor").hidden = false;
    document.getElementById("sheetMusic").hidden = false;
    document.addEventListener("click", (event) => {if (inputBool && event.target.id != "measure"){inputs(event)};}, {signal: globalAbort.signal});
    document.addEventListener("keydown", (event) => {if (inputBool && event.key == "Escape"){inputs(event)};}, {signal: globalAbort.signal});
    document.getElementById("measure").addEventListener("change", (event) => {editRender(level.rthm, Number(event.target.value));}, {signal: globalAbort.signal});
    document.getElementsByName("colors").forEach((element) => {
        element.value = colorSet[element.id];
        element.addEventListener("change", (event) => {
            colorSet[event.target.id] = event.target.value;
            colorNext = true;
            drawEdCanv();
        }, {signal: globalAbort.signal});
    });
    
    drawEdCanv();
    
    function drawEdCanv() {
        edCanv = document.getElementById("placeColor");
        edCtx = edCanv.getContext("2d");
        edCtx.fillStyle = colorSet.walls;
        edCtx.fillRect(0, 0, edCanv.width, edCanv.height);
        edCtx.strokeStyle = colorSet.path;
        edPath = new Path2D();
        edPath.moveTo(0, edCanv.height / 2);
        edPath.lineTo(edCanv.width, edCanv.height / 2);
        edCtx.lineWidth = edCanv.height / 3;
        edCtx.stroke(edPath);
        edPath = new Path2D();
        edPath.moveTo(0, edCanv.height / 2);
        edPath.lineTo(edCanv.width / 2, edCanv.height / 2);
        edCtx.strokeStyle = colorSet.trail;
        edCtx.lineWidth = Dev.playerWidth / 2;
        edCtx.stroke(edPath);
        edPath = new Path2D();
        edPath.moveTo(edCanv.width * 2 / 3 - 6, edCanv.height / 2);
        edPath.lineTo(edCanv.width * 2 / 3 + 6, edCanv.height / 2);
        edCtx.strokeStyle = colorSet.rest;
        edCtx.lineWidth = edCanv.height / 3;
        edCtx.stroke(edPath);
        edCtx.fillStyle = colorSet.player;
        edCtx.setTransform(1, 0, 0, 1, 0, 0);
        edCtx.fillRect(edCanv.width / 2 - Dev.playerWidth / 2, edCanv.height / 2 - Dev.playerWidth / 2, Dev.playerWidth, Dev.playerWidth);
    };

    
//#newly loaded score only shows when updating measure location. Appending scores has some bugs

    function inputs(event){
        var id = event.srcElement.id;
        if (measure != Number(document.getElementById("measure").value)){

            if (measure >= 0 ){
                var remain = eval(testCode(level.time)) * 4 - vexCodetoRhythmArray([level.rthm[measure] + endParen]).reduce((prev, current) => prev + current.duration, 0);
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
            if (document.getElementById("rest0").checked){
                level.rthm[measure] =level.rthm[measure].concat("score.notes('D5/1/r'), ")
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/1'), ")
            }
        }
        if (id == "2"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/2/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/2'), ");
            }
        }
        if (id == "4"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/4/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/4'), ");
            }
        }
        if (id == "8"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/8/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/8'), ");
            }
        }
        if (id == "16"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/16/r'), ");
            }
            else{
               level.rthm[measure] =level.rthm[measure].concat("score.notes('B4/16'), ");
            }
        }
        if (colorNext && (String(id.match(/\d+/g)) == id)){
            level.rthm[measure] = level.rthm[measure].slice(0, level.rthm[measure].lastIndexOf("'") + 1) +", " + JSON.stringify(colorSet).replaceAll("\"", "'").replaceAll(RegExp(/'(?!#|,|})/g), "") + level.rthm[measure].slice(level.rthm[measure].lastIndexOf("'") + 1)
            colorNext = false;
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
        if (id == "."){//#dotted rests mess up, the dot needs to be placed after /r
            var here =level.rthm[measure].search(/(?<=\/r)\'.*$|(?<=\/\d)\'.*$|(?<=\/\d\d)\'.*$|(?<=\.)\'.*$|(?<=\/\d\d\d)\'.*$/g);
            if (vexCodetoRhythmArray([level.rthm[measure].slice(0, here) + "." +level.rthm[measure].slice(here) + endParen]).reduce((prev, current) => prev + current.duration, 0) <= eval(testCode(level.time)) * 4){
               level.rthm[measure] =level.rthm[measure].slice(0, here) + "." +level.rthm[measure].slice(here);
            }
            else{
                            alert("Dotting this note exceeds the measure's length!");
            }
        }
        if (id == "tuplet"){
            if (document.getElementById("tuplet").checked){
               level.rthm[measure] =level.rthm[measure].concat("score.beam(score.tuplet([].concat(");
                endParen = endParen + ")))";
            }
            else {
                var numNotes = document.getElementById("notes").value;
                var notesOccupied = document.getElementById("length").value;
                if (numNotes == ""){
                    numNotes = level.rthm[measure].slice(level.rthm[measure].lastIndexOf("tuplet(")).matchAll("notes").toArray().length;
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
        if ((!(document.getElementById("tuplet").checked) && id != "delete")){//#right now a triplet ending the measure messes up the auto next measure
            if (vexCodetoRhythmArray([level.rthm[measure] + endParen]).reduce((prev, current) => prev + current, 0) > eval(testCode(level.time)) * 4){
                var end =level.rthm[measure].lastIndexOf("score.notes")
               level.rthm[measure] =level.rthm[measure].slice(0, end);
                document.getElementById((4 / (eval(testCode(level.time)) * 4 - vexCodetoRhythmArray([level.rthm[measure] + endParen]).reduce((prev, current) => prev + current.duration, 0))).toString()).click();//#dotted notes do not auto fill at end of measure

            }
            if (id != "delete"){
                if (Number(vexCodetoRhythmArray([level.rthm[measure] + endParen]).reduce((prev, current) => prev + current.duration, 0).toFixed(10)) == eval(testCode(level.time)) * 4){
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
            .then((items) => {//#need to add custom level option (to select and play custom level) Maybe eventually have a test level button in editor too
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
    if (code == code.matchAll(/score|notes|beam|{walls|path|#|trail|player|rest|tuplet|{num_|:|_occupied|}|\[]\.concat|concat|tie|r|\.|\(|\)|"|'|[A-G]|[a-g]|\/|\d| |,/g).reduce((prev, current) => prev + current.toString(), 0).slice(1)){
        return code;
    }
    else{
        alert("Level file invalid! Remove \"" + code.replaceAll(/score|notes|beam|{walls|path|#|trail|player|rest|tuplet|{num_|:|_occupied|}|\[]\.concat|concat|tie|r|\.|\(|\)|"|'|[A-G]|[a-g]|\/|\d| |,/g, "") + "\" from level file!");
        console.log(code);
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
