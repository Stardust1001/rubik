
window.rubik = (() => {
	const COLORS = {
		red: new BABYLON.Color3(1, 0, 0),
		orange: new BABYLON.Color3(0.95, 0.56, 0.07),
		green: new BABYLON.Color3(0, 1, 0),
		blue: new BABYLON.Color3(0, 0, 1),
		white: new BABYLON.Color3(1, 1, 1),
		yellow: new BABYLON.Color3(1, 1, 0),
		black: new BABYLON.Color3(0.3, 0.3, 0.3)
	};

	const PLANES = {
		TOP: 'white',
		FRONT: 'orange',
		LEFT: 'blue',
		RIGHT: 'green',
		BACK: 'red',
		BOTTOM: 'yellow'
	};

	const _calcCubeFaceColors = (x, y, z, levels) => {
		const max = Math.floor(levels / 2);
		const colors = { ...COLORS };
		if (x < max) colors.green = COLORS.black;
		if (x > -max) colors.blue = COLORS.black;
		if (y < max) colors.white = COLORS.black;
		if (y > -max) colors.yellow = COLORS.black;
		if (z < max) colors.orange = COLORS.black;
		if (z > -max) colors.red = COLORS.black;

		return colors;
	};

	class Cube {

		constructor (x, y, z, size, scene, isEven, levels, status = null) {
			this.x = x;
			this.y = y;
			this.z = z;

			this.size = size;
			this.name = `Cube(${x}, ${y}, ${z})`;

			let colors = _calcCubeFaceColors(x, y, z, levels);

			if (status) {
				colors = { };
				Object.keys(COLORS).forEach(name => {
					colors[name] = COLORS.black;
				});
				Object.keys(PLANES).forEach(direction => {
					if (status[direction]) {
						colors[PLANES[direction]] = COLORS[status[direction]];
					}
				});
			}

			this.box = BABYLON.MeshBuilder.CreateBox(this.name, {
				size,
				faceColors: Object.values(colors)
			}, scene);


			// 标记当前方块在整个魔方里的属性
			this.markCube(x, y, z, levels, { ...colors }, status);

			if (isEven) {
				const halfSize = size / 2 + 0.5;
				this.box.position = new BABYLON.Vector3(
					x * size + x + halfSize * (x > 0 ? -1 : 1),
					y * size + y + halfSize * (y > 0 ? -1 : 1),
					-z * size - z + halfSize * (z > 0 ? 1 : -1)
				);
			} else {
				this.box.position = new BABYLON.Vector3(x * size + x, y * size + y, -z * size - z);
			}
		}

		markCube (x, y, z, levels, colors, status) {
			this.isThree = levels === 3;
			if (!this.isThree) return ;

			this.isCorner = !!(x && y && z);
			this.isCenter = false;
			this.isEdge = false;

			if (!this.isCorner) {
				this.isEdge = x && y || x && z || y && z;
				this.isCenter = !this.isEdge;
			}

			this.floor = y === 1 ? 1 : (y === 0 ? 2 : 3);

			this.colors = { };

			const planes = ['BACK', 'FRONT', 'RIGHT', 'LEFT', 'TOP', 'BOTTOM'];

			if (status) {
				Object.keys(COLORS).forEach(name => {
					this.colors[name] = false;
				});
				planes.forEach(plane => {
					if (status[plane]) {
						this.colors[status[plane]] = true;
					}
				});
			} else {
				Object.keys(colors).forEach(color => {
					this.colors[color] = colors[color] !== COLORS.black;
				});
			}

			this.planesColor = { };

			if (status) {
				planes.forEach(plane => {
					this.planesColor[plane] = status[plane] || '';
				});
			} else {
				Object.keys(colors).slice(0, -1).forEach((name, index) => {
					if (colors[name] !== COLORS.black) {
						this.planesColor[planes[index]] = name;
					} else {
						this.planesColor[planes[index]] = '';
					}
				});
			}
		}

		rotate (direction, degree) {
			const { TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK } = this.planesColor;
			if (direction === 'x') {
				if (degree === 90) {
					this.planesColor.TOP = FRONT;
					this.planesColor.FRONT = BOTTOM;
					this.planesColor.BOTTOM = BACK;
					this.planesColor.BACK = TOP;
				} else if (degree === -90) {
					this.planesColor.TOP = BACK;
					this.planesColor.FRONT = TOP;
					this.planesColor.BOTTOM = FRONT;
					this.planesColor.BACK = BOTTOM;
				} else if (Math.abs(degree) === 180) {
					this.planesColor.TOP = BOTTOM;
					this.planesColor.FRONT = BACK;
					this.planesColor.BOTTOM = TOP;
					this.planesColor.BACK = FRONT;
				}
			} else if (direction === 'y') {
				if (degree === 90) {
					this.planesColor.LEFT = FRONT;
					this.planesColor.FRONT = RIGHT;
					this.planesColor.RIGHT = BACK;
					this.planesColor.BACK = LEFT;
				} else if (degree === -90) {
					this.planesColor.FRONT = LEFT;
					this.planesColor.RIGHT = FRONT;
					this.planesColor.BACK = RIGHT;
					this.planesColor.LEFT = BACK;
				} else if (Math.abs(degree) === 180) {
					this.planesColor.LEFT = RIGHT;
					this.planesColor.FRONT = BACK;
					this.planesColor.RIGHT = LEFT;
					this.planesColor.BACK = FRONT;
				}
			} else if (direction === 'z') {
				if (degree === 90) {
					this.planesColor.LEFT = TOP;
					this.planesColor.TOP = RIGHT;
					this.planesColor.RIGHT = BOTTOM;
					this.planesColor.BOTTOM = LEFT;
				} else if (degree === -90) {
					this.planesColor.TOP = LEFT;
					this.planesColor.RIGHT = TOP;
					this.planesColor.BOTTOM = RIGHT;
					this.planesColor.LEFT = BOTTOM;
				} else if (Math.abs(degree) === 180) {
					this.planesColor.LEFT = RIGHT;
					this.planesColor.TOP = BOTTOM;
					this.planesColor.RIGHT = LEFT;
					this.planesColor.BOTTOM = TOP;
				}
			}
		}
	}

	const createCubes = (scene, levels, importRubik, rubik) => {
		const cubes = [];

  		const max = Math.floor(levels / 2);
  		const min = -max;
  		const isEven = levels % 2 === 0;
  		for (let i = min; i <= max; i++) {
  			for (let j = min; j <= max; j++) {
  				for (let k = min; k <= max; k++) {
  					if (isEven && (i * j * k === 0)) {
  						continue;
  					}
  					if ((i > min && i < max) && (j > min && j < max) && (k > min &&  k < max)) {
  						continue;
  					}
  					if (importRubik) {
  						const cubeStatus = rubik[-j + 1][k + 1][i + 1];
  						const cube = new Cube(i, j, k, window.game.size, scene, isEven, levels, cubeStatus);
  						cubes.push(cube);
  					} else {
  						const cube = new Cube(i, j, k, window.game.size, scene, isEven, levels);
						cubes.push(cube);
  					}
  				}
  			}
  		}

		return cubes;
	};

	return {
		COLORS,
		Cube,
		createCubes
	};
})();
