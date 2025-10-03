var chart;
var chart1;
var chart2;
var json = {};
var historyDataArray;
var toDate = new Date();
var fromDate = new Date();
var toDate1 = new Date();
var fromDate1 = new Date();

fromDate = new Date(fromDate.setHours(fromDate.getHours() - 1));
fromDate1 = new Date(fromDate1.setHours(fromDate1.getHours() - 1));

 setTimeInputs('date1',fromDate);
 setTimeInputs('date2', toDate); 
 setTimeInputs('date3',fromDate1);
 setTimeInputs('date4', toDate1); 
  
$(document).ready(function() {
	
	 var url = "/data/currency/list";
	   var source =
    {
        datatype: "json",
        datafields: [
            { name: 'symbol' },
            { name: 'name' }
        ],
        url: url,
        async: true
    };
     var dataAdapter = new $.jqx.dataAdapter(source);
    // Create a jqxDropDownList
    $("#currencyDropDown").jqxDropDownList({ selectedIndex: 0, source: dataAdapter, displayMember: "name", valueMember: "symbol", width: '100%', height: 27,
    });
	  $("#currencyDropDown1").jqxDropDownList({ selectedIndex: 0, source: dataAdapter, displayMember: "name", valueMember: "symbol", width: '100%', height: 27,
    });
	$("#dateFrom").jqxDateTimeInput({ width: '100%', height: '27px' });
	$("#dateTo").jqxDateTimeInput({ width: '100%', height: '27px' });
	
	$("#dateFrom1").jqxDateTimeInput({ width: '100%', height: '27px' });
	$("#dateTo1").jqxDateTimeInput({ width: '100%', height: '27px' });
	
	$("#dateFrom").val(fromDate);
	$("#dateTo").val(toDate);
	$("#dateFrom1").val(fromDate1);
	$("#dateTo1").val(toDate1);
	
	$("#currencyDropDown").on('bindingComplete', function (event) { drawGraph(); });

	updateDateInputs();
	
	$('#currencyDropDown').on('change', function (event)
	{     
	  drawGraph(); 
	});
	$('#currencyDropDown1').on('change', function (event)
	{     
	  drawSecondGraph(); 
	});
});
function changeDate(type, direction, unit) {
     var amount = direction === 'forward' ? 1 : -1;
    if (unit === 'hour') {
      if (type === 'from') {
        var hours = fromDate.getHours() + amount;
        if (hours < 0) {
          fromDate.setDate(fromDate.getDate() - 1);
          hours += 24;
        } else if (hours >= 24) {
          fromDate.setDate(fromDate.getDate() + 1);
          hours -= 24;
        }
        fromDate.setHours(hours);
      } else {
        var hours = toDate.getHours() + amount;
        if (hours < 0) {
          toDate.setDate(toDate.getDate() - 1);
          hours += 24;
        } else if (hours >= 24) {
          toDate.setDate(toDate.getDate() + 1);
          hours -= 24;
        }
        toDate.setHours(hours);
      }
    } else if (unit === 'day') {
      if (type === 'from') {
        fromDate.setDate(fromDate.getDate() + amount);
      } else {
        toDate.setDate(toDate.getDate() + amount);
      }
    }
  updateDateInputs();
 setTimeInputs('date1',fromDate);
 setTimeInputs('date2', toDate);
 
 	$("#dateFrom").val(fromDate);
	$("#dateTo").val(toDate);
	drawGraph();
  }

