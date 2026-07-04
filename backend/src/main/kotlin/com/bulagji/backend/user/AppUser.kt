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

    // "naver" | "local"
    @Column(nullable = false)
    var provider: String,

    // 네이버: 네이버 회원번호. 로컬: username과 동일
    @Column(name = "provider_id", nullable = false)
    var providerId: String,

    // 자체 회원가입 계정의 아이디 (네이버 계정은 null)
    @Column(unique = true)
    var username: String? = null,

    @Column(name = "password_hash")
    var passwordHash: String? = null,

    @Column
    var nickname: String? = null,

    @Column(unique = true)
    var token: String? = null,

    // 프론트 datetime-local 문자열(예: 2026-07-16T17:00:00)을 그대로 저장
    @Column(name = "trigger_at")
    var triggerAt: String? = null,

    // 선택된 화면: "bsod" | "error" | "meme"
    @Column
    var screen: String = "bsod",
)
