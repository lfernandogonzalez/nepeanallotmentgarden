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


    members_table=document.getElementById('all_members').innerHTML;
    members_table=`<table class="list">`;
    row=0;
    members_email =[];

    const api_url = 'https://g1t81zygbh.execute-api.us-east-1.amazonaws.com/prod/get_naga_members';
    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {
        response['Items'].forEach(element => {
            row++;
            email=JSON.stringify(element['email']['S']).replace(/["']/g, "");
            members_email.unshift(email);
            first_name=JSON.stringify(element['first_name']['S']).replace(/["']/g, "");
            last_name=JSON.stringify(element['last_name']['S']).replace(/["']/g, "");
            street_address=JSON.stringify(element['street_address']['S']).replace(/["']/g, "");
            city=JSON.stringify(element['city']['S']).replace(/["']/g, "");
            province=JSON.stringify(element['province']['S']).replace(/["']/g, "");
            postal_code=JSON.stringify(element['postal_code']['S']).replace(/["']/g, "");
            if(element['phone_number']) { phone_number=JSON.stringify(element['phone_number']['S']).replace(/["']/g, ""); } else { phone_number='';}
            
            last_logged_in="";
            member_plots=""

            element['member_plots'].forEach(member_plot => {
                member_plots=member_plots+ " " + member_plot;
            
            })
            
            if(element['admin']) { if(element['admin']['BOOL']== true) {  admin_checkbox="checked"; admin_message="<img src=img/icon-star.png width=15> Administrator"; } else { admin_checkbox=""; admin_message=""; }  } else { admin_checkbox=""; admin_message=""; } 
            if(element['has_plots']== true) {  has_plots=member_plots; } else { has_plots="";  } 
            if(element['last_logged_in']) {  last_logged_in=new Date(element['last_logged_in']['S']).toLocaleDateString("en-US", date_options); } else { last_logged_in="";  } 
            full_name=first_name + " " + last_name;
            full_address=street_address + "<br>" + city + ", " + province + "<br>" + postal_code;
            
            members_table=members_table+ `
                <tr>
                <td valign=top>
                    <div id="collapsed_member_info_${row}" onclick="expand_member_info(${row},true)" style="padding:5px;cursor:pointer; display:block">
                        <span style="width:70%; display:inline-block;">${email}</span><span style="width:30%; text-align:right;  display:inline-block"><img style="vertical-align:bottom" src="img/icon-down.png" width="20"></span>
                    </div>
                
                    <div id="display_member_info_${row}" style="padding:5px;display:none">
                    <div onclick='expand_member_info(${row})'  style="width:100%; cursor:pointer;"><span  style="width:70%; display:inline-block;">${email}</span><span style="width:30%; text-align:right; display:inline-block"><img style="vertical-align:bottom" src="img/icon-up.png" width="20"></span></div>
                    <br>
                    <div class="in_line"><b>Name:</b><br>${full_name}</div>
                    <div class="in_line"><b>Address:</b><br>${full_address}</div>
                    <div class="in_line"><b>Phone number:</b><br>${phone_number}</div>
                    <div class="in_line"><b>Plots:</b><p>${has_plots}</p></div>
                    <div class="in_line"><b>Last logged in:</b><br>${last_logged_in}</div>
                    <div class="in_line">
                    ${admin_message} 
                    <br><br>
                    <input type=button onclick='open_edit_member(${row})' value='Edit' >
                    
                    </div>

                    </div>
                    <div id="edit_member_info_${row}" style="display:none">
                        <div class="in_line">
                            <b>Email:</b>
                            <br><span id="edit_member_email_${row}">${email}</span> 
                            <br><br><input type="checkbox" id="edit_member_admin_${row}" ${admin_checkbox}> Admin
                        </div>
                        <div class="in_line">
                            <b>Name:</b>
                            <br><input id="edit_member_first_name_${row}" type="text" Placeholder="First Name" value="${first_name}">
                            <br><input id="edit_member_last_name_${row}"  type="text"  Placeholder="Last Name" value="${last_name}" > 
                        </div>
                        <div class="in_line">
                            <b>Address:</b>
                            <br><input id="edit_member_street_address_${row}"  type="text" Placeholder="Street Address"  value="${street_address}">
                            <br><input id="edit_member_city_${row}"  type="text" style="width:85px" placeholder="City"  value="${city}">
                            <select id="edit_member_province_${row}"  style="width:70px"> <option>${province}</option><option value="AB">AB</option><option value="BC">BC</option><option value="MB">MB</option><option value="NB">NB</option><option value="NL">NL</option><option value="NS">NS</option><option value="ON" selected>ON</option><option value="PE">PE</option><option value="QC">QC</option><option value="SK">SK</option><option value="NT">NT</option><option value="NU">NU</option><option value="YT">YT</option></select>	
                            <br><input id="edit_member_postal_code_${row}"  type="text" Placeholder="Postal Code" value="${postal_code}">
                        </div>
                        <div class="in_line">
                            <b>Phone Number:</b>
                            <br><input id="edit_member_phone_number_${row}" type="text" Placeholder="000-000-0000" value="${phone_number}">
                        </div>
                        <div class="in_line"><b>Plots:</b><p>${has_plots}</p></div>
                        <div class="in_line">
                            <b>Last logged in:</b>
                            <br>${last_logged_in}
                        </div>
                        <br><br><input type="button" onclick="edit_member(${row})" value="Save"> 
                        <input type="button" onclick="close_edit_member(${row})" value="Cancel" style="background-color:tomato">
                        <br><br><input type=button onclick='remove_member("${email}")' value='Delete Account' style="background-color:tomato">
                        <br><br>
                    </div>
                </td>
            
            </tr>`; 

        });
        
        document.getElementById('all_members').innerHTML=members_table+"</table>";
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











// PLOT FUNCTIONS

function get_plots()
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




/// WAITING LIST FUNCTIONS
  
function get_waiting_list()
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
                        <div class="in_line"><b>Trade:</b><br> ${item['trade_option']['S']}</div>
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

function assign_plot(waiting_list_id){
    email=document.getElementById('assign_plot_email_'+waiting_list_id).innerHTML;
    plot_number=document.getElementById('assign_plot_list_'+waiting_list_id).value;
    
    fetch('https://q1hk67hzpe.execute-api.us-east-1.amazonaws.com/prod/', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "email": email,
        "plot_number":plot_number
    })
    })
    .then(response => response.json())
    .then(response => { 
        console.log(response);
        delete_from_waiting_list(email);
        close_assign_plot(waiting_list_id)});
               
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
