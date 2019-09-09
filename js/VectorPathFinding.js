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
        shapes: []
    }
};

let rectangle = function (w, h, pos) {
    return {
        'w': w,
        'h': h,
        'pos': pos
    }
};

let circle = function (r, pos) {
    return {
        'r': r,
        'pos': pos
    }
};

let line = function (pos1, pos2, thickness) {
    return {
        'pos1': pos1,
        'pos2': pos2,
        'thickness': thickness
    }
};