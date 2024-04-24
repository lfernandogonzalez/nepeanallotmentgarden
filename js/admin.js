
async function get_user() {
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

  const member_admin = userData['admin'];
  if (member_admin) {
    console.log("User is admin")
  } else {
    window.location.href = './profile.html';
  }

}







//old
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
  

// MEMBER FUNCTIONS 



function get_members(){

    all_members=`<div class="list">`;
    row=0;
    members_email =[];

    const api_url = 'https://g1t81zygbh.execute-api.us-east-1.amazonaws.com/prod/get_naga_members';
    fetch(api_url, {
        method: 'GET',
        headers: {'Accept': 'application/json','Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(response => {
        response['Items'].forEach(element => {
            row++;
            members_email.unshift(element['email']['S']);
            let last_logged_in = "";
            
            if (element['admin'] && element['admin']['BOOL']) { admin_checkbox = "checked"; admin_message = "<br><img src=img/icon-star.png width=15> Administrator";
            } else { admin_checkbox = ""; admin_message = "";}
            
            has_plots = element['has_plots'] ? element['member_plots']['S'] : "";
            request_plot = element['request_plot'] && element['request_plot']['BOOL'] ? element['request_plot_type']['S'] + ", " + element['request_plot_number']['S'] + ". " + element['request_plot_date']['S'] : "None";
            last_logged_in = element['last_logged_in'] ? new Date(element['last_logged_in']['S']).toLocaleDateString("en-US", date_options) : "";
            
            all_members=all_members+ `
                <div>
                    <div class="collapsed_member_info" id="collapsed_member_info_${row}" onclick="expand_member_info(${row},true)" >${element['email']['S']}</div>
                    <div class="expanded_member_info" id="display_member_info_${row}">
                        <div onclick='expand_member_info(${row})'  style="width:100%; cursor:pointer;"><span  style="width:70%; display:inline-block;">${element['email']['S']}</span><span style="width:30%; text-align:right; display:inline-block"><img src="img/icon-up.png" style="width:20px"></span></div>
                        <p><b>Name:</b> ${element['first_name']['S'] + " " + element['last_name']['S'] }
                        <br><b>Address:</b> ${element['street_address']['S'] + " " + element['postal_code']['S']}
                        <br><b>Phone number:</b> ${element['phone_number']['S']}
                        <br><b>Plots:</b> ${has_plots}
                        <br><b>Requested plots:</b> ${request_plot} 
                        <br><b>Last logged in:</b> ${last_logged_in}
                        ${admin_message} </p>
                        <p><input type=button onclick='open_edit_member(${row})' value='Edit' ></p>
                    </div>

                    </div>
                    <div class="expanded_member_info" id="edit_member_info_${row}" style="display:none">
                        <p>
                            <b>Email:</b>
                            <br><span id="edit_member_email_${row}">${element['email']['S']}</span> 
                            <br><br><input type="checkbox" id="edit_member_admin_${row}" ${admin_checkbox}> Admin
                        </p>
                        <p>
                            <b>Name:</b>
                            <br><input id="edit_member_first_name_${row}" type="text" Placeholder="First Name" value="${element['first_name']['S']}">
                            <input id="edit_member_last_name_${row}"  type="text"  Placeholder="Last Name" value="${element['last_name']['S']}" > 
                        </p>
                        <p>
                            <b>Address:</b>
                            <br><input id="edit_member_street_address_${row}"  type="text" Placeholder="Street Address"  value="${element['street_address']['S']}">
                            <input id="edit_member_postal_code_${row}"  type="text" Placeholder="Postal Code" value="${element['postal_code']['S']}">
                        </p>
                        <p>
                            <b>Phone Number:</b>
                            <br><input id="edit_member_phone_number_${row}" type="text" Placeholder="000-000-0000" value="${element['phone_number']['S']}">
                        </p>
                        <p><b>Plots:</b><p>${has_plots}</p>

                        <p>Requested plots:<p>${request_plot}</p>
                        

                        <p>
                            
                        </p>

                        

                        <br><br><input type="button" onclick="edit_member(${row})" value="Save"> 
                        <input type="button" onclick="close_edit_member(${row})" value="Cancel" style="background-color:tomato">
                        <br><br><input type=button onclick='remove_member("${element['email']['S']}")' value='Delete Account' style="background-color:tomato">
                        <br><br>
                    </div>
                </div>`; 

        });
        
        document.getElementById('all_members').innerHTML=all_members+"</div>";;
       if(document.getElementById("search_members").value )  { search('members'); }
       console.log('All members loaded') 
       
       filter('members');
       
        
        
    });


}

function expand_member_info (row,open){
    
    if(open)
    {
        document.getElementById('collapsed_member_info_'+row).style.display='none';
        document.getElementById('display_member_info_'+row).style.display='block';
    } else {
        document.getElementById('collapsed_member_info_'+row).style.display='block';
        document.getElementById('display_member_info_'+row).style.display='none';
    }

}

function expand_plot_info (row,open){
    console.log('hey')
    if(open)
    {
        document.getElementById('collapsed_plot_info_'+row).style.display='none';
        document.getElementById('show_plot_info_'+row).style.display='block';
    } else {
        document.getElementById('collapsed_plot_info_'+row).style.display='block';
        document.getElementById('show_plot_info_'+row).style.display='none';
    }

}

function expand_waiting_list (row,open){
    console.log('hey')
    if(open)
    {
        document.getElementById('collapsed_waiting_list_'+row).style.display='none';
        document.getElementById('expanded_waiting_list_'+row).style.display='block';
    } else {
        document.getElementById('collapsed_waiting_list_'+row).style.display='block';
        document.getElementById('expanded_waiting_list_'+row).style.display='none';
    }

}

function edit_member (row){
    
    email = document.getElementById('edit_member_email_'+row).innerHTML;
    first_name = document.getElementById('edit_member_first_name_'+row).value;
    last_name = document.getElementById('edit_member_last_name_'+row).value;
    street_address = document.getElementById('edit_member_street_address_'+row).value;
    city = document.getElementById('edit_member_city_'+row).value;
    province = document.getElementById('edit_member_province_'+row).value;
    postal_code = document.getElementById('edit_member_postal_code_'+row).value;
    phone_number= document.getElementById('edit_member_phone_number_'+row).value;
    admin= document.getElementById('edit_member_admin_'+row).checked;
    
    
    fetch('https://ixih1qmuzb.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "email": email,
        "first_name":first_name,
        "last_name":last_name,
        "street_address":street_address,
        "city":city,
        "province":province,
        "postal_code":postal_code,
        "phone_number":phone_number,
        "admin":admin
    })
    })
    .then(response => response.json())
    .then(response => { console.log(response); get_members();})
      
  }