function updateDateInputs() {
	document.getElementById('fromDate').value = fromDate.toString();
	document.getElementById('toDate').value = toDate.toString();
}
function drawGraph() {
   const fromdate =  formatDate(combineDateAndTime($("#dateFrom").val(),fromDate));
   const todate =  formatDate(combineDateAndTime($("#dateTo").val(),toDate));
   
   dataParam = {
		"fromDate": fromdate,
		"toDate": todate,
		"dataType": 'normal',
		"cryptoCurrencyCode": $("#currencyDropDown").val(),
	};
	$.ajax({
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "/getGraphData",
		data: JSON.stringify(dataParam),
		dataType: 'json',
		timeout: 600000,
		success: function(response) {
						console.log(response);

		dataParams = {
						"cryptoCurrencyCode": $("#currencyDropDown").val(),
				};
			$.ajax({
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "/getSupportResistantForGraph",
		data: JSON.stringify(dataParams),
		dataType: 'json',
		timeout: 600000,
		success: function(data) {
			console.log(data);

			const jsonArrayWithNumberTimestamp = response.dataNormal.data.map(obj => {
				return {
					...obj,
					x: parseInt(obj.x)
				};
			});
			const jsonArrayWithNumberTimestamp1 = response.dataMin.data.map(obj => {
				return {
					...obj,
					x: parseInt(obj.x)
				};
			});
			const jsonArrayWithNumberTimestamp2 = response.dataMax.data.map(obj => {
				return {
					...obj,
					x: parseInt(obj.x)
				};
			});
			min = Math.min.apply(null, jsonArrayWithNumberTimestamp.map(function(item) {
				return item.y;
			})),
				max = Math.max.apply(null, jsonArrayWithNumberTimestamp.map(function(item) {
					return item.y;
				}));
			const values = addMarginToMinMax(min, max, 10);

			json.series = [{
				name: $("#currencyDropDown").val(),
				data: jsonArrayWithNumberTimestamp
			},
			{
				name: "MAX",
				data: jsonArrayWithNumberTimestamp2
			}, {
				name: "MIN",
				data: jsonArrayWithNumberTimestamp1
			},];
			json.xaxis= [
			      {
			        // in a datetime series, the x value should be a timestamp, just like it is generated below
			        x: 1715797050,
			        strokeDashArray: 0,
			        borderColor: "#775DD0",
			        label: {
			          borderColor: "#775DD0",
			          style: {
			            color: "#fff",
			            background: "#775DD0"
			          },
			          text: "X Axis Anno Vertical"
			        }
			      },
			      {
			        x: 1715797370,
			        borderColor: "#FEB019",
			        label: {
			          borderColor: "#FEB019",
			          style: {
			            color: "#fff",
			            background: "#FEB019"
			          },
			          orientation: "horizontal",
			          text: "X Axis Anno Horizonal"
			        }
			      }
			    ];
			    const yannotation = [];
				
				// Loop over resistant and support
				for (const key in data) {
				  if (Object.hasOwnProperty.call(data, key)) {
				    const element = data[key];
				    // Convert values to numbers and calculate minimum, maximum, and middle
				    const values = Object.values(element).map(parseFloat);
				    const minVal = Math.min(...values);
				    const maxVal = Math.max(...values);
				    const middleVal = values.reduce((acc, val) => acc + val, 0) / values.length;
				    
				    for (const subKey in element) {
				      if (Object.hasOwnProperty.call(element, subKey)) {
				        const value = parseFloat(element[subKey]);
				        const isSupport = key === 'support';
				        const borderColor = isSupport ? "#FF0000" : "#00E396";
				        let labelText = isSupport ? `support ${subKey.slice(-1)}` : `resistant ${subKey.slice(-1)}`;
				
				        /*
				        if (isSupport) {
				          // For support, invert the order of values
				          if (value === maxVal) {
				            labelText += " Closest";
				          } else if (value === middleVal) {
				            labelText += " Middle";
				          } else if (value === minVal) {
				            labelText += " Farthest";
				          }
				        } else {
				          // For resistant, use the regular order of values
				          if (value === minVal) {
				            labelText += " Closest";
				          } else if (value === middleVal) {
				            labelText += " Middle";
				          } else if (value === maxVal) {
				            labelText += " Farthest";
				          }
				        }
				        */
				       if (!isNaN(value))
				        yannotation.push({
				          y: value,
				          strokeDashArray: 0,
				          borderColor: borderColor,
				          label: {
				            borderColor: borderColor,
				            style: {
				              color: "#fff",
				              background: borderColor
				            },
				            text: labelText
				          }
				        });
				      }
				    }
				  }
				}
				console.log(yannotation);
			    json.yaxis= yannotation
			json.points = [{
				x: 1715796490,
				y: 0.71500000,
				marker: {
					size: 6,
					fillColor: "#ff0000",
					strokeColor: "#ff0000",
					radius: 2
				},
				/*label: {
					borderColor: "#FF4560",
					offsetY: 0,
					style: {
						color: "#ff0000",
					    background: "#ffffff00"
					},

					text: "Point Annotation (XY)"
				}*/
			}
			,
			{
				x: 1715797294,
				y: 0.72100000,
				marker: {
					size: 7,
					fillColor: "#ff0000",
					strokeColor: "#ff0000",
					radius: 2
				},
				/*label: {
					borderColor: "#FF4560",
					offsetY: 0,
					style: {
						color: "#ff0000",
					    background: "#ffffff00"
					},

					text: "Point Annotation (XY)"
				}*/
			}
			];
			chartOptions = getChartOption(json)
			if (chart != null) {
				chart.updateOptions(chartOptions);
			}
			else {
				chart = new ApexCharts(document.querySelector("#chart"), chartOptions);
				chart.render();
			}

			},
					error: function(e) {
			
						console.log("ERROR : ", e);
			
					}
		});

		},
		error: function(e) {

			console.log("ERROR : ", e);

		}
	});
}
function drawSecondGraph() {
   const fromdate =  formatDate(combineDateAndTime($("#dateFrom1").val(),fromDate1));
   const todate =  formatDate(combineDateAndTime($("#dateTo1").val(),toDate1));
   
   const dataParam = {
		"fromDate": fromdate,
		"toDate": todate,
		"dataType": 'normal',
		"cryptoCurrencyCode": $("#currencyDropDown1").val(),
	};
	$.ajax({
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "/getGraphData",
		data: JSON.stringify(dataParam),
		dataType: 'json',
		timeout: 600000,
		success: function(response) {
						console.log(response);

		dataParams = {
						"cryptoCurrencyCode": $("#currencyDropDown1").val(),
				};
			$.ajax({
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "/getSupportResistantForGraph",
		data: JSON.stringify(dataParams),
		dataType: 'json',
		timeout: 600000,
		success: function(data) {
			console.log(data);

			const jsonArrayWithNumberTimestamp = response.dataNormal.data.map(obj => {
				return {
					...obj,
					x: parseInt(obj.x)
				};
			});
			const jsonArrayWithNumberTimestamp1 = response.dataMin.data.map(obj => {
				return {
					...obj,
					x: parseInt(obj.x)
				};
			});
			const jsonArrayWithNumberTimestamp2 = response.dataMax.data.map(obj => {
				return {
					...obj,
					x: parseInt(obj.x)
				};
			});
			min = Math.min.apply(null, jsonArrayWithNumberTimestamp.map(function(item) {
				return item.y;
			})),
				max = Math.max.apply(null, jsonArrayWithNumberTimestamp.map(function(item) {
					return item.y;
				}));
			const values = addMarginToMinMax(min, max, 10);

			json.series = [{
				name: $("#currencyDropDown").val(),
				data: jsonArrayWithNumberTimestamp
			},
			{
				name: "MAX",
				data: jsonArrayWithNumberTimestamp2
			}, {
				name: "MIN",
				data: jsonArrayWithNumberTimestamp1
			},];
			json.xaxis= [
			      {
			        // in a datetime series, the x value should be a timestamp, just like it is generated below
			        x: 1715797050,
			        strokeDashArray: 0,
			        borderColor: "#775DD0",
			        label: {
			          borderColor: "#775DD0",
			          style: {
			            color: "#fff",
			            background: "#775DD0"
			          },
			          text: "X Axis Anno Vertical"
			        }
			      },
			      {
			        x: 1715797370,
			        borderColor: "#FEB019",
			        label: {
			          borderColor: "#FEB019",
			          style: {
			            color: "#fff",
			            background: "#FEB019"
			          },
			          orientation: "horizontal",
			          text: "X Axis Anno Horizonal"
			        }
			      }
			    ];
			    const yannotation = [];
				
				// Loop over resistant and support
				for (const key in data) {
				  if (Object.hasOwnProperty.call(data, key)) {
				    const element = data[key];
				    // Convert values to numbers and calculate minimum, maximum, and middle
				    const values = Object.values(element).map(parseFloat);
				    const minVal = Math.min(...values);
				    const maxVal = Math.max(...values);
				    const middleVal = values.reduce((acc, val) => acc + val, 0) / values.length;
				    
				    for (const subKey in element) {
				      if (Object.hasOwnProperty.call(element, subKey)) {
				        const value = parseFloat(element[subKey]);
				        const isSupport = key === 'support';
				        const borderColor = isSupport ? "#FF0000" : "#00E396";
				        let labelText = isSupport ? `support ${subKey.slice(-1)}` : `resistant ${subKey.slice(-1)}`;
				
				        /*
				        if (isSupport) {
				          // For support, invert the order of values
				          if (value === maxVal) {
				            labelText += " Closest";
				          } else if (value === middleVal) {
				            labelText += " Middle";
				          } else if (value === minVal) {
				            labelText += " Farthest";
				          }
				        } else {
				          // For resistant, use the regular order of values
				          if (value === minVal) {
				            labelText += " Closest";
				          } else if (value === middleVal) {
				            labelText += " Middle";
				          } else if (value === maxVal) {
				            labelText += " Farthest";
				          }
				        }
				        */
				       if (!isNaN(value))
				        yannotation.push({
				          y: value,
				          strokeDashArray: 0,
				          borderColor: borderColor,
				          label: {
				            borderColor: borderColor,
				            style: {
				              color: "#fff",
				              background: borderColor
				            },
				            text: labelText
				          }
				        });
				      }
				    }
				  }
				}
				console.log(yannotation);
			    json.yaxis= yannotation
			json.points = [{
				x: 1715796490,
				y: 0.71500000,
				marker: {
					size: 6,
					fillColor: "#ff0000",
					strokeColor: "#ff0000",
					radius: 2
				},
				/*label: {
					borderColor: "#FF4560",
					offsetY: 0,
					style: {
						color: "#ff0000",
					    background: "#ffffff00"
					},

					text: "Point Annotation (XY)"
				}*/
			}
			,
			{
				x: 1715797294,
				y: 0.72100000,
				marker: {
					size: 7,
					fillColor: "#ff0000",
					strokeColor: "#ff0000",
					radius: 2
				},
				/*label: {
					borderColor: "#FF4560",
					offsetY: 0,
					style: {
						color: "#ff0000",
					    background: "#ffffff00"
					},

					text: "Point Annotation (XY)"
				}*/
			}
			];
			const chartOptions1 = getChartOption1(json)
			if (chart2 != null) {
				chart2.updateOptions(chartOptions1);
			}
			else {
				chart2 = new ApexCharts(document.querySelector("#chart-line"), chartOptions1);
				chart2.render();
			}

			},
					error: function(e) {
			
						console.log("ERROR : ", e);
			
					}
		});

		},
		error: function(e) {

			console.log("ERROR : ", e);

		}
	});
}
function formatDate(inputDate) {
	// Create a Date object from the input string
	const dateObj = new Date(inputDate);

	// Extract date components
	const year = dateObj.getFullYear();
	const month = String(dateObj.getMonth() + 1).padStart(2, '0');
	const day = String(dateObj.getDate()).padStart(2, '0');

	// Extract time components
	const hours = String(dateObj.getHours()).padStart(2, '0');
	const minutes = String(dateObj.getMinutes()).padStart(2, '0');
	const seconds = String(dateObj.getSeconds()).padStart(2, '0');

	// Construct the desired format
	const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	return formattedDate;
}
function timestampToDate(timestamp) {
	// Convert timestamp to milliseconds
	const milliseconds = timestamp * 1000;

	// Create a new Date object
	const dateObj = new Date(milliseconds);

	// Extract date components
	const year = dateObj.getFullYear();
	const month = String(dateObj.getMonth() + 1).padStart(2, '0');
	const day = String(dateObj.getDate()).padStart(2, '0');

	// Extract time components
	const hours = String(dateObj.getHours()).padStart(2, '0');
	const minutes = String(dateObj.getMinutes()).padStart(2, '0');
	const seconds = String(dateObj.getSeconds()).padStart(2, '0');

	// Construct the formatted date string
	const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	return formattedDate;
}

