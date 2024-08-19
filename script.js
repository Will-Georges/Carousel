const container = document.querySelector(".outer-container");
const carouselContainer = container.querySelector(".carousel-container");
const carousel = container.querySelector(".carousel");
const carouselItems = carousel.querySelectorAll(".carousel-item");

let isMouseDown = false;
let currentMousePos = 0;
let lastMousePos = 0;
let lastMoveTo = 0;
let moveTo = 0;

const createCarousel = () => {
  const carouselProps = onResize();
  const length = carouselItems.length;
  const degrees = 360 / length;
  const gap = window.innerWidth <= 400 ? 10 : 20; 
  const tz = distanceZ(carouselProps.w, length, gap);

  const fov = calculateFov(carouselProps);
  const height = Math.max(150, calculateHeight(tz)); // Ensure minimum height
  const width = Math.max(200, carouselProps.w); // Ensure minimum width

  container.style.width = width + "px";
  container.style.height = height + "px";

  carouselItems.forEach((item, i) => {
    const degreesByItem = degrees * i + "deg";
    item.style.setProperty("--rotatey", degreesByItem);
    item.style.setProperty("--tz", tz + "px");
  });
};

// Helper function to smooth out movement (linear interpolation)
const lerp = (a, b, n) => (1 - n) * b + n * a;

const distanceZ = (widthElement, length, gap) => {
  return widthElement / 2 / Math.tan(Math.PI / length) + gap;
};

const calculateHeight = (z) => {
  const t = Math.atan((90 * Math.PI) / 180 / 2);
  const height = t * 2 * z;

  return height;
};

const calculateFov = (carouselProps) => {
  const perspective = window
    .getComputedStyle(carouselContainer)
    .perspective.split("px")[0];

  const length =
    Math.sqrt(carouselProps.w * carouselProps.w) +
    Math.sqrt(carouselProps.h * carouselProps.h);
  const fov = 2 * Math.atan(length / (2 * perspective)) * (180 / Math.PI);
  return fov;
};

const getPosX = (x) => {
  currentMousePos = x;

  // Determine the direction of the swipe
  const rotationSensitivity = window.innerWidth <= 400 ? 1 : 2; // Adjust sensitivity for narrow screens

  // Update moveTo based on direction of the swipe
  if (currentMousePos < lastMousePos) {
    // Swiping left
    moveTo -= rotationSensitivity;
  } else if (currentMousePos > lastMousePos) {
    // Swiping right
    moveTo += rotationSensitivity;
  }

  lastMousePos = currentMousePos;
};

const update = () => {
  lastMoveTo = lerp(moveTo, lastMoveTo, 0.05);
  carousel.style.setProperty("--rotatey", `${lastMoveTo}deg`);

  requestAnimationFrame(update);
};

const onResize = () => {
  const boundingCarousel = carouselContainer.getBoundingClientRect();

  const carouselProps = {
    w: boundingCarousel.width,
    h: boundingCarousel.height,
  };

  return carouselProps;
};

const initEvents = () => {
  carousel.addEventListener("mousedown", () => {
    isMouseDown = true;
    carousel.style.cursor = "grabbing";
  });
  carousel.addEventListener("mouseup", () => {
    isMouseDown = false;
    carousel.style.cursor = "grab";
  });
  container.addEventListener("mouseleave", () => (isMouseDown = false));

  carousel.addEventListener(
    "mousemove",
    (e) => isMouseDown && getPosX(e.clientX)
  );

  carousel.addEventListener("touchstart", () => {
    isMouseDown = true;
    carousel.style.cursor = "grabbing";
  });
  carousel.addEventListener("touchend", () => {
    isMouseDown = false;
    carousel.style.cursor = "grab";
  });
  container.addEventListener(
    "touchmove",
    (e) => isMouseDown && getPosX(e.touches[0].clientX)
  );

  window.addEventListener("resize", createCarousel);

  update();
  createCarousel();
};

initEvents();