function add_member(){
    
    email=document.getElementById('admin_input_email').value;
    first_name=document.getElementById('admin_input_first_name').value;
    last_name=document.getElementById('admin_input_last_name').value;
    street_address=document.getElementById('admin_input_street_address').value;
    city=document.getElementById('admin_input_city').value;
    province=document.getElementById('admin_input_province').value;
    postal_code=document.getElementById('admin_input_postal_code').value;
    phone_number=document.getElementById('admin_input_phone_number').value;
    admin=document.getElementById('admin_input_admin_checkbox').checked;
    
    fetch('https://baf4kiept7.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "email": email,
        "first_name":first_name,
        "last_name":last_name,
        "street_address":street_address,
        "city":city,
        "province":province,
        "postal_code":postal_code,
        "phone_number":phone_number,
        "admin":admin
    })
    })
    .then(response => response.json())
    .then(response => { console.log(response);close_add_member();get_members();})
    
    
}

function open_add_member(){
    document.getElementById('add_member_form').style.display="block";
    document.getElementById('admin_controls_members').style.display="none";
}

function close_add_member(){
    document.getElementById('add_member_form').style.display="none";
    document.getElementById('admin_controls_members').style.display="block";
}

function remove_member(email){if(confirm("Are you sure you want to remove this user? This cannot be undone.")==true){
    const api_url = 'https://ddgo7c2d6l.execute-api.us-east-1.amazonaws.com/prod/remove_member?email='+ encodeURIComponent(email);
    
  
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        console.log(JSON.stringify(response)); 
        delete_from_waiting_list(email);
        get_members();
    })
  
    
}}


function open_edit_member (row) {
    document.getElementById('display_member_info_'+row).style.display='none';
    document.getElementById('edit_member_info_'+row).style.display='block';

}


function close_edit_member (row) {
    document.getElementById('display_member_info_'+row).style.display='block';
    document.getElementById('edit_member_info_'+row).style.display='none';

}







