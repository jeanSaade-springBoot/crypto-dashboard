var d = new Date();
var date = d.toLocaleDateString('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});
var source;
var selectedRow=this;
 
(hasInsertPrivelege)?document.getElementById("date").innerHTML = date:null;

var today = new Date();
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, '0');
var day = String(today.getDate()).padStart(2, '0');
const systemDate = year + '-' + month + '-' + day;

function initiateFlow() {
	if(hasLiveFlowOptionScreenPrivelege)
	{ const menu="<a  class='navigation nav-item nav-link active' id='nav-liveOptionFlow-tab'  href='/flow/liveoptionflow' role='tab' aria-controls='nav-liveOptionFlow' aria-selected='false'>Live Option Flow</a>";
	  $('#nav-tab').append(menu);
	}if(hasLiveFlowSearchScreenPrivelege)
	{ const menu="<a  class='navigation nav-item nav-link' id='nav-flowSearchEngine-tab'  href='/flow/flowsearchengine' role='tab' aria-controls='nav-flowSearchEngine' aria-selected='false'>Flow Search Engine</a>";
	  $('#nav-tab').append(menu);
	}if(hashistoricalFlowOptionScreenPrivelege)
	{ const menu="  <a  class='navigation nav-item nav-link' id='nav-historicalFlow-tab'  href='/flow/historicalflow' role='tab' aria-controls='nav-historicalFlow' aria-selected='false'>Historical Flow</a>";
	  $('#nav-tab').append(menu);
	}
	
	if (hasInsertPrivelege)
	 {
		 const insert_row="	<div class='row'>"
				+ "		<div class='col-md-1'>"
				+ "			<label for='productDropDownList'>PRODUCT</label>"
				+ "			<div id='productDropDownList' class='br-25'></div>"
				+ "		</div>"
				+ "		<div class='col-md-2'>"
				+ "			<label for='date-input'>Date</label>"
				+ "			<div id='date-input'></div>"
				+ "		</div>"
				+ "		<div class='col-md-4'>"
				+ "			<label for='flow-input'>Flow</label>"
				+ "			<input type='text' id='flow-input' name='flow-input' class='form-control'"
				+ "				required>"
				+ "		</div>"
				+ "		<div class='col-md-1'>"
				+ "			<button id='submit' onclick='submitData()' class='btn btn-primary'>Submit</button>"
				+ "		</div>"
				+ "		<div class='col-md-3'>"
				+ "			 <div style='width: 100%; height: 40px; margin-top: 2rem;'>"
				+ "					<div class='form-group' id='notifcationContainer'>"
				+ "						<div id='jqxNotification'>"
				+ "							<div id='notificationContent'></div>"
				+ "						</div>"
				+ "					</div>"
				+ "			</div>"
				+ "		</div>"
				+ "	</div>";
	  $('#insert-row').append(insert_row);
	  $("#date-input").jqxDateTimeInput({  theme:'dark', width: '100%', height: '40px' }); 
	  var productSource = ["","BUND", "BOBL", "BUXL", "SHATZ","EURIBOR", "OAT", "BTP", "TY"];
	  $("#productDropDownList").jqxDropDownList({ source: productSource, width: '100%', height: 40,  theme:'dark',});  
		  $("#jqxNotification").jqxNotification({  height: 40, width: "100%",appendContainer: "#notifcationContainer",  opacity: 0.9,
           animationOpenDelay: 800, autoClose:true , autoCloseDelay: 1000,  template: 'info'
      }); 
      }  
 	    source =
	            {
		           datatype: "json",
		           datafields: [
	 		                    { name: 'id', type: 'string' },
	 		                    { name: 'product', type: 'string' },
	 		                    { name: 'flowDate', type: 'string' },
								{ name: 'flow', type: 'string' }
	 		                 ],
		                id: 'id',
		                localdata:[]
	            };
	        var dataAdapter = new $.jqx.dataAdapter(source);
	       
             var cellclass = function (row, columnfield, value,rowdata) {
				 const flowValue=rowdata.flow;
                if (flowValue == null) {
                    return 'title-color';
                }
            }
            const flowWidth =	(hasEditPrivelege && hasDeletePrivelege) ? '80%' :
							    (hasEditPrivelege || hasDeletePrivelege) ? '90%' :
							    '100%';

	     $("#flow-grid").jqxGrid(
			            {
			                width: '100%',
			                source: dataAdapter,  
			                theme:'dark',
			                selectionmode: 'none',
			                editmode: 'selectedrow',
			          		editable: true,
			              	autoheight: true,
							showgroupsheader: false,
							groupable: true,
							groupsexpandedbydefault: true,
			                columns: [ 
			                	
	                	  { text: 'id', editable:false, datafield: 'id', hidden: true},
		                  { text: '', editable:false, datafield: 'product', width: '10%',  cellclassname: cellclass, hidden: true },
		                  { text: '', editable:false, datafield: 'flowDate', width: '10%',hidden:true, cellsformat: 'dd-MMM-yyyy',  cellclassname: cellclass },
		                  { text: '', editable:true, datafield: 'flow', width: flowWidth,  cellclassname: cellclass },
		                   
		                  (hasEditPrivelege) ? { text: '',editable:false, datafield: 'Edit',width:'8.75%', filterable: false,  cellclassname: cellclass,cellsrenderer: function (row) {
   	    	 
						     var CheckifFlowNull=  $('#flow-grid').jqxGrid('getcellvalue', row, "flow");
				          	 if (CheckifFlowNull!=null)
				          	 {
				          	 return "<input class=\"edit \" type=\"button\" onclick='Edit(" + row + ", event)' id=\"edit"+row+"\" value=\"Edit\" /><div class=\"row\" id=\"actionButtons"+row+"\" style=\"display:none\"><input  onclick='Update(" + row + ", event)' class=\"update\" type=\"button\" id=\"update\" value=\"Save\" /></div>";
							 }
				          	 else
				          	  return '';
				          	  }
		                  }: null ,  
		                  (hasDeletePrivelege)?{ text: '',editable:false, datafield: 'Delete',width:'8.75%',  cellclassname: cellclass ,cellsrenderer: function (row) {
		                	     // open the popup window when the user clicks a button.
		                	     
		   					 var CheckifFlowNull=  $('#flow-grid').jqxGrid('getcellvalue', row, "flow");
				          	 if (CheckifFlowNull!=null)
				          	 {
				          	 return "<input class=\"delete\" type=\"button\" onclick='Delete(" + row + ", event)' id=\"delete"+row+"\" value=\"DELETE\" />";
		                     }
				          	 else
				          	  return '';
				          	  }
		                  }: null ,  
		                   (hasRoleSuperAdmin) ? { text: '',editable:false, datafield: 'copy',width:'2.5%', filterable: false,  cellclassname: cellclass,cellsrenderer: function (row) {
   	    	 
						     var CheckifFlowNull=  $('#flow-grid').jqxGrid('getcellvalue', row, "flow");
				          	 if (CheckifFlowNull!=null)
				          	 {
				          	 return "<div class=\"copy-text\"><button onclick='Copy(" + row + ", event)'><i class=\"fa fa-clone\" aria-hidden=\"true\"></i></button></div>";
							 }
				          	 else
				          	  return '';
				          	  }
		                  }: null , 
			                ],
							 groups: ['product']
			            });
			           
}

