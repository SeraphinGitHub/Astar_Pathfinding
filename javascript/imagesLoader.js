
"use strict"

// ================================================================================================
// Files
// ================================================================================================
const Artworks = {

   tile: {
      // src: "images/GroundTiles.png",
      src: "images/TestTiles.png",
      size: 200,
   },
   
   barracks: {
      src: "images/barracks.png",
      size: 510,
      scale: 0.65,
      offsetX: 250,
      offsetY: 450,

      colors: {
         none: 0,
         blue: 1,
         green: 2,
         orange: 3,
         violet: 4,
         red: 5,
         yellow: 6,
      }
   },

   tree: {
      src: "images/tree.png",
      size: 186,
      offsetX: 97,
      offsetY: 158,
   },

   grass: {
      src: "images/isometric_0014.png",
      size: 1024,
      offsetX: 0,
      offsetY: 0,
   },
};


// ================================================================================================
// Load files
// ================================================================================================
const loadImages = () =>{

   for(let i in Artworks) {
      let file = Artworks[i];
   
      file["img"] = new Image();
      file.img.src = file.src;
   }
}