package com.bulagji.backend.auth

import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

/**
 * 네이버 /nid/me 응답은 { resultcode, message, response: { id, nickname, ... } } 형태로
 * 실제 사용자 정보가 response 안에 중첩돼 있다. 이를 평탄화해서 id를 nameAttribute로 노출한다.
 */
@Service
class NaverOAuth2UserService : DefaultOAuth2UserService() {
    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        val user = super.loadUser(userRequest)

        @Suppress("UNCHECKED_CAST")
        val response = user.attributes["response"] as Map<String, Any>

        return DefaultOAuth2User(
            listOf(SimpleGrantedAuthority("ROLE_USER")),
            response,
            "id",
        )
    }
}
