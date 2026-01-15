let detections = {};

const videoElement = document.getElementById("video");

let hands = new Hands({
  locateFile: (file) => {
    return `libraries/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 2,
  selfieMode: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
});

hands.onResults(gotHands);

function gotHands(results) {
  detections = results;
  //console.log(detections);
}

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 360,
  height: 270,
  // width: windowWidth,
  // height: windowHeight,
});
camera.start();
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
