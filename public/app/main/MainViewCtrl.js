(function () {
	'use strict';
	define(['app'], function (app) {
		app.controller('MainViewCtrl', MainViewCtrl);

		MainViewCtrl.$inject = ['mainViewFactory', '$location', 'MtpApiManager'];

		function MainViewCtrl(mainViewFactory, $location, MtpApiManager) {
			/* js hint valid this: true*/
			var vm = this;
			vm.list = 'mainviewcontroller loaded';
			//getTelUserId();

			function getTelUserId() {
				MtpApiManager.getUserID().then(function (id) {
					console.log('----------', id);
					if (id) {
						$location.url('/im');
						return;
					} else {
						$location.url('/login');
					}
				});
			}


		}
	});
}());