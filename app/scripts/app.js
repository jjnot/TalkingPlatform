// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var wisApp = angular.module('wisApp', ['ionic', 'AccountModule', 'AccountService', 'netService', 'GameModule', 'ngCordova'])
    //mock数据时使用
    //Mock.mockjax(wisApp);


wisApp.run(function($window,$rootScope, $state, $stateParams, $ionicPlatform, AccountGet) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        // if (window.cordova && window.cordova.plugins.Keyboard) {
        //   cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        
    });

    $window.onerror = function(info, url, line) {
        console.log("error:"+ info + " url:" +url +" line:" +line);
    }  
})

.config(function($stateProvider, $urlRouterProvider,$httpProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
        .state('index', {
            url: '/index',
            templateUrl: 'views/login.html'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'views/register.html'
        })
        // setup an abstract state for the tabs directive

    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "views/tabs.html",
        controller: "tabCtrl"
    })

    // Each tab has its own nav history stack:

    .state('tab.games', {
        url: '/games',
        views: {
            'tab-games': {
                templateUrl: 'views/tab-games.html',
                controller: 'gameListCtrl'
            }
        }
    })

    .state('tab.friends', {
            url: '/friends',
            views: {
                'tab-friends': {
                    templateUrl: 'views/tab-friends.html',
                    controller: 'FriendsCtrl'
                }
            }
        })
        .state('tab.userdetail', {
            url: '/friends/detail/:userid',
            views: {
                'tab-friends': {
                    templateUrl: 'views/friend-detail.html',
                    controller: 'userDetailCtrl'
                }
            }
        })
        .state('tab.friendmsg', {
            url: '/friends/friendmsg',
            views: {
                'tab-friends': {
                    templateUrl: 'views/friendMsg.html',
                    controller: 'friendMsgCtrl'
                }
            }
        })


    .state('tab.account', {
            url: '/account',
            views: {
                'tab-account': {
                    templateUrl: 'views/tab-account.html',
                    controller: "SettingCtrl"
                }
            }
        })
        .state('tab.invite', {
            url: '/games/invite/:gametype',
            views: {
                'tab-games': {
                    templateUrl: 'views/invite.html',
                    controller: 'InviteCtrl'
                }

            }
        })
        .state('tab.editenick', {
            url: '/games/editenick',
            views: {
                'tab-account': {
                    templateUrl: 'views/editenick.html',
                    controller: 'SettingCtrl'
                }
            }
        })
        .state('tab.editepassword', {
            url: '/games/editepassword',
            views: {
                'tab-account': {
                    templateUrl: 'views/editepassword.html',
                    controller: 'SettingCtrl'
                }
            }
        })

        .state('room', {
            url: '/games/room/:gametype/:roomname',
            templateUrl: "views/room.html",
            controller:'RoomCtrl'
        })
        .state('game', {
            url: '/games/game/:gametype/:roomname',
            templateUrl: 'views/game.html',
            controller: 'GameCtrl'
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/index');


    //设置http为jq格式
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj) {
            var query = '';
            var name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});