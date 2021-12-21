//---------------------------- INITALIZE GLOBAL VARIABLES ----------------------

// Scene Objects
var renderer;
var scene;
var camera;
var abe;
var clock = new THREE.Clock();

// Game Play
var collided = false;
var failed = false;
var landed = true;
var landedY = 0;

var gameStarted = false;

var abeSize = 50;
var abeOffsetY = abeSize * 4 / 5;

var platformDistance = 300;
var platformHeight = 30;
var platformDepth = 100;
var platformMaxWidth = 200;
var platformArray = new Array();
var platformGeometry;
var platformMaterial;

var gold4Geometry = new THREE.BoxGeometry(
  30 * 4,
  platformHeight,
  platformDepth);

var gold5Geometry = new THREE.BoxGeometry(
  30 * 5,
  platformHeight,
  platformDepth);

var gold6Geometry = new THREE.BoxGeometry(
  30 * 6,
  platformHeight,
  platformDepth);

var probBad = 0.2;
var probAcid = 0.2;
var probSafe = 0.4;
var probBoost = 0.2;

var g = 1500;
var velocityX = 200;
var velocityConstX = 200;
var velocityY = 0;
var velocityJump = 450;
var jumpCount = 0;
var jumped = false;
var jumpTime = 0;

var timeDelta;
var platformTime = platformDistance / velocityX;
var scoreTime = platformTime;

var score = 0;
var maxScore = 0;

// Game Visual
var width = document.getElementById('game').offsetWidth;
var height = document.getElementById('game').offsetHeight;
var depth = 100;

// Game Colors 
var blackHEX = 000000;
var whiteHEX = 0xffffff;
var brownHEX = 0x8b4513;
var yellowHEX = 0xFFFF00;
var redHEX = 0xFF0000;
var lightBlueHEX = 0xADD8E6;

// Game Textures
var backgroundTexture = THREE.ImageUtils.loadTexture('platforms\\background.png');
backgroundTexture.wrapS = THREE.RepeatWrapping;
var gold4Texture = THREE.ImageUtils.loadTexture('platforms\\gold4.png');
var gold5Texture = THREE.ImageUtils.loadTexture('platforms\\gold5.png');
var gold6Texture = THREE.ImageUtils.loadTexture('platforms\\gold6.png');
var brickTexture = THREE.ImageUtils.loadTexture('platforms\\safe_block.png');
var acidTexture = THREE.ImageUtils.loadTexture('platforms\\acid.png');
var lavaTexture = THREE.ImageUtils.loadTexture('platforms\\laser.png');

var titleMaterial = new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('game_state\\jumpy_abe_title.png') })

var abeMaterials =
  [
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/standing.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run1.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run2.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run3.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run4.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run5.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run6.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run7.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/run8.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/jump1.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/jump2.png'), transparent: true }),
    new THREE.MeshBasicMaterial({ map: new THREE.ImageUtils.loadTexture('poses/jump3.png'), transparent: true })
  ]

// Check frame
var currentPose = 0

//Audio
var music = new Audio('Audio/SuperSexy.mp3');
var coinSound = new Audio('Audio/Coin.wav')
var deathSound = new Audio('Audio/Death_Noise.mp3')
var deathSound2 = new Audio('Audio/i_am_death.wav')
var deathSound3 = new Audio('Audio/bunny_death.mp3')


//----------------------------------- START GAME -------------------------------
function init() {

  renderScene();
  render();
}


