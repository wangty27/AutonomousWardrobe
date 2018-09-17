# AutonomousWardrobe
* A web app that scans and saves user uploaded clothing pictures to give them suggestions based on color combination and weather conditions
* Developed at Hack The North 2018
* Used [IBM Watson Visual Recognition API](https://www.ibm.com/watson/services/visual-recognition/) to extract the type (Upper/Bottom, Spring/Summer/Fall/Winter, Casual/Formal) of the clothing from the picture
* Used [huey](https://github.com/michaelrhodes/huey) to extract the RGB value of the dominant color
* Used [brain.js](https://github.com/BrainJS/brain.js) to create a simple neural network for suggesting color combination based on RGB value
* Built with Express.js as back-end framework, MongoDB as database, Handlebars.js as view engine, and Bootstrap 4 as front-end framework
