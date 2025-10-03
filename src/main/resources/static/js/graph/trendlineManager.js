const graphType="trendline";
let selectedCurrencies = new Set(); // Stores selected currencies

var options_graph = {
		series: [],
		chart: {
			width: '100%',
			toolbar: {
				show: true,
				offsetX: -50,
				offsetY: 0,
				tools: {
					download: false,
					selection: true,
					zoom: true,
					zoomin: true,
					zoomout: true,
					pan: true,
					reset: true | '<img src="/static/icons/reset.png" width="20">',
					customIcons: []
				}
			},
			height: chartHeight,
			type: 'line',
			animations: { enabled: false }
		},
		grid: {
			show: false,
			borderColor: '#f0e68c',
			strokeDashArray: 1,
			opacity: 0.5,
			padding: {
				right: 60,
			},
		},
		colors: ["#FFFFFF", "#0000ff", "#ff0000", "#00ff00", "#ffff00", "#ffa500"],
		fill: {
			type: 'solid',
			opacity: [1, 1],
		},
		stroke: {
			curve: 'straight',
			width: 2.25
		},
		markers: {
			colors: '#ffffff',
			size: 2,
			shape: 'square',
		},
		title: {
			text: '',
			align: 'center',
					margin: 0,
					offsetY: 20,
					style: {
						fontWeight: 'bold',
					},
		},
		subtitle: {
			text: 'copyright LibVol.com',
			align: 'right',
			margin: 10,
			offsetX: -50,
			offsetY: 30,
			floating: false,
			style: {
				fontSize: '10px',
				fontWeight: 'normal',
				color: '#9699a2'
			},
		},
		dataLabels: {
			enabled: false
		},
		xaxis: {
			labels: {
				rotate: 0,
				rotateAlways: true,
				minHeight: 0,
				style: {
					fontSize: fontsize,
				},
			},
				//type: 'category',
				 type: 'datetime',
			// tickAmount: 19,
			axisBorder: {
				show: true,
				color: '#ffffff',
				height: 3,
				width: '100%',
				offsetX: 0,
				offsetY: 0
			},
		},
		legend: {
		   show:eval(showLegend.split('legend')[1]),
		   fontSize: fontsize,
    	   showForSingleSeries: true,
    	   labels: {
    	          colors: 'White',
    	          useSeriesColors: false
    	   },
    	      markers: {
    	          width: 12,
    	          height: 2
    	      },
    	    formatter: function(seriesName, opts) {
    	    	img= getCountryFlag(seriesName);
    	         return [img , seriesName];
    	    }
    	  },
		yaxis: [{
			labels: {
				style: {
					fontSize: fontsize,
				}
			},
			axisBorder: {
				width: 3,
				show: true,
				color: '#ffffff',
				offsetX: 0,
				offsetY: 0
			},

		}],
		noData: {
			text: '',
			align: 'center',
			verticalAlign: 'middle',
			offsetX: 0,
			offsetY: 0,
			style: {
				color: undefined,
				fontSize: '14px',
				fontFamily: undefined
			}
		},
	
	};	
var chart;
var chartResponse;
var chartConfigSettings;
var data;
var trendLines=[];
var retracement=[];
var relevant=[];
var channelLines=[];
var serieArray=[];
var checkedItemId = [];
var trendlineSeries=[];
var trendLineId=0;
var retracementId=0;
var relevantId=0;
var channelId=0;
var getFormatResult0=2;
var results=[];
var retracementData;
var selectedstartCellId;
var source;
var latestEndDate;

function updateSelectedCurrencies() {
    // Mapping of group_id to currency
    const currencyMap = {
        '71': 'BTC',
        '72': 'ETH',
        '73': 'SOL',
        '74': 'SHIB',
        '75': 'BNB',
        '76': 'XRP'
    };

    selectedCurrencies.clear(); // Clear previous selections
    
    for (let i = 0; i < checkedItemId.length; i++) {
        let selectedMetric = checkedItemId[i]; // Remove "#" to match itemValue keys

        if (itemValue[selectedMetric] &&  itemValue[selectedMetric].GroupId in currencyMap) {
            selectedCurrencies.add(currencyMap[itemValue[selectedMetric].GroupId]);
        }
    }

   
}

function drawTechnicalGraph(chartId, graphService,graphName,removeEmpty,saveHistory,fromDate=null, toDate=null)
{	
	mode = "merge";
	var dataParam;
	var checkedItemValues = [];
	serieArray = [];
	checkedItemId=[];	
	$('#overlayChart').show();
	var fromdate = fromDate!=null?fromDate:formatDate(monthDate);
	var todate = toDate!=null?toDate:formatDate(date);

	$(chartId).html("");
	$(chartId).css("display", "block");
	
	if (checkDateMonth(monthDate, date)) {
		$("#button-monthForward").prop('disabled', false);
	}
	else {
		$("#button-monthForward").prop('disabled', true);
	}

	if (checkDateYear(monthDate, date)) {
		$("#button-yearForward").prop('disabled', false);
	}
	else {
		$("#button-yearForward").prop('disabled', true);
	}

	var Period = 'd';
	var type = '0';
	if (chart != null)
		chart.destroy();
		// Gather metadata with IDs
	const checkItems = getCheckedItems(2);
	const metadataList = checkItems[0].split(`-chart-2`)[0];
	
	checkedItemId.push(metadataList);
	checkedItemValues = checkedItemId.filter(item => item != null);
	chart = new ApexCharts(document.querySelector(chartId), options_graph);

	chart.render();
	
    const matchingItem = results.find(item => item.graphId === checkedItemValues[0]);
	const hasMatchingTrendline = typeof(matchingItem)!='undefined'?matchingItem.trendlines:undefined;
	const hasMatchingRelevant = typeof(matchingItem)!='undefined'?matchingItem.relevant:undefined;

 		 trendLines=[];
		 channelLines=[];
		 serieArray=[];
		 trendlineSeries=[];
		 relevant=[];
		 trendLineId=0;
		 relevantId=0;
	
	if(typeof hasMatchingTrendline !== 'undefined' && hasMatchingTrendline !== null && hasMatchingTrendline.length > 0)
 		{
		 let smallestDate = null;
		 
			for (var i = 0; i < matchingItem.trendlines.length; i++) {
					trendLineId=trendLineId+1;
					trendlineSeries.push({
						trendLineId: matchingItem.trendlines[i].trendLineId,
					    name: 'Trendline '+convertToRoman(i+1),
					    data: transformTrendline(matchingItem.trendlines[i]),
					    type:'line',
					    hidden: matchingItem.trendlines[i].hidden
					  });
					  
					trendLines.push(matchingItem.trendlines[i]);
				  }
				 
			for (var i = 0; i < matchingItem.channelLines.length; i++) {
					channelId=matchingItem.channelLines[i].channelId;
					trendlineSeries.push({
						channelId: matchingItem.channelLines[i].channelId,
					    name: 'Channel',
					    data: transformChannelLine(matchingItem.channelLines[i]),
					    type:'line',
					    hidden: matchingItem.channelLines[i].hidden
					  });
			          
					  channelLines.push(matchingItem.channelLines[i]);

				  } 
				 for (const trendline of trendLines) {
				    
				    const currentDate = parseDate(trendline.x1);
				
				    if (smallestDate === null || currentDate < smallestDate) {
				        smallestDate = currentDate;
				    }
				}
			
		 startDate = smallestDate;
		 if (monthDate>startDate && startDate!=null)
		 	{fromdate =  formatDate(startDate);  
		 	monthDate = startDate;
			resetParameters();
			}
	}
	if(typeof hasMatchingRelevant !== 'undefined' && hasMatchingRelevant !== null && hasMatchingRelevant.length > 0)
 		{
			 if(hasMatchingRelevant[0]!=undefined)
				for (var i = 0; i < matchingItem.relevant.length; i++) {
						relevantId=relevantId+1;
						relevant.push({
							dbId:matchingItem.relevant[i].dbId,
							relevantId: relevantId,
						    relevantParameter: matchingItem.relevant[i].relevantParameter,
						    isHidden: matchingItem.relevant[i].isHidden
						  });
					 } 
		}
	title = itemValue[checkedItemValues[0]].title;

					dataParam = {
						"fromdate": fromdate,
						"todate": todate,
						"period":  Period,
						"type": type,
						"subGroupId1": itemValue[checkedItemValues[0]].subGroupId,
						"groupId1": itemValue[checkedItemValues[0]].GroupId,
						"isFunctionGraph":functionId=='-1'?false:true,
						"functionId":functionId,
						//"removeEmpty1":itemValue[checkedItemValues[0]].subGroupId==2?"true":false
						"removeEmpty1":removeEmpty
					};
					
					$.ajax({
						type: "POST",
						contentType: "application/json; charset=utf-8",
						url: "/"+graphService+"/getgraphdatabytype",
						data: JSON.stringify(dataParam),
						dataType: 'json',
						timeout: 600000,
						success: async function(response) {
							
						    source = getMinMaxDateData(response[0].graphResponseDTOLst);
				           //var data = transformData(response[0].graphResponseDTOLst);
 					if (results && results[0] && Array.isArray(results[0].relevant)) {
						results[0].relevant.forEach(relevantItem => {
						    const relevantParameter = relevantItem.relevantParameter;
						
						    if (relevantParameter) {
						        // Find the value for startDate
						        const startPrice = parseFloat(response[0].graphResponseDTOLst
						       .filter(item => item.x === relevantParameter.startDate)[0]?.y)
						       .toFixed(getFormat(response[0].config.dataFormat)[0]);
						
						        // Find the value for endDate
						        const endPrice = parseFloat(response[0].graphResponseDTOLst
						            .filter(item => item.x === relevantParameter.endDate)[0]?.y)
						       .toFixed(getFormat(response[0].config.dataFormat)[0]);
						
						        // Update the relevantParameter object
						        if (startPrice !== undefined) {
						            relevantParameter.startPrice = startPrice;
						        }
						        if (endPrice !== undefined) {
						            relevantParameter.endPrice = endPrice;
						        }
						    }
						});
						}
				if (results && results[0] && Array.isArray(results[0].retracementParameter)) {
				    results[0].retracementParameter.forEach((retracementItem, index) => {
				        const retracementParameter = retracementItem;
				
				        if (retracementParameter) {
				            // Find the value for startDate
				            const startPrice = parseFloat(
				                response[0].graphResponseDTOLst
				                    .filter(item => item.x === retracementParameter.startDate)[0]?.y
				            ).toFixed(getFormat(response[0].config.dataFormat)[0]);
				
				            // Find the value for endDate
				            const endPrice = parseFloat(
				                response[0].graphResponseDTOLst
				                    .filter(item => item.x === retracementParameter.endDate)[0]?.y
				            ).toFixed(getFormat(response[0].config.dataFormat)[0]);
				
				            // Update the relevantParameter object
				            if (startPrice !== undefined) {
				                retracementParameter.startPrice = startPrice;
				            }
				            if (endPrice !== undefined) {
				                retracementParameter.endPrice = endPrice;
				            }
				
				            // Recalculate retracement data
				            if (startPrice && endPrice) {
				                const calculatedRetracementData = calculateRetracements(
				                    parseFloat(startPrice),
				                    parseFloat(endPrice)
				                );
				
				                // Ensure retracementData exists
				                if (!results[0].retracementData) {
				                    results[0].retracementData = [];
				                }
				
				                // Replace or update the corresponding index in retracementData for results[0]
				                const retracementDataEntry = {};
				                for (const level in calculatedRetracementData) {
				                    if (calculatedRetracementData.hasOwnProperty(level)) {
				                        retracementDataEntry[level] = calculatedRetracementData[level];
				                    }
				                }
				
				                if (results[0].retracementData[index]) {
				                    results[0].retracementData[index] = retracementDataEntry;
				                } else {
				                    // Add a new entry if it doesn't exist (fallback case)
				                    results[0].retracementData.push(retracementDataEntry);
				                }
				            }
				        }
				    });
} 
					if (results && results[0] && Array.isArray(results[0].trendlines)) {
						results[0].trendlines.forEach(trendlinesItem => {
						  
						        // Find the value for startDate
						        const startPrice = parseFloat(response[0].graphResponseDTOLst
						       .filter(item => item.x === trendlinesItem.x1)[0]?.y)
						       .toFixed(getFormat(response[0].config.dataFormat)[0]);
						
						        // Find the value for endDate
						        const endPrice = parseFloat(response[0].graphResponseDTOLst
						            .filter(item => item.x === trendlinesItem.x2)[0]?.y)
						       .toFixed(getFormat(response[0].config.dataFormat)[0]);
						
						        // Update the trendlinesItem object
						        if (startPrice !== undefined) {
						            trendlinesItem.y1 = startPrice;
						        }
						        if (endPrice !== undefined) {
						            trendlinesItem.y2 = endPrice;
						        }
						     
						       let count = 0;
							    for (const item of response[0].graphResponseDTOLst) {
							        const itemDate = item.x; // Date is already in string format
							        if (parseDate(itemDate) >= parseDate(trendlinesItem.x1) && parseDate(itemDate) <= parseDate(trendlinesItem.x2) ) {
							            count++;
							        }
							        
							    }
							   
							  const slope=(endPrice-startPrice)/count;
							  trendlinesItem.slope = slope.toFixed(6);
						});
						}

 						   data=response;
 						    
				           chartResponse =  response[0].graphResponseDTOLst;
    	 
						    x3= getMaxDate(response[0].graphResponseDTOLst);
						    
							newstartdate = new Date();
							startDateF1 = response[0].config.startDate;
							if (startDateF1 != null)
								startDateF1 = new Date(startDateF1.split("-")[1] + "-" + startDateF1.split("-")[0] + "-" + startDateF1.split("-")[2]);


							T1 = response[0].config.displayDescription == null ? itemValue[checkedItemValues[0]].title : response[0].config.displayDescription;
							title = T1;
							if (response[0].config.yAxisFormat != null && response[0].config.yAxisFormat != "") {
								if (response[0].config.yAxisFormat.includes("%")) {
									isdecimal = false;
									if (typeof response[0].config.yAxisFormat.split(".")[1] != 'undefined')
										yaxisformat = response[0].config.yAxisFormat.split("%")[0].split(".")[1].length;
									else
										yaxisformat = 0;
								}
								else {
									if (typeof response[0].config.yAxisFormat.split(".")[1] != 'undefined')
										yaxisformat = response[0].config.yAxisFormat.split(".")[1].length
									else
										yaxisformat = 0

									isdecimal = true;
								}
							}
							else
								yaxisformat = 3;

							var dbchartType1 = response[0].config.chartType;
							chartType1 = getChartType(dbchartType1)[0];
							curve1 = getChartType(dbchartType1)[1];
							disableChartType(false);
							var getFormatResult = getFormat(response[0].config.dataFormat);
							chartDbFontSize = response[0].config.chartSize;
							const hasMatchingTrendlines = !(typeof(hasMatchingTrendline)!='undefined')?false : hasMatchingTrendline.length!=0
							dbChartTransparency= hasMatchingTrendlines?matchingItem.chartOptions.chartTransparency:response[0].config.chartTransparency;
							chartTransparency = checkActiveChartColorTransparency($("#chartColorTransparency").find(".active")[0],dbChartTransparency);
							
							dbChartchartType1= hasMatchingTrendlines?matchingItem.chartOptions.chartType1:chartType1;
							chartType1 = checkActiveChartType($("#chartTypes").find(".active")[0], dbChartchartType1, Period);
							
							dbChartColor = hasMatchingTrendlines?'#'+matchingItem.chartOptions.chartColor:response[0].config.chartColor;
							chartColor = chartType1=='line'?"#ffffff":checkActiveChartColor($("#chartColor").find(".active")[0],dbChartColor);
							
							dbFontsize = hasMatchingTrendlines?matchingItem.chartOptions.fontsize:chartDbFontSize;
							fontsize = checkActiveFontSize($("#fontOptions").find(".active")[0], dbFontsize);
							
							dbMarkerSize = hasMatchingTrendlines?matchingItem.chartOptions.markerSize.split("-")[1]: response[0].config.chartshowMarkes;
							markerSize = checkActiveChartMarker($("#chartMarker").find(".active")[0],dbMarkerSize);
							
							dbShowGrid = hasMatchingTrendlines?matchingItem.chartOptions.showGrid:response[0].config.chartShowgrid;
							showGrid = checkActiveChartGrid($("#gridOptions").find(".active")[0], dbShowGrid);
							
							dbShowLegend = hasMatchingTrendlines?matchingItem.chartOptions.showLegend:showLegend;
							showLegend	= checkActiveChartLegend($("#gridLegend").find(".active")[0], dbShowLegend);
 
							chart.updateOptions(getChartDailyOption(title+getTitlePeriodAndType(), showGrid, fontsize, markerSize));
							updateChartOption();
							
							min = Math.min.apply(null, response[0].graphResponseDTOLst.map(function(item) {
								return item.y;
							}));
							max = Math.max.apply(null, response[0].graphResponseDTOLst.map(function(item) {
									return item.y;
								}));
							//minvalue = parseFloat((Math.floor(min * 20) / 20).toFixed(2));
							//maxvalue = parseFloat((Math.floor(max * 20) / 20).toFixed(2));
							minvalue = min;
							maxvalue = max;
							var yaxisformat = getFormat(response[0].config.yAxisFormat);
							
							notDecimal=yaxisformat[1];
					        nbrOfDigits=yaxisformat[0];
					        
						   getFormatResult0 = getFormat(response[0].config.dataFormat);
					   
							chartConfigSettings={functionId:functionId+1,
												 isDecimal:isdecimal,
												 yAxisFormat:yaxisformat,
												 fontSize:fontsize,
												 min:min,
												 max:max,
												 minvalue:minvalue,
												 maxvalue:maxvalue,
												 response:response,
												 Period:Period,
												 chartColor:chartColor,
												 chartTransparency:chartTransparency,
												 getFormatResult0:getFormatResult0,
												 checkedItem:checkedItem,
												 chartType1:chartType1,
												 yaxisAnnotation:[]};
												 
								
								processDataAndAddNewEndDate(response,0.1)
							    .then(({ originalEndDate, newEndDate }) => {
									latestEndDate=originalEndDate;

							          var latestX3Date = new Date(parseDate(newEndDate));
									  
									  // Get the timezone offset in minutes and convert it to milliseconds
										let timezoneOffset = latestX3Date.getTimezoneOffset() * 60000;
										
										// Create a new Date object in UTC by subtracting the timezone offset
										let utcDate = new Date(latestX3Date.getTime() - timezoneOffset);
										
										// Convert to ISO string
										let newDateX3 = utcDate.toISOString();
									  
									  
									  var allDataAreLatest=true;
									
									updateLatestTrendLine(trendLines, newDateX3,originalEndDate,checkedItemValues[0]).then(results => {
									   	allDataAreLatest=results;
										 if(allDataAreLatest)
									    {
											serieArray = getSerriesData();
										    updateSeriesChart(chartConfigSettings);
										    
										/*   const dataStartDate=response[0].graphResponseDTOLst[0].x;
				 						   const dataEndDate=response[0].graphResponseDTOLst[response[0].graphResponseDTOLst.length-1].x;
				
				 						   const newEndDate = calculateNewEndDate(dataStartDate, dataEndDate);
				 						   response[0].graphResponseDTOLst.push({x:newEndDate,y:null})  
										*/
									    }
									drawTrendLineTable(trendLines);
									
								    processRetracementData(retracementData, checkedItemValues);
		   							if( relevant.length!=0)
		   							{drawRelevantTable(relevant);
									 for (let i = 0; i < relevant.length; i++) {
									 drawRelevant(relevant[i].relevantParameter,relevant[i].relevantId);
									}
									 updateSeriesChart(chartConfigSettings);
									}else{
										$("#relevant-grid").empty();

									}
									$('#overlayChart').hide(); 		    
									}).catch(error => {
							        console.error('Error updateLatestTrendLine data:', error);
							    });			 
							
									 ChartManager.instances.chart2.state.seriesFormats = response.map((r, idx) => {
											const [digits, isRaw] = getFormat(r.config?.yAxisFormat || '');
											return {
												digits,
												isRaw,
												useShortFormat: false
											};
										});
									 
							    })
							    .catch(error => {
							        console.error('Error processing data:', error);
							    });			 
							
						},
						error: function(e) {

							console.log("ERROR : ", e);

						}
					});
			
		    (saveHistory)?saveGraphHistory(graphName,checkedItemValues,Period,type):null;
		    
	$("#dateFrom-chart2").val(fromdate);
	$("#dateTo-chart2").val(todate);
	
}