//----------------------------------- RENDER SCENE -----------------------------
function renderScene() {

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(width, height);

  camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000);

  scene = new THREE.Scene();
  scene.add(camera);
  camera.position.z = width / 2;

  // var loader = new THREE.TextureLoader();
  // loader.crossOrigin = true;

  //Make Title Card
  var titleWidth = width / 2
  var titleHeight = height / 3

  var titleGeometry = new THREE.BoxGeometry(
    titleWidth,
    titleHeight,
    1);



  titleCard = new THREE.Mesh(
    titleGeometry,
    titleMaterial);

  titleCard.position.y = height / 4;
  titleCard.position.x = - width / 4 + titleWidth / 2;



  scene.add(titleCard);

  // MAKE ABE
  var abeWidth = abeSize;
  var abeHeight = abeSize;
  var abeDepth = abeSize;

  var abeMaterial = abeMaterials[0];

  var abeGeometry = new THREE.BoxGeometry(
    abeWidth,
    abeHeight,
    abeDepth);

  abe = new THREE.Mesh(
    abeGeometry,
    abeMaterial);

  abe.position.y = - height / 2 + abeSize / 2 + abeOffsetY;
  abe.position.x = - width / 3;

  scene.add(abe);

  // MAKE BACKGROUND
  var backgroundWidth = width * 1.7;
  var backgroundHeight = height;

  var backgroundMaterial = new THREE.MeshLambertMaterial({ map: backgroundTexture });
  var backgroundGeometry = new THREE.PlaneBufferGeometry(
    backgroundWidth,
    backgroundHeight);
  var background = new THREE.Mesh(
    backgroundGeometry,
    backgroundMaterial);

  scene.add(background);

  // MAKE LIGHT
  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 100);
  scene.add(light);

  var gameElement = document.getElementById("game");
  gameElement.appendChild(renderer.domElement);

  renderPlatforms();
}

//-------------------------------- RENDER PLATFORMS ----------------------------
function renderPlatforms() {

  for (var i = 0; i < width / platformDistance + 1; i++) {
    var platformWidth = platformMaxWidth * (Math.random() * 0.5 + 0.5);

    platformGeometry = new THREE.BoxGeometry(
      platformWidth,
      platformHeight,
      platformDepth);

    let rand = Math.random();
    let safe = true;
    let boost = false;

    var platform = new THREE.Mesh(
      platformGeometry,
      new THREE.MeshLambertMaterial({ map: brickTexture, transparent: true }));

    platform.position.y = - Math.random() * height / 2 + abeOffsetY * (5 / 4);
    if (rand < probBad) {
      safe = false;
      boost = false;
      platform.material.map = lavaTexture;
    }
    else if (rand < probBad + probAcid) {
      safe = false;
      boost = false;
      platform.material.map = acidTexture;
      platform.position.y = - height / 2 + abeOffsetY * (5 / 4);
    }
    else if (rand < probBad + probAcid + probSafe) {
      safe = true;
      boost = false;
      platform.material.map = brickTexture;
    }
    else {
      var goldRand = Math.random();
      if (goldRand < 0.3333) {
        platform.material.map = gold4Texture;
        platformWidth = 30 * 4;
        platform.geometry = gold4Geometry;
      }
      else if (goldRand < 0.6666) {
        platform.material.map = gold5Texture;
        platformWidth = 30 * 5;
        platform.geometry = gold5Geometry;
      }
      else {
        platform.material.map = gold6Texture;
        platformWidth = 30 * 6;
        platform.geometry = gold6Geometry;
      }
      safe = true;
      boost = true;
      platform.position.y = - Math.random() * height / 4 + abeOffsetY * (5 / 4);
    }

    //spread platforms out 
    platform.position.x = i * platformDistance;

    //put platforms on the same z plane
    platform.position.z = abe.position.z;

    //platform array keeps track of all of the platforms on the screen
    platformArray.push([platform, safe, boost, platformWidth]);
    scene.add(platform);
  }
}

//---------------------------- RENDER/UPDATE EVERYTHING ------------------------
function render() {
  //update the time delta to calculate movements of abe + platforms
  timeDelta = clock.getDelta();

  setTimeout(function () {

    requestAnimationFrame(render);

  }, 1000 / 60);

  //scene is rendered at each time frame
  renderer.render(scene, camera);

  //render() is called for each time frame 
  // requestAnimationFrame(render);


  if (!gameStarted) {
    //the game has not started, the player has not pressed the space bar
    start();
  }
  else if (!collided) {
    //the game is not over, the player has not collided with a box
    backgroundTexture.offset.x += 1 / (velocityX * 4);
    movePlatform();
    moveAbe();
    music.play();
  }
  else if (failed) {
    //the player failed, the game is over
    abe.material.color.setHex(redHEX);
    music.pause();
    restart();
  }
  else {
    //the player collided with a box and is falling, either to the floor or on top of the platform
    abe.material.color.setHex(redHEX);
    fall();
  }
}

//--------------------------------- START GAME ---------------------------------
function start() {
  if (Key.isDown(Key.SPACE)) {
    gameStarted = true;
    titleCard.position.y *= 50
  }
}

