package com.grouphub.entity;
import jakarta.persistence.*;import java.time.Instant;
@Entity @Table(name="contact_messages") public class ContactMessage { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @Column(nullable=false,length=100) public String name; @Column(nullable=false,length=254) public String email; @Column(nullable=false,length=120) public String subject; @Column(nullable=false,length=3000) public String message; public Instant createdAt=Instant.now(); public ContactMessage(){} }
