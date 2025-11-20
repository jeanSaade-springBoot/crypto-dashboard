package com.crypto.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class OhlcDTO {
	    private long timestamp; 
	    private double open;
	    private double high;
	    private double low;
	    private double close;
	    private double volume;
	    
	    private Double rsi; // new field
}