function processRetracementData(retracementData, checkedItemValues) {
     const hasRetracement = retracementData[checkedItemValues[0]];
    if (typeof hasRetracement === 'undefined' || hasRetracement.length==0) {
        $("#retracement-grid").empty();
        retracement = [];
        retracementId = 1;
        chartConfigSettings.yaxisAnnotation = [];
        updateSeriesChart(chartConfigSettings);
    } else {
        /*let yaxis = [];
        retracement = [];
        retracementId = 0;

        hasRetracement.forEach(function(item) {
            const json = convertRetracementData(
                item.retracementData,
                item.retracementParameter.startDate,
                item.retracementParameter.endDate,
                item.retracementParameter.startPrice,
                item.retracementParameter.endPrice,
                item.retracementDataHide,
                item.retracementParameter.hideAll,
            );

            retracementId += 1;
            retracement.push({
                dbId: item.dbId,
                retracementId: retracementId,
                graphId: checkedItemValues[0],
                retracementValues: json,
                retracementParameter: item.retracementParameter
            });
            const relatedyaxis = convertData(json,retracementId);
            for (const newItem of relatedyaxis) {
                yaxis.push(newItem);
            }

        });

        drawRetracementTable(retracement);
        chartConfigSettings.yaxisAnnotation = yaxis;
        updateSeriesChart(chartConfigSettings);*/
    let yaxis = [];
retracement = [];
let retracementId = 0;

// Separate existing non-retracement annotations
let nonRetracementAnnotations = chartConfigSettings.yaxisAnnotation.filter(
    annotation => !annotation.hasOwnProperty('retracementId')
);

// Process retracements and update annotations
hasRetracement.forEach(function(item) {
    const json = convertRetracementData(
        item.retracementData,
        item.retracementParameter.startDate,
        item.retracementParameter.endDate,
        item.retracementParameter.startPrice,
        item.retracementParameter.endPrice,
        item.retracementDataHide,
        item.retracementParameter.hideAll
    );

    retracementId += 1;
    retracement.push({
        dbId: item.dbId,
        retracementId: retracementId,
        graphId: checkedItemValues[0],
        retracementValues: json,
        retracementParameter: item.retracementParameter
    });
    // Convert retracement values to y-axis annotations
    const relatedyaxis = convertData(json, retracementId);
    yaxis = yaxis.concat(relatedyaxis); // Add these to the retracement annotations
});

// Combine updated annotations with non-retracement annotations
chartConfigSettings.yaxisAnnotation = [...nonRetracementAnnotations, ...yaxis];

// Update the chart with the new annotations
drawRetracementTable(retracement);
updateSeriesChart(chartConfigSettings);

    
    }
}
function getMinMaxDateData(data) {
    var minMaxDateData = [];
	 let dates = data.map(obj => new Date(obj.x));
	    
	// Find min and max dates
	let minDate = new Date(Math.min.apply(null, dates));
	let maxDate = new Date(Math.max.apply(null, dates));
    minMaxDateData.push({ minDate: minDate, maxDate: maxDate });
    return minMaxDateData;
}

function parseDate(dateString) {
    var parts = dateString.split('-');
    var day = parseInt(parts[0]);
    var month = parts[1];
    var year = parseInt(parts[2]) + 2000; // Assuming the year is in the format yy and needs to be converted to yyyy
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthIndex = months.indexOf(month);
    return new Date(year, monthIndex, day);
}

function getMaxDate(data) {
    var maxDate = null;
    for (var i = 0; i < data.length; i++) {
        var dateString = data[i].x;
        var currentDate = parseDate(dateString);
        if (!maxDate || currentDate > maxDate) {
            maxDate = currentDate;
        }
    }
    return maxDate;
}
function transformData(data) {
    var transformedData = [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var label = item.x;
        var y = item.y;
        var html = "<div tabIndex=0 style='padding: 1px;'><div>Date: " + label + "</div><div>Value: " + y + "</div></div>";
        transformedData.push({ html: html, label: label, y: y });
    }
    return transformedData;
    }
    // Function to parse date string in the format "dd-MMM-yy"
