function get_members() {
    const api_url = 'https://g1t81zygbh.execute-api.us-east-1.amazonaws.com/prod/get_naga_members';
    const all_members_container = document.getElementById('all_members');
    all_members_container.innerHTML = ""; // Clear previous content
    let index = 0;

    fetch(api_url)
    .then(response => response.json())
    .then(response => {
        response['Items'].forEach(element => {
            const email = element['email']['S'];
            const isAdmin = element['admin'] && element['admin']['BOOL'];
            const admin_checkbox = isAdmin ? 'checked' : '';
            const admin_message = isAdmin ? "<br><img src=img/icon-star.png width=15> Administrator" : '';
            const has_plots = element['has_plots'] ? element['member_plots']['S'] : '';
            const request_plot = element['request_plot'] && element['request_plot']['BOOL'] ? `${element['request_plot_type']['S']}, ${element['request_plot_number']['S']}. ${element['request_plot_date']['S']}` : 'None';
            const last_logged_in = element['last_logged_in'] ? new Date(element['last_logged_in']['S']).toLocaleDateString("en-US", date_options) : '';

            const collapsedDiv = document.createElement('div');
            collapsedDiv.classList.add('collapsed_members_info');
            collapsedDiv.id = `collapsed_members_info_${index}`;
            collapsedDiv.setAttribute('onclick', `toggleMemberInfo(${index},'${email}')`);
            collapsedDiv.style.cssText = 'width: auto; cursor: pointer; display: flex; justify-content: space-between;';
            collapsedDiv.innerHTML = `
                <div style="align-self: center;" class="search_key_members">${email}</div>
                <img src="img/icon-down.png" style="width: 20px; align-self: center;">
            `;

            const expandedDiv = document.createElement('div');
            expandedDiv.classList.add('expanded_members_info');
            expandedDiv.id = `display_members_info_${index}`;
            expandedDiv.style.display = 'none'; // Initially hidden
            expandedDiv.innerHTML = `
                <div style="width:100%; cursor:pointer;" onclick='toggleMemberInfo(${index})'>
                    <span style="width:70%; display:inline-block;">${email}</span>
                    <span style="width:30%; text-align:right; display:inline-block"><img src="img/icon-up.png" style="width:20px"></span>
                </div>
                <p><b>Name:</b> <span id="member_first_name_${index}">${element['first_name']['S']}</span> <span id="member_last_name_${index}">${element['last_name']['S']}</span></p>
                <p><b>Address:</b> <span id="member_street_address_${index}">${element['street_address']['S']}</span> <span id="member_postal_code_${index}"> ${element['postal_code']['S']}</span></p>
                <p><b>Phone number:</b> <span id="member_phone_number_${index}">${element['phone_number']['S']}</span></p>
                <p><b>Plots:</b> <span id="member_plots_${index}">Loading...</span></p>
                <p><b>Requested plots:</b> ${request_plot}</p>
                <p><b>Last logged in:</b> ${last_logged_in}</p>
                <p>${admin_message}</p>
                <p>
                    <div id="edit_member_button_${index}"> <input type="button"  onclick='open_edit_member(${index},true)' value='Edit' ></div>
                    <div id="save_edit_member_button_${index}"  style="display:none"><input type="button"onclick='save_edit_member(${index},"${email}")' value='Save'></div>
                    <div id="cancel_edit_member_button_${index}" style="display:none"><input type="button" onclick='open_edit_member(${index},false)' value='Cancel'></div>
                </p>
            `;

            all_members_container.appendChild(collapsedDiv);
            all_members_container.appendChild(expandedDiv);
            index++;
        });
    })
    .catch(error => {
        console.error('Error fetching members:', error);
    });
}


// Function to toggle between collapsed and expanded divs
function toggleMemberInfo(index,email) {
    const collapsedDiv = document.getElementById(`collapsed_members_info_${index}`);
    const expandedDiv = document.getElementById(`display_members_info_${index}`);
    
    if (collapsedDiv.style.display === 'none') {
        collapsedDiv.style.display = 'flex';
        expandedDiv.style.display = 'none';
    } else {
        collapsedDiv.style.display = 'none';
        expandedDiv.style.display = 'block';
        get_member_plots(email,"member_plots_"+index);
    }
}




function open_edit_member(index, open) {
    const elements = ['first_name','last_name', 'street_address','postal_code', 'phone_number'];
    const buttons = ['edit_member_button', 'save_edit_member_button', 'cancel_edit_member_button'];

    elements.forEach(element => {
        const elementId = `member_${element}_${index}`;
        const elementEl = document.getElementById(elementId);
        const inputValue = elementEl.textContent.trim();

        if (open) {
            elementEl.innerHTML = `<br><input type="text" id="edit_member_${element}_${index}" value="${inputValue}">`;
        } else {
            const inputEl = elementEl.querySelector('input');
            elementEl.textContent = inputEl.value;
        }
    });

    buttons.forEach(button => {
        const buttonEl = document.getElementById(`${button}_${index}`);
        buttonEl.style.display = open ? (button === 'edit_member_button' ? 'none' : 'inline-block') : (button === 'edit_member_button' ? 'inline-block' : 'none');
    });
}




function save_edit_member(index,email) {
    const requestBody = {
        email:email,
        first_name: document.getElementById(`edit_member_first_name_${index}`).value,
        last_name: document.getElementById(`edit_member_last_name_${index}`).value,
        street_address: document.getElementById(`edit_member_street_address_${index}`).value,
        postal_code: document.getElementById(`edit_member_postal_code_${index}`).value,
        phone_number: document.getElementById(`edit_member_phone_number_${index}`).value
    };

    fetch('https://ixih1qmuzb.execute-api.us-east-1.amazonaws.com/prod', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(response => {
        console.log(response);
        open_edit_member(index, false);
    });
}


function add_member(){
    
    email=document.getElementById('admin_input_email').value;
    first_name=document.getElementById('admin_input_first_name').value;
    last_name=document.getElementById('admin_input_last_name').value;
    street_address=document.getElementById('admin_input_street_address').value;
    postal_code=document.getElementById('admin_input_postal_code').value;
    phone_number=document.getElementById('admin_input_phone_number').value;
    //admin=document.getElementById('admin_input_admin_checkbox').checked;
    
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
        "postal_code":postal_code,
        "phone_number":phone_number
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



function get_member_plots(email,target) {
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
        const member_plot_list = document.getElementById(target);
          
        if (response.length === 0) {
            member_plot_list.innerHTML = "None";
            console.log('Member has no plots');
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
