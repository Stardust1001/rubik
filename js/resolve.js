
class Resolver {

	static defaultRandomSteps = 20;

	static moveTypes = [
		'U', 'Uv',
		'D', 'Dv',
		'L', 'Lv',
		'R', 'Rv',
		'F', 'Fv',
		'B', 'Bv',
		'UM', 'UMv',
		'FM', 'FMv',
		'RM', 'RMv'
	];

	constructor (cubes) {
		this.cubes = cubes;
		this.moves = [];
		this.currentMoveIndex = 0;
	}

	async resolve () {
		console.log('开始复原');
		await utils.sleep(500);

		console.log('开始复原第一层');
		await this.resolveFirstFloor();

		console.log('第一层复原完成');
		await utils.sleep(500);

		console.log('开始复原第二层');
		await this.resolveSecondFloor();

		console.log('第二层复原完成');
		await utils.sleep(500);
		
		console.log('开始复原第三层');
		await this.resolveThirdFloor();

		console.log('魔方复原完成');

		utils.setDefaultDuration(250);
		utils.setDefaultFrames(15);
	}

	async resolveFirstFloor () {
		// 白色放上面
		await this.makeWhiteCenterOnTop();
		// 橙色放前面
		await this.makeColorCenterOnFront('orange');

		// 依次对第一层 4 个棱块，归位
		const edgeColors = ['orange', 'green', 'red', 'blue'];
		for (let color of edgeColors) {
			console.log('复原第一层棱块 : ' + color);
			await this.resolveFirstFloorEdgeColorCube(color);
			await utils.sleep(250);
		}

		// 橙色面放前面
		await this.rotateRubik('y', 90);

		// 依次对第一层 4 个角块，归位
		const cornerColors = [
			['orange', 'green'],
			['green', 'red'],
			['red', 'blue'],
			['blue', 'orange']
		];
		for (let color of cornerColors) {
			console.log('复原第一层角块 : ' + color[0] + ' - ' + color[1]);
			await this.resolveFirstFloorCornerColorCube(color);
			await utils.sleep(250);
		}

		// 橙色面放前面
		await this.rotateRubik('y', 90);
	}

	async resolveSecondFloor () {
		// 白色放底下
		await this.makeWhiteCenterOnBottom();

		// 橙色绿色放前面
		await this.makeColorCenterOnFront('green');

		// 依次对第二层 4 个棱块，归位
		const edgeColors = [
			['green', 'orange'],
			['red', 'green'],
			['blue', 'red'],
			['orange', 'blue']
		];

		for (let color of edgeColors) {
			console.log('复原第二层棱块 : ' + color);
			await this.resolveSecondFloorEdgeCube(color);
			await utils.sleep(250);
		}

		// 橙色绿色放前面
		await this.rotateRubik('y', -90);
	}

	async resolveThirdFloor () {
		console.log('开始处理第三层十字');
		await this.resolveThirdFloorCross();

		console.log('开始处理第三层黄色面');
		await this.resolveThirdFloorYellowTops();

		console.log('开始处理第三层四个角块顺序');
		await this.fixThirdFloorCorners();

		console.log('开始处理第三层棱块顺序');
		await this.fixThirdFloorEdges();

		console.log('开始处理第三层层的方向');
		await this.resolveThirdFloorDirection();
	}

	async makeWhiteCenterOnTop () {
		const center = this.cubes.find(cube => cube.isCenter && cube.colors.white);

		const plane = this.getPlaneOfCenter(center);

		let move = null;
		switch (plane) {
			case 'LEFT': move = ['z', -90];break;
			case 'RIGHT': move = ['z', 90];break;
			case 'FRONT': move = ['x', 90];break;
			case 'BACK': move = ['x', -90];break;
			case 'BOTTOM': move = ['z', 180];break;
			default: return ;
		}
		await this.rotateRubik(move[0], move[1]);
	}

	async makeWhiteCenterOnBottom () {
		const center = this.cubes.find(cube => cube.isCenter && cube.colors.white);

		const plane = this.getPlaneOfCenter(center);

		let move = null;
		switch (plane) {
			case 'LEFT': move = ['z', 90];break;
			case 'RIGHT': move = ['z', -90];break;
			case 'FRONT': move = ['x', -90];break;
			case 'BACK': move = ['x', 90];break;
			case 'TOP': move = ['z', 180];break;
			default: return ;
		}
		await this.rotateRubik(move[0], move[1]);
	}

