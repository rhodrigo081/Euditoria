package com.euditoria.controller;

import com.euditoria.dto.WorkerTimelineDTO;
import com.euditoria.service.TimelineAuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workers")
public class TimelineController {

    private final TimelineAuditService timelineAuditService;

    public TimelineController(TimelineAuditService timelineAuditService) {
        this.timelineAuditService = timelineAuditService;
    }

    @GetMapping("/{cpf}/timeline")
    public ResponseEntity<WorkerTimelineDTO> getWorkerTimeline(@PathVariable String cpf) {
        return ResponseEntity.ok(timelineAuditService.getTimelineForWorker(cpf));
    }
}
