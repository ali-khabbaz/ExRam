(function () {
	'use strict';
	define(['app'], function (app) {
		app.controller('loginCtrl', loginCtrl);

		loginCtrl.$inject = ['$http', 'mainViewFactory', '$window', 'MtpApiManager', '$location'];

		function loginCtrl($http, mainFac, $window, MtpApiManager, $location) {
			var vm = this;
			vm.login = login;
			vm.authenticated = mainFac.isAuthenticated();
			vm.logOut = logOut;
			vm.google = google;
			vm.sendTelCode = sendTelCode;
			vm.telLogin = telLogin;
			vm.user = '';
			vm.credentials = {
				phoneCountry: '',
				phoneCountryName: '',
				phoneNumber: '',
				phoneFull: '989155204016',
				phoneCodeHash: '',
				phoneOccupied: '',
				phoneCode: '',
				viaApp: '',
			};
			vm.callPending = {
				remaining: ''
			};

			var options = {
					dcID: 2,
					createNetworker: true
				},
				countryChanged = false,
				selectedCountry = false;

			main();

			function main() {
				getTelUserId();
				getTelNearestDc();
			}



			function logOut() {
				mainFac.removeToken();
				vm.authenticated = mainFac.isAuthenticated();
			}

			if (mainFac.isAuthenticated()) {
				vm.user = mainFac.getUser();
			}

			function login(e, p) {
				var url = mainFac.apiUrl + 'app/login';
				var data = {
					'email': e,
					'password': p
				};

				$http.post(url, data).success(function (res) {
					console.log('>>>>>>>', res);
					mainFac.setToken(res.token);
					mainFac.setUser([
						res.user,
						res.id
					]);
					console.log('get user', mainFac.getUser());
					vm.user = mainFac.getUser();
					vm.authenticated = mainFac.isAuthenticated();
				}).error(function (err) {
					console.log('error is', err);
				});
			}

			function google() {
				console.log('>>', window.location.origin);
				var urlBuilder = ['response_type=code',
					'client_id=868760868685-e98cfb4bg4cpbcgptd5ilvp81tnoa4jp.apps.googleusercontent.com',
					'scope=profile email',
					'redirect_uri=http://localhost/'
				];
				var url = 'https://accounts.google.com/o/oauth2/auth?' + urlBuilder.join('&');
				var options = 'width=500, height=500, left= ' + ($window.outerWidth - 500) / 2 +
					', top=' + ($window.outerHeight - 500) / 2.5;
				var popUp = $window.open(url, '', options);
				$window.focus();
				console.log('focused');
				$window.addEventListener('message', function (event) {
					if (event.origin === $window.location.origin) {
						popUp.close();
						var url = mainFac.apiUrl + 'app/google-auth';
						var code = {
							'code': event.data,
							'client_id': '868760868685-e98cfb4bg4cpbcgptd5ilvp81tnoa4jp.apps.googleusercontent.com',
							'redirect_uri': 'http://localhost/'
						};
						var salam = 'asdasd';
						console.log(salam);

						$http.post(url, code)
							.success(function (res) {
								console.log('getting res', res);
								mainFac.setToken(res.token);
								mainFac.setUser([
									res.user,
									res.id
								]);
								console.log('get user', mainFac.getUser());
								vm.user = mainFac.getUser();
								vm.authenticated = mainFac.isAuthenticated();
							}).error(function (err) {
								console.log('error is', err);
							});
					}
				});
			}

			function getTelUserId() {
				MtpApiManager.getUserID().then(function (id) {
					console.log('----------', id);
					if (id) {
						$location.url('/im');
						return;
					}
				});
			}

			function getTelNearestDc() {
				MtpApiManager.invokeApi('help.getNearestDc', {}, {
					dcID: 2,
					createNetworker: true
				}).then(function (nearestDcResult) {
					console.log('---nearestDcResult---', nearestDcResult);
					/*if (wasCountry == $scope.credentials.phone_country) {
						selectPhoneCountryByIso2(nearestDcResult.country);
					}*/
					if (nearestDcResult['nearest_dc'] !== nearestDcResult['this_dc']) {
						MtpApiManager.getNetworker(nearestDcResult['nearest_dc'], {
							createNetworker: true
						});
					}
				});
			}

			function sendTelCode() {
				/*
					Possible values:
				0 - message contains a numerical code
				1 - (deprecated) - message contains a link {app_name}://{code}
				5 - message sent via Telegram instead of SMS (the (auth.sentAppCode)
					constructor may be returned in this case)
				*/
				MtpApiManager.invokeApi('auth.sendCode', {
					'phone_number': vm.credentials.phoneFull,
					'sms_type': 5,
					'api_id': Config.App.id,
					'api_hash': Config.App.hash,
					'lang_code': navigator.language || 'en' /*'fa-IR'*/
				}, options).then(function (sentCode) {
					//$scope.progress.enabled = false;

					//console.log('----sendCode-----sentCode----------', sentCode);

					vm.credentials.phoneCodeHash = sentCode['phone_code_hash'];
					vm.credentials.phoneOccupied = sentCode['phone_registered'];
					vm.credentials.viaApp = sentCode._ === 'auth.sentAppCode';
					vm.callPending.remaining = sentCode['send_call_timeout'] || 60;
					console.log('----credentials----------', vm.credentials);
					// $scope.error = {};
					// $scope.about = {};

					//callCheck();

					/*onContentLoaded(function () {
						$scope.$broadcast('ui_height');
					});*/

				}, function (error) {
					//$scope.progress.enabled = false;
					console.log('sendCode error', error);
					switch (error.type) {
					case 'PHONE_NUMBER_INVALID':
						/*$scope.error = {
							field: 'phone'
						};*/
						error.handled = true;
						break;
					}
				})['finally'](function () {
					if ($rootScope.idle.isIDLE || tsNow() - authKeyStarted > 60000) {
						NotificationsManager.notify({
							title: 'Telegram',
							message: 'Your authorization key was successfully generated! Open the app to log in.',
							tag: 'auth_key'
						});
					}
				});
			}

			function saveAuth(result) {
				console.log('###########saveAuth########', result);
				MtpApiManager.setUserAuth(options.dcID, {
					id: result.user.id
				});
				//$timeout.cancel(callTimeout);

				$location.url('/im');
				console.log('goto immmmmm22222222222mmmmmmmmm');
			};

			function telLogin(forceSignUp) {
				console.log('#########telLogin##########', forceSignUp);
				var method = 'auth.signIn',
					params = {
						'phone_number': vm.credentials.phoneFull,
						'phone_code_hash': vm.credentials.phoneCodeHash,
						'phone_code': vm.credentials.phoneCode
					};
				console.log('-----------paramssss---------', params);
				if (forceSignUp) {
					method = 'auth.signUp';
					angular.extend(params, {
						'first_name': vm.credentials.firstName || '',
						'last_name': vm.credentials.lastName || ''
					});
				}

				//$scope.progress.enabled = true;
				MtpApiManager.invokeApi(method, params, options).then(saveAuth, function (error) {
					console.log('-------', error);
					/*$scope.progress.enabled = false;
					if (error.code == 400 && error.type == 'PHONE_NUMBER_UNOCCUPIED') {
						error.handled = true;
						$scope.credentials.phone_code_valid = true;
						$scope.credentials.phone_unoccupied = true;
						$scope.about = {};
						return;
					} else if (error.code == 400 && error.type == 'PHONE_NUMBER_OCCUPIED') {
						error.handled = true;
						return $scope.telLogin(false);
					} else if (error.code == 401 && error.type == 'SESSION_PASSWORD_NEEDED') {
						$scope.progress.enabled = true;
						updatePasswordState().then(function () {
							$scope.progress.enabled = false;
							$scope.credentials.phone_code_valid = true;
							$scope.credentials.password_needed = true;
							$scope.about = {};
						});
						error.handled = true;
						return;
					}
					switch (error.type) {
					case 'FIRSTNAME_INVALID':
						$scope.error = {
							field: 'first_name'
						};
						error.handled = true;
						break;
					case 'LASTNAME_INVALID':
						$scope.error = {
							field: 'last_name'
						};
						error.handled = true;
						break;
					case 'PHONE_CODE_INVALID':
						$scope.error = {
							field: 'phone_code'
						};
						delete $scope.credentials.phone_code_valid;
						error.handled = true;
						break;
					case 'PHONE_CODE_EXPIRED':
						$scope.editPhone();
						error.handled = true;
						break;
					}*/
				});

			};
		}

	});
}());