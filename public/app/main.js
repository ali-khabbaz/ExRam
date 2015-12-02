require.config({
	waitSeconds: 0,
	baseUrl: '/app/',
	paths: {
		'app': 'app',
		'angular': '../vendor/angular/angular.min',
		'angular-route': '../vendor/angular-route/angular-route.min',
		'angular-touch': '../vendor/angular/angular-touch.min',
		'angular-animate': '../vendor/angular/angular-animate.min',
		'jquery': '../vendor/jquery/dist/jquery.min',
		'nanoscroller': '../vendor/jquery.nanoscroller/nanoscroller',
		'angular-resource': '../vendor/angular-resource/angular-resource.min',
		'MainViewCtrl': 'main/MainViewCtrl',
		'mainViewFactory': 'main/mainViewFactory',
		'authInterceptor': 'main/authInterceptor',
		'satellizer': '../vendor/satellizer',
		'polyfill': '../telegram_lib/polyfill',
		'message_composer': '../telegram_lib/message_composer',
		'config': '../telegram_lib/config',
		'init': '../telegram_lib/init',
		'utils': '../telegram_lib/utils',
		'angular-sanitize': '../vendor/angular/angular-sanitize',
		'binUtils': '../telegram_lib/bin_utils',
		'tlUtils': '../telegram_lib/tl_utils',
		'ngUtils': '../telegram_lib/ng_utils',
		'crypto': '../vendor/cryptoJS/crypto',
		'rusha': '../vendor/rusha/rusha',
		'mtproto': '../telegram_lib/mtproto',
		'mtprotoWrapper': '../telegram_lib/mtproto_wrapper',
		'jsbn': '../vendor/jsbn/jsbn_combined',
		'gunzip': '../vendor/zlib/gunzip.min',
		'i18n': '../telegram_lib/i18n',
		'filters': '../telegram_lib/filters',
		'services': '../telegram_lib/services',
		'directives': '../telegram_lib/directives',
		'messages_manager': '../telegram_lib/messages_manager',
		'ui-bootstrap': '../vendor/ui-bootstrap/ui-bootstrap-custom-tpls-0.12.0'
	},
	shim: {
		'app': {
			deps: ['angular-route', 'angular-resource', 'satellizer', 'config', 'init',
				'crypto', 'mtproto', 'mtprotoWrapper', 'jsbn', 'i18n', 'filters', 'rusha',
				'utils', 'binUtils', 'tlUtils', 'ngUtils', 'ui-bootstrap', 'services',
				'polyfill', 'angular-sanitize', 'messages_manager', 'gunzip', 'directives',
				'messages_manager', 'message_composer', 'nanoscroller', 'angular-touch',
				'angular-animate'
			]
		},
		'angular-route': {
			deps: ['angular']
		},
		'angular-touch': {
			deps: ['angular']
		},
		'angular-animate': {
			deps: ['angular']
		},
		'angular-resource': {
			deps: ['angular']
		},
		'satellizer': {
			deps: ['angular']
		},
		'angular-sanitize': {
			deps: ['angular']
		},
		'config': {
			deps: ['jquery']
		},
		'nanoscroller': {
			deps: ['jquery']
		},
		'init': {
			deps: ['config']
		},
		'crypto': {
			deps: ['angular']
		},
		'rusha': {
			deps: ['crypto']
		},
		'ui-bootstrap': {
			deps: ['angular', 'angular-touch', 'angular-animate']
		},
		'filters': {
			deps: ['i18n']
		},
		'directives': {
			deps: ['i18n', 'filters']
		},
		'services': {
			deps: ['i18n', 'ngUtils', 'angular', 'angular-sanitize', 'ui-bootstrap']
		},
		'messages_manager': {
			deps: ['i18n', 'ngUtils', 'angular', 'angular-sanitize', 'services']
		},
		'message_composer': {
			deps: ['config']
		},
		'mtproto': {
			deps: ['angular']
		},
		'jsbn': {
			deps: ['angular']
		},
		'i18n': {
			deps: ['angular', 'ngUtils']
		},
		'mtprotoWrapper': {
			deps: ['angular', 'mtproto', 'ngUtils', 'i18n']
		},
		'binUtils': {
			deps: ['utils']
		},
		'gunzip': {
			deps: ['binUtils']
		},
		'tlUtils': {
			deps: ['binUtils']
		},
		'ngUtils': {
			deps: ['tlUtils', 'angular-sanitize']
		}

	}
});
requirejs.onError = function (err) {
	console.error('[require error] type: ', err.requireType, ' ,modules: ' + err.requireModules);
	throw err;
};
require(['app'], function () {
	require(['MainViewCtrl', 'mainViewFactory', 'authInterceptor'], function () {
		angular.bootstrap(document, ['app']);
	});
});