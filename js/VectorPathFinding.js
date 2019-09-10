/*
    Grid based on a 1600x900 resolution
 */

const $canvas = $("#canvas");
const W = $canvas.parent().width();
const H = W * 9 / 16;

let c = document.getElementById("canvas");
let ctx = c.getContext("2d");

c.width = W;
c.height = H;

let environment = function () {
    return {
        'objects': [],
        'render': function () {
            ctx.clearRect(0, 0, c.width, c.height);
            this.objects.forEach(function (object) {
                this.draw(object);
            }, this);
        },
        'draw': function (object) {
            switch(object.type) {
                case 'pattern':
                    object.shapes.forEach(function (object) {
                        this.draw(object);
                    }, this);
                    break;
                case 'rectangle':
                    ctx.fillStyle = object.color;
                    ctx.fillRect(object.pos.x * W / 1600, object.pos.y * H / 900, object.w * W / 1600, object.h * H / 900);
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(object.pos.x * W / 1600, object.pos.y * H / 900, object.r, 0, 2 * Math.PI, false);
                    ctx.fillStyle = object.color;
                    ctx.fill();
                    break;
                case 'line':
                    ctx.beginPath();
                    ctx.strokeStyle = object.color;
                    ctx.lineWidth = object.thickness * W / 1600;
                    ctx.moveTo(object.pos1.x * W / 1600,object.pos1.y * H / 900);
                    ctx.lineTo(object.pos2.x * W / 1600,object.pos2.y * H / 900);
                    ctx.stroke();
                    break;
            }
        },
        'add': function (object) {
            this.objects.push(object);
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
        }
    }
};

let pattern = function () {
    return {
        'type': 'pattern',
        'shapes': []
    }
};

let rectangle = function (w, h, pos, color = '#000000') {
    return {
        'type': 'rectangle',
        'w': w,
        'h': h,
        'pos': pos,
        'color': color
    }
};

let circle = function (r, pos, color = '#000000') {
    return {
        'type': 'circle',
        'r': r,
        'pos': pos,
        'color': color
    }
};

let line = function (pos1, pos2, thickness, color = '#000000') {
    return {
        'type': 'line',
        'pos1': pos1,
        'pos2': pos2,
        'thickness': thickness,
        'color': color
    }
};




/*
    Begin code
 */

let e = environment();
e.add(rectangle(1600, 900, vector(0,0), "#0300a0"));
e.add(line(vector(0,0), vector(1600,900),200,"#fff"));
e.add(line(vector(0,900), vector(1600,0),200,"#fff"));
e.add(line(vector(-32,32), vector(800,500),66,"#c00"));
e.add(line(vector(800,400), vector(1600,-50),66,"#c00"));
e.add(line(vector(800,400), vector(1632,868),66,"#c00"));
e.add(line(vector(0,950), vector(800,500),66,"#c00"));

e.add(line(vector(0,450),vector(1600,450),290,'#fff'));
e.add(line(vector(800,0), vector(800,900), 290, '#fff'));
e.add(line(vector(0,450),vector(1600,450),145,'#c00'));
e.add(line(vector(800,0), vector(800,900), 145, '#c00'));
e.render();
console.log(e);