function parseDate(dateString) {
    // Split the date string by "-"
    let parts = dateString.split("-");
    
    // Parse day, month, and year
    let day = parseInt(parts[0], 10);
    let monthStr = parts[1];
    let year = "20"+parseInt(parts[2], 10);

    // Map month abbreviation to its corresponding number
    let months = {
        "Jan": 0,
        "Feb": 1,
        "Mar": 2,
        "Apr": 3,
        "May": 4,
        "Jun": 5,
        "Jul": 6,
        "Aug": 7,
        "Sep": 8,
        "Oct": 9,
        "Nov": 10,
        "Dec": 11
    };

    // Get the month number from the abbreviation
    let month = months[monthStr];

    // Return the parsed date as a Date object
    return new Date(year, month, day);
}
function drawTrendLineTable(data){
	$("#trendline-grid").empty();
	
	var trendlineGrid ='';
	let cid,TrendLineId;
		for (var i = 0; i < data.length; i++) {
			if(data[i].trendLineId==null)
					data[i].trendLineId=trendLineId;
					
			 TrendLineId=data[i].trendLineId;
			 const isBitcoin =  $('#dropDownCryptoOptions').val()=='71';
	         const slope=(data[i].slope!=null)?parseFloat(data[i].slope).toFixed(isBitcoin?0:3):"";
	         const trendlineValue=(data[i].endValue!=null)?parseFloat(data[i].endValue).toFixed(getFormatResult0[0]):"";
	         const x1=(data[i].x1!=null)?data[i].x1:"";
	         const y1=(data[i].y1!=null)?parseFloat(data[i].y1).toFixed(getFormatResult0[0]):"";
	         const x2=(data[i].x2!=null)?data[i].x2:"";
	         const y2=(data[i].y2!=null)?parseFloat(data[i].y2).toFixed(getFormatResult0[0]):"";
	         
			 hasChannel = channelLines.filter(obj => obj.trendLineId === TrendLineId);
			 let xc=(hasChannel.length!=0)?hasChannel[0].xc:"";
			 let yc=(hasChannel.length!=0)?parseFloat(hasChannel[0].yc).toFixed(getFormatResult0[0]):"";
			 let y3c=(hasChannel.length!=0)?parseFloat(hasChannel[0].endValue).toFixed(isBitcoin?0:2):"";
			 cid=(hasChannel.length!=0)?hasChannel[0].channelId:"";
			 
	         
			 trendlineGrid += "<div class='col-12 pl-0 d-flex pt-1 pb-1' id='trendline"+TrendLineId+"'>"
								+"<div class='col-12 pl-0 pr-1'>"
								+"		<table id='table_"+TrendLineId+"'>"
								+"			<thead>"
								+"				<tr>"
								+"					<th class='pl-0 d-flex'><div id='editDate_"+TrendLineId+"'> </div> <button class='btn btn-light-secondary mr-1 mb-1 edit-table' type='button' onclick='editTrendLines("+data[i].dbid+","+TrendLineId+")'><img src='/img/icon/calendar.svg' width='16' height='16' style=''></button>TRENDLINE</th>"
								+"					<th class='slope-style'>slope</th>"
								+"					<th>"+slope+"</th>"
								+"					<th class='trendline-cell' >"+trendlineValue+"</th>"
								+"				</tr>"
								+"			</thead>"
								+"			<tbody>"
								+"				<tr>"
								+"					<td>Start date</td>"
								+"					<td class='grey-cell start-date' id='start_"+TrendLineId+"'>"+x1+"</td>"
								+"					<td>& Price</td>"
								+"					<td class='grey-cell' id='startPrice_"+TrendLineId+"'>"+y1+"</td>"
								+"				</tr>"
								+"				<tr>"
								+"					<td>Cross date</td>"
								+"					<td class='grey-cell cross-date' id='cross_"+TrendLineId+"'>"+x2+"</td>"
								+"					<td>& Price</td>"
								+"					<td class='grey-cell br-br' id='crossPrice_"+TrendLineId+"'>"+y2+"</td>"
								+"				</tr>"
						        
						       +"	<tr data-toggle='collapse' data-target='#demo"+TrendLineId+"' class='accordion-toggle'>"
							   +"     <th class='pl-0' colspan='2'><button class='btn btn-default btn-xs pl-0 pr-0 pt-0'><img src='/img/icon/arrow-down.svg' width='16' height='16' style=''></button> ADD CHANNEL</th>"
							   +"     <th></th>";
							   
							   
							   trendlineGrid +=(hasChannel.length!=0)?
							    "					<th class='trendline-cell'>"+y3c+"</th>"
								:
								"     <th></th>";
								
							  trendlineGrid +=" 	</tr>"
							  +"<tr>"
							  +"<td colspan='12' class='hiddenRow p-0'>"
							  +"<div class='accordian-body collapse' id='demo"+TrendLineId+"'> "
							  + "<table  id='tableChannel_"+TrendLineId+"' class=' table-striped'>"
							                               +"			<thead style='visibility: collapse;'>"
															+"				<tr>"
															+"					<th class='pl-0 d-flex'><div> </div> <button class='btn btn-light-secondary mr-1 mb-1 edit-table' type='button' onclick='editTrendLines("+data[i].dbid+","+TrendLineId+")'><img src='/img/icon/calendar.svg' width='16' height='16' style=''></button>TRENDLINE</th>"
															+"					<th class='slope-style'>slope</th>"
															+"					<th>"+parseFloat(data[i].slope).toFixed(3)+"</th>"
															+"					<th class='trendline-cell'>"+parseFloat(data[i].y3).toFixed(getFormatResult0[0])+"</th>"
															+"				</tr>"
															+"			</thead>"
							                                +"<tr>"
															+"					<td >Start date</td>"
															+"					<td class='grey-cell start-date' id='ChannelStart_"+TrendLineId+"'>"+xc+"</td>"
															+"					<td >& Price</td>"
															+"					<td class='grey-cell' id='channelStartPrice_"+TrendLineId+"'>"+yc+"</td>"
															+"				</tr>"
							               	+"</table>"
							             + "</div> "
							         +" </td>"
							     + "  </tr>"
						       
								+"			</tbody>"
								+"		</table>"
								+"		</div>";
								
								trendlineGrid +="<div class='d-flex align-items-start flex-column bd-highlight' style='min-height: 115px;'>";
									
									trendlineGrid +="  <div class='mb-auto bd-highlight d-grid'>";
								
									if(typeof(data[i].dbid)!='undefined')
									{
										trendlineGrid += "	"
									if (data[i].hidden!=true)
										trendlineGrid +="		    <button id='toggleTrendline_"+TrendLineId+"' class='btn btn-light-secondary mr-1 mb-1 green'><i class='far fa-eye white'></i></button>";
										else 
										trendlineGrid +="		    <button id='toggleTrendline_"+TrendLineId+"' class='btn btn-light-secondary mr-1 mb-1 hide'><i class='far fa-eye-slash white'></i></button>";

										trendlineGrid +="		    <button class='btn btn-light-secondary mr-1 mb-1 red' type='button' onclick='deleteTrendLinesHistory("+data[i].dbid+","+TrendLineId+")'><img src='/img/icon/delete.svg' width='16' height='16' style=''></button>"
	
									}else{
										trendlineGrid += " "
									+"		    <button class='btn btn-light-secondary mr-1 mb-1 green' type='button' onclick='saveTrendLinesHistory("+TrendLineId+")'><img src='/img/icon/save.svg' width='16' height='16' style=''></button>"
								    +"		    <button class='btn btn-light-secondary mr-1 mb-1 blue' type='button' onclick='cancelTrendline("+TrendLineId+")'><img src='/img/icon/false.svg' width='16' height='16' style=''></button>"
									
									}
									trendlineGrid +="</div>";
									
								if(hasChannel.length!=0)
								 {
									trendlineGrid +="  <div class='bd-highlight'>";
								
									if(typeof(hasChannel[0].dbid)!='undefined')
									{
									if (hasChannel[0].hidden!=true)
										trendlineGrid +="		    <button id='toggleChannel_"+cid+"' class='btn btn-light-secondary mr-1 mb-1 green'><i class='far fa-eye white'></i></button>"
									else 
										trendlineGrid +="		    <button id='toggleChannel_"+cid+"' class='btn btn-light-secondary mr-1 mb-1 hide'><i class='far fa-eye-slash white'></i></button>"
									
									trendlineGrid +="		    <button class='btn btn-light-secondary mr-1 mb-1 red' type='button' onclick='deleteChannellineHistory("+data[i].dbid+","+TrendLineId+")'><img src='/img/icon/delete.svg' width='16' height='16' style=''></button>"
	
									}
									else{
										trendlineGrid += " "
									+"		    <button class='btn btn-light-secondary mr-1 mb-1 green' type='button' onclick='saveChannelHistory("+TrendLineId+")'><img src='/img/icon/save.svg' width='16' height='16' style=''></button>"
								    +"		    <button class='btn btn-light-secondary mr-1 mb-1 blue' type='button' onclick='cancelChannelline("+cid+")'><img src='/img/icon/false.svg' width='16' height='16' style=''></button>"
									}
									trendlineGrid +="</div>";
								}
									
								trendlineGrid +="</div>";
								// end div
								trendlineGrid +="</div>";
					
		
				}				
			 $("#trendline-grid").append(trendlineGrid); 
			
			
			for (var i = 0; i < data.length; i++) {
				if(data[i].trendLineId==null)
					data[i].trendLineId=trendLineId;
					
				let TrendLineId=data[i].trendLineId;
				let hasChannel = channelLines.filter(obj => obj.trendLineId === TrendLineId);
 				let cid=(hasChannel.length!=0)?hasChannel[0].channelId:"";
 				 						  
				var shouldBeExpanded = (hasChannel.length!=0)?true:false; // Example condition, change this according to your logic
		
				    var target = $('#demo'+TrendLineId);
				    if (shouldBeExpanded) {
	    		   		 target.collapse('show')   
	    		  	} else {
				         target.collapse('hide');   
				    }
 				
				$("#editDate_" + TrendLineId).jqxDateTimeInput({ min: source[0].minDate, max: source[0].maxDate, width: '0px', height: '0px', theme: 'dark' });
				$("#inputeditDate_" + TrendLineId).css("padding", "0");

				$("#editDate_" + TrendLineId).on('valueChanged', async function(event) {
					var selectedId = selectedstartCellId.split("_")[1];
					var selectedColumn = selectedstartCellId.split("_")[0];
					var jsDate = event.args.date;
					//	jsDate = jsDate<=event.owner.minDate.dateTime?event.owner.minDate.dateTime:jsDate;
					
					var json = chartResponse.filter(obj => obj.x === formatTrendlineDate(jsDate));
					if (selectedColumn == "start") {
						if (jsDate > parseDate($('#cross_' + selectedId).text())) {
							$('#alertLimitation-modal').modal('show');
							$("#alertTextLimitation").empty();
							$("#alertTextLimitation").append("<p>The start date must be earlier than the cross date.</p>");
							return;
						}
						if (typeof (json[0]) == 'undefined') {
							$('#alertLimitation-modal').modal('show');
							$("#alertTextLimitation").empty();
							$("#alertTextLimitation").append("<p>The selected date has no data. Please choose a different date.</p>");
							return;
						}
						y1 = json[0].y;
						x1 = formatTrendlineDate(jsDate);

						y2 = $('#crossPrice_' + selectedId).text();
						x2 = $('#cross_' + selectedId).text();

						x3 = getMaxDate(chartResponse);

						$('#' + selectedstartCellId).text(formatTrendlineDate(jsDate));
						$('#startPrice_' + selectedId).text(parseFloat(json[0].y).toFixed(getFormatResult0[0]));
                        if(x1=="" || x2=="")
                        	return;
                        else
						await updateTrendLine(selectedId);  

					} else if (selectedColumn == "cross") {

						if (jsDate < parseDate($('#start_' + selectedId).text())) {
							$('#alertLimitation-modal').modal('show');
							$("#alertTextLimitation").empty();
							$("#alertTextLimitation").append("<p>The cross date must be later than the start date.</p>");
							return;
						}
						if (typeof (json[0]) == 'undefined') {
							$('#alertLimitation-modal').modal('show');
							$("#alertTextLimitation").empty();
							$("#alertTextLimitation").append("<p>The selected date has no data. Please choose a different date.</p>");
							return;
						}


						y1 = $('#startPrice_' + selectedId).text();
						x1 = $('#start_' + selectedId).text();

						y2 = json[0].y;
						x2 = formatTrendlineDate(jsDate);

						x3 = getMaxDate(chartResponse);

						$('#' + selectedstartCellId).text(formatTrendlineDate(jsDate));
						$('#crossPrice_' + selectedId).text(parseFloat(json[0].y).toFixed(getFormatResult0[0]));

						if(x1=="" || x2=="")
                        	return;
                        else
						await updateTrendLine(selectedId);  

					} else if (selectedColumn == "ChannelStart") {

						$('#' + selectedstartCellId).text(formatTrendlineDate(jsDate));
						$('#channelStartPrice_' + selectedId).text(parseFloat(json[0].y).toFixed(getFormatResult0[0]));
						
						y1 = $('#startPrice_' + selectedId).text();
						x1 = $('#start_' + selectedId).text();

						y2 = $('#crossPrice_' + selectedId).text();
						x2 = $('#cross_' + selectedId).text();
						
						yc = json[0].y;
						xc = formatTrendlineDate(jsDate);
						
						x3 = getMaxDate(chartResponse);
						var channelLineJson={ "x1":x1,"y1":y1,
											   "x2":x2,"y2":y2,
											   "xc":xc,"yc":yc,
											   "x3":x3,
											   "trendLineId":selectedId};
						if(hasChannel.length!=0)
						   updateChannelLine(channelLineJson);
						else
						   addChannelTrendLine(channelLineJson);
					}
			    updateSeriesChart(chartConfigSettings);
			});
			
			
				$("#toggleTrendline_"+TrendLineId).click(function() {
				 	var $button = $(this);
				    var $icon = $button.find('i');
				    var index= $button.attr('id').split("_")[1];
				    // Toggle the visibility icon
				    $icon.toggleClass('fa-eye').toggleClass('fa-eye-slash');
				
				    // Toggle the button text
				    if ($icon.hasClass('fa-eye')) {
				      $button.attr('title', 'Hide').attr('aria-label', 'Hide');
				      $button.addClass('green');
				      $button.removeClass('hide');
				      
				        trendlineSeries.forEach(function(item) {
							 if(item.trendLineId === parseFloat(index))
						        item.hidden = false;
						});
					    trendLines.forEach(function(item) {
							 if(item.trendLineId === parseFloat(index))
						        item.hidden = false;
						});  
				       trendLine=trendlineSeries.filter(obj => obj.trendLineId === parseFloat(index));
	 					
	 				   serieArray.unshift(trendLine[0]);
	 				   updateSeriesChart(chartConfigSettings);
	 				   saveShowHideTrendline(trendLine[0].trendLineId, false);
	 				   
				    } else {
				      $button.attr('title', 'Show').attr('aria-label', 'Show');
				      $button.removeClass('green');
				      $button.addClass('hide');
				      
				       trendlineSeries.forEach(function(item) {
							 if(item.trendLineId === parseFloat(index))
						        item.hidden = true;
						});
						 trendLines.forEach(function(item) {
							 if(item.trendLineId === parseFloat(index))
						        item.hidden = true;
						});
				      trendLine=trendlineSeries.filter(obj => obj.trendLineId === parseFloat(index));

				      serieArray=serieArray.filter(obj => obj.trendLineId !== parseFloat(index));
 				      updateSeriesChart(chartConfigSettings);
 				      saveShowHideTrendline(trendLine[0].trendLineId, true); 
				    }
				    
				});
					$("#toggleChannel_"+cid).click(function() {
				 	var $button = $(this);
				    var $icon = $button.find('i');
				    var index= $button.attr('id').split("_")[1];
				    // Toggle the visibility icon
				    $icon.toggleClass('fa-eye').toggleClass('fa-eye-slash');
				
				    // Toggle the button text
				    if ($icon.hasClass('fa-eye')) {
				      $button.attr('title', 'Hide').attr('aria-label', 'Hide');
				      $button.addClass('green');
				      $button.removeClass('hide');
				      
				        trendlineSeries.forEach(function(item) {
							 if(item.channelId === parseFloat(index) )
						        item.hidden = false;
						});
					    channelLines.forEach(function(item) {
							 if(item.channelId === parseFloat(index) )
						        item.hidden = false;
						});  
					 channel=trendlineSeries.filter(obj => obj.channelId === parseFloat(index));
 					 serieArray.unshift(channel[0]);
 					 updateSeriesChart(chartConfigSettings);
 					 saveShowHideChannel(channel[0].channelId, false);

				    } else {
				      $button.attr('title', 'Show').attr('aria-label', 'Show');
				      $button.removeClass('green');
				      $button.addClass('hide');
				      
				        trendlineSeries.forEach(function(item) {
							 if(item.channelId === parseFloat(index) )
						        item.hidden = true;
						});
						 channelLines.forEach(function(item) {
							 if(item.channelId === parseFloat(index) )
						        item.hidden = true;
						});
				      channel=trendlineSeries.filter(obj => obj.channelId === parseFloat(index));

				      serieArray=serieArray.filter(obj => obj.channelId !== parseFloat(index));
 				      updateSeriesChart(chartConfigSettings);
 				      saveShowHideChannel(channel[0].channelId, true); 
				    }
				  
				});
			}
			
		var startCell = document.querySelectorAll('.start-date');
		
		startCell.forEach(function(cell) {
		  cell.addEventListener('click', function() {
		    var table = cell.closest('table');
		    var tableId = table.getAttribute('id'); 
		    selectedstartCellId = cell.getAttribute('id'); 
  			var cellContent = cell.textContent;
			cellContent=cellContent==""?new Date():parseDate(cellContent);
			$('#editDate_'+tableId.split("_")[1]).jqxDateTimeInput({value: cellContent});
		    $('#editDate_'+tableId.split("_")[1]).jqxDateTimeInput('open'); 
			
		  });
		});
	
		var crossCell = document.querySelectorAll('.cross-date');
		
		crossCell.forEach(function(cell) {
		  cell.addEventListener('click', function() {
		    var table = cell.closest('table');
		    var tableId = table.getAttribute('id'); 
		    selectedstartCellId = cell.getAttribute('id'); 

		    var cellContent = cell.textContent;
			
			$('#editDate_'+tableId.split("_")[1]).jqxDateTimeInput({value: parseDate(cellContent)});
		    $('#editDate_'+tableId.split("_")[1]).jqxDateTimeInput('open'); 
		  });
		});
		
}
function drawRetracementTable(data){
	$("#retracement-grid").empty();
	 var retracementGrid ='';
	 var retracementId;
     data.forEach(item => {
		 retracementId =item.retracementId;
		 const retracementValues = item.retracementValues;
		 const retracementParameter = item.retracementParameter;
		 const startDate = retracementParameter!= null ?retracementParameter.startDate:"";
		 const startPrice = retracementParameter!= null ?retracementParameter.startPrice:"";
		 const endDate = retracementParameter!= null ?retracementParameter.endDate:"";
		 const endPrice = retracementParameter!= null ?retracementParameter.endPrice:"";
		 const hideAll = retracementParameter!= null ?retracementParameter.hideAll:"";
		  
		 const dbId = item.dbId;
		//  const dbId = 1;
		 retracementGrid += `
		  <div class='col-12 pl-0 d-flex pt-1 pb-1' id='retracement${retracementId}'>
		    <div class='col-11 pl-0 pr-1'>
		      <table id='retracementTable_${retracementId}' class='retracement-table'>
		        <thead>
		          <tr>
		            <th class='pl-0 d-flex'>
		              <div id='retracementEditDate_${retracementId}'> </div>
		              <button class='btn btn-light-secondary mr-1 mb-1 edit-table' type='button' onclick='editretracements("",${retracementId})'>
		                <img src='/img/icon/calendar.svg' width='16' height='16' style=''>
		              </button>
		              <span class='pt-2'>RETRACEMENT</span>
		            </th>
		          </tr>
		        </thead>
		        <tbody>
		          <tr>
		            <td>Start Price</td>
		            <td>Start date</td>
		          </tr>
		          <tr>
		            <td class='grey-cell' id='retracementStartPrice_${retracementId}'>${startPrice}</td>
		            <td class='grey-cell retracement-start-date col-4' id='retracementStart_${retracementId}'>${startDate}</td>
		          </tr>						
		          <tr>
		            <td>End Price</td>
		            <td>End date</td>
		          </tr>
		          <tr>
		            <td class='grey-cell ' id='retracementEndPrice_${retracementId}'>${endPrice}</td>
		            <td class='grey-cell retracement-end-date' id='retracementEnd_${retracementId}'>${endDate}</td>
		          </tr>						        
		        </tbody>
		      </table>
		      ${retracementValues.length ? `<table>
		       <thead>
		          <tr>
		            <th class='pl-0 d-flex'>
		              <span class='pt-2 m-auto'>RETRACEMENT</span>
		            </th>
		          </tr>
		        </thead>
		        <tbody>
		            ${retracementValues
				 .filter(value => value.gridLabel !== undefined)  // Filter out undefined gridLabels
				 .map(value => `
			          <tr>
			            <td id='${retracementId}_${value.key}' class="d-flex h-34 ${value.key.includes('62') || value.key.includes('38') ? 'grey-cell' : ''}"><span class='m-auto'>${value.gridLabel}</span></td>
			          </tr>
			        `).join('')}
		         </tbody>
		       </table>` : ""}
		    </div>
		   ${retracementValues.length ? `
		    <div class='d-flex align-items-start flex-column bd-highlight' style='min-height: 115px;'>
		        <div class='mb-auto bd-highlight'>
		          ${typeof dbId !== 'undefined' ? `
		           <button id='toggleAllRetracements_${retracementId}' 
					        class='btn btn-light-secondary mr-1 mb-1 ${hideAll ? "hide" : "green"}' 
					        type='button' 
					        onclick='toggleAllRetracements(${retracementId}, ${hideAll})'>
					  <i class='far ${hideAll ? "fa-eye-slash" : "fa-eye"} white'></i>
					</button>
					  <button class='btn btn-light-secondary mr-1 mb-1 red' type='button' onclick='deleteRetracementHistory(${dbId}, ${retracementId})'>
		              <img src='/img/icon/delete.svg' width='16' height='16'>
		            </button> `  : `
		            <button class='btn btn-light-secondary mr-1 mb-1 green' type='button' onclick='saveRetracementHistory(${retracementId})'>
		              <img src='/img/icon/save.svg' width='16' height='16'>
		            </button>
		            <button class='btn btn-light-secondary mr-1 mb-1 blue' type='button' onclick='cancelRetracement(${retracementId})'>
		              <img src='/img/icon/false.svg' width='16' height='16'>
		            </button>`} 
		        </div>
		        <div class='bd-highlight'>
		            ${typeof dbId !== 'undefined' ? `
		              ${retracementValues
				 .filter(value => value.gridLabel !== undefined)  // Filter out undefined gridLabels
				 .map(value => `
			          ${value.hide !== true ? `
		                <button id='toggleRetracement_${retracementId}_${value.key}' class='toggleRetracement btn btn-light-secondary mr-1 mt-1 green'>
		                  <i class='far fa-eye white'></i>
		                </button>` : `
		                <button id='toggleRetracement_${retracementId}_${value.key}' class='toggleRetracement btn btn-light-secondary mr-1 mt-1 hide'>
		                  <i class='far fa-eye-slash white'></i>
		                </button>`}
			        `).join('')}
		              ` : ""}
		          </div>` :  `
		           <div class='d-flex align-items-start flex-column bd-highlight' style='min-height: 115px;'>
				        <div class='mb-auto bd-highlight'> <button class='btn btn-light-secondary mr-1 mb-1 green' type='button' onclick='saveRetracementHistory(${retracementId})'>
				              <img src='/img/icon/save.svg' width='16' height='16'>
				            </button>
				            <button class='btn btn-light-secondary mr-1 mb-1 blue' type='button' onclick='cancelRetracement(${retracementId})'>
				              <img src='/img/icon/false.svg' width='16' height='16'>
				            </button>
              		</div>
                </div>`}
		      </div>
		  </div>`;
		});
		$("#retracement-grid").append(retracementGrid);
		
		data.forEach(item => {
			let retracementId =item.retracementId;
		$("#retracementEditDate_" + retracementId).jqxDateTimeInput({ min: source[0].minDate, max: source[0].maxDate, width: '0px', height: '0px', theme: 'dark' });
		$("#inputretracementEditDate_" + retracementId).css("padding", "0");

		$("#retracementEditDate_" + retracementId).on('valueChanged', async function(event) {
			 const selectedId = selectedstartCellId.split("_")[1];
   			 const selectedColumn = selectedstartCellId.split("_")[0];
   			 var jsDate = event.args.date;
				//	jsDate = jsDate<=event.owner.minDate.dateTime?event.owner.minDate.dateTime:jsDate;
					
   			 const json = chartResponse.filter(obj => obj.x === formatTrendlineDate(jsDate));
			 if (selectedColumn == "retracementStart" || selectedColumn == "retracementEnd") {
			        const startDate = parseDate($('#retracementStart_' + selectedId).text());
			        const endDate = parseDate($('#retracementEnd_' + selectedId).text());
			        const priceId = selectedColumn == "retracementStart" ? "retracementStartPrice_" : "retracementEndPrice_";
			
			        if ((selectedColumn == "retracementStart" && jsDate > endDate) ||
			            (selectedColumn == "retracementEnd" && jsDate < startDate) 
			            || typeof json[0] === 'undefined'
			            ) {
			            const message = selectedColumn == "retracementStart" ? "The start date must be earlier than the end date." :
			                "The end date must be later than the start date.";
			            $('#alertLimitation-modal').modal('show');
			            $("#alertTextLimitation").empty().append("<p>" + message + "</p>");
			            return;
			        }
			        	
			  
			        $('#' + selectedstartCellId).text(formatTrendlineDate(jsDate));
			        $('#' + priceId + selectedId).text(parseFloat(json[0].y).toFixed(getFormatResult0[0]));
			      
			  
		    let toggleButton = $("#toggleAllRetracements_"+ retracementId);
				let hideall;
				
				// Check the current state and toggle
				if (toggleButton.hasClass("hide")) {
				    toggleButton.removeClass("hide"); // Make the button visible
				    hideall = true; // Set hideall to false
				} else {
				    toggleButton.addClass("hide"); // Hide the button
				    hideall = false; // Set hideall to true
				}
		
       
			   const parameters={
				   startPrice:$("#retracementStartPrice_"+ retracementId).text(),
				   endPrice: $("#retracementEndPrice_"+ retracementId).text(),
				   startDate:$("#retracementStart_"+ retracementId).text(),
				   endDate: $("#retracementEnd_"+ retracementId).text(),
				   hideAll: hideall,
			   }
			 for (var i = 0; i < retracement.length; i++) {
				   if (retracement[i].retracementId === retracementId) {
					        retracement[i].retracementParameter = parameters;
					        calculateRetracement(retracementId);

						    break;
					  }
				  }
			
			    }
   			 
		});
	});
	$(".toggleRetracement").click(function() {
    const $button = $(this);
    const $icon = $button.find('i');
    const index = parseFloat($button.attr('id').split("_")[1]);
    const key = $button.attr('id').split("_")[2];
    const isHidden = $icon.hasClass('fa-eye'); // true if currently visible
    
    // Toggle button icon and class
    $icon.toggleClass('fa-eye fa-eye-slash');
    $button
        .attr('title', isHidden ? 'Show' : 'Hide')
        .attr('aria-label', isHidden ? 'Show' : 'Hide')
        .toggleClass('green', !isHidden)
        .toggleClass('hide', isHidden)
        .toggleClass('red', isHidden);

	    // Update retracement values
	    retracement.forEach(retracement => {
	        if (retracement.retracementId === index) {
	            retracement.retracementValues.forEach(value => {
	                if (value.key === key) {
	                    value.hide = !value.hide;
	                }
	            });
	        }
	    });
	
	    const selectedRetracement = retracement.find(item => item.retracementId === index);
	
	    // Update chart annotations for the selected retracement
	    chartConfigSettings.yaxisAnnotation = removeById(chartConfigSettings.yaxisAnnotation, "retracementId", selectedRetracement.retracementId);
	
	    const relatedyaxis = convertData(selectedRetracement.retracementValues, selectedRetracement.retracementId);
	    const yaxis = chartConfigSettings.yaxisAnnotation;
	
	    for (const newItem of relatedyaxis) {
	        yaxis.push(newItem);
	    }
	
	    chartConfigSettings.yaxisAnnotation = yaxis;
	    // Update the chart here if necessary
	    // updateSeriesChart(chartConfigSettings);
	
	    // Check if all toggles are hidden or if one is visible
	    const allHidden = selectedRetracement.retracementValues.every(value => value.hide === true);
	    const oneVisible = selectedRetracement.retracementValues.some(value => value.hide === false);
	
	    // Get the main toggle button
	    const $mainButton = $(`#toggleAllRetracements_${index}`);
	    const $mainIcon = $mainButton.find('i');
	
	    // If all individual toggles are hidden, set main toggle to "Hide All" state
	    if (allHidden) {
	        $mainIcon.removeClass('fa-eye').addClass('fa-eye-slash');
	        $mainButton.removeClass('green').addClass('hide');
	        selectedRetracement.retracementParameter.hideAll = true; // Update state
	    }
	
	    // If at least one toggle is visible, set main toggle to "Show All" state
	    if (oneVisible) {
	        $mainIcon.removeClass('fa-eye-slash').addClass('fa-eye');
	        $mainButton.removeClass('hide').addClass('green');
	        selectedRetracement.retracementParameter.hideAll = false; // Update state
	    }
	
	    // Save the updated retracement state
	    saveRetracementHistory(index);
	});
		
		document.addEventListener('click', function(event) {
	    if (event.target.classList.contains('retracement-start-date') || event.target.classList.contains('retracement-end-date')) {
			        const cell = event.target;
			        const table = cell.closest('table');
			        const tableId = table.getAttribute('id');
			        selectedstartCellId = cell.getAttribute('id');
			        const cellContent = cell.textContent;
			        const dateValue = cellContent === "" ? new Date() : parseDate(cellContent);
			        $('#retracementEditDate_' + tableId.split("_")[1]).jqxDateTimeInput({ value: dateValue });
			        $('#retracementEditDate_' + tableId.split("_")[1]).jqxDateTimeInput('open');
		    
		    }
		});
		//resultss=mergeData(results, retracementData);

 		processGraphHistory();
}
function toggleAllRetracements(retracementId, currentHideAllState) {
    const button = $(`#toggleAllRetracements_${retracementId}`);
    const icon = button.find('i');
    const isHidden = currentHideAllState;

    // Toggle button state
    icon.toggleClass('fa-eye fa-eye-slash');
    button.toggleClass('green hide');
    
    // Update all retracement values
    retracement.forEach(item => {
        if (item.retracementId === retracementId) {
            item.retracementValues.forEach(value => {
                value.hide = !isHidden;
            });
            item.retracementParameter.hideAll = !isHidden; // Update the hideAll state
        }
    });

    // Update the visibility of individual buttons
    $(`#retracement${retracementId} .toggleRetracement`).each(function() {
        const $btn = $(this);
        const $btnIcon = $btn.find('i');
        if (!isHidden) {
            $btnIcon.removeClass('fa-eye').addClass('fa-eye-slash');
            $btn.removeClass('green').addClass('hide');
        } else {
            $btnIcon.removeClass('fa-eye-slash').addClass('fa-eye');
            $btn.removeClass('hide').addClass('green');
        }
    });

    // Reflect changes in the chart
    const selectedRetracement = retracement.find(item => item.retracementId === retracementId);
    chartConfigSettings.yaxisAnnotation = removeById(chartConfigSettings.yaxisAnnotation, "retracementId", selectedRetracement.retracementId);

    if (!isHidden) {
        const relatedyaxis = convertData(selectedRetracement.retracementValues, selectedRetracement.retracementId);
        relatedyaxis.forEach(newItem => chartConfigSettings.yaxisAnnotation.push(newItem));
    }

    updateSeriesChart(chartConfigSettings);
    saveRetracementHistory(retracementId); // Save updated state to the database
}
function drawRelevantTable(data){
		$("#relevant-grid").empty();
		 var relevantGrid = '';
		 var relevantId;
     data.forEach(item => {
		 relevantId =item.relevantId;
		 const relevantParameter = item.relevantParameter;
		 const relevantValues = (relevantParameter==null)?false:relevantParameter.startDate!='' && relevantParameter.endDate!='';
		 const startDate = relevantParameter!= null ?relevantParameter.startDate:"";
		 const startPrice = relevantParameter!= null ?relevantParameter.startPrice:"";
		 const endDate = relevantParameter!= null ?relevantParameter.endDate:"";
		 const endPrice = relevantParameter!= null ?relevantParameter.endPrice:"";
		 const color = relevantParameter!= null ?relevantParameter.color?relevantParameter.color:"rgba(255, 0, 0, 1)":"rgba(255, 0, 0, 1)";
		 
		 const Hide = item.isHidden;

		 const dbId = item.dbId; 
		//  const dbId = 1;
		 relevantGrid += `
		  <div class='col-12 pl-0 d-flex pt-1 pb-1' id='relevant${relevantId}'>
			 <div class='col-11 pl-0 pr-1'>
		      <table id='relevantTable_${relevantId}' class='relevant-table'>
		        <thead>
		          <tr>
		            <th class='pl-0 d-flex' style='width: 139% !important;'>
		              <div id='relevantEditDate_${relevantId}'> </div>
		              <button class='btn btn-light-secondary mr-1 mb-1 edit-table' type='button' onclick='editrelevants("",${relevantId})'>
		                <img src='/img/icon/calendar.svg' width='16' height='16' style=''>
		              </button>
		              <span class='pt-2'>RELEVANT POINTS</span>
		            </th>
		          </tr>
		        </thead>
		        <tbody>
		          <tr>
		            <td>Start Price</td>
		            <td>Start date</td>
		          </tr>
		          <tr>
		            <td class='grey-cell' id='relevantStartPrice_${relevantId}'>${startPrice}</td>
		            <td class='grey-cell relevant-start-date col-4' id='relevantStart_${relevantId}'>${startDate}</td>
		          </tr>						
		          <tr>
		            <td>End Price</td>
		            <td>End date</td>
		          </tr>
		          <tr>
		            <td class='grey-cell ' id='relevantEndPrice_${relevantId}'>${endPrice}</td>
		            <td class='grey-cell relevant-end-date' id='relevantEnd_${relevantId}'>${endDate}</td>
		          </tr>						        
		        </tbody>
		        </table>
		      </div>
		       ${relevantValues ? `
		    	<div class='d-flex align-items-start flex-column bd-highlight' style='height: fit-content;'>
		         <div class='bd-highlight'>
		            ${typeof dbId !== 'undefined' ? `
		             ${Hide !== true ? `
		                <button id='togglerelevant_${relevantId}' class='toggleRelevant btn btn-light-secondary mr-1  green'>
		                  <i class='far fa-eye white'></i>
		                </button>` : `
		                <button id='togglerelevant_${relevantId}' class='toggleRelevant btn btn-light-secondary mr-1  hide'>
		                  <i class='far fa-eye-slash white'></i>
		                </button>
		               `}
		              ` : ""}
		          </div>
		          <div class='mb-auto bd-highlight'>
		          ${typeof dbId !== 'undefined' ? `
		             <button class='btn btn-light-secondary mr-1 mt-1 red' type='button' onclick='deleteRelevantHistory(${dbId}, ${relevantId})'>
		              <img src='/img/icon/delete.svg' width='16' height='16'>
		            </button> 
	                <div class="dropdown" data-id="${relevantId}">
			        <button class="btn btn-outline-secondary dropdown-toggle mr-1 mt-1 border-0 p-0" type="button" id="colorDropdown${relevantId}" data-bs-toggle="dropdown" aria-expanded="false" style=" height: 30px;" >
			            <div id="selectedColor" class="selected-color-option" style="background-color: ${color};"></div>
			        </button>
				        <ul class="dropdown-menu dropdown-color-style" aria-labelledby="colorDropdown${relevantId}">
				            <li>
				                <button class="color-option" data-color="rgba(255, 0, 0, 0.5)" style="background-color: rgba(255, 0, 0, 1);"></button>
				                <button class="color-option" data-color="rgba(0, 128, 0, 0.5)" style="background-color: rgba(0, 128, 0, 1)"></button>
				                <button class="color-option" data-color="rgba(255, 165, 0, 0.5)" style="background-color: rgba(255, 165, 0, 1)"></button>
				                
				            </li>
				        </ul>
			    	</div>` : `
		            <button class='btn btn-light-secondary mr-1 mb-1 green' type='button' onclick='saveRelevantHistory(${relevantId})'>
		              <img src='/img/icon/save.svg' width='16' height='16'>
		            </button>
		            <button class='btn btn-light-secondary mr-1 mb-1 blue' type='button' onclick='cancelRelevant(${relevantId})'>
		              <img src='/img/icon/false.svg' width='16' height='16'>
		            </button>
		            `} 
		        </div>
		          ` : `<div class='d-flex align-items-start flex-column bd-highlight' style='height: fit-content;'>
		          		<div class='mb-auto bd-highlight'>
			          		<button class='btn btn-light-secondary mr-1 mb-1 green' type='button' onclick='saveRelevantHistory(${relevantId})'>
				              <img src='/img/icon/save.svg' width='16' height='16'>
				            </button>
				            <button class='btn btn-light-secondary mr-1 mb-1 blue' type='button' onclick='cancelRelevant(${relevantId})'>
				              <img src='/img/icon/false.svg' width='16' height='16'>
				            </button>
			            	</div>
			            </div>`}
		     </div>
		  </div>`;
		});

		$("#relevant-grid").append(relevantGrid);
		
		
		
		data.forEach(item => {
			 let relevantId =item.relevantId;
			 
			 
	    $("#colorDropdown" + relevantId).click(function () {
		        $(this).dropdown("toggle");
		    });
		    
		 $(".color-option").click(function() {
			       var selectedColor = $(this).data("color");
				   var dropdown = $(this).closest(".dropdown");
    			   var dropdownId = dropdown.attr("data-id"); // Get the dropdown ID
				    
				    // Update the selected color display
				    dropdown.find("[id^='selectedColor']").css("background-color", selectedColor);
				    
				    // Close the dropdown menu
				    dropdown.find(".dropdown-toggle").dropdown("hide");
				    
				    let annotation = chart.w.config.annotations.yaxis.find(obj => obj.relevantId === parseInt(dropdownId));
			
					if (annotation) {
					    annotation.fillColor = selectedColor; // Change this to your desired color
					}
					relevant.find(obj => obj.relevantId === parseInt(dropdownId)).color=selectedColor;
					
					const url = '/graph/save-relevant-history'; 
			 		const filteredData = relevant.filter(data => data.relevantId === relevantId);
			    	const payload = filteredData.map(data => {
			        const relevantParameter = data.relevantParameter;
					const checkedItemValues = checkedItemId.filter(item => item != null);
					
			        let entity = {
								dbId: data.dbId,
					            graphId: checkedItemValues[0],
					            startDate: relevantParameter.startDate,
					            startPrice: relevantParameter.startPrice,
					            endDate: relevantParameter.endDate,
					            endPrice: relevantParameter.endPrice,
					            isHidden:data.isHidden,
					            screenName:screenName,
					            isShared:isShared,
					            color:filteredData[0].color !== undefined ? filteredData[0].color : "rgba(255, 0, 0, 0.5)"
					        };
					
					        return entity;
					    });
					
					    try {
					        const response =  fetch(url, {
					            method: 'POST',
					            headers: {
					                'Content-Type': 'application/json',
					            },
					            body: JSON.stringify(payload)
					        });
					
											if (response.ok) {
												const result = response.json();
									
												relevantData = result.reduce((acc, data) => {
									
													if (!acc[data.graphId]) {
														acc[data.graphId] = {
															relevant: [],
									
														};
													}
													const dbId = data.id;
													const color = data.color;
									
													relevant.forEach(obj => {
														if (obj.relevantId === relevantId) {
															obj.dbId = dbId; // Add the dbid field with the desired value
															obj.relevantParameter.color = color;
														}
													});
													relevant.forEach(obj => {
														acc[data.graphId].relevant.push({
															dbId: obj.dbId,
															relevantParameter: obj.relevantParameter,
															isHidden: obj.isHidden
														});
													});
													/*acc[data.graphId].relevant.push({dbId:dbId,
																			   relevantParameter:parameters,
																			   isHidden: data.isHidden});*/
									
									
													return acc;
									
												}, {});
									
												mergeRelevantData(results, relevantData);
									
							
									} else {
										throw new Error('Failed to save retracement history');
									}
								} catch (error) {
									console.error('Error:', error);
								}
					
			   		chart.updateOptions(chart.w.config);
			    });
			    
		
			 
		$("#relevantEditDate_" + relevantId).jqxDateTimeInput({ min: source[0].minDate, max: source[0].maxDate, width: '0px', height: '0px', theme: 'dark' });
		$("#inputrelevantEditDate_" + relevantId).css("padding", "0");

		$("#relevantEditDate_" + relevantId).on('valueChanged', async function(event) {
			 const selectedId = selectedstartCellId.split("_")[1];
   			 const selectedColumn = selectedstartCellId.split("_")[0];
   				var jsDate = event.args.date;
				//	jsDate = jsDate<=event.owner.minDate.dateTime?event.owner.minDate.dateTime:jsDate;
   			 
   			 const json = chartResponse.filter(obj => obj.x === formatTrendlineDate(jsDate));
			 if (selectedColumn == "relevantStart" || selectedColumn == "relevantEnd") {
			        const startDate = parseDate($('#relevantStart_' + selectedId).text());
			        const endDate = parseDate($('#relevantEnd_' + selectedId).text());
			        const priceId = selectedColumn == "relevantStart" ? "relevantStartPrice_" : "relevantEndPrice_";
			
			        if ((selectedColumn == "relevantStart" && jsDate > endDate) ||
			            (selectedColumn == "relevantEnd" && jsDate < startDate) ||
			            typeof json[0] === 'undefined') {
			            const message = selectedColumn == "relevantStart" ? "The start date must be earlier than the end date." :
			                "The end date must be later than the start date.";
			            $('#alertLimitation-modal').modal('show');
			            $("#alertTextLimitation").empty().append("<p>" + message + "</p>");
			            return;
			        }
			        	
			  
			        $('#' + selectedstartCellId).text(formatTrendlineDate(jsDate));
			        $('#' + priceId + selectedId).text(parseFloat(json[0].y).toFixed(getFormatResult0[0]));
			         
				   const parameters={
					   startPrice:$("#relevantStartPrice_"+ relevantId).text(),
					   endPrice: $("#relevantEndPrice_"+ relevantId).text(),
					   startDate:$("#relevantStart_"+ relevantId).text(),
					   endDate: $("#relevantEnd_"+ relevantId).text()
				   }
				   
				   
				 for (var i = 0; i < relevant.length; i++) {
					   if (relevant[i].relevantId === relevantId) {
						        relevant[i].relevantParameter = parameters;
						        if(parameters.startPrice !='' && parameters.endPrice!='' )
						      		 drawRelevant(parameters,relevantId);
						      	if(typeof relevant[i].dbId!='undefined')
						      		saveRelevantHistory(relevantId);
								break;
						  }
					  }
				      updateSeriesChart(chartConfigSettings);

				    }
			   			 
				});
	
		});
			$(".toggleRelevant").click(function() {
		    const $button = $(this);
		    const $icon = $button.find('i');
		    const index = parseFloat($button.attr('id').split("_")[1]);
		    const key = $button.attr('id').split("_")[2];
		    const isHidden = $icon.hasClass('fa-eye');
		
		    $icon.toggleClass('fa-eye fa-eye-slash');
		    
		    $button
		        .attr('title', isHidden ? 'Show' : 'Hide')
		        .attr('aria-label', isHidden ? 'Show' : 'Hide')
		        .toggleClass('green', !isHidden)
		        .toggleClass('hide', isHidden)
		        .toggleClass('red', isHidden);
		 
		      relevant.forEach(Relevant => {
				    if (Relevant.relevantId === index) {
						Relevant.isHidden=!Relevant.isHidden;
				    }
				  });
				  
			  const selectedRelevant = relevant.find(item => item.relevantId === index)  ;
		      saveRelevantHistory(index); 
		      drawRelevant(selectedRelevant.relevantParameter,selectedRelevant.relevantId);
			  updateSeriesChart(chartConfigSettings);
	
		});
		document.addEventListener('click', function(event) {
	    if (event.target.classList.contains('relevant-start-date') || event.target.classList.contains('relevant-end-date')) {
			        const cell = event.target;
			        const table = cell.closest('table');
			        const tableId = table.getAttribute('id');
			        selectedstartCellId = cell.getAttribute('id');
			        const cellContent = cell.textContent;
			        const dateValue = cellContent === "" ? new Date() : parseDate(cellContent);
			        $('#relevantEditDate_' + tableId.split("_")[1]).jqxDateTimeInput({ value: dateValue });
			        $('#relevantEditDate_' + tableId.split("_")[1]).jqxDateTimeInput('open');
		    
		    }
		});
		//resultss=mergeData(results, retracementData);

}
function cancelTrendline(trendlineId) {

	trendLines = removeById(trendLines,"trendLineId", trendlineId);

	trendlineSeries = removeById(trendlineSeries,"trendLineId", trendlineId);

	serieArray = removeById(serieArray,"trendLineId", trendlineId);

	drawTrendLineTable(trendLines);
	
	updateSeriesChart(chartConfigSettings);
	
}
function cancelRetracement(retracementId){
	
	retracement=removeById(retracement,"retracementId", retracementId);
	chartConfigSettings.yaxisAnnotation=removeById(chartConfigSettings.yaxisAnnotation,"retracementId", retracementId);
	updateSeriesChart(chartConfigSettings);
	drawRetracementTable(retracement);

}
function cancelRelevant(relevantId){
	
	relevant=removeById(relevant,"relevantId", relevantId);
	chartConfigSettings.yaxisAnnotation=removeById(chartConfigSettings.yaxisAnnotation,"relevantId", relevantId);
	updateSeriesChart(chartConfigSettings);
	drawRelevantTable(relevant);

}
function cancelChannelline(channelLineId){
	
	
	
	trendlineSeries=removeById(trendlineSeries, "channelId", channelLineId);
	serieArray=removeById(serieArray, "channelId", channelLineId);
	channelLines=removeById(channelLines, "channelId", channelLineId);
	
	drawTrendLineTable(trendLines);
    updateSeriesChart(chartConfigSettings);
}

