/*
Maybe need to define the limit of the screen
paddle ?

Moving up and down along the y axis, in the accorded limits (careful to include the paddle height, where does the pos of the paddle starts)
*/


export class Player {
	x: number;
	y: number;
	score : number;

	//paddle width and height??

	constructor() {
		this.x = 10;
		this.y = 50;
		this.score = 0;
	}

	moveUp() {
		//const speed = 5;
		//if (this.y > 0) this.y -= 5;
	}

	moveDown() {
		//const speed = 5;

	}

	reset()
	{
		this.x = 10;
		this.y = 50;
	}
}