function submitData(){
	let json = [];
	if ($('#productDropDownList').val()=='' || $('#flow-input').val()=='' || $('#date-input').val()=='')
	{
		$('#productDropDownList').addClass("required");
		$('#flow-input').addClass("required");
		$('#date-input').addClass("required");
		
		$("#jqxNotification").jqxNotification({   template: 'error' ,autoCloseDelay: 3000,  });
		$("#notificationContent").html('Please make sure to input all required fields before submitting!');
	    $("#jqxNotification").jqxNotification("open");
	    return;
	}else {
		$('#productDropDownList').removeClass("required");
		$('#flow-input').removeClass("required");
		$('#date-input').removeClass("required");
	}
    json.push({
    "product": $('#productDropDownList').val(),
    "flowDate": $.jqx.dataFormat.formatdate($('#date-input').jqxDateTimeInput('getDate'), 'dd-MM-yyyy'),
    "flow": $('#flow-input').val() , // $.jqx.dataFormat.formatdate($("#dateInput").jqxDateTimeInput('getDate'), 'dd-MM-yyyy')
	});
	 $.ajax({
		        type: "POST",
		        contentType: "application/json",
		        url: apiLiveFlowUrl+"/flow/saveLiveOptionFlowData",
		        data: JSON.stringify(json),
		        dataType: 'json',
		        async:true,
		        cache: false,
		        timeout: 600000,
		        success: function (data) {
					clearInput();
					fetchDataGrid();
						 },
		    	        error: function (e) {
		    	        	
							  console.log("ERROR : ", e);
		
		    	        }
		    	    });
}
function clearInput(){
	$('#productDropDownList').val("");
	$('#date-input').jqxCalendar('setDate', new Date()); 
	$('#flow-input').val("");
}
function fetchDataGrid(){
		
				 delete source.localdata;   
			     source.url=apiLiveFlowUrl+'/flow/getLiveOptionByDate/'+systemDate;
			     var dataAdapter = new $.jqx.dataAdapter(source);
			     $('#flow-grid').jqxGrid({source:dataAdapter, groups: ['product']});
			     
}
 function Copy(row, event) {
	     selectedRow.editrow = row;
	     var copyData = $("#flow-grid").jqxGrid('getrowdata', row).flow;
			 copyToClipboard(copyData);
    }
