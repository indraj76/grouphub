package com.grouphub.controller;

import com.grouphub.entity.*;
import com.grouphub.repository.*;
import com.grouphub.security.JwtService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors; 


@RestController
@RequestMapping("/api/v1")
public class ApiController {

    private static final Pattern TELEGRAM_LINK =
            Pattern.compile("^https://(t\\.me|telegram\\.me)/(\\+|joinchat/)?[\\w-]{4,}$");
    private static final String CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, L, O, 0, 1

    private final CategoryRepository categories;
    private final GroupRepository groups;
    private final ReportRepository reports;
    private final ContactRepository contacts;
    private final JwtService jwt;
    private final String adminUser, adminPassword;
    private final SecureRandom random = new SecureRandom();

    public ApiController(CategoryRepository c, GroupRepository g, ReportRepository r, ContactRepository m,
                         JwtService j,
                         @Value("${app.admin-username}") String u,
                         @Value("${app.admin-password}") String p) {
        categories = c; groups = g; reports = r; contacts = m; jwt = j; adminUser = u; adminPassword = p;
    }

    // ---------- request bodies ----------
    record Login(@NotBlank @Email String email, @NotBlank String password) {}

    record GroupIn(@NotBlank @Size(min = 3, max = 80) String name,
                   @NotBlank String inviteLink,
                   @NotNull Long categoryId,
                   @NotBlank @Size(min = 20, max = 500) String description,
                   List<String> tags,
                   String countryCode, String countryName,
                   String languageCode, String languageName,
                   @Email @Size(max = 254) String contactEmail) {}

    record ReportIn(@NotBlank String reason, @Size(max = 1500) String description) {}

    record ContactIn(@NotBlank @Size(max = 100) String name,
                     @Email @NotBlank String email,
                     @NotBlank @Size(max = 120) String subject,
                     @NotBlank @Size(min = 10, max = 3000) String message) {}

    record CategoryIn(@NotBlank @Size(min = 2, max = 60) String name, @Size(max = 250) String description) {}

    // NEW: body for "look up my submissions"
    record LookupIn(@NotNull @Size(min = 1, max = 20) List<@NotBlank String> codes) {}

