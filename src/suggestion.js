const fs = require('fs');
const path = require('path');
const brain = require('brain.js');

class SuggestionAI {
  constructor() {
    this.net = new brain.NeuralNetwork({
      binaryThresh: 0.5,
      hiddenLayers: [3],
      activation: 'sigmoid'
    });
  }
  async init() {
    const colorList = [
      /* white - white: */{input: {r: 1, g: 1, b: 1, r2: 0, g2: 0, b2: 0}, output: {bad: 1}},
      /* white - black: */{input: {r: 1, g: 1, b: 1, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* white - red: */{input: {r: 1, g: 1, b: 1, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* white - blue: */{input: {r: 1, g: 1, b: 1, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* white - purple: */{input: {r: 1, g: 1, b: 1, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* white - yellow: */{input: {r: 1, g: 1, b: 1, r2: 1, g2: 1, b2: 0}, output: {good: 1}},
      /* white - orange: */{input: {r: 1, g: 1, b: 1, r2: 1, g2: 0.65, b2: 0}, output: {good: 1}},
      /* white - brown: */{input: {r: 1, g: 1, b: 1, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* white - gray: */{input: {r: 1, g: 1, b: 1, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* white - pink: */{input: {r: 1, g: 1, b: 1, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* black - white: */{input: {r: 1, g: 0, b: 0, r2: 0, g2: 0, b2: 0}, output: {bad: 1}},
      /* black - black: */{input: {r: 1, g: 0, b: 0, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* black - red: */{input: {r: 1, g: 0, b: 0, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* black - blue: */{input: {r: 1, g: 0, b: 0, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* black - purple: */{input: {r: 1, g: 0, b: 0, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* black - yellow: */{input: {r: 1, g: 0, b: 0, r2: 1, g2: 1, b2: 0}, output: {bad: 1}},
      /* black - orange: */{input: {r: 1, g: 0, b: 0, r2: 1, g2: 0.65, b2: 0}, output: {good: 1}},
      /* black - brown: */{input: {r: 1, g: 0, b: 0, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* black - gray: */{input: {r: 1, g: 0, b: 0, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* black - pink: */{input: {r: 1, g: 0, b: 0, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* red - white: */{input: {r: 0, g: 1, b: 0, r2: 0, g2: 0, b2: 0}, output: {good: 1}},
      /* red - black: */{input: {r: 0, g: 1, b: 0, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* red - red: */{input: {r: 0, g: 1, b: 0, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* red - blue: */{input: {r: 0, g: 1, b: 0, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* red - purple: */{input: {r: 0, g: 1, b: 0, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* red - yellow: */{input: {r: 0, g: 1, b: 0, r2: 1, g2: 1, b2: 0}, output: {bad: 1}},
      /* red - orange: */{input: {r: 0, g: 1, b: 0, r2: 1, g2: 0.65, b2: 0}, output: {bad: 1}},
      /* red - brown: */{input: {r: 0, g: 1, b: 0, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* red - gray: */{input: {r: 0, g: 1, b: 0, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* red - pink: */{input: {r: 0, g: 1, b: 0, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* blue - white: */{input: {r: 0, g: 0, b: 1, r2: 0, g2: 0, b2: 0}, output: {good: 1}},
      /* blue - black: */{input: {r: 0, g: 0, b: 1, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* blue - red: */{input: {r: 0, g: 0, b: 1, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* blue - blue: */{input: {r: 0, g: 0, b: 1, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* blue - purple: */{input: {r: 0, g: 0, b: 1, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* blue - yellow: */{input: {r: 0, g: 0, b: 1, r2: 1, g2: 1, b2: 0}, output: {good: 1}},
      /* blue - orange: */{input: {r: 0, g: 0, b: 1, r2: 1, g2: 0.65, b2: 0}, output: {good: 1}},
      /* blue - brown: */{input: {r: 0, g: 0, b: 1, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* blue - gray: */{input: {r: 0, g: 0, b: 1, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* blue - pink: */{input: {r: 0, g: 0, b: 1, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* purple - white: */{input: {r: 0.5, g: 0, b: 0.5, r2: 0, g2: 0, b2: 0}, output: {good: 1}},
      /* purple - black: */{input: {r: 0.5, g: 0, b: 0.5, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* purple - red: */{input: {r: 0.5, g: 0, b: 0.5, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* purple - blue: */{input: {r: 0.5, g: 0, b: 0.5, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* purple - purple: */{input: {r: 0.5, g: 0, b: 0.5, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* purple - yellow: */{input: {r: 0.5, g: 0, b: 0.5, r2: 1, g2: 1, b2: 0}, output: {bad: 1}},
      /* purple - orange: */{input: {r: 0.5, g: 0, b: 0.5, r2: 1, g2: 0.65, b2: 0}, output: {bad: 1}},
      /* purple - brown: */{input: {r: 0.5, g: 0, b: 0.5, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* purple - gray: */{input: {r: 0.5, g: 0, b: 0.5, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* purple - pink: */{input: {r: 0.5, g: 0, b: 0.5, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* yellow - white: */{input: {r: 1, g: 1, b: 0, r2: 0, g2: 0, b2: 0}, output: {good: 1}},
      /* yellow - black: */{input: {r: 1, g: 1, b: 0, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* yellow - red: */{input: {r: 1, g: 1, b: 0, r2: 0, g2: 1, b2: 0}, output: {good: 1}},
      /* yellow - blue: */{input: {r: 1, g: 1, b: 0, r2: 0, g2: 0, b2: 1}, output: {good: 1}},
      /* yellow - purple: */{input: {r: 1, g: 1, b: 0, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* yellow - yellow: */{input: {r: 1, g: 1, b: 0, r2: 1, g2: 1, b2: 0}, output: {bad: 1}},
      /* yellow - orange: */{input: {r: 1, g: 1, b: 0, r2: 1, g2: 0.65, b2: 0}, output: {bad: 1}},
      /* yellow - brown: */{input: {r: 1, g: 1, b: 0, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* yellow - gray: */{input: {r: 1, g: 1, b: 0, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* yellow - pink: */{input: {r: 1, g: 1, b: 0, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* orange - white: */{input: {r: 1, g: 0.65, b: 0, r2: 0, g2: 0, b2: 0}, output: {good: 1}},
      /* orange - black: */{input: {r: 1, g: 0.65, b: 0, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* orange - red: */{input: {r: 1, g: 0.65, b: 0, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* orange - blue: */{input: {r: 1, g: 0.65, b: 0, r2: 0, g2: 0, b2: 1}, output: {good: 1}},
      /* orange - purple: */{input: {r: 1, g: 0.65, b: 0, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* orange - yellow: */{input: {r: 1, g: 0.65, b: 0, r2: 1, g2: 1, b2: 0}, output: {bad: 1}},
      /* orange - orange: */{input: {r: 1, g: 0.65, b: 0, r2: 1, g2: 0.65, b2: 0}, output: {bad: 1}},
      /* orange - brown: */{input: {r: 1, g: 0.65, b: 0, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* orange - gray: */{input: {r: 1, g: 0.65, b: 0, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* orange - pink: */{input: {r: 1, g: 0.65, b: 0, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* brown - white: */{input: {r: 0.65, g: 0.16, b: 0.16, r2: 0, g2: 0, b2: 0}, output: {bad: 1}},
      /* brown - black: */{input: {r: 0.65, g: 0.16, b: 0.16, g2: 0, b2: 0}, output: {bad: 1}},
      /* brown - red: */{input: {r: 0.65, g: 0.16, b: 0.16, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* brown - blue: */{input: {r: 0.65, g: 0.16, b: 0.16, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* brown - purple: */{input: {r: 0.65, g: 0.16, b: 0.16, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* brown - yellow: */{input: {r: 0.65, g: 0.16, b: 0.16, g2: 1, b2: 0}, output: {bad: 1}},
      /* brown - orange: */{input: {r: 0.65, g: 0.16, b: 0.16, g2: 0.65, b2: 0}, output: {bad: 1}},
      /* brown - brown: */{input: {r: 0.65, g: 0.16, b: 0.16, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* brown - gray: */{input: {r: 0.65, g: 0.16, b: 0.16, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* brown - pink: */{input: {r: 0.65, g: 0.16, b: 0.16, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* gray - white: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 0, g2: 0, b2: 0}, output: {good: 1}},
      /* gray - black: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* gray - red: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* gray - blue: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* gray - purple: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* gray - yellow: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 1, g2: 1, b2: 0}, output: {good: 1}},
      /* gray - orange: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 1, g2: 0.65, b2: 0}, output: {bad: 1}},
      /* gray - brown: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 0.65, g2: 0.16, b2: 0.16}, output: {bad: 1}},
      /* gray - gray: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* gray - pink: */{input: {r: 0.5, g: 0.5, b: 0.5, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},

      /* pink - white: */{input: {r: 1, g: 0.75, b: 0.79, r2: 0, g2: 0, b2: 0}, output: {good: 1}},
      /* pink - black: */{input: {r: 1, g: 0.75, b: 0.79, r2: 1, g2: 0, b2: 0}, output: {good: 1}},
      /* pink - red: */{input: {r: 1, g: 0.75, b: 0.79, r2: 0, g2: 1, b2: 0}, output: {bad: 1}},
      /* pink - blue: */{input: {r: 1, g: 0.75, b: 0.79, r2: 0, g2: 0, b2: 1}, output: {bad: 1}},
      /* pink - purple: */{input: {r: 1, g: 0.75, b: 0.79, r2: 0.5, g2: 0, b2: 0.5}, output: {bad: 1}},
      /* pink - yellow: */{input: {r: 1, g: 0.75, b: 0.79, r2: 1, g2: 1, b2: 0}, output: {bad: 1}},
      /* pink - orange: */{input: {r: 1, g: 0.75, b: 0.79, r2: 1, g2: 0.65, b2: 0}, output: {bad: 1}},
      /* pink - brown: */{input: {r: 1, g: 0.75, b: 0.79, r2: 0.65, g2: 0.16, b2: 0.16}, output: {good: 1}},
      /* pink - gray: */{input: {r: 1, g: 0.75, b: 0.79, r2: 0.5, g2: 0.5, b2: 0.5}, output: {good: 1}},
      /* pink - pink: */{input: {r: 1, g: 0.75, b: 0.79, r2: 1, g2: 0.75, b2: 0.79}, output: {bad: 1}},
    ];
    await this.net.train(colorList);
    console.log('trainning finished')
  }
  suggest(rgbPair){
    return this.net.run(rgbPair);
  }
}

module.exports = SuggestionAI;
// var ai = new SuggestionAI();
// ai.init();
// var out1 = ai.suggest({r: 0.9, g:0.89, b:0.8, r2:0.8, g2:0.23, b2: 0.12});
// var out2 = ai.suggest({r: 0.9, g:0.89, b:0.8, r2:0.6, g2:0.5, b2: 0.12});
// var out3 = ai.suggest({r: 0.9, g:0.89, b:0.8, r2:0.5, g2:0.23, b2: 0.12});
// var out4 = ai.suggest({r: 0.9, g:0.89, b:0.8, r2:0.12, g2:0.23, b2: 0.52});
// var out5 = ai.suggest({r: 0.9, g:0.89, b:0.8, r2:0.8, g2:0.23, b2: 0.82});
// console.log(out1);
// console.log(out2);
// console.log(out3);
// console.log(out4);
// console.log(out5);
