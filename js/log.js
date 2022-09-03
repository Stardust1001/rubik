
(function () {
	const display = document.querySelector('#display');

	const colors = ['white', 'orange', 'green', 'red', 'blue', 'yellow'];
	const colorMap = {
		white: '白',
		orange: '橙',
		green: '绿',
		red: '红',
		blue: '蓝',
		yellow: '黄'
	};

	const log = console.log;

	console.log = function (...params) {
		const message = document.createElement('div');
		message.classList.add('message');

		const text = params.join('');
		const [label, info] = text.split(' : ');
		const labelSpan = document.createElement('span');
		labelSpan.classList.add('label');
		labelSpan.textContent = label;
		message.appendChild(labelSpan);

		if (info) {
			const infoSpan = document.createElement('span');
			infoSpan.classList.add('info');
			let infoHTML = info;
			colors.forEach(color => {
				infoHTML = infoHTML.replace(color, `<span style="background-color: ${color};">${colorMap[color]}</span>`);
			});
			infoSpan.innerHTML = infoHTML;
			message.appendChild(infoSpan);
		}

		display.appendChild(message);
		display.scrollBy(0, 30);

		log(...params);
	};
})();
