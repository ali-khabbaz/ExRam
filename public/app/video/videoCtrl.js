(function () {
	//'use strict';
	define(['app'], function (app) {
		app.controller('videoCtrl', videoCtrl);
		videoCtrl.$inject = ['$http', 'mainViewFactory', '$routeParams', '$sce'];

		function videoCtrl($http, mainFac, par, $sce) {
			var vm = this;
			vm.current_video_address = '';
			vm.parameter = par;
			vm.video_data = [];
			vm.sec_list_data = [];
			vm.sections_data = [];
			vm.video_data_load = false;
			vm.format = '';
			getVideo();
			getSecList();
			getSections();

			function getVideo() {
				var url = mainFac.apiUrl + "app/video";
				$http.post(url, {
					"article_id": par.art_id,
					"section_id": par.sec_id,
					"video_id": par.vid_id,
				}).success(function (res) {
					if (res.err) {
						console.log('err', res.err);
					} else {
						vm.video_data = res.data[0];
						vm.format = '.' + vm.video_data.video_name.split('.')[1];
						vm.video_data.video_name = vm.video_data.video_name.split('.')[0];
						vm.current_video_address = $sce.trustAsResourceUrl('videos/' + vm.video_data.article_id + '/' +
							vm.video_data.section_id + '/' + vm.video_data.video_id + vm.format);
						vm.video_data_load = true;
					}
				});
			}

			function getSecList() {
				var url = mainFac.apiUrl + "app/sec_list";
				$http.post(url, {
					"article_id": par.art_id,
					"section_id": par.sec_id
				}).success(function (res) {
					if (res.err) {
						console.log('err', res.err);
					} else {
						vm.sec_list_data = res.data;
					}
				});
			}

			function getSections() {
				var url = mainFac.apiUrl + "app/sections";
				$http.post(url, {
					"article_id": par.art_id,
					"section_id": par.sec_id
				}).success(function (res) {
					if (res.err) {
						console.log('err', res.err);
					} else {
						vm.sections_data = res.data;
					}
				});
			}
		}
	});
}());