function Delete(row, event) {
	  isedit=false;
	  isupdate=false;
	  selectedRow.editrow = row;
         
         var id = $('#flow-grid').jqxGrid('getcellvalue', row, "id");
         $.ajax({
             type : "DELETE",
             url : apiLiveFlowUrl+"/flow/deleteLiveOptionById/" + id,
             success: function (result) {       
            	 	 
 	             delete source.localdata;   
			     source.url=apiLiveFlowUrl+'/flow/getLiveOptionByDate/'+systemDate;
			     var dataAdapter = new $.jqx.dataAdapter(source);
			      $('#flow-grid').jqxGrid({source:dataAdapter, groups: ['product']});
			     
			      $("#jqxNotification").jqxNotification({   template: 'error' });
			      $("#notificationContent").html('Data has been deleted');
	                   $("#jqxNotification").jqxNotification("open");
             },
             error: function (e) {
                 console.log(e);
             }
         });
   
 }
 
 function Edit(row, event) {
	     isedit=true;
	     selectedRow.editrow = row;
	   
		    	$("#flow-grid").jqxGrid('beginrowedit', row);
		    	$("#edit"+row).css("display","none");
				$("#actionButtons"+row).css("display","contents"); 
		    	if (event) {
		    		if (event.preventDefault) {
		    			event.preventDefault();
		    		}
		    	} 
			
    }
  function Update(row, event) {
	 
	   isupdate=true;
	   selectedRow.editrow = -1;
	    $("#flow-grid").jqxGrid('endrowedit', row);
	    var updatedData = $("#flow-grid").jqxGrid('getrowdata', row);
	    if (updatedData.flow.trim()==='')
	    {
			$("#jqxNotification").jqxNotification({   template: 'error' ,autoCloseDelay: 3000,  });
			$("#notificationContent").html('You are not allowed to insert an empty value!');
		    $("#jqxNotification").jqxNotification("open");
		   
		    return;
		}
	    var row = {
			  "id": updatedData.id,
			  "product": updatedData.product,
			  "flowDate":updatedData.flowDate,
			  "flow": updatedData.flow
			};
		
  	       	  $.ajax({
  	    	        type: "POST",
  	    	        contentType: "application/json",
  	    	        url: apiLiveFlowUrl+'/flow/updateflowbyid',
  	    	        data: JSON.stringify(row),
  	    	        dataType: 'json',
  	    	        async:true,
  	    	        cache: false,
  	    	        timeout: 600000,
  	    	        success: function (data) {
						  
  	    	           $("#jqxNotification").jqxNotification({   template: 'info' });
  	    	           $("#notificationContent").html('Data has been updated');
  	                   $("#jqxNotification").jqxNotification("open");
  	                
  	    	        
  	   },
  	    	        error: function (e) {
  	    	        	
  						  console.log("ERROR : ", e);
  	
  	    	        }
  	    	    }); 
  	       	  
	    if (event) {
	    	if (event.preventDefault) {
	    		event.preventDefault();
	    	}
	    }
	    return false;
    }

    