/// WAITING LIST FUNCTIONS
function get_waiting_list() {
    document.getElementById('all_waiting_lists').innerHTML="";
    const url = 'https://g1t81zygbh.execute-api.us-east-1.amazonaws.com/prod/get_naga_members';
    fetch(url, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(response => {
        const plotTypeElements = {};

        response['Items'].forEach((element, index) => {
            if (element['request_plot'] && element['request_plot']['BOOL']) {
                const {email, first_name, last_name, street_address, postal_code, phone_number, request_plot_type, request_plot_number, request_plot_date} = element;
                
                const plotType = request_plot_type['S'];
                
                if (!plotTypeElements[plotType]) {
                    plotTypeElements[plotType] = [];
                }

                const collapsedDiv = document.createElement('div');
                collapsedDiv.className = 'collapsed_requested_plot_info';
                collapsedDiv.id = `collapsed_requested_plot_info_${index}`;
                collapsedDiv.setAttribute('onclick', `expand_requested_plot_info(${index}, true,'${email['S']}','${plotType}')`);
                collapsedDiv.style.cssText = 'width: auto; cursor: pointer; display: flex; justify-content: space-between;';
                collapsedDiv.innerHTML = `<div style="align-self: center;">${email['S']}</div><img src="img/icon-down.png"  style="width: 20px; align-self: center;">`;

                const expandedDiv = document.createElement('div');
                expandedDiv.className = 'expanded_requested_plot_info';
                expandedDiv.id = `expanded_requested_plot_info_${index}`;
                expandedDiv.innerHTML = `
                    <div onclick='expand_requested_plot_info(${index})' style="width: auto; cursor: pointer; display: flex; justify-content: space-between;">
                        <div  style="align-self: center;">${email['S']}</div>
                        <img src="img/icon-up.png"  style="width: 20px; align-self: center;">
                    </div>
                    <p><b>Name:</b> ${first_name['S']} ${last_name['S']}<br>
                    <b>Address:</b> ${street_address['S']} ${postal_code['S']}<br>
                    <b>Phone number:</b> ${phone_number['S']}<br>
                    <b>Plots:</b> <span id="requesting_member_plots_${index}">Loading...</span><br>
                    <b>Last logged in:</b><br>

                    <p>
                        <b>Requested plots:</b> ${request_plot_type['S']}, ${request_plot_number['S']}.<br>
                        <b>Date requested:</b> ${request_plot_date['S']} <br>
                    </p>
                    
                    <div id="assignable_plots_${index}"></div>
                `;

                plotTypeElements[plotType].push({collapsedDiv, expandedDiv});
            }
        });

        const allWaitingLists = document.getElementById('all_waiting_lists');
        Object.entries(plotTypeElements).forEach(([plotType, elements]) => {
            const plotTypeHeading = document.createElement('h2');
            plotTypeHeading.style.paddingLeft = '10px';
            plotTypeHeading.textContent = plotType;
            allWaitingLists.appendChild(plotTypeHeading);

            elements.forEach(({collapsedDiv, expandedDiv}) => {
                allWaitingLists.appendChild(collapsedDiv);
                allWaitingLists.appendChild(expandedDiv);
            });
        });
    });
}






function expand_requested_plot_info (index,open,email,plot_type){
    
    if(open)
    {
        document.getElementById('collapsed_requested_plot_info_'+index).style.display='none';
        document.getElementById('expanded_requested_plot_info_'+index).style.display='block';
        get_member_plots(email,"requesting_member_plots_"+index);
        assign_requested_plot(index,email,plot_type);
        
    } else {
        document.getElementById('collapsed_requested_plot_info_'+index).style.display='flex';
        document.getElementById('expanded_requested_plot_info_'+index).style.display='none';
    }

}


function get_member_plots(email,target) {
    
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
        const member_plot_list = document.getElementById(target);
          
        if (response.length === 0) {
            member_plot_list.innerHTML = "None";
            console.log('My plots loaded');
            return;
        }
        else {
            member_plot_list.innerHTML = "";
            response.forEach(element => {
                plot_id = element['plotId']['S'].replace(/["']/g, "") + " ";
                member_plot_list.innerHTML += plot_id;
            });
        }
        console.log('Member plots loaded');
      });
  }


async function assign_requested_plot(index, email,plot_type) {
    const api_url = 'https://90oukjmsob.execute-api.us-east-1.amazonaws.com/prod/get_my_plots?plot_type=' + encodeURIComponent(plot_type);
    
    
    var newDiv = document.createElement("div");
    var selectInput = document.createElement("select");
    selectInput.id = "plot_select_" + index;

    // Fetch plot info from the API
    
    fetch(api_url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
    .then(response => response.json())
    .then(response => {
        
        // Create an object to hold plot IDs grouped by plot types
        var plotsByType = {};
        response.forEach(plot => {
            
            // Only proceed if the occupant field is empty
            if (!plot.occupant['S'] || plot.occupant['S'] === '') {
                var plotId = plot.plotId['S'];
                var plotType = plot.plot_type['S'];

                // If plot type doesn't exist in plotsByType object, create it
                if (!plotsByType[plotType]) {
                    plotsByType[plotType] = [];
                }

                // Add plot ID to corresponding plot type array
                plotsByType[plotType].push(plotId);
            }
        });

        // Iterate over plotsByType object and create optgroup for each plot type
        for (var type in plotsByType) {
            var optgroup = document.createElement("optgroup");
            optgroup.label = type;

            // Append each plot ID to the corresponding optgroup
            plotsByType[type].forEach(plotId => {
                var option = document.createElement("option");
                option.text = plotId;
                option.value = plotId;
                optgroup.appendChild(option);
            });

            // Append optgroup to the select input
            selectInput.appendChild(optgroup);
        }

        // Append the select input to the new div
        newDiv.appendChild(selectInput);

        // Create a button for assigning the plot
        var assignButton = document.createElement("button");
        assignButton.textContent = "Assign Plot";
        assignButton.className = "assign_plot_button"
        assignButton.onclick = function() {
            var selectedPlotId = selectInput.value;
            assign_plot(selectedPlotId, email);
        };

        // Append the button to the new div
        newDiv.appendChild(assignButton);

         

        // Get the div where the select input will be placed
        var parentDiv = document.getElementById(`assignable_plots_${index}`);
        parentDiv.innerHTML="";
        
        // Append the new div with select input and button to the parent div
        parentDiv.appendChild(newDiv);
    })
    .catch(error => {
        console.error('Error fetching plot info:', error);
    });
}





  
function get_waiting_list2()
{
    
    document.getElementById('all_waiting_lists').innerHTML='<div id="waiting_list"></div>';
    const api_url = 'https://omwtz3crjb.execute-api.us-east-1.amazonaws.com/prod';
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {  
        
        plot_types=JSON.parse(response); row=0; waiting_list_id=0;
        plot_types.forEach(plot_type => {
            row++
            
            if(document.getElementById('filter_waiting_lists').length <5 ) {
                var option = document.createElement("option");
                option.text =plot_type['Title'];
                option.value="plot_type_" +plot_type['Title'].toLowerCase().replace(/ /g,'_');
                document.getElementById('filter_waiting_lists').add(option);
            }

            document.getElementById('waiting_list').insertAdjacentHTML('beforebegin', `
            <table class="list"  id="waiting_lists_${plot_type['Title'].toLowerCase().replace(/ /g,'_')}">
                <tr><td><h3 style="padding-left:15px">${plot_type['Title']}</h3><span></span></td></tr>
                <tr id="waiting_list_row_${row}">
                </tr>
                <tr><td><span><br><br></span></td></tr>
            </table>
            `);
            
            
            
            plot_type['Body'].forEach(item => {

                waiting_list_id++

                if(item['has_plots']['BOOL']==true) { has_plots="<img src='img/checkmark.png' alt='Active NAGA member' width='15'>" } else { has_plots=""}
                document.getElementById("waiting_list_row_"+row).insertAdjacentHTML('afterend', `<tr>
                
                <td valign=top>
                    <div id="collapsed_waiting_list_${waiting_list_id}" onclick="expand_waiting_list('${waiting_list_id}',true)" style="cursor:pointer; display:block">
                    <span style="width:70%; display:inline-block;">${item['place']['N']}) ${item['email']['S']}</span><span style="width:30%; text-align:right; display:inline-block"><img style="vertical-align:bottom"  src="img/icon-down.png" width="20"></span>
                    </div>
                    <div id="expanded_waiting_list_${waiting_list_id}" style="display:none">
                        <div onclick="expand_waiting_list('${waiting_list_id}')" style="padding:5px;cursor:pointer; display:block">
                            <span style="width:70%; display:inline-block;">${item['place']['N']}) ${item['email']['S']}</span><span style="width:30%; text-align:right; display:inline-block"><img style="vertical-align:bottom"  src="img/icon-up.png" width="20"></span>
                        </div>
                        <div style="min-width:50px" class="in_line"><b>Position:</b><h3># ${item['place']['N']}</h3></div>
                        <div class="in_line"><b>Email:</b><br><span id="assign_plot_email_${waiting_list_id}">${item['email']['S']}</span> ${has_plots }</div>
                        <div class="in_line"><b>Desired plot:</b><br> ${item['plot_number']['S']}</div>
                        <div class="in_line"><b>Date joined:</b><br> ${new Date(item['date_added']['S']).toLocaleDateString("en-US", date_options)} </div>
                        
                        <br>
                        <div class="in_line">
                            <div id="assign_plots_top_${waiting_list_id}">
                                <input type='button' onclick='open_assign_plot(\"${waiting_list_id}\",\"${plot_type['Title']}\")' value='Assign'>
                                <input type='button' onclick='delete_from_waiting_list(\"${item['email']['S']}\")' style="background-color:tomato" value='Delete'>
                            </div>
                            <div id="assign_plots_bottom_${waiting_list_id}" style="display:none">
                            <b> Select plot:</b>
                            <br> <select style="width:200px;" id='assign_plot_list_${waiting_list_id}'></select>
                            <br><br> <input type='button' onclick='assign_plot(\"${waiting_list_id}\")' value='Submit'>
                                <input type='button' onclick='close_assign_plot(\"${waiting_list_id}\")' style="background-color:tomato" value='Cancel'>
                            </div>
                        </div>
                    </div>
                </td>
                </tr>`);
            });

        });
        autocomplete(document.getElementById("add_waiting_list_email"), members_email);
        search('waiting_lists');
        console.log('All waiting lists loaded')
    
    });

}


function open_assign_plot(waiting_list_id,plot_type){
    get_empty_plots(plot_type,waiting_list_id);
    document.getElementById('assign_plots_top_'+waiting_list_id).style.display="none";
    document.getElementById('assign_plots_bottom_'+waiting_list_id).style.display="inline-block";
    
}

function close_assign_plot(waiting_list_id){
    document.getElementById('assign_plots_top_'+waiting_list_id).style.display="inline-block";
    document.getElementById('assign_plots_bottom_'+waiting_list_id).style.display="none";
}


function get_empty_plots(plot_type,waiting_list_id){
    var select = document.getElementById("assign_plot_list_"+waiting_list_id);
    select.innerHTML="";
    const api_url = 'https://jawb81aeuf.execute-api.us-east-1.amazonaws.com/prod/get_empty_plots?plot_type=' + encodeURIComponent(plot_type);
    
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => { 
      
      response.forEach(element => {
        var el = document.createElement("option");
        el.textContent = element['plotId']['S'];
        el.value = element['plotId']['S'];
        select.appendChild(el);
      });
  
      
    })
  
  }


