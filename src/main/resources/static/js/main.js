    var selectedRow=this;
  $( document ).ready(function() {
	   
	     		 var url = "/tablename";
	     		   var source =
                {
                    datatype: "json",
                    datafields: [
                        { name: 'tableName' },
                        { name: 'description' }
                    ],
                    url: url,
                    async: true
                };
                 var dataAdapter = new $.jqx.dataAdapter(source);
                // Create a jqxDropDownList
                $("#jqxWidget").jqxDropDownList({ selectedIndex: 2, source: dataAdapter, displayMember: "description", valueMember: "tableName", width: 200, height: 40,
                });
	     		$("#dateInput").jqxDateTimeInput({  formatString: "F", showTimeButton: true, width: '325px', height: '40px' });
	     		$("#jqxWidget").on('bindingComplete', function (event) { getGridData();
	     		});
				$("#jqxWidget").on('change', function (event) { getGridData();
	     		});
	});
function submitData()
{
	var data={
		"tableName":$("#jqxWidget").val(),
		"referDate":$("#dateInput").val(),
		"value":$("#numberInput").val(),
	}
		$.ajax({
		type: "POST",
		contentType: "application/json",
		url: "/insertData",
		data: JSON.stringify(data),
		dataType: 'json',
		async: true,
		cache: false,
		timeout: 600000,
		success: function(data) {

			alert("sucess");
			 getGridData();
		},
		error: function(e) {

			console.log("ERROR : ", e);

		}
	});

}		  
function getGridData()  
{
	 gridsource =
      {
          datatype: "json",
          datafields: [
        	  { name: 'id', type: 'string' },  
			  { name: 'referDate', type: 'date' },  
        	  { name: 'value', type: 'string' },  
        	  { name: 'tableName', type: 'string' },
          ],
         // async: true,
          url: '/getdata/'+$("#jqxWidget").val(),
      };
   
      var dataAdapter = new $.jqx.dataAdapter(gridsource);
      
	 $("#grid").jqxGrid(
      {
          width: '100%',
          source: dataAdapter,                
          columnsresize: false,
          theme:'dark',
          pageable: true,
          showfilterrow: true,
          filterable: true,
          columnsheight: 30,
          pagesize: 10,
		  pagesizeoptions: ['10', '50', '100'],
          autoheight: true,
          editable: true,
          selectionmode: 'none',
          editmode: 'selectedrow',
          rendergridrows: function () {
                    return dataAdapter.records;
                },
          columns: [
        	 { text: 'Date', datafield: 'referDate', width: '40%', editable:false, cellsformat: 'F',filtertype: 'date' }, 
        	 { text: 'Value', datafield: 'value', width: '40%', 
        	   createfilterwidget: function (column, columnElement, widget) {
        	        widget.jqxInput({ width: '99%', height: 27, placeHolder: "Search" });
        	      }
           },
           { text: '',editable:false, datafield: 'Edit',width:'10%', filterable: false,cellsrenderer: function (row) {
   	    	 return "<input class=\"edit \" type=\"button\" onclick='Edit(" + row + ", event)' id=\"edit"+row+"\" value=\"Edit\" /><div class=\"row\" id=\"actionButtons"+row+"\" style=\"display:none\"><input  onclick='Update(" + row + ", event)' class=\"update\" type=\"button\" id=\"update\" value=\"Save\" /></div>";
           }
           },  
    	    { text: '',editable:false, datafield: 'Delete',width:'10%', filterable: false, cellsrenderer: function (row) {
    	    	return "<input id=\"CancelUpdate\"  onclick='Delete(" + row + ", event)' type=\"button\"  class=\"cancel\" value=\"Delete\" />";
              }
    	    },  
           { text: '', datafield: 'id', hidden: true  },
           { text: '', datafield: 'tableName', hidden: true  },
           ]
         
      }); 
}
	 function Edit(row, event) {
	     isedit=true;
	     selectedRow.editrow = row;
	   
		    	$("#grid").jqxGrid('beginrowedit', row);
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
	   var updatedData = $("#grid").jqxGrid('getrowdata', row);
	   selectedRow.editrow = -1;
	    $("#grid").jqxGrid('endrowedit', row);
	    var updatedData = $("#grid").jqxGrid('getrowdata', row);
	    var row = {
	    		   "id":updatedData.id,
				   "referDate":$.jqx.dataFormat.formatdate(updatedData.referDate,  'yyyy-MM-dd hh:mm:ss'),
				   "value":updatedData.value,
				   "tableName":updatedData.tableName,
	    };
		
  	       	  $.ajax({
  	    	        type: "POST",
  	    	        contentType: "application/json",
  	    	        url: "/updatedata",
  	    	        data: JSON.stringify(row),
  	    	        dataType: 'json',
  	    	        async:true,
  	    	        cache: false,
  	    	        timeout: 600000,
  	    	        success: function (data) {
  	    	        	
  	    	          	alert("Data updated");
  	                
  	    	        
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
      function Delete(row, event) {
		  
		 isedit=false;
		 isupdate=false;
		 selectedRow.editrow = row;
	  
    	$("#grid").jqxGrid('endrowedit', row, true);
    	
    	 var selectedrowindex = row;
         var rowscount = $("#grid").jqxGrid('getdatainformation').rowscount;
         
         var dataId = $('#grid').jqxGrid('getcellvalue', row, "id");
         $.ajax({
             type : "DELETE",
             url : "/deletedata/" + $("#jqxWidget").val()+'/'+dataId,
             success: function (result) {       
            	 if (selectedrowindex >= 0 && selectedrowindex < rowscount) {
					 
	                  gridsource.url= '/getdata/'+$("#jqxWidget").val(),
			          dataAdapter = new $.jqx.dataAdapter(gridsource);
			          $("#grid").jqxGrid({source:dataAdapter});
			          
				     	alert("Data has been deleted");     
 	            } 
             },
             error: function (e) {
                 console.log(e);
             }
         });
  
 }