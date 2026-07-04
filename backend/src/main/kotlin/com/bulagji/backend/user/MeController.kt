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
    @GetMapping
    fun me(@AuthenticationPrincipal user: AppUser): MeResponse =
        MeResponse(user.nickname, user.triggerAt, user.screen)

    @PutMapping("/settings")
    fun saveSettings(
        @AuthenticationPrincipal user: AppUser,
        @RequestBody body: SettingsRequest,
    ): MeResponse {
        if (body.triggerAt != null) user.triggerAt = body.triggerAt
        if (body.screen != null) user.screen = body.screen
        users.save(user)
        return MeResponse(user.nickname, user.triggerAt, user.screen)
    }
}

data class MeResponse(val nickname: String?, val triggerAt: String?, val screen: String)

data class SettingsRequest(val triggerAt: String?, val screen: String?)
