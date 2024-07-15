var date_options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

async function get_user() {
  showLoader(); // Show loader while retrieving user info
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
        document.getElementById('member_email').innerHTML = email;
        get_user_info(email);
      });
    });
  } else {
    console.log("User is signed-out");
    window.location.href = './index.html';
  }
}

async function get_user_info(email) {
  const api_url = 'https://thv3sn3j63.execute-api.us-east-1.amazonaws.com/prod/get_naga_user_by_email?user_email=' + encodeURIComponent(email);
  const api_response = await fetch(api_url);
  const api_data = await api_response.json();
  const userData = JSON.parse(api_data['body']);
  console.log('User data:' + JSON.stringify(api_data));
  document.getElementById('edit_profile_has_plots').checked = userData['has_plots'] !== undefined ? userData['has_plots'] : 'false';

  

  const member_admin = userData['admin'];
  if (member_admin) {
    document.getElementById('member_admin').value = member_admin;
    document.getElementById('admin_access').style.display = "inline";
  }

  const fields = ['first_name', 'last_name', 'street_address', 'postal_code', 'phone_number'];
  fields.forEach(field => {
    if (userData[field]) {
      document.getElementById('edit_profile_' + field).value = userData[field];
    }
  });
  get_my_plots(); // Fetch user plots after retrieving user info
  get_requested_plots(); // Fetch requested plots after retrieving user info
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
      if (err) {
        alert(err);
        return;
      }
      console.log('session validity: ' + session.isValid());

      // sign out
      cognitoUser.signOut();
      console.log("Sign out successful");
    });
  } else {
    console.log("Already signed-out")
  }
  window.location.href = './index.html';
}

function get_my_plots() {
  showLoader(); // Show loader while fetching user plots
  const email = document.getElementById('member_email').innerHTML;
  const api_url = 'https://90oukjmsob.execute-api.us-east-1.amazonaws.com/prod/get_my_plots?email=' + encodeURIComponent(email);

  fetch(api_url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(response => {
      const myPlotsList = document.querySelector('.my_plots');
      myPlotsList.innerHTML = '<h4>Your garden plots</h4>';

      if (response.length === 0) {
        myPlotsList.innerHTML = "<p>You have no garden plots assigned to you at the moment.</p>";
        document.getElementById('perennial_option').disabled = true;
        console.log('My plots loaded');
        hideLoader(); // Hide loader after plots are loaded
        return;
      }

      response.forEach(element => {
        const plotId = element['plotId']['S'].replace(/["']/g, "");
        const dateAssigned = element['date_assigned'] ? new Date(element['date_assigned']['S']) : null;
        const plotType = element['plot_type'] ? element['plot_type']['S'].replace(/["']/g, "") : "";
        const height = element['height'] ? element['height']['S'].replace(/["']/g, "") : "";
        const width = element['width'] ? element['width']['S'].replace(/["']/g, "") : "";
        const rate = element['rate'] ? "$" + element['rate']['S'].replace(/["']/g, "") : "";
        const occupant = element['occupant'] ? element['occupant']['S'].replace(/["']/g, "") : "";
        let payment = element['payment'] ? element['payment']['S'].replace(/["']/g, "") : "";
        const imageName = plotType.toLowerCase().replace(/\s+/g, '_')

        const option = document.createElement("option");
        option.text = "Yes - " + plotId;
        option.value = plotId;
        document.getElementById('request_plot_trade').add(option);

        const tabContent = document.createElement("div");
        tabContent.setAttribute('id', "plot_tab_" + plotId);
        tabContent.innerHTML = `
          <div style="display: flex; align-items: center; border:none">
            <div style="border:none; text-align:center">
            <img src="img/icon_${imageName}s.png" alt="Plot Image" style="width: 100px; ">
            <br>${plotType}<br>${plotId}<br>
            
            </div>
            <div style="border:none">
              <br>Size: ${width}x ${height} feet
              <br>Date assigned: ${dateAssigned ? dateAssigned.toLocaleDateString("en-US", date_options) : ""}
              <br>Period: May 1st, 2024 - October 31st, 2024
              <br>Rate: ${rate} (per year)
              <br>Status: ${payment}
            </div>
          </div>
        `;
        myPlotsList.appendChild(tabContent);

      });

      console.log('My plots loaded');
      hideLoader(); // Hide loader after plots are loaded
    });
}

async function get_requested_plots() {
  showLoader(); 
  const api_url = 'https://thv3sn3j63.execute-api.us-east-1.amazonaws.com/prod/get_naga_user_by_email?user_email=' + encodeURIComponent(email);
  const api_response = await fetch(api_url);
  const api_data = await api_response.json();

  if(JSON.parse(api_data['body'])['request_plot_type']) {

    document.getElementById('requested_plot_type').innerText = JSON.parse(api_data['body'])['request_plot_type'];
    document.getElementById('requested_plot_notes').innerText = JSON.parse(api_data['body'])['request_plot_notes'];
    document.getElementById('requested_date_joined').innerText = new Date(JSON.parse(api_data['body'])['request_plot_date']).toLocaleDateString();;
    

    document.querySelector('.request_plot_button').style.display = 'none';
    document.querySelector('.cancel_plot_request_button').style.display = 'block';
    document.querySelector('.requested_plots').style.display = 'block';
    console.log('My requested plots loaded');

  } else {
    document.querySelector('.requested_plots').style.display = 'none';
    document.querySelector('.request_plot_button').style.display = 'block'; 
    document.querySelector('.cancel_plot_request_button').style.display = 'none'; 
    console.log('My requested plots loaded, none found');
  }

  hideLoader(); 


}

function open_request_plot(open) {
  document.querySelector('.request_plot').style.display = open ? "block" : "none";
  document.querySelector('.my_plots').style.display = open ? "none" : "block";
  document.querySelector('.user_action_buttons').style.display = open ? "none" : "block";
  document.querySelector('h4').scrollIntoView({ behavior: 'smooth' });
}

function request_plot() {
  
  const email = document.getElementById('member_email').textContent;
  const admin = document.getElementById('member_admin').value;
  const fields = ['first_name', 'last_name', 'street_address', 'postal_code', 'phone_number','has_plots','request_plot_type','request_plot_notes'];
  let data= {};

  fields.forEach(field => {
    const value = document.getElementById('edit_profile_' + field).value;
    if (value) {
      data[field] = value;
    }
  }); 
  data['email'] = email;
  data['admin'] = admin;


  fetch('https://ixih1qmuzb.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: { 'Accept': 'application/json','Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(response => {
      open_request_plot(false);
      get_requested_plots();
    })
  .catch(error => console.error('There was a problem with the fetch operation:', error));
}




function cancel_plot_request() {
  if (!confirm('Are you sure you want to cancel this request? You will lose your place in line')) return;

  const email = document.getElementById('member_email').textContent;
  const data = {
    email,
    cancel_request: true
  };

  fetch('https://ixih1qmuzb.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(response => {
      open_request_plot(false);
      get_requested_plots();
    })
  .catch(error => console.error('There was a problem with the fetch operation:', error));
}


function showLoader() {
  document.getElementById('loader').style.display = 'block';
  document.querySelector('.my_account').style.display = 'none';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  document.querySelector('.my_account').style.display = 'block';
}
