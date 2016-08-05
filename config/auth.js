var Auth = {
    'facebookAuth' : {
        'clientID'      : '652062438171162', // your App ID
        'clientSecret'  : 'b327284209202fb4bed1b76d767fc84e', // your App Secret
        'callbackURL'   : 'http://localhost:8888/login/facebook/return'
    },
    'jwt' : {
    	'secret' : 'lets play some games'
    }
}

module.exports = Auth;