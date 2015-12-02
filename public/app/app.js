define(['routes', 'dependencyResolverFor'], function (routes, dependencyResolverFor) {
	'use strict';
	var app = angular.module('app', [
		'ngRoute',
		'ngSanitize',
		'satellizer',
		'ngTouch',
		'ui.bootstrap',
		'izhukov.utils',
		'izhukov.mtproto',
		'izhukov.mtproto.wrapper',
		'myApp.services',
		'myApp.filters',
		'myApp.i18n',
		'myApp.directives',
	]);
	app.config(
		[
			'$routeProvider',
			'$locationProvider',
			'$controllerProvider',
			'$compileProvider',
			'$filterProvider',
			'$provide',
			'$authProvider',
			'StorageProvider',
			function ($routeProvider, $locationProvider, $controllerProvider,
				$compileProvider, $filterProvider, $provide, $authProvider,
				StorageProvider) {
				app.controller = $controllerProvider.register;
				app.directive = $compileProvider.directive;
				app.filter = $filterProvider.register;
				app.factory = $provide.factory;
				app.service = $provide.service;

				if (routes.routes !== undefined) {
					angular.forEach(routes.routes, function (route, path) {
						$routeProvider.when(path, {
							templateUrl: route.templateUrl,
							resolve: dependencyResolverFor(route.dependencies)
						});
					});
				}
				if (routes.defaultRoutePath !== undefined) {
					$routeProvider.otherwise({
						redirectTo: routes.defaultRoutePath
					});
				}
				$authProvider.google({
					client_id: '868760868685-e98cfb4bg4cpbcgptd5ilvp81tnoa4jp.apps.googleusercontent.com',
					url: '/auth/google',
					authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
					redirectUri: 'http://localhost/',
					scope: ['profile', 'email'],
					scopePrefix: 'openid',
					scopeDelimiter: ' ',
					requiredUrlParams: ['scope'],
					optionalUrlParams: ['display'],
					display: 'popup',
					type: '2.0',
					popupOptions: {
						width: 1580,
						height: 400
					}
				});
				//$httpProvider.interceptors.push('mainViewFactory');
				//$httpProvider.responseInterceptors.push('httpInterceptor');
			}
		]
	);
	app.run(function ($window) {
		var params = $window.location.search.substring(1);
		if (params && $window.opener && $window.opener.location.origin === $window.location.origin) {
			var pair = params.split('='),
				code = decodeURIComponent(pair[1]);
			$window.opener.postMessage(code, $window.location.origin);
		}
	});
	return app;
});