function countDataPointsBetweenDates(startDate, endDate) {
    // Count data points between dates
    let count = 0;
    for (const item of chartResponse) {
        const itemDate = item.x; // Date is already in string format
        if (parseDate(itemDate) >= parseDate(startDate) && parseDate(itemDate) <= parseDate(endDate) ) {
            count++;
        }
    }
    return count;
}
function resetParameters(){
			$("#startDate").val("");
			$("#crossDate").val("");
			$("#startValue").val("");
			$("#crossValue").val("");
}

function updateSeriesChart(chartConfigSettings){

		const lastSeries = serieArray[serieArray.length - 1];
		const allValues = (lastSeries?.data || []).flatMap(p =>
		Array.isArray(p.y) ? p.y.map(Number) : p.y != null ? [Number(p.y)] : []
		);

		const filtered = allValues.filter(v => !isNaN(v) && v !== 0);
		if (filtered.length === 0) return;

		// 2. Compute global min/max
		const min = Math.min(...filtered);
		const max = Math.max(...filtered);


		 const values = addMarginToMinMax(min, max, 5);

	     var valueMin = values;
	     var valueMax = values; 	
	     var calculatedMinValue = Math.sign(min) == -1 ? -Math.abs(min) - valueMin : Math.abs(min) - valueMin;
	       //   graphService=typeof graphService!='undefined'?graphService:'';
	        // calculatedMinValue = PositiveGraphs.includes(graphService)?( Math.sign(calculatedMinValue) == -1 ?0:calculatedMinValue): calculatedMinValue;
	     	 calculatedMinValue =  (Math.sign(calculatedMinValue) == -1 && !(Math.sign(min)==-1) )? 0: calculatedMinValue;

		const margin = (max - min) * 0.05;
		const minValue = (min - margin > 0) ? min - margin : 0;
		const maxValue = max + margin;


	      if (serieArray.length==1) 
          disableChartType(false);
          else
          disableChartType(true);
          
          $('#legendfalse').addClass("active");
		  $('#legendtrue').removeClass("active");
		  markerSize=selectedChartMarkerID==null?markerSize:selectedChartMarkerID;
		  
				chartOpacity = typeof chartOpacity=='undefined'?eval(checkActiveChartColorTransparency($("#chartColorTransparency").find(".active")[0],'1')):SelectedChartTransparency;
				chartOpacity = typeof chartOpacity=='undefined'?chartTransparency:chartOpacity;
				chart.updateOptions({
					chart: {
			width: '100%',
			toolbar: {
				show: true,
				offsetX: -50,
				offsetY: 0,
				tools: {
					download: false,
					selection: true,
					zoom: true,
					zoomin: true,
					zoomout: true,
					pan: true,
					reset: true | '<img src="/static/icons/reset.png" width="20">',
					customIcons: []
				}
			},
			height: chartHeight,
			type: 'line',
			animations: { enabled: false },
			redrawOnParentResize: false
		},
				series:serieArray,
				title: {
					text: title,
					align: 'center',
					margin: 0,
					offsetY: 20,
					style: {
						fontWeight: 'bold',
					},
				},
				subtitle: {
							text: 'copyright LibVol.com',
							align: 'right',
							margin: 0,
							offsetX: -50,
							offsetY: 30,
							floating: false,
							style: {
								fontSize: '10px',
								fontWeight: 'normal',
								color: '#9699a2'
							},
						},
						xaxis: {
						labels: {
							rotate: -70,
							rotateAlways: true,
							minHeight: 30,
							style: {
								fontSize: '12px',
							},
							formatter: function(value, timestamp, opts) {
								
								let a = [{day: 'numeric'}, {month: 'short'}, {year: '2-digit'}];
								let s =  (isTimestamp(value))?join(value, a, '-'):value;
								
					            return s;
					          }
						},
						type: 'datetime',
						tickAmount: 19,
						axisBorder: {
							show: true,
							color: '#ffffff',
							height: 3,
							width: '100%',
							offsetX: 0,
							offsetY: 0
						},
					},
					 fill: {
					   type:'solid',
			      	   opacity: (serieArray.length==2) ?[1,chartOpacity]  
			      	     :(serieArray.length==3)? [1, 1,chartOpacity]
			      	     :(serieArray.length==4)? [1, 1, 1,chartOpacity] 
						 :(serieArray.length==5)? [1, 1, 1, 1,chartOpacity]
						 :(serieArray.length==6)? [1, 1, 1, 1, 1,chartOpacity] 
						 :(serieArray.length==7)? [1, 1, 1, 1, 1, 1,chartOpacity]
						 :[chartOpacity],
					},
					stroke: {
						//colors: chartConfigSettings.chartType1 == "area" ? ["#ffffff"] : [chartConfigSettings.chartColor == '#44546a' ? '#2e75b6' : chartConfigSettings.chartColor],
						colors: (serieArray.length==2) ?["#FF0000","#FFFFFF",]  : (serieArray.length==3)? ["#FF0000","#FF0000","#FFFFFF",] : (serieArray.length==4)? ["#FF0000","#FF0000","#FF0000","#FFFFFF",] 
						 :(serieArray.length==5)? ["#FF0000","#FF0000","#FF0000","#FF0000","#FFFFFF",] 
						 :(serieArray.length==6)? ["#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FFFFFF",] 
						 :(serieArray.length==7)? ["#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FF0000","#FFFFFF",] 
						 :["#FFFFFF"],
						width: 2.25,
					},
					markers: {
						colors: chartConfigSettings.chartType1 == "area" ? "#ffffff" : [chartConfigSettings.chartColor == '#44546a' ? '#2e75b6' : chartConfigSettings.chartColor],
						strokeColors: chartConfigSettings.chartType1 == "area" ? "#ffffff" : [chartConfigSettings.chartColor == '#44546a' ? '#2e75b6' : chartConfigSettings.chartColor],
						 size: serieArray.length >= 2 
						    ? [...new Array(serieArray.length - 1).fill(0), parseFloat(markerSize) ] 
						    : [parseFloat(markerSize)],
					},
					extra: {
						isDecimal: chartConfigSettings.isdecimal,
						yAxisFormat: chartConfigSettings.yaxisformat,
					},
					yaxis: {
						labels: {
							minWidth: 75, maxWidth: 75,
							style: {
								fontSize: checkActiveFontSize($("#fontOptions").find(".active")[0], '12px'),
							},
							 formatter: function(val, index) {
							 if (chartConfigSettings.yAxisFormat[1])
			  				  return  val.toFixed(chartConfigSettings.yAxisFormat[0]);
			  					else 
			  				  return  val.toFixed(chartConfigSettings.yAxisFormat[0]) + "%";
						      }
						},
						tickAmount: 6,
						min: minValue,
						max: maxValue,
						axisBorder: {
							width: 3,
							show: true,
							color: '#ffffff',
							offsetX: 0,
							offsetY: 0
						},
					},
					tooltip: {
						x: {
							show: false,
						},
						y: {
							formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
								if (chartConfigSettings.getFormatResult0[1])
									return value.toFixed(chartConfigSettings.getFormatResult0[0]);
								else
									return value.toFixed(chartConfigSettings.getFormatResult0[0]) + "%";
							},
							title: {
								formatter: (seriesName) => '',
							},
						},
					},
					legend: {
					   show:false,
			    	  },
			    	  annotations: {
						  yaxis: chartConfigSettings.yaxisAnnotation,
						  }
			    	  
				});
				

}

