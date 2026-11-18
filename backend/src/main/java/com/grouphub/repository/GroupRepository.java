
package com.grouphub.repository;

import com.grouphub.entity.TelegramGroup;
import com.grouphub.entity.GroupStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface GroupRepository
        extends JpaRepository<TelegramGroup, Long> {

    // Find group by slug
    Optional<TelegramGroup> findBySlug(String slug);

    // Find group by submission code
    Optional<TelegramGroup> findBySubmissionCode(String submissionCode);

    // Find multiple groups using submission codes
    List<TelegramGroup> findBySubmissionCodeIn(Set<String> submissionCodes);

    // Check whether submission code exists
    boolean existsBySubmissionCode(String submissionCode);

    // Count groups by status
    long countByStatus(GroupStatus status);

    // Count distinct countries
    @Query("""
        SELECT COUNT(DISTINCT g.countryCode)
        FROM TelegramGroup g
        WHERE g.countryCode IS NOT NULL
        AND g.countryCode <> ''
        """)
    long countCountries();

    // Calculate total views
    @Query("""
        SELECT COALESCE(SUM(g.views), 0)
        FROM TelegramGroup g
        """)
    Long sumViews();

    // Count groups by category
    @Query("""
        SELECT COUNT(g)
        FROM TelegramGroup g
        WHERE g.category.id = :categoryId
        """)
    long countByCategoryId(
        @Param("categoryId") Long categoryId
    );

    // Search and filter groups
    @Query("""
        SELECT g
        FROM TelegramGroup g
        WHERE
        (:includeAllStatuses = true
            OR g.status = com.grouphub.entity.GroupStatus.APPROVED)

        AND (:status IS NULL OR g.status = :status)

        AND (
            :q IS NULL
            OR LOWER(g.name) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(g.description) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(g.inviteLink) LIKE LOWER(CONCAT('%', :q, '%'))
        )

        AND (
            :category IS NULL
            OR LOWER(g.category.slug) = LOWER(:category)
        )

        AND (
            :country IS NULL
            OR LOWER(g.countryCode) = LOWER(:country)
        )

        AND (
            :language IS NULL
            OR LOWER(g.languageCode) = LOWER(:language)
        )
        """)
    Page<TelegramGroup> search(
        @Param("includeAllStatuses") boolean includeAllStatuses,
        @Param("status") GroupStatus status,
        @Param("q") String q,
        @Param("category") String category,
        @Param("country") String country,
        @Param("language") String language,
        Pageable pageable
    );
}
