package fatec.flowsense.backend.controller.dto;

public record LoginResponse(String accessToken, String userId, String email) {
}
