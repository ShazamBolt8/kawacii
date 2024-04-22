let imagePreview = document.getElementById("imagePreview");
let imagePicker = document.getElementById("imagePicker");
let output = document.getElementById("output");
let stats = document.getElementById("stats");

let characterArrayInput = document.getElementById("characterArrayInput");

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d", { willReadFrequently: "true" });

let heightBar = document.getElementById("heightBar");
let widthBar = document.getElementById("widthBar");
let dimensionBars = [heightBar, widthBar];

let copyTextBtn = document.getElementById("copyTextBtn");

let fontButtons = [...document.querySelectorAll(".fontBtn")];

let defaults = {
  height: 99,
  width: 337,
  imageUrl: "assets/logo.jpg",
  characterArray: [" ", "░", "▒", "▓", "█"],
  fontSize: 0.4,
};

let core = {
  desiredHeight: null,
  desiredWidth: null,
  image: null,
  imageData: null,
  canvas: canvas,
  ctx: ctx,
  asciiRepresentation: null,
  characterArray: [],
  fontSize: null,
};

function setHeightAndWidth(height, width) {
  core.desiredHeight = height;
  core.desiredWidth = width;
  heightBar.value = core.desiredHeight;
  widthBar.value = core.desiredWidth;
}

function setCharacterArray(array) {
  core.characterArray = array;
  characterArrayInput.value = core.characterArray.join("");
}

function setFontSize(size) {
  core.fontSize = size;
  core.fontSize = Math.round(core.fontSize * 10) / 10;
}

async function getImageFromURL(url) {
  return new Promise((resolve) => {
    let img = new Image();
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
  });
}

function getImageFromInput(event) {
  setImage(event.target.files[0]);
}

function setImage(image) {
  if (image instanceof HTMLImageElement) core.image = image.src;
  if (image instanceof File) core.image = URL.createObjectURL(image);
}

async function resolveImage() {
  return new Promise((resolve) => {
    imagePreview.src = core.image;
    imagePreview.onload = () => {
      core.canvas.height = imagePreview.height;
      core.canvas.width = imagePreview.width;
      core.ctx.drawImage(imagePreview, 0, 0, imagePreview.width, imagePreview.height);
      core.imageData = core.ctx.getImageData(0, 0, core.canvas.width, core.canvas.height).data;
      resolve(core.imageData);
    };
  });
}

function generateAsciiFromImage() {
  if (core.characterArray.length < 2) return;
  core.asciiRepresentation = "";
  for (let y = 0; y < core.desiredHeight; y++) {
    let row = "";
    for (let x = 0; x < core.desiredWidth; x++) {
      let originalX = Math.floor((x / core.desiredWidth) * core.canvas.width);
      let originalY = Math.floor((y / core.desiredHeight) * core.canvas.height);
      let p = (originalY * core.canvas.width + originalX) * 4;
      let pixel = {
        r: core.imageData[p],
        g: core.imageData[p + 1],
        b: core.imageData[p + 2],
        a: core.imageData[p + 3],
      };
      let brightness = (pixel.r + pixel.g + pixel.b) / 3;
      let characterIndex = Math.max(
        0,
        Math.floor((brightness / 255) * core.characterArray.length) - 1,
      );
      row += core.characterArray[characterIndex];
    }
    core.asciiRepresentation += `${row}\n`;
  }
}

function displayAscii() {
  output.style.fontSize = `${core.fontSize}em`;
  output.innerHTML = core.asciiRepresentation;
}

function setStats() {
  stats.innerText = `Characters: ${core.asciiRepresentation.length}\nWidth: ${core.desiredWidth}\nHeight: ${core.desiredHeight}\nFont Size: ${core.fontSize}em`;
}

function copyToClipboard(text) {
  let temp = document.createElement("textarea");
  var brRegex = /<br\s*[\/]?>/gi;
  document.body.append(temp);
  temp.value = text.replace(brRegex, "\r\n");
  temp.select();
  document.execCommand("copy");
  temp.remove();
}

function refreshInterfaceAndRender() {
  generateAsciiFromImage();
  displayAscii();
  setStats();
}

copyTextBtn.addEventListener("click", () => {
  copyToClipboard(core.asciiRepresentation);
  copyTextBtn.value = "Copied!";
  setTimeout(() => {
    copyTextBtn.value = "Copy";
  }, 2000);
});

imagePicker.addEventListener("input", async (e) => {
  await getImageFromInput(e);
  await resolveImage();
  refreshInterfaceAndRender();
});

dimensionBars.forEach((bar) => {
  bar.addEventListener("input", () => {
    setHeightAndWidth(heightBar.value, widthBar.value);
    refreshInterfaceAndRender();
  });
});

fontButtons[0].addEventListener("click", () => {
  setFontSize((core.fontSize += 0.1));
  refreshInterfaceAndRender();
});

fontButtons[1].addEventListener("click", () => {
  if (core.fontSize <= 0.4) return;
  setFontSize((core.fontSize -= 0.1));
  refreshInterfaceAndRender();
});

characterArrayInput.addEventListener("input", () => {
  setCharacterArray([...characterArrayInput.value]);
  refreshInterfaceAndRender();
});

async function initialize() {
  let image = await getImageFromURL(defaults.imageUrl);
  setImage(image);
  setFontSize(defaults.fontSize);
  setCharacterArray(defaults.characterArray);
  setHeightAndWidth(defaults.height, defaults.width);
  await resolveImage();
  refreshInterfaceAndRender();
}

await initialize();