//--------------------------------- PAUSE GAME ---------------------------------
function pause() {
  //TODO REPLACE WITH PAUSED TITLE CARD AND UPDATE LOGIC
  if (Key.isDown(Key.ESC)) {
    gameStarted = true;
    titleCard.position.y *= 50
  }
}

//--------------------------------- RESTART GAME -------------------------------
function restart() {
  if (Key.isDown(Key.R)) {
    document.getElementById("score").style.background = 'black';

    abe.position.y = - height / 2 + abeSize / 2 + abeOffsetY;
    abe.material = abeMaterials[0];
    abe.material.color.setHex(whiteHEX);
    titleCard.position.y /= 50

    // space out all of the platforms from the left of the screen
    for (var i = 0; i < platformArray.length; i++) {
      var platform = platformArray[i][0];
      platform.position.x = i * platformDistance;
      platform.position.y = - Math.random() * height / 2 + abeOffsetY * (5 / 4);

      let rand = Math.random();

      if (rand < probBad) {
        platformArray[i][1] = false;
        platformArray[i][2] = false;
        platform.material.map = lavaTexture;
      }
      else if (rand < probBad + probAcid) {
        platformArray[i][1] = false;
        platformArray[i][2] = false;
        platform.material.map = acidTexture;
        platform.position.y = - height / 2 + abeOffsetY * (5 / 4);
      }
      else if (rand < probBad + probAcid + probSafe) {
        platformArray[i][1] = true;
        platformArray[i][2] = false;
        platform.material.map = brickTexture;
      }
      else {
        var goldRand = Math.random();
        if (goldRand < 0.3333) {
          platform.material.map = gold4Texture;
          platformArray[i][3] = 30 * 4;
          platform.geometry = gold4Geometry;
        }
        else if (goldRand < 0.6666) {
          platform.material.map = gold5Texture;
          platformArray[i][3] = 30 * 5;
          platform.geometry = gold5Geometry;
        }
        else {
          platform.material.map = gold6Texture;
          platformArray[i][3] = 30 * 6;
          platform.geometry = gold6Geometry;
        }
        platformArray[i][1] = true;
        platformArray[i][2] = true;
        platform.position.y = - Math.random() * height / 4 + abeOffsetY * (5 / 4);
      }
    }

    //start moving again
    velocityX = velocityConstX;

    //reset variables
    collided = false;
    failed = false;
    gameStarted = false;
    score = 0;
    document.getElementById("score").innerHTML = score;
    document.getElementById("message1").innerHTML = "Go Super Sexy Scientist!";
    document.getElementById("message2").innerHTML = "Press SPACE to jump";
  }
}

