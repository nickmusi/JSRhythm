var level = {
        "time": "4/4",
        "bpm": 120,
        "offset": 0,
        "title": "Title",
        "artist": "Artist",
        "location": "",
        "creator": "Creator",
        "difficulty": "Difficulty",
        "rthm": []
};
const origSettings = {
    inputOffset: 0.025,
    threshold: 0.3,
    sheetMusicMode: "scroll",
    noFlash: false,
    animations: "normal",
    firstVisit: true
}

if (JSON.parse(window.localStorage.getItem("settings")) != null){
    var Settings = JSON.parse(window.localStorage.getItem("settings"));
}
else{
    var Settings = origSettings;
}


for (i in origSettings){
    if (Settings[String(i)] == undefined){
        Settings[String(i)] = origSettings[String(i)];
    }
}

var records = {

}

if (JSON.parse(window.localStorage.getItem("records")) != null){
    records = JSON.parse(window.localStorage.getItem("records"));
}

var Dev = {
    playerWidth: 0.2,//These are in beats so it scales with the rest of level
    restWidth: 0.125,
    greenError: 0.1,
    orangeError: 0.2,//All above this will be red
    numCountDown: 4,
    appearWidth: 250//width of appearing measures
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

var loopAni = false;
var practice = false;

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
    loopAni = false;
    const abort = new AbortController();
    var cancel;
    inputBool = false;
    if (Settings.firstVisit){
        cancel = setInterval(()=>{
            document.getElementById("calInstructions").hidden = false;
            setTimeout(() => {document.getElementById("calInstructions").hidden = true;}, 800)
        }, 1300)
    }
    document.addEventListener("click", (event) => {inputs(event);}, {signal: abort.signal});
    use = false;
    ignore = false;
    function inputs(event){
        var name = event.target.name;
        if(name != undefined){
            clearInterval(cancel);
        }
        if (name == "settings"){
            document.getElementById("settingsMenu").hidden = false;
            document.getElementById("threshold").value = String(Settings.threshold);
            document.getElementById("inputOffset").value = String(Settings.inputOffset);
            document.getElementById("noFlash").checked = Settings.noFlash;
            document.getElementById(String(Settings.sheetMusicMode)).checked = true;
            document.getElementById(String(Settings.animations)).checked = true;
        }
        if (name == "play"){
            practice = false;
            selector();
            abort.abort();
            event.target.parentElement.hidden = true;
        }
        if (name == "practice"){
            practice = true;
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
        if (name == "respawn"){
            abort.abort();
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
            //#do same for win menu
            menus();
        }
        if (name == "next"){
            abort.abort();
            globalAbort.abort();
            globalAbort = new AbortController();
            event.target.parentElement.hidden = true;

            
            for (z in document.getElementById("selector").children){
                if (document.getElementById("selector").children[z].children[0].innerHTML == level.title){
                    loadLevel(String(document.getElementById("selector").children[z].nextElementSibling.children[0].id))
                }
            }
        };
            
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
            if (document.getElementById("location").value != ""){
                level.location = window.URL.createObjectURL(document.getElementById("location").files[0]);
                document.getElementById("audio").src = level.location;
            }
            editRender(level.rthm, document.getElementById("measure").value);
            abort.abort();
            setTimeout(()=>{inputBool = true;}, 0.1);
        }
        if (name == "clearAll"){
            level.rthm = [];
            document.getElementById("measure").value = -100;
        }
        if (name == "settingsClose"){
            event.target.parentElement.hidden = true;
            Settings.threshold = Number(document.getElementById("threshold").value);
            Settings.inputOffset = Number(document.getElementById("inputOffset").value);
            Settings.sheetMusicMode = document.querySelector('input[name="museMode"]:checked').value;
            Settings.noFlash = document.getElementById("noFlash").checked;
            Settings.animations = document.querySelector('input[name="animations"]:checked').value;
            window.localStorage.setItem("settings", JSON.stringify(Settings));
        }
        if (name == "save"){
            for (i in level.rthm){
                if (level.rthm[i].notes == "[].concat("){
                    level.rthm.splice(i, 1);
                }
            }
            for (i in level){
                if (String(i) != 'rthm'){
                    level[i] = document.getElementById(String(i)).value;
                }
            }
            level.bpm = Number(level.bpm);
            level.offset = Number(level.offset);
            downloadBlob(new Blob([JSON.stringify(level, null, 4)]), "level.json")
        }
        if (name == "testLevel"){
            for (i in level.rthm){
                if (level.rthm[i].notes == "[].concat("){
                    level.rthm.splice(i, 1);
                }
            }
            for (i in level){
                if (String(i) != 'rthm'){
                    level[i] = document.getElementById(String(i)).value;
                }
            }
            level.bpm = Number(level.bpm);
            level.offset = Number(level.offset);
            level.location = window.URL.createObjectURL(document.getElementById("location").files[0])
            event.target.parentElement.hidden = true;
            document.getElementById("editor").hidden = true;
            play();
        }
        if (name == "load"){
            colorNext = false;
            document.getElementById("measure").value = "0";
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
    loopAni = true;
    calcCanvSize();
    document.getElementById("player").hidden = false;
    document.getElementById("sheetMusic").hidden = false;
    var failTimeID;
    var time;
    var audio = document.getElementById("audio");
    audio.setAttribute("src", level.location)
    inputBool = true;
    audio.currentTime = 0;
    var error;
    var avgAccuracy = 0;
    var i = 0;
    //var j = 0;
    var performance = 0;

    var rhythmArray = vexCodetoRhythmArray(level.rthm);
    colorSet = {...rhythmArray[0].colors};
    if (Settings.animations == "noWalls"){
        colorSet.walls = colorSet.path;
        colorSet.rest = colorSet.path;
    }
    if (Settings.animations == "none"){
        for (t in colorSet){
            colorSet[t] = '#FFFFFF';
        }
    }
    


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
                document.getElementById("pauseMenu").children.namedItem("retry").focus();
                if (records[String(level.title)] == undefined || audio.currentTime / audio.duration * 100 > records[level.title].progress){
                    records[String(level.title)] = {progress: audio.currentTime / audio.duration * 100};
                    window.localStorage.setItem("records", JSON.stringify(records));
                }
                clearTimeout(failTimeID);
                menus();
            }
            else{
                userPerformance();
            }
        }
    }, {signal: globalAbort.signal});

    document.getElementById("countdown").style = "position: absolute; margin-left: 25vw; font-size: xx-large;";
    if (Settings.sheetMusicMode == "scroll"){

    }
    if (Settings.sheetMusicMode == "line"){
        render(level.rthm, rhythmArray[i].measure, Math.floor(window.innerWidth / Dev.appearWidth));
    }
    for (countVar = Dev.numCountDown; level.offset + Settings.inputOffset < countVar * secsPerBeat; countVar -= 1){
        setTimeout((val) => {document.getElementById("countdown").innerHTML = String(val); document.getElementById("countdown").hidden = false;}, ((Dev.numCountDown - countVar) * secsPerBeat + Settings.inputOffset) * 1000, countVar);//endingcountVarfreezes the value of it right theree and assigns it to val
    }
    if(level.offset < Dev.numCountDown * secsPerBeat){
        setTimeout(() => {audio.play();}, (Dev.numCountDown * secsPerBeat - level.offset) * 1000);
    }
    else{
        audio.play();
    }
    var undoLast;

    if (Settings.firstVisit){
        document.getElementById("gameInstructions").style = "position: absolute; margin-top: " + String(Math.round(document.getElementById("game").height / 2)) + "px; margin-left: 25vw"
        document.getElementById("gameInstructions").hidden = false;
    }

    function userPerformance(){
        if (Settings.firstVisit){
            document.getElementById("gameInstructions").hidden = true;
            document.getElementById("calInstructions").hidden = true;
            Settings.firstVisit = false;
            window.localStorage.setItem("settings", JSON.stringify(Settings));
        }
        if (performance == 0){
            performance = 1;
        }
        else {
            performance *= -1;
        }
        if (rhythmArray[i].colors != undefined && !Settings.noFlash && Settings.animations != "none"){
            colorSet = {...rhythmArray[i].colors};//#add time signature change, tempo change code here; add option to not have flashes and option to set personal colors (for vision/making only the sheet music visible)
            if (Settings.animations == "noWalls"){
                colorSet.walls = colorSet.path;
                colorSet.rest = colorSet.path;
            }
        }

        if(Settings.sheetMusicMode == "line"){
            render(level.rthm, rhythmArray[i].measure, Math.floor(canvas.width / Dev.appearWidth));
        };

        if (rhythmArray[i].rest){
            error = 0;
        }
        else{
            error = (audio.currentTime - Settings.inputOffset - level.offset) / secsPerBeat - (rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0));
            clearTimeout(undoLast);
            document.getElementById("showError").innerHTML = Math.round(error * 100) / 100;
            document.getElementById("showError").style = "font-size: larger; width: 20vw; left: 50%; right: 50%; position: absolute; top: " + String(Number(document.getElementById("sheetMusic").children[0].getAttribute("height")) - 36) + "px";
            if (Math.abs(error) < Dev.greenError){
                document.getElementById("showError").style.color = "rgb(0, 156, 34)";
            }
            else if (Math.abs(error) < Dev.orangeError){
                document.getElementById("showError").style.color = "rgb(255, 141, 11)";
            }
            else{
                document.getElementById("showError").color = "rgb(233, 30, 30)";
            }
            if (error > 0){
                document.getElementById("showError").style.left = "51%";
                document.getElementById("showError").style.right = "49%";
            }
            else if (error < 0){
                document.getElementById("showError").style.right = "52%";
                document.getElementById("showError").style.left = "48%";
            }
            else{
                document.getElementById("showError").style.left = "50%";
                document.getElementById("showError").style.right = "50%";
            }
            document.getElementById("showError").hidden = false;
            undoLast = setTimeout(() => {document.getElementById("showError").hidden = true;}, secsPerBeat * 1000)
            avgAccuracy = ((i * avgAccuracy / 100 + (1 - Math.abs(error))) / (i + 1)) * 100;
        }
        
        
        if (Math.abs(error) > Settings.threshold){
            if (!practice){fail();}
            else{pracFail();}
        }
        else{
            i++;
        }

        clearTimeout(failTimeID);

        if (rhythmArray[i] != undefined){
            if (rhythmArray[i].rest){
                setTimeout(() => {userPerformance();}, 1000 * (secsPerBeat * rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset - Settings.inputOffset)));   

                r = i;
                while (rhythmArray[r] != undefined && rhythmArray[r].rest){
                    r++;
                }
                time = 1000 * (secsPerBeat * rhythmArray.slice(0, r).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + millisPerBeat * Settings.threshold;
            }
            else{
                time = 1000 * (secsPerBeat * rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + millisPerBeat * Settings.threshold;
            }
            failTimeID = setTimeout(() => {error = Settings.threshold; if (!practice){fail();}
            else{pracFail();}}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));
        }
        else{
            win();
        }
    }

    function win(){
        clearTimeout(failTimeID);
        document.getElementById("avgAccuracy").innerHTML = "Average Accuracy: " + String(Math.round(avgAccuracy)) + "%";
        if (!practice){
            if (records[level.title] == undefined){
                records[level.title] = {progress: "Done", accuracy: avgAccuracy};
            }
            else if (records[level.title].accuracy != undefined){
                records[level.title] = {progress: "Done", accuracy: Math.max(avgAccuracy, records[level.title].accuracy)};
            }
            else{
                records[level.title] = {progress: "Done", accuracy: avgAccuracy};
            }
    }
        window.localStorage.setItem("records", JSON.stringify(records));
        
        setTimeout(() => {
            for (z in document.getElementById("selector").children){
                if (document.getElementById("selector").children[z].children != undefined){
                    if (document.getElementById("selector").children[z].children[0].innerHTML == level.title){
                        if (document.getElementById("selector").children[z].nextElementSibling == null){
                            document.getElementById("next").hidden = true;
                        }
                        else{
                            document.getElementById("next").hidden = false;
                        }
                    }
                }
            }
            document.getElementById("winMenu").hidden = false;//#zz
            audio.pause();
            menus();
        }, eval(testCode(level.time)) * 4 * secsPerBeat * 1000);
        
    }

    function fail(){
        clearTimeout(failTimeID);
        audio.pause();
        if (records[String(level.title)] == undefined || audio.currentTime / audio.duration * 100 > records[level.title].progress){
            records[String(level.title)] = {progress: audio.currentTime / audio.duration * 100};
            document.getElementById("progress").innerHTML = "New Record! " + String(Math.round(records[String(level.title)].progress)) + "% Progress";
            window.localStorage.setItem("records", JSON.stringify(records));
        }
        else{
            document.getElementById("progress").innerHTML = String(Math.round(audio.currentTime / audio.duration * 100)) + "% Progress";
        }
        document.getElementById("error").innerHTML = String(Math.round(error * 100) / 100) + " beats off!";

        if ((Settings.animations == "noWalls" || Settings.animations == "none") && !Settings.noFlash){
            c = i;
            while (rhythmArray[c].colors == undefined){
                c -= 1;
            }
            colorSet = {...rhythmArray[c].colors};
            setTimeout(() => {document.getElementById("failMenu").hidden = false; document.getElementById("failMenu").children.namedItem("retry").focus();}, 1000);
        }
        else{
            document.getElementById("failMenu").hidden = false;
            document.getElementById("failMenu").children.namedItem("retry").focus();
        }

        menus();
    }

    function pracFail(){
        var newAbort = new AbortController();
        clearTimeout(failTimeID);
        audio.pause();
        document.getElementById("pracProgress").innerHTML = String(Math.round(audio.currentTime / audio.duration * 100)) + "% Progress";
        document.getElementById("pracError").innerHTML = String(Math.round(error * 100) / 100) + " beats off!";
        if ((Settings.animations == "noWalls" || Settings.animations == "none") && !Settings.noFlash){
            c = i;
            while (rhythmArray[c].colors == undefined){
                c -= 1;
            }
            colorSet = {...rhythmArray[c].colors};
            setTimeout(() => {document.getElementById("pracFailMenu").hidden = false; document.getElementById("pracFailMenu").children.namedItem("respawn").focus();}, 1000);
        }
        else{
            document.getElementById("pracFailMenu").hidden = false;
            document.getElementById("pracFailMenu").children.namedItem("respawn").focus();
        }
        menus();
        if (rhythmArray[i].measure < 2){
            document.getElementById("respawn").addEventListener("click", ()=>{
                globalAbort.abort();
                globalAbort = new AbortController();
                document.getElementById("pracFailMenu").hidden = true;
                newAbort.abort();
                setTimeout(play, 1);
               }, {signal: newAbort.signal}); 
            return;
        }
        i -= 1;
        prevMeasure = rhythmArray[i].measure;
        while (rhythmArray[i].measure == prevMeasure){
            i -= 1;
        }
        prevMeasure = rhythmArray[i].measure;
        while (rhythmArray[i].measure == prevMeasure){
            i -= 1;
        }
        //I think the problem with respawning on a measure with rests is that pracFail gets called twice for some reason.
        i = Math.max(i + 1, 0);
        audio.currentTime = rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0) * secsPerBeat + level.offset;
        prevTime = audio.currentTime;
        if (i % 2 == 1){
            performance = -1;
            multiplier = -1;
        }
        else{
            performance = 1;
            multiplier = 1;
        }
        if (i == 0){
            performance = 0;
            multiplier = 0;
        }
        playerHeight = canvas.height - rhythmArray[i - 1].y - performance * Settings.inputOffset * pixPerSec;
        playerTrailPath = new Path2D();
        playerTrailPath.moveTo(rhythmArray[i - 1].x, rhythmArray[i - 1].y);
        document.getElementById("respawn").addEventListener("click", ()=>{
            if (Settings.animations == "noWalls"){
                colorSet.walls = colorSet.path;
                colorSet.rest = colorSet.path;
            }
            if (Settings.animations == "none"){
                for (t in colorSet){
                    colorSet[t] = '#FFFFFF';
                }
            }
            document.getElementById("pracFailMenu").hidden = true;
            audio.play();
            inputBool = false;
            i += 1;
            z = i;
            prevMeasure = rhythmArray[z].measure;
            while (rhythmArray[z].measure == prevMeasure){
                if (!rhythmArray[z].rest){
                    setTimeout(() => {userPerformance();}, 1000 * (secsPerBeat * rhythmArray.slice(0, z).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset - Settings.inputOffset)));
                }
                z++;
            }
            setTimeout(() => {inputBool = true;}, 1000 * (secsPerBeat * rhythmArray.slice(0, z).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset - Settings.inputOffset) - Settings.threshold));
            
            newAbort.abort();
        }, {signal: newAbort.signal});
    }

    function calculatePosition(){//#add practice mode, checkpoints, etc.
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
        loopAni = true;
        window.requestAnimationFrame(animate);
        if (i == 0){//#if respawn on measure beginning with rest, this will fail. Maybe replace [0] with [i]

            while (countVar > 0){
                setTimeout((val)=> {document.getElementById("countdown").innerHTML = String(val); document.getElementById("countdown").hidden = false;}, (level.offset + Settings.inputOffset - countVar * secsPerBeat) * 1000, countVar);
                countVar -= 1;
            }
            setTimeout(()=> {document.getElementById("countdown").hidden = true}, (level.offset + Settings.inputOffset) * 1000);

            if (rhythmArray[0].rest){
                setTimeout(() => {userPerformance();}, 1000 * (level.offset + Settings.inputOffset));
            }
        
        }

        /*if (rhythmArray[i].rest){
                setTimeout(() => {userPerformance(); console.log("hi")}, 1000 * (Settings.inputOffset));
        }//#this should fix the rest problem with resapwn, but it doesn't*/

        time = 1000 * (secsPerBeat * rhythmArray.slice(0, i).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + millisPerBeat * Settings.threshold;

        failTimeID = setTimeout(() => {error = Settings.threshold; if (!practice){fail();}
            else{pracFail();}}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));      

        time = 1000 * (secsPerBeat * rhythmArray.slice(0, i + 1).reduce((prev, current,) => prev + current.duration, 0) - (document.getElementById("audio").currentTime - level.offset)) + Settings.threshold * millisPerBeat;
        clearTimeout(failTimeID);
        failTimeID = setTimeout(() => {error = Settings.threshold; if (!practice){fail();}
            else{pracFail();}}, Math.max(time + Math.abs(Settings.inputOffset * 1000), millisPerBeat * Settings.threshold + Math.abs(Settings.inputOffset * 1000)));
        if(Settings.sheetMusicMode == "line"){
            render(level.rthm, rhythmArray[i].measure, Math.floor(canvas.width / Dev.appearWidth));
            svg = document.getElementById("sheetMusic").children.item(0);
        }
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
        restBoth = false;
        while (l < rhythmArray.length){
            if (rhythmArray[l].rest){
                    restA.moveTo(x - (Dev.restWidth * pixPerBeat / 2), Math.abs(y));
                    restA.lineTo(x + (Dev.restWidth * pixPerBeat / 2), Math.abs(y));
                    if ((Math.abs(y) < Settings.threshold * pixPerBeat || Math.abs(y) > canvas.height - Settings.threshold * pixPerBeat) && restBoth){
                        restA.moveTo(x - (Dev.restWidth * pixPerBeat / 2), Math.abs(Math.abs(y) - canvas.height));
                        restA.lineTo(x + (Dev.restWidth * pixPerBeat / 2), Math.abs(Math.abs(y) - canvas.height));
                        restBoth = false;
                    }
            }
            
            if (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration > canvas.height){
                var x1 = (-(y - canvas.height) / (1)) + x;
                var y1 = canvas.height;
                path.lineTo(x1 + 30, y1 + 30);
                path.moveTo(x1 - 30, 0 - 30);
                restBoth = true;
                x += pixPerBeat * rhythmArray[l].duration;
                y = ((Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration) - canvas.height);

            }
            else if (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration < 0){
                var x2 = (-(y - 0) / (1)) + x;
                var y2 = 0
                path.lineTo(x2 + 30, y2 - 30);
                path.moveTo(x2 - 30, canvas.height + 30);
                restBoth = true;
                x += pixPerBeat * rhythmArray[l].duration;
                y = -1 * ((Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration) + canvas.height);
            }
            else if (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration == 0){
                x += pixPerBeat * rhythmArray[l].duration;
                y = -0.000000000000001;
                restBoth = false;
            }
            else{
                x += pixPerBeat * rhythmArray[l].duration;
                y = Math.sign(y) * (Math.abs(y) + Math.sign(y) * pixPerBeat * rhythmArray[l].duration);
                restBoth = false;
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
            }
            
        }
        //canvas.width = window.innerWidth;
        if (Settings.sheetMusicMode == "scroll"){
            
            renderAll(level.rthm);
            svg = document.getElementById("sheetMusic").children.item(0);
            svg.setAttribute("width", String(canvas.width));
            svg.setAttribute("height", "150")
            svg.setAttribute("style", "");
        }
        window.requestAnimationFrame(animate);
    }
    
    var playerHeight = 0;
    var prevTime = 0;
    var changed = false;
    var playerTrailPath = new Path2D();
    playerTrailPath.moveTo(0, canvas.height);
    var position;

    function animate(){
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = colorSet.walls;
        
        if (audio.ended){
            position += 0.03 * pixPerBeat;
            playerHeight += multiplier * 0.03 * pixPerBeat;
        }
        else{
            position = pixPerSec * (audio.currentTime - level.offset - Settings.inputOffset) - canvas.width / 2;
            playerHeight += multiplier * pixPerSec * (audio.currentTime - prevTime);
        }


        if (Math.sign(performance) != Math.sign(multiplier)){

            if (Math.abs(error) <= Settings.threshold){
                if (multiplier != 0){
                    multiplier = performance;
                    playerTrailPath.lineTo(rhythmArray[i-2].x, rhythmArray[i - 2].y);
                    playerHeight = (canvas.height - rhythmArray[i - 2].y) + (performance * ((position + canvas.width / 2) - rhythmArray[i - 2].x));
                }
                else{
                    multiplier = performance;
                    playerHeight = playerHeight + performance * ((position + canvas.width / 2));//assumes starting at rhythmArray[i - 2].x of zero, won't work if ever a zero multiplier is not the start of the level
                }
            }
            else{
                multiplier = performance;
            }
                
            
        }

        if (Settings.sheetMusicMode == "scroll"){
            //svg.setAttribute("style", "left: " + String(-Math.round(position)) + "px;" + " position: relative;");
            svg.setAttribute("viewBox", String(position) + ", 0, " + (String(canvas.width)) + ", 150");
            //svg.setAttribute("viewBox", "0, 0, 300, 200");
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var rendered = new Path2D(playerTrailPath);
        if (position + canvas.width / 2 >= 0){rendered.lineTo(position + canvas.width / 2, canvas.height - playerHeight);}
        ctx.setTransform(1, 0, 0, 1, -position, 0);
        ctx.lineWidth = pixPerBeat * Settings.threshold + (Dev.playerWidth * pixPerBeat);
        ctx.strokeStyle = colorSet.path;
        ctx.stroke(path);//#need to add rest animation, probably need to add a separate path
        ctx.strokeStyle = colorSet.rest;
        ctx.lineWidth = Math.sqrt((Math.pow(pixPerBeat * Settings.threshold + (Dev.playerWidth * pixPerBeat), 2)) + (Math.pow(pixPerBeat * Settings.threshold + (Dev.playerWidth * pixPerBeat), 2)));
        ctx.stroke(restA);

        
        if (playerHeight > canvas.height){//#change logic here to check if the direction (performance) matches the direction that teleporting would end up placing you
            if ((rhythmArray[i - 2] != undefined) && ((Math.abs(canvas.height - playerHeight - rhythmArray[i - 1].y) > 2 * Settings.threshold * pixPerBeat) || rhythmArray[i - 2].x - (position + canvas.width / 2) > 2 * pixPerBeat * (Settings.threshold))){
                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = playerHeight - canvas.height;
                playerTrailPath.moveTo(position + canvas.width / 2 - 30, canvas.height - playerHeight + 30);
            }
        }
        if (playerHeight < 0){
            if ((rhythmArray[i - 2] != undefined) && ((Math.abs(canvas.height - playerHeight - rhythmArray[i - 1].y) > 2 * Settings.threshold * pixPerBeat) || rhythmArray[i - 2].x - (position + canvas.width / 2) > 2 * pixPerBeat * (Settings.threshold))){
                playerTrailPath.lineTo(position + canvas.width / 2, canvas.height - playerHeight);
                playerHeight = canvas.height + playerHeight;
                playerTrailPath.moveTo(position + canvas.width / 2 - 30, canvas.height - playerHeight - 30);
            }
        }
        prevTime = audio.currentTime;
        ctx.fillStyle = colorSet.player;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, -position, canvas.height);
        if (((position + canvas.width) / pixPerBeat) / (eval(testCode(level.time)) * 4) > level.rthm.length){
            ctx.clearRect((level.rthm.length * (eval(testCode(level.time)) * 4)) * pixPerBeat - position, 0, pixPerBeat * 4, canvas.height);
        }
        ctx.setTransform(1, 0, 0, 1, -position, 0);
        ctx.strokeStyle = colorSet.trail;
        ctx.lineWidth = (Dev.playerWidth * pixPerBeat) / 2;
        ctx.stroke(rendered);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillRect(canvas.width / 2 - (Dev.playerWidth * pixPerBeat) / 2, canvas.height - playerHeight - (Dev.playerWidth * pixPerBeat) / 2, (Dev.playerWidth * pixPerBeat), (Dev.playerWidth * pixPerBeat));

        if (document.getElementById("winMenu").hidden && loopAni){
            window.requestAnimationFrame(animate);
        }
        
    }
}