	async makeColorCenterOnFront (color) {
		const center = this.cubes.find(cube => cube.isCenter && cube.colors[color]);

		const plane = this.getPlaneOfCenter(center);

		let move = null;
		switch (plane) {
			case 'LEFT': move = ['y', -90];break;
			case 'RIGHT': move = ['y', 90];break;
			case 'BACK': move = ['y', 180];break;
			default: return ;
		}
		await this.rotateRubik(move[0], move[1]);
	}

	async resolveFirstFloorEdgeColorCube (color) {
		await this.makeColorCenterOnFront(color);
		const cube = this.cubes.find(cube => cube.isEdge && cube.colors.white && cube.colors[color]);
		const planes = this.getPlanesOfCube(cube);
		const { TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK } = cube.planesColor;
		if (planes.TOP) {
			if (planes.FRONT) {
				if (TOP !== 'white') {
					await this.move('Fv,UMv=2,F=2,UM,Fv,UM');
				}
			} else if (planes.LEFT) {
				if (TOP === 'white') {
					await this.move('L,UMv,Lv,Fv,UM');
				} else {
					await this.move('L,F');
				}
			} else if (planes.RIGHT) {
				if (TOP === 'white') {
					await this.move('Rv,UM,R,F,UMv');
				} else {
					await this.move('Rv,Fv');
				}
			} else if (planes.BACK) {
				if (TOP === 'white') {
					await this.move('B=2,D=2,F=2');
				} else {
					await this.move('Bv,UM,Fv,UMv')
				}
			}
		} else if (planes.BOTTOM) {
			if (planes.FRONT) {
				if (BOTTOM === 'white') {
					await this.move('F=2');
				} else {
					await this.move('Dv,Lv,F,L,D');
				}
			} else if (planes.LEFT) {
				if (BOTTOM === 'white') {
					await this.move('D,F=2');
				} else {
					await this.move('Lv,F,L');
				}
			} else if (planes.RIGHT) {
				if (BOTTOM === 'white') {
					await this.move('Dv,F=2');
				} else {
					await this.move('R,Fv,Rv');
				}
			} else if (planes.BACK) {
				if (BOTTOM === 'white') {
					await this.move('D=2,F=2');
				} else {
					await this.move('Dv,R,Fv,Rv');
				}
			}
		} else if (planes.FRONT) {
			if (planes.LEFT) {
				if (LEFT === 'white') {
					await this.move('F');
				} else {
					await this.move('UMv,Fv,UM');
				}
			} else if (planes.RIGHT) {
				if (RIGHT === 'white') {
					await this.move('Fv');
				} else {
					await this.move('UM,F,UMv');
				}
			}
		} else if (planes.BACK) {
			if (planes.LEFT) {
				if (LEFT === 'white') {
					await this.move('UMv=2,Fv,UM=2');
				} else {
					await this.move('UMv,F,UM');
				}
			} else {
				if (RIGHT === 'white') {
					await this.move('UM=2,F,UMv=2');
				} else {
					await this.move('UM,Fv,UMv');
				}
			}
		}
	}

