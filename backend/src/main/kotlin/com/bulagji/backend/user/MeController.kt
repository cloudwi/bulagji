package com.bulagji.backend.user

import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/me")
class MeController(
    private val users: UserRepository,
) {
    @GetMapping("/timer")
    fun getTimer(@AuthenticationPrincipal user: AppUser): TimerResponse =
        TimerResponse(user.triggerAt, user.nickname)

    @PutMapping("/timer")
    fun saveTimer(
        @AuthenticationPrincipal user: AppUser,
        @RequestBody body: TimerRequest,
    ): TimerResponse {
        user.triggerAt = body.triggerAt
        users.save(user)
        return TimerResponse(user.triggerAt, user.nickname)
    }
}

data class TimerResponse(val triggerAt: String?, val nickname: String?)

data class TimerRequest(val triggerAt: String?)
