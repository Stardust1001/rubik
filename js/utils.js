
window.utils = ((() => {
	let defaultDuration = 250;
	let defaultFrames = 15;

	let timer = null;

	function getLayerCubes (cubes, direction, floor) {
		const layer = cubes.filter(cube => {
			const { absolutePosition } = cube.box;

			if (Math.abs(absolutePosition[direction]) > 1) {
				if (floor === 1 && absolutePosition[direction] > 0) {
					return true;
				}
				if (floor === -1 && absolutePosition[direction] < 0) {
					return true;
				}
			} else {
				return floor === 0;
			}
			return false;
		});

		return layer;
	}

	async function rotateLayer (cubes, direction, floor, degree, duration = defaultDuration, frames = defaultFrames) {
		const layer = getLayerCubes(cubes, direction, floor);

		return await rotateCubes(layer, direction, degree, duration, frames);
	}

	async function rotateCubes (cubes, direction, degree, duration = defaultDuration, frames = defaultFrames) {
		if (timer) {
			console.log('魔方转动中，请稍后...');
			return false;
		}
		const axis = new BABYLON.Vector3(0, 0, 0);
		axis[direction] = 1;
		const point = axis.clone();
		point[direction] *= 50;
		const angle = Math.PI / 180 * degree;

		const durationPerFrame = duration / frames;
		const anglePerFrame = angle / frames;

		let loops = 0;

		await new Promise((resolve) => {
			timer = null;
			function update () {
				cubes.forEach(cube => {
					cube.box.rotateAround(point, axis, anglePerFrame);
				});
				if (++loops >= frames) {
					clearInterval(timer);
					timer = null;
					cubes.forEach(cube => {
						// 把方块转向，更新它每个面的颜色
						cube.rotate(direction, degree);
					});
					setTimeout(resolve, 50);
				}
			}
			timer = setInterval(update, durationPerFrame);
			update();
		});
		return true;
	}

	function isRotating () {
		return timer !== null;
	}

	function stop () {
		clearInterval(timer);
		timer = null;
		console.log('终止魔方转动');
	}

	function choice (array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	async function sleep (ms) {
		await new Promise(resolve => {
			setTimeout(resolve, ms);
		});
	}

	function setDefaultDuration (duration) {
		defaultDuration = duration;
	}

	function setDefaultFrames (frames) {
		defaultFrames = frames;
	}

	function getRubik (resolver) {
		const cubes = resolver.cubes;
		const rubik = [];
		for (let y = 1; y >= -1; y--) {
			const yLayer = getLayerCubes(cubes, 'y', y);
			rubik[-y + 1] = [];
			for (let z = 1; z >= -1; z--) {
				const zLayer = getLayerCubes(cubes, 'z', z);
				rubik[-y + 1][-z + 1] = [];
				for (let x = -1; x <= 1; x++) {
					if (!y && !z && !x) {
						continue;
					}
					const xLayer = getLayerCubes(cubes, 'x', x);
					const cube = getIntersection(yLayer, zLayer, xLayer)[0];
					const colors = { };
					Object.keys(cube.planesColor).forEach(key => {
						if (cube.planesColor[key]) {
							colors[key] = cube.planesColor[key];
						}
					});
					rubik[-y + 1][-z + 1][x + 1] = {
						'上下': - y + 1 + 1,
						'后前': -z + 1 + 1,
						'左右': x + 1 + 1,
						...colors
					};
				}
			}
		}
		return rubik;
	}

	function getIntersection (...arrays) {
		if (!arrays.length) return null;
		const [first, ...others] = arrays;
		let uniques = first;
		for (let i = 0, len = others.length; i < len; i++) {
			const arr = others[i];
			uniques = uniques.filter(ele => arr.includes(ele));
		}
		return uniques;
	}

	return {
		getLayerCubes,
		rotateLayer,
		rotateCubes,
		isRotating,
		stop,
		choice,
		sleep,
		setDefaultDuration,
		setDefaultFrames,
		getRubik,
		getIntersection
	};
})());
