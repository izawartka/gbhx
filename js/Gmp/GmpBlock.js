import * as THREE from 'three';

export default class GmpBlock {
    #left;
    #right;
    #top;
    #bottom;
    #lid;
    arrows;
    #type;
    #slope;
    #x; #y; #z;

    cachedMeshes = null;

    constructor(
        x, y, z,
        left,
        right,
        top,
        bottom,
        lid,
        arrows,
        type,
        slope
    ) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#left = left;
        this.#right = right;
        this.#top = top;
        this.#bottom = bottom;
        this.#lid = lid;
        this.arrows = arrows;
        this.#type = type;
        this.#slope = slope;  
    }

    get x() { return this.#x; }
    get y() { return this.#y; }
    get z() { return this.#z; }
    get left() { return this.#left; }
    get right() { return this.#right; }
    get top() { return this.#top; }
    get bottom() { return this.#bottom; }
    get lid() { return this.#lid; }
    get type() { return this.#type; }
    get slope() { return this.#slope; }

    set left(value) { this.#left = value; this.cachedMeshes = null; }
    set right(value) { this.#right = value; this.cachedMeshes = null; }
    set top(value) { this.#top = value; this.cachedMeshes = null; }
    set bottom(value) { this.#bottom = value; this.cachedMeshes = null; }
    set lid(value) { this.#lid = value; this.cachedMeshes = null; }
    set type(value) { this.#type = value; this.cachedMeshes = null; }
    set slope(value) { this.#slope = value; this.cachedMeshes = null; }
}