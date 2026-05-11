package fatec.flowsense.backend.controller.dto;

import java.util.UUID;

public record UserResponse(UUID userId, String email, String name) {
	
}