//------------------------------------------------Model---------------------------------------------------------------//
//The whole canvas with all objects
let environment = function (ctx) {
    return {
        'context': ctx,
        'objects': [],
        'add': function (object) {
            this.objects.push(object);
        },
        'remove': function (id) {
            this.objects.forEach(function (object, i) {
                if (object.id === id) {
                    this.objects.splice(i, 1);
                }
            }, this);
        },
        'get': function (id) {
            for (const object of this.objects) {
                if (object.id === id) {
                    return object;
                }
            }
        }
    }
};

let vector = function (x, y) {
    return {
        'x': x,
        'y': y,
        'setVector': function (v) {
            this.x = v.x;
            this.y = v.y;
        },
        'addVector': function (v) {
            this.x += v.x;
            this.y += v.y;
        },
        'clone': function () {
            return vector(this.x, this.y);
        }
    }
};

//A collection of shapes
let pattern = function (id, pos) {
    return {
        'type': 'pattern',
        'id': id,
        'shapes': [],
        'pos': pos,
        'add': function (shape) {
            this.shapes.push(shape);
        },
        'remove': function (id) {
            this.shapes.forEach(function (shape, i) {
                if (shape.id === id) {
                    this.shape.splice(i, 1);
                }
            }, this);
        },
        'get': function (id) {
            for (const shape of this.shapes) {
                if (shape.id === id) {
                    return shape;
                }
            }
        },
        'clone': function () {
            let ret = pattern(this.id, this.pos.clone());
            for (const shape of this.shapes) {
                ret.add(shape.clone());
            }
            return ret;
        }
    }
};

let rectangle = function (id, w, h, pos, color = '#000000') {
    return {
        'type': 'rectangle',
        'id': id,
        'w': w,
        'h': h,
        'pos': pos,
        'color': color,
        'clone': function () {
            return rectangle(this.id, this.w, this.h, this.pos.clone(), this.color);
        }
    }
};

let circle = function (id, r, pos, color = '#000000') {
    return {
        'type': 'circle',
        'id': id,
        'r': r,
        'pos': pos,
        'color': color,
        'clone': function () {
            return circle(this.id, this.r, this.pos.clone(), this.color);
        }
    }
};

let line = function (id, pos1, pos2, thickness = 5, color = '#000000') {
    return {
        'type': 'line',
        'id': id,
        'pos1': pos1,
        'pos2': pos2,
        'thickness': thickness,
        'color': color,
        'clone': function () {
            return line(this.id, this.pos1.clone(), this.pos2.clone(), this.thickness, this.color);
        }
    }
};

//------------------------------------------------View---------------------------------------------------------------//
let render = function (environment) {
    environment.context.clearRect(0, 0, c.width, c.height);
    environment.objects.forEach(function (object) {
        draw(object, vector(0, 0), environment.context);
    });
};

let draw = function (object, offset, context) {
    let x = 0;
    let y = 0;

    if (object.type !== "line") {
        x = offset.x + object.pos.x;
        y = offset.y + object.pos.y;
    }


    switch (object.type) {
        case 'pattern':
            object.shapes.forEach(function (object) {
                draw(object, vector(x, y), context);
            });
            break;
        case 'rectangle':
            context.fillStyle = object.color;
            context.fillRect(x * ratio, y * ratio,
                object.w * ratio, object.h * ratio);
            break;
        case 'circle':
            context.beginPath();
            context.arc(x * ratio, y * ratio,
                object.r * ratio, 0, 2 * Math.PI, false);
            context.fillStyle = object.color;
            context.fill();
            break;
        case 'line':
            context.beginPath();
            context.strokeStyle = object.color;
            context.lineWidth = object.thickness * ratio;
            context.moveTo((object.pos1.x + offset.x) * ratio, (object.pos1.y + offset.y) * ratio);
            context.lineTo((object.pos2.x + offset.x) * ratio, (object.pos2.y + offset.y) * ratio);
            context.stroke();
            break;
    }
};


//------------------------------------------------Controller----------------------------------------------------------//
/*
    Grid based on a 1600x900 resolution
 */

const $canvas = $("#canvas");
//Rounding allows graphics to be crisp
let W = Math.floor($canvas.parent().width() / 16) * 16;
let H = W * 9 / 16;
let ratio = W / 1600;

$(window).resize(function () {
    W = Math.floor($canvas.parent().width() / 16) * 16;
    H = W * 9 / 16;
    c.width = W;
    c.height = H;
    ratio = W / 1600;
    render(e);
});

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");

c.width = W;
c.height = H;

/*
    Setup
 */

let e = environment(ctx);

/*
    Will consist of a 32x18 grid
 */
let coord = function (x, y) {
    return vector(x * 50, y * 50);
};

let grid = function () {
    let ret = pattern( "grid", vector(0,0));
    for (let i = 0; i <= 32; i++) {
        ret.add(line(null, coord(i, 0), coord(i, 18), 6, '#eee'));
    }
    for (let j = 0; j <= 18; j++) {
        ret.add(line(null, coord(0, j), coord(32, j), 6, '#eee'));
    }
    return ret;
};

let barrier = function (id, pos1, pos2, color = "#000") {
    let ret = pattern(id, vector(0,0));
    pos1.addVector(vector(25, 25));
    pos2.addVector(vector(25, 25));
    ret.add(circle("p1", 10, pos1, color));
    ret.add(circle("p2", 10, pos2, color));
    ret.add(line("line", pos1, pos2, 20, color));
    return ret;
};

