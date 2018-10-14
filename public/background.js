import {getBrightness} from "./player.js";

export function splash({
                         hue = Math.floor(Math.random() * 360),
                         brightness = getBrightness()
                       } = {}) {
  const el = $(createSplash());
  const img = el.find('img');
  const x = window.innerHeight * Math.random();
  const y = window.innerHeight * Math.random();
  const rot = Math.random() * 360;

  el.css({transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`});
  img.css({filter: `sepia(100%) saturate(10000%) hue-rotate(${hue}deg) brightness(${brightness}%)`});
  $('.splash-list').append(el);
}

function createSplash() {
  const id = Math.floor(Math.random() * 7) + 1;
  const container = `<div class="splash-container">{splash}</div>`;
  const splashes = [`<img src="/public/brush-stroke-banner-${id}.png"/>`];
  return container.replace('{splash}', splashes[0]);
}

for(let i = 0; i < 10; i++){
  splash();
}
