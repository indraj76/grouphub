package com.grouphub.entity;
import jakarta.persistence.*;import java.time.Instant;
@Entity @Table(name="group_reports") public class GroupReport { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @ManyToOne(fetch=FetchType.EAGER,optional=false) @JoinColumn(name="group_id") public TelegramGroup group; @Column(nullable=false,length=100) public String reason; @Column(length=1500) public String description; @Column(nullable=false,length=16) public String status="PENDING"; public Instant createdAt=Instant.now(); public GroupReport(){} }