function addMarginToMinMax(minValue, maxValue, marginPercentage) {
	const margin = (maxValue - minValue) * (marginPercentage / 100);
	return margin;
}
 
   function setTimeInputs(prefix,date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    document.getElementById(prefix + 'hours').value = hours < 10 ? '0' + hours : hours;
    document.getElementById(prefix + 'minutes').value = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById(prefix + 'seconds').value = seconds < 10 ? '0' + seconds : seconds;
  }
  
  function changeTime(prefix, field, direction) {
    var input = document.getElementById(prefix + field);
    var value = parseInt(input.value);
    if (direction === 'up') {
      value = (value + 1) % (field === 'hours' ? 24 : 60);
    } else {
      value = (value - 1 + (field === 'hours' ? 24 : 60)) % (field === 'hours' ? 24 : 60);
    }
    input.value = value < 10 ? '0' + value : value; // Add leading zero if necessary
  }
  function updateTime(prefix,date) {
    var hours = parseInt(document.getElementById(prefix + 'hours').value);
    var minutes = parseInt(document.getElementById(prefix + 'minutes').value);
    var seconds = parseInt(document.getElementById(prefix + 'seconds').value);
  

    
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    setTimeInputs( prefix, date);
    
    $("#dateFrom").val(fromDate);
	$("#dateTo").val(toDate);

  }
