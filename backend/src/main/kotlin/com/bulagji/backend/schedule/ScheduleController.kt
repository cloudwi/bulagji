package com.bulagji.backend.schedule

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.OffsetDateTime
import java.time.ZoneId

@RestController
@RequestMapping("/api/v1")
class ScheduleController(
    private val repository: TriggerScheduleRepository,
) {
    companion object {
        val KST: ZoneId = ZoneId.of("Asia/Seoul")
    }

    @GetMapping("/now")
    fun now(): NowResponse = NowResponse(OffsetDateTime.now(KST))

    @GetMapping("/schedule")
    fun schedule(): ScheduleResponse {
        val schedule = repository.findTopByOrderByTriggerAtDesc()
        return ScheduleResponse(schedule?.triggerAt?.atZoneSameInstant(KST)?.toOffsetDateTime())
    }
}

data class NowResponse(val now: OffsetDateTime)

data class ScheduleResponse(val triggerAt: OffsetDateTime?)