function removeById(dataArray, key, id) {
    return dataArray.filter(obj => obj[key] !== id);
}

function saveShowHideChannel(channelId,isVisible){
	        var channelLine=channelLines.filter(obj => obj.channelId === channelId)[0];
			
			graphHistory = {
				 "dbId":channelLine.dbid,
				 "isVisibleChannel":isVisible,
			};
          	$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: "/graph/save-visible-channel",
				data: JSON.stringify(graphHistory),
				dataType: 'json',
				timeout: 600000,
				success: function(response) {
					
				},
				error: function(e) {

					console.log("ERROR : ", e);

				}
			});
}
function saveShowHideTrendline(trendLineId,isVisible){
	        var trendLine=trendLines.filter(obj => obj.trendLineId === trendLineId)[0];
			
			graphHistory = {
				 "dbId":trendLine.dbid,
				 "isVisibleTrendline":isVisible,
			};
          	$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: "/graph/save-visible-trendline",
				data: JSON.stringify(graphHistory),
				dataType: 'json',
				timeout: 600000,
				success: function(response) {
					
				},
				error: function(e) {

					console.log("ERROR : ", e);

				}
			});
}
function saveTrendLinesHistory(trendLineId){
		var checkedItemValues=[];
		for (i = 0; i < checkedItemId.length; i++) {
				if (checkedItemId[i] != null)
					checkedItemValues.push(checkedItemId[i]);
			}
			graphHistory = {
				"isShared":isShared,
				 "dbId":(typeof (JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0].dbid))!='undefined')?JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0].dbid):null,
				 "graphId": checkedItemValues[0],
				 "trendlines": JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0]),
				 "chartOptions":JSON.stringify({chartType1:$("#chartTypes").find(".active")[0].id,
				 		         chartColor:chartType1=='line'?"#ffffff":$("#chartColor").find(".active")[0].id,
				 		         chartTransparency:$("#chartColorTransparency").find(".active")[0].id,
				 		         markerSize: $("#chartMarker").find(".active")[0].id,
				 		         fontsize: $("#fontOptions").find(".active")[0].id,
				 		         showGrid: $("#gridOptions").find(".active")[0].id,
				 		         showLegend: $("#gridLegend").find(".active")[0].id
				 				}),
				 "screenName":screenName				
			};
            const graphExist = results.some(item => item.graphId === checkedItemValues[0]);
           if(graphExist==true)
			savetrendlinedata(graphHistory);
			else if (results.length<5)
				savetrendlinedata(graphHistory);
		   else {
			   $('#alertLimitation-modal').modal('show');
			   $("#alertTextLimitation").empty();

			   $("#alertTextLimitation").append("<p> Maximum reached: You cannot save more than 5 graphs. </p>");

		   }
}
function saveChannelHistory(trendLineId){
		var checkedItemValues=[];
		for (i = 0; i < checkedItemId.length; i++) {
				if (checkedItemId[i] != null)
					checkedItemValues.push(checkedItemId[i]);
			}
			graphHistory = {
				 "dbId":(typeof (JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0].dbid))!='undefined')?JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0].dbid):null,
				 "graphId": checkedItemValues[0],
				 "trendlines": JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0]),
				 "channel": JSON.stringify(channelLines.filter(obj => obj.trendLineId === trendLineId)[0]),
				 "chartOptions":JSON.stringify({chartType1:$("#chartTypes").find(".active")[0].id,
				 		         chartColor:chartType1=='line'?"#ffffff":$("#chartColor").find(".active")[0].id,
				 		         chartTransparency:$("#chartColorTransparency").find(".active")[0].id,
				 		         markerSize: $("#chartMarker").find(".active")[0].id,
				 		         fontsize: $("#fontOptions").find(".active")[0].id,
				 		         showGrid: $("#gridOptions").find(".active")[0].id,
				 		         showLegend: $("#gridLegend").find(".active")[0].id
				 				}),
				"screenName":screenName,
				isShared: isShared ,

			};
            const graphExist = results.some(item => item.graphId === checkedItemValues[0]);
           if(graphExist==true)
			savetrendlinedata(graphHistory);
			else if (results.length<1)
				savetrendlinedata(graphHistory);
		   else {
			   $('#alertLimitation-modal').modal('show');
			   $("#alertTextLimitation").empty();

			   $("#alertTextLimitation").append("<p> You cannot save more than 1 Channel </p>");

		   }
}
async function getTrendLinesHistory(){
	   const chartId=2
	   const checkedItemIds = getCheckedItems(chartId);
	
		const metadataList = checkedItemIds.map(fullId => {
		const cleanId = fullId.replace(`-chart-${chartId}`, '');
		return itemValue[cleanId];
	}).filter(Boolean);
	
	if (metadataList.length === 0) {
		console.error("At least one valid series is required.");
		return;
	}
	const sorted = [...metadataList];
    
	const from = document.getElementById(`dateFrom-chart${chartId}`).value;
	const to = document.getElementById(`dateTo-chart${chartId}`).value;
    let  period = getChartPeriod();
    
	const params = {
		fromdate: from,
		todate: to,
		period: period,
		type: '3'
	};

	sorted.forEach((meta, index) => {
		params[`subGroupId${index + 1}`] = meta.subGroupId;
		params[`groupId${index + 1}`] = meta.GroupId;
		params[`removeEmpty${index + 1}`] = false;
	});
	
	const result = await getTrendLinesHistoryAsync(screenName);
		
	ChartManager.instances['chart2'].loadDataWithOverlays({
			service: "cryptos",
			api: "/cryptos/getgraphdatabytype",
			name: "Technical Chart",
			removeEmpty: true,
			saveHistory: true,
			params,
			result: result
		});
}
function getTrendLinesHistoryAsync(screenName) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `/graph/find-trendline-history-by-userid-screen-name/${screenName}/${isShared}`,
			dataType: 'json',
			success: function(data) {
				const groupedData = data.reduce((acc, obj) => {
					if (!acc[obj.graphId]) {
						acc[obj.graphId] = {
							trendlines: [],
							channelLines: [],
							chartOptions: JSON.parse(obj.chartOptions)
						};
					}

					const trendline = JSON.parse(obj.trendlines);
					const channelline = JSON.parse(obj.channel);
					trendline.dbid = obj.id;
					trendline.hidden = obj.isVisibleTrendline ?? false;
					if (trendline) acc[obj.graphId].trendlines.push(trendline);

					if (channelline) {
						channelline.dbid = obj.id;
						channelline.hidden = obj.isVisibleChannel ?? false;
						acc[obj.graphId].channelLines.push(channelline);
					}

					return acc;
				}, {});

				// Step 2: Retracement
				$.ajax({
					url: `/graph/find-retracement-history-by-userid-screen-name/${screenName}/${isShared}`,
					dataType: 'json',
					success: function(retracementRes) {
						 retracementData = retracementRes.reduce((acc, data) => {
							if (!acc[data.graphId]) acc[data.graphId] = [];

							const retracementDataObj = {
								'10%': parseFloat(data.percentage10),
								'25%': parseFloat(data.percentage25),
								'33%': parseFloat(data.percentage33),
								'38%': parseFloat(data.percenetage38),
								'50%': parseFloat(data.percentage50),
								'62%': parseFloat(data.percentage62),
								'66%': parseFloat(data.percentage66),
								'75%': parseFloat(data.percentage75)
							};

							const retracementDataHide = {
								'10%': data.hidePercentage10,
								'25%': data.hidePercentage25,
								'33%': data.hidePercentage33,
								'38%': data.hidePercenetage38,
								'50%': data.hidePercentage50,
								'62%': data.hidePercentage62,
								'66%': data.hidePercentage66,
								'75%': data.hidePercentage75
							};

							const parameters = {
								dbId: data.id,
								startPrice: data.startPrice,
								endPrice: data.endPrice,
								startDate: data.startDate,
								endDate: data.endDate,
								hideAll: data.hideAll
							};

							acc[data.graphId].push({
								dbId: data.id,
								retracementData: retracementDataObj,
								retracementDataHide,
								retracementParameter: parameters
							});
							return acc;
						}, {});

						// Step 3: Relevant
						$.ajax({
							url: `/graph/find-relevant-history-by-userid-screen-name/${screenName}/${isShared}`,
							dataType: 'json',
							success: function(relevantRes) {
								 relevantData = relevantRes.reduce((acc, data) => {
									if (!acc[data.graphId]) acc[data.graphId] = { relevant: [] };

									const parameters = {
										dbId: data.id,
										startPrice: data.startPrice,
										endPrice: data.endPrice,
										startDate: data.startDate,
										endDate: data.endDate,
										color: data.color
									};

									acc[data.graphId].relevant.push({
										dbId: data.id,
										relevantParameter: parameters,
										isHidden: data.isHidden
									});
									return acc;
								}, {});

								// Final merge
								let results = Object.keys(groupedData).map(graphId => ({
									graphId: graphId,
									trendlines: groupedData[graphId].trendlines,
									channelLines: groupedData[graphId].channelLines,
									chartOptions: groupedData[graphId].chartOptions,
									relevant: [],
								}));

								mergeRetracementData(results, retracementData);
								mergeRelevantData(results, relevantData);

								resolve(results);
							},
							error: reject
						});
					},
					error: reject
				});
			},
			error: reject
		});
	});
}

