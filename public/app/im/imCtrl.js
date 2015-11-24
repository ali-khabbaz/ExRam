(function () {
	'use strict';
	define(['app'], function (app) {
		app.controller('imCtrl', imCtrl);

		imCtrl.$inject = ['$scope', '$location', '$q', '$timeout', '$routeParams',
			'MtpApiManager', 'AppUsersManager', 'AppChatsManager', 'AppMessagesManager',
			'AppProfileManager', 'AppPeersManager', 'PhonebookContactsService', 'ErrorService',
			'AppRuntimeManager', '$modal', 'qSync', '$rootScope', '$modalStack',
			'ContactsSelectService', 'ChangelogNotifyService', 'HttpsMigrateService',
			'LayoutSwitchService', 'LocationParamsService', 'AppStickersManager'
		];

		function imCtrl($scope, $location, $q, $timeout, $routeParams,
			MtpApiManager, AppUsersManager, AppChatsManager, AppMessagesManager,
			AppProfileManager, AppPeersManager, PhonebookContactsService, ErrorService,
			AppRuntimeManager, $modal, qSync, $rootScope, $modalStack, ContactsSelectService,
			ChangelogNotifyService, HttpsMigrateService, LayoutSwitchService, LocationParamsService,
			AppStickersManager) {



			/*--------------------AppImController-------------------------------------*/
			/*------------------------Start-------------------------------------------*/
			/*------------------------------------------------------------------------*/
			/*------------------------------------------------------------------------*/
			/*------------------------------------------------------------------------*/
			/*------------------------------------------------------------------------*/



			$scope.$on('$routeUpdate', updateCurDialog);

			var pendingParams = false;
			var pendingAttachment = false;
			$scope.$on('history_focus', function (e, peerData) {
				$modalStack.dismissAll();
				if (peerData.peerString == $scope.curDialog.peer &&
					peerData.messageID == $scope.curDialog.messageID &&
					!peerData.startParam) {
					$scope.$broadcast(peerData.messageID ? 'ui_history_change_scroll' : 'ui_history_focus');
				} else {
					var peerID = AppPeersManager.getPeerID(peerData.peerString);
					var username = AppPeersManager.getPeer(peerID).username;
					var peer = username ? '@' + username : peerData.peerString;
					if (peerData.messageID || peerData.startParam) {
						pendingParams = {
							messageID: peerData.messageID,
							startParam: peerData.startParam
						};
					} else {
						pendingParams = false;
					}
					if (peerData.attachment) {
						pendingAttachment = peerData.attachment;
					}
					if ($routeParams.p != peer) {
						$location.url('/im?p=' + peer);
					} else {
						updateCurDialog();
					}
				}
			});

			$scope.$on('esc_no_more', function () {
				$rootScope.$apply(function () {
					$location.url('/im');
				})
			});


			$scope.isLoggedIn = true;
			$scope.isEmpty = {};
			$scope.search = {};
			$scope.historyFilter = {
				mediaType: false
			};
			$scope.historyPeer = {};
			$scope.historyState = {
				selectActions: false,
				botActions: false,
				channelActions: false,
				canReply: false,
				canDelete: false,
				actions: function () {
					return $scope.historyState.selectActions ? 'selected' : ($scope.historyState.botActions ? 'bot' : ($scope.historyState.channelActions ? 'channel' : false));
				},
				typing: [],
				missedCount: 0,
				skipped: false
			};

			$scope.openSettings = function () {
				console.log('-------openSettings--------');
				$modal.open({
					templateUrl: templateUrl('settings_modal'),
					controller: 'SettingsModalController',
					windowClass: 'settings_modal_window mobile_modal',
					backdrop: 'single'
				});
			};

			// setTimeout($scope.openSettings, 1000);

			$scope.openFaq = function () {
				console.log('------openFaq---------');
				var url = 'https://telegram.org/faq';
				switch (Config.I18n.locale) {
				case 'es-es':
					url += '/es';
					break;
				case 'it-it':
					url += '/it';
					break;
				case 'de-de':
					url += '/de';
					break;
				case 'ko-ko':
					url += '/ko';
					break;
				case 'pt-br':
					url += '/br';
					break;
				};
				window.open(url, '_blank');
			};

			$scope.openContacts = function () {
				console.log('-------openContacts--------');
				ContactsSelectService.selectContact().then(function (userID) {
					$scope.dialogSelect(AppUsersManager.getUserString(userID));
				});
			};

			$scope.openGroup = function () {
				console.log('-------openGroup--------');
				ContactsSelectService.selectContacts({
					action: 'new_group'
				}).then(function (userIDs) {

					if (userIDs.length == 1) {
						$scope.dialogSelect(AppUsersManager.getUserString(userIDs[0]));
					} else if (userIDs.length > 1) {
						var scope = $rootScope.$new();
						scope.userIDs = userIDs;

						$modal.open({
							templateUrl: templateUrl('chat_create_modal'),
							controller: 'ChatCreateModalController',
							scope: scope,
							windowClass: 'md_simple_modal_window mobile_modal',
							backdrop: 'single'
						});
					}

				});
			};

			$scope.importContact = function () {
				console.log('-------importContact--------');
				AppUsersManager.openImportContact().then(function (foundContact) {
					if (foundContact) {
						$rootScope.$broadcast('history_focus', {
							peerString: AppUsersManager.getUserString(foundContact)
						});
					}
				});
			};

			$scope.searchClear = function () {
				console.log('------searchClear---------');
				$scope.search.query = '';
				$scope.$broadcast('search_clear');
			}

			$scope.dialogSelect = function (peerString, messageID) {
				console.log('-------dialogSelect--------');
				var params = {
					peerString: peerString
				};
				if (messageID) {
					params.messageID = messageID;
				} else if ($scope.search.query) {
					$scope.searchClear();
				}
				$rootScope.$broadcast('history_focus', params);
			};

			$scope.logOut = function () {
				console.log('--------logOut-------');
				ErrorService.confirm({
					type: 'LOGOUT'
				}).then(function () {
					MtpApiManager.logOut().then(function () {
						location.hash = '/login';
						AppRuntimeManager.reload();
					});
				})
			};

			$scope.openChangelog = function () {
				console.log('-------openChangelog--------');
				ChangelogNotifyService.showChangelog(false);
			}

			$scope.showPeerInfo = function () {
				console.log('-------showPeerInfo--------');
				if ($scope.curDialog.peerID > 0) {
					AppUsersManager.openUser($scope.curDialog.peerID)
				} else if ($scope.curDialog.peerID < 0) {
					AppChatsManager.openChat(-$scope.curDialog.peerID)
				}
			};

			$scope.toggleEdit = function () {
				console.log('-------toggleEdit--------');
				$scope.$broadcast('history_edit_toggle');
			};
			$scope.selectedFlush = function () {
				console.log('----------selectedFlush-----');
				$scope.$broadcast('history_edit_flush');
			};
			$scope.toggleMedia = function (mediaType) {
				console.log('--------toggleMedia-------', mediaType);
				$scope.$broadcast('history_media_toggle', mediaType);
			};
			$scope.returnToRecent = function () {
				console.log('-----------returnToRecent----');
				$scope.$broadcast('history_return_recent');
			};
			$scope.toggleSearch = function () {
				console.log('---------toggleSearch------');
				$scope.$broadcast('dialogs_search_toggle');
			};

			updateCurDialog();

			var lastSearch = false;

			function updateCurDialog() {
				console.log('-----updateCurDialog--------');
				if ($routeParams.q) {
					if ($routeParams.q !== lastSearch) {
						$scope.search.query = lastSearch = $routeParams.q;
						if ($scope.curDialog !== undefined) {
							return false;
						}
					}
				} else {
					lastSearch = false;
				}
				var addParams = pendingParams || {};
				pendingParams = false;
				addParams.messageID = parseInt(addParams.messageID) || false;
				addParams.startParam = addParams.startParam;

				var peerStringPromise;
				if ($routeParams.p && $routeParams.p.charAt(0) == '@') {
					if ($scope.curDialog === undefined) {
						$scope.curDialog = {};
					}
					peerStringPromise = AppPeersManager.resolveUsername($routeParams.p.substr(1)).then(function (peerID) {
						return qSync.when(AppPeersManager.getPeerString(peerID));
					});
				} else {
					peerStringPromise = qSync.when($routeParams.p);
				}
				peerStringPromise.then(function (peerString) {
					$scope.curDialog = angular.extend({
						peer: peerString
					}, addParams);
					if (pendingAttachment) {
						$scope.$broadcast('peer_draft_attachment', pendingAttachment);
						pendingAttachment = false;
					}
				});
			}

			ChangelogNotifyService.checkUpdate();
			HttpsMigrateService.start();
			LayoutSwitchService.start();
			LocationParamsService.start();
			AppStickersManager.start();



			/*--------------------AppImController-------------------------------------*/
			/*------------------------End----------------------------------------------*/
			/*------------------------------------------------------------------------*/
			/*------------------------------------------------------------------------*/
			/*------------------------------------------------------------------------*/
			/*------------------------------------------------------------------------*/

			$scope.dialogs = [];
			$scope.contacts = [];
			$scope.foundPeers = [];
			$scope.foundMessages = [];

			if ($scope.search === undefined) {
				$scope.search = {};
			}
			if ($scope.isEmpty === undefined) {
				$scope.isEmpty = {};
			}
			$scope.phonebookAvailable = PhonebookContactsService.isAvailable();

			var searchMessages = false,
				offsetIndex = 0,
				maxID = 0,
				hasMore = false,
				jump = 0,
				contactsJump = 0,
				peersInDialogs = {},
				typingTimeouts = {},
				contactsShown;


			$scope.$on('dialogs_need_more', function () {
				// console.log('on need more');
				showMoreDialogs();
			});

			$scope.$on('dialog_unread', function (e, dialog) {
				angular.forEach($scope.dialogs, function (curDialog) {
					if (curDialog.peerID == dialog.peerID) {
						curDialog.unreadCount = dialog.count;
					}
				});
			});

			$scope.$on('dialogs_multiupdate', function (e, dialogsUpdated) {
				if ($scope.search.query !== undefined && $scope.search.query.length) {
					return false;
				}

				var indexes = [];
				var indexesToDialogs = {};
				angular.forEach(dialogsUpdated, function (dialog, peerID) {
					if ($scope.noUsers && peerID > 0) {
						return;
					}
					indexesToDialogs[dialog.index] = dialog;
					indexes.push(dialog.index);
				});
				indexes.sort();

				var i, dialog;
				var len = $scope.dialogs.length;
				for (i = 0; i < len; i++) {
					dialog = $scope.dialogs[i];
					if (dialogsUpdated[dialog.peerID]) {
						$scope.dialogs.splice(i, 1);
						i--;
						len--;
					}
				}
				len = indexes.length;
				for (i = 0; i < len; i++) {
					dialog = indexesToDialogs[indexes[i]];
					$scope.dialogs.unshift(
						AppMessagesManager.wrapForDialog(dialog.top_message, dialog)
					);
				}

				delete $scope.isEmpty.dialogs;

				if (!peersInDialogs[dialog.peerID]) {
					peersInDialogs[dialog.peerID] = true;
					if (contactsShown) {
						showMoreConversations();
					}
				}
			});

			function deleteDialog(peerID) {
				for (var i = 0; i < $scope.dialogs.length; i++) {
					if ($scope.dialogs[i].peerID == peerID) {
						$scope.dialogs.splice(i, 1);
						break;
					}
				}
			}

			$scope.$on('dialog_flush', function (e, dialog) {
				deleteDialog(dialog.peerID);
			});
			$scope.$on('dialog_drop', function (e, dialog) {
				deleteDialog(dialog.peerID);
			});

			$scope.$on('history_delete', function (e, historyUpdate) {
				for (var i = 0; i < $scope.dialogs.length; i++) {
					if ($scope.dialogs[i].peerID == historyUpdate.peerID) {
						if (historyUpdate.msgs[$scope.dialogs[i].mid]) {
							$scope.dialogs[i].deleted = true;
						}
						break;
					}
				}
			});

			$scope.$on('apiUpdate', function (e, update) {
				switch (update._) {
				case 'updateUserTyping':
				case 'updateChatUserTyping':
					if (!AppUsersManager.hasUser(update.user_id)) {
						if (update.chat_id) {
							AppProfileManager.getChatFull(update.chat_id);
						}
						return;
					}
					var peerID = update._ == 'updateUserTyping' ? update.user_id : -update.chat_id;
					AppUsersManager.forceUserOnline(update.user_id);
					for (var i = 0; i < $scope.dialogs.length; i++) {
						if ($scope.dialogs[i].peerID == peerID) {
							$scope.dialogs[i].typing = update.user_id;
							$timeout.cancel(typingTimeouts[peerID]);

							typingTimeouts[peerID] = $timeout(function () {
								for (var i = 0; i < $scope.dialogs.length; i++) {
									if ($scope.dialogs[i].peerID == peerID) {
										if ($scope.dialogs[i].typing == update.user_id) {
											delete $scope.dialogs[i].typing;
										}
									}
								}
							}, 6000);
							break;
						}
					}
					break;
				}
			});

			$scope.$watchCollection('search', function () {
				$scope.dialogs = [];
				$scope.foundMessages = [];
				searchMessages = false;
				contactsJump++;
				loadDialogs();

				if ($routeParams.q && $scope.search.query != $routeParams.q) {
					$timeout(function () {
						$location.url(
							'/im' +
							($scope.curDialog.peer ? '?p=' + $scope.curDialog.peer : '')
						);
					});
				}
			});



			if (Config.Mobile) {
				$scope.$watch('curDialog.peer', function () {
					$scope.$broadcast('ui_dialogs_update')
				});
			}

			$scope.importPhonebook = function () {
				PhonebookContactsService.openPhonebookImport();
			};

			$scope.$on('contacts_update', function () {
				if (contactsShown) {
					showMoreConversations();
				}
			});

			$scope.$on('ui_dialogs_search_clear', $scope.searchClear);

			var searchTimeoutPromise;

			function getDialogs(force) {
				console.log('----------getDialogs------------', force);
				var curJump = ++jump;

				$timeout.cancel(searchTimeoutPromise);

				if (searchMessages) {
					searchTimeoutPromise = (force || maxID) ? $q.when() : $timeout(angular.noop, 500);
					return searchTimeoutPromise.then(function () {
						return AppMessagesManager.getSearch({
							_: 'inputPeerEmpty'
						}, $scope.search.query, {
							_: 'inputMessagesFilterEmpty'
						}, maxID).then(function (result) {
							if (curJump != jump) {
								return $q.reject();
							}
							var dialogs = [];
							angular.forEach(result.history, function (messageID) {
								var message = AppMessagesManager.getMessage(messageID),
									peerID = AppMessagesManager.getMessagePeer(message);

								dialogs.push({
									peerID: peerID,
									top_message: messageID,
									unread_count: -1
								});
							});

							return {
								dialogs: dialogs
							};
						})
					});
				}

				var query = $scope.search.query || '';
				if ($scope.noUsers) {
					query = '%pg ' + query;
				}
				return AppMessagesManager.getConversations(query, offsetIndex).then(function (result) {
					if (curJump != jump) {
						return $q.reject();
					}
					return result;
				});
			};

			function loadDialogs(force) {
				console.log('-----------loadDialogs-----------', force);
				offsetIndex = 0;
				maxID = 0;
				hasMore = false;
				if (!searchMessages) {
					peersInDialogs = {};
					contactsShown = false;
				}

				getDialogs(force).then(function (dialogsResult) {
					console.log('-----call--------getDialogs---------', dialogsResult);
					//$scope.dialogs = dialogsResult.dialogs;
					console.log('------$scope.dialogs-------------', $scope.dialogs);
					if (!searchMessages) {
						$scope.dialogs = [];
						$scope.contacts = [];
						$scope.foundPeers = [];
					}
					$scope.foundMessages = [];

					var dialogsList = searchMessages ? $scope.foundMessages : $scope.dialogs;

					if (dialogsResult.dialogs.length) {
						angular.forEach(dialogsResult.dialogs, function (dialog) {
							if ($scope.canSend &&
								AppPeersManager.isChannel(dialog.peerID) &&
								!AppChatsManager.hasRights(-dialog.peerID, 'send')) {
								return;
							}
							var wrappedDialog = AppMessagesManager.wrapForDialog(dialog.top_message, dialog);
							if (!searchMessages) {
								peersInDialogs[dialog.peerID] = true;
							}
							dialogsList.push(wrappedDialog);
						});

						if (searchMessages) {
							maxID = dialogsResult.dialogs[dialogsResult.dialogs.length - 1].top_message;
						} else {
							offsetIndex = dialogsResult.dialogs[dialogsResult.dialogs.length - 1].index;
							delete $scope.isEmpty.dialogs;
						}
						hasMore = true;
					} else {
						hasMore = false;
					}

					$scope.$broadcast('ui_dialogs_change');

					if (!$scope.search.query) {
						AppMessagesManager.getConversations('', offsetIndex, 100);
						if (!dialogsResult.dialogs.length) {
							$scope.isEmpty.dialogs = true;
							showMoreDialogs();
						}
					} else {
						showMoreDialogs();
					}
					console.log('------$scope.dialogs-----2nd-----', $scope.dialogs);
				});
			}

			function showMoreDialogs() {
				console.log('----------showMoreDialogs------------');
				if (contactsShown && (!hasMore || !offsetIndex && !maxID)) {
					return;
				}

				if (!hasMore &&
					!searchMessages &&
					!$scope.noUsers &&
					($scope.search.query || !$scope.dialogs.length)) {
					showMoreConversations();
					return;
				}

				getDialogs().then(function (dialogsResult) {
					console.log('-----call--------getDialogs---22222222222------', dialogsResult);
					if (dialogsResult.dialogs.length) {
						var dialogsList = searchMessages ? $scope.foundMessages : $scope.dialogs;

						console.log('--------%%%%%%-------', $scope.dialogs);

						angular.forEach(dialogsResult.dialogs, function (dialog) {
							if ($scope.canSend &&
								AppPeersManager.isChannel(dialog.peerID) &&
								!AppChatsManager.hasRights(-dialog.peerID, 'send')) {
								return;
							}
							var wrappedDialog = AppMessagesManager.wrapForDialog(dialog.top_message, dialog);
							if (!searchMessages) {
								peersInDialogs[dialog.peerID] = true;
							}
							dialogsList.push(wrappedDialog);
						});

						if (searchMessages) {
							maxID = dialogsResult.dialogs[dialogsResult.dialogs.length - 1].top_message;
						} else {
							offsetIndex = dialogsResult.dialogs[dialogsResult.dialogs.length - 1].index;
						}

						$scope.$broadcast('ui_dialogs_append');

						hasMore = true;
					} else {
						hasMore = false;
					}
				});
			};

			function showMoreConversations() {
				console.log('-----------showMoreConversations-----------');
				contactsShown = true;

				var curJump = ++contactsJump;
				AppUsersManager.getContacts($scope.search.query).then(function (contactsList) {
					if (curJump != contactsJump) return;
					$scope.contacts = [];
					angular.forEach(contactsList, function (userID) {
						if (peersInDialogs[userID] === undefined) {
							$scope.contacts.push({
								userID: userID,
								user: AppUsersManager.getUser(userID),
								peerString: AppUsersManager.getUserString(userID)
							});
						}
					});

					if (contactsList.length) {
						delete $scope.isEmpty.contacts;
					} else if (!$scope.search.query) {
						$scope.isEmpty.contacts = true;
					}
					$scope.$broadcast('ui_dialogs_append');
				});

				if ($scope.search.query && $scope.search.query.length >= 5) {
					$timeout(function () {
						if (curJump != contactsJump) return;
						MtpApiManager.invokeApi('contacts.search', {
							q: $scope.search.query,
							limit: 10
						}).then(function (result) {
							AppUsersManager.saveApiUsers(result.users);
							AppChatsManager.saveApiChats(result.chats);
							if (curJump != contactsJump) return;
							$scope.foundPeers = [];
							angular.forEach(result.results, function (contactFound) {
								var peerID = AppPeersManager.getPeerID(contactFound);
								if (peersInDialogs[peerID] === undefined) {
									if ($scope.canSend &&
										AppPeersManager.isChannel(peerID) &&
										!AppChatsManager.hasRights(-peerID, 'send')) {
										return;
									}
									$scope.foundPeers.push({
										id: peerID,
										username: AppPeersManager.getPeer(peerID).username,
										peerString: AppUsersManager.getUserString(peerID)
									});
								}
							});
						}, function (error) {
							if (error.code == 400) {
								error.handled = true;
							}
						});
					}, 500);
				}

				if ($scope.search.query && !$scope.noMessages) {
					searchMessages = true;
					loadDialogs();
				}
			}
		}

	});
}());