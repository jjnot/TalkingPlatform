(function() {
    var AccountModule = angular.module('AccountModule', ['AccountService']);
    AccountModule.controller('LoginCtrl', ['$scope', '$rootScope', '$window', 'checkInfo', 'AccountSave', 'AccountRequest', 'AccountGet',
        function($scope, $rootScope, $window, checkInfo, AccountSave, AccountRequest, AccountGet) {
            $scope.userInfo = {
                    username: "",
                    password: ""
                }
                //初始化步骤
            var account = AccountGet();
            if (account) {
                $scope.userInfo.username = account.username;
                $window.localStorage.clear();
            }

            $scope.errors = []
            $scope.submit = function() {
                $scope.errors = [];
                if (checkInfo.checkUsername($scope.userInfo.username, $scope.errors) && checkInfo.checkPass($scope.userInfo.password, $scope.errors)) {
                    AccountRequest.doLogin($scope.userInfo).
                    success(function(data) {
                        console.log(data);
                        if (data.status) {
                            if (AccountSave(data.data)) {
                                $rootScope.$state.go("tab.games");
                            }
                        } else {
                            $scope.errors.push(data.data);
                        }
                    }).
                    error(function(data) {
                        $scope.errors.push("网络连接失败");
                    })
                }

            }

        }
    ])

    AccountModule.controller('RegisterCtrl', ['$scope', '$rootScope', 'checkInfo', 'AccountSave', 'AccountRequest',
        function($scope, $rootScope, checkInfo, AccountSave, AccountRequest) {
            $scope.userInfo = {
                username: "",
                password: "",
                nick: ""
            }
            $scope.errors = [];
            $scope.submit = function() {
                $scope.errors = [];
                if (checkInfo.checkUsername($scope.userInfo.username, $scope.errors) && checkInfo.checkPass($scope.userInfo.password, $scope.errors) && checkInfo.checkNick($scope.userInfo.nick, $scope.errors)) {
                    AccountRequest.doRegister($scope.userInfo).
                    success(function(data) {
                        if (data.status) {
                            if (AccountSave(data.data)) {
                                $rootScope.$state.go("tab.games");
                            }
                        } else {
                            $scope.errors.push(data.data);
                        }

                    }).
                    error(function(data) {
                        $scope.errors.push("网络连接失败");
                    })
                }
            }

        }
    ])


    var gameModule = angular.module('GameModule', ['AccountService', 'netService', 'ionic', 'ngCordova', 'friendService', 'gameListService']);
    gameModule.controller('InviteCtrl', ['$rootScope', '$scope', '$window', '$stateParams', '$timeout', 'ajax', '$ionicPopup', '$ionicLoading',
        function($rootScope, $scope, $window, $stateParams, $timeout, ajax, $ionicPopup, $ionicLoading) {
            $scope.friends = [];

            $ionicLoading.show({
                template: '读取好友列表'
            });
            var msg = {
                action: "getonlinefriends",
                data: {}
            }
            $scope.ws.send(JSON.stringify(msg));


            var nonet = $timeout(function() {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: '网络连接失败',
                    template: '请检查你的网络'
                });
            }, 8000);

            $scope.$on("getonlinefriends", function(event, data) {
                $scope.friends = data.data;
                $ionicLoading.hide();
                $timeout.cancel(nonet);
            })

            $scope.confirm = function() {
                var users = [],
                    i = 0;
                while (i < $scope.friends.length) {
                    if ($scope.friends[i].select) {
                        users.push({
                            username: $scope.friends[i].username
                        });
                    }
                    i++;
                }
                if (users.length > 0) {
                    $ionicLoading.show({
                        template: '提交中'
                    });

                    var room = "newroom_" + $stateParams.gametype;
                    var msg = {
                        action: room,
                        data: users
                    }
                    var newroomfail = $timeout(function() {
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: '网络连接失败',
                            template: '请检查你的网络'
                        });
                    }, 4000);
                    $scope.ws.send(JSON.stringify(msg));
                    $scope.$on("newroom", function(event, data) {
                        $ionicLoading.hide();
                        $timeout.cancel(newroomfail);
                        $rootScope.$state.go('room', {
                            roomname: data.data.room,
                            gametype: $stateParams.gametype
                        });
                    })
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: '至少选择一人',
                        template: '该游戏需要至少邀请一人才能开始'
                    });
                }

            }
        }

    ])
    gameModule.controller('tabCtrl', ['$scope', '$rootScope', '$ionicPopup', 'AccountGet', 'wsInit',
        function($scope, $rootScope, $ionicPopup, AccountGet, wsInit) {
            var account = AccountGet();
            wsInit(account);
            $scope.$on("invite", function(event, data) {
                var confirmPopup = $ionicPopup.confirm({
                    title: '游戏邀请',
                    template: data.data.room + '邀请你进入,是否接受？'
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        //接受请求
                        var acceptMsg = {
                            action: "join",
                            data: {
                                room: data.data.room
                            }
                        }
                        $scope.ws.send(JSON.stringify(acceptMsg));
                        $rootScope.$state.go('room', {
                            roomname: data.data.room,
                            gametype: data.data.gametype
                        });
                    }
                });
            })



        }
    ])
    gameModule.controller('FriendsCtrl', ['$scope', 'ajax', '$ionicPopup', '$window', 'getFriends', 'getFriendMsg',
        function($scope, ajax, $ionicPopup, $window, getFriends, getFriendMsg) {
            //先使用默认好友列表
            //alert(111);
            $scope.friends = getFriends();
            // $scope.friends = [
            //     {nick:"林小姐",username:"misslin",head:"111"}
            // ]

            // console.log(getFriends());
            // //请求核对好友列表
            // $scope.ws.send({action:"getfriends"});
            // $scope.$on("getfriends", function(data) {
            //     $window.setTimeout(function() {
            //         $scope.$apply(function(){
            //              $scope.friends = getFriends();
            //         })
            //     }, 300)
            // })

            //这里双向绑定为何有问题
            var msg = getFriendMsg();
            $scope.data = {
                msgNum: ""
            };
            if (msg.length) {
                $scope.data.msgNum = msg.length;
            }
            var msgHandle = function(evet, data) {
                $scope.$apply(function() {
                    if ($scope.data.msgNum != "") {
                        $scope.data.msgNum++;
                    } else {
                        $scope.data.msgNum = 1;
                    }
                })
            }
            $scope.$on("addfriend", msgHandle);
            $scope.$on("deletefriend", msgHandle);
            $scope.$on("acceptfriend", msgHandle);
            $scope.$on("refusefriend", msgHandle);


            $scope.addnewfriend = function() {
                $scope.newfirend = {}

                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                    template: '<input type="text" ng-model="newfirend.username">',
                    title: '添加新好友',
                    subTitle: '输入好友用户名',
                    scope: $scope,
                    buttons: [{
                        text: '取消'
                    }, {
                        text: '<b>确认</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.newfirend.username) {
                                e.preventDefault();
                            } else {
                                var msg = {
                                    action: "addfriend",
                                    data: {
                                        username: $scope.newfirend.username,
                                        nick: null,
                                        head: null
                                    }
                                }
                                $scope.ws.send(JSON.stringify(msg));
                                return $scope.newfirend.username;
                            }
                        }
                    }]
                });


            }
        }
    ])
    gameModule.controller('friendMsgCtrl', ['$scope', 'getFriendMsg', 'clearFriendMsg', 'addFriend',
        function($scope, getFriendMsg, clearFriendMsg, addFriend) {
            var msgs = getFriendMsg();
            var l = msgs.length;
            for (var i = 0; i < l; i++) {
                switch (msgs[i].type) {
                    case "addfriend":
                        msgs[i].content = "用户请求加你为好友";
                        msgs[i].acceptable = true;
                        break;
                    case "acceptfriend":
                        msgs[i].content = "好友请求通过";
                        msgs[i].acceptable = false;
                        break;
                    case "refusefriend" : 
                        msgs[i].content = "好友请求被拒绝";
                        msgs[i].acceptable = false;
                        break;
                    case "deletefriend" : 
                        msgs[i].content = "将您从好友列表中移除";
                        msgs[i].acceptable = false;
                        break;
                    default:
                        msgs[i].content = "系统消息";
                        msgs[i].acceptable = false;
                        break;
                }
            }
            $scope.msgs = msgs;
            clearFriendMsg();

            $scope.acceptFriend = function(username, index) {
                var msg2send = {
                    action: "acceptfriend",
                    data: {
                        username: username,
                        nick: null,
                        head: null
                    }
                }
                $scope.ws.send(JSON.stringify(msg2send));
                $scope.msgs[index].acceptable = false;
                $scope.msgs[index].content = "已添加好友";
                addFriend($scope.msgs[index].data);

            }
            $scope.refuseFriend = function(username) {
                var msg2send = {
                    action: "refusefriend",
                    data: {
                        username: username,
                        nick: null,
                        head: null
                    }
                }
                $scope.ws.send(JSON.stringify(msg2send));
                $scope.msgs[index].acceptable = false;
                $scope.msgs[index].content = "已拒绝添加好友";
            }

        }
    ])
    gameModule.controller('userDetailCtrl', ['$rootScope','$scope', '$stateParams', 'getFriendDetail', 'deleteFriend','$window',
        function($rootScope,$scope, $stateParams, getFriendDetail, deleteFriend,$window) {
            var username = $stateParams.userid;
            $scope.user = getFriendDetail(username);
            $scope.deletefriend = function() {
                var msg = {
                    action: "deletefriend",
                    data: {
                        username: username,
                        nick: null,
                        head: null
                    }
                }
                deleteFriend(msg.data);

                $scope.ws.send(JSON.stringify(msg));
                $window.setTimeout(function() {
                     $rootScope.$state.go('tab.friends');
                }, 300)

            }
        }
    ])
    gameModule.controller('SettingCtrl', ['$window', 'AccountSave', 'AccountClear', '$rootScope', '$scope',
        'AccountGet', '$ionicActionSheet', '$cordovaCamera', 'AccountRequest', 'uploadHead', '$ionicPopup', 'ajax',
        function($window, AccountSave, AccountClear, $rootScope, $scope, AccountGet, $ionicActionSheet, $cordovaCamera, AccountRequest, uploadHead, $ionicPopup, ajax) {
            $scope.userInfo = AccountGet();
            var backToIndex = function() {
                $rootScope.ws.close();
                //AccountClear();  //这里不再清理用户信息
                $window.setTimeout(function() {
                    $rootScope.$state.go('index');
                }, 200)
            }
            $scope.logout = function() {
                AccountRequest.doLogout().
                success(function(data) {
                    backToIndex();
                }).
                error(function(data) {
                    backToIndex();
                })
            }
            $scope.editeHead = function() {
                var hideSheet = $ionicActionSheet.show({
                    buttons: [{
                        text: '拍摄'
                    }, {
                        text: '从相册选择'
                    }],
                    titleText: '更改头像',
                    cancelText: '取消',
                    cancel: function() {
                        // add cancel code..
                    },
                    buttonClicked: function(index) {
                        var options = {
                            quality: 50,
                            destinationType: Camera.DestinationType.FILE_URI,
                            sourceType: Camera.PictureSourceType.CAMERA,
                            allowEdit: true,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 100,
                            targetHeight: 100,
                            popoverOptions: CameraPopoverOptions,
                            saveToPhotoAlbum: false
                        };
                        switch (index) {
                            case 0:
                                options.sourceType = Camera.PictureSourceType.CAMERA;
                                break;
                            case 1:
                                options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                                break;
                        }

                        $cordovaCamera.getPicture(options).then(function(imageUrl) {
                            // Success! Image data is here
                            uploadHead(imageUrl).then(
                                function(data) {
                                    //TODO:更新头像，修改Account URL;
                                    var userupdata = {
                                        username: $scope.userInfo.username,
                                        nick: $scope.userInfo.nick,
                                        head: data.data.head
                                    }
                                    AccountSave(userupdata);
                                    $scope.userInfo = AccountGet();

                                },
                                function() {
                                    $ionicPopup.alert({
                                        title: '上传头像失败',
                                        template: '请检查你的网络'
                                    });
                                });
                            // $scope.$emit("changeHeadPhoto", imageData);
                        }, function(err) {
                            $ionicPopup.alert({
                                title: '操作失败',
                                template: JSON.stringify(err)
                            });
                            // An error occurred. Show a message to the user
                        });
                        return true;
                    }
                });
            }
            $scope.editenick = function() {
                ajax('POST', "/modifynick", {
                    nick: $scope.userInfo.nick
                }).success(function() {
                    $ionicPopup.alert({
                        title: '修改成功',
                        template: '修改昵称成功'
                    });
                }).error(function() {
                    $ionicPopup.alert({
                        title: '修改失败',
                        template: '请检查你的网络'
                    });
                })

            }
            $scope.editpass = function() {
                ajax('POST', "/modifypassword", {
                    oldpassword: $scope.userInfo.oldpass,
                    newpassword: $scope.userInfo.newpass
                }).success(function(data) {
                    if (data.status == true) {
                        $ionicPopup.alert({
                            title: '修改成功',
                            template: '修改密码成功'
                        });
                    } else {
                        $ionicPopup.alert({
                            title: '修改失败',
                            template: '请检查你原密码是否正确'
                        });
                    }

                }).error(function() {
                    $ionicPopup.alert({
                        title: '修改失败',
                        template: '请检查你的网络和原密码是否正确'
                    });
                })
            }
        }
    ]);

    gameModule.controller('gameListCtrl', ['$scope', 'getGameList',
        function($scope, getGameList) {
            $scope.isloading = true;
            var gamelist = getGameList();
            if (!gamelist) {
                // var msg = {
                //     action: "getgamelist",
                //     data: {}
                // }
                // console.log(msg);
                // $scope.ws.send(JSON.stringify(msg));
                $scope.$on("getgamelist", function(event, data) {
                    $scope.$apply(function() {
                        $scope.isloading = false;
                        $scope.gamelist = data.data;
                    })
                })
            } else {
                $scope.isloading = false;
                $scope.gamelist = gamelist;
            }


        }
    ])

    gameModule.controller('GameCtrl', ['$scope', '$stateParams', '$cordovaMedia', '$ionicLoading', '$ionicScrollDelegate', '$ionicPlatform', '$window',
        '$cordovaFile', '$ionicPopup', 'uploadVoice', 'AccountGet', 'downloadVoice', '$timeout', 'deleteFiles',
        function($scope, $stateParams, $cordovaMedia, $ionicLoading, $ionicScrollDelegate, $ionicPlatform, $window, $cordovaFile, $ionicPopup, uploadVoice, AccountGet, downloadVoice, $timeout, deleteFiles) {

            var fileArr = [];
            $scope.words = [];
            $scope.isDisabled = false;
            var roomname = $stateParams.roomname;
            $scope.roomname = roomname;
            //获取房间用户列表
            var getUserMsg = {
                action: "getroomuser",
                data: {
                    room: $stateParams.roomname
                }
            }
            var Host,
                account = AccountGet();
            $scope.ws.send(JSON.stringify(getUserMsg));
            $scope.$on("getroomuser", function(event, data) {
                $scope.$apply(function() {
                    var users = data.data;
                    Host = users[0].username;
                    if (Host == account.username) {
                        $scope.isHost = true;
                    }
                });

            });

            function exit() {
                var exitMsg = {
                    action: "exit",
                    data: {
                        username: account.username,
                        nick: account.nick
                    }
                }
                $scope.ws.send(JSON.stringify(exitMsg));

                deleteFiles(fileArr);
            }
            $scope.exit = function() {
                var word;
                if ($scope.isHost) {
                    word = "房主退出游戏将解散游戏,是否确认退出?"
                } else {
                    word = "退出后无法重新加入,是否确认退出?"
                }
                $ionicPopup.confirm({
                    title: '是否确认退出',
                    template: word
                }).then(function(res) {
                    if (res) {
                        exit();
                        $scope.$state.go("tab.games");
                    }
                });
            }

            $scope.$on("exit", function(event, data) {
                if (data.data.username == Host) {
                    exit();
                    var alertPopup = $ionicPopup.alert({
                        title: '房间已解散!',
                        template: '房主退出了房间，房间自动解散'
                    });
                    alertPopup.then(function(res) {
                        $scope.$state.go("tab.games");
                    });
                }
                //TODO:显示成员退出消息
            });


            var media;
            var startTime;
            var mediaSrc;
            var voice;

            function getFilePath(startTime) {
                var filePath;
                if ($ionicPlatform.is("IOS")) {
                    filePath = cordova.file.documentsDirectory.replace(/file:\/\//, "") + "{@startTime}.amr";
                } else {
                    filePath = cordova.file.externalRootDirectory + "{@startTime}.amr";
                }
                filePath = filePath.replace(/{@startTime}/, startTime);
                fileArr.push("{@startTime}.amr".replace(/{@startTime}/, startTime));
                return filePath;
            }

            $scope.recording = function() {
                startTime = +new Date();
                $ionicLoading.show({
                    templateUrl: 'views/popover/recording_pop.html',
                    noBackdrop: true
                });

                mediaSrc = getFilePath(startTime);
                voice = new Voice(mediaSrc,
                    function() {},
                    function(err) {
                        console.log('Voice :: Error: ' + err.code);
                    });
                voice.startRecord();
            }

            function addNewRecord(msrc, time) {
                $scope.words.push({
                    nick: account.nick,
                    mediaSrc: msrc,
                    head: account.head
                })
                $ionicScrollDelegate.scrollBottom([true]);
            }
            $scope.recordingEnd = function() {
                $ionicLoading.hide();
                voice.stopRecord();
                var Duration = (+new Date()) - startTime;
                if (Duration < 2000) {
                    alert("必须发言2秒以上！");
                } else {
                    console.log("upload:" + mediaSrc);
                    $timeout(function() {
                        uploadVoice(mediaSrc);
                    }, 400)
                    addNewRecord(mediaSrc, Duration);
                }
            }

            $scope.playRecord = function(target) {
                var src = target.mediaSrc;

                var playvoice = new Voice(src,
                    // success callback
                    function() {},
                    // error callback
                    function(err) {
                        console.log('Voice :: Error: ' + err.code);
                    });
                playvoice.play();
            }

            $scope.$on("audio", function(event, evt) {
                    var filePath = getFilePath(+new Date());
                    downloadVoice(filePath, evt.data.url)
                        .then(function(result) {
                            $scope.words.push({
                                nick: evt.data.nick,
                                mediaSrc: filePath,
                                head: evt.data.head
                            })
                            $ionicScrollDelegate.scrollBottom([true]);
                        }, function(err) {
                            // Error
                            alert("下载失败!");
                        }, function(progress) {});
                })
                // 猜词游戏逻辑部分
            if ($stateParams.gametype == "猜词游戏") {
                $scope.needRightBtn = true;

                var notMyWord = function(nick) {
                    $ionicPopup.alert({
                        title: '你没有分到词',
                        template: nick + '拿到了词，猜猜他拿的是什么吧！'
                    })
                }

                var isMyWord = function(word) {
                    $ionicPopup.show({
                        template: '你拿到的词是:' + word,
                        title: '查看词牌',
                        scope: $scope,
                        buttons: [{
                            text: '未猜中'
                        }, {
                            text: '<b>已猜中</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                var rightMsg = {
                                    action: "room_" + roomname + "_right"
                                }
                                $scope.ws.send(JSON.stringify(rightMsg));
                                return true;
                            }
                        }]
                    });
                }


                $scope.$on("game_word", function(event, data) {
                    if (data.data.username == account.username) {
                        $ionicPopup.alert({
                            title: '你分到词了',
                            template: '你拿到的词是:' + data.data.word
                        })
                        $scope.$apply(function() {
                            $scope.clickRightBtn = function() {
                                isMyWord(data.data.word);
                            }
                        })
                    } else {
                        $ionicPopup.alert({
                            title: '你没分到词',
                            template: '猜猜:' + data.data.nick + "拿到的是什么吧！"
                        })
                        $scope.$apply(function() {
                            $scope.clickRightBtn = function() {
                                notMyWord(data.data.nick);
                            }
                        })
                    }
                })
            }

        }
    ])

    gameModule.controller('RoomCtrl', ['$scope', '$stateParams', 'AccountGet', '$ionicPopup',
        function($scope, $stateParams, AccountGet, $ionicPopup) {
            $scope.roomname = $stateParams.roomname;
            $scope.users = new Array();
            $scope.isHost = false;
            var account = AccountGet();
            var Host;
            var getUserMsg = {
                action: "getroomuser",
                data: {
                    room: $stateParams.roomname
                }
            }
            $scope.ws.send(JSON.stringify(getUserMsg));
            var userinit = false;
            $scope.$on("getroomuser", function(event, data) {
                if (!userinit) {
                    $scope.$apply(function() {
                        var users = data.data;
                        for (var i = users.length - 1; i >= 0; i--) {
                            users[i].status = "成员"
                        }
                        users[0].status = "房主";
                        $scope.users = users.concat($scope.users);
                        //记录房主
                        Host = users[0].username;
                        if (Host == account.username) {
                            $scope.isHost = true;
                        }
                    });
                    userinit = true;
                }
            });

            $scope.$on("join", function(event, data) {
                $scope.$apply(function() {
                    var newUser = data.data;
                    newUser.status = "成员";
                    $scope.users.push(newUser);
                });
            });

            $scope.$on("exit", function(event, data) {
                if (data.data.username == Host) {
                    exit();
                    var alertPopup = $ionicPopup.alert({
                        title: '房间已解散!',
                        template: '房主退出了房间，房间自动解散'
                    });
                    alertPopup.then(function(res) {
                        $scope.$state.go("tab.games");
                    });
                }
                $scope.$apply(function() {
                    var exitUser = data.data;
                    for (var i = 0, l = $scope.users.length; i < l; i++) {
                        if ($scope.users[i].username == exitUser.username) {
                            $scope.users.splice(i, 1);
                            break;
                        };
                    }
                })
            });

            $scope.exit = function() {
                exit();
                $scope.$state.go("tab.games");
            }

            function exit() {
                var exitMsg = {
                    action: "exit",
                    data: {
                        username: account.username,
                        nick: account.nick
                    }
                }
                $scope.ws.send(JSON.stringify(exitMsg));
            }

            $scope.startGame = function() {
                var startMsg = {
                    action: "start"
                }
                $scope.ws.send(JSON.stringify(startMsg));
            }
            $scope.$on("start", function(event, data) {
                $scope.$state.go("game", $stateParams);
            })

        }
    ])

    gameModule.controller('rootCtrl', ['$scope',
        function($scope) {
            $scope.msgpoll = {
                "addfriend": []
            }
            $scope.$on("addfriend", function(event, msg) {
                $scope.msgpoll.FriendsCtrl.push(msg);
            })
        }
    ])

})();