function processGraphHistory(){

			$("#graphs-history").empty(); 
		
			var condition ="";
		if(results.length!=0)
			{results.forEach((result, index) => {
			    // Get the graphId, subGroupId, and GroupId
			    const graphId = result.graphId;
			    const subGroupId = itemValue[graphId].subGroupId;
			    const GroupId = itemValue[graphId].GroupId;
			
			    // Push the group and subgroup ids to the groupIds array
			    result.groupSubgroupId = [GroupId, subGroupId];
			    
			    condition+=" ( subgroup_id="+subGroupId+" and group_id="+GroupId+" ) ";
				if(index+1<results.length)
					condition+=" or ";
				
			});
	
		$.ajax({
			    type: "GET",
  				  url: `/graph/configurations?condition=${encodeURIComponent(condition)}`,
			   
			    dataType: "json",
			    success: function(response) {
				var graphHistory="";
					
			        results.forEach((item1) => {
				    const matchingItem = response.find((item2) => item1.groupSubgroupId[0] === item2.groupId && item1.groupSubgroupId[1] === item2.subgroupId);
				
				    if (matchingItem) {
				        item1.displayDescription = matchingItem.displayDescription;
				    }
				    graphHistory +="<div class='justify-content-between d-flex bb'><a href='#' class='p-2' onclick=\"getGraphTrendLine('"+item1.graphId+"')\"><h8 class=' truncate-text '>"+item1.displayDescription+"</h8></a><button class='btn btn-light-secondary mr-1 mb-1 small' type='button' onclick=\"deleteGraphHistory('"+item1.graphId+"')\"><img src='/img/icon/delete-red.svg' width='14' height='14' ></button></div>"
				
				});
				
				$("#graphs-history").append(graphHistory);
			    },
			    error: function(xhr, status, error) {
			        // Handle error
			        console.error("Error:", error);
			    }
			});
			}
}
function getRetracementHistory(){

	$.ajax({
		contentType: "application/json",
		url: "/graph/find-retracement-history-by-userid-screen-name/"+screenName+`/${isShared}`,
		dataType: 'json',
		async: true,
		cache: false,
		timeout: 600000,
		success: function(result) {
			
			 retracementData = result.reduce((acc, data) => {

			  if (!acc[data.graphId]) {
			    acc[data.graphId] = [];
			  }

			    const dbId = data.id;
				const startPrice = data.startPrice;
				const endPrice = data.endPrice;
				const startDate = data.startDate;
				const endDate = data.endDate;
				const hideAll = data.hideAll;
		       const retracementData = {'10%':parseFloat(data.percentage10),
									    '25%':parseFloat(data.percentage25),
									    '33%':parseFloat(data.percentage33),
										'38%':parseFloat(data.percenetage38),
										'50%':parseFloat(data.percentage50),
		 								'62%':parseFloat(data.percentage62),
										'66%':parseFloat(data.percentage66),
										'75%':parseFloat(data.percentage75)
										};
				const retracementDataHide = {'10%':data.hidePercentage10,
									    '25%':data.hidePercentage25,
									    '33%':data.hidePercentage33,
										'38%':data.hidePercenetage38,
										'50%':data.hidePercentage50,
		 								'62%':data.hidePercentage62,
										'66%':data.hidePercentage66,
										'75%':data.hidePercentage75,
										};						
		       const parameters={
				   dbId:dbId,
				   startPrice:startPrice,
				   endPrice:endPrice,
				   startDate:startDate,
				   endDate:endDate,
				   hideAll: hideAll
				   
			   }
						 
			  acc[data.graphId].push({dbId:dbId,
		       					 retracementData:retracementData,
		       					 retracementDataHide:retracementDataHide,
		       					 retracementParameter:parameters});
			  return acc;
			}, {});
			
		},
		error: function(e) {

			console.log("ERROR : ", e);

		}
	});
}
function transformTrendline(trendline) {
    const dataPoints = [];

    const { x1, y1, x2, y2, x3, y3 } = trendline;

    const date1 = new Date(x1);
    const date2 = new Date(x2);
    const date3 = new Date(x3);

    dataPoints.push({ x: formatDate(date1), y: parseFloat(y1) });
    dataPoints.push({ x: formatDate(date2), y: parseFloat(y2) });
    dataPoints.push({ x: formatDate(date3), y: parseFloat(y3) });

    return dataPoints;
}
function transformChannelLine(channelLine) {
    const dataPoints = [];

    const { xc, yc, x3, y3 } = channelLine;

    const date1 = new Date(xc);
    const date3 = new Date(x3);

    dataPoints.push({ x: formatDate(date1), y: parseFloat(yc) });
    dataPoints.push({ x: formatDate(date3), y: parseFloat(y3) });

    return dataPoints;
}
function deleteTrendLinesHistory(trendlinedb,trendline){
		$('#alertDeleteDataByDate-modal').modal('show');
		$("#alertTextDeleteDataByDate").empty();
		$("#deleteRecord").empty();
		$("#deleteRecord").append('<button type="button" class="btn btn-primary" onclick="deleteTrendLines('+trendlinedb+','+trendline+')">Delete Record</button>');
									        
		$("#alertTextDeleteDataByDate").append("<p> Are you sure you want to Delete this trendline record ?</p>");
}
function deleteChannellineHistory(trendlinedb,trendline){
		$('#alertDeleteDataByDate-modal').modal('show');
		$("#alertTextDeleteDataByDate").empty();
		$("#deleteRecord").empty();
		$("#deleteRecord").append('<button type="button" class="btn btn-primary" onclick="deleteChannelLine('+trendlinedb+','+trendline+')">Delete Record</button>');
									        
		$("#alertTextDeleteDataByDate").append("<p> Are you sure you want to Delete this Channel record ?</p>");
}
function deleteRetracementHistory(retracementdb,retracementId){
		$('#alertDeleteDataByDate-modal').modal('show');
		$("#alertTextDeleteDataByDate").empty();
		$("#deleteRecord").empty();
		$("#deleteRecord").append('<button type="button" class="btn btn-primary" onclick="deleteRetracement('+retracementdb+','+retracementId+')">Delete Record</button>');
									        
		$("#alertTextDeleteDataByDate").append("<p> Are you sure you want to Delete this retracement record ?</p>");
}
function deleteRelevantHistory(relevantdb,relevantId){
		$('#alertDeleteDataByDate-modal').modal('show');
		$("#alertTextDeleteDataByDate").empty();
		$("#deleteRecord").empty();
		$("#deleteRecord").append('<button type="button" class="btn btn-primary" onclick="deleteRelevant('+relevantdb+','+relevantId+')">Delete Record</button>');
									        
		$("#alertTextDeleteDataByDate").append("<p> Are you sure you want to Delete this relevant points record ?</p>");
}
function deleteTrendLines(trendlineDbId,trendline){
		
                    
			     $.ajax({
			             type : "DELETE",
			             url : '/graph/deletetrendline/' + trendlineDbId + '/' + $('#dropDownCryptoOptions').val(),
			             success: function (result) {   
							
							
							$("#graphs-history").empty(); 
						   getTrendLinesHistory();
					        $('#alertDeleteDataByDate-modal').modal('hide');
		
		 					$( "#successDelete" ).empty();
				 		    $( "#successDelete" ).append( "<p> Trendline has been deleted</p>" );
						
							$('#alertInfoDeleteDataByDate-modal').modal('show');  
			             },
			             error: function (e) {
			                 console.log(e);
			             }
			         });

}
function removeByDbId(data, dbIdToRemove) {
    // Iterate over each key in the data object
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            // Filter out the items with the matching dbId
            data[key] = data[key].filter(item => item.dbId !== dbIdToRemove);
        }
    }
    return data;
}
function deleteRetracement(retracementdbId,retracementid){
		
                    
			     $.ajax({
			             type : "DELETE",
			             url : '/graph/delete-retracement-by-id/' + retracementdbId+ '/' + $('#dropDownCryptoOptions').val(),
			             success: function (result) {   
							const checkedItemValues = checkedItemId.filter(item => item != null);
							retracementData = removeByDbId(retracementData, retracementdbId);
							
							if (retracementData[checkedItemValues]?.length === 0)
								{results  = results.filter(item => item.graphId != checkedItemValues);
								if (retracementData.hasOwnProperty(checkedItemValues)) {
								    delete retracementData[checkedItemValues];
								}
								}
							processRetracementData(retracementData, checkedItemValues);
						//	resultss=mergeData(results, retracementData);
							
							processGraphHistory();
					        $('#alertDeleteDataByDate-modal').modal('hide');
		
		 					$( "#successDelete" ).empty();
				 		    $( "#successDelete" ).append( "<p> Retracement has been deleted</p>" );
						
							$('#alertInfoDeleteDataByDate-modal').modal('show');  
			             },
			             error: function (e) {
			                 console.log(e);
			             }
			         });

}
function deleteRelevant(relevantdbId,relevantid){
		
                    
			     $.ajax({
			             type : "DELETE",
			             url : '/graph/delete-relevant-by-id/' + relevantdbId+ '/' + $('#dropDownCryptoOptions').val(),
			             success: function (result) {   
							const checkedItemValues = checkedItemId.filter(item => item != null);
							relevant = removeById(relevant,"relevantId", relevantid);
							chartConfigSettings.yaxisAnnotation=removeById(chartConfigSettings.yaxisAnnotation,"relevantId", relevantId);
							updateSeriesChart(chartConfigSettings);	
							processGraphHistory();
							drawRelevantTable(relevant);
							
							
					        $('#alertDeleteDataByDate-modal').modal('hide');
		
		 					$( "#successDelete" ).empty();
				 		    $( "#successDelete" ).append( "<p> Relevant points has been deleted</p>" );
						
							$('#alertInfoDeleteDataByDate-modal').modal('show');  
			             },
			             error: function (e) {
			                 console.log(e);
			             }
			         });

}
function deleteChannelLine(trendlineDbId,trendLineId){
		
                channelLines=[];
                var checkedItemValues=[];
		for (i = 0; i < checkedItemId.length; i++) {
				if (checkedItemId[i] != null)
					checkedItemValues.push(checkedItemId[i]);
			}
			graphHistory = {
				 "isShared":isShared,
				 "dbId":(typeof (JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0].dbid))!='undefined')?JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0].dbid):null,
				 "graphId": checkedItemValues[0],
				 "trendlines": JSON.stringify(trendLines.filter(obj => obj.trendLineId === trendLineId)[0]),
				 "channel": JSON.stringify(channelLines.filter(obj => obj.trendLineId === trendLineId)[0]),
				 "screenName":screenName,
				 "chartOptions":JSON.stringify({chartType1:$("#chartTypes").find(".active")[0].id,
				 		         chartColor:chartType1=='line'?"#ffffff":$("#chartColor").find(".active")[0].id,
				 		         chartTransparency:$("#chartColorTransparency").find(".active")[0].id,
				 		         markerSize: $("#chartMarker").find(".active")[0].id,
				 		         fontsize: $("#fontOptions").find(".active")[0].id,
				 		         showGrid: $("#gridOptions").find(".active")[0].id,
				 		         showLegend: $("#gridLegend").find(".active")[0].id
				 				})
			};
		
           	$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: "/graph/save-history",
				data: JSON.stringify(graphHistory),
				dataType: 'json',
				timeout: 600000,
				success: function(response) {
					$("#graphs-history").empty(); 
					$('#alertDeleteDataByDate-modal').modal('hide');

 					$( "#successDelete" ).empty();
		 		    $( "#successDelete" ).append( "<p> Channel has been deleted</p>" );
				
					$('#alertInfoDeleteDataByDate-modal').modal('show');  
							
					 getTrendLinesHistory();
				
				},
				error: function(e) {

					console.log("ERROR : ", e);

				}
			});
           
			    

}
function getGraphTrendLine(graphId) {
	$("#trendline-grid").empty();
	$("#retracement-grid").empty();

    $("#Clearfilter").click();
    checkedItemId = [];
    checkedItemId = [graphId];
    for (var j = 0; j < checkedItemId.length; j++) {
        $(checkedItemId[j]).jqxCheckBox({ checked: true });
    }
    // Call the callback function after completing the necessary operations
   $('#show').click();
}
function deleteGraphHistory(graphId){
		$('#alertDeleteDataByDate-modal').modal('show');
		$("#alertTextDeleteDataByDate").empty();
		$("#deleteRecord").empty();
		$("#deleteRecord").append("<button type='button' class='btn btn-primary' onclick=\"confirmdeleteGraphHistory('"+graphId+"')\">Delete Record</button>");
									        
		$("#alertTextDeleteDataByDate").append("<p> Are you sure you want to Delete this graph history record ?</p>");
}
function confirmdeleteGraphHistory(graphId){
		
			     $.ajax({
			             type : "DELETE",
			             url : '/graph/delete-graph-history/' +encodeURIComponent(graphId),
			             success: function (result) {  
							$("#graphs-history").empty(); 
							$("#trendline-grid").empty(); 
							$("#relevant-grid").empty(); 
							$("#retracement-grid").empty(); 
							 getTrendLinesHistory();
							
							const checkedItemValues = checkedItemId.filter(item => item != null);

							if (retracementData.hasOwnProperty(checkedItemValues)) {
								    delete retracementData[checkedItemValues];
								}
							 retracement = [];
					        retracementId = 1;
					        chartConfigSettings.yaxisAnnotation = [];
					        updateSeriesChart(chartConfigSettings);
        					
					        $('#alertDeleteDataByDate-modal').modal('hide');
		
		 					$( "#successDelete" ).empty();
				 		    $( "#successDelete" ).append( "<p> Graph History has been deleted</p>" );
						
							$('#alertInfoDeleteDataByDate-modal').modal('show');  
			             },
			             error: function (e) {
			                 console.log(e);
			             }
			         });

}
async function updateTrendLine(trendlineIdToUpdate){
	 	     let found=false,channelFound=false;
	 	     var result;
	 	     
			 count=countDataPointsBetweenDates(x1, x2);
	 	     const slope=(y2-y1)/count;
	 	     if(screenName=='CRYPTOS' || screenName=='CryptosAnalisys')
	 	     {
				result = findThirdPointNoMissingDates(x1, y1, x2, y2, x3, slope.toFixed(6),latestEndDate);

			  }
	 	     else
	 	     {
			result = findThirdPoint(x1, y1, x2, y2, x3, slope.toFixed(6),latestEndDate);
			 }
			
			 for (var i = 0; i < trendlineSeries.length; i++) {
				   if (trendlineSeries[i].trendLineId === parseFloat(trendlineIdToUpdate)) {
					        trendlineSeries[i].data = result.xyValues;
					        found = true;
						    break;
					  }
				  }
			 if(!found){
				 insertedTrendLineId = parseFloat(trendlineIdToUpdate);
				 trendlineSeries.push({
						trendLineId: insertedTrendLineId,
					    name: 'Trendline '+convertToRoman(insertedTrendLineId+1),
					    data: result.xyValues,
					    type:'line',
					    hidden: false
					  });
			 }  
		      serieArray = getSerriesData();
	          disableChartType(true);
	          
	          var json={
				  trendLineId:trendlineIdToUpdate,
				  x1:x1, 
				  y1:y1, 
				  x2:x2, 
				  y2:y2,
				  x3:x3,
				  y3:(result.xyValues[2].y).toFixed(3),
				  endValue:(result.endValue).toFixed(3),
				  slope:slope.toFixed(6)
			  }
			  	 for (var i = 0; i < trendLines.length; i++) {
				   if (trendLines[i].trendLineId === parseFloat(trendlineIdToUpdate)) {
					        trendLines[i].x1 = json.x1;
					        trendLines[i].y1 = json.y1;
					        trendLines[i].x2 = json.x2;
					        trendLines[i].y2 = json.y2;
					        trendLines[i].x3 = json.x3;
					        trendLines[i].y3 = json.y3;
					        trendLines[i].slope = json.slope;
					        trendLines[i].endValue = json.endValue;
					           if((typeof(trendLines[i].dbid)!='undefined'))
								  saveTrendLinesHistory(trendLines[i].trendLineId);
			 
					        channelFound = true;
						    break;
					  }
				  }
			  if(!channelFound)
			  {
				  insertedTrendLineId = parseFloat(trendlineIdToUpdate);
				  json={
				  trendLineId:insertedTrendLineId,
				  x1:x1, 
				  y1:y1, 
				  x2:x2, 
				  y2:y2,
				  x3:x3,
				  y3:(result.xyValues[2].y).toFixed(3),
				  endValue:(result.endValue).toFixed(3),
				  slope:slope.toFixed(6)
			  } 
			  }
	          drawTrendLineTable(trendLines);
			  resetParameters();
			 // updateSeriesChart(chartConfigSettings);
			
}
function updateChannelLine(channelidToUpdate){
	      const trendLine = trendLines.filter(obj => obj.trendLineId === parseFloat(channelidToUpdate.trendLineId))[0];
	 	var result 
	 	 if(screenName=='CRYPTOS' || screenName=='CryptosAnalisys')
	 	   result = findChannelPointNoMissingDates(channelidToUpdate.x3 , channelidToUpdate.yc, channelidToUpdate.xc, trendLine.slope, latestEndDate);
		else
		   result = findChannelPoint(channelidToUpdate.x3 , channelidToUpdate.yc, channelidToUpdate.xc, trendLine.slope, latestEndDate);

		
			 serieArray=[];
	         let channelId;
	         let channelIdDb;
	         
			  var json={
				  trendLineId:channelidToUpdate.trendLineId,
				  xc:channelidToUpdate.xc, 
				  yc:channelidToUpdate.yc, 
				  x3:channelidToUpdate.x3,
				  y3:(result.xyValues[1].y).toFixed(3),
				  endValue:(result.endValue).toFixed(3),
			  }
			  	 for (var i = 0; i < channelLines.length; i++) {
				   if (channelLines[i].trendLineId === parseFloat(channelidToUpdate.trendLineId)) {
					        channelLines[i].xc = json.xc;
					        channelLines[i].yc = json.yc;
					        channelLines[i].x3 = json.x3;
					        channelLines[i].y3 = json.y3;
					        channelLines[i].endValue = json.endValue;
					        channelId=channelLines[i].channelId;
					        channelIdDb=channelLines[i].dbid;
					        
					        if((typeof(channelLines[i].dbid)!='undefined'))
								  saveChannelHistory(channelLines[i].trendLineId);
			 
					        break; 
					  }
				  }
			 for (var i = 0; i < trendlineSeries.length; i++) {
				   if (trendlineSeries[i].channelId === parseFloat(channelId)) {
					        trendlineSeries[i].data = result.xyValues;
					  }
				  }
				  
		      serieArray = getSerriesData();
		       
	          disableChartType(true);
	     
			
	          drawTrendLineTable(trendLines);
			  resetParameters();
			  if(typeof channelIdDb =='undefined')
				  updateSeriesChart(chartConfigSettings);
			
}
function addChannelTrendLine(channelTrendline){
	     const trendLine = trendLines.filter(obj => obj.trendLineId === parseFloat(channelTrendline.trendLineId))[0];
	 	var result 
	 	 if(screenName=='CRYPTOS' || screenName=='CryptosAnalisys') 
	 	  	result = findChannelPointNoMissingDates(channelTrendline.x3 , channelTrendline.yc, channelTrendline.xc, trendLine.slope, latestEndDate);
			else
		  	result = findChannelPoint(channelTrendline.x3 , channelTrendline.yc, channelTrendline.xc, trendLine.slope, latestEndDate);

		 channelId=channelId+1;
	        
	         trendlineSeries.push({
				channelId: channelId,
			    name: 'Channel',
			    data: result.xyValues,
			    type:'line',
			    hidden: false
			  });
			  
			  serieArray = getSerriesData();
			  
	          disableChartType(true);
	         
	          var json={
				  channelId:channelId,
				  trendLineId:parseFloat(channelTrendline.trendLineId),
				  xc:channelTrendline.xc, 
				  yc:channelTrendline.yc, 
				  x3:channelTrendline.x3,
				  y3:(result.xyValues[1].y).toFixed(3),
				  endValue:(result.endValue).toFixed(3),
			  }
			  channelLines.push(json);
			
	          drawTrendLineTable(trendLines);
			  resetParameters();
			  updateSeriesChart(chartConfigSettings);
			
}
function initiateTrendLine(navigation){
			 var result = [];
			 serieArray=[];
	
	         const trendLineId = Math.max(...trendLines.map(item => item.trendLineId));
	         
	         trendlineSeries.push({
				channelId: (trendLineId==-Infinity?0:trendLineId)+1,
			    name: 'Trendline',
			    data: result,
			    type:'line',
			    hidden: false
			  });
			  
			  serieArray = getSerriesData();
		   
	          json={
				  trendLineId:(trendLineId==-Infinity?0:trendLineId)+1,
				  x1:null, 
				  y1:null, 
				  x2:null, 
				  y2:null,
				  x3:null,
				  y3:null,
				  slope:null,
				  endValue:null
				  	}
			  trendLines.push(json);
	          drawTrendLineTable(trendLines);
			  resetParameters();
			  if(navigation)
			   $('html,body').animate({
		        scrollTop: $("#trendline-grid").offset().top},
		        'slow');
}
function initiateRetracement(navigation) {
    const result = [];

    if (!Array.isArray(retracement)) {
        retracement = [];
    }

    let maxId = 0;
    for (const r of retracement) {
        if (r.retracementId > maxId) {
            maxId = r.retracementId;
        }
    }

    retracementId = maxId + 1;

    retracement.push({
        retracementId: retracementId,
        retracementValues: result,
        retracementParameter: null
    });

    drawRetracementTable(retracement);
	if(navigation)
    $('html,body').animate({
        scrollTop: $("#retracement-grid").offset().top
    }, 'slow');
}

