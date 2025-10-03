var source;
var selectedRow=this;

var today = new Date();
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, '0');
var day = String(today.getDate()).padStart(2, '0');
const systemDate = year + '-' + month + '-' + day;

function initiateHistoricalFlow() {
	if(hasLiveFlowOptionScreenPrivelege)
	{ const menu="<a  class='navigation nav-item nav-link' id='nav-liveOptionFlow-tab'  href='/flow/liveoptionflow' role='tab' aria-controls='nav-liveOptionFlow' aria-selected='false'>Live Option Flow</a>";
	  $('#nav-tab').append(menu);
	}if(hasLiveFlowSearchScreenPrivelege)
	{ const menu="<a  class='navigation nav-item nav-link active' id='nav-flowSearchEngine-tab'  href='/flow/flowsearchengine' role='tab' aria-controls='nav-flowSearchEngine' aria-selected='false'>Flow Search Engine</a>";
	  $('#nav-tab').append(menu);
	}if(hashistoricalFlowOptionScreenPrivelege)
	{ const menu="  <a  class='navigation nav-item nav-link' id='nav-historicalFlow-tab'  href='/flow/historicalflow' role='tab' aria-controls='nav-historicalFlow' aria-selected='false'>Historical Flow</a>";
	  $('#nav-tab').append(menu);
	}
	
	   var productSource = ["","BUND", "BOBL", "BUXL", "SHATZ", "EURIBOR", "OAT", "BTP", "TY"];
	  $("#productDropDownList").jqxDropDownList({ source: productSource, width: '100%', height: 40,  theme:'dark',});  
	  $("#jqxNotification").jqxNotification({  height: 40, width: "100%",appendContainer: "#notifcationContainer",  opacity: 0.9,
           animationOpenDelay: 800, autoClose:true , autoCloseDelay: 1000,  template: 'info'
      });	
	  source =
	            {
		           datatype: "json",
		           datafields: [
	 		                    { name: 'id', type: 'string' },
	 		                    { name: 'product', type: 'string' },
	 		                    { name: 'flowDate', type: 'date' },
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
              const flowWidth =	(hasEditPrivelege && hasDeletePrivelege) ? '70%' :
							    (hasEditPrivelege || hasDeletePrivelege) ? '80%' :
							    '90%';
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
			                	
	                	  { text: 'id',editable:false, datafield: 'id', width: '8%',  hidden: true},
		                  { text: 'Product',editable:false, datafield: 'product', width: '10%',  cellclassname: cellclass ,  hidden: true},
		                  { text: 'Date', editable:false, datafield: 'flowDate', width: '10%', cellsformat: 'dd-MMM-yyyy',  cellclassname: cellclass },
		                  { text: 'Flow',editable:true, datafield: 'flow', width: flowWidth,  cellclassname: cellclass },
		                  
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
		                 (hasDeletePrivelege)? { text: '',editable:false, datafield: 'Delete',width:'8.75%',  cellclassname: cellclass ,cellsrenderer: function (row) {
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

function Delete(row, event) {
	  selectedRow.editrow = row;
         
         var id = $('#flow-grid').jqxGrid('getcellvalue', row, "id");
         $.ajax({
             type : "DELETE",
             url : apiLiveFlowUrl+"/flow/deleteLiveOptionById/" + id,
             success: function (result) {       
            	 	 
 	           fetchDataGrid();
 	            $("#jqxNotification").jqxNotification({   template: 'error' });
			      $("#notificationContent").html('Data has been deleted');
	                   $("#jqxNotification").jqxNotification("open");
			     
             },
             error: function (e) {
                 console.log(e);
             }
         });
 }
 function fetchDataGrid(){
	 
	const dropDownValue= $("#productDropDownList").val();
	const value = $('#search-input').val();
	delete source.localdata;   
	if(dropDownValue=="")
        source.url=apiLiveFlowUrl+'/flow/getLiveOptionFlowDataByValue/'+value;
	    else  
	     source.url=apiLiveFlowUrl+'/flow/getLiveOptionFlowDataByValueAndProduct/'+value+'/'+dropDownValue;
	     
     var dataAdapter = new $.jqx.dataAdapter(source);
     $('#flow-grid').jqxGrid({source:dataAdapter, groups: ['product']});
	    
			     
}
 function Copy(row, event) {
	     selectedRow.editrow = row;
	     var copyData = $("#flow-grid").jqxGrid('getrowdata', row).flow;
			 copyToClipboard(copyData);
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
		};
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
    
    function areDatesEqualIgnoringTime(date1, date2) {
	  // Create new Date objects for each date
	  const newDate1 = new Date(date1);
	  const newDate2 = new Date(date2);
	
	  // Compare the year, month, and day values of the dates
	  return (
	    newDate1.getFullYear() === newDate2.getFullYear() &&
	    newDate1.getMonth() === newDate2.getMonth() &&
	    newDate1.getDate() === newDate2.getDate()
	  );
	}
