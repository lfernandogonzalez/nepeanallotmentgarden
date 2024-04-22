
async function get_user() {
  document.querySelector('.loader').style.display = "inline-block";
  var data = { UserPoolId: _config.cognito.userPoolId, ClientId: _config.cognito.clientId };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function (err, session) {
      if (err) { console.log(err); return; }
      console.log('session validity: ' + session.isValid());

      cognitoUser.getUserAttributes(function (err, result) {
        if (err) { console.log(err); return; }

        email = result[2].getValue();
        console.log("Logged in user:" + email);
        get_user_info(email);
      });
    });
  } else {
    console.log("User is signed-out");
    document.querySelector('.loader').style.display = "none";
    document.querySelector('.sign_in').style.display = "inline-block";
  }
}

async function get_user_info(email) {
  const api_url = 'https://thv3sn3j63.execute-api.us-east-1.amazonaws.com/prod/get_naga_user_by_email?user_email=' + encodeURIComponent(email);
  const api_response = await fetch(api_url);
  const api_data = await api_response.json();
  const userData = JSON.parse(api_data['body']);

  document.getElementById('member_email').innerHTML = userData['email'];
  document.querySelector('.sign_out').style.display = "inline-block";
  document.querySelector('.loader').style.display = "none";
  
}


function sign_out() {
  const data = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.clientId
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  const cognitoUser = userPool.getCurrentUser();

  if (cognitoUser != null) {
    cognitoUser.getSession(function (err, session) {
      if (err) { alert(err); return;}
      console.log('session validity: ' + session.isValid());
      cognitoUser.signOut();
      console.log("Sign out successful");
      document.querySelector('.sign_in').style.display = "inline-block";
      document.querySelector('.sign_out').style.display = "none";
    });
  } else {
    console.log("Already signed-out")
  }
  
}

function open_sign_up() {
  // document.querySelector('.sign_up').style.display = "inline-block";
  // document.querySelector('.sign_in').style.display = "none";
  // document.querySelector('.sign_out').style.display = "none";

  window.open('https://naga.auth.us-east-1.amazoncognito.com/signup?client_id=6mkmj7cfc7vd5g04cgm6lrm6ql&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fwww.nepeanallotmentgarden.com%2Fverify.html','_blank'); 

}


function close_sign_up() {
  document.querySelector('.sign_up').style.display = "none";
  document.querySelector('.sign_in').style.display = "inline-block";
  document.querySelector('.sign_out').style.display = "none";
}

// Sign in
function sign_in() {
      
  var email = document.getElementById("sign_in_email").value;
  var password = document.getElementById("sign_in_password").value;
  var authenticationData = { Username : email, Password : password, };
  var data = { UserPoolId : _config.cognito.userPoolId, ClientId : _config.cognito.clientId };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var cognitoUser = userPool.getCurrentUser();
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  var userData = { Username : email, Pool : userPool,};
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  
  cognitoUser.authenticateUser(authenticationDetails, {    
    onSuccess: function (result) {
      var accessToken = result.getAccessToken().getJwtToken();
      console.log(result);	

      cognitoUser.getUserAttributes(function(err, result) {
        if (err) { console.log(err); return;}
        window.location.href='./profile.html';
      });

    },
      onFailure: function(err) { alert(err.message || JSON.stringify(err));},
  });
      
}
