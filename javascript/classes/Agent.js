
"use strict"

// =====================================================================
// Agent Class
// =====================================================================
class Agent {
   constructor(ctx, startPoint, endPoint, isEuclidean) {

      this.ctx = ctx;
      this.startPoint = startPoint; // { x: 123, y: 123 }
      this.endPoint = endPoint;     // { x: 123, y: 123 }
      this.openList = [];
      this.closedList = [];
      this.path = [];
      this.isEuclidean = isEuclidean; // Can move diagonally if "true"
   }

   calcHeuristic() {

      let distX = Math.abs(this.endPoint.x -this.startPoint.x);
      let distY = Math.abs(this.endPoint.y -this.startPoint.y);
      let hypotenuse = Math.sqrt(distX * distX + distY * distY);

      if(!this.isEuclidean) return distX + distY;
      else return hypotenuse;
   }

   drawHitbox(boxSize) {

      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(
         this.startPoint.x -boxSize /2,
         this.startPoint.y -boxSize /2,
         boxSize,
         boxSize
      );
   }
}