function vexCodetoRhythmArray(vexCodeArray = []){//#make beaming automatic on tuplets (not here)
    all = "[]";
    //Vexcode notes must use numbers, not letters for duration and declare length for each note
    for (i in vexCodeArray){
        if (vexCodeArray[i] != undefined){
            vexCode = testCode(vexCodeArray[i].notes).replaceAll("score.notes", "vNotes");
            vexCode = vexCode.replaceAll("tie", "vTie");
            vexCode = vexCode.replaceAll("score.tuplet", "vTuplet");
            vexCode = vexCode.replaceAll("score.beam", "");
            vexCode = vexCode.replaceAll(" ", "");
            all = all + ".concat(measure([]" +vexCode.slice(2) + ", " + String(i) + "))";
        }//vexcode must start with [](it slices this)
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
    for (i in level){
        if (String(i) != 'rthm' && String(i) != "location"){
            document.getElementById(String(i)).value = level[i];
        }
    }
    calcCanvSize();
    var measure = -2;
    document.getElementById("measure").value = 0;
    if (level.rthm[0] != undefined){
        colorSet = vexCodetoRhythmArray([level.rthm[0]])[0].colors;
        drawEdCanv();
    } 
    var endParen = ")";//#editor needs to load colors from level file on editor load and changing measures
    colorNext = true;//#going back and adding something in the middle of level file then adds concat( to the next measure, which breaks things (it is an empty measure with just concat(  )

    document.getElementById("editor").hidden = false;
    document.getElementById("sheetMusic").hidden = false;
    document.addEventListener("click", (event) => {if (inputBool && event.target.id != "measure"){inputs(event)};}, {signal: globalAbort.signal});
    document.addEventListener("change", (event)=>{if (inputBool && event.target.id != "measure" && event.target.id != "tuplet"){inputs(event)};}, {signal: globalAbort.signal});
    document.addEventListener("keydown", (event) => {if (inputBool && event.key == "Escape"){inputs(event)};}, {signal: globalAbort.signal});
    document.getElementById("measure").addEventListener("change", (event) => {
        if (level.rthm[measure] != undefined){
            bMeasure = document.getElementById("measure").value;
            while (bMeasure > 0 && (level.rthm[bMeasure] == undefined || level.rthm[bMeasure].beam == undefined)){
                bMeasure -= 1;
            }

            for (b = 0; document.getElementById("beam" + String(b)) != null; b += 2){
                document.getElementById("beam" + String(b)).value = 0;
                document.getElementById("beam" + String(b + 1)).value = 8;
            };

            for (g in level.rthm[bMeasure].beam){
                document.getElementById("beam" + String(g)).value = level.rthm[bMeasure].beam[g];
                for (b = 0; document.getElementById("beam" + String(b)) != null; b += 2){};
                if (document.getElementById("beam" + String(b - 2)).value != "" && document.getElementById("beam" + String(b - 2)).value != "0"){//adds elements as needed
                    document.getElementById("beam" + String(b - 2)).insertAdjacentHTML("afterend", "<input name=\"beam\" class=\"beamNumber\" id=\"beam" + String(b) + "\" type=\"number\">")
                    document.getElementById("beam" + String(b - 1)).insertAdjacentHTML("afterend", "<input name=\"beam\" class=\"beamNumber\" id=\"beam" + String(b + 1) + "\" type=\"number\" value=\"8\">")
                }
                else{
                    while (document.getElementById("beam" + String(b - 4)).value == "" || document.getElementById("beam" + String(b - 4)).value == "0"){//removes unneeded elements
                        document.getElementById("beam" + String(b - 2)).remove();
                        document.getElementById("beam" + String(b - 1)).remove();
                        b -= 2;
                    }
                }
            }
        }
        edRhythmArray = vexCodetoRhythmArray(level.rthm);
        for (c = 0; edRhythmArray[c + 1] != undefined && edRhythmArray[c].measure < document.getElementById("measure").value; c++){}
        while (c > 0 && edRhythmArray[c].colors == undefined){
            c -= 1;
        }
        colorSet = edRhythmArray[c].colors;
        document.getElementsByName("colors").forEach((element) => {
            element.value = colorSet[element.id];
        });
        drawEdCanv();
        editRender(level.rthm, Number(event.target.value));
    }, {signal: globalAbort.signal});

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
        document.getElementsByName("colors").forEach((element) => {
            element.value = colorSet[element.id];
        });
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
        edCtx.lineWidth = (Dev.playerWidth * pixPerBeat) / 2;
        edCtx.stroke(edPath);
        edPath = new Path2D();
        edPath.moveTo(edCanv.width * 2 / 3 - 6, edCanv.height / 2);
        edPath.lineTo(edCanv.width * 2 / 3 + 6, edCanv.height / 2);
        edCtx.strokeStyle = colorSet.rest;
        edCtx.lineWidth = edCanv.height / 3;
        edCtx.stroke(edPath);
        edCtx.fillStyle = colorSet.player;
        edCtx.setTransform(1, 0, 0, 1, 0, 0);
        edCtx.fillRect(edCanv.width / 2 - (Dev.playerWidth * pixPerBeat) / 2, edCanv.height / 2 - (Dev.playerWidth * pixPerBeat) / 2, (Dev.playerWidth * pixPerBeat), (Dev.playerWidth * pixPerBeat));
    };

    
//#newly loaded score only shows when updating measure location. Appending scores has some bugs

    function inputs(event){
        var id = event.srcElement.id;
        if (measure != Number(document.getElementById("measure").value) && id != ""){
            
            if (document.getElementById("measure").value == String(-100)){
                document.getElementById("measure").value = String(0);
                colorNext = true;
            }
            measure = Number(document.getElementById("measure").value);

            if (id != "delete"){
                if (id.replaceAll(/\d/g, "") == "beam"){
                    if (level.rthm[measure] == undefined){
                        level.rthm.splice(measure, 0, {notes: "[].concat("});
                        endParen = ")";
                    }
                }
                else{
                    level.rthm.splice(measure, 0, {notes: "[].concat("});
                    endParen = ")";
                }
                
            }
        }
        if (id.replaceAll(/\d/g, "") == "beam"){//there is a duplicate of this above for on change event
            for (b = 0; document.getElementById("beam" + String(b)) != null; b++){}
            if (document.getElementById("beam" + String(b - 2)).value != "" && document.getElementById("beam" + String(b - 2)).value != "0"){//adds elements as needed
                document.getElementById("beam" + String(b - 2)).insertAdjacentHTML("afterend", "<input name=\"beam\" class=\"beamNumber\" id=\"beam" + String(b) + "\" type=\"number\">")
                document.getElementById("beam" + String(b - 1)).insertAdjacentHTML("afterend", "<input name=\"beam\" class=\"beamNumber\" id=\"beam" + String(b + 1) + "\" type=\"number\" value=\"8\">")
            }
            else{
                while (document.getElementById("beam" + String(b - 4)).value == "" || document.getElementById("beam" + String(b - 4)).value == "0"){//removes unneeded elements
                    document.getElementById("beam" + String(b - 2)).remove();
                    document.getElementById("beam" + String(b - 1)).remove();
                    b -= 2;
                }
            }
            level.rthm[measure].beam = [];
            for (b = 0; document.getElementById("beam" + String(b + 2)) != null; b++){
                level.rthm[measure].beam[b] = Number(document.getElementById("beam" + String(b)).value);
            }
            editRender(level.rthm, measure);
        }
        if (id == "1"){
            if (document.getElementById("rest0").checked){
                level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('D5/1/r'), ")
            }
            else{
               level.rthm[measure].notes = level.rthm[measure].notes.concat("score.notes('B4/1'), ")
            }
        }
        if (id == "2"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/2/r'), ");
            }
            else{
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/2'), ");
            }
        }
        if (id == "4"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/4/r'), ");
            }
            else{
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/4'), ");
            }
        }
        if (id == "8"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/8/r'), ");
            }
            else{
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/8'), ");
            }
        }
        if (id == "16"){
            if (document.getElementById("rest0").checked){
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/16/r'), ");
            }
            else{
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.notes('B4/16'), ");
            }
        }
        if (colorNext && (String(id.match(/\d+/g)) == id)){
            level.rthm[measure].notes = level.rthm[measure].notes.slice(0, level.rthm[measure].notes.lastIndexOf("'") + 1) +", " + JSON.stringify(colorSet).replaceAll("\"", "'").replaceAll(RegExp(/'(?!#|,|})/g), "") + level.rthm[measure].notes.slice(level.rthm[measure].notes.lastIndexOf("'") + 1)
            colorNext = false;
        }
        if (id == "tie"){
            var tieHere =level.rthm[measure].notes.lastIndexOf("score.notes");
            if (level.rthm[measure].notes == "[].concat("){
                alert("Tieing notes across barlines not currently supported!");
            }
            else{
               level.rthm[measure].notes =level.rthm[measure].notes.slice(0, tieHere) + "tie([].concat(" +level.rthm[measure].notes.slice(tieHere);
                endParen = endParen + "))"
            }
        }
        if (id == "."){
            var here =level.rthm[measure].notes.search(/(?<!#([0-9a-fA-F]{5}))(\d|r|\.)'(?!.*(?<!#([0-9a-fA-F]{5}))(\d|r|\.)')/g) + 1;
            if (vexCodetoRhythmArray([{notes: level.rthm[measure].notes.slice(0, here) + "." +level.rthm[measure].notes.slice(here) + endParen}]).reduce((prev, current) => prev + current.duration, 0) <= eval(testCode(level.time)) * 4){
               level.rthm[measure].notes =level.rthm[measure].notes.slice(0, here) + "." +level.rthm[measure].notes.slice(here);
            }
            else{
                            alert("Dotting this note exceeds the measure's length!");
            }
        }
        if (id == "tuplet"){
            if (document.getElementById("tuplet").checked){
               level.rthm[measure].notes =level.rthm[measure].notes.concat("score.tuplet([].concat(");
                endParen = endParen + "))";
            }
            else {
                var numNotes = document.getElementById("notes").value;
                var notesOccupied = document.getElementById("length").value;
                if (numNotes == ""){
                    numNotes = level.rthm[measure].notes.slice(level.rthm[measure].notes.lastIndexOf("tuplet(")).matchAll("notes").toArray().length;
                }
                if (notesOccupied == ""){
                    c = 0;
                    while (Math.pow(2, c) < numNotes){
                        c++
                    }
                    notesOccupied = Math.pow(2, c - 1);
                }
               level.rthm[measure].notes =level.rthm[measure].notes.concat("), {num_notes: " + String(numNotes) +", notes_occupied: " + String(notesOccupied) + "})).concat(");
                endParen = endParen.replace("))", "");
            } 
        }
        if (event.key == "Escape"){
            inputBool = false;
            menus();
            document.getElementById("editorMenu").hidden = false;
        }
        if ((!(document.getElementById("tuplet").checked) && id != "delete" && id != "")){
            if (vexCodetoRhythmArray([{notes: level.rthm[measure].notes + endParen}]).reduce((prev, current) => prev + current.duration, 0) > eval(testCode(level.time)) * 4){
                var end = level.rthm[measure].notes.lastIndexOf("score.notes")
                level.rthm[measure].notes =level.rthm[measure].notes.slice(0, end);
                var fill = ((eval(testCode(level.time)) * 4 - vexCodetoRhythmArray([{notes: level.rthm[measure].notes + endParen}]).reduce((prev, current) => prev + current.duration, 0)));
                var val = []
                var h = 0;
                while (fill > 0){
                    f = 0
                    while (1 / Math.pow(2, f) * 4 > fill){
                        f++
                    }
                    fill = fill - (1 / Math.pow(2, f)) * 4;
                    val[h] = String(Math.pow(2, f));
                    h++;
                }
                h -= 1;
                while (h >= 0){
                    document.getElementById(val[h]).click();
                    if (h != 0){
                        document.getElementById("tie").click();
                    }
                    h -= 1;
                }
            }
            if (id != "delete" && id.replaceAll(/\d/g, "") != "beam"){
                if (Number(vexCodetoRhythmArray([{notes: level.rthm[measure].notes + endParen}]).reduce((prev, current) => prev + current.duration, 0).toFixed(10)) == eval(testCode(level.time)) * 4){
                    level.rthm[measure].notes = level.rthm[measure].notes + endParen;
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

    fetch("resources/list.json")
            .then((response) => response.json())
            .then((items) => {//#need to add custom level option (to select and play custom level) Maybe eventually have a test level button in editor too
                for (i in items){
                    div = main.appendChild(document.createElement("div"));
                    l = div.appendChild(document.createElement("button"));
                    if (!practice){
                        m = div.appendChild(document.createElement("p"));
                        m.innerHTML = "Progress: ";
                        if (records[String(i)] != undefined){
                            if (records[String(i)].progress == "Done"){
                                m.innerHTML = "Accuracy: " + String(Math.round(records[String(i)].accuracy)) + "%"
                            }
                            else{
                                m.innerHTML = "Progress: " + String(Math.round(records[String(i)].progress)) + "%";//#level.title must match the name in list.json... maybe make one big levels object to make accesssing these easier?
                            }
                        }
                    }
                    l.innerHTML = String(i)
                    l.setAttribute("id", String(items[String(i)]));
                    l.setAttribute("class", "menuButton")
                }
            });
    document.addEventListener("click", (event) => {

        if (event.target.tagName == "BUTTON"){
            loadLevel(event.target.id);
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
    if (code == code.matchAll(/score|undefined|notes|beam|{walls|path|#|trail|player|rest|tuplet|{num_|:|_occupied|}|\[]\.concat|concat|tie|r|\.|\(|\)|"|'|[A-G]|[a-g]|\/|\d| |,/g).reduce((prev, current) => prev + current.toString(), 0).slice(1)){
        return code;
    }
    else{
        alert("Level file invalid! Remove \"" + code.replaceAll(/score|notes|beam|{walls|path|#|trail|player|rest|tuplet|{num_|:|_occupied|}|\[]\.concat|concat|tie|r|\.|\(|\)|"|'|[A-G]|[a-g]|\/|\d| |,/g, "") + "\" from level file!");
        console.log(code);
    }
    
}

function loadLevel(location){
    fetch(location)//#
            .then((response) => response.json())
            .then((info) => {
                level = info;
                calcCanvSize();
                main.hidden = true;
                globalAbort.abort();
                globalAbort = new AbortController();
                play();
            });
}

function calcCanvSize(){
    document.getElementById("game").width = window.innerWidth;
    document.getElementById("game").height = String(Math.min(document.getElementById("game").width / 2.5, window.innerHeight / 2));
    secsPerBeat = (1 / level.bpm) * 60;
    millisPerBeat = secsPerBeat * 1000;
    pixPerBeat = document.getElementById("game").height / (eval(testCode(level.time)) * 4);//#add some scaling for smaller devices, etc, but have to keep level rendering the same across devices (must scale after)
    pixPerSec = pixPerBeat / secsPerBeat;
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
