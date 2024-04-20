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

  console.log(api_data);
  const userData = JSON.parse(api_data['body']);

  document.getElementById('member_email').innerHTML = userData['email'];

  const member_admin = userData['admin'];
  if (member_admin) {
    document.getElementById('member_admin').value = member_admin;
    document.getElementById('admin_access').style.display = "block";
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

function open_edit_profile(open) {
  document.querySelector('.overlay').style.display = open ? "block" : "none";
  document.querySelector('.edit_profile').style.display = open ? "block" : "none";
}

function update_profile() {
  const email = document.getElementById('member_email').innerHTML;
  const admin = document.getElementById('member_admin').value;
  const fields = ['first_name', 'last_name', 'street_address', 'postal_code', 'phone_number'];
  const data = {};

  data['email'] = email;
  data['admin'] = admin;

  fields.forEach(field => {
    const value = document.getElementById('edit_profile_' + field).value;
    if (value) {
      data[field] = value;
    }
  });

  fetch('https://ixih1qmuzb.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(response => {
      open_edit_profile(false);
    });
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
  console.log('Email: ' + email);

  const api_url = 'https://90oukjmsob.execute-api.us-east-1.amazonaws.com/prod/get_my_plots?email=' + encodeURIComponent(email);
  console.log(api_url);

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
      myPlotsList.innerHTML = '<h4>My plots</h4>';

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

        let paymentMessage = "";
        if (payment === "Awaiting payment") {
          const deadline = dateAssigned ? new Date(dateAssigned.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
          const daysRemaining = deadline ? Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
          paymentMessage = `<font color="red">Awaiting payment.</font><br><br>You have until <b>${deadline.toLocaleDateString("en-US", date_options)}</b> to make a payment.<br>If a payment is not received in the next <b>${daysRemaining}</b> days the plot will be assigned to someone else.<br><br><input type="button" value="Make a payment" onclick="window.open('https://square.link/u/UyZb9hJo','_blank')" style="width:200px">`;
        } else if (payment === "Payment overdue") {
          paymentMessage = `<font color="red">Your payment is overdue</font><br><br>You've had this plot assigned to you for over 30 days, and we have not received payment.<br>This plot can be assigned to someone else in our waiting list, at any time and without notice. Please make a payment today to secure your plot for the season.<br><br><input type="button" value="Make a payment" onclick="window.open('https://square.link/u/UyZb9hJo','_blank')" style="width:200px">`;
        } else if (payment === "Paid") {
          paymentMessage = "Paid for the season";
        }

        const option = document.createElement("option");
        option.text = "Yes - " + plotId;
        option.value = plotId;
        document.getElementById('request_plot_trade').add(option);

        const tabContent = document.createElement("div");
        tabContent.setAttribute('id', "plot_tab_" + plotId);
        tabContent.innerHTML = `
          <b>Plot Id: ${plotId}</b>
          <br>Plot Type: ${plotType}
          <br>Size: ${width}x ${height} feet
          <br>Date assigned: ${dateAssigned ? dateAssigned.toLocaleDateString("en-US", date_options) : ""}
          <br>Period: May 1st, 2024 - October 31st, 2024
          <br>Rate: ${rate} (per year)
          <br>Status: ${paymentMessage}
        `;
        myPlotsList.appendChild(tabContent);

      });

      console.log('My plots loaded');
      hideLoader(); // Hide loader after plots are loaded
    });
}

function get_requested_plots() {
  showLoader(); // Show loader while fetching requested plots
  const email = document.getElementById('member_email').innerHTML;

  const api_url = 'https://70tip4ggnj.execute-api.us-east-1.amazonaws.com/prod/get_my_waiting_list?email=' + encodeURIComponent(email);
  fetch(api_url, { method: 'GET', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
    .then(response => response.json())
    .then(response => {
      if (response.Item) {
        const item = response.Item;
        const date_added = new Date(item.date_added).toLocaleString();

        document.getElementById('requested_plot_type').innerText = item.plot_type;
        document.getElementById('requested_plot_number').innerText = item.plot_number;
        document.getElementById('requested_trade_option').innerText = item.trade_option;
        document.getElementById('requested_date_joined').innerText = date_added;


        document.querySelector('.request_plot_button').style.display = 'none';
        document.querySelector('.request_plot').style.display = 'none';
        document.querySelector('.requested_plots').style.display = 'block';
        console.log('My requested plots loaded');
      } else {
        document.querySelector('.requested_plots').style.display = 'none';
        document.querySelector('.request_plot_button').style.display = 'block'; 
        console.log('My requested plots loaded, none found');
      }
      hideLoader(); // Hide loader after requested plots are loaded
    })
    .catch(error => {
      console.error('Error fetching waiting list:', error);
    });
}

function open_request_plot(open) {
  document.querySelector('.overlay').style.display = open ? "block" : "none";
  document.querySelector('.request_plot').style.display = open ? "block" : "none";
}

function request_plot(admin) {
  showLoader();
  const email = document.getElementById('member_email').innerHTML;
  const plot_type = document.getElementById('request_plot_type').value;
  const trade_option = document.getElementById('request_plot_trade') ? document.getElementById('request_plot_trade').value : "No";
  const plot_number = document.getElementById('request_plot_number').value || "First available";

  const requestData = {
    email: email,
    plot_type: plot_type,
    plot_number: plot_number,
    trade_option: trade_option
  };

  fetch('https://ln7qb82w92.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(response => {
      console.log(response);
      console.log("trade_option: " + trade_option);
      get_requested_plots();
    });
}

function cancel_plot_request() {
  if (!confirm('Are you sure you want to cancel this request? You will lose your place in line')) {
    return;
  }

  const email = document.getElementById('member_email').innerHTML;
  const api_url = 'https://naqr1xdbd7.execute-api.us-east-1.amazonaws.com/prod/delete_from_waiting_list?email=' + encodeURIComponent(email);

  fetch(api_url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(response => {
      console.log(response);
      console.log('Item deleted from waiting list');
      document.querySelector('.requested_plots').style.display = 'none';
      document.querySelector('.request_plot_button').style.display = 'block';
      get_requested_plots();
    })
    .catch(error => {
      console.error('Error cancelling plot request:', error);
    });
}

function request_plot_number(value) {
  if (value == "special_request") {
    document.getElementById('request_plot_number').style.display = "inline-block";
  } else {
    document.getElementById('request_plot_number').style.display = "none";
  }
}

function open_newsletter_archive() {
  var newsletterArchive = document.querySelector('.newsletter_archive');
  newsletterArchive.style.display = newsletterArchive.style.display === "block" ? "none" : "block";
}

// Define showLoader and hideLoader functions
function showLoader() {
  document.getElementById('loader').style.display = 'block';
  document.querySelector('.my_account').style.display = 'none';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  document.querySelector('.my_account').style.display = 'block';
}
