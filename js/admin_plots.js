
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
                    collapsedDiv.classList.add('collapsed_plots_info');
                    collapsedDiv.id = `collapsed_plots_info_${index}`;
                    collapsedDiv.setAttribute('onclick', `togglePlotInfo(${index})`);
                    collapsedDiv.style.cssText = 'width: auto; cursor: pointer; display: flex; justify-content: space-between;';
                    collapsedDiv.innerHTML = `<div style="align-self: center;" class="search_key_plots">${plotId}</div>
                        <img src="img/icon-down.png" style="width: 20px; align-self: center;">
                    `;

                    const expandedDiv = document.createElement('div');
                    expandedDiv.classList.add('expanded_plots_info');
                    expandedDiv.id = `expanded_plots_info_${index}`;
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
    const collapsedDiv = document.getElementById(`collapsed_plots_info_${index}`);
    const expandedDiv = document.getElementById(`expanded_plots_info_${index}`);
    
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

                <div id="collapsed_plots_info_${plot_id}" onclick="expand_plot_info('${plot_id}',true)" style="padding:5px;cursor:pointer; display:block">
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