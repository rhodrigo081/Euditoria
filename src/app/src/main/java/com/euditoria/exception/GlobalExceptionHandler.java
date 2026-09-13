package com.euditoria.exception;

import com.euditoria.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                "UNPROCESSABLE_ENTITY",
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                ex.getErrorCode(),
                ex.getMessage(),
                LocalDateTime.now(),
                List.of()
        );
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleRateLimit(RateLimitExceededException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                "TOO_MANY_REQUESTS",
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "RATE_LIMIT_EXCEEDED",
                ex.getMessage(),
                LocalDateTime.now(),
                List.of("Aguarde 60 segundos antes de enviar novas requisições.")
        );
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    @ExceptionHandler(QuotaExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleQuota(QuotaExceededException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                "PAYMENT_REQUIRED",
                HttpStatus.PAYMENT_REQUIRED.value(),
                "TENANT_QUOTA_EXCEEDED",
                ex.getMessage(),
                LocalDateTime.now(),
                List.of("Considere realizar o upgrade do plano contratado para continuar processando lotes.")
        );
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                "NOT_FOUND",
                HttpStatus.NOT_FOUND.value(),
                "RESOURCE_NOT_FOUND",
                ex.getMessage(),
                LocalDateTime.now(),
                List.of()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.add(error.getField() + ": " + error.getDefaultMessage())
        );

        ApiErrorResponse response = new ApiErrorResponse(
                "BAD_REQUEST",
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_ERROR",
                "Os dados enviados não atendem aos critérios de validação estrutural.",
                LocalDateTime.now(),
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUpload(MaxUploadSizeExceededException ex) {
        ApiErrorResponse response = new ApiErrorResponse(
                "PAYLOAD_TOO_LARGE",
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                "MAX_UPLOAD_EXCEEDED",
                "O arquivo enviado excede o limite máximo permitido de 20MB para lotes eSocial.",
                LocalDateTime.now(),
                List.of()
        );
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    // Confidentiality Shield: intercept all other unhandled exceptions without leaking system internals
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneralException(Exception ex) {
        String incidentId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        // Do not print internal stack trace or credentials in client response
        ApiErrorResponse response = new ApiErrorResponse(
                "INTERNAL_SERVER_ERROR",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INCIDENT_" + incidentId,
                "Ocorreu um erro interno ao processar a auditoria. O incidente foi registrado com segurança.",
                LocalDateTime.now(),
                List.of("Código de rastreamento do incidente: INC-" + incidentId)
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
