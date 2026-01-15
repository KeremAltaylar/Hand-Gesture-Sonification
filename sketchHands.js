//------- Condortable p5 world :))))) -------//

let canvas;
let locators = [];
let locatorshands = [];

let sketch = function (p) {
  p.setup = function () {
    canvas = p.createCanvas(width, height);
    canvas.id("canvas");

    p.colorMode(p.HSB);
  };

  p.draw = function () {
    p.clear();
    if (detections != undefined) {
      if (detections.multiHandLandmarks != undefined) {
        p.drawLines([0, 5, 9, 13, 17, 0]); //palm
        p.drawLines([0, 1, 2, 3, 4]); //thumb
        p.drawLines([5, 6, 7, 8]); //index finger
        p.drawLines([9, 10, 11, 12]); //middle finger
        p.drawLines([13, 14, 15, 16]); //ring finger
        p.drawLines([17, 18, 19, 20]); //pinky
      }
    }
  };

  p.drawHands = function () {
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      for (let j = 0; j < detections.multiHandLandmarks[i].length; j++) {
        let x = detections.multiHandLandmarks[i][j].x * p.windowWidth;
        let y = detections.multiHandLandmarks[i][j].y * p.windowHeight;
        let z = detections.multiHandLandmarks[i][j].z;
        p.stroke(0);
        p.strokeWeight(6);
        p.point(x, y);
      }
    }
  };

  p.drawLandmarks = function (indexArray, hue) {
    p.noFill();
    p.strokeWeight(8);

    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      for (let j = indexArray[0]; j < indexArray[1]; j++) {
        let x = detections.multiHandLandmarks[i][j].x * p.windowWidth;
        let y = detections.multiHandLandmarks[i][j].y * p.windowHeight;
        // let z = detections.multiHandLandmarks[i][j].z;
        p.stroke(0);
        p.point(p.windowWidth - x, y);

        // locatorshands[j] = createVector(
        //   detections.multiHandLandmarks[i][j].x * p.windowWidth,
        //   detections.multiHandLandmarks[i][j].y * p.windowHeight
        // );
        // locators[i] = locatorshands;
      }
    }
  };

  p.drawLines = function (index) {
    p.stroke(0, 0, 0);
    p.strokeWeight(2);
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      const size = p.getHandSize(i);
      if (size < 0.3) {
        continue;
      }
      for (let j = 0; j < index.length - 1; j++) {
        let x = detections.multiHandLandmarks[i][index[j]].x * p.windowWidth;
        let y = detections.multiHandLandmarks[i][index[j]].y * p.windowHeight;
        // let z = detections.multiHandLandmarks[i][index[j]].z;

        let _x =
          detections.multiHandLandmarks[i][index[j + 1]].x * p.windowWidth;
        let _y =
          detections.multiHandLandmarks[i][index[j + 1]].y * p.windowHeight;
        // let _z = detections.multiHandLandmarks[i][index[j+1]].z;
        p.line(x, y, _x, _y);
      }
    }
  };
  p.getHandSize = function (handIndex) {
    const lm = detections.multiHandLandmarks[handIndex];
    let minX = 1,
      minY = 1,
      maxX = 0,
      maxY = 0;
    for (let i = 0; i < lm.length; i++) {
      const x = Math.min(Math.max(lm[i].x, 0), 1);
      const y = Math.min(Math.max(lm[i].y, 0), 1);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    const w = maxX - minX;
    const h = maxY - minY;
    return Math.sqrt(w * w + h * h);
  };
};

let myp5 = new p5(sketch);