//---------------- MOVE THE PLATFORMS AND UPDATE SCORE -------------------------
function movePlatform() {

  var distance = (velocityX * timeDelta);

  //find the x position of the last (right most) platform on the screen
  var maxPositionX = -10000;
  for (var i = 0; i < platformArray.length; i++) {
    var platform = platformArray[i][0];
    if (platform.position.x > maxPositionX) {
      maxPositionX = platform.position.x;
    }
  }

  for (var i = 0; i < platformArray.length; i++) {
    var platform = platformArray[i][0];
    var isSafe = platformArray[i][1];
    var isBoost = platformArray[i][2];
    var platformWidth = platformArray[i][3];

    //if the platform just went off the screen on the left, change the position of the platform that just went off the screen to be at the very right of the screen instead
    if (platform.position.x < - width / 2 - platformWidth / 2) {
      platform.position.x = maxPositionX + platformDistance;
      platform.position.y = - Math.random() * height / 2 + abeOffsetY;
      let rand = Math.random();

      if (rand < probBad) {
        platformArray[i][1] = false;
        platformArray[i][2] = false;
        platform.material.map = lavaTexture;
      }
      else if (rand < probBad + probAcid) {
        platformArray[i][1] = false;
        platformArray[i][2] = false;
        platform.material.map = acidTexture;
        platform.position.y = - height / 2 + abeOffsetY * (5 / 4);
      }
      else if (rand < probBad + probAcid + probSafe) {
        platformArray[i][1] = true;
        platformArray[i][2] = false;
        platform.material.map = brickTexture;
      }
      else {
        var goldRand = Math.random();
        if (goldRand < 0.3333) {
          platform.material.map = gold4Texture;
          platformArray[i][3] = 30 * 4;
          platform.geometry = gold4Geometry;
        }
        else if (goldRand < 0.6666) {
          platform.material.map = gold5Texture;
          platformArray[i][3] = 30 * 5;
          platform.geometry = gold5Geometry;
        }
        else {
          platform.material.map = gold6Texture;
          platformArray[i][3] = 30 * 6;
          platform.geometry = gold6Geometry;
        }
        platformArray[i][1] = true;
        platformArray[i][2] = true;
        platform.position.y = - Math.random() * height / 4 + abeOffsetY * (5 / 4);
      }
      velocityX = velocityX * 1.02
    }


    //keep moving the platforms by the travel distance
    platform.position.x -= distance;

    //check to see if abe has collided with the current platform, either collided with the sides of the platform or the bottom 
    if (abe.position.x < platform.position.x + platformWidth / 2 + abeSize / 2
      && abe.position.x > platform.position.x - platformWidth / 2 - abeSize / 2
      && abe.position.y < platform.position.y + platformHeight / 2 && abe.position.y > platform.position.y - platformHeight / 2 - abeSize / 2 && !isSafe) {
      fall();
      gameOver();
      landed = false;
      landedY = 0;
    }
    else if (abe.position.x < platform.position.x + platformWidth / 2 + abeSize / 2
      && abe.position.x > platform.position.x - platformWidth / 2 - abeSize / 2
      && abe.position.y < platform.position.y + platformHeight / 2 && abe.position.y > platform.position.y && isSafe) {
      fall();
      gameOver();
      landed = false;
      landedY = 0;
    }
    else if (abe.position.x < platform.position.x + platformWidth / 2 + abeSize / 2
      && abe.position.x > platform.position.x - platformWidth / 2 - abeSize / 2
      && abe.position.y < platform.position.y + platformHeight / 2 && abe.position.y > platform.position.y - platformHeight / 2 - abeSize / 2 && isSafe) {
      if (isBoost) {
        score += 0.1;
        coinSound.play();
        score = Math.round(score * 10) / 10
        document.getElementById("score").innerHTML = score;
        document.getElementById("score").style.background = 'gold';
      }
      abe.position.y = platform.position.y - platformHeight / 2 - abeSize / 2;
    }
    else {
      landed = false;
      landedY = 0;
    }

    //check to see if abe has landed on top of the platform. if so, then move laterally on top of the platform.
    if (abe.position.x < platform.position.x + platformWidth / 2
      && abe.position.x > platform.position.x - platformWidth / 2
      && abe.position.y <= platform.position.y + platformHeight / 2 + abeSize / 2 && abe.position.y > platform.position.y - platformHeight / 2 && isSafe) {
      if (isBoost) {
        score += 0.1;
        coinSound.play();
        score = Math.round(score * 10) / 10
        document.getElementById("score").innerHTML = score;
        document.getElementById("score").style.background = 'gold';
      }
      landed = true;
      landedY = platform.position.y + platformHeight / 2 + abeSize / 2;
      moveAbe();
    }
    else if (abe.position.x < platform.position.x + platformWidth / 2
      && abe.position.x > platform.position.x - platformWidth / 2
      && abe.position.y <= platform.position.y + platformHeight / 2 + abeSize / 2 && abe.position.y > platform.position.y - platformHeight / 2 && !isSafe) {
      landed = true;
      landedY = platform.position.y + platformHeight / 2 + abeSize / 2;
      fall();
      gameOver();
    }
    else {
      landed = false;
      landedY = 0;
    }
    //keep track of the current time delta, to make sure the score only updates per each time frame 
    scoreTime += timeDelta;

    //increase the score only when abe has passed this point along the x axis
    var passedPlatformX = platform.position.x + platformWidth / 2 + abeSize;

    //only update the score when abe has either passed this point along the x axis, or ?????? 
    if (passedPlatformX <= abe.position.x + abeSize / 2 && passedPlatformX >= abe.position.x - abeSize / 2) {
      //once we know abe has passed the platform, increase the score
      if (scoreTime >= platformTime) {
        scoreTime = 0;
        score++;
        document.getElementById("score").innerHTML = score;
        document.getElementById("score").style.background = 'black';
        if (score < 10) {
          document.getElementById("message1").innerHTML = "Keep going!";
        }
        else if (score >= 10 && score < 20) {
          document.getElementById("message1").innerHTML = "You're pretty okay at this!";
        }
        else if (score >= 20 && score < 50) {
          document.getElementById("message1").innerHTML = "Woah alright!";
        }
        else if (score >= 50 && score < 100) {
          document.getElementById("message1").innerHTML = "Dang you're good!";
        }
        else if (score >= 100) {
          document.getElementById("message1").innerHTML = "What a run - keep it going!";
        }
      }
    }
  }
}


