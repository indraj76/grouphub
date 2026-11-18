package com.grouphub.verification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SubmissionService {

    private static final Pattern LINK = Pattern.compile(
            "^(?:https?://)?(?:t\\.me|telegram\\.me)/([A-Za-z][A-Za-z0-9_]{4,31})/?$", Pattern.CASE_INSENSITIVE);
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RNG = new SecureRandom();

    // ---- response shapes (never include the invite link or any secret unless the owner asked) ----
    public record Created(String code, String verifyToken, String manageSecret) {}
    public record PublicView(String code, String name, String category, String status) {}
    public record ManageView(String code, String name, String category, String status,
                             String verifyToken, String telegramUsername) {}
    public record GroupView(String code, String name, String category, String description,
                            Integer memberCount, long joinClicks) {}
    public record AdminView(String code, String name, String category, String status, String telegramLink,
                            Integer memberCount, Instant createdAt, Instant verifiedAt) {}

    private final GroupSubmissionRepository repo;
    private final TelegramClient telegram;
    private final boolean autoApprove;

    public SubmissionService(GroupSubmissionRepository repo, TelegramClient telegram,
                             @Value("${grouphub.auto-approve:false}") boolean autoApprove) {
        this.repo = repo;
        this.telegram = telegram;
        this.autoApprove = autoApprove;
    }

    // ------------------------------------------------------------------ submit
    @Transactional
    public Created submit(String name, String category, String description, String link) {
        name = clean(name, 3, 120, "Group name");
        category = clean(category, 2, 60, "Category");
        description = description == null ? "" : description.trim();
        if (description.length() > 1000) throw bad("Description is too long (max 1000 characters)");

        String username = parseUsername(link);
        if (isTaken(username)) throw new ResponseStatusException(HttpStatus.CONFLICT, "This group is already listed");

        telegram.lookup(username).orElseThrow(() -> bad(
                "We couldn't find that group. It must be a public Telegram group or channel (t.me/username)."));

        String secret = randomUrlSafe(32);
        GroupSubmission s = new GroupSubmission();
        s.setCode("GH-" + randomCode(8));
        s.setName(name);
        s.setCategory(category);
        s.setDescription(description);
        s.setTelegramUsername(username);
        s.setVerifyToken("ghv-" + HexFormat.of().formatHex(randomBytes(6)));
        s.setManageSecretHash(sha256(secret));
        repo.save(s);
        return new Created(s.getCode(), s.getVerifyToken(), secret);
    }

    // ------------------------------------------------------------------ owner actions
    @Transactional
    public String verify(String code, String secret) {
        GroupSubmission s = requireOwner(code, secret);
        if (s.getStatus() == SubmissionStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This submission was rejected");
        }
        if (s.getStatus() != SubmissionStatus.PENDING) return s.getStatus().name();
        if (isTaken(s.getTelegramUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This group is already listed");
        }

        TelegramClient.ChatInfo info = telegram.lookup(s.getTelegramUsername()).orElseThrow(
                () -> bad("We couldn't find that group. Is it still public?"));

        // Only someone who can EDIT the group description can place the secret token there.
        if (info.description() == null || !info.description().contains(s.getVerifyToken())) {
            throw bad("Token not found in the group description yet. Paste it there, save, then try again.");
        }
        s.setMemberCount(info.memberCount());
        s.setVerifiedAt(Instant.now());
        if (autoApprove) {
            s.setStatus(SubmissionStatus.APPROVED);
            s.setApprovedAt(Instant.now());
        } else {
            s.setStatus(SubmissionStatus.VERIFIED);
        }
        return s.getStatus().name();
    }

    @Transactional(readOnly = true)
    public ManageView manage(String code, String secret) {
        GroupSubmission s = requireOwner(code, secret);
        return new ManageView(s.getCode(), s.getName(), s.getCategory(), s.getStatus().name(),
                s.getStatus() == SubmissionStatus.PENDING ? s.getVerifyToken() : null, s.getTelegramUsername());
    }

    // ------------------------------------------------------------------ public reads
    @Transactional(readOnly = true)
    public PublicView status(String code) {
        GroupSubmission s = find(code).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Code not found"));
        return new PublicView(s.getCode(), s.getName(), s.getCategory(), s.getStatus().name());
    }

    @Transactional(readOnly = true)
    public List<GroupView> listApproved(String category) {
        List<GroupSubmission> rows = (category == null || category.isBlank())
                ? repo.findByStatusOrderByJoinClicksDesc(SubmissionStatus.APPROVED)
                : repo.findByStatusAndCategoryIgnoreCaseOrderByJoinClicksDesc(SubmissionStatus.APPROVED, category.trim());
        return rows.stream().map(s -> new GroupView(s.getCode(), s.getName(), s.getCategory(),
                s.getDescription(), s.getMemberCount(), s.getJoinClicks())).toList();
    }

    /** Returns the Telegram URL for an APPROVED group and counts the click. The URL is built from the
     *  validated username, so this can never redirect anywhere except t.me. */
    @Transactional
    public String joinUrl(String code) {
        GroupSubmission s = find(code).filter(g -> g.getStatus() == SubmissionStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not available"));
        repo.incrementClicks(s.getId());
        return "https://t.me/" + s.getTelegramUsername();
    }

    // ------------------------------------------------------------------ admin
    @Transactional(readOnly = true)
    public List<AdminView> adminList(SubmissionStatus status) {
        return repo.findByStatusOrderByCreatedAtDesc(status).stream().map(s -> new AdminView(
                s.getCode(), s.getName(), s.getCategory(), s.getStatus().name(),
                "https://t.me/" + s.getTelegramUsername(), s.getMemberCount(), s.getCreatedAt(), s.getVerifiedAt())).toList();
    }

    @Transactional
    public void approve(String code) {
        GroupSubmission s = find(code).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Code not found"));
        if (s.getStatus() != SubmissionStatus.VERIFIED) throw bad("Owner has not been verified yet");
        s.setStatus(SubmissionStatus.APPROVED);
        s.setApprovedAt(Instant.now());
    }

    @Transactional
    public void reject(String code) {
        GroupSubmission s = find(code).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Code not found"));
        s.setStatus(SubmissionStatus.REJECTED);
    }

    // ------------------------------------------------------------------ helpers
    private java.util.Optional<GroupSubmission> find(String code) {
        return repo.findByCode(code == null ? "" : code.trim().toUpperCase());
    }

    private GroupSubmission requireOwner(String code, String secret) {
        GroupSubmission s = find(code).orElse(null);
        String expected = s == null ? sha256("no-such-submission") : s.getManageSecretHash();
        boolean match = MessageDigest.isEqual(
                sha256(secret == null ? "" : secret).getBytes(StandardCharsets.UTF_8),
                expected.getBytes(StandardCharsets.UTF_8));
        if (s == null || !match) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        return s;
    }

    private boolean isTaken(String username) {
        return repo.existsByTelegramUsernameIgnoreCaseAndStatusIn(
                username, List.of(SubmissionStatus.VERIFIED, SubmissionStatus.APPROVED));
    }

    private static String parseUsername(String link) {
        Matcher m = LINK.matcher(link == null ? "" : link.trim());
        if (!m.matches()) throw bad("Use a public Telegram link like https://t.me/yourgroup");
        return m.group(1);
    }

    private static String clean(String v, int min, int max, String label) {
        String t = v == null ? "" : v.trim();
        if (t.length() < min || t.length() > max) throw bad(label + " must be " + min + "-" + max + " characters");
        return t;
    }

    private static ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg); }

    private static byte[] randomBytes(int n) { byte[] b = new byte[n]; RNG.nextBytes(b); return b; }
    private static String randomUrlSafe(int n) { return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes(n)); }
    private static String randomCode(int n) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(CODE_CHARS.charAt(RNG.nextInt(CODE_CHARS.length())));
        return sb.toString();
    }

    private static String sha256(String s) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