function getChartOption(json) {
	var options = {
		series: json.series,
		chart: {
		 events: {
        click(event, chartContext, config) {
            console.log(config.config.series[config.seriesIndex])
            console.log(config.config.series[config.seriesIndex].name)
            console.log(config.config.series[config.seriesIndex].data[config.dataPointIndex])
        drawPieChart(config.config.series[config.seriesIndex].data[config.dataPointIndex].x);
                }
        },
			height: 350,
			type: 'line',
			//id: 'fb1',
			//group: 'trading',
			toolbar: {
				show: true,
			},
			  animations: {
		        enabled: true,
		        easing: 'easeinout',
		        speed: 800,
		        animateGradually: {
		            enabled: true,
		            delay: 150
		        },
		        dynamicAnimation: {
		            enabled: true,
		            speed: 350
		        }
		    }
		},
		dataLabels: {
			enabled: false
		},
		markers: {
			size: [1, 3, 3],
			strokeWidth: 0,
		},
		stroke: {
			curve: 'straight',
			width: 2,
		},
		title: {
			text: '',
			align: 'left'
		},
		xaxis: {
			type: 'datetime',
			labels: {
				//   rotate: -45,
				//   rotateAlways: true,
				formatter: function(value, timestamp, opts) {
					return timestampToDate(timestamp)
				}
			}
		},
		yaxis: {
			labels: {
				minWidth: 75, maxWidth: 75,
			},
			// tickAmount: 6,
			axisBorder: {
				width: 3,
				show: true,
				color: '#ffffff',
				offsetX: 0,
				offsetY: 0
			},
		},
		tooltip: {
			custom: function({ series, seriesIndex, dataPointIndex, w }) {
				return '<div class="arrow_box">' +
					'<span>' + series[seriesIndex][dataPointIndex] + '</span>' +
					'</div>'
			},
			marker: {
				show: true,
			},
		},
		annotations: {
			//points: json.points,
			//xaxis: json.xaxis
			yaxis:json.yaxis
			},
	};
	return options;
}
function getChartOption1(json1) {
	var options1 = {
		series: json1.series,
		chart: {
	/*	 events: {
        click(event, chartContext, config) {
            console.log(config.config.series[config.seriesIndex])
            console.log(config.config.series[config.seriesIndex].name)
            console.log(config.config.series[config.seriesIndex].data[config.dataPointIndex])
       // drawPieChart(config.config.series[config.seriesIndex].data[config.dataPointIndex].x);
                }
        },*/
			height: 350,
			type: 'line',
			//id: 'fb',
			//group: 'trading',
			toolbar: {
				show: true,
			},
			  animations: {
		        enabled: true,
		        easing: 'easeinout',
		        speed: 800,
		        animateGradually: {
		            enabled: true,
		            delay: 150
		        },
		        dynamicAnimation: {
		            enabled: true,
		            speed: 350
		        }
		    }
		},
		dataLabels: {
			enabled: false
		},
		markers: {
			size: [1, 3, 3],
			strokeWidth: 0,
		},
		stroke: {
			curve: 'straight',
			width: 2,
		},
		title: {
			text: '',
			align: 'left'
		},
		xaxis: {
			type: 'datetime',
			labels: {
				//   rotate: -45,
				//   rotateAlways: true,
				formatter: function(value, timestamp, opts) {
					return timestampToDate(timestamp)
				}
			}
		},
		yaxis: {
			labels: {
				minWidth: 75, maxWidth: 75,
			},
			// tickAmount: 6,
			axisBorder: {
				width: 3,
				show: true,
				color: '#ffffff',
				offsetX: 0,
				offsetY: 0
			},
		},
		tooltip: {
			custom: function({ series, seriesIndex, dataPointIndex, w }) {
				return '<div class="arrow_box">' +
					'<span>' + series[seriesIndex][dataPointIndex] + '</span>' +
					'</div>'
			},
			marker: {
				show: true,
			},
		},
		annotations: {
			//points: json.points,
			//xaxis: json.xaxis
			yaxis:json.yaxis
			},
	};
	return options1;
}