	async resolveFirstFloorCornerColorCube (color) {
		const [leftColor, rightColor] = color;
		await this.makeColorCenterOnFront(leftColor);
		const cube = this.cubes.find(cube => {
			return cube.isCorner && cube.colors.white && cube.colors[leftColor] && cube.colors[rightColor];
		});
		const planes = this.getPlanesOfCube(cube);
		const { TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK } = cube.planesColor;
		if (planes.TOP) {
			if (planes.LEFT) {
				if (planes.FRONT) {
					if (TOP === 'white') {
						await this.move('L,D=2,Lv,F,Dv,Fv');
					} else if (FRONT === 'white') {
						await this.move('Fv,D=2,F=2,Dv,Fv');
					} else if (LEFT === 'white') {
						await this.move('L,Rv,D,Lv,R');
					}
				} else if (planes.BACK) {
					if (TOP === 'white') {
						await this.move('Lv,D,L,Dv,F,Dv,Fv');
					} else if (LEFT === 'white') {
						await this.move('Lv,Dv,L,F,Dv,Fv');
					} else if (BACK === 'white') {
						await this.move('B,D,Bv,Rv,D,R');
					}
				}
			} else if (planes.RIGHT) {
				if (planes.FRONT) {
					if (FRONT === 'white') {
						await this.move('F,D,Fv,Dv=2,Rv,D,R');
					} else if (RIGHT === 'white') {
						await this.move('Rv,Dv,R,D=2,F,Dv,Fv');
					}
				} else if (planes.BACK) {
					if (TOP === 'white') {
						await this.move('Bv,Dv=2,B,Rv,D,R');
					} else if (RIGHT === 'white') {
						await this.move('R,Dv=2,Rv=2,D,R');
					} else if (BACK === 'white') {
						await this.move('Bv,F,Dv,B,Fv');
					}
				}
			}
		} else if (planes.BOTTOM) {
			if (planes.LEFT) {
				if (planes.FRONT) {
					if (FRONT === 'white') {
						await this.move('D=2,F,Dv,Fv');
					} else if (LEFT === 'white') {
						await this.move('Rv,D,R');
					} else if (BOTTOM === 'white') {
						await this.move('D,Rv,Dv=2,R,D=2,F,Dv,Fv');
					}
				} else if (planes.BACK) {
					if (LEFT === 'white') {
						await this.move('Dv,F,Dv,Fv');
					} else if (BACK === 'white') {
						await this.move('Rv,D=2,R');
					} else if (BOTTOM === 'white') {
						await this.move('D=2,F,D=2,Fv,Dv=2,Rv,D,R');
					}
				}
			} else if (planes.RIGHT) {
				if (planes.FRONT) {
					if (FRONT === 'white') {
						await this.move('Dv,Rv,D,R');
					} else if (RIGHT === 'white') {
						await this.move('D,F,Dv,Fv');
					} else if (BOTTOM === 'white') {
						await this.move('F,D=2,Fv,Dv=2,Rv,D,R');
					}
				} else if (planes.BACK) {
					if (RIGHT === 'white') {
						await this.move('Dv=2,Rv,D,R');
					} else if (BACK === 'white') {
						await this.move('F,Dv,Fv');
					} else if (BOTTOM === 'white') {
						await this.move('Dv,F,D=2,Fv,Dv=2,Rv,D,R');
					}
				}
			}
		}
	}

	async resolveSecondFloorEdgeCube (color) {
		const [leftColor, rightColor] = color;
		await this.makeColorCenterOnFront(leftColor);
		const cube = this.cubes.find(cube => {
			return cube.isEdge && cube.colors[leftColor] && cube.colors[rightColor];
		});
		const planes = this.getPlanesOfCube(cube);
		const { TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK } = cube.planesColor;
		// 如果方块已经在该在的位置
		if (planes.FRONT && planes.RIGHT) {
			// 方块位置正确，但是方向反了
			if (FRONT !== leftColor) {
				// 拿出来
				await this.move('U,R,Uv,Rv,Uv,Fv,U,F');
				// 转到 FRONT 层
				await this.move('U=2');
				// 放进去
				await this.move('U,R,Uv,Rv,Uv,Fv,U,F');
			}
			return ;
		}
		// 如果方块不是在上层，那么它在第二层错误的位置，把它从第二层拿出来
		if (!planes.TOP) {
			// 首先，转到它所在的面，让它居于右前方
			let degree = 0;
			if (planes.FRONT) {
				if (planes.LEFT) {
					degree = -90;
				}
			} else if (planes.BACK) {
				if (planes.LEFT) {
					degree = 180;
				} else if (planes.RIGHT) {
					degree = 90;
				}
			}
			await this.rotateRubik('y', degree);
			// 把它拿出来
			await this.move('U,R,Uv,Rv,Uv,Fv,U,F');

			// 方便起见，拿出来后，重新处理这一个棱块
			await this.resolveSecondFloorEdgeCube(color);
			return ;
		}
		if (planes.FRONT) {
			if (TOP !== rightColor) {
				await this.move('Uv');
			}
		} else if (planes.LEFT) {
			if (TOP === rightColor) {
				await this.move('Uv');
			} else {
				await this.move('Uv=2');
			}
		} else if (planes.BACK) {
			if (TOP === rightColor) {
				await this.move('U=2');
			} else {
				await this.move('U');
			}
		} else if (planes.RIGHT) {
			if (TOP === rightColor) {
				await this.move('U');
			}
		}
		if (TOP === rightColor) {
			await this.move('U,R,Uv,Rv,Uv,Fv,U,F');
		} else {
			await this.move('Uv,Fv,U,F,U,R,Uv,Rv');
		}
	}

