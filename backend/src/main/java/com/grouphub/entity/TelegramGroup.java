
package com.grouphub.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "telegram_groups")
public class TelegramGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 80)
    public String name;

    @Column(nullable = false, unique = true, length = 110)
    public String slug;

    @Column(nullable = false, length = 300)
    public String inviteLink;

    @Column(nullable = false, length = 500)
    public String description;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id")
    public Category category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "group_tags",
        joinColumns = @JoinColumn(name = "group_id")
    )
    @Column(name = "tag", length = 40)
    public Set<String> tags = new LinkedHashSet<>();

    @Column(length = 2)
    public String countryCode;

    @Column(length = 80)
    public String countryName;

    @Column(length = 12)
    public String languageCode;

    @Column(length = 80)
    public String languageName;

    @Column(length = 254)
    public String contactEmail;

    // Unique submission code for checking submission status
    @Column(unique = true, length = 20)
    public String submissionCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    public GroupStatus status = GroupStatus.PENDING;

    public long views = 0;

    public Instant createdAt = Instant.now();

    public Instant updatedAt = Instant.now();

    public TelegramGroup() {
    }

    @PreUpdate
    public void updateTimestamp() {
        updatedAt = Instant.now();
    }
}
