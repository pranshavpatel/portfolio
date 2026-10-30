// Values the prototype exposed as Tweaks. Change them here.
export const config = {
  showPreloader: true,
  smoothScroll: true,
  // One of: shards, glitter, cosmos, rainbow, stars, bursts, swirl, gold
  holoPreset: 'shards',
  holoIntensity: 0.5
};

export const asset = path => import.meta.env.BASE_URL + path;
