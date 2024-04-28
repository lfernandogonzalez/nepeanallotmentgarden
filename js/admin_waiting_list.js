function get_waiting_list() {
    document.getElementById('all_waiting_lists').innerHTML="";
    const url = 'https://g1t81zygbh.execute-api.us-east-1.amazonaws.com/prod/get_naga_members';
    fetch(url, { method: 'GET', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(response => {
        
        const plotTypeElements = {};

        response.forEach((element, index) => {
            
            if (element['request_plot']) {
                console.log(element['email']);
                const {email, first_name, last_name, street_address, postal_code, phone_number, request_plot_type, request_plot_number, request_plot_date} = element;
                
                const plotType = request_plot_type;
                
                if (!plotTypeElements[plotType]) {
                    plotTypeElements[plotType] = [];
                }

                const collapsedDiv = document.createElement('div');
                collapsedDiv.className = 'collapsed_requested_plots_info';
                collapsedDiv.id = `collapsed_requested_plots_info_${index}`;
                collapsedDiv.setAttribute('onclick', `expand_requested_plot_info(${index}, true,'${email}','${plotType}')`);  
                collapsedDiv.style.cssText = 'width: auto; cursor: pointer; display: flex; justify-content: space-between;';
                collapsedDiv.innerHTML = `<div style="align-self: center;" class="search_key_requested_plots">${email}</div><img src="img/icon-down.png"  style="width: 20px; align-self: center;">`;

                const expandedDiv = document.createElement('div');
                expandedDiv.className = 'expanded_requested_plots_info';
                expandedDiv.id = `expanded_requested_plots_info_${index}`;
                expandedDiv.innerHTML = `
                    <div class="expanded_box_toggle" onclick='expand_requested_plot_info(${index})'>
                    <span style="width:70%; display:inline-block;">${email}</span>
                    <span style="width:30%; text-align:right; display:inline-block"><img src="img/icon-up.png" style="width:20px"></span>
                    </div>
                    <p><b>Name:</b> ${first_name} ${last_name}<br>
                    <b>Address:</b> ${street_address} ${postal_code}<br>
                    <b>Phone number:</b> ${phone_number}<br>
                    <b>Plots:</b> <span id="requesting_member_plots_${index}">Loading...</span><br>
                    <b>Last logged in:</b><br>

                    <p>
                        <b>Requested plots:</b> ${request_plot_type}, ${request_plot_number}.<br>
                        <b>Date requested:</b> ${request_plot_date} <br>
                    </p>
                    
                    <div id="assignable_plots_${index}">Loading...</div><div id="assign_plot_confirmation_${index}"></div>
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
        document.getElementById('collapsed_requested_plots_info_'+index).style.display='none';
        document.getElementById('expanded_requested_plots_info_'+index).style.display='block';
        get_member_plots(email,"requesting_member_plots_"+index);
        assign_requested_plot(index,email,plot_type);
        
    } else {
        document.getElementById('collapsed_requested_plots_info_'+index).style.display='flex';
        document.getElementById('expanded_requested_plots_info_'+index).style.display='none';
    }

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
            assign_plot(selectedPlotId, email,index);
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


function assign_plot(plot_id,email,index)
{
    // assign plot
    var today = new Date();
    var formattedDate = today.toISOString().split('T')[0];

    fetch('https://cwjjxnn2dd.execute-api.us-east-1.amazonaws.com/prod/', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "plotId": plot_id,
        "occupant":email,
        "date_assigned":formattedDate

    })
    })
    .then(response => response.json())
    .then(response => { 
        
        console.log(JSON.stringify(response));
    
    })

    // remove plot request from user profile
    const data = {};
    data['email'] = email;
    data['request_plot'] = false;
    data['request_plot_date'] = "";
    data['request_plot_number'] = "";
    data['request_plot_type'] = "";


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
            document.getElementById('collapsed_requested_plots_info_'+index).style.display='none';
            document.getElementById('expanded_requested_plots_info_'+index).style.display='none';
            console.log(response);
        });
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

function select_from_waiting_list(plot_id){
    value=document.getElementById("select_from_waiting_list_"+plot_id).value;
    document.getElementById("occupant_"+plot_id).value=value;
    chage_assigned_date(plot_id);
  
}


function chage_assigned_date(plot_id){
    
    document.getElementById("edit_plot_date_assigned_"+plot_id).value= new Date().toLocaleDateString("en-US", date_options);
}


