package com.grouphub.entity;
import jakarta.persistence.*;
@Entity @Table(name="categories") public class Category { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @Column(nullable=false,unique=true,length=80) public String name; @Column(nullable=false,unique=true,length=100) public String slug; @Column(length=250) public String description; public Category(){} public Category(String n,String s,String d){name=n;slug=s;description=d;} }
