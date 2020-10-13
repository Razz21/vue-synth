class WavePacket {
  constructor(len, height, width) {
    this.time = new Array(len);
    this.amp = new Array(len);
    this.threshold = 0;
    this.len = len;
    this.width = width;
    this.NORMFACTOR = height / 2;
    this.idxTimeFirstCrossing = -1;
  }

  loadData(buffer) {
    for (let i = 0; i < this.len; i++) {
      this.time[i] = i;
      this.amp[i] = buffer[i];
    }
  }

  searchThresholdCrossing() {
    this.idxTimeFirstCrossing = -1; //resets
    for (let i = 0; i < this.len - 1; i++) {
      if (this.amp[i] >= this.threshold && this.amp[i] > this.amp[i + 1]) {
        this.idxTimeFirstCrossing = i;
        return;
      }
    }
  }

  thresholdFound() {
    return this.idxTimeFirstCrossing >= 0;
  }

  shiftWaveBasedOnThreshold() {
    const middlePoint = this.len / 2;

    //If wave did not cross threshold, then define delta time correction as zero
    const deltaTime = this.thresholdFound() ? middlePoint - this.idxTimeFirstCrossing : 0;
    const tempX = new Array(this.len);
    const tempY = new Array(this.len);

    //Create temporal containers with shifted time data
    for (let i = 0; i < this.len; i++) {
      tempX[i] = this.time[i] + deltaTime;
      tempY[i] = this.amp[i];
    }

    for (let i = 0; i < this.len; i++) {
      //Zero original containers
      this.time[i] = 0;
      this.amp[i] = 0;
    }

    //Search for first index
    let idx = 0;
    for (; idx < this.len; idx++) {
      if (tempX[idx] < 0) {
        continue;
      }
      break;
    }
    //Populate arrays with shifted data using temporal holders
    for (let j = idx; j < this.len; j++) {
      this.time[tempX[j]] = tempX[j];
      this.amp[tempX[j]] = tempY[j];
    }
  }
  display(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.moveTo(0, this.amp[0] * this.NORMFACTOR + this.NORMFACTOR);
    for (let i = 1; i < this.len; i++) {
      ctx.lineTo(i, this.amp[i] * this.NORMFACTOR + this.NORMFACTOR);
    }

    ctx.stroke();
    ctx.closePath();
  }
  drawThreshold(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "#00ff00";
    const lineY = this.threshold * this.NORMFACTOR - this.NORMFACTOR;
    ctx.moveTo(0, lineY);
    ctx.lineTo(this.width, lineY);
    ctx.stroke();

    // ctx.closePath();
  }
  printInfo() {
    console.log("Report range: ", Math.min.apply(Math, this.amp), Math.max.apply(Math, this.amp));
    console.log("Report Norm Factor", this.NORMFACTOR);
  }

  static downsample(buffer, targetSize) {
    let index = 0;
    const bufferLen = buffer.length;
    const blockSize = ~~(bufferLen / targetSize);
    const downsampled = new Array(targetSize);
    for (let i = 0; i < targetSize; i++) {
      let A = [];
      let offset = blockSize;
      while (offset > 0) {
        A.push(buffer[index]);
        offset--;
        index++;
      }
      const val = Math.max.apply(Math, A);
      downsampled[i] = val;
    }
    return downsampled;
  }
}

export default WavePacket;
