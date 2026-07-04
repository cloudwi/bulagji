package com.bulagji.backend.auth

import com.bulagji.backend.user.AppUser
import com.bulagji.backend.user.UserRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * 네이버 로그인 성공 시: 사용자를 upsert 하고 불투명 토큰을 발급한 뒤
 * 프론트로 `?token=...` 을 붙여 리다이렉트한다. (교차 도메인 쿠키 회피)
 */
@Component
class OAuthSuccessHandler(
    private val users: UserRepository,
    @param:Value("\${bulagji.frontend-url}") private val frontendUrl: String,
) : SimpleUrlAuthenticationSuccessHandler() {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    ) {
        val oauthUser = authentication.principal as OAuth2User
        val providerId = oauthUser.name
        val nickname = oauthUser.attributes["nickname"] as? String

        val user = users.findByProviderAndProviderId("naver", providerId)
            ?: AppUser(provider = "naver", providerId = providerId)
        user.nickname = nickname
        if (user.token == null) {
            user.token = UUID.randomUUID().toString().replace("-", "")
        }
        users.save(user)

        redirectStrategy.sendRedirect(request, response, "$frontendUrl/?token=${user.token}")
    }
}
