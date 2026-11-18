package com.grouphub.verification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface GroupSubmissionRepository extends JpaRepository<GroupSubmission, Long> {

    Optional<GroupSubmission> findByCode(String code);

    boolean existsByTelegramUsernameIgnoreCaseAndStatusIn(String username, Collection<SubmissionStatus> statuses);

    List<GroupSubmission> findByStatusOrderByCreatedAtDesc(SubmissionStatus status);

    List<GroupSubmission> findByStatusOrderByJoinClicksDesc(SubmissionStatus status);

    List<GroupSubmission> findByStatusAndCategoryIgnoreCaseOrderByJoinClicksDesc(SubmissionStatus status, String category);

    @Modifying
    @Query("update GroupSubmission g set g.joinClicks = g.joinClicks + 1 where g.id = :id")
    void incrementClicks(@Param("id") Long id);
}
