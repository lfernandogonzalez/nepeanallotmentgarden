// Function to open the sign-up form
function open_sign_up() {
  // document.querySelector('.sign_up').style.display = "inline-block";
  // document.querySelector('.sign_in').style.display = "none";
  // document.querySelector('.sign_out').style.display = "none";

  window.open('https://naga.auth.us-east-1.amazoncognito.com/signup?client_id=6mkmj7cfc7vd5g04cgm6lrm6ql&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmain.d1yypu660eufge.amplifyapp.com%2Fverify.html','_blank'); 

}

// Function to close the sign-up form
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
