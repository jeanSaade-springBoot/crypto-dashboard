package com.crypto.analysis.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class OhlcPoint {
	  public Instant x;
	  public double[] y;
	}

