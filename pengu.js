function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function svgProps(width, height) {
  return Object.entries({
    viewBox: `0 0 ${width} ${height}`,
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "xmlns": "http://www.w3.org/2000/svg",
  }).map(([key, value]) => { return `${key}="${value}"` }).join(" ");
}

function drawPenguBody() {
  return `
      <path style="fill:url(#e);fill-opacity:1;stroke:none" d="M46 570c-1-35-63-374-72-404-15-51-25-63-61-71-25-6-61-7-89 36-17 27-78 347-82 439z" transform="translate(258 -92)"/>
    `
};

function drawPenguEye(eye, settings) {
  // we abuse a single random number for all settings and use bit shifting to get our "settings"
  const eyeSide = settings & 1;
  const eyePupilSide = settings & 2 >> 1;
  const eyeLookSide = settings & 4 >> 2;
  
  // magic below
  const eyeX = eye * 40 + (-1 * eyeSide * 45);
  const pupilX = 155.7 + eyePupilSide * 9; 
  const dot1X = pupilX + -3.5 + eyeLookSide * 6; 
  const dot2X = pupilX + 2 + eyeLookSide * -5;
  return `
    <g style="display:inline" transform="translate(${eyeX} -92)">
      <ellipse style="fill:#eee;fill-opacity:1;stroke:none" cx="160.4" cy="163.4" ry="16.2" rx="14.5"/>
      <ellipse style="fill:#000;fill-opacity:1;stroke:none" cx="${pupilX}" cy="164" rx="8.6" ry="9.5"/>
      <ellipse style="fill:#fff;fill-opacity:1;stroke:none" cx="${dot1X}" cy="162.7" ry="3.5" rx="3.3"/>
      <ellipse style="fill:#fff;fill-opacity:1;stroke:none" cx="${dot2X}" cy="164.9" ry="2.2" rx="2.1"/>
    </g>
    `
};

function drawPenguBeak(beakSide) {
  const transform = beakSide ? "translate(58 -90) scale(-1 1)" : "translate(258 -90)";
  return `
    <path style="fill:#ffa02d;fill-opacity:1;stroke:none" d="M-83 181c0 6 5 14 11 14 16 0 32-6 32-10s-15-17-32-17c-6 0-11 7-11 13z" transform="${transform}"/>
  `
};

// x = the x center of the pengu
// y = the y baseline of the pengu
function drawPengu(x, y, scale) {
  const PENGU_WIDTH = 221;
  const PENGU_HEIGHT = 217;

  // penguWidth = 219 * 
  const penguWidth = PENGU_WIDTH * scale;
  const penguHeight = PENGU_HEIGHT * scale;

  const penguX = x - penguWidth / 2 + penguWidth * 0.1 * Math.random() - penguWidth * 0.05;
  // penguY should be the y + 10% of the scale pengu height. (some variance in the Y direction) 
  const penguY = y + Math.random() * penguHeight * 0.3;

  const eyeOptions = 3; // eyeSide, eyePupilSide, eyeLookSide
  const eyeSettings = Math.floor(Math.random() * Math.pow(2, 3));

  const animDur = 0.6 + Math.floor(Math.random() * 7) / 10;
  const animBegin = Math.random() * -animDur;
  
  return `
  <g style="display:inline" transform="translate(${penguX} ${penguY}) scale(${scale} ${scale})">
    ${drawPenguBody(0)}
    ${drawPenguEye(0, eyeSettings)}
    ${drawPenguEye(1, eyeSettings)}
    ${drawPenguBeak(eyeSettings & 1)}
    <animateMotion
      path="M0,0 0,-5 Z"
      dur="${animDur}"
      begin="${animBegin}"
      repeatCount="indefinite"
      keySplines="
            0.1 0.8 0.2 1;
            0.1 0.8 0.2 1;
            0.1 0.8 0.2 1;
            0.1 0.8 0.2 1;
            0.1 0.8 0.2 1;
            0.1 0.8 0.2 1"
      />
  </g>
`
}