function open_add_waiting_list(){
    document.getElementById('add_waiting_list_form').style.display="block";
    document.getElementById('admin_controls_waiting_list').style.display="none";
}

function close_add_waiting_list(){
    document.getElementById('add_waiting_list_form').style.display="none";
    document.getElementById('admin_controls_waiting_list').style.display="block";
}


function search(tab) {
    document.getElementById("filter_"+tab).value="all_"+tab

    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("search_"+tab);
    filter = input.value.toUpperCase();
    ul = document.getElementById("all_"+tab);
    li = ul.getElementsByTagName("td");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("span")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }

    console.log('Search performed: ' + input.value);
    
}

function filter(tab) {
    var input, item, i, value;
    input = document.getElementById("filter_"+tab).value;
    item = document.getElementById("all_"+tab).getElementsByTagName("td");

    if(input=="all_"+tab)
    {
        for (i = 0; i < item.length; i++) {
            item[i].style.display = "";
        }

        console.log('Filter applied: All');
    }

    if(input=="current_renters")
    {
        for (i = 0; i < item.length; i++) {
            value = item[i].getElementsByTagName("p")[0].innerHTML
            if (value) {
                item[i].style.display = "";
            } else {
                item[i].style.display = "none";
            }
        }

        console.log('Filter applied: Members only');
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








// PLOT FUNCTIONS
function get_plots() {
    document.getElementById('all_plots').innerHTML="";
    const api_url = 'https://90oukjmsob.execute-api.us-east-1.amazonaws.com/prod/get_my_plots';
    const plot_list = document.getElementById('all_plots');
    let index = 0;
  
    fetch(api_url)
    .then(response => response.json())
    .then(response => {
        // Group plots by plot_type
        const plotsByType = response.reduce((acc, plot) => {
            const plotType = plot.plot_type ? plot.plot_type['S'] : 'Unknown';
            if (!acc[plotType]) {
                acc[plotType] = [];
            }
            acc[plotType].push(plot);
            return acc;
        }, {});

        // Sort plot types alphabetically, except 'lockers' which will be placed last
        const plotTypes = Object.keys(plotsByType)
            .filter(plotType => plotType !== 'Lockers') // Filter out 'lockers'
            .sort()
            .concat('Lockers'); // Append 'lockers' at the end

        // Iterate over plot types and create divs
        plotTypes.forEach(plotType => {
            const plotsInType = plotsByType[plotType];
            const plotTypeHeader = document.createElement('h2');
            plotTypeHeader.style.paddingLeft = '10px';
            plotTypeHeader.textContent = plotType;
            plot_list.appendChild(plotTypeHeader);

            plotsInType
                .sort((a, b) => a.plotId['S'].localeCompare(b.plotId['S'])) // Sort plots within each group alphabetically by plotId
                .forEach((plot) => {
                    // Extract plot attributes
                    const plotId = plot.plotId['S'];
                    const occupant = plot.occupant ? plot.occupant['S'] : 'N/A';
                    const height = plot.height ? plot.height['S'] : 'N/A';
                    const width = plot.width ? plot.width['S'] : 'N/A';
                    const rate = plot.rate ? plot.rate['S'] : 'N/A';
                    const dateAssigned = plot.date_assigned ? plot.date_assigned['S'] : 'N/A';
                    const payment = plot.payment ? plot.payment['S'] : 'N/A';

                    // Create collapsed and expanded divs for each plot
                    const collapsedDiv = document.createElement('div');
                    collapsedDiv.classList.add('collapsed_plot_info');
                    collapsedDiv.id = `collapsed_plot_info_${index}`;
                    collapsedDiv.setAttribute('onclick', `togglePlotInfo(${index})`);
                    collapsedDiv.style.cssText = 'width: auto; cursor: pointer; display: flex; justify-content: space-between;';
                    collapsedDiv.innerHTML = `
                        <div style="align-self: center;">${plotId}</div>
                        <img src="img/icon-down.png" style="width: 20px; align-self: center;">
                    `;

                    const expandedDiv = document.createElement('div');
                    expandedDiv.classList.add('expanded_plot_info');
                    expandedDiv.id = `expanded_plot_info_${index}`;
                    expandedDiv.style.display = 'none'; // Initially hidden
                    expandedDiv.innerHTML = `
                        <div onclick='togglePlotInfo(${index})' style="width: auto; cursor: pointer; display: flex; justify-content: space-between;">
                            <div style="align-self: center;">${plotId}</div>
                            <img src="img/icon-up.png" style="width: 20px; align-self: center;">
                        </div>
                        <div class="plot_details">
                            <br><b>Occupant:</b> ${occupant}
                            <br><b>Size:</b>${height} x ${width}
                            <br><b>Rate:</b>$${rate}
                            <br><b>Date Assigned:</b>${dateAssigned}
                            <br><b>Status:</b>${payment}
                        </div>
                    `;

                    // Append the collapsed and expanded divs to the plot_list
                    plot_list.appendChild(collapsedDiv);
                    plot_list.appendChild(expandedDiv);
                    index++;
                });
        });
    })
    .catch(error => {
        console.error('Error fetching plots:', error);
    });
}

// Function to toggle between collapsed and expanded divs
function togglePlotInfo(index) {
    const collapsedDiv = document.getElementById(`collapsed_plot_info_${index}`);
    const expandedDiv = document.getElementById(`expanded_plot_info_${index}`);
    
    if (collapsedDiv.style.display === 'none') {
        collapsedDiv.style.display = 'flex';
        expandedDiv.style.display = 'none';
    } else {
        collapsedDiv.style.display = 'none';
        expandedDiv.style.display = 'block';
    }
}




function get_plots_old()
{
    document.getElementById('all_plots').innerHTML='<div id="all_plots_start"></div>';
    const api_url = 'https://q1ycf9s40a.execute-api.us-east-1.amazonaws.com/prod';
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => { 

        plot_types=JSON.parse(response); row=0;
        

        plot_types.forEach(plot_type => {
            console.log("Plot type: " + plot_type['Title']);
            row++
            if(document.getElementById('filter_plots').length <5 ) {
                var option = document.createElement("option");
                option.text =plot_type['Title'];
                option.value="plot_type_" +plot_type['Title'].toLowerCase().replace(/ /g,'_');
                document.getElementById('filter_plots').add(option);
            }

            document.getElementById('all_plots_start').insertAdjacentHTML('beforebegin', `
             

            <table class="list"  id="plots_${plot_type['Title'].toLowerCase().replace(/ /g,'_')}">
                <tr><td><span></span><h3 style="padding-left:15px">${plot_type['Title']}</h3></td></tr>
                <tr id="plots_row_${row}"></tr>
                <tr><td><br><br><span></span></td></tr>
            </table>
            `);
            
            plot_type['Body'].forEach(plot => {
                plot_id=plot['plotId']['S'];
                
                if(plot['occupant']['S']) {occupant=plot['occupant']['S'];} else {occupant=""; };
                if(plot['height']['S']) {height=plot['height']['S'];} else {height=""};
                if(plot['width']['S']) {width=plot['width']['S'];} else {width=""};
                if(plot['rate']['S']) {rate=plot['rate']['S'];} else {rate=""};
                if(plot['date_assigned']) {date_assigned=plot['date_assigned']['S'];} else {date_assigned=""};
                if(plot['payment']) {payment=plot['payment']['S'];} else {payment=""};
                if(payment=="Awaiting payment") { awaiting_selected="selected"; overdue_selected=""; paid_selected=""}
                else if(payment=="Payment overdue") { awaiting_selected=""; overdue_selected="selected";paid_selected="selected"}
                else if(payment=="Paid") { awaiting_selected=""; overdue_selected="";paid_selected="selected"}
                else { awaiting_selected=""; overdue_selected="";paid_selected="";}

                document.getElementById("plots_row_"+row).insertAdjacentHTML('afterend', `
                <tr>
                <td valign=top>

                <div id="collapsed_plot_info_${plot_id}" onclick="expand_plot_info('${plot_id}',true)" style="padding:5px;cursor:pointer; display:block">
                <span style="width:70%; display:inline-block;">${plot_id}</span><span style="width:30%; text-align:right; display:inline-block"><img  style="vertical-align:bottom" src="img/icon-down.png" width="20"></span>
                </div>
                    <div id="show_plot_info_${plot_id}" style="display:none">
                    <div onclick="expand_plot_info('${plot_id}')" style="padding:5px;cursor:pointer; display:block">
                         <span style="width:70%; display:inline-block;">${plot_id}</span><span style="width:30%; text-align:right; display:inline-block"><img  style="vertical-align:bottom" src="img/icon-up.png" width="20"></span>
                    </div>
                        <div class="in_line">
                            <b>Plot number:</b>
                            <br><h3><span>${plot_id}</span></h3>
                        </div>

                        <div class="in_line">
                            <b>Size:</b>
                            <br>${height} x ${width}
                        </div>

                        <div class="in_line">
                            <b>Rate:</b>
                            <br>$${rate}
                        </div>
                        
                        <div class="in_line">
                            <b>Occupant:</b>
                            <br>${occupant}
                        </div>

                        <div class="in_line">
                            <b>Date Assigned:</b>
                            <br> ${date_assigned}
                        </div>

                        <div class="in_line">
                            <b>Status:</b>
                            <br>${payment}
                        </div>

                        <br>
                        <input type='button' onclick='open_edit_plot("${plot['plotId']['S']}","${plot['plot_type']['S'] }")' value='Edit'>
                        <input type='button' onclick='remove_plot("${plot['plotId']['S']}")' value='Delete' style='background-color:tomato'>
                    
                    </div>

                    <div id="edit_plot_info_${plot_id}" style="display:none">

                        <div class="in_line">
                            <b>Plot number:</b>
                            <br><h3><span id="edit_plot_number_${plot_id}">${plot_id}</span></h3>
                        </div>

                        <div class="in_line">
                            <b>Size:</b>
                            <br><input  style="width:40px; text-align:center;" type="text" id="edit_plot_height_${plot_id}" value="${height}">
                            x <input style="width:40px; text-align:center;" type="text" id="edit_plot_width_${plot_id}" value="${width}">
                        </div>

                        <div class="in_line">
                            <b>Rate:</b>
                            <br> $<input style=" width:50px" type="text" id="edit_plot_rate_${plot_id}" value="${rate}">
                        </div>
                        
                        <div class="in_line">
                            <b>Occupant:</b>
                            <div class='autocomplete'><input id='occupant_${plot_id}' onchange='chage_assigned_date("${plot_id}")' type='text' placeholder="Email address" name='occupant_${plot_id}' value='${occupant}' style="width:200px"></div>
                            <br><br> or select from waiting list: 
                            <br> <select style="width:200px;" onchange='select_from_waiting_list("${plot_id}")' id='select_from_waiting_list_${plot_id}'><option></option></select>
                        </div>

                        <div class="in_line">
                            <b>Date Assigned:</b>
                            <br> <input type="text" id="edit_plot_date_assigned_${plot_id}" value="${date_assigned}">
                        </div>

                        <div class="in_line">
                            <b>Status:</b><br>
                            <select id="edit_plot_status_${plot_id}">
                                <option></option>
                                <option value="Awaiting payment" ${awaiting_selected}>Awaiting payment</option>
                                <option value="Payment overdue" ${overdue_selected}>Payment overdue</option>
                                <option value="Paid" ${paid_selected}>Paid</option>
                            </select>
                        </div>

                        <br>
                        <input type='button'  onclick='edit_plot("${plot_id}",document.getElementById("occupant_${plot_id}").value);' value='Submit'>  
                        <input type='button'  onclick='close_edit_plot("${plot_id}")' value='Cancel 'style='background-color:tomato'>


                        <div class="in_line" id="edit_plot_buttons1_${plot_id}">
                        </div>
                        <div class="in_line" id="edit_plot_buttons2_${plot_id}" style="display:none">

                    </div>
a

                           
                        </div>
                </td>
                </tr>`);

                
                

            });

            search('plots');
            console.log('All plots loaded')

        });

        

        
    });

}

function edit_plot(plot_id, email){
    
    height=document.getElementById("edit_plot_height_"+plot_id).value;
    width=document.getElementById("edit_plot_width_"+plot_id).value;
    rate=document.getElementById("edit_plot_rate_"+plot_id).value;
    date_assigned=document.getElementById("edit_plot_date_assigned_"+plot_id).value;
    payment=document.getElementById("edit_plot_status_"+plot_id).value;
    
    fetch('https://cwjjxnn2dd.execute-api.us-east-1.amazonaws.com/prod/', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "plotId": plot_id,
        "occupant":email,
        "height":height,
        "width":width,
        "rate":rate,
        "payment":payment,
        "date_assigned":date_assigned

    })
    })
    .then(response => response.json())
    .then(response => { 
        
        console.log(JSON.stringify(response));
        delete_from_waiting_list(email);
        get_plots();
        
        
    
    })
    

    
}