function initiateRelevant(navigation){
			 const result = [];
			 
	         relevantId=relevantId+1;
	         relevant.push({relevantId:relevantId,
	       					 relevantValues:result,
	       					 relevantParameter: null,
	       					 isHidden:false});
	         drawRelevantTable(relevant);
			 if(navigation)
			   $('html,body').animate({
		        scrollTop: $("#relevant-grid").offset().top},
		        'slow');
} 
function drawLine(){
		 count=countDataPointsBetweenDates(x1, x2);
		 const slope=(y2-y1)/count;
		 if(screenName=='CRYPTOS' || screenName=='CryptosAnalisys')
			 var result =findThirdPointNoMissingDates(x1, y1, x2, y2, x3, slope.toFixed(6),latestEndDate);
			  else
		 	var result = findThirdPoint(x1, y1, x2, y2, x3, slope);
		
			 serieArray=[];
	
	          trendLineId=trendLineId+1;
	       
	          trendlineSeries.push({
				channelId: trendLineId,
			    name: 'Trendline',
			    data: result,
			    type:'line',
			    hidden: false
			  });
			  
			  serieArray = getSerriesData();
		   
	          disableChartType(true);
	          
	          json={
				  trendLineId:trendLineId,
				  x1:x1, 
				  y1:y1, 
				  x2:x2, 
				  y2:y2,
				  x3:x3,
				  y3:(result[2].y).toFixed(2),
				  slope:slope.toFixed(6)
			  }
			  trendLines.push(json);
	          drawTrendLineTable(trendLines);
			  resetParameters();
			  updateSeriesChart(chartConfigSettings);
			 
}
function savetrendlinedata(graphHistory) {
				$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: "/graph/save-history",
				data: JSON.stringify(graphHistory),
				dataType: 'json',
				timeout: 600000,
				success: function(response) {
					$("#graphs-history").empty(); 
					
					 getTrendLinesHistory();
				
				},
				error: function(e) {

					console.log("ERROR : ", e);

				}
			});
}
function formatTrendlineDate(date) {
    // Get the day, month, and year components of the date
    var day = date.getDate().toString().padStart(2, '0'); // Ensure two digits for day
    var monthIndex = date.getMonth();
    var year = date.getFullYear() % 100; // Extract last two digits of the year

    // Define arrays for month names and suffixes
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Construct the formatted date string
    var formattedDate = day + '-' + months[monthIndex] + '-' + year;

    return formattedDate;
}
function convertToRoman(num) {
    // Define arrays of Roman numeral letters and their corresponding values
    var romanNumerals = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
    var numeralValues = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];

    var result = ''; // Initialize an empty string to store the Roman numeral

    // Iterate through the numeralValues array
    for (var i = 0; i < numeralValues.length; i++) {
        // Repeat the current Roman numeral letter while the number is greater than or equal to its corresponding value
        while (num >= numeralValues[i]) {
            result += romanNumerals[i]; // Add the Roman numeral letter to the result
            num -= numeralValues[i]; // Subtract the corresponding value from the number
        }
    }

    return result;
}
function getSerriesData(){
	 serieArray=[];
	 serieArray.push({
             name: chartConfigSettings.response[0].config.displayDescription==null?itemValue[chartConfigSettings.checkedItemValues[0]].title:chartConfigSettings.response[0].config.displayDescription,
			 data: chartResponse,
             type: checkActiveChartType($("#chartTypes").find(".active")[0], chartType1, "d")
          });
       
	 for (var i = 0; i < trendlineSeries.length; i++) {
			 if(trendlineSeries[i].hidden!=true)
			 	serieArray.unshift(trendlineSeries[i]);	  
	 }
	 return serieArray;
}

async function updateLatestTrendLine(trendLines, newDateX3,originalEndDate, graphId) {
  const updatedTrendLines = [];
  let allDataAreLatest=true;
  for (let item of trendLines) {
	  channelLine=channelLines.filter(obj => obj.trendLineId === item.trendLineId)[0];
    // if (item.x3 !== newDateX3) {
      	item.x3 = newDateX3;
        allDataAreLatest=false; 
         if(screenName=='CRYPTOS' || screenName=='CryptosAnalisys')
			 var newItem =findThirdPointNoMissingDates(item.x1, item.y1, item.x2, item.y2, item.x3, item.slope, originalEndDate);
        else
        	var newItem = findThirdPoint(item.x1, item.y1, item.x2, item.y2, item.x3, item.slope, originalEndDate);
	   
	    item.y3  = newItem.xyValues[2].y//.toFixed(3);
        item.endValue = newItem.endValue;
    if(typeof channelLine !=='undefined')
     if(channelLine.x3 !== newDateX3){
		channelLine.x3 = newDateX3;
		 if(screenName=='CRYPTOS' || screenName=='CryptosAnalisys')
			var newItem =  findChannelPointNoMissingDates(channelLine.x3 , channelLine.yc, channelLine.xc,  item.slope, originalEndDate);
		else
			var newItem =  findChannelPoint(channelLine.x3 , channelLine.yc, channelLine.xc,  item.slope, originalEndDate);

		channelLine.y3  = newItem.xyValues[1].y.toFixed(3);
        channelLine.endValue = newItem.endValue;
		}
      updatedTrendLines.push({
				 "dbId":JSON.stringify(item.dbid),
				 "graphId": graphId,
				 "trendlines": JSON.stringify(item),
				 "isVisibleTrendline":JSON.stringify(item.hidden),
				 "channel": JSON.stringify(channelLine),
				 "isVisibleChannel":JSON.stringify((typeof channelLine !=='undefined')?channelLine.hidden:false),
				 "chartOptions":JSON.stringify({chartType1:$("#chartTypes").find(".active")[0].id,
				 		         chartColor:chartType1=='line'?"#ffffff":$("#chartColor").find(".active")[0].id,
				 		         chartTransparency:$("#chartColorTransparency").find(".active")[0].id,
				 		         markerSize: $("#chartMarker").find(".active")[0].id,
				 		         fontsize: $("#fontOptions").find(".active")[0].id,
				 		         showGrid: $("#gridOptions").find(".active")[0].id,
				 		         showLegend: $("#gridLegend").find(".active")[0].id
				 				})
			});
    
   // }
  } 
  updateJsonData(results, updatedTrendLines).then(results => {
					   	serieArray = getSerriesData();
						updateSeriesChart(chartConfigSettings);
								    
					});
  		//if(!allDataAreLatest)
  			if(1==2)
          	$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: "/graph/update-trendline-history",
				data: JSON.stringify(updatedTrendLines),
				dataType: 'json',
				timeout: 600000,
				success: function(response) {
					
				
				updateJsonData(results, updatedTrendLines).then(results => {
					   	serieArray = getSerriesData();
						updateSeriesChart(chartConfigSettings);
								    
					});
				//await getTrendLinesHistory();
				
				},
				error: function(e) {

					console.log("ERROR : ", e);

				}
			});
 	return Promise.resolve(allDataAreLatest);
}
async function updateJsonData(results, updatedTrendLines) {
    updatedTrendLines.forEach(newItem => {
        const { dbId, graphId, trendlines, isVisibleTrendline, channel, isVisibleChannel, chartOptions } = newItem;

        const originalItem = results.find(item => item.graphId === graphId);
        if (originalItem) {
            // Update trendline
            const newTrendline = typeof(trendlines)!='undefined'?JSON.parse(trendlines):null;
            const trendlineIndex = originalItem.trendlines.findIndex(t => t.dbid === dbId);
            if (trendlineIndex !== -1) {
                originalItem.trendlines[trendlineIndex] = newTrendline;
                originalItem.trendlines[trendlineIndex].hidden = isVisibleTrendline === "false";
            }

            // Update channel
            const newChannel = typeof(channel)!='undefined'?JSON.parse(channel):null;
            const channelIndex = originalItem.channelLines.findIndex(c => c.dbid === dbId);
            if (channelIndex !== -1) {
                originalItem.channelLines[channelIndex] = newChannel;
                originalItem.channelLines[channelIndex].hidden = isVisibleChannel === "false";
            }

            // Update chart options if provided
            if (chartOptions) {
                originalItem.chartOptions = JSON.parse(chartOptions);
            }
            trendLines=[];
			 channelLines=[];
			 serieArray=[];
			 trendlineSeries=[];
			 trendLineId=0;
			for (var i = 0; i < originalItem.trendlines.length; i++) {
					trendLineId=trendLineId+1;
					trendlineSeries.push({
						trendLineId: originalItem.trendlines[i].trendLineId,
					    name: 'Trendline '+convertToRoman(i+1),
					    data: transformTrendline(originalItem.trendlines[i]),
					    type:'line',
					    hidden: originalItem.trendlines[i].hidden
					  });
					  
					trendLines.push(originalItem.trendlines[i]);
				  }
				 
			for (var i = 0; i < originalItem.channelLines.length; i++) {
					channelId=originalItem.channelLines[i].channelId;
					trendlineSeries.push({
						channelId: originalItem.channelLines[i].channelId,
					    name: 'Channel',
					    data: transformChannelLine(originalItem.channelLines[i]),
					    type:'line',
					    hidden: originalItem.channelLines[i].hidden
					  });
			          
					  channelLines.push(originalItem.channelLines[i]);

				  } 
         
        }
    });

    return Promise.resolve(results);
}
function dateToTimestamp(dateStr) {
    // Define the months for conversion
    const months = {
        'Jan': 0,
        'Feb': 1,
        'Mar': 2,
        'Apr': 3,
        'May': 4,
        'Jun': 5,
        'Jul': 6,
        'Aug': 7,
        'Sep': 8,
        'Oct': 9,
        'Nov': 10,
        'Dec': 11
    };

    const parts = dateStr.split('-');
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10) + 2000; // Assuming the date is in the 21st century (20xx)

    // Create a Date object
    const date = new Date(year, month, day);

    // Get the timestamp
    const timestamp = date.getTime();

    return timestamp;
}
function calculateRetracements(startPrice, endPrice) {
    const retracementPercentages = [0.10, 0.25, 0.33, 0.38, 0.50, 0.62, 0.66, 0.75];
    
    const retracements = {};
    
    retracementPercentages.forEach(percentage => {
        const retracementPrice = endPrice + (startPrice - endPrice) * percentage;
        retracements[`${percentage * 100}%`] = retracementPrice;
    });
    
    return retracements;
}
function drawRelevant(data,relevantId) {
			const selectedRelevant = relevant.find(item => item.relevantId === relevantId)  ;
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
			var x;
            if (startDate < endDate) {
                 x=data.startDate;
            } else {
                 x=data.endDate;
            }
            const newEntry={
				   relevantId:relevantId,
				   x:dateToTimestamp(x),
                   isRectangle:true,       
		  		   y:data.startPrice,
		  		   y2:data.endPrice,
		  		   position:'left',
		  		   borderColor: "#ffffff00",
		  		   fillColor: data.color?data.color:"#FF000050",
		  		   strokeDashArray: 0,
		  		   opacity: 1,
		  		   label: {
						  text: "",
						     offsetY:20,
						     borderColor: "#ffffff00",
					          style: {
					            color: "#FF00FF",
					            background:  "#00000000",
					          },
	
					 }
		  		};
           const existingEntryIndex = chartConfigSettings.yaxisAnnotation.findIndex(data => data.relevantId === newEntry.relevantId);
           if(!selectedRelevant.isHidden)
			  { if (existingEntryIndex !== -1) {
			        chartConfigSettings.yaxisAnnotation[existingEntryIndex] = newEntry;
			    } else {
			        chartConfigSettings.yaxisAnnotation.push(newEntry);
			    }
			    }else{
					 chartConfigSettings.yaxisAnnotation=removeById(chartConfigSettings.yaxisAnnotation,"relevantId", relevantId);
				}
			    
			drawRelevantTable(relevant);	  		
            updateSeriesChart(chartConfigSettings);
        
}
function calculateRetracement(retracementId){
	const startPrice = $("#retracementStartPrice_"+ retracementId).text(); 
    const endPrice =  $("#retracementEndPrice_"+ retracementId).text();   
    const startDate = $("#retracementStart_"+ retracementId).text();
    const endDate = $("#retracementEnd_"+ retracementId).text();
    let toggleButton = $("#toggleAllRetracements_"+ retracementId);
		let hideall;
		
		// Check the current state and toggle
		if (toggleButton.hasClass("hide")) {
		    toggleButton.removeClass("hide"); // Make the button visible
		    hideall = true; // Set hideall to false
		} else {
		    toggleButton.addClass("hide"); // Hide the button
		    hideall = false; // Set hideall to true
		}
		

 
    if (startPrice != '' && endPrice != '') {
	   const checkedItemValues = checkedItemId.filter(item => item != null);

       let found = false;
       const calculatedretracementData = calculateRetracements(parseFloat(startPrice), parseFloat(endPrice));
       const parameters={
		   startPrice:startPrice,
		   endPrice:endPrice,
		   startDate:startDate,
		   endDate:endDate,
		   hideAll:hideall
		   
	   }
	   const retracementDataHide = {'10%':false,
								    '25%':false,
								    '33%':false,
									'38%':false,
									'50%':false,
	 								'62%':false,
									'66%':false,
									'75%':false
									};	
      
			 for (var i = 0; i < retracement.length; i++) {
				   if (retracement[i].retracementId === retracementId && typeof retracement[i].dbId !='undefined') {
					        const checkedItemValues = checkedItemId.filter(item => item != null);
                            const uniqueItems = [...new Set(checkedItemValues)];

                            const dbRetracementDataHide = retracementData[uniqueItems].filter(item => item.dbId === retracement[i].dbId);
					        
					        const json = convertRetracementData(calculatedretracementData, startDate, endDate, startPrice, endPrice,dbRetracementDataHide[0].retracementDataHide, hideall);

					        retracement[i].retracementParameter = parameters;
					        retracement[i].retracementValues = json;

					        saveRetracementHistory(retracementId);
					        
					        found = true;
						    break;
					  }
				  }
			 if(!found){
			  const json = convertRetracementData(calculatedretracementData, startDate, endDate, startPrice, endPrice,retracementDataHide, hideall);
			  
			  retracement=removeById(retracement,"retracementId", retracementId);

			  retracement.push({retracementId:retracementId,
			  			 graphId:checkedItemValues[0],
       					 retracementValues:json,
       					 retracementParameter:parameters});
       					 
       					  drawRetracementTable(retracement);
       					  
       					   const relatedyaxis = convertData(json,retracementId);
       		               chartConfigSettings.yaxisAnnotation=removeById(chartConfigSettings.yaxisAnnotation,"retracementId", retracementId);

					       const yaxis = chartConfigSettings.yaxisAnnotation;	
					            for (const newItem of relatedyaxis) {
					                yaxis.push(newItem);
					            }			 
					            
					       chartConfigSettings.yaxisAnnotation = yaxis;
					       updateSeriesChart(chartConfigSettings);
			 }  
      
       
    }
}
function convertRetracementData(retracementData, startDate, endDate, startPrice, endPrice,retracementDataHide,hideAll) {
    const result = [];
    const endDateTimestamp = dateToTimestamp(endDate);
    const startDateTimestamp = dateToTimestamp(startDate);
    const formattedStartPrice = parseFloat(startPrice).toFixed(getFormatResult0[0]);
    const formattedEndPrice = parseFloat(endPrice).toFixed(getFormatResult0[0]);

    for (const [label, values] of Object.entries(retracementData)) {
        const isFibo = (label === '38%' || label === '62%') ? ' FIBO' : ' retracement';
        const isFiboGrid = (label === '38%' || label === '62%') ? ' FIBO' : '';
        const formattedValue = values.toFixed(getFormatResult0[0]);

        result.push({
            x: startDateTimestamp,
            y: values,
            label: `${formattedValue} ${label}${isFibo}`,
            gridLabel: `${isFiboGrid} ${label} is ${formattedValue}`,
            key: `percentage${label.replace('%', '')}`,
            hide: retracementDataHide[label]
        });
    }

    result.push({
        x: startDateTimestamp, 
        y: parseFloat(startPrice),
        label: `${formattedStartPrice} STARTS`,
        key: "start",
        hide: hideAll
    });

    result.push({
        x: endDateTimestamp, 
        y: parseFloat(endPrice),
        label: `${formattedEndPrice} ENDS`,
        key: "end",
        hide: hideAll
    });

    return result;
}
function convertData(data,retracementId) {
    const result = [];
  
     for (var i = 0; i < data.length; i++) {
       const IsContinues = data[i].label.includes("ENDS") || data[i].label.includes("STARTS")?true:false;
       const IsEnd = data[i].label.includes("ENDS")?true:false;
		 if (data[i].hide!=true)
			 result.push({
				 		retracementId:retracementId,
			            x: data[i].x,
			            y: data[i].y,
			            borderColor: "#FF00FF",
			            strokeDashArray: IsContinues?0:7.5,
			            label: {
							position: IsContinues?'right':'left',
							textAnchor:  !IsContinues?'start':'end',
			                text: data[i].label,
			                offsetY: IsEnd?15:0,
			                borderColor: "#ffffff00",
			                style: {
								fontSize: '0.813rem',
			                    color: "#FFFFFF",
			                    background: "#00000000"
			                }
			            }
			        });
    }

    return result;
}

