package com.grouphub.verification;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "group_submissions")
public class GroupSubmission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;                      // public id, e.g. GH-B6R4K4W8

    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 60)  private String category;
    @Column(length = 1000)                  private String description;

    @Column(nullable = false, length = 40)  private String telegramUsername; // without @
    @Column(nullable = false, length = 40)  private String verifyToken;      // owner pastes this in group description
    @Column(nullable = false, length = 64)  private String manageSecretHash; // SHA-256 of the owner's private secret

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    private Integer memberCount;
    private long joinClicks;
    private Instant createdAt = Instant.now();
    private Instant verifiedAt;
    private Instant approvedAt;

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String v) { this.code = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getCategory() { return category; }
    public void setCategory(String v) { this.category = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getTelegramUsername() { return telegramUsername; }
    public void setTelegramUsername(String v) { this.telegramUsername = v; }
    public String getVerifyToken() { return verifyToken; }
    public void setVerifyToken(String v) { this.verifyToken = v; }
    public String getManageSecretHash() { return manageSecretHash; }
    public void setManageSecretHash(String v) { this.manageSecretHash = v; }
    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus v) { this.status = v; }
    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer v) { this.memberCount = v; }
    public long getJoinClicks() { return joinClicks; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant v) { this.verifiedAt = v; }
    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant v) { this.approvedAt = v; }
}
