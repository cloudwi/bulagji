package com.bulagji.backend.user

import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<AppUser, Long> {
    fun findByProviderAndProviderId(provider: String, providerId: String): AppUser?
    fun findByToken(token: String): AppUser?
}
