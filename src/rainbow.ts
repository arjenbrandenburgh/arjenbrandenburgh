// https://github.com/anomal/RainbowVis-JS/blob/master/rainbowvis.js

type HexColor = string;

class ColourGradient {
  private startColour: HexColor = 'ff0000';
  private endColour: HexColor = '0000ff';
  private minNum: number = 0;
  private maxNum: number = 100;

  setGradient(colourStart: HexColor, colourEnd: HexColor): void {
    this.startColour = colourStart;
    this.endColour = colourEnd;
  }

  setNumberRange(minNumber: number, maxNumber: number): void {
    if (maxNumber > minNumber) {
      this.minNum = minNumber;
      this.maxNum = maxNumber;
    } else {
      throw new RangeError(
        `maxNumber (${maxNumber}) is not greater than minNumber (${minNumber})`
      );
    }
  }

  colourAt(number: number): HexColor {
    return (
      this.calcHex(
        number,
        this.startColour.substring(0, 2),
        this.endColour.substring(0, 2)
      ) +
      this.calcHex(
        number,
        this.startColour.substring(2, 4),
        this.endColour.substring(2, 4)
      ) +
      this.calcHex(
        number,
        this.startColour.substring(4, 6),
        this.endColour.substring(4, 6)
      )
    );
  }

  private calcHex(
    number: number,
    channelStart: string,
    channelEnd: string
  ): string {
    const num = Math.min(Math.max(number, this.minNum), this.maxNum);
    const numRange = this.maxNum - this.minNum;
    const cStart = parseInt(channelStart, 16);
    const cEnd = parseInt(channelEnd, 16);
    const cPerUnit = (cEnd - cStart) / numRange;
    const c = Math.round(cPerUnit * (num - this.minNum) + cStart);
    return this.formatHex(c.toString(16));
  }

  private formatHex(hex: string): string {
    return hex.length === 1 ? '0' + hex : hex;
  }
}

export class Rainbow {
  private gradients: ColourGradient[] | null = null;
  private minNum: number = 0;
  private maxNum: number = 100;
  private colours: HexColor[] = ['ff0000', 'ffff00', '00ff00', '0000ff'];

  constructor() {
    this.setColours(this.colours);
  }

  private setColours(spectrum: HexColor[]): void {
    if (spectrum.length < 2) {
      throw new Error('Rainbow must have two or more colours.');
    } else {
      const increment = (this.maxNum - this.minNum) / (spectrum.length - 1);
      this.gradients = spectrum.slice(0, -1).map((color, i) => {
        const colourGradient = new ColourGradient();
        colourGradient.setGradient(color, spectrum[i + 1]);
        colourGradient.setNumberRange(
          this.minNum + increment * i,
          this.minNum + increment * (i + 1)
        );
        return colourGradient;
      });
      this.colours = spectrum;
    }
  }

  setSpectrum(...args: HexColor[]): Rainbow {
    this.setColours(args);
    return this;
  }

  setSpectrumByArray(array: HexColor[]): Rainbow {
    this.setColours(array);
    return this;
  }

  colourAt(number: number): HexColor {
    if (isNaN(number)) {
      throw new TypeError(`${number} is not a number`);
    } else if (this.gradients && this.gradients.length === 1) {
      return this.gradients[0].colourAt(number);
    } else if (this.gradients) {
      const segment = (this.maxNum - this.minNum) / this.gradients.length;
      const index = Math.min(
        Math.floor((Math.max(number, this.minNum) - this.minNum) / segment),
        this.gradients.length - 1
      );
      return this.gradients[index].colourAt(number);
    } else {
      throw new Error('No gradients available');
    }
  }

  colorAt(number: number): HexColor {
    return this.colourAt(number);
  }

  setNumberRange(minNumber: number, maxNumber: number): Rainbow {
    if (maxNumber > minNumber) {
      this.minNum = minNumber;
      this.maxNum = maxNumber;
      this.setColours(this.colours);
    } else {
      throw new RangeError(
        `maxNumber (${maxNumber}) is not greater than minNumber (${minNumber})`
      );
    }
    return this;
  }
}
