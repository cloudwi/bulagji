package com.bulagji.backend.user

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "app_users")
class AppUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var provider: String,

    @Column(name = "provider_id", nullable = false)
    var providerId: String,

    @Column
    var nickname: String? = null,

    @Column(unique = true)
    var token: String? = null,

    // 프론트 datetime-local 문자열(예: 2026-07-16T17:00:00)을 그대로 저장
    @Column(name = "trigger_at")
    var triggerAt: String? = null,
)
