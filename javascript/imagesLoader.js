
"use strict"

// ================================================================================================
// Files
// ================================================================================================
const Artworks = {

   tile: {
      // src: "images/tiles/GroundTiles.png",
      src: "images/tiles/TestTiles.png",
      size: 200,
   },

   tree: {
      src: "images/tiles/tree_0.png",
      size: 186,
      offsetX: 99,
      offsetY: 170,
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