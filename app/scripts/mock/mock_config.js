Mock.mock('http://192.168.0.112:8080/login', {status:true,data:{username:'helloword',nick:'lol',head:'balabala'} });
Mock.mock('http://192.168.0.112:8080/register', {status:true,data:{username:'helloword',nick:'lol',head:'balabala'} });

Mock.mock('http://192.168.0.112:8080/asdsad/friendsonline', [{
        username: 'user1',
        nick: 'user1'
    }, {
        username: 'user2',
        nick: 'user2'
    }, {
        username: 'user3',
        nick: 'user3'
    }, {
        username: 'user4',
        nick: 'user4'
    }

])

Mock.mock('http://192.168.0.112:8080/asdsad/friends', [{
        username: 'user1',
        nick: 'user1'
    }, {
        username: 'user2',
        nick: 'user2'
    }, {
        username: 'user3',
        nick: 'user3'
    }, {
        username: 'user4',
        nick: 'user4'
    }

])

Mock.mock('http://192.168.0.112:8080/asdsad/wis',{});