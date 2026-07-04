package com.bulagji.backend.auth

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val naverUserService: NaverOAuth2UserService,
    private val oauthSuccessHandler: OAuthSuccessHandler,
    private val tokenAuthFilter: TokenAuthFilter,
    @param:Value("\${bulagji.cors-origins}") private val corsOrigins: List<String>,
) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { }
            .authorizeHttpRequests {
                it.requestMatchers("/api/v1/me/**").authenticated()
                it.anyRequest().permitAll()
            }
            .oauth2Login { login ->
                login.userInfoEndpoint { it.userService(naverUserService) }
                login.successHandler(oauthSuccessHandler)
            }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) }
            .addFilterBefore(tokenAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val config = CorsConfiguration().apply {
            allowedOrigins = corsOrigins
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
        }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/api/**", config)
        }
    }
}
