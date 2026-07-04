package com.bulagji.backend.auth

import com.bulagji.backend.user.AppUser
import com.bulagji.backend.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val users: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    @PostMapping("/signup")
    fun signup(@RequestBody req: AuthRequest): AuthResponse {
        val username = req.username.trim()
        if (username.length < 3 || req.password.length < 4) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "아이디 3자, 비밀번호 4자 이상이어야 합니다.")
        }
        if (users.existsByUsername(username)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 아이디입니다.")
        }
        val user = AppUser(
            provider = "local",
            providerId = username,
            username = username,
            passwordHash = passwordEncoder.encode(req.password),
            nickname = username,
            token = newToken(),
        )
        users.save(user)
        return AuthResponse(user.token!!, user.triggerAt, user.screen, user.nickname)
    }

    @PostMapping("/login")
    fun login(@RequestBody req: AuthRequest): AuthResponse {
        val user = users.findByUsername(req.username.trim())
        if (user?.passwordHash == null || !passwordEncoder.matches(req.password, user.passwordHash)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.")
        }
        if (user.token == null) {
            user.token = newToken()
            users.save(user)
        }
        return AuthResponse(user.token!!, user.triggerAt, user.screen, user.nickname)
    }

    private fun newToken() = UUID.randomUUID().toString().replace("-", "")
}

data class AuthRequest(val username: String, val password: String)

data class AuthResponse(
    val token: String,
    val triggerAt: String?,
    val screen: String,
    val nickname: String?,
)
