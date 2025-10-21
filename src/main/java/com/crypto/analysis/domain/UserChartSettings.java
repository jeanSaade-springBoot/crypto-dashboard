package com.crypto.analysis.domain;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

@Entity
@Table(
    name = "user_chart_settings",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_name", "symbol"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserChartSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(nullable = false, length = 20)
    private String symbol; // e.g. BTCUSDT

    @Column(name = "time_interval", length = 10)
    @Builder.Default
    private String interval = "1h";

    @Column(name = "volume_hidden")
    @Builder.Default
    private boolean volumeHidden = false;

    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private String retracements = "[]"; // stored as JSON text

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