	async resolveThirdFloorCross () {
		const edgeColors = ['orange', 'green', 'red', 'blue'];
		const edges = edgeColors.map(color => {
			const cube = this.cubes.find(cube => cube.isEdge && cube.colors.yellow && cube.colors[color]);
			const planes = this.getPlanesOfCube(cube);
			const { TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK } = cube.planesColor;
			return { cube, planes, TOP, LEFT, FRONT, RIGHT, BACK };
		});
		const yellowTopCubes = edges.filter(edge => edge.TOP === 'yellow');
		const numYellowTOPs = yellowTopCubes.length;
		// 已经有 4 个黄色在上了，十字已经好了
		if (numYellowTOPs === 4) {
			return ;
		}
		// 如果一个黄色在上的都没有
		if (numYellowTOPs === 0) {
			await this.move('F,R,U,Rv,Uv,Fv');
			await this.move('U=2');
			await this.move('F,R,U,Rv,Uv,Fv');
			await this.move('F,R,U,Rv,Uv,Fv');
			return ;
		}
		// 否则就是两个黄色的在上面
		const [cube1, cube2] = yellowTopCubes;
		// 如果两个黄色的是一条横线
		if (cube1.planes.LEFT && cube2.planes.RIGHT || cube1.planes.RIGHT && cube2.planes.LEFT) {
			await this.move('F,R,U,Rv,Uv,Fv');
			return ;
		}
		// 如果是一条竖线
		if (cube1.planes.FRONT && cube2.planes.BACK || cube1.planes.BACK && cube2.planes.FRONT) {
			await this.move('U');
			await this.move('F,R,U,Rv,Uv,Fv');
			return ;
		}
		// 否则，就是相邻的两个黄色方块
		// 把它俩转到左面和后面
		if (cube1.planes.LEFT) {
			if (cube2.planes.FRONT) {
				await this.move('U');
			}
		} else if (cube1.planes.FRONT) {
			if (cube2.planes.LEFT) {
				await this.move('U');
			} else if (cube2.planes.RIGHT) {
				await this.move('U=2');
			}
		} else if (cube1.planes.RIGHT) {
			if (cube2.planes.FRONT) {
				await this.move('U=2');
			} else if (cube2.planes.BACK) {
				await this.move('Uv');
			}
		} else if (cube1.planes.BACK) {
			if (cube2.planes.RIGHT) {
				await this.move('Uv');
			}
		}
		await this.move('F,R,U,Rv,Uv,Fv');
		await this.move('F,R,U,Rv,Uv,Fv');
	}