async function saveRetracementHistory(retracementId) {
    	const url = '/graph/save-retracement-history'; 
 		const filteredData = retracement.filter(data => data.retracementId === retracementId);
    	const payload = filteredData.map(data => {
        const retracementParameter = data.retracementParameter;
        const retracementValues = data.retracementValues;
		const checkedItemValues = checkedItemId.filter(item => item != null);
		let toggleButton = $("#toggleAllRetracements_"+retracementId);
		let hideall;
		
		// Check the current state and toggle
		if (toggleButton.hasClass("hide")) {
		    toggleButton.removeClass("hide"); // Make the button visible
		    hideall = true; // Set hideall to false
		} else {
		    toggleButton.addClass("hide"); // Hide the button
		    hideall = false; // Set hideall to true
		}

        let entity = {
			dbId: data.dbId,
            graphId: checkedItemValues[0],
            startDate: retracementParameter.startDate,
            startPrice: retracementParameter.startPrice,
            endDate: retracementParameter.endDate,
            endPrice: retracementParameter.endPrice,
            hideAll:hideall,
            screenName:screenName,
            percentage10: null,
            percentage25: null,
            percentage33: null,
            percenetage38: null,
            percentage50: null,
            percentage62: null,
            percentage66: null,
            percentage75: null,
            hidePercentage10: true,
            hidePercentage25: true,
            hidePercentage33: true,
            hidePercenetage38: true,
            hidePercentage50: true,
            hidePercentage62: true,
            hidePercentage66: true,
            hidePercentage75: true,
            isShared:isShared
        };

        retracementValues.forEach(value => {
            switch (value.key) {
                case 'percentage10':
                    entity.percentage10 = value.y.toString();
                    entity.hidePercentage10 = value.hide;
                    break;
                case 'percentage25':
                    entity.percentage25 = value.y.toString();
                    entity.hidePercentage25 = value.hide;
                    break;
                case 'percentage33':
                    entity.percentage33 = value.y.toString();
                    entity.hidePercentage33 = value.hide;
                    break;
                case 'percentage38':
                    entity.percenetage38 = value.y.toString();
                    entity.hidePercenetage38 = value.hide;
                    break;
                case 'percentage50':
                    entity.percentage50 = value.y.toString();
                    entity.hidePercentage50 = value.hide;
                    break;
                case 'percentage62':
                    entity.percentage62 = value.y.toString();
                    entity.hidePercentage62 = value.hide;
                    break;
                case 'percentage66':
                    entity.percentage66 = value.y.toString();
                    entity.hidePercentage66 = value.hide;
                    break;
                case 'percentage75':
                    entity.percentage75 = value.y.toString();
                    entity.hidePercentage75 = value.hide;
                    break;
                default:
                    break;
            }
        });

        return entity;
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
             newRetracementData = result.reduce((acc, data) => {

			  if (!acc[data.graphId]) {
			    acc[data.graphId] = [];
			  }

			    const dbId = data.id;
				const startPrice = data.startPrice;
				const endPrice = data.endPrice;
				const startDate = data.startDate;
				const endDate = data.endDate;
				const hideAll = data.hideAll;
				
		       const retracementData = {'10%':parseFloat(data.percentage10),
									    '25%':parseFloat(data.percentage25),
									    '33%':parseFloat(data.percentage33),
										'38%':parseFloat(data.percenetage38),
										'50%':parseFloat(data.percentage50),
		 								'62%':parseFloat(data.percentage62),
										'66%':parseFloat(data.percentage66),
										'75%':parseFloat(data.percentage75)
										};
				const retracementDataHide = {'10%':data.hidePercentage10,
									    '25%':data.hidePercentage25,
									    '33%':data.hidePercentage33,
										'38%':data.hidePercenetage38,
										'50%':data.hidePercentage50,
		 								'62%':data.hidePercentage62,
										'66%':data.hidePercentage66,
										'75%':data.hidePercentage75,
										};						
		       const parameters={
				   dbId:dbId,
				   startPrice:startPrice,
				   endPrice:endPrice,
				   startDate:startDate,
				   endDate:endDate,
				   hideAll: hideAll
			   }
						 
			  acc[data.graphId].push({dbId:dbId,
		       					 retracementData:retracementData,
		       					 retracementDataHide:retracementDataHide,
		       					 retracementParameter:parameters});
			  return acc;
			}, {});

			for (const [key, value] of Object.entries(newRetracementData)) {
			    if (retracementData[key]) {
			        value.forEach(newItem => {
			            const index = retracementData[key].findIndex(item => item.dbId === newItem.dbId);
			            if (index !== -1) {
			                // Update existing item
			                retracementData[key][index] = newItem;
			            } else {
			                // Add new item
			                retracementData[key].push(newItem);
			            }
			        });
			    } else {
			        retracementData[key] = value;
			    }
			}
	        mergeRetracementData(results, retracementData);
			
            const checkedItemValues = checkedItemId.filter(item => item != null);
			processRetracementData(retracementData, checkedItemValues);

            return result; // Handle the response as needed
        } else {
            throw new Error('Failed to save retracement history');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
function mergeRetracementData(results, retracementData) {
    for (const [key, newItems] of Object.entries(retracementData)) {
        // Check if the key exists in the existing JSON data
        let existingEntry = results.find(entry => entry.graphId === key);

        if (existingEntry) {
            // Key exists, merge the new items into the existing entry
            if (!existingEntry.retracementData) {
                existingEntry.retracementData = [];
            }
            if (!existingEntry.retracementDataHide) {
                existingEntry.retracementDataHide = [];
            }
            if (!existingEntry.retracementParameter) {
                existingEntry.retracementParameter = [];
            }

            newItems.forEach(newItem => {
                let existingIndex = existingEntry.retracementData.findIndex(item => item.dbId === newItem.dbId);

                if (existingIndex !== -1) {
                    // Update the existing item
                    existingEntry.retracementData[existingIndex] = newItem.retracementData;
                    existingEntry.retracementDataHide[existingIndex] = newItem.retracementDataHide;
                    existingEntry.retracementParameter[existingIndex] = newItem.retracementParameter;
                } else {
                    // Add the new item
                    existingEntry.retracementData.push(newItem.retracementData);
                    existingEntry.retracementDataHide.push(newItem.retracementDataHide);
                    existingEntry.retracementParameter.push(newItem.retracementParameter);
                }
            });
        } else {
            results.push({
                graphId: key,
                retracementData: newItems.map(item => item.retracementData),
                retracementDataHide: newItems.map(item => item.retracementDataHide),
                retracementParameter: newItems.map(item => item.retracementParameter),
                trendlines: [],
                channelLines: [],
                relevant: [],
            });
        }
    }
}



function mergeRelevantData(results, relevantData) {
    for (const [key, newItems] of Object.entries(relevantData)) {
        // Check if the key exists in the existing JSON data
        let existingEntry = results.find(entry => entry.graphId === key);

        if (existingEntry) {
            // Key exists, merge the new items into the existing entry
            if (!existingEntry.relevant) {
                existingEntry.relevant = [];
            }

            newItems.relevant.forEach(newItem => {
                let existingIndex = existingEntry.relevant.findIndex(item => item.dbId === newItem.dbId);

                if (existingIndex !== -1) {
                    // Update the existing item
                    existingEntry.relevant[existingIndex] = newItem;
                } else {
                    // Add the new item
                    existingEntry.relevant.push(newItem);
                }
            });
        } else {
            results.push({
                graphId: key,
                retracementData: [],
                retracementDataHide: [],
                retracementParameter: [],
                trendlines: [],
                channelLines: [],
                relevant: relevantData[key].relevant,
            });
        }
    }
}

async function saveRelevantHistory(relevantId) {
    	const url = '/graph/save-relevant-history'; 
 		const filteredData = relevant.filter(data => data.relevantId === relevantId);
    	const payload = filteredData.map(data => {
        const relevantParameter = data.relevantParameter;
		const checkedItemValues = checkedItemId.filter(item => item != null);
        let entity = {
			dbId: data.dbId,
            graphId: checkedItemValues[0],
            startDate: relevantParameter.startDate,
            startPrice: relevantParameter.startPrice,
            endDate: relevantParameter.endDate,
            endPrice: relevantParameter.endPrice,
            isHidden:data.isHidden,
            screenName:screenName,
            isShared:isShared,
            color:filteredData[0].color !== undefined ? filteredData[0].color : "rgba(255, 0, 0, 0.5)"
        };

        return entity;
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
        
			relevantData = result.reduce((acc, data) => {
		
					  if (!acc[data.graphId]) {
					    acc[data.graphId] = {
				            relevant: [],
				          
				        };
			  }
			    const dbId = data.id;
				const color = data.color;
				
				relevant.forEach(obj => {
				    if (obj.relevantId === relevantId) {
				        obj.dbId = dbId; // Add the dbid field with the desired value
				        obj.relevantParameter.color= color;
				    }
				});		
				 relevant.forEach(obj => {
				    acc[data.graphId].relevant.push({dbId:obj.dbId,
		       					 relevantParameter:obj.relevantParameter,
		       					 isHidden: obj.isHidden});
				});	
			  /*acc[data.graphId].relevant.push({dbId:dbId,
		       					 relevantParameter:parameters,
		       					 isHidden: data.isHidden});*/
		       					 
		  			 
			  return acc;
           
           }, {});
           
           mergeRelevantData(results, relevantData);
           drawRelevantTable(relevant);  		
			processGraphHistory();
        } else {
            throw new Error('Failed to save retracement history');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
function mergeData(existingJson, newJson) {
    for (const [key, newItems] of Object.entries(newJson)) {
        // Check if the key exists in the existing JSON data
        let existingEntry = existingJson.find(entry => entry.graphId === key);

        if (existingEntry) {
            // Key exists, merge the new items into the existing entry
            if (!existingEntry.retracementData) {
                existingEntry.retracementData = [];
            }
            if (!existingEntry.retracementDataHide) {
                existingEntry.retracementDataHide = [];
            }
            if (!existingEntry.retracementParameter) {
                existingEntry.retracementParameter = [];
            }

            newItems.forEach(newItem => {
                let existingIndex = existingEntry.retracementData.findIndex(item => item.dbId === newItem.dbId);

                if (existingIndex !== -1) {
                    // Update the existing item
                    existingEntry.retracementData[existingIndex] = newItem.retracementData;
                    existingEntry.retracementDataHide[existingIndex] = newItem.retracementDataHide;
                    existingEntry.retracementParameter[existingIndex] = newItem.retracementParameter;
                } else {
                    // Add the new item
                    existingEntry.retracementData.push(newItem.retracementData);
                    existingEntry.retracementDataHide.push(newItem.retracementDataHide);
                    existingEntry.retracementParameter.push(newItem.retracementParameter);
                }
            });
        } else {
            // Key does not exist, add the new entry
            existingJson.push({
                graphId: key,
                retracementData: newItems.map(item => item.retracementData),
                retracementDataHide: newItems.map(item => item.retracementDataHide),
                retracementParameter: newItems.map(item => item.retracementParameter)
            });
        }
    }
}

