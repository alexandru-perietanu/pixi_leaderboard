import { Sprite, Graphics, FederatedPointerEvent } from 'pixi.js';

export class Scrollbar extends EventTarget {

    _barHeight: number;
    _thumbHeight: number;
    _container!: Sprite;
    _bar!: Graphics;
    _thumb!: Graphics;
    _dragPoint: any;
    _scroll: number = 0;

    get view(): Sprite {
        return this._container;
    }

    _x: number = 0;
    set x(value: number) {
        this._x = value;
        this._container.x = this._x;
    }
    get x(): number {
        return this._x;
    }

    _y: number = 0;
    set y(value: number) {
        this._y = value;
        this._container.y = this._y;
    }
    get y(): number {
        return this._y;
    }

    set scroll(value: number) {
        this._scroll = value;
        this.updateThumbPosition();
    }

    constructor(barHeight: number, thumbHeight: number = 50) {
        super();
        this._barHeight = barHeight;
        this._thumbHeight = thumbHeight;

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onDragMove = this.onDragMove.bind(this);

        this.createScrollbar();
        this.addListeners();
    }

    createScrollbar() {
        this._container = new Sprite();
        this._bar = new Graphics();
        this._thumb = new Graphics();

        this._bar.beginFill(0xffffff);
        this._bar.lineStyle(2, 0x000000);
        this._bar.drawRect(0, 2, 12, this._barHeight - 2);

        this._thumb.beginFill(0x000000);
        this._thumb.lineStyle(0, 0x000000);
        this._thumb.drawRect(0, 0, 12, this._thumbHeight);

        this._thumb.interactive = true;
        this._container.interactive = true;

        this._container.addChild(this._bar);
        this._container.addChild(this._thumb);
    }

    addListeners() {
        this._thumb.on("pointerdown", this.onDragStart);
        this._thumb.on("pointerup", this.onDragEnd);
        this._thumb.on("pointerupoutside", this.onDragEnd);
    }

    onDragStart(event: any) {
        event.stopPropagation();
        this._dragPoint = this._thumb.parent.toLocal(event.global);
        this._dragPoint.y -= this._thumb.y;
        this._thumb.parent.on("pointermove", this.onDragMove);
    };

    onDragMove(event: any) {
        let newPoint = this._thumb.parent.toLocal(event.global);
        this._thumb.y = newPoint.y - this._dragPoint.y;

        if (this._thumb.y < 0) {
            this._thumb.y = 0;
        }
        if (this._thumb.y > this._barHeight - this._thumbHeight) {
            this._thumb.y = this._barHeight - this._thumbHeight;
        }

        this.dispatchEvent(new CustomEvent("scroll", {
            detail: { scroll: this.map(this._thumb.y, 0, this._barHeight - this._thumbHeight, 0, 100) }
        }));
    };

    onDragEnd(event: any) {
        event.stopPropagation();
        this._thumb.parent.off("pointermove", this.onDragMove);
    };

    updateThumbPosition() {
        this._thumb.y = this.map(this._scroll, 0, 100, 0, this._barHeight - this._thumbHeight);
    }

    map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
        return Math.floor((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
    }
}