	async resolveThirdFloorYellowTops () {
		const cornerCubes = this.cubes.filter(cube => cube.isCorner && cube.colors.yellow);
		const corners = cornerCubes.map(cube => {
			const planes = this.getPlanesOfCube(cube);
			const { TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK } = cube.planesColor;
			return { cube, planes, TOP, FRONT, LEFT, BACK, RIGHT };
		});
		const yellowTopCorners = corners.filter(corner => corner.TOP === 'yellow');
		const numYellowTOPs = yellowTopCorners.length;
		// 4 个角块都是黄色朝上，黄色面好了
		if (numYellowTOPs === 4) {
			return ;
		}
		// 如果 0 个角块黄色朝上
		if (numYellowTOPs === 0) {
			const shape = await this.putNonYellowCornersTowardSide(corners);
			if (shape === 'H') {
				await this.move('Rv,Uv,R,Uv,Rv,U=2,R');
				await this.move('Rv,Uv,R,Uv,Rv,U=2,R');
			} else if (shape === 'JL') {
				await this.move('Rv,Uv,R,Uv,Rv,U=2,R');
				await this.move('U');
				await this.move('Rv,Uv,R,Uv,Rv,U=2,R');
			}
			return ;
		}
		// 只有 1 个角块黄色朝上，是小鱼
		if (numYellowTOPs === 1) {
			// 先把鱼头放到 左后 方，固定它的方向，然后检查鱼尾的方向
			const corner = yellowTopCorners[0];
			const direction = await this.putFishHeadAtLeftBackAndCheckTailDirection(corner, corners);
			if (direction === 'back') {
				await this.move('Rv,Uv,R,Uv,Rv,U=2,R');
			} else {
				await this.move('U');
				await this.move('L,U,Lv,U,L,U=2,Lv');
			}
			return ;
		}
		// 有 2 个角块黄色朝上
		// 检查是否坦克形状，如果是，让它旋转到炮筒在后面
		const [isTank, barrelDirection] = await this.checkTankAndPutItTowardBack(yellowTopCorners, corners);
		if (isTank) {
			if (barrelDirection === 'back') {
				// 炮筒朝 后
				await this.move('Rv,Uv,R,Uv,Rv,Uv=2,R');
				await this.move('U=2');
				await this.move('L,U,Lv,U,L,U=2,Lv');
			} else if (barrelDirection === 'side') {
				// 炮筒朝 两边
				await this.move('Rv,Uv,R,Uv,Rv,Uv=2,R');
				await this.move('L,U,Lv,U,L,U=2,Lv');
			}
			return ;
		}
		// 不是坦克，是风筝形状的
		await this.putKiteTowardRightBack(yellowTopCorners, corners);
		await this.move('Rv,Uv,R,Uv,Rv,U=2,R');
		await this.move('U');
		await this.move('L,U,Lv,U,L,U=2,Lv');
	}

	async fixThirdFloorCorners () {
		const cornerCubes = this.cubes.filter(cube => cube.isCorner && cube.colors.yellow);
		const corners = cornerCubes.map(cube => {
			const planes = this.getPlanesOfCube(cube);
			const { TOP, LEFT, FRONT, RIGHT, BACK } = cube.planesColor;
			return { cube, planes, TOP, LEFT, FRONT, RIGHT, BACK };
		});
		const sameSideCubes = await this.findThirdFloorSameSideCubes(corners);

		// 如果有 2 个角块，在某一面有同样的颜色
		// 如果没有，那也是这套动作

		await this.rotateRubik('x', -90);
		await this.move('Rv=2,D=2,Rv,Uv,R,D=2,Rv,U,Rv');
		await this.rotateRubik('x', 90);

		// 没有的话，还得再来一次
		if (sameSideCubes.length === 0) {
			await this.fixThirdFloorCorners();
		}
	}

	async fixThirdFloorEdges () {
		const floorCubes = this.cubes.filter(cube => cube.planesColor.TOP === 'yellow');
		const edges = floorCubes.filter(cube => cube.isEdge && cube.colors.yellow);
		const samePlaneCubes = [];
		const directions = ['LEFT', 'FRONT', 'RIGHT', 'BACK'];

		let sameDirection = '';

		directions.forEach(direction => {
			const directionCubes = floorCubes.filter(cube => cube.planesColor[direction]);
			const directionColors = [];
			directionCubes.forEach(cube => {
				const color = cube.planesColor[direction];
				if (color && !directionColors.includes(color)) {
					directionColors.push(color);
				}
			});
			// 这一面，顶层只有一个颜色，说明这一面的顶层三块，同色
			if (directionColors.length === 1) {
				samePlaneCubes.push(...directionCubes);
				sameDirection = direction;
			}
		});

		// 如果只有 3 个方块是同一面同色的，就是还差三个棱块的位置需要处理
		if (samePlaneCubes.length === 3) {
			// 把这三个同色的方块，放到后面
			if (sameDirection === 'FRONT') {
				await this.move('U=2');
			} else if (sameDirection === 'LEFT') {
				await this.move('U');
			} else if (sameDirection === 'RIGHT') {
				await this.move('Uv');
			}
			await this.fixLastThreeEdgesPositions();
		} else if (samePlaneCubes.length === 0) {

			// 顶层四个面都是两两同色，但没有三个同色的
			// 二话不说，先梭一把，就出来三个同色的了
			await this.move('R,Uv,R,U,R,U,R,Uv,Rv,Uv,Rv=2');
			// 懒省事，再调用这个函数，让上面那个 if 去处理
			await this.fixThirdFloorEdges();
		}
	}

