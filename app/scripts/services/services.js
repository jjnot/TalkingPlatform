(function() {
    var ConfigServece = angular.module('ConfigServece', [])
    ConfigServece.factory('getConfig', [

        function() {
            var _CONFIG = {
                StorageKey: "account",
                URL: "http://192.168.0.116:8080",
                WsUrl: "ws://192.168.0.116:8080",
                fileUrl: "http://192.168.0.116:8080",
                FriendKey: "friends",
                FriendMsgKey: "friendsMsg",
                gameListKey: "gameList"
            }
            return _CONFIG;
        }
    ])


    /**
     * 账号service
     * 提供账号输入check,本地存储,服务请求功能
     **/
    var AccountService = angular.module('AccountService', ['ConfigServece'])
        .factory('checkInfo', [

            function() {
                var serviceInstance = {};
                serviceInstance.checkUsername = function(username, errors) {
                    if (username == "") {
                        errors.push("邮箱账号不可以为空");
                        return false;
                    }
                    if (!/\w{5,}/.test(username)) {
                        errors.push("用户名由数字字母下划线组成,不少于5位");
                        return false;
                    }
                    return true;
                }
                serviceInstance.checkPass = function(password, errors) {
                    if (password.length < 6) {
                        errors.push("密码不可少于6位");
                        return false;
                    }
                    return true;
                }
                serviceInstance.checkNick = function(nick, errors) {
                    if (nick == "") {
                        errors.push("昵称不能为空");
                        return false;
                    }
                    if (nick.length < 2) {
                        errors.push("昵称不能少于两位");
                        return false;
                    }
                    return true;
                }
                return serviceInstance;
            }
        ])
        .factory('AccountSave', ['$window', 'getConfig',
            function($window, getConfig) {
                return function save(Info) {
                    if (Info) {
                        var account = {
                            username: Info.username,
                            nick: Info.nick,
                            head: getConfig.URL + Info.head
                        }
                        $window.localStorage.setItem(getConfig.StorageKey, $window.JSON.stringify(account));
                        return true;
                    } else {
                        return false;
                    }

                };
            }
        ])
        .factory('AccountGet', ['$window', 'getConfig',
            function($window, getConfig) {
                return function get() {
                    var account = $window.localStorage.getItem(getConfig.StorageKey);
                    if (account) {
                        return $window.JSON.parse(account);
                    } else {
                        return false;
                    }

                };
            }
        ])
        .factory('AccountClear', ['$window', 'getConfig',
            function($window, getConfig) {
                return function clear() {
                    $window.localStorage.removeItem(getConfig.StorageKey);
                };
            }
        ])
        .factory('AccountRequest', ['$http', 'getConfig',
            function($http, getConfig) {
                var doLogin = function(Info) {
                    var data = {
                        username: Info.username,
                        password: Info.password
                    }
                    return $http({
                        method: 'POST',
                        url: getConfig.URL + '/login',
                        data: data
                    });
                }
                var doRegister = function(Info) {
                    var data = {
                        username: Info.username,
                        password: Info.password,
                        nick: Info.nick
                    }
                    return $http({
                        method: 'POST',
                        url: getConfig.URL + '/register',
                        data: data
                    })
                }
                var doLogout = function() {
                    return $http({
                        method: 'POST',
                        url: getConfig.URL + '/logout'
                    })
                }
                return {
                    doLogin: doLogin,
                    doRegister: doRegister,
                    doLogout: doLogout
                }
            }
        ])


    // angular.module('fsCordova', [])
    //     .service('CordovaService', ['$document', '$q',
    //         function($document, $q) {
    //             var d = $q.defer(),
    //                 resolved = false;
    //             var self = this;
    //             this.ready = d.promise;
    //             document.addEventListener('deviceready', function() {
    //                 resolved = true;
    //                 d.resolve(window.cordova);
    //             });
    //             // 检查一下以确保没有漏掉这个事件(以防万一) 
    //             setTimeout(function() {
    //                 if (!resolved) {
    //                     if (window.cordova) {
    //                         d.resolve(window.cordova);
    //                     }
    //                 }
    //             }, 3000);
    //         }
    //     ]);

    /**
     *  Module
     *
     * 用户好友管理
     */
    angular.module('friendService', ['ConfigServece'])
        .factory('saveFriends', ['$window', 'getConfig',
            function($window, getConfig) {
                return function saveFriends(data) {
                    $window.localStorage.setItem(getConfig.FriendKey, JSON.stringify(data));
                    return true;
                };
            }
        ])
        .factory('getFriends', ['$window', 'getConfig',
            function($window, getConfig) {
                return function() {
                    var friendList = $window.localStorage.getItem(getConfig.FriendKey);
                    if (friendList == "undefined") {
                        friendList = "[]";
                        console.log(friendList);
                    };
                    var friends = JSON.parse(friendList);
                    return friends;
                };
            }
        ])
        .factory('getFriendDetail', ['getFriends',
            function(getFriends) {
                return function(username) {
                    var friends = getFriends();
                    var l = friends.length;
                    for (var i = 0; i < l; i++) {
                        if (friends[i].username == username) {
                            return friends[i];
                        }
                    }
                    return false;
                };
            }
        ])
        .factory('addFriend', ['$window', 'getConfig', 'saveFriends', 'getFriends',
            function($window, getConfig, saveFriends, getFriends) {
                return function(data) {
                    var friends = getFriends();
                    friends.push(data);
                    saveFriends(friends);
                };
            }
        ])
        .factory('deleteFriend', ['$window', 'getConfig', 'saveFriends', 'getFriends',
            function($window, getConfig, saveFriends, getFriends) {
                return function(data) {
                    var friends = getFriends();
                    var l = friends.length;
                    for (var i = 0; i < l; i++) {
                        if (friends[i].username == data.username) {
                            friends.splice(i, 1)
                            break;
                        }
                    }
                    saveFriends(friends);
                };
            }
        ])
        .factory('getFriendMsg', ['$window', 'getConfig',
            function($window, getConfig) {
                return function() {
                    var msgList = $window.localStorage.getItem(getConfig.FriendMsgKey);
                    if (!msgList) {
                        msgList = "[]"
                    };
                    var msg = JSON.parse(msgList);
                    return msg;
                };
            }
        ])
        .factory('addFriendMsg', ['$window', 'getConfig', 'getFriendMsg',
            function($window, getConfig, getFriendMsg) {
                return function(data) {
                    var msg = getFriendMsg();
                    msg.push(data)
                    $window.localStorage.setItem(getConfig.FriendMsgKey, JSON.stringify(msg));
                };
            }
        ])
        .factory('clearFriendMsg', ['$window', 'getConfig',
            function($window, getConfig) {
                return function() {
                    $window.localStorage.removeItem(getConfig.FriendMsgKey);
                };
            }
        ])

    angular.module('gameListService', ['ConfigServece'])
        .factory('saveGameList', ['$window', 'getConfig',
            function($window, getConfig) {
                return function(data) {
                    $window.localStorage.setItem(getConfig.gameListKey, JSON.stringify(data));
                    return true;
                };
            }
        ])
        .factory('getGameList', ['$window', 'getConfig',
            function($window, getConfig) {
                return function() {
                    var data = $window.localStorage.getItem(getConfig.gameListKey);

                    if (data == "undefined" || !data) {
                        return false;
                    }
                    data = JSON.parse(data);
                    return data;
                };
            }
        ])


    angular.module('netService', ['ConfigServece', 'AccountService', 'ngCordova', 'friendService', 'gameListService'])
        .factory('wsInit', ['$rootScope', 'getConfig', 'saveFriends', 'addFriendMsg', 'addFriend', 'headFilter', 'saveGameList', '$timeout','deleteFriend',
            function($rootScope, getConfig, saveFriends, addFriendMsg, addFriend, headFilter, saveGameList, $timeout,deleteFriend) {
                return function init(account) {
                    var url = getConfig.WsUrl + "/" + account.username;
                    console.log(url);
                    if (!$rootScope.ws) {
                        $rootScope.ws = new WebSocket(url);
                    }
                    $rootScope.ws.onopen = function() {
                        console.log('WebSocket open');
                        $rootScope.ws.send(JSON.stringify({
                            action: "getfriends",
                            data: {
                                username: null,
                                nick: null,
                                head: null
                            }
                        }));
                        $rootScope.ws.send(JSON.stringify({
                            action: "getgamelist",
                            data: {}
                        }));
                    }
                    $rootScope.ws.onclose = function() {
                        console.log("websocket closed");
                        $rootScope.ws = null;
                    }
                    $rootScope.ws.onmessage = function(data) {
                        var evt = JSON.parse(data.data);
                        var type = evt.action;
                        evt.data = headFilter(evt.data);
                        console.log("recivemsg: " + JSON.stringify(evt));
                        //消息广播
                        $rootScope.$broadcast(type, evt);
                        //消息处理
                        if (type == "getfriends") {
                            saveFriends(evt.data);
                        }
                        if (type == "addfriend") {
                            var msg = {
                                type: "addfriend",
                                data: evt.data
                            }
                            addFriendMsg(msg);
                        }
                        if (type == "acceptfriend") {
                            var msg = {
                                type: "acceptfriend",
                                data: evt.data
                            }
                            addFriendMsg(msg);
                            addFriend(evt.data);
                        }
                        if (type == "deletefriend") {
                            var msg = {
                                type: "deletefriend",
                                data: evt.data
                            }
                            addFriendMsg(msg);
                            deleteFriend(evt.data);
                        }
                        if (type == "refusefriend") {
                            var msg = {
                                type: "refusefriend",
                                data: evt.data
                            }
                            addFriendMsg(msg);
                        }
                        if (type == "getgamelist") {
                            saveGameList(evt.data);
                        }
                        if (type == "word") {
                            $timeout(function() {
                                $rootScope.$broadcast("game_word", evt);
                            }, 400);

                        }
                    }
                };
            }
        ])
        .factory('headFilter', ['getConfig',
            function(getConfig) {
                return function Filter(data) {
                    if (data) {
                        if (data.length) {
                            var l = data.length;
                            for (var i = 0; i < l; i++) {
                                if (data[i].head) {
                                    data[i].head = getConfig.URL + data[i].head;
                                }
                            }
                        } else {
                            if (data.head) {
                                data.head = getConfig.URL + data.head;
                            }
                            if (data.data && data.data.head) {
                                data.data.head = getConfig.URL + data.data.head;
                            }
                        }
                    }

                    return data;
                };
            }
        ])
        .factory('ajax', ['$http', 'getConfig', 'AccountGet',
            function($http, getConfig, AccountGet) {
                return function ajax(method, url, data) {
                    var account = AccountGet();
                    return $http({
                        method: method,
                        url: getConfig.URL + url,
                        data: data
                    })
                };
            }
        ])
        .factory('uploadVoice', ['getConfig', 'AccountGet', '$cordovaFile',
            function(getConfig, AccountGet, $cordovaFile) {
                return function uploadFile(filePath) {
                    var account = AccountGet();
                    var server = encodeURI(getConfig.fileUrl + '/upload');
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    return $cordovaFile.uploadFile(server, filePath, options);
                };
            }
        ])
        .factory('downloadVoice', ['getConfig', '$cordovaFile',
            function(getConfig, $cordovaFile) {
                return function downloadFile(filePath, url) {
                    url = getConfig.fileUrl + url;
                    var source = encodeURI(url);
                    return $cordovaFile.downloadFile(source, filePath, true);
                };
            }
        ])
        .factory('deleteFiles', ['$window', '$timeout', function($window, $timeout) {
            return function deleteFiles(files) {
                function deleteRun(i) {
                    if (i < files.length) {
                        var file = files[i];
                        $window.requestFileSystem($window.LocalFileSystem.PERSISTENT, 2048 * 2048, function(fs) {
                            fs.root.getFile(file, {
                                create: false
                            }, function(fileEntry) {
                                fileEntry.remove(function() {
                                    deleteRun(i + 1);
                                }, errorHandler);
                            }, errorHandler);
                        }, errorHandler);
                    }
                }
                var errorHandler = function(err) {
                    alert(JSON.stringify(err));
                }
                deleteRun(0);

            };
        }])
        .factory('uploadHead', ['getConfig', '$cordovaFile',
            function(getConfig, $cordovaFile) {
                return function uploadHead(filePath) {
                    var server = encodeURI(getConfig.fileUrl + '/uploadhead');
                    var options = new FileUploadOptions();
                    options.fileKey = "file";
                    return $cordovaFile.uploadFile(server, filePath, options);
                };
            }
        ]);
})();