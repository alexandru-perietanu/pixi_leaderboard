import { Sprite, Graphics, Text, TextStyle, TextMetrics, Texture } from 'pixi.js';
import { SelectedButton } from '../button/SelectedButton';
import { PlayerModel } from '../models/playerModel';

export default class Player extends EventTarget {
    _player: PlayerModel;
    _playerCard: Sprite = new Sprite();
    _background: Graphics = new Graphics();
    _selectedColor = 0xFFE599;
    _backgroundColor = 0xFFFFff;
    _button = new SelectedButton("Profile", 100, 30);
    _height = 50;
    _avatar!: Sprite;
    _playerIndexText!: Text;
    _playerScoreText!: Text;
    _playerNameText!: Text;
    _style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x000000,
        align: 'center',
    });

    _width = 600;
    set width(value: number) {
        this._width = value;
        this.repaint();
    }
    get width(): number {
        return this._width;
    }
    
    get view() {
        return this._playerCard;
    }

    _selected: boolean = false;
    set selected(value: boolean) {
        this._selected = value;
        this._button.selected = this._selected;
        this.drawBackground();
    }

    get selected(): boolean {
        return this._selected;
    }

    _x: number = 0;
    set x(value: number) {
        this._x = value;
        this._playerCard.x = this._x;
    }
    get x(): number {
        return this._x;
    }

    _y: number = 0;
    set y(value: number) {
        this._y = value;
        this._playerCard.y = this._y;
    }
    get y(): number {
        return this._y;
    }

    constructor(player: PlayerModel, width = 600, height = 50) {
        super();
        this._player = player;
        this._width = width;
        this._height = height;

        this.handleButtonSelect = this.handleButtonSelect.bind(this);

        this.createPlayer();
    }

    createPlayer() {
        // this._playerCard = new Sprite();
        this._playerCard.x = 10;
        this._playerCard.y = 10;

        this._playerIndexText = new Text(this._player.index + 1, this._style);
        this._playerIndexText.x = 4;
        this._playerIndexText.y = 12;

        this._playerNameText = new Text(this._player.name, this._style);
        this._playerNameText.x = 100;
        this._playerNameText.y = 12;

        const formattedScore = new Intl.NumberFormat().format(this._player.score);
        this._playerScoreText = new Text(formattedScore, this._style);
        const textMetrics = TextMetrics.measureText(formattedScore, this._style);
        this._playerScoreText.x = this._width - this._button.width - 20 - textMetrics.width - 15;
        this._playerScoreText.y = 12;

        this.drawBackground();

        this._button.x = this._width - this._button.width - 20;
        this._button.y = 10;
        this._button.selected = this._selected;

        const texture = Texture.from(this.getAvatarLink(this._player.type.toString(), this._player.avatar.toString()));
        this._avatar = new Sprite(texture);
        this._avatar.width *= .25;
        this._avatar.height *= .25;
        this._avatar.y = 3;
        this._avatar.x = 65;

        this._playerCard.addChild(this._background);
        this._playerCard.addChild(this._playerIndexText);
        this._playerCard.addChild(this._playerNameText);
        this._playerCard.addChild(this._playerScoreText);
        this._playerCard.addChild(this._button.view);
        this._playerCard.addChild(this._avatar);

        //@ts-ignore
        this._button.addEventListener("select", this.handleButtonSelect);
    }

    handleButtonSelect(event: CustomEvent) {
        this.selected = event.detail.selected;
        this.dispatchEvent(new CustomEvent("select", {
            detail: {
                selected: this._selected,
                index: this._player.index
            },
        }));
    }

    drawBackground() {
        this._background.clear();
        if (this._selected) {
            this._background.beginFill(this._selectedColor);
        } else {
            this._background.beginFill(this._backgroundColor);
        }

        this._background.lineStyle(2, 0x000000);
        this._background.drawRect(0, 2, this._width, this._height - 4);
    }

    getAvatarLink(type: string, avatar: string) {
		return `https://testing.cdn.arkadiumhosted.com/gameExamples/programming-assignments/senior-core-developer/avatars/${type}/${avatar}.png`;
	}

    repaint() {
        this.drawBackground();
        this._button.x = this._width - this._button.width - 20;
        const formattedScore = new Intl.NumberFormat().format(this._player.score);
        const textMetrics = TextMetrics.measureText(formattedScore, this._style);
        this._playerScoreText.x = this._width - this._button.width - 20 - textMetrics.width - 15;
    }
}