let roundedRec = function (id, w, h, r, pos, color) {
    let ret = pattern(id, pos);
    if (r > w / 2) r = w / 2;
    if (r > h / 2) r = h / 2;
    let p1 = vector(r, r);
    let p2 = vector(w - r, r);
    let p3 = vector(w - r, h - r);
    let p4 = vector(r, h - r);
    ret.add(circle(null, r, p1, color));
    ret.add(circle(null, r, p2, color));
    ret.add(circle(null, r, p3, color));
    ret.add(circle(null, r, p4, color));
    ret.add(rectangle(null, w - (2 * r), h, vector(p1.x, p1.y - r), color));
    ret.add(rectangle(null, w, h - (2 * r), vector(p1.x - r, p1.y), color));
    return ret;
};

let target = function (pos) {
    let ret = pattern("target", pos);
    ret.add(circle(null, 20, vector(25, 25), '#c00'));
    ret.add(circle(null, 15, vector(25, 25), '#fff'));
    ret.add(line(null, vector(25, 0), vector(25, 50), 5, '#c00'));
    ret.add(line(null, vector(0, 25), vector(50, 25), 5, '#c00'));
    return ret;
};

let player = function (pos) {
    let ret = pattern("player", pos);
    ret.add(circle(null, 20, vector(25, 25), '#9e5b00'));
    ret.add(circle(null, 15, vector(25, 25), '#f98a00'));
    return ret;
};

// Basic UI
e.add(grid());
e.add(roundedRec("menubar", 1570, 110, 10, vector(15, 775), "#ccc"));
e.add(roundedRec("textbar", 770, 70, 10, vector(800, 800), "#eee"));

let map = pattern("map", vector(0, 0));
let barriers = pattern("barriers", vector(0,0));
barriers.add(barrier("immbarrier", coord(0, 0), coord(31, 0)));
barriers.add(barrier("immbarrier", coord(0, 15), coord(31, 15)));
barriers.add(barrier("immbarrier", coord(0, 0), coord(0, 15)));
barriers.add(barrier("immbarrier", coord(31, 0), coord(31, 15)));

// Walls
map.add(barriers);

// Target
map.add(target(coord(1, 1)));

// Player
map.add(player(coord(30, 14)));

e.add(map);
render(e);
console.log(e);






// Mouse functions
let getMousePos = function (event) {
    let rect = c.getBoundingClientRect();
    return vector(Math.round((event.clientX - rect.left) / ratio), Math.round((event.clientY - rect.top) / ratio));
};

let snappedToGrid = function (pos) {
    return vector(Math.round((pos.x - 25) / 50) * 50, Math.round((pos.y - 25) / 50) * 50)
};

let pointInRect = function (pos, x, y, w, h) {
    let valid = true;
    if (!(x <= pos.x && pos.x <= x + w)) valid = false;
    if (!(y <= pos.y && pos.y <= y + h)) valid = false;
    return valid;
};

let mousedown = false;
let targetedObject = null;
let playerObject = e.get("map").get("player");
let targetObject = e.get("map").get("target");
let barrierObjects = e.get("map").get("barriers");

$canvas.on('mousedown', function (event) {
    let mousePos = getMousePos(event);
    mousedown = true;

    if (pointInRect(mousePos, playerObject.pos.x, playerObject.pos.y, 50, 50) && !targetedObject) {
        targetedObject = "player";
    }
    if (pointInRect(mousePos, targetObject.pos.x, targetObject.pos.y, 50, 50) && !targetedObject) {
        targetedObject = "target";
    }
    if (pointInRect(mousePos, 0, 0, 1600, 780) && !targetedObject) {
        targetedObject = "grid";
        barrierObjects.add(barrier("halfbarrier", snappedToGrid(mousePos), snappedToGrid(mousePos)));
        render(e);
    }

    console.log(targetedObject);
});

$canvas.on('mousemove', function (event) {
    if (mousedown) {
        let mousePos = getMousePos(event);
        switch (targetedObject) {
            case "player":
                playerObject.pos = mousePos;
                playerObject.pos.addVector(vector(-25, -25));
                render(e);
                break;
            case "target":
                targetObject.pos = mousePos;
                targetObject.pos.addVector(vector(-25, -25));
                render(e);
                break;
            case "grid":
                let barrierObject = barrierObjects.get("halfbarrier");
                if (!pointInRect(mousePos, barrierObject.get("p2").pos.x + 25, barrierObject.get("p2").pos.y + 25, 50, 50)) {
                    barrierObject.get("p2").pos = snappedToGrid(mousePos);
                    barrierObject.get("line").pos2 = snappedToGrid(mousePos);
                    barrierObject.get("p2").pos.addVector(vector(25,25));
                    barrierObject.get("line").pos2.addVector(vector(25,25));
                    render(e);
                }

                break;
        }
    }

});

$canvas.on('mouseup mouseout', function (event) {
    if (targetedObject === "grid")
    {
        barrierObjects.get("halfbarrier").id = "barrier" + barrierObjects.shapes.length;
        barrierObjects.remove("halfbarrier");
    }
    targetedObject = null;
    mousedown = false;
});





// Union Jack
// let e = environment(ctx);
// e.add(rectangle(1600, 900, vector(0,0), "#0300a0"));
// e.add(line(vector(0,0), vector(1600,900),200,"#fff"));
// e.add(line(vector(0,900), vector(1600,0),200,"#fff"));
// e.add(line(vector(-32,32), vector(800,500),66,"#c00"));
// e.add(line(vector(800,400), vector(1600,-50),66,"#c00"));
// e.add(line(vector(800,400), vector(1632,868),66,"#c00"));
// e.add(line(vector(0,950), vector(800,500),66,"#c00"));
// e.add(line(vector(0,450),vector(1600,450),290,'#fff'));
// e.add(line(vector(800,0), vector(800,900), 290, '#fff'));
// e.add(line(vector(0,450),vector(1600,450),145,'#c00'));
// e.add(line(vector(800,0), vector(800,900), 145, '#c00'));
// e.render();









