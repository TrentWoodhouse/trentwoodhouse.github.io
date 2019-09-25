/*
    Grid based on a 1600x900 resolution
 */

const $canvas = $("#canvas");
//Rounding allows graphics to be crisp
let W = Math.floor($canvas.parent().width() / 16) * 16;
let H = W * 9 / 16;

$(window).resize(function () {
    W = Math.floor($canvas.parent().width() / 16) * 16;
    H = W * 9 / 16;
    c.width = W;
    c.height = H;
    e.render();
});

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");

c.width = W;
c.height = H;

//The whole canvas with all objects
let environment = function (ctx) {
    return {
        'context': ctx,
        'objects': [],
        'render': function () {
            this.context.clearRect(0, 0, c.width, c.height);
            this.objects.forEach(function (object) {
                this.draw(object);
            }, this);
        },
        'draw': function (object) {
            let ratio = W / 1600;
            switch(object.type) {
                case 'pattern':
                    object.shapes.forEach(function (object) {
                        this.draw(object);
                    }, this);
                    break;
                case 'rectangle':
                    this.context.fillStyle = object.color;
                    this.context.fillRect((object.pos.x + object.offset.x) * ratio,
                        (object.pos.y + object.offset.y) * ratio,
                        object.w * ratio, object.h * ratio);
                    break;
                case 'circle':
                    this.context.beginPath();
                    this.context.arc((object.pos.x + object.offset.x) * ratio, 
                        (object.pos.y + object.offset.y) * ratio,
                        object.r * ratio, 0, 2 * Math.PI, false);
                    this.context.fillStyle = object.color;
                    this.context.fill();
                    break;
                case 'line':
                    this.context.beginPath();
                    this.context.strokeStyle = object.color;
                    this.context.lineWidth = object.thickness * ratio;
                    this.context.moveTo((object.pos1.x + object.offset.x) * ratio,(object.pos1.y + object.offset.y) * ratio);
                    this.context.lineTo((object.pos2.x + object.offset.x) * ratio,(object.pos2.y + object.offset.y) * ratio);
                    this.context.stroke();
                    break;
            }
        },
        'add': function (object, offset = vector(0,0)) {
            object.updateOffset(offset);
            this.objects.push(object);
        },
        'remove': function (id) {

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
        }
    }
};

//A collection of shapes
let pattern = function (pos, id) {
    return {
        'type': 'pattern',
        'id': id,
        'shapes': [],
        'pos': pos,
        'offset': vector(0, 0),
        'add': function (shape, offset = vector(0,0)) {
            shape.offset.setVector(offset);
            this.shapes.push(shape);
        },
        'updateOffset': function (offset) {
            this.offset.addVector(offset);
            this.shapes.forEach(function (shape) {
                shape.updateOffset(this.offset);
            }, this);
        }
    }
};

let rectangle = function (w, h, pos, color = '#000000', id) {
    return {
        'type': 'rectangle',
        'id': id,
        'w': w,
        'h': h,
        'pos': pos,
        'offset': vector(0, 0),
        'color': color,
        'updateOffset': function (offset) {
            this.offset.addVector(offset);
        }
    }
};

let circle = function (r, pos, color = '#000000', id) {
    return {
        'type': 'circle',
        'id': id,
        'r': r,
        'pos': pos,
        'offset': vector(0, 0),
        'color': color,
        'updateOffset': function (offset) {
            this.offset.addVector(offset);
        }
    }
};

let line = function (pos1, pos2, thickness = 5, color = '#000000', id) {
    return {
        'type': 'line',
        'id': id,
        'pos1': pos1,
        'pos2': pos2,
        'offset': vector(0,0),
        'thickness': thickness,
        'color': color,
        'updateOffset': function (offset) {
            this.offset.addVector(offset);
        }
    }
};


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

let lightBlock = function () {
    let block = pattern();
    block.add(rectangle(50, 50, vector(0,0), "#eee"));
    block.add(rectangle(45, 45, vector(0,0), "#fff"));
    return block;
};

let barrier = function (pos1, pos2, color, id) {
    let wall = pattern(id);
    pos1.addVector(vector(25,25));
    pos2.addVector(vector(25,25));
    wall.add(circle(10, pos1, color));
    wall.add(circle(10, pos2, color));
    wall.add(line(pos1, pos2, 20, color));
    return wall;
};

let roundedRec = function (w, h, r, pos, color, id) {
    let rect = pattern(id);
    if(r > w / 2) r = w / 2;
    if(r > h / 2) r = h / 2;
    let p1 = vector(pos.x + r, pos.y + r);
    let p2 = vector(pos.x + w - r, pos.y + r);
    let p3 = vector(pos.x + w - r, pos.y + h - r);
    let p4 = vector(pos.x + r, pos.y + h - r);
    rect.add(circle(r, p1, color));
    rect.add(circle(r, p2, color));
    rect.add(circle(r, p3, color));
    rect.add(circle(r, p4, color));
    rect.add(rectangle(w - (2 * r), h, vector(p1.x, p1.y - r), color));
    rect.add(rectangle(w, h - (2 * r), vector(p1.x - r, p1.y), color));
    return rect;
};

let target = function () {
    let tar = pattern("target");
    tar.add(circle(20, vector(25, 25), '#c00'));
    tar.add(circle(15, vector(25, 25), '#fff'));
    tar.add(line(vector(25,0), vector(25, 50), 5, '#c00'));
    tar.add(line(vector(0,25), vector(50, 25), 5, '#c00'));
    return tar;
};

let player = function () {
    let play = pattern("playget");
    play.add(circle(20, vector(25, 25), '#9e5b00'));
    play.add(circle(15, vector(25, 25), '#f98a00'));
    return play;
};

for(let i = 0; i < 32; i++)
{
    for(let j = 0; j < 18; j++)
    {
        e.add(lightBlock(), coord(i, j));
    }
}
e.add(roundedRec(1570, 110, 10, vector(15, 775), '#ccc'));
e.add(barrier(coord(0, 0), coord(31, 0)));
e.add(barrier(coord(0, 15), coord(31, 15)));
e.add(barrier(coord(0, 0), coord(0, 15)));
e.add(barrier(coord(31, 0), coord(31, 15)));


// Walls
e.add(barrier(coord(25, 5), coord(15, 5)));
e.add(barrier(coord(10, 10), coord(15, 5)));
e.add(barrier(coord(10, 10), coord(10, 15)));

// Player
e.add(player(), coord(30, 14));


// Target
e.add(target(), coord(1, 1));

e.render();
console.log(e);

/*
    Loop
 */

setInterval(function () {

}, 10);


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