	async resolveThirdFloorDirection () {
		// 顶层方块都好了，就差层的方向需要处理了
		const greenEdgeCube = this.cubes.find(cube => cube.isEdge && cube.colors.yellow && cube.colors.green);
		const planes = this.getPlanesOfCube(greenEdgeCube);
		if (planes.LEFT) {
			await this.move('Uv');
		} else if (planes.RIGHT) {
			await this.move('U');
		} else if (planes.BACK) {
			await this.move('U=2');
		}
		await this.rotateRubik('z', 180);
		await this.rotateRubik('y', -90);
	}

	async fixLastThreeEdgesPositions () {
		const frontEdgeCube = this.cubes.find(cube => {
			if (cube.isEdge && cube.colors.yellow) {
				const planes = this.getPlanesOfCube(cube);
				return planes.FRONT;
			}
			return false;
		});
		const rightFrontCornerCube = this.cubes.find(cube => {
			if (cube.isCorner && cube.colors.yellow) {
				const planes = this.getPlanesOfCube(cube);
				return planes.FRONT && planes.RIGHT;
			}
			return false;
		});
		// 顶层三个棱块，得 逆时针 转动复原
		if (frontEdgeCube.planesColor.FRONT === rightFrontCornerCube.planesColor.RIGHT) {
			await this.move('R,Uv,R,U,R,U,R,Uv,Rv,Uv,Rv=2');			
		} else {
			// 顺时针 转动复原
			await this.move('Lv,U,Lv,Uv,Lv,Uv,Lv,U,L,U,L=2');
		}
	}

	async findThirdFloorSameSideCubes (corners) {
		const directions = ['LEFT', 'FRONT', 'RIGHT', 'BACK'];
		const sameSideCorners = [];
		const sameDirections = [];

		for (let a of corners) {
			for (let b of corners) {
				if (a === b) {
					continue;
				}
				directions.forEach(direction => {
					if (!sameDirections.includes(direction) && a[direction] && (a[direction] === b[direction])) {
						sameDirections.push(direction);
						sameSideCorners.push(a);
						sameSideCorners.push(b);
					}
				});
			}
		}
		if (sameSideCorners.length === 2) {
			// 如果有 2 个角块，在某一面有同样的颜色
			// 把它俩转到右边
			const direction = sameDirections[0];
			if (direction === 'FRONT') {
				await this.move('Uv');
			} else if (direction === 'LEFT') {
				await this.move('Uv=2');
			} else if (direction === 'BACK') {
				await this.move('U');
			}
		}
		return sameSideCorners;
	}

	async putNonYellowCornersTowardSide (corners) {
		const lfCorner = corners.find(corner => corner.planes.LEFT && corner.planes.FRONT);
		const rfCorner = corners.find(corner => corner.planes.RIGHT && corner.planes.FRONT);
		const lbCorner = corners.find(corner => corner.planes.LEFT && corner.planes.BACK);
		if (lfCorner.LEFT === 'yellow') {
			if (lbCorner.LEFT === 'yellow') {
				if (rfCorner.RIGHT === 'yellow') {
					return 'H';
				} else if (rfCorner.FRONT === 'yellow') {
					return 'JL';
				}
			} else if (lbCorner.BACK === 'yellow') {
				await this.move('Uv');
				return 'JL';
			}
		} else if (lfCorner.FRONT === 'yellow') {
			if (lbCorner.BACK === 'yellow') {
				if (rfCorner.FRONT === 'yellow') {
					await this.move('U');
					return 'H';
				} else if (rfCorner.RIGHT === 'yellow') {
					await this.move('U=2');
					return 'JL';
				}
			} else if (lbCorner.LEFT === 'yellow') {
				await this.move('U');
				return 'JL';
			}
		}
	}

	async putFishHeadAtLeftBackAndCheckTailDirection (corner, corners) {
		const { planes } = corner;
		// 先把鱼头放到 左后 方
		if (planes.LEFT && planes.FRONT) {
			await this.move('U');
		} else if (planes.FRONT && planes.RIGHT) {
			await this.move('U=2');
		} else if (planes.RIGHT && planes.BACK) {
			await this.move('Uv');
		}
		const rightBackCube = corners.filter(corner => {
			const planes = this.getPlanesOfCube(corner.cube);
			return planes.RIGHT && planes.BACK;
		})[0].cube;
		// 在这个角度看，第一个鱼尾朝 后
		if (rightBackCube.planesColor.BACK === 'yellow') {
			return 'back';
		}
		// 在这个角度看，第一个鱼尾朝 右
		return 'right';
	}