//--------------------------------- MOVE ABE -----------------------------------
function moveAbe() {
  //when the space bar is pressed, abe is jumping and so his y velocity is his jump velocity
  if (Key.isDown(Key.SPACE) && jumpCount < 2 && jumpTime < 10) {
    velocityY = velocityJump;
    //abe's position is affected by his upwards velocity as well as the pull of gravity 
    abe.position.y += Math.ceil(timeDelta * velocityY - g * timeDelta * timeDelta / 2);
    jumped = true;
    jumpTime += 1;
  }
  // abe has landed on a platform
  else if (landed == true) {
    velocityY = 0;
    abe.position.y = landedY;
    jumpCount = 0;
    jumpTime = 0;
  }
  // abe is on the floor 
  else if (abe.position.y <= -height / 2 + abeSize / 2 + abeOffsetY) {
    abe.position.y = -height / 2 + abeSize / 2 + abeOffsetY;
    velocityY = 0;
    jumpCount = 0;
    jumpTime = 0;
  }
  //when the space bar is not pressed, abe is in free fall and so his y velocity is the acceleration of gravity
  else {
    if (jumped) {
      jumpCount += 1;
    }
    jumped = false;
    velocityY -= g * timeDelta;
    abe.position.y += Math.ceil(timeDelta * velocityY);
    jumpTime = 0;
  }

  //abe is on the ceiling and the second the space bar is not pressed, velocity is 0 so that abe will immediately start falling
  if (abe.position.y > height / 2 - abeSize / 2) {
    abe.position.y = height / 2 - abeSize / 2;
    velocityY = 0;
    jumpTime = 0;
  }

  // change Material
  if (Key.isDown(Key.SPACE)) {
    var newPose = 9
  }
  else {
    var newPose = parseInt(currentPose / 8) % 7 + 1;
  }
  currentPose = currentPose + 1;
  abe.material = abeMaterials[newPose];
  abe.material.color.setHex(whiteHEX);

}

//----------------------- ABE COLLIDED W A PLATFORM ----------------------------
function gameOver() {
  collided = true;
  var deathsoundtrack = [deathSound, deathSound2, deathSound3];
  death = deathsoundtrack[Math.floor(Math.random() * deathsoundtrack.length)]
  death.play();

  abe.material.color.setHex(redHEX);
  document.getElementById("score").style.background = 'black';
  if (score >= maxScore) {
    maxScore = score;
    document.getElementById("maxScore").innerHTML = maxScore;
  }
  velocityY = 0;
  velocityX = 0;
  document.getElementById("message1").innerHTML = "Game Over";
  document.getElementById("message2").innerHTML = "Press R to restart";
  abe.material = abeMaterials[10];
  abe.material.color.setHex(redHEX);
}

//------------- ABE COLLIDED W A PLATFORM AND IS NOW FALLING -------------------
function fall() {
  abe.position.y += Math.ceil(timeDelta * velocityY);
  velocityY -= g * timeDelta;

  //abe will fall and land on the ground
  if (abe.position.y < -height / 2 + abeSize / 2) {
    abe.position.y = -height / 2 + abeSize / 2;
    failed = true;
    abe.material.color.setHex(redHEX);
  }

  if (landed) {
    abe.position.y = landedY;
    failed = true;
    abe.material.color.setHex(redHEX);
  }

  //abe hits the top of a platform from the bottom and then starts falling
  for (var i = 0; i < platformArray.length; i++) {
    var platform = platformArray[i][0];
    var platformWidth = platformArray[i][3];

    if (abe.position.x < platform.position.x + platformWidth / 2 + abeSize / 4
      && abe.position.x > platform.position.x - platformWidth / 2 - abeSize / 4 && abe.position.y < platform.position.y + platformHeight / 2 + abeSize / 2 && abe.position.y >= platform.position.y - platformHeight / 2 - abeSize / 2 && platform.position.y - platformHeight / 2 - abeSize / 2 > -height / 2 + abeSize / 2 && !landed) {
      abe.position.y = platform.position.y - platformHeight / 2 - abeSize / 2
      break;
    }
  }
}