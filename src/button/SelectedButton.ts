import { Sprite, Graphics, Text, TextStyle, TextMetrics } from 'pixi.js';

export class SelectedButton extends EventTarget {
    _buttonText: string = "";
    _width = 100;
    _height = 50;
    _buttonSprite: Sprite = new Sprite();
    _background: Graphics = new Graphics();
    _text!: Text;
    _style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0x000000,
        align: 'center',
    });

    get view() {
        return this._buttonSprite;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    _selected: boolean = false;
    set selected(value: boolean) {
        this._selected = value;
        this.drawBackground();
    }

    get selected(): boolean {
        return this._selected;
    }

    _x: number = 0;
    set x(value: number) {
        this._x = value;
        this._buttonSprite.x = this._x;
    }
    get x(): number {
        return this._x;
    }

    _y: number = 0;
    set y(value: number) {
        this._y = value;
        this._buttonSprite.y = this._y;
    }
    get y(): number {
        return this._y;
    }

    constructor(text: string, width?: number, height?: number) {
        super();

        this._buttonText = text;
        this._width = width || this._width;
        this._height = height || this._height;

        this.createButton();
        this.drawBackground();
    }

    createButton() {
        this._text = new Text(this._buttonText, this._style);
        const textMetrics = TextMetrics.measureText(this._buttonText, this._style);
        this._text.x = this._width / 2 - textMetrics.width / 2;
        this._text.y = this._height / 2 - textMetrics.height / 2;

        this._buttonSprite.addChild(this._background);
        this._buttonSprite.addChild(this._text);
        this._buttonSprite.interactive = true;
        this._buttonSprite.on("pointertap", this.handleClick, this);
    }

    drawBackground() {

        if (this._selected) {
            this._background.beginFill(0xFFFFFF);
        } else {
            this._background.beginFill(0xFFE599);
        }
        this._background.lineStyle(1, 0x000000);
        this._background.drawRect(0, 0, this._width, this._height);

    }

    handleClick() {
        this._selected = !this._selected;
        this.dispatchEvent(new CustomEvent("select", {
            detail: { selected: this._selected }
        }));
        this.drawBackground();
    }
}