function renderSVG() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const penguWidth = 221;

  const penguHSpacing = penguWidth * 0.91;
  const penguVSpacingBase = 200;

  let remainingHeight = windowHeight * 2/3; // - penguVSpacingBase;
  let yOffset = windowHeight * 1/3;
  let scale = 1;

  let elems = [];

  //generate the row of pengus, starting from the bottom to the top
  while (remainingHeight > -1 * scale * penguVSpacingBase) {
    const scaledHSpacing = penguHSpacing * scale;
    const penguCount = Math.floor(windowWidth / scaledHSpacing) + 3;

    let pengusToAdd = [];

    // offset the row to fill more gaps
    const xOffset = scaledHSpacing * (Math.random() - 1.5);

    for (i = 0; i < penguCount; i++) {
      pengusToAdd.push(drawPengu(xOffset + scaledHSpacing * i, yOffset + remainingHeight, scale))
    }

    // We shuffle so we don't always render left to right
    elems = elems.concat(shuffle(pengusToAdd));
    elems.push(`<rect x="0" y="0" width="${windowWidth}" height="${yOffset + remainingHeight + penguVSpacingBase}" fill="white" fill-opacity="0.02"/>`)
    
    // scale the next row
    remainingHeight -= penguVSpacingBase * scale; 
    scale *= 0.9;

    // safe guard so we don't render to inifinity
    if (penguVSpacingBase * scale < 10) {
      break; 
    }
  }

  // reverse the order of the pengus, we render from back to smallest to largest.
  elems.reverse();

  return `
<svg ${svgProps(windowWidth, windowHeight)}>
  <defs>
     <linearGradient id="a">
      <stop style="stop-color:#3f4354;stop-opacity:1" offset="0"/>
      <stop style="stop-color:#0c0c0c;stop-opacity:1" offset="1"/>
    </linearGradient>
    <linearGradient xlink:href="#a" id="e" x1="-110.1" y1="92.4" x2="-104.7" y2="415.5" gradientUnits="userSpaceOnUse"/>
  </defs>
  <rect x="0" y="0" width="${windowWidth}" height="${windowHeight}" fill="#B3E5FC" />
  <rect x="0" y="${windowHeight * 1/3 - remainingHeight}" width="${windowWidth}" height="${windowHeight * 2/3 + remainingHeight}" fill="#0c0c0c" />
  ${elems.join("\n")}
</svg>
  `;
}

function cloudFilter(id) {
  const seed = Math.floor(Math.random() * 10000);
  return`
    <filter id="cloud-base-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="5" seed="${seed}" />     
      <feDisplacementMap  in="SourceGraphic" scale="120" />
    </filter>
    <filter id="cloud-back-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="${seed}" />     
      <feDisplacementMap  in="SourceGraphic" scale="120" />
    </filter>
    <filter id="cloud-mid-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="${seed}"/>
      <feDisplacementMap  in="SourceGraphic" scale="120" />
    </filter>
    <filter id="cloud-front-${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="4" seed="${seed}"/>
      <feDisplacementMap  in="SourceGraphic" scale="50" />
    </filter>
  `
}

function drawCloud(id, translate, scale, startDelay) {
  return `
    <div class="cloud-container" style="animation-delay: ${startDelay}s; transform: translate(${translate}) scale(${scale})">
      <div class="cloud base" style="filter: url(#cloud-base-${id})"></div>
      <div class="cloud back" style="filter: url(#cloud-back-${id})"></div>
      <div class="cloud mid" style="filter: url(#cloud-mid-${id})"></div>
      <div class="cloud front" style="filter: url(#cloud-front-${id})"></div>
    </div>
  `
}

function renderClouds() {
  // Between 4 and 6 clouds
  const cloudCount = Math.floor(Math.random() * 3) + 4;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const animationLength = 35;

  // Desired window width for full size clouds is 1800px;
  const cloudScale = windowWidth / 1800;

  const filters = []
  const clouds = []

  for (let i = 0; i < cloudCount; i++) {
    // push cloud random seeds
    filters.push(cloudFilter(i));

    // generate the actual clouds
    const cloudX = Math.floor(windowWidth * Math.random());
    const cloudY = Math.floor(windowHeight * 1/4 * Math.random());
    const cloudTranslate = `${cloudX}px, ${cloudY}px`;
    const startDelay = -1 * Math.floor(animationLength * Math.random());

    clouds.push(drawCloud(i, cloudTranslate, cloudScale, startDelay));
  }

  return `
  <div class="clouds">
    <svg width="0" height="0">
      ${filters.join("\n")}
    </svg>
    ${clouds.join("\n")}
  </div>`
}

window.addEventListener("DOMContentLoaded", function() {
  const elem = document.getElementsByClassName("bg")[0];
  elem.innerHTML = `${renderSVG()}${renderClouds()}`;
})