    // ---------- helpers ----------
    private Map<String, Object> groupMap(TelegramGroup g) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", g.id);
        m.put("name", g.name);
        m.put("slug", g.slug);
        m.put("inviteLink", g.inviteLink);
        m.put("description", g.description);
        m.put("categoryId", g.category.id);
        m.put("categoryName", g.category.name);
        m.put("category", g.category.name);
        m.put("categorySlug", g.category.slug);
        m.put("tags", g.tags);
        m.put("countryCode", g.countryCode);
        m.put("countryName", g.countryName);
        m.put("languageCode", g.languageCode);
        m.put("languageName", g.languageName);
        m.put("status", g.status);
        m.put("views", g.views);
        m.put("createdAt", g.createdAt);
        return m;
    }

    private Map<String, Object> adminGroupMap(TelegramGroup g) {
        Map<String, Object> m = groupMap(g);
        if (g.contactEmail != null) m.put("contactEmail", g.contactEmail);
        return m;
    }

    private Map<String, Object> adminPage(Page<TelegramGroup> p) {
        return Map.of("content", p.getContent().stream().map(this::adminGroupMap).toList(),
                "totalElements", p.getTotalElements(), "totalPages", p.getTotalPages(),
                "number", p.getNumber(), "size", p.getSize());
    }

    private Map<String, Object> categoryMap(Category c) {
        return Map.of("id", c.id, "name", c.name, "slug", c.slug,
                "description", c.description == null ? "" : c.description,
                "groupCount", groups.countByCategoryId(c.id));
    }

    private String slug(String s) {
        String v = s.toLowerCase(Locale.ROOT).replaceAll("&", "and").replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        return v.isBlank() ? "category" : v;
    }

    private Map<String, Object> page(Page<TelegramGroup> p) {
        return Map.of("content", p.getContent().stream().map(this::groupMap).toList(),
                "totalElements", p.getTotalElements(), "totalPages", p.getTotalPages(),
                "number", p.getNumber(), "size", p.getSize());
    }

    private String blank(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    // NEW: unique, hard-to-guess submission code like GH-7K2QX9PM
    private String newSubmissionCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("GH-");
            for (int i = 0; i < 8; i++) sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
            code = sb.toString();
        } while (groups.findBySubmissionCode(code).isPresent());
        return code;
    }

    private TelegramGroup group(Long id) {
        return groups.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));
    }

    // ---------- admin login ----------
    @PostMapping("/admin/auth/login")
    public Map<String, String> login(@Valid @RequestBody Login in) {
        if (!adminUser.equals(in.email()) || !adminPassword.equals(in.password()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        return Map.of("token", jwt.issue(adminUser));
    }

    // ---------- public: categories ----------
    @GetMapping("/categories")
    public List<Map<String, Object>> publicCategories() {
        return categories.findAll(Sort.by("name")).stream().map(this::categoryMap).toList();
    }

    @GetMapping("/categories/{slug}/groups")
    public Map<String, Object> categoryGroups(@PathVariable String slug,
                                              @RequestParam(defaultValue = "0") int p,
                                              @RequestParam(defaultValue = "12") int size) {
        return page(groups.search(false, null, null, slug, null, null,
                PageRequest.of(Math.max(0, p), Math.min(50, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    // ---------- public: groups ----------
    @GetMapping("/groups")
    public Map<String, Object> list(@RequestParam(required = false) String q,
                                    @RequestParam(required = false) String category,
                                    @RequestParam(required = false) String country,
                                    @RequestParam(required = false) String language,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "12") int size,
                                    @RequestParam(required = false) String sort) {
        GroupStatus st = status == null || status.isBlank() ? null : GroupStatus.valueOf(status.toUpperCase());
        Sort s = "views".equalsIgnoreCase(sort) ? Sort.by(Sort.Direction.DESC, "views") : Sort.by(Sort.Direction.DESC, "createdAt");
        return page(groups.search(false, st, blank(q), blank(category), blank(country), blank(language),
                PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)), s)));
    }

    @GetMapping("/groups/search")
    public Map<String, Object> search(@RequestParam(required = false) String q,
                                      @RequestParam(required = false) String category,
                                      @RequestParam(required = false) String country,
                                      @RequestParam(required = false) String language,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "12") int size) {
        return page(groups.search(false, null, blank(q), blank(category), blank(country), blank(language),
                PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @GetMapping("/groups/trending")
    public List<Map<String, Object>> trending() {
        return groups.search(false, null, null, null, null, null,
                        PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, "views")))
                .getContent().stream().map(this::groupMap).toList();
    }

    @GetMapping("/groups/{slug}")
    public Map<String, Object> detail(@PathVariable String slug) {
        TelegramGroup g = groups.findBySlug(slug)
                .filter(x -> x.status == GroupStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));
        g.views++;
        groups.save(g);
        return groupMap(g);
    }

    // ---------- public: submit a group (now returns a submission code) ----------
    @PostMapping("/groups")
    public ResponseEntity<?> submit(@Valid @RequestBody GroupIn in) {
        if (!TELEGRAM_LINK.matcher(in.inviteLink().trim()).matches())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid Telegram invite link");
        Category c = categories.findById(in.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category"));

        TelegramGroup g = new TelegramGroup();
        g.name = in.name().trim();
        g.slug = slug(g.name) + "-" + UUID.randomUUID().toString().substring(0, 8);
        g.inviteLink = in.inviteLink().trim();
        g.description = in.description().trim();
        g.category = c;
        g.tags = in.tags() == null ? new LinkedHashSet<>()
                : in.tags().stream().filter(Objects::nonNull).map(String::trim).filter(x -> !x.isBlank())
                        .limit(15).collect(Collectors.toCollection(LinkedHashSet::new));
        g.countryCode = in.countryCode();
        g.countryName = in.countryName();
        g.languageCode = in.languageCode();
        g.languageName = in.languageName();
        g.contactEmail = in.contactEmail();
        g.status = GroupStatus.PENDING;
        g.submissionCode = newSubmissionCode();
        groups.save(g);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", g.id,
                "status", g.status,
                "submissionCode", g.submissionCode,
                "slug", g.slug));
    }

    // ---------- NEW: look up submissions by code (My Submissions / Check Status) ----------
    @PostMapping("/submissions/lookup")
    public List<Map<String, Object>> lookupSubmissions(@Valid @RequestBody LookupIn in) {
        Set<String> codes = in.codes().stream()
                .map(s -> s.trim().toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());
        return groups.findBySubmissionCodeIn(codes).stream()
                .sorted(Comparator.comparing((TelegramGroup g) -> g.createdAt).reversed())
                .map(g -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("submissionCode", g.submissionCode);
                    m.put("name", g.name);
                    m.put("categoryName", g.category.name);
                    m.put("status", g.status);
                    m.put("createdAt", g.createdAt);
                    if (g.status == GroupStatus.APPROVED) {   // only reveal these once approved
                        m.put("slug", g.slug);
                        m.put("inviteLink", g.inviteLink);
                    }
                    return m;
                }).toList();
    }

    // ---------- public: report, stats, contact ----------
    @PostMapping("/groups/{id}/report")
    public ResponseEntity<?> report(@PathVariable Long id, @Valid @RequestBody ReportIn in) {
        TelegramGroup g = group(id);
        GroupReport r = new GroupReport();
        r.group = g;
        r.reason = in.reason();
        r.description = in.description();
        reports.save(r);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", r.id, "status", r.status));
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of("totalGroups", groups.countByStatus(GroupStatus.APPROVED),
                "totalCategories", categories.count(),
                "totalViews", groups.sumViews(),
                "totalCountries", groups.countCountries());
    }

    @PostMapping("/contact")
    public ResponseEntity<?> contact(@Valid @RequestBody ContactIn in) {
        ContactMessage m = new ContactMessage();
        m.name = in.name();
        m.email = in.email();
        m.subject = in.subject();
        m.message = in.message();
        contacts.save(m);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Message received"));
    }

    // ---------- admin: dashboard & groups ----------
    @GetMapping("/admin/dashboard")
    public Map<String, Object> dashboard() {
        return Map.of("totalGroups", groups.count(),
                "approvedGroups", groups.countByStatus(GroupStatus.APPROVED),
                "pendingGroups", groups.countByStatus(GroupStatus.PENDING),
                "rejectedGroups", groups.countByStatus(GroupStatus.REJECTED),
                "totalCategories", categories.count(),
                "totalReports", reports.count(),
                "pendingReports", reports.countByStatus("PENDING"),
                "totalViews", groups.sumViews());
    }

    @GetMapping("/admin/groups")
    public Map<String, Object> adminGroups(@RequestParam(required = false) String q,
                                           @RequestParam(required = false) String category,
                                           @RequestParam(required = false) String country,
                                           @RequestParam(required = false) String language,
                                           @RequestParam(required = false) String status,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "12") int size) {
        GroupStatus st = status == null || status.isBlank() ? null : GroupStatus.valueOf(status.toUpperCase());
        return adminPage(groups.search(true, st, blank(q), blank(category), blank(country), blank(language),
                PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @PatchMapping("/admin/groups/{id}/approve")
    public Map<String, String> approve(@PathVariable Long id) {
        TelegramGroup g = group(id);
        g.status = GroupStatus.APPROVED;
        g.updatedAt = Instant.now();
        groups.save(g);
        return Map.of("status", "APPROVED");
    }

    @PatchMapping("/admin/groups/{id}/reject")
    public Map<String, String> reject(@PathVariable Long id) {
        TelegramGroup g = group(id);
        g.status = GroupStatus.REJECTED;
        g.updatedAt = Instant.now();
        groups.save(g);
        return Map.of("status", "REJECTED");
    }

    @DeleteMapping("/admin/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        TelegramGroup g = group(id);
        reports.deleteAll(reports.findAll().stream().filter(r -> r.group.id.equals(id)).toList());
        groups.delete(g);
        return ResponseEntity.noContent().build();
    }

    // ---------- admin: categories ----------
    @GetMapping("/admin/categories")
    public List<Map<String, Object>> adminCategories() {
        return publicCategories();
    }

    @PostMapping("/admin/categories")
    public Map<String, Object> addCategory(@Valid @RequestBody CategoryIn in) {
        String s = slug(in.name());
        if (categories.existsByNameIgnoreCase(in.name()) || categories.findBySlug(s).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        Category c = categories.save(new Category(in.name().trim(), s, in.description()));
        return categoryMap(c);
    }

    @PutMapping("/admin/categories/{id}")
    public Map<String, Object> editCategory(@PathVariable Long id, @Valid @RequestBody CategoryIn in) {
        Category c = categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        String s = slug(in.name());
        if (categories.findAll().stream().anyMatch(x -> !x.id.equals(id) && (x.name.equalsIgnoreCase(in.name()) || x.slug.equals(s))))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
        c.name = in.name().trim();
        c.slug = s;
        c.description = in.description();
        return categoryMap(categories.save(c));
    }

    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<Void> removeCategory(@PathVariable Long id) {
        if (groups.countByCategoryId(id) > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reassign or remove groups in this category before deleting it");
        categories.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- admin: reports ----------
    @GetMapping("/admin/reports")
    public List<Map<String, Object>> adminReports(@RequestParam(required = false) String status) {
        List<GroupReport> all = status == null || status.isBlank()
                ? reports.findAllByOrderByCreatedAtDesc()
                : reports.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        return all.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.id);
            m.put("groupId", r.group.id);
            m.put("groupName", r.group.name);
            m.put("reason", r.reason);
            m.put("description", r.description);
            m.put("status", r.status);
            m.put("createdAt", r.createdAt);
            return m;
        }).toList();
    }

    @PatchMapping("/admin/reports/{id}/status")
    public Map<String, String> reportStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        GroupReport r = reports.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        String s = body.get("status");
        if (!Set.of("PENDING", "REVIEWED", "RESOLVED").contains(s))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid report status");
        r.status = s;
        reports.save(r);
        return Map.of("status", s);
    }

    @DeleteMapping("/admin/reports/{id}")
    public ResponseEntity<Void> removeReport(@PathVariable Long id) {
        reports.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- admin: contact messages ----------
    @GetMapping("/admin/contact-messages")
    public List<Map<String, Object>> contactMessages() {
        return contacts.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream().map(m -> {
            Map<String, Object> x = new LinkedHashMap<>();
            x.put("id", m.id);
            x.put("name", m.name);
            x.put("email", m.email);
            x.put("subject", m.subject);
            x.put("message", m.message);
            x.put("createdAt", m.createdAt);
            return x;
        }).toList();
    }

    @DeleteMapping("/admin/contact-messages/{id}")
    public ResponseEntity<Void> deleteContactMessage(@PathVariable Long id) {
        contacts.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

