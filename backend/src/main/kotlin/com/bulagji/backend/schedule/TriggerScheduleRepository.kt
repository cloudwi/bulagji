package com.bulagji.backend.schedule

import org.springframework.data.jpa.repository.JpaRepository

interface TriggerScheduleRepository : JpaRepository<TriggerSchedule, Long> {
    fun findTopByOrderByTriggerAtDesc(): TriggerSchedule?
}
