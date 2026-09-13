package com.euditoria.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Filtro de Rate-Limiting para garantir a DISPONIBILIDADE do servidor (Prevenção de DoS e sobrecarga).
 */
@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    @Value("${euditoria.ratelimit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${euditoria.ratelimit.default-requests-per-minute:120}")
    private int maxRequestsPerMinute;

    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    private static class RequestCounter {
        long windowStartTimestamp;
        AtomicInteger count;

        RequestCounter(long timestamp) {
            this.windowStartTimestamp = timestamp;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!rateLimitEnabled) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Identifica por Tenant ou IP remoto
        String clientKey = httpRequest.getHeader("X-Tenant-ID");
        if (clientKey == null || clientKey.isBlank()) {
            clientKey = httpRequest.getRemoteAddr();
        }

        long now = System.currentTimeMillis();
        RequestCounter counter = requestCounts.compute(clientKey, (key, current) -> {
            if (current == null || (now - current.windowStartTimestamp) > 60000) {
                return new RequestCounter(now);
            }
            current.count.incrementAndGet();
            return current;
        });

        if (counter.count.get() > maxRequestsPerMinute) {
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.setHeader("Retry-After", "60");
            httpResponse.getWriter().write("""
                {
                  "status": "TOO_MANY_REQUESTS",
                  "statusCode": 429,
                  "errorCode": "RATE_LIMIT_EXCEEDED",
                  "message": "Limite de requisições excedido. A plataforma Euditoria protege sua disponibilidade contra sobrecargas.",
                  "retryAfterSeconds": 60
                }
                """);
            return;
        }

        // Cabeçalhos informativos de Rate Limit
        httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(maxRequestsPerMinute));
        httpResponse.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxRequestsPerMinute - counter.count.get())));

        chain.doFilter(request, response);
    }
}
