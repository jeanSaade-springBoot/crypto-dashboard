package com.crypto.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class PagedResponse<T> {
    private List<T> content;
    private int pageNumber;   // current page (zero-based)
    private int pageSize;
    private long totalElements;
    private int totalPages;
}