
function saveJsonFile (data) {
	const text = JSON.stringify(data, null, 4);
	const blob = new Blob([text], { type: 'application/json,charset=utf-8' });
	window.saveAs(blob, '魔方.json');
}
