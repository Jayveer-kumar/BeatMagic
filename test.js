
// 1. GLOBAL NODES - Bina Constructor error ke initialize karna
const player = new Tone.Player();
const splitter = new Tone.Splitter(2); // Stereo to Mono L/R
const merger = new Tone.Merger(2);     // Mono L/R back to Stereo

// Do alag panners (Speed bahut slow rakhi hai)
const midPanner = new Tone.Panner(0);  // Central/Vocals
const sidePanner = new Tone.Panner(0); // Surround/Instruments

const reverb = new Tone.Reverb({ decay: 6, wet: 0 });
const bassEQ = new Tone.EQ3({ low: 0, mid: 0, high: 0 });
const filter = new Tone.Filter(20000, "lowpass");
const crusher = new Tone.BitCrusher({ bits: 8, wet: 0 });

// Buttons
let playBtn = document.getElementsByClassName("play");
let pouseBtn = document.getElementsByClassName("stop");
let btn8d = document.getElementById("btn8d");
let btnLofi = document.getElementById("btnLofi");
let btnBass = document.getElementById("btnBass");

playBtn.addEventListener("click",startAudio);
pouseBtn.addEventListener("click",startAudio);

btn8d.addEventListener("click",toggleMulti8D);
btnLofi.addEventListener("click",toggleLofi);
btnBass.addEventListener("click",toggleBass);

// 2. CONNECTION CHAIN
// Audio -> Splitter -> Each channel to its own Panner -> Merger -> FX -> Out
player.connect(splitter);
splitter.connect(midPanner, 0);  // Left Channel focus
splitter.connect(sidePanner, 1); // Right Channel focus

midPanner.connect(merger, 0, 0); // Connect to Left output
sidePanner.connect(merger, 0, 1); // Connect to Right output

merger.chain(bassEQ, filter, crusher, reverb, Tone.Destination);

let is8D = false;
let panValue = 0;
let panInterval;

async function startAudio() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files[0]) return alert("Please select a file!");

    document.getElementById("status").textContent = "Decoding...";
    await Tone.start();

    const url = URL.createObjectURL(fileInput.files[0]);
    await player.load(url);
    
    // Reverb ready karna zaroori hai
    await reverb.generate();

    player.start();
    document.getElementById("status").textContent = "Now Playing: Spatial Mix";
}

function stopAudio() {
    player.stop();
    clearInterval(panInterval);
    document.getElementById("status").textContent = "Playback Stopped";
}

function toggleMulti8D() {
    console.log("8d Selected : ");
    is8D = !is8D;
    const btn = document.getElementById("btn8d");
    
    if (is8D) {
        btn.classList.add("active");
        btn.textContent = "Multi-8D: ON";
        reverb.wet.value = 0.5;

        // Custom Rotation Logic: Alag speeds par
        let angle1 = 0; // Speed for Vocals
        let angle2 = 0; // Speed for Instruments

        panInterval = setInterval(() => {
            angle1 += 0.015; // Slow
            angle2 += 0.025; // Slightly faster
            
            // Vocals (Mid) Movement
            midPanner.pan.value = Math.sin(angle1);
            
            // Instruments (Side) Movement
            sidePanner.pan.value = Math.cos(angle2); 
            
            // Sine aur Cosine ki wajah se ye kabhi sath aayenge kabhi alag
        }, 30);

    } else {
        btn.classList.remove("active");
        btn.textContent = "Multi-8D: OFF";
        reverb.wet.value = 0;
        clearInterval(panInterval);
        midPanner.pan.value = 0;
        sidePanner.pan.value = 0;
    }
}

function toggleLofi() {
    console.log("Lofi Selected :" );
    const btn = document.getElementById("btnLofi");
    if (filter.frequency.value > 2000) {
        filter.frequency.value = 1200;
        crusher.wet.value = 1;
        btn.classList.add("active");
        btn.textContent = "Lofi: ON";
    } else {
        filter.frequency.value = 20000;
        crusher.wet.value = 0;
        btn.classList.remove("active");
        btn.textContent = "Lofi: OFF";
    }
}

function toggleBass() {
    console.log("Bass Selected : ");
    const btn = document.getElementById("btnBass");
    if (bassEQ.low.value === 0) {
        bassEQ.low.value = 12;
        btn.classList.add("active");
        btn.textContent = "Bass Boost: ON";
    } else {
        bassEQ.low.value = 0;
        btn.classList.remove("active");
        btn.textContent = "Bass Boost: OFF";
    }
}

console.log(playBtn);