let prevParameter1 = false;
let asyncindex = 0;

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
  synth = new Tone.Synth().chain(reverb);
  note = null;
  synth2 = new Tone.Synth().chain(reverb);
  note2 = null;
  synth3 = new Tone.Synth().chain(reverb);
  note3 = null;
  synth4 = new Tone.Synth().chain(reverb);
  note4 = null;
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
  //console.log(detections);
  if (detections != undefined) {
    if (asyncindex == 0) {
      await waitForDetections();
    }
    if (detections.multiHandLandmarks.length > 1) {
      parameter1 = true;
    } else {
      parameter1 = false;
    }
    if (parameter1 && !prevParameter1) {
      startSound(); // Call startSound() only once when parameter1 changes from false to true
    } else if (!parameter1) {
      stopSound(); // Call stopSound() only once when parameter1 changes from true to false
    }
    prevParameter1 = parameter1;
  }
  if (note) {
    posX = detections.multiHandLandmarks[0][8].x;
    if (posX < 0) {
      posX = 0;
    }
    if (posX > 1) {
      posX = 1;
    }
    console.log(posX);
    noteIndex = Math.floor(map(posX, 0, 1, 0, 6));
    //console.log(noteIndex);
    frequency = fundFreq * scl[noteIndex];
    synth.set({ frequency: frequency });
  }
  if (note2) {
    posX2 = detections.multiHandLandmarks[0][8].y;
    if (posX2 < 0) {
      posX2 = 0;
    }
    if (posX2 > 1) {
      posX2 = 1;
    }
    //console.log(posX2);
    noteIndex2 = Math.floor(map(posX2, 0, 1, 0, 6));
    // console.log(noteIndex);
    frequency2 = fundFreq * scl[noteIndex2];
    synth2.set({ frequency: frequency2 });
  }
  if (note3) {
    posX3 = detections.multiHandLandmarks[1][8].y;
    if (posX3 < 0) {
      posX3 = 0;
    }
    if (posX3 > 1) {
      posX3 = 1;
    }
    //console.log(posX2);
    noteIndex3 = Math.floor(map(posX3, 0, 1, 0, 6));
    // console.log(noteIndex);
    frequency3 = fundFreq * scl[noteIndex3];
    synth3.set({ frequency: frequency3 });
  }
  if (note4) {
    posX4 = detections.multiHandLandmarks[1][8].x;
    if (posX4 < 0) {
      posX4 = 0;
    }
    if (posX4 > 1) {
      posX4 = 1;
    }
    //console.log(posX2);
    noteIndex4 = Math.floor(map(posX4, 0, 1, 0, 6));
    // console.log(noteIndex);
    frequency4 = (fundFreq / 2) * scl[noteIndex4];
    synth4.set({ frequency: frequency4 });
  }
}

function startSound() {
  // Play the note
  posX = detections.multiHandLandmarks[0][8].x;
  noteIndex = Math.floor(map(posX, 0, 1, 0, 6));
  frequency = fundFreq * scl[noteIndex];
  note = synth.triggerAttack(
    frequency,
    0,
    1
    //detections.multiHandLandmarks[0][8].z * 0.5
  );

  posX2 = detections.multiHandLandmarks[0][8].y;
  noteIndex2 = Math.floor(map(posX2, 0, 1, 0, 6));
  frequency2 = fundFreq * scl[noteIndex2];
  note2 = synth2.triggerAttack(
    frequency2,
    0,
    1
    //detections.multiHandLandmarks[0][8].z * 0.5
  );
  posX3 = detections.multiHandLandmarks[1][8].y;
  noteIndex3 = Math.floor(map(posX3, 0, 1, 0, 6));
  frequency3 = fundFreq * scl[noteIndex3];
  note3 = synth3.triggerAttack(
    frequency3,
    0,
    1
    //detections.multiHandLandmarks[0][8].z * 0.5
  );
  posX4 = detections.multiHandLandmarks[1][8].x;
  noteIndex4 = Math.floor(map(posX4, 0, 1, 0, 6));
  frequency4 = (fundFreq / 2) * scl[noteIndex4];
  note4 = synth4.triggerAttack(
    frequency4,
    0,
    1
    //detections.multiHandLandmarks[0][8].z * 0.5
  );
}

function stopSound() {
  // Release the note
  if (note) {
    synth.triggerRelease();
    note = null;
  }
  if (note2) {
    synth2.triggerRelease();
    note2 = null;
  }
  if (note3) {
    synth3.triggerRelease();
    note3 = null;
  }
  if (note4) {
    synth4.triggerRelease();
    note4 = null;
  }
}

async function waitForDetections() {
  // detections değişkeni gelene kadar beklemek için bir Promise döndüren fonksiyon
  return new Promise((resolve) => {
    // 100 milisaniyede bir kontrol etmek için bir aralık oluşturuyoruz
    const interval = setInterval(() => {
      if (
        detections &&
        detections.multiHandLandmarks &&
        detections.multiHandLandmarks.length > 1
      ) {
        clearInterval(interval); // değer alındığında aralığı temizle
        resolve(); // Promise'i tamamla ve işlemlere devam et
      }
    }, 1000);
    asyncindex = 1; // 100 milisaniye (0.1 saniye) aralıkla kontrol et
  });
}
