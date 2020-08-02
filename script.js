
let rows = 25;
let cols = 25;
let grid = [];

let uiBoard = document.querySelector(".board");
let btnStart = document.querySelector(".button__start");
let btnEnd = document.querySelector(".button__end");
let btnReset = document.querySelector(".button__reset");
let btnFind = document.querySelector(".button__find");
let btnAll = document.querySelectorAll("button");

//openset will contain unevaluated neighbouring nodes, closedset will contain evaluated nodes
let openSet = [];
let closedSet = [];

//this is for mapping out the final (shortest) path when all nodes have been evaluated
let path = [];

let startNode;
let endNode;
let currentNode;
let walls = [];


// ------------------------------------ SETTING UP UI ------------------------------------ //


for (let i = 0; i < rows; i++) {
    let tempArr = [];
    for (let j = 0; j < cols; j++) {
        tempArr.push('.');
    }
    grid.push(tempArr);
}


for (let i = 0; i < rows; i++) {
    newRow = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
        let newBox = document.createElement("td");
        newBox.style.width = "1rem";
        newBox.style.height = "1rem";
        newBox.style.border = "2px solid lightgray"
        newRow.appendChild(newBox);
    }
    uiBoard.appendChild(newRow);
}


let boxes = document.querySelectorAll("td");


// for (let i = 0; i < boxes.length; i++) {
//     boxes[i].setAttribute("ondrop", "drop(event)");
//     boxes[i].setAttribute("ondragover", "allowDrop(event)");
// }


// ------------------------------------ SETTING UP THE NODES ------------------------------------ //


//compute h and g for neighbours
//find neighbour with lowest f
//store neighbour as previous neighbour
//remove from openset, push into closedset
//at the endnode, push all previous neighbours into path[]
//color all nodes in path[] blue


//r, c for coordinates; g = distance from startNode, h = estimated distance from endNode, f=g+h
//only have to fill h for now, because g will change as the currentNode changes
class Node {
    constructor(r, c) {
        this.r = r;
        this.c = c;

        this.g = 0;
        this.h = 0;
        this.f = 0;

        this.neighbours = [];
        this.previous;
        
    }

    colorBox(color) {
        boxes[this.r * cols + this.c].style.background = `${color}`;
    }

    getNeighbours() {
        let r = this.r;
        let c = this.c;

        if (c < cols - 1) this.neighbours.push(grid[r][c + 1]);
        if (c > 0)   this.neighbours.push(grid[r][c - 1]);
        if (r < rows - 1)   this.neighbours.push(grid[r + 1][c]);
        if (r > 0)   this.neighbours.push(grid[r - 1][c]);
    }

    getH(end) {
        this.h = Math.abs(end.r - this.r) + Math.abs(end.c - this.c);
    }

    getF() {
        this.f = this.g + this.h;
    }

}


//create nodes and neighbours
function setNodes() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j] = new Node(i, j);
        }
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[i][j].getNeighbours();
        }
    }

    startNode = grid[0][0];
    endNode = grid[rows - 1][cols - 1];

    startNode.colorBox("#90ccf4");
    endNode.colorBox("#f3d250");

    //boxes[0].innerHTML = `<img src="images/mouse.jpg" draggable="true" ondragstart="drag(event)" style="max-width:100%; max-height: 100%;"></img>`;

    openSet.push(startNode);
}
setNodes();


// ------------------------------------ SETTING UP SET BUTTONS ------------------------------------ //


//this is so you can click once on the set-start/set-end buttons to 'toggle' them
//seems a bit chunky though
let inputType;

for (let i = 0; i < boxes.length; i++) {

    //for setting start and end nodes
    boxes[i].addEventListener("click", function() {
        
        if (inputType === 'start') {
            startNode.colorBox("");
            startNode = grid[Math.floor(i / rows)][i % cols];
            startNode.colorBox("#90ccf4");
            openSet.splice(0, 1, startNode);
            inputType = "";
        }
        else if (inputType === 'end') {
            endNode.colorBox("");
            endNode = grid[Math.floor(i / rows)][i % cols];
            endNode.colorBox("#f3d250");
            inputType = "";
        }
    });

    //for creating walls
    boxes[i].addEventListener("mousemove", function(e) {
        if (e.buttons == 1) {
            boxes[i].style.background = "#8590AA";
            walls.push(grid[Math.floor(i / rows)][i % cols]);
        }
    });
}


btnStart.addEventListener("click", function() {
    inputType = "start";
});


btnEnd.addEventListener("click", function() {
    inputType = "end";
});


btnReset.addEventListener("click", function() {
    boxes.forEach(x => x.style.background = "");
    walls = [];
    closedSet = [];
    openSet = [];
    setNodes();
});


// ------------------------------------ DRAG AND DROP ------------------------------------ //


// function allowDrop(e) {
//     e.preventDefault();
// }

// function drag(e) {
//     e.dataTransfer.setData("text", e.target.id);
// }

// function drop(e) {
//     e.preventDefault();
//     let data = e.dataTransfer.getData("text");
//     e.target.innerHTML = document.getElementById(data).innerHTML;
// }


// ------------------------------------ SEARCH FUNCTION ------------------------------------ //


//push startnode into openset
//let current = startnode
//push neighbours into openset
//fill .g and .previous of neighbours
//push neighbour with best f into closed set; remove from openset
//current = neighbour with best f
//...


//this is the main A* search algorithm
function findCheese() {

        if (openSet.length > 0) {

        //find the node in openset with the lowest f cost
        let indexBest = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[indexBest].f) {
                indexBest = i;
            }
        }

        //set current node as node with lowest f cost, color it green, move it to closedset, empty openset
        currentNode = openSet[indexBest];
        currentNode.colorBox("#90ccf4");
        closedSet.push(openSet.splice(indexBest,1)[0]);

        //push current node neighbours into the openset, fill g, h, f costs for neighbours
        for (let i = 0; i < currentNode.neighbours.length; i++) {

            let neighbour = currentNode.neighbours[i];

            //only push neighbours that are not in the closedset
            if (!closedSet.includes(neighbour) && !openSet.includes(neighbour) && !walls.includes(neighbour)) {
                openSet.push(neighbour);
                neighbour.colorBox("#5da2d5");

                //before passing on g cost, check if g costs of (closed) neighbours of current neighbours are lower; take the lower
                for (let j = 0; j < neighbour.neighbours.length; j++) {

                    let neighbour2 = neighbour.neighbours[j];

                    if (closedSet.includes(neighbour2) && neighbour2.g < currentNode.g) {
                        neighbour.g = neighbour2.g;
                        neighbour.previous = neighbour2;
                    }

                    else {
                        neighbour.g = currentNode.g + 1;
                        neighbour.previous = currentNode;
                    }
                }

                neighbour.getH(endNode);
                neighbour.getF();

            }
        }
    }
}


//for visualising the pathfinding process
function start() {
    btnAll.forEach(x => x.disabled = true);
    return new Promise((resolve) => {
        let mappingPath = setInterval(function() {
            if (currentNode === endNode || openSet.length == 0) {
                clearInterval(mappingPath);
                resolve();
            }
            else {
                findCheese();
            }
        }, 10);
    })
    .then(() => {
        let nodeToColor = endNode;
        let mappingColours = setInterval(function() {
            nodeToColor.colorBox("#f3d250");
            if (nodeToColor.previous) {
                nodeToColor = nodeToColor.previous;
            }
            else {
                clearInterval(mappingColours);
                btnAll.forEach(x => x.disabled = false);
            }
        }, 20);
    });
}


$(".button__find").click(function() {
    start();
});