	async checkTankAndPutItTowardBack (yellowTopCorners, corners) {
		const directions = ['LEFT', 'FRONT', 'RIGHT', 'BACK'];
		const [planes1, planes2] = yellowTopCorners.map(corner => this.getPlanesOfCube(corner.cube));
		const isTank = directions.some(direction => {
			return planes1[direction] && planes2[direction];
		});
		if (!isTank) {
			return [false, null];
		}
		// 把炮筒放在 后 面
		if (planes1.LEFT && planes1.BACK) {
			if (planes2.LEFT && planes2.FRONT) {
				await this.move('Uv');
			} else if (planes2.BACK && planes2.RIGHT) {
				await this.move('U=2');
			}
		} else if (planes1.FRONT && planes1.LEFT) {
			if (planes2.LEFT && planes2.BACK) {
				await this.move('Uv');
			}
		} else if (planes1.FRONT && planes1.RIGHT) {
			if (planes2.RIGHT && planes2.BACK) {
				await this.move('U');
			}
		} else if (planes1.RIGHT && planes1.BACK) {
			if (planes2.FRONT && planes2.RIGHT) {
				await this.move('U');
			} else if (planes2.LEFT && planes2.BACK) {
				await this.move('U=2');
			}
		}
		// 检查炮筒 方向
		const barrelCube1 = corners.find(corner => !yellowTopCorners.includes(corner)).cube;
		if (barrelCube1.planesColor.BACK === 'yellow') {
			return [true, 'back'];
		}
		await this.move('Uv');
		return [true, 'side'];
	}

	async putKiteTowardRightBack (yellowTopCorners, corners) {
		const cube1 = yellowTopCorners[0].cube;
		const cube2 = corners.find(corner => !yellowTopCorners.includes(corner)).cube;
		const planes1 = this.getPlanesOfCube(cube1);
		const planes2 = this.getPlanesOfCube(cube2);
		if (planes1.LEFT && planes1.BACK) {
			if (planes2.LEFT && planes2.FRONT) {
				if (cube2.planesColor.FRONT === 'yellow') {
					await this.move('Uv');
				} else if (cube2.planesColor.LEFT === 'yellow') {
					await this.move('U');
				}
			} else if (planes2.RIGHT && planes2.BACK) {
				if (cube2.planesColor.BACK === 'yellow') {
					await this.move('U');
				}
			}
		} else if (planes1.LEFT && planes1.FRONT) {
			if (planes2.LEFT && planes2.BACK) {
				if (cube2.planesColor.LEFT === 'yellow') {
					await this.move('U=2');
				}
			} else if (planes2.RIGHT && planes2.FRONT) {
				if (cube2.planesColor.FRONT === 'yellow') {
					await this.move('U=2');
				}
			}
		} else if (planes1.FRONT && planes1.RIGHT) {
			if (planes2.LEFT && planes2.FRONT) {
				if (cube2.planesColor.FRONT === 'yellow') {
					await this.move('U=2');
				}
			} else if (planes2.RIGHT && planes2.BACK) {
				if (cube2.planesColor.BACK === 'yellow') {
					await this.move('U');
				}
			}
		} else if (planes1.RIGHT && planes1.BACK) {
			if (planes2.LEFT && planes2.BACK) {
				if (cube2.planesColor.LEFT === 'yellow') {
					await this.move('U=2');
				}
			} else if (planes2.FRONT && planes2.RIGHT) {
				if (cube2.planesColor.FRONT === 'yellow') {
					await this.move('U=2');
				}
			}
		}
	}

	async rotateRubik (direction, degree) {
		await utils.rotateCubes(this.cubes, direction, degree);
		this.moves.push({ type: 'rotateRubik', direction, degree });
		this.currentMoveIndex += 1;
		return true;
	}

	async move (steps) {
		const moves = steps.split(',');
		let ok = false;
		for (let move of moves) {
			const [name, times] = move.split('=');
			ok = await this[name](times || 1);
			if (!ok) {
				break;
			}
		}
		if (!ok) {
			return false;
		}
		this.moves.push({
			type: 'group',
			moves: moves.map(move => {
				const [name, times] = move.split('=');
				return {
					type: name,
					times: times || 1
				}
			})
		});
		this.currentMoveIndex += 1;
		return true;
	}

