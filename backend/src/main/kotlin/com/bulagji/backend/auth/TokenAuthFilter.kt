package com.bulagji.backend.auth

import com.bulagji.backend.user.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/** Authorization: Bearer <token> 로 API 요청을 인증한다 (불투명 토큰 → 사용자 조회). */
@Component
class TokenAuthFilter(
    private val users: UserRepository,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ")) {
            val token = header.substring(7)
            val user = users.findByToken(token)
            if (user != null) {
                val auth = UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    listOf(SimpleGrantedAuthority("ROLE_USER")),
                )
                SecurityContextHolder.getContext().authentication = auth
            }
        }
        filterChain.doFilter(request, response)
    }
}
