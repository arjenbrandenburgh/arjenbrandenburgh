// https://github.com/anomal/RainbowVis-JS/blob/master/rainbowvis.js

export function Rainbow() {
  let gradients = null;
  let minNum = 0;
  let maxNum = 100;
  let colours = ['ff0000', 'ffff00', '00ff00', '0000ff'];
  setColours(colours);

  function setColours(spectrum) {
    if (spectrum.length < 2) {
      throw new Error('Rainbow must have two or more colours.');
    } else {
      const increment = (maxNum - minNum) / (spectrum.length - 1);
      const firstGradient = new ColourGradient();
      firstGradient.setGradient(spectrum[0], spectrum[1]);
      firstGradient.setNumberRange(minNum, minNum + increment);
      gradients = [firstGradient];

      for (let i = 1; i < spectrum.length - 1; i++) {
        const colourGradient = new ColourGradient();
        colourGradient.setGradient(spectrum[i], spectrum[i + 1]);
        colourGradient.setNumberRange(
          minNum + increment * i,
          minNum + increment * (i + 1)
        );
        gradients[i] = colourGradient;
      }

      colours = spectrum;
    }
  }

  this.setSpectrum = function () {
    setColours(arguments);
    return this;
  };

  this.setSpectrumByArray = function (array) {
    setColours(array);
    return this;
  };

  this.colourAt = function (number) {
    if (isNaN(number)) {
      throw new TypeError(`${number} is not a number`);
    } else if (gradients.length === 1) {
      return gradients[0].colourAt(number);
    } else {
      const segment = (maxNum - minNum) / gradients.length;
      const index = Math.min(
        Math.floor((Math.max(number, minNum) - minNum) / segment),
        gradients.length - 1
      );
      return gradients[index].colourAt(number);
    }
  };

  this.colorAt = this.colourAt;

  this.setNumberRange = function (minNumber, maxNumber) {
    if (maxNumber > minNumber) {
      minNum = minNumber;
      maxNum = maxNumber;
      setColours(colours);
    } else {
      throw new RangeError(
        `maxNumber (${maxNumber}) is not greater than minNumber (${minNumber})`
      );
    }
    return this;
  };
}

function ColourGradient() {
  let startColour = 'ff0000';
  let endColour = '0000ff';
  let minNum = 0;
  let maxNum = 100;

  this.setGradient = (colourStart, colourEnd) => {
    startColour = colourStart;
    endColour = colourEnd;
  };

  this.setNumberRange = (minNumber, maxNumber) => {
    if (maxNumber > minNumber) {
      minNum = minNumber;
      maxNum = maxNumber;
    } else {
      throw new RangeError(
        `maxNumber (${maxNumber}) is not greater than minNumber (${minNumber})`
      );
    }
  };

  this.colourAt = number =>
    calcHex(number, startColour.substring(0, 2), endColour.substring(0, 2)) +
    calcHex(number, startColour.substring(2, 4), endColour.substring(2, 4)) +
    calcHex(number, startColour.substring(4, 6), endColour.substring(4, 6));

  function calcHex(number, channelStart_Base16, channelEnd_Base16) {
    let num = number;
    if (num < minNum) {
      num = minNum;
    }
    if (num > maxNum) {
      num = maxNum;
    }
    const numRange = maxNum - minNum;
    const cStart_Base10 = parseInt(channelStart_Base16, 16);
    const cEnd_Base10 = parseInt(channelEnd_Base16, 16);
    const cPerUnit = (cEnd_Base10 - cStart_Base10) / numRange;
    const c_Base10 = Math.round(cPerUnit * (num - minNum) + cStart_Base10);
    return formatHex(c_Base10.toString(16));
  }

  function formatHex(hex) {
    if (hex.length === 1) {
      return '0' + hex;
    } else {
      return hex;
    }
  }
}
