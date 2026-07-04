package com.bulagji.backend.schedule

import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.time.ZoneOffset

/** 기본 트리거(제헌절 전날 17:00 KST)를 DB가 비어 있을 때만 시드한다 */
@Component
class ScheduleSeeder(
    private val repository: TriggerScheduleRepository,
) : CommandLineRunner {
    override fun run(vararg args: String) {
        if (repository.count() == 0L) {
            repository.save(
                TriggerSchedule(
                    triggerAt = OffsetDateTime.of(2026, 7, 16, 17, 0, 0, 0, ZoneOffset.ofHours(9)),
                ),
            )
        }
    }
}
