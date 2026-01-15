let prevLeftActive = false;
let prevRightActive = false;
let lastLeftIndex = null;
let lastRightIndex = null;
let leftDelay;
let rightDelay;
const MIN_SIZE = 0.3;
let leftLFO;
let rightLFO;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas2");
  background(0);
  rectMode(RADIUS);
  fill(255);
  //fill(alpha(50));
  rect(
    windowWidth / 2,
    windowHeight / 2,
    windowWidth / 2 - 30,
    windowHeight / 2 - 30
  );
  Tone.start();
  reverb = new Tone.Reverb(0.4).connect(Tone.Master);
  reverb.wet.value = 0.3;
  leftSynth = new Tone.Synth({ oscillator: { type: "sawtooth" } });
  rightSynth = new Tone.Synth({ oscillator: { type: "square" } });
  leftDelay = new Tone.FeedbackDelay(0.35, 0.5);
  rightDelay = new Tone.FeedbackDelay(0.35, 0.5);
  leftDelay.wet.value = 0.6;
  rightDelay.wet.value = 0.6;
  leftSynth.chain(leftDelay, reverb);
  rightSynth.chain(rightDelay, reverb);
  leftLFO = new Tone.LFO(3, -20, 20).start();
  rightLFO = new Tone.LFO(3, -20, 20).start();
  leftLFO.connect(leftSynth.detune);
  rightLFO.connect(rightSynth.detune);
  leftLFO.amplitude.value = 0;
  rightLFO.amplitude.value = 0;
  leftNote = null;
  rightNote = null;
  ////
  det = [
    1, 1.059, 1.122, 1.189, 1.259, 1.334, 1.414, 1.498, 1.587, 1.681, 1.782,
    1.887, 2,
  ];
  minNat = [det[0], det[2], det[3], det[5], det[7], det[8], det[10]];
  minHar = [det[0], det[2], det[3], det[5], det[7], det[8], det[11]];
  maj = [det[0], det[2], det[4], det[5], det[7], det[9], det[11]];

  //startSound();
  ////
  scl = minNat;
  fundFreq = 250;
}

async function draw() {
  if (detections != undefined) {
    const indices = getHandIndices();
    const leftIdx = indices.left;
    const rightIdx = indices.right;

    const leftActive = leftIdx !== -1;
    const rightActive = rightIdx !== -1;

    if (leftActive && !prevLeftActive) {
      const x = clamp01(detections.multiHandLandmarks[leftIdx][8].x);
      const noteIndex = Math.floor(map(x, 0, 1, 0, 6));
      const frequency = fundFreq * scl[noteIndex];
      leftNote = leftSynth.triggerAttack(frequency, 0, 1);
      lastLeftIndex = noteIndex;
      leftLFO.amplitude.value = 1;
    } else if (!leftActive && prevLeftActive) {
      if (leftNote) {
        leftSynth.triggerRelease();
        leftNote = null;
      }
      lastLeftIndex = null;
      leftLFO.amplitude.value = 0;
    }

    if (rightActive && !prevRightActive) {
      const x = clamp01(detections.multiHandLandmarks[rightIdx][8].x);
      const noteIndex = Math.floor(map(x, 0, 1, 0, 6));
      const frequency = fundFreq * scl[noteIndex];
      rightNote = rightSynth.triggerAttack(frequency, 0, 1);
      lastRightIndex = noteIndex;
      rightLFO.amplitude.value = 1;
    } else if (!rightActive && prevRightActive) {
      if (rightNote) {
        rightSynth.triggerRelease();
        rightNote = null;
      }
      lastRightIndex = null;
      rightLFO.amplitude.value = 0;
    }

    prevLeftActive = leftActive;
    prevRightActive = rightActive;
  }
  if (leftNote) {
    const idx = getHandIndices().left;
    if (idx !== -1) {
      const x = clamp01(detections.multiHandLandmarks[idx][8].x);
      const noteIndex = Math.floor(map(x, 0, 1, 0, 6));
      if (noteIndex !== lastLeftIndex) {
        const target = fundFreq * scl[noteIndex];
        leftSynth.set({ frequency: target });
        lastLeftIndex = noteIndex;
      }
      const size = getHandSize(idx);
      const fb = clamp01(map(size, MIN_SIZE, 0.6, 0.9, 0.25));
      leftDelay.feedback.value = fb;
      const y = clamp01(detections.multiHandLandmarks[idx][8].y);
      const lfoFreq = map(y, 0, 1, 8, 0.05);
      leftLFO.frequency.value = lfoFreq;
    }
  }
  if (rightNote) {
    const idx = getHandIndices().right;
    if (idx !== -1) {
      const x = clamp01(detections.multiHandLandmarks[idx][8].x);
      const noteIndex = Math.floor(map(x, 0, 1, 0, 6));
      if (noteIndex !== lastRightIndex) {
        const target = fundFreq * scl[noteIndex];
        rightSynth.set({ frequency: target });
        lastRightIndex = noteIndex;
      }
      const size = getHandSize(idx);
      const fb = clamp01(map(size, MIN_SIZE, 0.6, 0.9, 0.25));
      rightDelay.feedback.value = fb;
      const y = clamp01(detections.multiHandLandmarks[idx][8].y);
      const lfoFreq = map(y, 0, 1, 8, 0.05);
      rightLFO.frequency.value = lfoFreq;
    }
  }
}

function getHandIndices() {
  const res = { left: -1, right: -1 };
  if (
    detections &&
    detections.multiHandLandmarks &&
    detections.multiHandedness
  ) {
    for (let i = 0; i < detections.multiHandedness.length; i++) {
      const label = detections.multiHandedness[i].label;
      const size = getHandSize(i);
      if (size >= MIN_SIZE) {
        if (label === "Left") res.left = i;
        if (label === "Right") res.right = i;
      }
    }
  }
  return res;
}

function clamp01(v) {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function getHandSize(handIndex) {
  const lm = detections.multiHandLandmarks[handIndex];
  let minX = 1,
    minY = 1,
    maxX = 0,
    maxY = 0;
  for (let i = 0; i < lm.length; i++) {
    const x = clamp01(lm[i].x);
    const y = clamp01(lm[i].y);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  return Math.sqrt(w * w + h * h);
}
