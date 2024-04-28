
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
                            <p><br><b>Occupant:</b> <span id="plot_occupant_${index}">${occupant}</span></p>
                            <p><b>Size:</b><span id="plot_height_${index}">${height}</span> x <span id="plot_width_${index}">${width}</span></p>
                            <p><b>Rate:</b>$<span id="plot_rate_${index}">${rate}</span></p>
                            <p><b>Date Assigned:</b><span id="plot_date_assigned_${index}">${dateAssigned}</span></p>
                            <p><b>Status:</b><span id="plot_status_${index}">${payment}</span></p>
                            <p>
                                <div id="edit_plot_button_${index}"><input type="button" value="Edit" onclick="open_edit_plot(${index},true)"></div>
                                <div id="save_edit_plot_button_${index}"  style="display:none"><input type="button"onclick='save_edit_plot(${index},"${plotId}")' value='Save'></div>
                                <div id="cancel_edit_plot_button_${index}" style="display:none"><input type="button" onclick='open_edit_plot(${index},false)' value='Cancel'></div>
                                <div id="delete_plot_button_${index}" style="display:none"><input type="button" onclick='delete_plot("${plotId}",${index})' value='Delete Plot'></div>
                            </p>
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

function open_edit_plot(index, open) {
    const elements = ['occupant','height', 'width','rate', 'date_assigned','status'];
    const buttons = ['edit_plot_button', 'save_edit_plot_button', 'cancel_edit_plot_button', 'delete_plot_button'];

    elements.forEach(element => {
        const elementId = `plot_${element}_${index}`;
        const elementEl = document.getElementById(elementId);
        const inputValue = elementEl.textContent.trim();

        if (open) {
            elementEl.innerHTML = `<br><input type="text" id="edit_plot_${element}_${index}" value="${inputValue}">`;
        } else {
            const inputEl = elementEl.querySelector('input');
            elementEl.textContent = inputEl.value;
        }
    });

    buttons.forEach(button => {
        const buttonEl = document.getElementById(`${button}_${index}`);
        buttonEl.style.display = open ? (button === 'edit_plot_button' ? 'none' : 'inline-block') : (button === 'edit_plot_button' ? 'inline-block' : 'none');
    });
}




function save_edit_plot(index,plot_id) {
    const requestBody = {
        plotId:plot_id,
        occupant: document.getElementById(`edit_plot_occupant_${index}`).value,
        height: document.getElementById(`edit_plot_height_${index}`).value,
        width: document.getElementById(`edit_plot_width_${index}`).value,
        rate: document.getElementById(`edit_plot_rate_${index}`).value,
        date_assigned: document.getElementById(`edit_plot_date_assigned_${index}`).value,
        payment: document.getElementById(`edit_plot_status_${index}`).value,
        
    };

    fetch('https://cwjjxnn2dd.execute-api.us-east-1.amazonaws.com/prod/', {
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
        open_edit_plot(index, false);
    });
}



function open_add_plot(open){
    
    document.querySelector('.overlay').style.display = open ? "block" : "none";
    document.querySelector('.add_plot_form').style.display = open ? "block" : "none";

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
    .then(response => { console.log(response);  open_add_plot(); get_plots();})
    
    
  }





async function delete_plot(plot_id, index) {
    if (!confirm('Are you sure you want to delete this plot? This cannot be undone')) return;

    const api_url = 'https://un7umkeqkc.execute-api.us-east-1.amazonaws.com/prod/remove_plot?plotId='+plot_id;
    

    fetch(api_url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(response => {console.log(JSON.stringify(response)); 
        document.getElementById(`collapsed_plots_info_${index}`).style.display = 'none';
        document.getElementById(`expanded_plots_info_${index}`).style.display = 'none';
        
    })


}