function drawPieChart(date){
	const dataParams = {
						"currencyCode": $("#currencyDropDown").val(),
						"datePoint":timestampToDate(date),
						"intervals":""
				};
	const options = {
	  style: 'decimal', // Format as decimal
	  maximumFractionDigits: 2 // Maximum number of fraction digits
	};			
				
	$.ajax({
		type: "POST",
		contentType: "application/json; charset=utf-8",
		url: "/data/trade/history",
		data: JSON.stringify(dataParams),
		dataType: 'json',
		timeout: 600000,
		success: function(data) {
			console.log(data);
		    historyDataArray=data;
			const numbersAsFloat = historyDataArray.history15Min.map(num => parseFloat(num));
			updatePieChart(numbersAsFloat);
		    
			},
		error: function(e) {

			console.log("ERROR : ", e);

		}
	});
      
}
function updatePieChart(data)
{
	   var options = {
	          series: data,
	          chart: {
	          type: 'donut',
	        },
	        tooltip:{
				custom: function({ series, seriesIndex, w }) {
				return '<div class="arrow_box">' +
					'<span>' + new Intl.NumberFormat('en-US', options).format(series[seriesIndex]) + " M" + '</span>' +
					'</div>'
			},
			},
	        labels:['Buy','Sell'],
	        colors: ['#00e396','#ff0000'],
	        responsive: [{
	          breakpoint: 480,
	          options: {
	            chart: {
	              width: 200
	            },
	            legend: {
	              position: 'bottom'
	            }
	          }
	        }],
	        
	        };
			if (chart1 != null) {
				chart1.updateOptions(options);
			}
			else {
				 chart1 = new ApexCharts(document.querySelector("#pie-chart"), options);
        		 chart1.render();
			}
}
  function updatePieChartTime(dataKey) {
            const numbersAsFloat = historyDataArray[dataKey].map(num => parseFloat(num));
            updatePieChart(numbersAsFloat);
        }
  function combineDateAndTime(dateStr, timeDate) {
    // Parse the date string
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    // Extract the time components from the timeDate
    const hours = timeDate.getHours();
    const minutes = timeDate.getMinutes();
    const seconds = timeDate.getSeconds();
    const milliseconds = timeDate.getMilliseconds();

    // Set the time components to the new date
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    date.setMilliseconds(milliseconds);

    return date;
}
function syncGraphs(){
	fromDate1 = fromDate;
	toDate1 = toDate;
	
 	setTimeInputs('date3',fromDate1);
 	setTimeInputs('date4', toDate1); 
  
  	$("#dateFrom1").val(fromDate1);
	$("#dateTo1").val(toDate1);
	
	drawSecondGraph();
}

function resetGraph() {
	toDate = new Date();
	fromDate = new Date();
	fromDate = new Date(fromDate.setHours(fromDate.getHours() - 1));

	setTimeInputs('date1', fromDate);
	setTimeInputs('date2', toDate);

	$("#dateFrom").val(fromDate);
	$("#dateTo").val(toDate);

	drawGraph();
}