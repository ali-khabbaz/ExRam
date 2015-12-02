main();


function main() {
	'use strict';

	var a = 2,
		b = 2,
		c = 2,
		i = 1,
		m = 1,
		l = 2000,
		j = 1,
		beshmor = 0,
		ali = 0;
	for (m = l; m >= 0; m--) {
		for (i = 0; i <= m; i++) {
			for (j = 0; j + i <= m; j++) {
				ali++;
				if (triangle(a + i, b + j, c + (m - (i + j)))) {
					++beshmor;
				}
			}
		}
	}
	console.log(beshmor, ali);
}

function triangle(a, b, c) {
	'use strict';
	return (a + b > c) && (a + c > b) && (b + c > a);
}