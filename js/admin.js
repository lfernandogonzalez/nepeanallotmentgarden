
var date_options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric',
minute: 'numeric' };

function open_admin_tab(evt, tabName) {
    console.log("Loaded admin tab: " + tabName)
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("admin_tab_content");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("admin_tab_buttons");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }
  

function get_user() {
    console.log('Getting user');
    var data = { UserPoolId: _config.cognito.userPoolId, ClientId: _config.cognito.clientId };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
    var cognitoUser = userPool.getCurrentUser();
  
    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err) { console.log(err); return; }
        console.log('Session validity: ' + session.isValid());
  
        cognitoUser.getUserAttributes(function (err, result) {
          if (err) { console.log(err); return; }
  
          email = result[2].getValue();
          console.log("Logged in user:" + email);
          get_user_info(email);
        });
      });
    } else {
      console.log("User is signed-out");
    }
  }
  
  async function get_user_info(email) {
    const api_url = 'https://thv3sn3j63.execute-api.us-east-1.amazonaws.com/prod/get_naga_user_by_email?user_email=' + encodeURIComponent(email);
    const api_response = await fetch(api_url);
    const api_data = await api_response.json();
    const userData = JSON.parse(api_data['body']);
  
    if(userData['admin']){  
        console.log('Admin');
        const temp_var = get_members(); 
    } else {
        console.log('Not admin');
        alert('You are not an admin user therefore you cannot access this page');
        window.location.href = "index.html";
    }
  }


function search(tab) {
    var search_term, container, all_divs, search_key, i, txtValue;
    document.getElementById("filter_"+tab).value="all_"+tab;
    search_term = document.getElementById("search_" + tab).value.toUpperCase();
    container = document.getElementById("all_" + tab);
    all_divs = container.getElementsByTagName("div");
    for (i = 0; i < all_divs.length; i++) {
        search_key = all_divs[i].getElementsByClassName("search_key_"+tab)[0];
        if (search_key) {
            txtValue = search_key.textContent || search_key.innerText;
            if (txtValue.toUpperCase().indexOf(search_term) > -1) {
                all_divs[i].style.display = "flex";
            } else {
                all_divs[i].style.display = "none";
            }
        }
    }
    
}


function filter(tab) {
    var input,all_divs, i;
    document.getElementById("search_" + tab).value="";
    input = document.getElementById("filter_"+tab).value;
    all_divs = document.getElementById("all_members").getElementsByClassName("collapsed_members_info");
    
    
    if(input=="all_"+tab)
    {
        for (i = 0; i < all_divs.length; i++) {
            all_divs[i].style.display = "flex";
        }

        console.log('Filter applied: All');
    }

    if (input == "current_renters") {
        for (i = 0; i < all_divs.length; i++) {
            var this_div = all_divs[i];
            var hasPlotsElement = this_div.querySelector(".has_plots");
            
            if (hasPlotsElement && hasPlotsElement.value === "true") {
                this_div.style.display = "flex";
            } else {
                this_div.style.display = "none";
            }
        }
        console.log('Members filtered: Active members')
    }

    
    

   

    if(input.includes("plot_type_"))
    {
       console.log(input)
       document.getElementById(tab+'_raised_beds').style.display="none";
       document.getElementById(tab+'_annuals').style.display="none";
       document.getElementById(tab+'_perennials').style.display="none";
       document.getElementById(tab+'_lockers').style.display="none";
       document.getElementById(tab+"_"+input.replace("plot_type_","")).style.display="";
       
        console.log('Filter applied');
    }


    if(input=="all_"+tab && tab != "members")
    {
       
       document.getElementById(tab+'_raised_beds').style.display="";
       document.getElementById(tab+'_annuals').style.display="";
       document.getElementById(tab+'_perennials').style.display="";
       document.getElementById(tab+'_lockers').style.display="";
       
        console.log('Filter applied: all waiting lists');
    }
}