function delete_from_waiting_list(email,ask_confirm){
  
    if(ask_confirm)
    {if(!confirm('Are you sure you want to cancel this request? You will loose your place in line')){ return;}}
  
    const api_url = 'https://naqr1xdbd7.execute-api.us-east-1.amazonaws.com/prod/delete_from_waiting_list?email='+encodeURIComponent(email);
    
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
      console.log('Item deleted from waiting list');})
  }

function add_plot()
  {
    
    fetch('https://phpiuxuth7.execute-api.us-east-1.amazonaws.com/prod', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "plotId": document.getElementById('input_plotId').value,
        "plot_type":document.getElementById('input_plot_type').value,
        "height":document.getElementById('input_plot_height').value,
        "width":document.getElementById('input_plot_width').value,
        "rate":document.getElementById('input_plot_rate').value
    })
    })
    .then(response => response.json())
    .then(response => { console.log(response);  close_add_plot(); get_plots();})
    
    
  }


function open_add_plot(){
    document.getElementById('add_plot_form').style.display="block";
    document.getElementById('admin_controls_plots').style.display="none";
}

function close_add_plot(){
    document.getElementById('add_plot_form').style.display="none";
    document.getElementById('admin_controls_plots').style.display="block";
}

function remove_plot(plot_id){if(confirm("Are you sure you want to remove this plot? This cannot be undone.")==true){
    // email = document.getElementById('member_email').innerHTML;
    const api_url = ' https://un7umkeqkc.execute-api.us-east-1.amazonaws.com/prod/remove_plot?plotId='+plot_id;
    
  
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {console.log(JSON.stringify(response)); get_plots();})
  
}
}


  function open_edit_plot(plot_id,plot_type){
    autocomplete(document.getElementById("occupant_"+ plot_id), members_email);

    const api_url = 'https://omwtz3crjb.execute-api.us-east-1.amazonaws.com/prod';
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => { 
        response=JSON.parse(response);
        response.forEach(element => {
        
        if(element['Title']==plot_type){
            element['Body'].reverse();
            element['Body'].forEach(item => {
                var select = document.getElementById("select_from_waiting_list_"+plot_id);
                var el = document.createElement("option");
                el.textContent = item['place']['N'] + " " + JSON.stringify(item['email']['S']).replace(/["']/g, "");
                el.value = JSON.stringify(item['email']['S']).replace(/["']/g, "");
                select.appendChild(el);
                
            });
        }
        

    });

    document.getElementById("show_plot_info_"+plot_id).style.display="none";
    document.getElementById("edit_plot_info_"+plot_id).style.display="block";

    
    })

    


    

  }


function close_edit_plot(plot_id){
    
    document.getElementById("show_plot_info_"+plot_id).style.display="block";
    document.getElementById("edit_plot_info_"+plot_id).style.display="none";
    
  }


function select_from_waiting_list(plot_id){
    value=document.getElementById("select_from_waiting_list_"+plot_id).value;
    document.getElementById("occupant_"+plot_id).value=value;
    chage_assigned_date(plot_id);
  
}


function chage_assigned_date(plot_id){
    
    document.getElementById("edit_plot_date_assigned_"+plot_id).value= new Date().toLocaleDateString("en-US", date_options);
}




function add_many_members()
{
    
    
    members=[];

    for (var i = 0; i < members.length; i++) {
        
        fetch('https://baf4kiept7.execute-api.us-east-1.amazonaws.com/prod', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "email": members[i]['email'],
            "first_name":members[i]['first_name'],
            "last_name":members[i]['last_name'],
            "street_address":members[i]['street_address'],
            "city":members[i]['city'],
            "province":members[i]['province'],
            "postal_code":members[i]['postal_code'],
            "phone_number":members[i]['phone_number'],
            "admin":members[i]['admin'],
            "verified":members[i]['verified']
        })
        })
        .then(response => response.json())
        .then(response => {  console.log(response);})
        
    }



    
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
