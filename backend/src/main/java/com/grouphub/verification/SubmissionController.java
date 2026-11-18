package com.grouphub.verification;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
public class SubmissionController {

    public record SubmitRequest(String name, String category, String description, String inviteLink) {}

    private final SubmissionService service;
    private final AdminGuard admin;

    public SubmissionController(SubmissionService service, AdminGuard admin) {
        this.service = service;
        this.admin = admin;
    }

    // ---------------- submitter ----------------
    @PostMapping("/api/submissions")
    public SubmissionService.Created submit(@RequestBody SubmitRequest r) {
        return service.submit(r.name(), r.category(), r.description(), r.inviteLink());
    }

    /** Public: status only. Knowing a code lets you LOOK, never act. */
    @GetMapping("/api/submissions/{code}")
    public SubmissionService.PublicView status(@PathVariable String code) {
        return service.status(code);
    }

    /** Owner only: returns the verification token while the submission is pending. */
    @GetMapping("/api/submissions/{code}/manage")
    public SubmissionService.ManageView manage(@PathVariable String code,
                                               @RequestHeader(value = "X-Manage-Secret", required = false) String secret) {
        return service.manage(code, secret);
    }

    @PostMapping("/api/submissions/{code}/verify")
    public Map<String, String> verify(@PathVariable String code,
                                      @RequestHeader(value = "X-Manage-Secret", required = false) String secret) {
        return Map.of("status", service.verify(code, secret));
    }

    // ---------------- public listing + join ----------------
    @GetMapping("/api/verified-groups")
    public List<SubmissionService.GroupView> groups(@RequestParam(required = false) String category) {
        return service.listApproved(category);
    }

    @GetMapping("/go/{code}")
    public ResponseEntity<Void> join(@PathVariable String code) {
        String url = service.joinUrl(code);
        return ResponseEntity.status(302).header(HttpHeaders.LOCATION, URI.create(url).toString()).build();
    }

    // ---------------- admin ----------------
    @GetMapping("/api/admin/submissions")
    public List<SubmissionService.AdminView> adminList(@RequestHeader(value = "X-Admin-Key", required = false) String key,
                                                       @RequestParam(defaultValue = "VERIFIED") SubmissionStatus status) {
        admin.require(key);
        return service.adminList(status);
    }

    @PostMapping("/api/admin/submissions/{code}/approve")
    public Map<String, String> approve(@PathVariable String code,
                                       @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        admin.require(key);
        service.approve(code);
        return Map.of("status", "APPROVED");
    }

    @PostMapping("/api/admin/submissions/{code}/reject")
    public Map<String, String> reject(@PathVariable String code,
                                      @RequestHeader(value = "X-Admin-Key", required = false) String key) {
        admin.require(key);
        service.reject(code);
        return Map.of("status", "REJECTED");
    }
}
