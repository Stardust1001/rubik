
function createCamera (scene) {
	const camera = new BABYLON.ArcRotateCamera("Camera", scene);
	camera.setPosition(new BABYLON.Vector3(200, 200, -400));
	camera.attachControl(canvas, true);

	return camera;
};
