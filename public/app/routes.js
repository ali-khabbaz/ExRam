define(['app'], function (app) {
	return {
		defaultRoutePath: '/main',
		routes: {
			'/main': {
				templateUrl: '/app/main/main.html'
			},
			'/page1': {
				templateUrl: '/app/page1/page1.html',
				dependencies: [
					'/app/page1/page1Ctrl.js'
				]
			},
			'/register': {
				templateUrl: '/app/register/register.html',
				dependencies: [
					'/app/register/registerCtrl.js',
					'/app/register/registerDirective.js'
				]
			},
			'/login': {
				templateUrl: '/app/login/login.html',
				dependencies: [
					'/app/login/loginCtrl.js'
				]
			},
			'/im': {
				templateUrl: '/app/im/im.html',
				dependencies: [
					'/app/im/imCtrl.js'
				]
			},
			'/jobs': {
				templateUrl: '/app/jobs/jobs.html',
				dependencies: [
					'/app/jobs/jobsCtrl.js'
				]
			},
			'/articleList': {
				templateUrl: '/app/articleList/articleList.html',
				dependencies: [
					'/app/articleList/articleListCtrl.js'
				]
			},
			'/video/:art_id/:sec_id/:vid_id': {
				templateUrl: '/app/video/video.html',
				dependencies: [
					'/app/video/videoCtrl.js'
				]
			}
		}
	};
});