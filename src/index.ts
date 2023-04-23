import { Application, Sprite, Ticker, Graphics, TextStyle, Text, TextMetrics } from 'pixi.js';
import Player from './player/Player';
import { Keyboard, Keys } from './util/Keyboard';
import { Scrollbar } from './scrollbar/scrollbar';

class LeaderBoard {
	_app!: Application;
	_screenWidth: number = 0;
	_players: Player[] = [];
	_selectedIndex = Math.floor(Math.random() * 1000);
	_resizeTimeout!: any;
	_containerY: number = 0;
	_playerContainer!: Sprite;
	_totalPlayers = 1000;
	_playerHeight = 50;
	_scrollContainer!: Sprite;
	_scrollMask!: Graphics;
	_scrollContainerHeight = 450;
	_style = new TextStyle({
		fontFamily: 'Arial',
		fontSize: 24,
		fill: 0x000000,
		align: 'center',
	});
	_leaderBoardText: Text = new Text("Leaderboard", this._style);
	_scrollbar!: Scrollbar;
	_maxScroll = -this._totalPlayers * this._playerHeight + this._scrollContainerHeight;

	constructor() {
		this.handleResize = this.handleResize.bind(this);
		this.resize = this.resize.bind(this);
		this.loadPlayers();
		this.handlePlayerSelect = this.handlePlayerSelect.bind(this);
		this.handleScrollbar = this.handleScrollbar.bind(this);
		this._screenWidth = window.innerWidth;

		Keyboard.initialize();
		this._scrollbar = new Scrollbar(450);
		//@ts-ignore
		this._scrollbar.addEventListener("scroll", this.handleScrollbar);

		this._app = new Application({
			view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
			resizeTo: document.getElementById("pixi-canvas") as HTMLCanvasElement,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			backgroundColor: 0xffffff,
			width: this._screenWidth,
			height: 500
		});

		Ticker.shared.add(this.updateScroll, this);
		window.addEventListener("resize", this.handleResize);
	}

	async getPlayers(url: string) {
		try {
			let res = await fetch(url);
			return await res.json();
		} catch (error) {
			console.log(error);
		}
	}

	async loadPlayers() {
		const playersURL = 'https://testing.cdn.arkadiumhosted.com/gameExamples/programming-assignments/senior-core-developer/players.json';
		const playersResponse = await this.getPlayers(playersURL);

		this._playerContainer = new Sprite();
		this._scrollContainer = new Sprite();
		this._scrollMask = new Graphics();
		this.drawScrollMask();

		for (let i = 0; i < playersResponse.players.length; i++) {
			const player = new Player(playersResponse.players[i], this._screenWidth - 30);
			player.x = 10;
			player.y = i * this._playerHeight
			this._playerContainer.addChild(player.view);
			this._players.push(player);

			//@ts-ignore
			player.addEventListener("select", this.handlePlayerSelect);
		}
		this._players[this._selectedIndex].selected = true;

		this.centerOnSelectedPlayer();
		this.positionText();
		this.positionScrollbar();

		this._scrollContainer.y = 50;
		this._scrollMask.y = 50;
		this._scrollContainer.addChild(this._playerContainer);
		this._app.stage.addChild(this._scrollContainer);
		this._app.stage.addChild(this._scrollMask);
		this._app.stage.addChild(this._leaderBoardText);
		this._app.stage.addChild(this._scrollbar.view);

		this._scrollContainer.mask = this._scrollMask;
	}

	positionScrollbar() {
		this._scrollbar.x = this._screenWidth - 15;
		this._scrollbar.y = 50;
	}

	positionText() {
		const textMetrics = TextMetrics.measureText("Leaderboard", this._style);
		this._leaderBoardText.x = this._screenWidth / 2  - textMetrics.width / 2;
		this._leaderBoardText.y = 10;
	}

	drawScrollMask() {
		this._scrollMask.clear();
		this._scrollMask.beginFill(0xff0000, 1);
		this._scrollMask.drawRect(0, 0, this._screenWidth, this._scrollContainerHeight);
	}

	centerOnSelectedPlayer() {
		this._containerY = -this._selectedIndex * this._playerHeight + 200;
		this.applyContainerLimits();
		this._playerContainer.y = this._containerY;
		this.updateScrollBar();
	}

	handlePlayerSelect(event: CustomEvent) {
		this._players[this._selectedIndex].selected = false;
		this._selectedIndex = event.detail.index;
		this._players[this._selectedIndex].selected = true;
		console.log(event.detail.index, event.detail.selected);
	}

	handleResize() {
		this._screenWidth = window.innerWidth;
		clearTimeout(this._resizeTimeout);
		this._resizeTimeout = setTimeout(this.resize, 200);
	}

	resize() {
		this._app!.view!.style!.width = this._screenWidth + "px";
		this._app.resize();
		this.drawScrollMask();
		this.positionText();
		this.positionScrollbar();

		for (let i = 0; i < this._players.length; i++) {
			this._players[i].width = this._screenWidth - 30;
		}
	}

	applyContainerLimits() {
		if (this._containerY > 0) {
			this._containerY = 0;
		} else if (this._containerY < -this._totalPlayers * this._playerHeight + 450) {
			this._containerY = -this._totalPlayers * this._playerHeight + 450;
		}
	}

	updateScroll() {
		if (Keyboard.state.get(Keys.ArrowDown)) {
			this._containerY -= this._playerHeight;
			this.applyContainerLimits();
			this._playerContainer.y = this._containerY;
			this.updateScrollBar();
		}

		if (Keyboard.state.get(Keys.ArrowUp)) {
			this._containerY += this._playerHeight;
			this.applyContainerLimits();
			this._playerContainer.y = this._containerY;
			this.updateScrollBar();
		}

		if (Keyboard.state.get(Keys.PageUp)) {
			this._containerY += 450;
			this.applyContainerLimits();
			this._playerContainer.y = this._containerY;
			this.updateScrollBar();
		}

		if (Keyboard.state.get(Keys.PageDown)) {
			this._containerY -= 450;
			this.applyContainerLimits();
			this._playerContainer.y = this._containerY;
			this.updateScrollBar();
		}

		if (Keyboard.state.get(Keys.Home)) {
			this._containerY = 0;
			this._playerContainer.y = this._containerY;
			this.updateScrollBar();
		}

		if (Keyboard.state.get(Keys.End)) {
			this._containerY = -this._totalPlayers * this._playerHeight + 450;
			this._playerContainer.y = this._containerY;
			this.updateScrollBar();
		}

		if (Keyboard.state.get(Keys.Space)) {
			this.centerOnSelectedPlayer();
		}
	}

	handleScrollbar(event: CustomEvent) {
		let posY = this.map(event.detail.scroll, 0, 100, 0, this._maxScroll);
		posY = posY - posY % 50;
		this._containerY = posY;
		this._playerContainer.y = this._containerY;
	}

	updateScrollBar() {
		let scroll = this.map(this._playerContainer.y, 0, this._maxScroll, 0, 100);
		this._scrollbar.scroll = scroll;
	}

	map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
        return Math.floor((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
    }
}

const leaderBoard = new LeaderBoard();