	async U (times = 1) {
		return await utils.rotateLayer(this.cubes, 'y', 1, 90 * times);
	}

	async Uv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'y', 1, -90 * times);
	}

	async D (times = 1) {
		return await utils.rotateLayer(this.cubes, 'y', -1, -90 * times);
	}

	async Dv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'y', -1, 90 * times);
	}

	async L (times = 1) {
		return await utils.rotateLayer(this.cubes, 'x', -1, -90 * times);
	}

	async Lv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'x', -1, 90 * times);
	}

	async R (times = 1) {
		return await utils.rotateLayer(this.cubes, 'x', 1, 90 * times);
	}

	async Rv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'x', 1, -90 * times);
	}

	async F (times = 1) {
		return await utils.rotateLayer(this.cubes, 'z', -1, -90 * times);
	}

	async Fv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'z', -1, 90 * times);
	}

	async B (times = 1) {
		return await utils.rotateLayer(this.cubes, 'z', 1, 90 * times);
	}

	async Bv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'z', 1, -90 * times);
	}

	async UM (times = 1) {
		return await utils.rotateLayer(this.cubes, 'y', 0, 90 * times);
	}

	async UMv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'y', 0, -90 * times);
	}

	async FM (times = 1) {
		return await utils.rotateLayer(this.cubes, 'z', 0, -90 * times);
	}

	async FMv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'z', 0, 90 * times);
	}

	async RM (times = 1) {
		return await utils.rotateLayer(this.cubes, 'x', 0, 90 * times);
	}

	async RMv (times = 1) {
		return await utils.rotateLayer(this.cubes, 'x', 0, 90 * times);
	}

	getPlaneOfCenter (cube) {
		const planes = this.getPlanesOfCube(cube);
		return Object.keys(planes)[0];
	}

	getPlanesOfCube (cube) {
		let { x, y, z } = cube.box.absolutePosition;
		x = Math.abs(x) < 1e-2 ? 0 : x;
		y = Math.abs(y) < 1e-2 ? 0 : y;
		z = Math.abs(z) < 1e-2 ? 0 : z;

		const planes = { };

		y > 0 && (planes.TOP = true);
		y < 0 && (planes.BOTTOM = true);
		x < 0 && (planes.LEFT = true);
		x > 0 && (planes.RIGHT = true);
		z < 0 && (planes.FRONT = true);
		z > 0 && (planes.BACK = true);

		return planes;
	}

	async prev () {
		if (this.currentMoveIndex > 1) {
			let ok = false;
			const move = this.moves[this.currentMoveIndex - 1];
			if (move.type === 'rotateRubik') {
				ok = await utils.rotateCubes(this.cubes, move.direction, -move.degree);
			} else if (move.type === 'group') {
				for (let i = move.moves.length - 1; i >= 0; i--) {
					ok = await this[move.moves[i].type](-move.moves[i].times);
					if (!ok) {
						break;
					}
				}
			} else {
				ok = await this[move.type](-move.times);
			}
			if (ok) {
				this.currentMoveIndex -= 1;
			}
			return ok;
		}
		return false;
	}

	async next () {
		if (this.currentMoveIndex < this.moves.length) {
			let ok = false;
			const move = this.moves[this.currentMoveIndex];
			if (move.type === 'rotateRubik') {
				ok = await utils.rotateCubes(this.cubes, move.direction, move.degree);
			} else if (move.type === 'group') {
				for (let m of move.moves) {
					ok = await this[m.type](m.times);
					if (!ok) {
						break;
					}
				}
			} else {
				ok = await this[move.type](move.times);
			}
			if (ok) {
				this.currentMoveIndex += 1;
			}
			return ok;
		}
		return false;
	}

	async randomIt (steps) {
		const timesList = [1, -1, 2];
		const moves = Array.from({ length: steps || Resolver.defaultRandomSteps }).map((ele, index) => {
			return {
				type: utils.choice(Resolver.moveTypes),
				times: utils.choice(timesList)
			};
		});
		for (let move of moves) {
			await this[move.type](move.times);
			this.moves.push(move);
			this.currentMoveIndex += 1;
		}
	}
}
